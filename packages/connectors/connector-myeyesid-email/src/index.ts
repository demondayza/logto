import { assert, conditional } from '@silverhand/essentials';
import { HTTPError } from 'got';

import type router from '@myeyesid/cloud/routes';
import type {
  CreateConnector,
  EmailConnector,
  GetCloudServiceClient,
  GetConnectorConfig,
  GetUsageFunction,
  SendMessageFunction,
} from '@myeyesid/connector-kit';
import {
  ConnectorType,
  validateConfig,
  ConnectorError,
  ConnectorErrorCodes,
} from '@myeyesid/connector-kit';

import { defaultMetadata, emailEndpoint, usageEndpoint } from './constant.js';
import { myeyesidEmailConfigGuard } from './types.js';

const sendMessage =
  (
    getConfig: GetConnectorConfig,
    getClient?: GetCloudServiceClient<typeof router>
  ): SendMessageFunction =>
  async (data, inputConfig) => {
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, myeyesidEmailConfigGuard);

    const { companyInformation, senderName, appLogo } = config;
    const { to, type, payload } = data;

    assert(getClient, new ConnectorError(ConnectorErrorCodes.NotImplemented));
    const client = await getClient();

    try {
      await client.post(`/api${emailEndpoint}`, {
        body: {
          data: {
            to,
            type,
            payload: {
              ...payload,
              ...conditional(senderName && { senderName }),
              ...conditional(companyInformation && { companyInformation }),
              ...conditional(appLogo && { appLogo }),
            },
          },
        },
      });
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        console.log('error');
      }

      throw error;
    }
  };

const getUsage =
  (
    getConfig: GetConnectorConfig,
    getClient?: GetCloudServiceClient<typeof router>
  ): GetUsageFunction =>
  async (startFrom?: Date) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, myeyesidEmailConfigGuard);

    assert(getClient, new ConnectorError(ConnectorErrorCodes.NotImplemented));
    const client = await getClient();

    const { count } = await client.get(`/api${usageEndpoint}`, {
      search: conditional(startFrom && { from: startFrom.toISOString() }) ?? {},
    });
    return count;
  };

const createMyEyesIDEmailConnector: CreateConnector<EmailConnector, typeof router> = async ({
  getConfig,
  getCloudServiceClient: getClient,
}) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: myeyesidEmailConfigGuard,
    sendMessage: sendMessage(getConfig, getClient),
    getUsage: getUsage(getConfig, getClient),
  };
};

export default createMyEyesIDEmailConnector;
