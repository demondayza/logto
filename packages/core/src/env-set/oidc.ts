import crypto from 'node:crypto';

import type { MyEyesIDOidcConfigType } from '@myeyesid/schemas';
import { MyEyesIDOidcConfigKey } from '@myeyesid/schemas';
import { conditional } from '@silverhand/essentials';
import { createLocalJWKSet } from 'jose';

import { exportJWK } from '#src/utils/jwks.js';

const loadOidcValues = async (issuer: string, configs: MyEyesIDOidcConfigType) => {
  const cookieKeys = configs[MyEyesIDOidcConfigKey.CookieKeys].map(({ value }) => value);
  const privateKeys = configs[MyEyesIDOidcConfigKey.PrivateKeys].map(({ value }) =>
    crypto.createPrivateKey(value)
  );
  const publicKeys = privateKeys.map((key) => crypto.createPublicKey(key));
  const privateJwks = await Promise.all(privateKeys.map(async (key) => exportJWK(key)));
  const publicJwks = await Promise.all(publicKeys.map(async (key) => exportJWK(key)));
  const localJWKSet = createLocalJWKSet({ keys: publicJwks });

  // Use ES384 if it's an Elliptic Curve key, otherwise fall back to default
  // It's for backwards compatibility since we were using RSA keys before v1.0.0-beta.20
  const jwkSigningAlg = conditional(privateJwks[0]?.kty === 'EC' && 'ES384');

  return Object.freeze({
    cookieKeys,
    privateJwks,
    publicJwks,
    jwkSigningAlg,
    localJWKSet,
    issuer,
  });
};

export default loadOidcValues;
