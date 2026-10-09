# Operator release metadata and Website publication

Date: 2026-10-08. Status: current release flow.

## Goal

Tie each stable Operator release to the exact Website documentation commit and
published Helm chart version, then automatically prepare a reviewed Website
snapshot PR after publication. The Website commit and chart mapping are
recorded by the release maintainer in the Operator release commit. GitHub
Actions validate and use that mapping; they do not generate a metadata PR.

## Sources of truth

The Website source PR is reviewed and merged into `krkn-chaos/website:main`.
Its merge commit is the source documentation revision. Before creating the
Operator release tag, the release maintainer adds the matching entry to
`docs/website-release.yaml` in the Operator release commit:

```yaml
schema_version: 1
releases:
  - operator_tag: v1.2.0
    website_commit: "<full Website merge commit SHA>"
    helm_chart_version: "1.2.0"
```

Only plain stable tags of the form `vMAJOR.MINOR.PATCH` are eligible. The chart
version is the tag without its leading `v`. The existing release branches and
chart publication workflow remain responsible for publishing the release and
chart.

## Event flow

1. A docs author opens and merges a normal Website PR against `main`.
2. The release maintainer records that merge SHA and the matching chart
   version in `docs/website-release.yaml` before tagging the Operator commit.
3. The release and chart workflows validate that the tag has a matching
   metadata entry. Prerelease tags are skipped.
4. After the published stable release and chart are visible, the Operator
   chart workflow sends a single tag-only dispatch to the Website receiver.
5. The Website receiver reads the authoritative metadata from the Operator
   tag, verifies the release is stable, verifies the Website commit belongs to
   reviewed Website `main` history, and verifies the published OCI chart and
   its `appVersion`.
6. The Website Action captures the pinned content and opens or updates one
   deterministic PR on `docs/operator-release/<tag>`. A maintainer reviews and
   merges it. Auto-merge stays disabled.

No one manually dispatches the Website workflow. The tag-only event does not
carry trusted commit or chart values; the receiver reads them from the tag.
The Website source PR and generated snapshot PR are separate: the first
updates editable source and the second freezes the release documentation.

## Stable-only adoption boundary

GitHub currently marks some `v1.1.0-rc*` releases as non-prereleases, so both
the `prerelease: false` release property and the exact stable tag shape are
required. The initial registry explicitly preserves the current `v1.0.0`
documentation from Website commit
`7c35229ddbec37d65ef6a9c53945443b6fa8bf6e`. It also records an inclusive
adoption cutoff at the publication time of stable `v1.0.10`. Automation will
not reconstruct unregistered releases at or before that cutoff, and the newer
1.1 source docs are not assigned to 1.0. The next eligible stable release
after the cutoff becomes the next snapshot.

## Metadata rules and safety

The metadata file is append-only and tag-keyed. Duplicate tag entries,
malformed commits, chart mismatches, prerelease tags, missing release branches,
and changed provenance fail closed. A retry for identical release provenance
is a no-op. Never rewrite a published tag or silently substitute a different
Website commit.

The Website receiver uses the configured GitHub App token to write its
deterministic branch and open the snapshot PR. No PAT fallback is permitted.
Workflow code runs from trusted default branches, and the App's repository
installation and permissions are verified before release notifications are
enabled. Failures are reported in workflow logs and summaries; live docs stay
unchanged until the reviewed Website snapshot PR is merged.

## Verification

Test stable and prerelease tags, metadata parsing, Website ancestry, chart to
Operator version mapping, missing publication prerequisites, retries, changed
provenance, and snapshot integrity. The generated PR must show source and
release provenance, chart mapping, page inventory, captured media, test
results, and a preview expectation. Do not auto-merge or publish a snapshot
from current moving source content.
