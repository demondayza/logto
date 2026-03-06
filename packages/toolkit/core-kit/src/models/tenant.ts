import { generateStandardId } from '@myeyesid/shared/universal';

// Use lowercase letters for tenant IDs to improve compatibility
const generateTenantId = () => generateStandardId(6);

export type TenantDatabaseMetadata = {
  id: string;
  parentRole: string;
  role: string;
  password: string;
};

export const createTenantDatabaseMetadata = (
  databaseName: string,
  tenantId = generateTenantId()
): TenantDatabaseMetadata => {
  const parentRole = `myeyesid_tenant_${databaseName}`;
  const role = `myeyesid_tenant_${databaseName}_${tenantId}`;
  const password = generateStandardId(32);

  return { id: tenantId, parentRole, role, password };
};
