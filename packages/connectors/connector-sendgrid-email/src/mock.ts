import type {
  Content,
  EmailData,
  Personalization,
  PublicParameters,
  SendGridMailConfig,
} from './types.js';
import { ContextType } from './types.js';

export const toEmail = 'foo@myeyesid.io';
export const fromEmail = 'noreply@myeyesid.test.io';
export const fromName = 'MyEyesID Test';

const receivers: EmailData[] = [{ email: toEmail }];
const sender: EmailData = { email: fromEmail, name: fromName };
const personalizations: Personalization[] = [{ to: receivers }];
const content: Content[] = [
  {
    type: ContextType.Text,
    value: 'Your MyEyesID verification code is 123456. The code will remain active for 10 minutes.',
  },
];

export const mockedGenericEmailParameters: PublicParameters = {
  personalizations,
  from: sender,
  subject: 'MyEyesID Generic Template',
  content,
};

export const mockedApiKey = 'apikey';

export const mockedConfig: SendGridMailConfig = {
  apiKey: mockedApiKey,
  fromEmail,
  fromName,
  templates: [
    {
      usageType: 'SignIn',
      type: ContextType.Text,
      subject: 'MyEyesID SignIn Template',
      content:
        'Your MyEyesID sign-in verification code is {{code}}. The code will remain active for 10 minutes.',
    },
    {
      usageType: 'Register',
      type: ContextType.Text,
      subject: 'MyEyesID Register Template',
      content:
        'Your MyEyesID sign-up verification code is {{code}}. The code will remain active for 10 minutes.',
    },
    {
      usageType: 'ForgotPassword',
      type: ContextType.Text,
      subject: 'MyEyesID ForgotPassword Template',
      content:
        'Your MyEyesID password change verification code is {{code}}. The code will remain active for 10 minutes.',
    },
    {
      usageType: 'Generic',
      type: ContextType.Text,
      subject: 'MyEyesID Generic Template',
      content:
        'Your MyEyesID verification code is {{code}}. The code will remain active for 10 minutes.',
    },
  ],
};
