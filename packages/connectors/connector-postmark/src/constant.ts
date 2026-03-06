import type { ConnectorMetadata } from '@myeyesid/connector-kit';
import { ConnectorConfigFormItemType } from '@myeyesid/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'postmark-mail',
  target: 'postmark-mail',
  platform: null,
  name: {
    en: 'Postmark Mail',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Postmark is a mail sending platform.',
    'zh-CN': 'Postmark 是一个邮件发送平台。',
    'tr-TR': 'Postmark, bir e-posta gönderim platformudur.',
    ko: 'Postmark는 이메일 발송 플랫폼입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'serverToken',
      label: 'Server Token',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<your-server-token>',
    },
    {
      key: 'fromEmail',
      label: 'From Email',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<from_email_address@your.domain>',
    },
    {
      key: 'templates',
      label: 'Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: [
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
          usageType: 'OrganizationInvitation',
          templateAlias: 'myeyesid-organization-invitation',
        },
        {
          usageType: 'Generic',
          templateAlias: 'myeyesid-generic',
        },
        {
          usageType: 'UserPermissionValidation',
          templateAlias: 'myeyesid-user-permission-validation',
        },
        {
          usageType: 'BindNewIdentifier',
          templateAlias: 'myeyesid-bind-new-identifier',
        },
        {
          usageType: 'MfaVerification',
          templateAlias: 'myeyesid-mfa-verification',
        },
        {
          usageType: 'BindMfa',
          templateAlias: 'myeyesid-bind-mfa',
        },
      ],
    },
  ],
};
