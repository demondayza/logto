import { extendedIdTokenClaims } from '@myeyesid/core-kit';
import type { ZodType } from 'zod';
import { z } from 'zod';

import {
  type AccessTokenJwtCustomizer,
  type ClientCredentialsJwtCustomizer,
  accessTokenJwtCustomizerGuard,
  clientCredentialsJwtCustomizerGuard,
} from './jwt-customizer.js';

export * from './oidc-provider.js';
export * from './jwt-customizer.js';

/**
 * MyEyesID OIDC signing key types, used mainly in REST API routes.
 */
export enum MyEyesIDOidcConfigKeyType {
  PrivateKeys = 'private-keys',
  CookieKeys = 'cookie-keys',
}

/**
 * Value maps to config key names in `myeyesid_configs` table. Used mainly in DB SQL related scenarios.
 */
export enum MyEyesIDOidcConfigKey {
  PrivateKeys = 'oidc.privateKeys',
  CookieKeys = 'oidc.cookieKeys',
}

/**
 * MyEyesID supported signing key algorithms for OIDC private keys that sign JWT tokens.
 */
export enum SupportedSigningKeyAlgorithm {
  RSA = 'RSA',
  EC = 'EC',
}

export const oidcConfigKeyGuard = z.object({
  id: z.string(),
  value: z.string(),
  createdAt: z.number(),
});

export type OidcConfigKey = z.infer<typeof oidcConfigKeyGuard>;

export type MyEyesIDOidcConfigType = {
  [MyEyesIDOidcConfigKey.PrivateKeys]: OidcConfigKey[];
  [MyEyesIDOidcConfigKey.CookieKeys]: OidcConfigKey[];
};

export const myeyesidOidcConfigGuard: Readonly<{
  [key in MyEyesIDOidcConfigKey]: ZodType<MyEyesIDOidcConfigType[key]>;
}> = Object.freeze({
  [MyEyesIDOidcConfigKey.PrivateKeys]: oidcConfigKeyGuard.array(),
  [MyEyesIDOidcConfigKey.CookieKeys]: oidcConfigKeyGuard.array(),
});

export enum MyEyesIDJwtTokenKey {
  AccessToken = 'jwt.accessToken',
  ClientCredentials = 'jwt.clientCredentials',
}

export type JwtCustomizerType = {
  [MyEyesIDJwtTokenKey.AccessToken]: AccessTokenJwtCustomizer;
  [MyEyesIDJwtTokenKey.ClientCredentials]: ClientCredentialsJwtCustomizer;
};

export const jwtCustomizerConfigGuard: Readonly<{
  [key in MyEyesIDJwtTokenKey]: ZodType<JwtCustomizerType[key]>;
}> = Object.freeze({
  [MyEyesIDJwtTokenKey.AccessToken]: accessTokenJwtCustomizerGuard,
  [MyEyesIDJwtTokenKey.ClientCredentials]: clientCredentialsJwtCustomizerGuard,
});

export const jwtCustomizerConfigsGuard = z.discriminatedUnion('key', [
  z.object({
    key: z.literal(MyEyesIDJwtTokenKey.AccessToken),
    value: accessTokenJwtCustomizerGuard,
  }),
  z.object({
    key: z.literal(MyEyesIDJwtTokenKey.ClientCredentials),
    value: clientCredentialsJwtCustomizerGuard,
  }),
]);

export type JwtCustomizerConfigs = z.infer<typeof jwtCustomizerConfigsGuard>;

/* --- MyEyesID tenant configs --- */
export const adminConsoleDataGuard = z.object({
  signInExperienceCustomized: z.boolean(),
  organizationCreated: z.boolean(),
  developmentTenantMigrationNotification: z
    .object({
      isPaidTenant: z.boolean(),
      /**
       * Tag is used to store the original tenant tag before dev tenant migration.
       * This field is only used for DB rollback and because the `TenantTag` may change, so we don't guard it as the `TenantTag` type.
       */
      tag: z.string(),
      readAt: z.number().optional(),
    })
    .optional(),
  checkedChargeNotification: z
    .object({
      token: z.boolean().optional(),
      apiResource: z.boolean().optional(),
      machineToMachineApp: z.boolean().optional(),
      tenantMember: z.boolean().optional(),
    })
    .optional(),
});

export type AdminConsoleData = z.infer<typeof adminConsoleDataGuard>;

/* --- MyEyesID tenant cloud connection config --- */
export const cloudConnectionDataGuard = z.object({
  appId: z.string(),
  appSecret: z.string(),
  resource: z.string(),
});

export type CloudConnectionData = z.infer<typeof cloudConnectionDataGuard>;

/* --- ID Token Config --- */
export const extendedIdTokenClaimsGuard = z.enum(extendedIdTokenClaims);
export type ExtendedIdTokenClaim = (typeof extendedIdTokenClaims)[number];

export const idTokenConfigGuard = z.object({
  enabledExtendedClaims: extendedIdTokenClaimsGuard.array().optional(),
});
export type IdTokenConfig = z.infer<typeof idTokenConfigGuard>;

export enum MyEyesIDTenantConfigKey {
  AdminConsole = 'adminConsole',
  CloudConnection = 'cloudConnection',
  /** The URL to redirect when session not found in Sign-in Experience. */
  SessionNotFoundRedirectUrl = 'sessionNotFoundRedirectUrl',
  /** ID token configuration for extended claims. */
  IdToken = 'idToken',
}
export type MyEyesIDTenantConfigType = {
  [MyEyesIDTenantConfigKey.AdminConsole]: AdminConsoleData;
  [MyEyesIDTenantConfigKey.CloudConnection]: CloudConnectionData;
  [MyEyesIDTenantConfigKey.SessionNotFoundRedirectUrl]: { url: string };
  [MyEyesIDTenantConfigKey.IdToken]: IdTokenConfig;
};

export const myeyesidTenantConfigGuard: Readonly<{
  [key in MyEyesIDTenantConfigKey]: ZodType<MyEyesIDTenantConfigType[key]>;
}> = Object.freeze({
  [MyEyesIDTenantConfigKey.AdminConsole]: adminConsoleDataGuard,
  [MyEyesIDTenantConfigKey.CloudConnection]: cloudConnectionDataGuard,
  [MyEyesIDTenantConfigKey.SessionNotFoundRedirectUrl]: z.object({ url: z.string() }),
  [MyEyesIDTenantConfigKey.IdToken]: idTokenConfigGuard,
});

/* --- Summary --- */
export type MyEyesIDConfigKey = MyEyesIDOidcConfigKey | MyEyesIDJwtTokenKey | MyEyesIDTenantConfigKey;
export type MyEyesIDConfigType = MyEyesIDOidcConfigType | JwtCustomizerType | MyEyesIDTenantConfigType;
export type MyEyesIDConfigGuard = typeof myeyesidOidcConfigGuard &
  typeof jwtCustomizerConfigGuard &
  typeof myeyesidTenantConfigGuard;

export const myeyesidConfigKeys: readonly MyEyesIDConfigKey[] = Object.freeze([
  ...Object.values(MyEyesIDOidcConfigKey),
  ...Object.values(MyEyesIDJwtTokenKey),
  ...Object.values(MyEyesIDTenantConfigKey),
]);

export const myeyesidConfigGuards: MyEyesIDConfigGuard = Object.freeze({
  ...myeyesidOidcConfigGuard,
  ...jwtCustomizerConfigGuard,
  ...myeyesidTenantConfigGuard,
});

export const oidcConfigKeysResponseGuard = oidcConfigKeyGuard
  .omit({ value: true })
  .merge(z.object({ signingKeyAlgorithm: z.nativeEnum(SupportedSigningKeyAlgorithm).optional() }));

export type OidcConfigKeysResponse = z.infer<typeof oidcConfigKeysResponseGuard>;
