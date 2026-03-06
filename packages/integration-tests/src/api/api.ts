import { formUrlEncodedHeaders } from '@myeyesid/shared';
import { appendPath } from '@silverhand/essentials';
import ky from 'ky';

import { myeyesidConsoleUrl, myeyesidUrl, myeyesidCloudUrl } from '#src/constants.js';

const api = ky.extend({
  prefixUrl: appendPath(new URL(myeyesidUrl), 'api'),
});

export default api;

export const baseApi = ky.extend({
  prefixUrl: new URL(myeyesidUrl),
});

// TODO: @gao rename
export const authedAdminApi = api.extend({
  headers: {
    'development-user-id': 'integration-test-admin-user',
  },
});

export const adminTenantApi = ky.extend({
  prefixUrl: appendPath(new URL(myeyesidConsoleUrl), 'api'),
});

export const authedAdminTenantApi = adminTenantApi.extend({
  headers: {
    'development-user-id': 'integration-test-admin-user',
  },
});

export const cloudApi = ky.extend({
  prefixUrl: appendPath(new URL(myeyesidCloudUrl), 'api'),
});

export const oidcApi = ky.extend({
  headers: formUrlEncodedHeaders,
  prefixUrl: appendPath(new URL(myeyesidUrl), 'oidc'),
});
