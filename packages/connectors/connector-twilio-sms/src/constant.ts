import type { ConnectorMetadata } from '@myeyesid/connector-kit';
import { ConnectorConfigFormItemType } from '@myeyesid/connector-kit';

export const endpoint = 'https://api.twilio.com/2010-04-01/Accounts/{{accountSID}}/Messages.json';

export const defaultMetadata: ConnectorMetadata = {
  id: 'twilio-short-message-service',
  target: 'twilio-sms',
  platform: null,
  name: {
    en: 'Twilio SMS Service',
    'zh-CN': 'Twilio 短信服务',
    'tr-TR': 'Twilio SMS Servisi',
    ko: 'Twilio SMS 서비스',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Twilio provides programmable communication tools for phone calls and messages.',
    'zh-CN': 'Twilio 是一个提供面向消费者的可编程通讯服务的平台。',
    'tr-TR':
      'Twilio, telefon görüşmeleri ve mesajlar için programlanabilir iletişim araçları sağlar.',
    ko: 'Twilio는 전화 및 SMS을 할 수 있도록 개발자 도구를 제공합니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'accountSID',
      label: 'Account SID',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<account-sid>',
    },
    {
      key: 'authToken',
      label: 'Auth Token',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<auth-token>',
    },
    {
      key: 'fromMessagingServiceSID',
      label: 'From Messaging Service SID',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<from-messaging-service-sid>',
    },
    {
      key: 'disableRiskCheck',
      label: 'Disable risk check',
      type: ConnectorConfigFormItemType.Switch,
      required: false,
      defaultValue: false,
      description:
        'Whether to disable Twilio built-in risk check. Enabled by default. More details: https://www.twilio.com/docs/messaging/api/message-resource',
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
