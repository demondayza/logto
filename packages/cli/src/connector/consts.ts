import { ConnectorError, ConnectorErrorCodes } from '@myeyesid/connector-kit';

export const notImplemented = () => {
  throw new ConnectorError(ConnectorErrorCodes.NotImplemented);
};

export const defaultConnectorMethods = {
  getAuthorizationUri: notImplemented,
  getUserInfo: notImplemented,
  sendMessage: notImplemented,
  validateConfig: notImplemented,
};
