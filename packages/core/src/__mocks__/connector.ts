import type { ConnectorFactory } from '@myeyesid/cli/lib/connector/index.js';
import type router from '@myeyesid/cloud/routes';
import { ConnectorPlatform, DemoConnector } from '@myeyesid/connector-kit';
import type { Connector } from '@myeyesid/schemas';
import { ConnectorType } from '@myeyesid/schemas';
import { any } from 'zod';

import type { MyEyesIDConnector } from '#src/utils/connectors/types.js';

import {
  mockConnector0,
  mockConnector1,
  mockConnector2,
  mockConnector3,
  mockConnector4,
  mockConnector5,
  mockConnector6,
  mockMetadata,
  mockMetadata0,
  mockMetadata1,
  mockMetadata2,
  mockMetadata3,
  mockMetadata4,
  mockMetadata5,
  mockMetadata6,
} from './connector-base-data.js';

export {
  mockConnector0,
  mockConnector1,
  mockMetadata,
  mockMetadata0,
  mockMetadata1,
  mockMetadata2,
  mockMetadata3,
} from './connector-base-data.js';

const { jest } = import.meta;

export const mockConnector: Connector = {
  tenantId: 'fake_tenant',
  id: 'id',
  config: {},
  createdAt: 1_234_567_890_123,
  syncProfile: false,
  enableTokenStorage: false,
  metadata: {},
  connectorId: 'id',
};

export const mockMyEyesIDConnector = {
  getAuthorizationUri: jest.fn(),
  getUserInfo: jest.fn(),
  sendMessage: jest.fn(),
  validateConfig: jest.fn(),
  configGuard: any(),
};

export const mockConnectorFactory: ConnectorFactory<typeof router> = {
  metadata: mockMetadata,
  type: ConnectorType.Social,
  path: 'random_path',
  configGuard: any(),
  createConnector: jest.fn(),
};

export const mockConnectorList: Connector[] = [
  mockConnector0,
  mockConnector1,
  mockConnector2,
  mockConnector3,
  mockConnector4,
  mockConnector5,
  mockConnector6,
];

export const mockMyEyesIDConnectorList: MyEyesIDConnector[] = [
  {
    dbEntry: mockConnector0,
    metadata: { ...mockMetadata0 },
    type: ConnectorType.Social,
    ...mockMyEyesIDConnector,
  },
  {
    dbEntry: mockConnector1,
    metadata: mockMetadata1,
    type: ConnectorType.Sms,
    ...mockMyEyesIDConnector,
  },
  {
    dbEntry: mockConnector2,
    metadata: mockMetadata2,
    type: ConnectorType.Social,
    ...mockMyEyesIDConnector,
  },
  {
    dbEntry: mockConnector3,
    metadata: mockMetadata3,
    type: ConnectorType.Social,
    ...mockMyEyesIDConnector,
  },
  {
    dbEntry: mockConnector4,
    metadata: { ...mockMetadata4, platform: null },
    type: ConnectorType.Email,
    ...mockMyEyesIDConnector,
  },
  {
    dbEntry: mockConnector5,
    metadata: { ...mockMetadata5, platform: null },
    type: ConnectorType.Sms,
    ...mockMyEyesIDConnector,
  },
  {
    dbEntry: mockConnector6,
    metadata: { ...mockMetadata6, platform: null },
    type: ConnectorType.Email,
    ...mockMyEyesIDConnector,
  },
];

export const mockAliyunDmConnector: MyEyesIDConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'aliyun-dm',
  },
  metadata: {
    ...mockMetadata,
    id: 'aliyun-dm',
    target: 'aliyun-dm',
    platform: null,
  },
  type: ConnectorType.Email,
  ...mockMyEyesIDConnector,
};

export const mockAliyunSmsConnector: MyEyesIDConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'aliyun-sms',
  },
  metadata: {
    ...mockMetadata,
    id: 'aliyun-sms',
    target: 'aliyun-sms',
    platform: null,
  },
  type: ConnectorType.Sms,
  ...mockMyEyesIDConnector,
};

export const mockFacebookConnector: MyEyesIDConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'facebook',
  },
  metadata: {
    ...mockMetadata,
    id: 'facebook',
    target: 'facebook',
    platform: ConnectorPlatform.Web,
  },
  type: ConnectorType.Social,
  ...mockMyEyesIDConnector,
};

export const mockGithubConnector: MyEyesIDConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'github',
  },
  metadata: {
    ...mockMetadata,
    id: 'github',
    target: 'github',
    platform: ConnectorPlatform.Web,
  },
  type: ConnectorType.Social,
  ...mockMyEyesIDConnector,
};

export const mockWechatConnector: MyEyesIDConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'wechat-web',
  },
  metadata: {
    ...mockMetadata,
    id: 'wechat-web',
    target: 'wechat',
    platform: ConnectorPlatform.Web,
  },
  type: ConnectorType.Social,
  ...mockMyEyesIDConnector,
};

export const mockWechatNativeConnector: MyEyesIDConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'wechat-native',
  },
  metadata: {
    ...mockMetadata,
    id: 'wechat-native',
    target: 'wechat',
    platform: ConnectorPlatform.Native,
  },
  type: ConnectorType.Social,
  ...mockMyEyesIDConnector,
};

export const mockGoogleConnector: MyEyesIDConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'google',
    config: {
      clientId: 'fake_client_id',
      clientSecret: 'fake_client_secret',
      oneTap: {
        isEnabled: true,
        autoSelect: true,
      },
    },
  },
  metadata: {
    ...mockMetadata,
    id: 'google-universal',
    target: 'google',
    platform: ConnectorPlatform.Web,
  },
  type: ConnectorType.Social,
  ...mockMyEyesIDConnector,
};

export const mockDemoSocialConnector: MyEyesIDConnector = {
  dbEntry: {
    ...mockConnector,
    id: 'demo-social',
  },
  metadata: {
    ...mockMetadata,
    id: DemoConnector.Social,
    target: 'github',
    platform: null,
  },
  type: ConnectorType.Social,
  ...mockMyEyesIDConnector,
};

export const socialTarget01 = 'socialTarget-id01';
export const socialTarget02 = 'socialTarget-id02';

export const mockSocialConnectors: MyEyesIDConnector[] = [
  {
    dbEntry: {
      tenantId: 'fake_tenant',
      id: 'id0',
      config: {},
      createdAt: 1_234_567_890_123,
      syncProfile: false,
      enableTokenStorage: false,
      metadata: {},
      connectorId: 'id0',
    },
    metadata: {
      ...mockMetadata,
      target: socialTarget01,
    },
    type: ConnectorType.Social,
    ...mockMyEyesIDConnector,
  },
  {
    dbEntry: {
      tenantId: 'fake_tenant',
      id: 'id1',
      config: {},
      createdAt: 1_234_567_890_123,
      syncProfile: false,
      enableTokenStorage: false,
      metadata: {},
      connectorId: 'id1',
    },
    metadata: {
      ...mockMetadata,
      target: socialTarget02,
    },
    type: ConnectorType.Social,
    ...mockMyEyesIDConnector,
  },
];
