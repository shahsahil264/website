---
title: Cloud Credentials Management
description: Configure saved cloud provider credentials for chaos scenario injection
weight: 6
---

# Cloud Credentials Management <a href="/docs/krkn-operator/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

Administrators can configure and save cloud provider credentials that users select when running cloud-dependent chaos scenarios. Credentials are stored as Kubernetes Secrets and injected into scenario pods via `SecretKeyRef` — plaintext cloud secrets never appear in the Custom Resource or pod environment values.

---

## Overview

Many krkn scenarios need cloud API access (for example node stop/start, zone outages, or power outages). Instead of asking every user to paste access keys into scenario parameters, admins can:

- **Pre-configure** named credentials for each supported cloud provider
- **Control visibility** so credentials are available to everyone or only to selected groups
- **Reuse** the same credential across single runs and Chaos Studio workflows

Users then **select** a saved credential when configuring a scenario. Matching cloud parameter fields are filled from the Secret and locked in the UI.

{{% notice info %}}
Users can **select** saved cloud credentials they are allowed to see, but **cannot create, edit, or delete** them. Only admins manage credentials.
{{% /notice %}}

---

## Supported Providers

| Provider | Typical use |
|----------|-------------|
| **AWS** | EC2 / zone / node scenarios using AWS APIs |
| **GCP** | GCE-backed node and zone scenarios |
| **Azure** | Azure node and zone scenarios |
| **OpenStack** | OpenStack compute outage scenarios |
| **Baremetal** | IPMI/BMC power and node scenarios |
| **VMware** | vSphere-backed node scenarios |
| **IBM Cloud** | IBM Cloud infrastructure scenarios |

When a credential is applied, the platform also sets `CLOUD_TYPE` to the value expected by krkn-hub for that provider (for example baremetal → `bm`).

---

## Adding a Cloud Credential

1. Navigate to **Settings** > **Cloud Credentials**
2. Click **Create Cloud Credential** (or the add action)
3. Configure the following details:

| Field | Description | Required |
|-------|-------------|----------|
| **Name** | Unique credential name (used when users select it) | Yes |
| **Provider** | Cloud provider (AWS, GCP, Azure, OpenStack, Baremetal, VMware, IBM Cloud) | Yes |
| **Description** | Short note for operators (optional) | No |
| **Visibility** | **Everyone** or **Group-based** access | Yes |
| **Provider fields** | Access keys, regions, service-account JSON, BMC details, and so on — vary by provider | Yes (per provider) |

4. Click **Save** to create the credential

{{% notice warning %}}
The name `available` is reserved and cannot be used as a credential name.
{{% /notice %}}

---

## Visibility

Each credential has a visibility setting that controls who can use it:

| Visibility | Description |
|------------|-------------|
| **Everyone** | All users on the platform can select this credential |
| **Group-based** | Only users belonging to the assigned groups can see and use this credential |

{{% notice info %}}
Partial updates (for example rotating a region or key) preserve existing access labels unless you explicitly change visibility or group membership.
{{% /notice %}}

---

## Managing Saved Credentials

### View Credentials

The Cloud Credentials page lists saved configurations with:

- **Name**: Identifier shown in scenario selection
- **Provider**: Cloud provider type
- **Access**: Everyone or assigned groups
- **Actions**: Edit or Delete

Admins can filter the list by name, provider, and access type.

### Edit a Credential

1. Click **Edit** next to the credential
2. Update description, visibility, groups, or provider secret fields
3. Click **Save**

Secret values are never shown after creation. Leave a secret field empty to keep the existing value; provide a new value only when rotating credentials.

{{% notice warning %}}
Editing a saved credential affects **future** scenario executions that select it. Already running pods keep the Secret values they started with.
{{% /notice %}}

### Delete a Credential

1. Click **Delete** next to the credential
2. Confirm the deletion

{{% notice warning %}}
Deleting a credential removes it from selection for new runs. It does not cancel jobs that already started with that credential.
{{% /notice %}}

---

## How Credentials Are Injected

When a run references a cloud credential:

1. The console (and API) store only the credential **name** on the run (`cloudCredentialRef`)
2. Cloud-related environment variables from the request are **stripped** so plaintext keys cannot land in the Custom Resource
3. The operator loads the credential Secret and injects values into the scenario pod using **`SecretKeyRef`** (and file mounts where required, such as GCP service-account JSON)

**Users cannot**:

- Create or edit credentials from the scenario wizard
- View secret values for saved credentials
- Select credentials outside their visibility (group membership)

**Users can**:

- Choose from the credentials available to them
- Clear the selection and enter parameters manually when no credential is needed

---

## How Users Select Credentials

When configuring parameters for a [single scenario](../../usage/run-scenarios/) or a [Chaos Studio](../../usage/chaos-studio/) node:

1. Open the **Load Cloud Credential** section (shown when the scenario has cloud-related fields)
2. Select a saved credential from the dropdown
3. Cloud fields (`AWS_*`, `AZURE_*`, `CLOUD_TYPE`, and so on) become read-only / masked
4. Continue configuring non-cloud parameters and run the scenario

In Chaos Studio you can set:

- A **workflow-level** default credential for all nodes
- A **per-node** override when a specific scenario needs a different provider or account

---

## Best Practices

### Naming

Use names that encode provider and environment:

- ✅ `aws-prod-ci`
- ✅ `azure-staging-sre`
- ✅ `bmc-lab-rack-a`
- ❌ `creds`, `test`, `key1`

### Access control

- Prefer **group-based** visibility for production credentials
- Use **Everyone** only for shared non-production accounts
- Rotate keys by editing the credential rather than creating duplicates with the same name

### Security

- Never paste long-lived cloud secrets into scenario parameter fields when a saved credential exists
- Treat credential Secrets like any other cluster secret: limit RBAC outside the operator namespace
- Review group membership before granting access to production cloud accounts

---

## Verification

After adding a credential, verify injection works:

1. Run a cloud-dependent scenario with [Run Scenarios](../../usage/run-scenarios/)
2. Select the saved credential under **Load Cloud Credential**
3. Confirm cloud fields are disabled and show masked placeholders
4. Execute the run and confirm the job starts successfully
5. Optionally inspect the scenario pod: cloud env vars should reference the credential Secret by name, not plaintext values
