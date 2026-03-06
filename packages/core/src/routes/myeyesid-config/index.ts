import crypto from 'node:crypto';

import {
  generateOidcCookieKey,
  generateOidcPrivateKey,
} from '@myeyesid/cli/lib/commands/database/utils.js';
import {
  MyEyesIDOidcConfigKey,
  adminConsoleDataGuard,
  oidcConfigKeysResponseGuard,
  SupportedSigningKeyAlgorithm,
  type OidcConfigKeysResponse,
  type OidcConfigKey,
  MyEyesIDOidcConfigKeyType,
} from '@myeyesid/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { exportJWK } from '#src/utils/jwks.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

import idTokenRoutes from './id-token.js';
import myeyesidConfigJwtCustomizerRoutes from './jwt-customizer.js';

/**
 * Provide a simple API router key type and DB config key mapping
 */
const getOidcConfigKeyDatabaseColumnName = (key: MyEyesIDOidcConfigKeyType): MyEyesIDOidcConfigKey =>
  key === MyEyesIDOidcConfigKeyType.PrivateKeys
    ? MyEyesIDOidcConfigKey.PrivateKeys
    : MyEyesIDOidcConfigKey.CookieKeys;

/**
 * Remove actual values of the private keys from response.
 * @param type MyEyesID config key DB column name. Values are either `oidc.privateKeys` or `oidc.cookieKeys`.
 * @param keys MyEyesID OIDC private keys.
 * @returns Redacted MyEyesID OIDC private keys without actual private key value.
 */
const getRedactedOidcKeyResponse = async (
  type: MyEyesIDOidcConfigKey,
  keys: OidcConfigKey[]
): Promise<OidcConfigKeysResponse[]> =>
  Promise.all(
    keys.map(async ({ id, value, createdAt }) => {
      if (type === MyEyesIDOidcConfigKey.PrivateKeys) {
        const jwk = await exportJWK(crypto.createPrivateKey(value));
        const parseResult = oidcConfigKeysResponseGuard.safeParse({
          id,
          createdAt,
          signingKeyAlgorithm: jwk.kty,
        });
        if (!parseResult.success) {
          throw new RequestError({ code: 'request.general', status: 422 });
        }
        return parseResult.data;
      }
      return { id, createdAt };
    })
  );

export default function myeyesidConfigRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const { getAdminConsoleConfig, updateAdminConsoleConfig, updateOidcConfigsByKey } =
    tenant.queries.myeyesidConfigs;
  const { getOidcConfigs } = tenant.myeyesidConfigs;

  router.get(
    '/configs/admin-console',
    koaGuard({ response: adminConsoleDataGuard, status: [200, 404] }),
    async (ctx, next) => {
      const { value } = await getAdminConsoleConfig();
      ctx.body = value;

      return next();
    }
  );

  router.patch(
    '/configs/admin-console',
    koaGuard({
      body: adminConsoleDataGuard.partial(),
      response: adminConsoleDataGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { value } = await updateAdminConsoleConfig(ctx.guard.body);
      ctx.body = value;

      return next();
    }
  );

  router.get(
    '/configs/oidc/:keyType',
    koaGuard({
      params: z.object({
        keyType: z.nativeEnum(MyEyesIDOidcConfigKeyType),
      }),
      response: z.array(oidcConfigKeysResponseGuard),
      status: [200],
    }),
    async (ctx, next) => {
      const { keyType } = ctx.guard.params;
      const configKey = getOidcConfigKeyDatabaseColumnName(keyType);
      const configs = await getOidcConfigs(getConsoleLogFromContext(ctx));

      // Remove actual values of the private keys from response
      ctx.body = await getRedactedOidcKeyResponse(configKey, configs[configKey]);

      return next();
    }
  );

  router.delete(
    '/configs/oidc/:keyType/:keyId',
    koaGuard({
      params: z.object({
        keyType: z.nativeEnum(MyEyesIDOidcConfigKeyType),
        keyId: z.string(),
      }),
      status: [204, 404, 422],
    }),
    async (ctx, next) => {
      const { keyType, keyId } = ctx.guard.params;
      const configKey = getOidcConfigKeyDatabaseColumnName(keyType);
      const configs = await getOidcConfigs(getConsoleLogFromContext(ctx));
      const existingKeys = configs[configKey];

      if (existingKeys.length <= 1) {
        throw new RequestError({ code: 'oidc.key_required', status: 422 });
      }

      if (!existingKeys.some(({ id }) => id === keyId)) {
        throw new RequestError({ code: 'oidc.key_not_found', id: keyId, status: 404 });
      }

      const updatedKeys = existingKeys.filter(({ id }) => id !== keyId);

      await updateOidcConfigsByKey(configKey, updatedKeys);
      void tenant.invalidateCache();

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/configs/oidc/:keyType/rotate',
    koaGuard({
      params: z.object({
        keyType: z.nativeEnum(MyEyesIDOidcConfigKeyType),
      }),
      body: z.object({
        signingKeyAlgorithm: z.nativeEnum(SupportedSigningKeyAlgorithm).optional(),
      }),
      response: z.array(oidcConfigKeysResponseGuard),
      status: [200, 422],
    }),
    async (ctx, next) => {
      const { keyType } = ctx.guard.params;
      const { signingKeyAlgorithm } = ctx.guard.body;
      const configKey = getOidcConfigKeyDatabaseColumnName(keyType);
      const configs = await getOidcConfigs(getConsoleLogFromContext(ctx));
      const existingKeys = configs[configKey];

      const newPrivateKey =
        configKey === MyEyesIDOidcConfigKey.PrivateKeys
          ? await generateOidcPrivateKey(signingKeyAlgorithm)
          : generateOidcCookieKey();

      // Clamp and only keep the 2 most recent private keys.
      // Also make sure the new key is always on top of the list.
      const updatedKeys = [newPrivateKey, ...existingKeys].slice(0, 2);

      await updateOidcConfigsByKey(configKey, updatedKeys);
      void tenant.invalidateCache();

      // Remove actual values of the private keys from response
      ctx.body = await getRedactedOidcKeyResponse(configKey, updatedKeys);

      return next();
    }
  );

  myeyesidConfigJwtCustomizerRoutes(router, tenant);

  idTokenRoutes(router, tenant);
}
