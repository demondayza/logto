import {
  type jwtCustomizerConfigGuard,
  MyEyesIDConfigs,
  MyEyesIDTenantConfigKey,
  type AdminConsoleData,
  type IdTokenConfig,
  type MyEyesIDConfig,
  type MyEyesIDConfigKey,
  type MyEyesIDOidcConfigKey,
  type OidcConfigKey,
  type MyEyesIDJwtTokenKey,
  idTokenConfigGuard,
} from '@myeyesid/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';
import { type z } from 'zod';

import { type WellKnownCache } from '#src/caches/well-known.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(MyEyesIDConfigs);

export const createMyEyesIDConfigQueries = (
  pool: CommonQueryMethods,
  wellKnownCache: WellKnownCache
) => {
  const getAdminConsoleConfig = async () =>
    pool.one<Record<string, unknown>>(sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${MyEyesIDTenantConfigKey.AdminConsole}
    `);

  const updateAdminConsoleConfig = async (value: Partial<AdminConsoleData>) =>
    pool.one<Record<string, unknown>>(sql`
      update ${table}
      set ${fields.value} = coalesce(${fields.value},'{}'::jsonb) || ${sql.jsonb(value)}
      where ${fields.key} = ${MyEyesIDTenantConfigKey.AdminConsole}
      returning ${fields.value}
    `);

  const getCloudConnectionData = async () =>
    pool.one<Record<string, unknown>>(sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${MyEyesIDTenantConfigKey.CloudConnection}
    `);

  const getRowsByKeys = async (keys: MyEyesIDConfigKey[]) =>
    pool.query<MyEyesIDConfig>(sql`
      select ${sql.join([fields.key, fields.value], sql`,`)} from ${table}
        where ${fields.key} in (${sql.join(keys, sql`,`)})
    `);

  const deleteRowByKey = async (key: MyEyesIDConfigKey) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.key}=${key}
    `);

    if (rowCount < 1) {
      throw new DeletionError(MyEyesIDConfigs.table, key);
    }
  };

  const updateOidcConfigsByKey = async (key: MyEyesIDOidcConfigKey, value: OidcConfigKey[]) =>
    pool.query(sql`
      update ${table}
      set ${fields.value} = ${sql.jsonb(value)}
      where ${fields.key} = ${key}
      returning *
    `);

  // Can not narrow down the type of value if we utilize `buildInsertIntoWithPool` method.
  const upsertJwtCustomizer = async <T extends MyEyesIDJwtTokenKey>(
    key: T,
    value: z.infer<(typeof jwtCustomizerConfigGuard)[T]>
  ) =>
    pool.one<{ key: T; value: Record<string, string> }>(
      sql`
        insert into ${table} (${fields.key}, ${fields.value})
          values (${key}, ${sql.jsonb(value)})
          on conflict (${fields.tenantId}, ${fields.key}) do update set ${
            fields.value
          } = ${sql.jsonb(value)}
          returning *
      `
    );

  const deleteJwtCustomizer = async <T extends MyEyesIDJwtTokenKey>(key: T) => deleteRowByKey(key);

  const getIdTokenConfig = wellKnownCache.memoize(async () => {
    const { rows } = await getRowsByKeys([MyEyesIDTenantConfigKey.IdToken]);

    if (rows.length === 0) {
      return null;
    }

    return idTokenConfigGuard.parse(rows[0]?.value);
  }, ['id-token-config']);

  const upsertIdTokenConfig = wellKnownCache.mutate(
    async (value: IdTokenConfig) =>
      pool.one<Record<string, unknown>>(sql`
        insert into ${table} (${fields.key}, ${fields.value})
          values (${MyEyesIDTenantConfigKey.IdToken}, ${sql.jsonb(value)})
          on conflict (${fields.tenantId}, ${fields.key}) do update set ${fields.value} = ${sql.jsonb(value)}
          returning ${fields.value}
      `),
    ['id-token-config']
  );

  return {
    getAdminConsoleConfig,
    updateAdminConsoleConfig,
    getCloudConnectionData,
    getRowsByKeys,
    updateOidcConfigsByKey,
    upsertJwtCustomizer,
    deleteJwtCustomizer,
    getIdTokenConfig,
    upsertIdTokenConfig,
  };
};
