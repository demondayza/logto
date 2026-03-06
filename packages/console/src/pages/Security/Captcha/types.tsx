import { type RecaptchaEnterpriseMode } from '@myeyesid/schemas';

export type CaptchaFormType = {
  siteKey: string;
  secretKey: string;
  projectId: string;
  domain?: string;
  mode?: RecaptchaEnterpriseMode;
};
