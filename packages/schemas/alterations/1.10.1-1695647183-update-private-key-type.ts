import { generateStandardId } from '@myeyesid/shared';
import type { DatabaseTransactionConnection } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const targetConfigKeys = ['oidc.cookieKeys', 'oidc.privateKeys'];

type OldPrivateKeyData = {
  tenantId: string;
  value: string[];
};

type PrivateKey = {
  id: string;
  value: string;
  createdAt: number;
};

type NewPrivateKeyData = {
  tenantId: string;
  value: PrivateKey[];
};

/**
 * Alternate string array private signing keys to JSON array
 * "oidc.cookieKeys":  string[] -> PrivateKey[]
 * "oidc.privateKeys": string[] -> PrivateKey[]
 * @param configKey oidc.cookieKeys | oidc.privateKeys
 * @param myeyesidConfig existing private key data for a specific tenant
 * @param pool postgres database connection pool
 */
const alterPrivateKeysInMyEyesIDConfig = async (
  configKey: string,
  myeyesidConfig: OldPrivateKeyData,
  pool: DatabaseTransactionConnection
) => {
  const { tenantId, value: oldPrivateKey } = myeyesidConfig;

  // Use tenant creation time as `createdAt` timestamp for new private keys
  const tenantData = await pool.maybeOne<{ createdAt: number }>(
    sql`select * from tenants where id = ${tenantId}`
  );
  const newPrivateKeyData: PrivateKey[] = oldPrivateKey.map((key) => ({
    id: generateStandardId(),
    value: key,
    createdAt: Math.floor((tenantData?.createdAt ?? Date.now()) / 1000),
  }));

  await pool.query(
    sql`update myeyesid_configs set value = ${JSON.stringify(
      newPrivateKeyData
    )} where tenant_id = ${tenantId} and key = ${configKey}`
  );
};

/**
 * Rollback JSON array private signing keys to string array
 * "oidc.cookieKeys":  PrivateKey[] -> string[]
 * "oidc.privateKeys": PrivateKey[] -> string[]
 * @param configKey oidc.cookieKeys | oidc.privateKeys
 * @param myeyesidConfig new private key data for a specific tenant
 * @param pool postgres database connection pool
 */
const rollbackPrivateKeysInMyEyesIDConfig = async (
  configKey: string,
  myeyesidConfig: NewPrivateKeyData,
  pool: DatabaseTransactionConnection
) => {
  const { tenantId, value: newPrivateKeyData } = myeyesidConfig;

  const oldPrivateKeys = newPrivateKeyData.map(({ value }) => value);

  await pool.query(
    sql`update myeyesid_configs set value = ${JSON.stringify(
      oldPrivateKeys
    )} where tenant_id = ${tenantId} and key = ${configKey}`
  );
};

const alteration: AlterationScript = {
  up: async (pool) => {
    await Promise.all(
      targetConfigKeys.map(async (configKey) => {
        const rows = await pool.many<OldPrivateKeyData>(
          sql`select * from myeyesid_configs where key = ${configKey}`
        );
        await Promise.all(
          rows.map(async (row) => alterPrivateKeysInMyEyesIDConfig(configKey, row, pool))
        );
      })
    );
  },
  down: async (pool) => {
    await Promise.all(
      targetConfigKeys.map(async (configKey) => {
        const rows = await pool.many<NewPrivateKeyData>(
          sql`select * from myeyesid_configs where key = ${configKey}`
        );
        await Promise.all(
          rows.map(async (row) => rollbackPrivateKeysInMyEyesIDConfig(configKey, row, pool))
        );
      })
    );
  },
};

export default alteration;
