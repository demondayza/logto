import type { ConnectorMetadata } from '@myeyesid/connector-kit';
import { ConnectorConfigFormItemType } from '@myeyesid/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'vonage-sms',
  target: 'vonage-sms',
  platform: null,
  name: {
    en: 'Vonage SMS Service',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Communications APIs to connect the world.',
    'zh-CN': '用于连接世界的通信 API。',
    'tr-TR': "Dünyayı birbirine bağlayan iletişim API'leri.",
    ko: '세계를 연결하는 커뮤니케이션 API입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'apiKey',
      label: 'API Key',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'apiSecret',
      label: 'API Secret',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'brandName',
      label: 'Brand Name',
      type: ConnectorConfigFormItemType.Text,
      required: true,
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
