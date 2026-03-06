import type { PostmarkConfig } from './types.js';

export const mockedServerToken = 'serverToken';

export const mockedConfig: PostmarkConfig = {
  serverToken: mockedServerToken,
  fromEmail: 'noreply@myeyesid.test.io',
  templates: [
    {
      usageType: 'SignIn',
      templateAlias: 'myeyesid-sign-in',
    },
    {
      usageType: 'Register',
      templateAlias: 'myeyesid-register',
    },
    {
      usageType: 'ForgotPassword',
      templateAlias: 'myeyesid-forgot-password',
    },
    {
      usageType: 'Generic',
      templateAlias: 'myeyesid-generic',
    },
  ],
};
