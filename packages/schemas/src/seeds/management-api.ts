import { generateStandardId } from '@myeyesid/shared/universal';

import {
  RoleType,
  type CreateResource,
  type CreateRole,
  type CreateScope,
} from '../db-entries/index.js';
import {
  PredefinedScope,
  InternalRole,
  AdminTenantRole,
  getMapiProxyRole,
} from '../types/index.js';

import { adminTenantId, defaultTenantId } from './tenant.js';

/**
 * The Management API data for a tenant. Usually used for creating a new tenant in the admin
 * tenant.
 */
export type AdminData = {
  resource: CreateResource;
  scopes: CreateScope[];
  role: CreateRole;
};

export type UpdateAdminData = Omit<AdminData, 'role'> & {
  /** Attach to an existing role instead of creating one. */
  role: Pick<CreateRole, 'tenantId' | 'name'>;
};

// Consider remove the dependency of IDs
const defaultResourceId = 'management-api';
const defaultScopeAllId = 'management-api-all';

// Consider combining this with `createAdminData()`
/** The fixed Management API Resource for `default` tenant. */
export const defaultManagementApi = Object.freeze({
  resource: {
    tenantId: defaultTenantId,
    /** @deprecated You should not rely on this constant. Change to something else. */
    id: defaultResourceId,
    /**
     * The fixed resource indicator for Management APIs.
     *
     * Admin Console requires the access token of this resource to be functional.
     */
    indicator: `https://${defaultTenantId}.myeyesid.app/api`,
    name: 'MyEyesID Management API',
  },
  scopes: [
    {
      tenantId: defaultTenantId,
      /** @deprecated You should not rely on this constant. Change to something else. */
      id: defaultScopeAllId,
      name: PredefinedScope.All,
      description: 'Default scope for Management API, allows all permissions.',
      /** @deprecated You should not rely on this constant. Change to something else. */
      resourceId: defaultResourceId,
    },
  ],
  /**
   * An internal user role for Management API of the `default` tenant.
   * @deprecated This role will be removed soon.
   */
  role: {
    tenantId: defaultTenantId,
    /** @deprecated You should not rely on this constant. Change to something else. */
    id: 'admin-role',
    name: InternalRole.Admin,
    description: `Internal admin role for MyEyesID tenant ${defaultTenantId}.`,
    type: RoleType.MachineToMachine,
  },
}) satisfies AdminData;

export function getManagementApiResourceIndicator<TenantId extends string>(
  tenantId: TenantId
): `https://${TenantId}.myeyesid.app/api`;
export function getManagementApiResourceIndicator<TenantId extends string, Path extends string>(
  tenantId: TenantId,
  path: Path
): `https://${TenantId}.myeyesid.app/${Path}`;

export function getManagementApiResourceIndicator(tenantId: string, path = 'api') {
  return `https://${tenantId}.myeyesid.app/${path}`;
}

/**
 * The fixed Management API user role for `default` tenant in the admin tenant. It is used for
 * OSS only.
 */
export const defaultManagementApiAdminName = `${defaultTenantId}:admin` as const;

/** Create a set of admin data for Management API of the given tenant ID. */
export const createAdminData = (tenantId: string) => {
  const resourceId = generateStandardId();

  return Object.freeze({
    resource: {
      tenantId,
      id: resourceId,
      indicator: getManagementApiResourceIndicator(tenantId),
      name: `MyEyesID Management API`,
    },
    scopes: [
      {
        tenantId,
        id: generateStandardId(),
        name: PredefinedScope.All,
        description: 'Default scope for Management API, allows all permissions.',
        resourceId,
      },
    ],
    /** @deprecated This role will be removed soon. */
    role: {
      tenantId,
      id: generateStandardId(),
      name: InternalRole.Admin,
      description: `Internal admin role for MyEyesID tenant ${defaultTenantId}.`,
      type: RoleType.MachineToMachine,
    },
  } satisfies AdminData);
};

/** Create a set of admin data for Management API of the given tenant ID for the admin tenant. */
export const createAdminDataInAdminTenant = (tenantId: string) => {
  const resourceId = generateStandardId();

  return Object.freeze({
    resource: {
      tenantId: adminTenantId,
      id: resourceId,
      indicator: getManagementApiResourceIndicator(tenantId),
      name: `MyEyesID Management API for tenant ${tenantId}`,
    },
    scopes: [
      {
        tenantId: adminTenantId,
        id: generateStandardId(),
        name: PredefinedScope.All,
        description: 'Default scope for Management API, allows all permissions.',
        resourceId,
      },
    ],
    /** The machine-to-machine role for the Management API proxy of the given tenant ID. */
    role: getMapiProxyRole(tenantId),
  } satisfies AdminData);
};

export const createMeApiInAdminTenant = () => {
  const resourceId = generateStandardId();

  return Object.freeze({
    resource: {
      tenantId: adminTenantId,
      id: resourceId,
      indicator: getManagementApiResourceIndicator(adminTenantId, 'me'),
      name: `MyEyesID Me API`,
    },
    scopes: [
      {
        tenantId: adminTenantId,
        id: generateStandardId(),
        name: PredefinedScope.All,
        description: 'Default scope for Me API, allows all permissions.',
        resourceId,
      },
    ],
    role: {
      tenantId: adminTenantId,
      id: generateStandardId(),
      name: AdminTenantRole.User,
      description: 'Default role for admin tenant.',
      type: RoleType.User,
    },
  } satisfies AdminData);
};

/**
 * Create a pre-configured M2M role for Management API access.
 */
export const createPreConfiguredManagementApiAccessRole = (tenantId: string): CreateRole => ({
  tenantId,
  id: generateStandardId(),
  description: 'This default role grants access to the MyEyesID management API.',
  name: 'MyEyesID Management API access',
  type: RoleType.MachineToMachine,
});
