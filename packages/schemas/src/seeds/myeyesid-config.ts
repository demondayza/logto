import { type CreateMyEyesIDConfig } from '../db-entries/index.js';
import type {
  AdminConsoleData,
  CloudConnectionData,
  ExtendedIdTokenClaim,
  IdTokenConfig,
} from '../types/index.js';
import { MyEyesIDTenantConfigKey } from '../types/index.js';

import { cloudApiIndicator } from './cloud-api.js';

export const createDefaultAdminConsoleConfig = (
  forTenantId: string
): Readonly<{
  tenantId: string;
  key: MyEyesIDTenantConfigKey;
  value: AdminConsoleData;
}> =>
  Object.freeze({
    tenantId: forTenantId,
    key: MyEyesIDTenantConfigKey.AdminConsole,
    value: {
      signInExperienceCustomized: false,
      organizationCreated: false,
    },
  } satisfies CreateMyEyesIDConfig);

export const createCloudConnectionConfig = (
  forTenantId: string,
  appId: string,
  appSecret: string
): Readonly<{
  tenantId: string;
  key: MyEyesIDTenantConfigKey;
  value: CloudConnectionData;
}> =>
  Object.freeze({
    tenantId: forTenantId,
    key: MyEyesIDTenantConfigKey.CloudConnection,
    value: {
      appId,
      appSecret,
      resource: cloudApiIndicator,
    },
  } satisfies CreateMyEyesIDConfig);

export const createDefaultIdTokenConfig = (
  forTenantId: string
): Readonly<{
  tenantId: string;
  key: MyEyesIDTenantConfigKey;
  value: IdTokenConfig;
}> =>
  Object.freeze({
    tenantId: forTenantId,
    key: MyEyesIDTenantConfigKey.IdToken,
    value: {
      enabledExtendedClaims: [
        'roles',
        'organizations',
        'organization_roles',
      ] satisfies ExtendedIdTokenClaim[],
    },
  } satisfies CreateMyEyesIDConfig);
