import {
  SignInIdentifier,
  SsoProviderName,
  demoAppApplicationId,
  type CreateSsoConnector,
} from '@myeyesid/schemas';
import { appendPath, getEnv, yes } from '@silverhand/essentials';

export const myeyesidUrl = getEnv('INTEGRATION_TESTS_LOGTO_URL', 'http://localhost:3001');
export const myeyesidOidcUrl = appendPath(new URL(myeyesidUrl), 'oidc').toString();
export const myeyesidConsoleUrl = getEnv(
  'INTEGRATION_TESTS_LOGTO_CONSOLE_URL',
  'http://localhost:3002'
);
export const myeyesidCloudUrl = getEnv('INTEGRATION_TESTS_LOGTO_CLOUD_URL', 'http://localhost:3003');
export const demoAppUrl = appendPath(new URL(myeyesidUrl), 'demo-app');

export const discoveryUrl = `${myeyesidUrl}/oidc/.well-known/openid-configuration`;

export const demoAppRedirectUri = appendPath(new URL(myeyesidUrl), demoAppApplicationId).href;
export const adminConsoleRedirectUri = `${myeyesidConsoleUrl}/console/callback`;

export const signUpIdentifiers = {
  username: [SignInIdentifier.Username],
  email: [SignInIdentifier.Email],
  sms: [SignInIdentifier.Phone],
  emailOrSms: [SignInIdentifier.Email, SignInIdentifier.Phone],
  none: [],
};

export const consoleUsername = 'svhd';
export const consolePassword = 'silverhandasd_1';
export const mockSocialAuthPageUrl = 'http://mock-social';

export const newOidcSsoConnectorPayload = {
  providerName: SsoProviderName.OIDC,
  connectorName: 'test-oidc',
  domains: ['example.io'], // Auto-generated email domain
  branding: {
    displayName: 'test oidc connector',
    logo: 'https://myeyesid.io/oidc-logo.png',
    darkLogo: 'https://myeyesid.io/oidc-dark-logo.png',
  },
  config: {
    clientId: 'foo',
    clientSecret: 'bar',
    issuer: `${myeyesidUrl}/oidc`,
  },
} satisfies Partial<CreateSsoConnector>;

export const isDevFeaturesEnabled = yes(getEnv('DEV_FEATURES_ENABLED'));
