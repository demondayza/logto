# @myeyesid/api

A TypeScript SDK for interacting with MyEyesID's Management API using client credentials authentication.

## Installation

```bash
npm install @myeyesid/api
```

## Quick start

### Prerequisites

Before using this SDK, you need to:

1. Create a machine-to-machine application in your MyEyesID Console
2. Grant the application access to the Management API
3. Note down the client ID and client secret

For detailed setup instructions, visit: https://a.myeyesid.io/m2m-mapi

### Basic usage

#### MyEyesID Cloud

```ts
import { createManagementApi } from '@myeyesid/api/management';

// For MyEyesID Cloud
const { apiClient } = createManagementApi('your-tenant-id', {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
});

// Make API calls
const response = await apiClient.GET('/api/users');
console.log(response.data);
```

#### Self-hosted / OSS

```ts
import { createManagementApi } from '@myeyesid/api/management';

const { apiClient } = createManagementApi('default', {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  baseUrl: 'https://your-myeyesid-instance.com',
  apiIndicator: 'https://your-myeyesid-instance.com/api',
});
```

#### Custom authentication

For advanced use cases where you need full control over the authentication logic, use `createApiClient`:

```ts
import { createApiClient } from '@myeyesid/api/management';

const client = createApiClient({
  baseUrl: 'https://your-myeyesid-instance.com',
  getToken: async () => {
    // Your custom token retrieval logic
    return getYourToken();
  },
});

// Type-safe API calls
const response = await client.GET('/api/applications/{id}', {
  params: { path: { id: 'your-app-id' } },
});
```

### API documentation

For detailed API documentation, refer to the [MyEyesID Management API documentation](https://openapi.myeyesid.io/).

## Development

To avoid unnecessary build time in CI, full type generation only happens before publishing. The `build` script will generate mock types if no types are found.

To explicitly generate types, run:

```bash
pnpm generate-types
```

This will start a local Docker Compose environment, generate types by fetching the OpenAPI endpoints, and then shut down the environment.
