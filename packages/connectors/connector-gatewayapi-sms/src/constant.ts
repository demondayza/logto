import type { ConnectorMetadata } from '@myeyesid/connector-kit';
import { ConnectorConfigFormItemType } from '@myeyesid/connector-kit';

export const endpoint = 'https://api.twilio.com/2010-04-01/Accounts/{{accountSID}}/Messages.json';

export const defaultMetadata: ConnectorMetadata = {
  id: 'gatewayapi-sms',
  target: 'gatewayapi-sms',
  platform: null,
  name: {
    en: 'GatewayAPI SMS Service',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'GatewayAPI accelerates development by removing the learning curve and guesswork, so you can get down to building right away with our APIs.',
    'zh-CN': 'GatewayAPI 通过消除学习曲线和猜测，加速开发，让你能够立即使用我们的 API 构建。',
    'tr-TR':
      "GatewayAPI, öğrenme eğrisini ve tahmin yürütmeyi ortadan kaldırarak geliştirmeyi hızlandırır ve API'lerimizle hemen geliştirmeye başlamanızı sağlar.",
    ko: 'GatewayAPI는 학습 곡선과 시행착오를 줄여 개발을 가속화하고 우리의 API로 즉시 구축을 시작할 수 있게 해 줍니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'endpoint',
      label: 'Endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: 'https://gatewayapi.com/rest/mtsms',
      defaultValue: 'https://gatewayapi.com/rest/mtsms',
    },
    {
      key: 'apiToken',
      label: 'API Token',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'sender',
      label: 'Sender',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: 'ExampleSMS',
    },
    {
      key: 'templates',
      label: 'Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: [
        {
          usageType: 'SignIn',
          content:
            'Your MyEyesID sign-in verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'Register',
          content:
            'Your MyEyesID sign-up verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'ForgotPassword',
          content:
            'Your MyEyesID password change verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'OrganizationInvitation',
          content:
            'Your MyEyesID organization invitation code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'Generic',
          content:
            'Your MyEyesID verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'UserPermissionValidation',
          content:
            'Your MyEyesID permission validation code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'BindNewIdentifier',
          content:
            'Your MyEyesID new identifier binding code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'MfaVerification',
          content:
            'Your MyEyesID MFA verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'BindMfa',
          content:
            'Your MyEyesID 2-step verification setup code is {{code}}. The code will remain active for 10 minutes.',
        },
      ],
    },
  ],
};
