'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { createGithubClient } = require('../lib/operator-github-client');

test('retries a transient GitHub API fetch failure before returning release metadata', async () => {
  let attempts = 0;
  const delays = [];
  const client = createGithubClient({
    token: 'test-token',
    sleep: async (milliseconds) => delays.push(milliseconds),
    fetchImpl: async (_url, options) => {
      attempts += 1;
      assert.equal(options.method, undefined);
      if (attempts === 1) throw new TypeError('fetch failed');
      return { ok: true, status: 200, async json() { return { sha: 'a'.repeat(40) }; } };
    },
  });

  assert.deepEqual(await client.getCommit('krkn-chaos', 'website', 'a'.repeat(40)), {
    sha: 'a'.repeat(40),
  });
  assert.equal(attempts, 2);
  assert.equal(delays.length, 1);
});

test('retries a transient GitHub API server response', async () => {
  let attempts = 0;
  const client = createGithubClient({
    token: 'test-token',
    sleep: async () => {},
    fetchImpl: async () => {
      attempts += 1;
      if (attempts === 1) {
        return {
          ok: false,
          status: 503,
          async text() { return 'temporarily unavailable'; },
        };
      }
      return { ok: true, status: 200, async json() { return { sha: 'b'.repeat(40) }; } };
    },
  });

  assert.deepEqual(await client.getCommit('krkn-chaos', 'website', 'b'.repeat(40)), {
    sha: 'b'.repeat(40),
  });
  assert.equal(attempts, 2);
});

test('does not retry permanent GitHub API errors', async () => {
  let attempts = 0;
  const client = createGithubClient({
    token: 'test-token',
    sleep: async () => {},
    fetchImpl: async () => {
      attempts += 1;
      return {
        ok: false,
        status: 401,
        async text() { return 'Bad credentials'; },
      };
    },
  });

  await assert.rejects(
    client.getCommit('krkn-chaos', 'website', 'c'.repeat(40)),
    /GitHub API 401/
  );
  assert.equal(attempts, 1);
});

test('reports the API method and endpoint when transient fetch retries are exhausted', async () => {
  let attempts = 0;
  const client = createGithubClient({
    token: 'test-token',
    sleep: async () => {},
    maxAttempts: 3,
    fetchImpl: async () => {
      attempts += 1;
      throw new TypeError('fetch failed');
    },
  });

  await assert.rejects(
    client.getCommit('krkn-chaos', 'website', 'd'.repeat(40)),
    /GitHub API GET \/commits\/d{40} failed after 3 attempts: fetch failed/
  );
  assert.equal(attempts, 3);
});

test('reconciles a PR after an ambiguous create so a retry does not leave preparation failed', async () => {
  let created = false;
  let posts = 0;
  let patches = 0;
  const client = createGithubClient({
    token: 'test-token',
    sleep: async () => {},
    fetchImpl: async (url, options) => {
      const method = options.method || 'GET';
      if (url.includes('/pulls?')) {
        return {
          ok: true,
          status: 200,
          async json() {
            return created ? [{
              number: 42,
              state: 'open',
              head: { ref: 'docs/operator-release/v1.1.0' },
              updated_at: '2026-10-13T17:00:00Z',
            }] : [];
          },
        };
      }
      if (method === 'POST') {
        posts += 1;
        if (posts === 1) {
          created = true;
          throw new TypeError('fetch failed after request reached GitHub');
        }
        return {
          ok: false,
          status: 422,
          async text() { return JSON.stringify({ message: 'A pull request already exists' }); },
        };
      }
      if (method === 'PATCH') {
        patches += 1;
        return {
          ok: true,
          status: 200,
          async json() { return { number: 42, html_url: 'https://github.com/krkn-chaos/website/pull/42' }; },
        };
      }
      throw new Error(`Unexpected request: ${method} ${url}`);
    },
  });

  assert.equal(typeof client.openOrUpdatePullRequest, 'function');
  const pull = await client.openOrUpdatePullRequest('krkn-chaos', 'website', {
    branch: 'docs/operator-release/v1.1.0',
    title: 'docs: archive Krkn Operator v1.1.0',
    body: 'snapshot details',
  });

  assert.equal(pull.number, 42);
  assert.equal(posts, 2);
  assert.equal(patches, 1);
});
