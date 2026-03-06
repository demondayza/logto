import type { ConnectorMetadata } from '@myeyesid/connector-kit';
import { ConnectorConfigFormItemType } from '@myeyesid/connector-kit';

export const endpoint = 'https://api.sendgrid.com/v3/mail/send';

export const defaultMetadata: ConnectorMetadata = {
  id: 'sendgrid-email-service',
  target: 'sendgrid-mail',
  platform: null,
  name: {
    en: 'SendGrid Email',
    'zh-CN': 'SendGrid 邮件',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'SendGrid is a communication platform for transactional and marketing email.',
    'zh-CN': 'SendGrid 是一个面向消费者的邮件通讯平台。',
    'tr-TR': 'SendGrid, operasyonel ve pazarlama e- postaları için bir iletişim platformudur.',
    ko: 'SendGrids는 마케팅 및 이메일을 전송할 수 있는 플랫폼 입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'apiKey',
      label: 'API Key',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<your-sendgrid-api-key>',
    },
    {
      key: 'fromEmail',
      label: 'From Email',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: 'foo@example.com',
    },
    {
      key: 'fromName',
      label: 'From Name',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: 'MyEyesID',
    },
    {
      key: 'templates',
      label: 'Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: [
        {
          usageType: 'SignIn',
          type: 'text/plain',
          subject: 'MyEyesID SignIn Template',
          content:
            'Your MyEyesID sign-in verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'Register',
          type: 'text/plain',
          subject: 'MyEyesID Register Template',
          content:
            'Your MyEyesID sign-up verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'ForgotPassword',
          type: 'text/plain',
          subject: 'MyEyesID ForgotPassword Template',
          content:
            'Your MyEyesID password change verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'OrganizationInvitation',
          type: 'text/plain',
          subject: 'MyEyesID OrganizationInvitation Template',
          content:
            'Your MyEyesID organization invitation code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'Generic',
          type: 'text/plain',
          subject: 'MyEyesID Generic Template',
          content:
            'Your MyEyesID verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'UserPermissionValidation',
          type: 'text/plain',
          subject: 'MyEyesID UserPermissionValidation Template',
          content:
            'Your MyEyesID permission validation code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'BindNewIdentifier',
          type: 'text/plain',
          subject: 'MyEyesID BindNewIdentifier Template',
          content:
            'Your MyEyesID new identifier binding code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'MfaVerification',
          type: 'text/plain',
          subject: 'MyEyesID MfaVerification Template',
          content:
            'Your MyEyesID MFA verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'BindMfa',
          type: 'text/plain',
          subject: 'MyEyesID BindMfa Template',
          content:
            'Your MyEyesID 2-step verification setup code is {{code}}. The code will remain active for 10 minutes.',
        },
      ],
    },
  ],
};
