import { GlobalValues } from '@myeyesid/shared';
import { createMockUtils } from '@myeyesid/shared/esm';
import nock from 'nock';

import { mockMyEyesIDConfigsLibrary } from '#src/test-utils/mock-libraries.js';

import { type MyEyesIDConfigLibrary } from './myeyesid-config.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const adminEndpoint = 'http://mock.com';
const mockAccessToken = 'mockAccessToken';
await mockEsmWithActual('#src/env-set/index.js', () => ({
  EnvSet: {
    get values() {
      const values = new GlobalValues();

      return {
        ...values,
        adminUrlSet: {
          ...values.adminUrlSet,
          endpoint: new URL(adminEndpoint),
        },
      };
    },
  },
}));

const { createCloudConnectionLibrary } = await import('./cloud-connection.js');

const myeyesidConfigs: MyEyesIDConfigLibrary = {
  ...mockMyEyesIDConfigsLibrary,
  getCloudConnectionData: jest.fn().mockResolvedValue({
    appId: 'appId',
    appSecret: 'appSecret',
    resource: 'resource',
  }),
};

describe('getAccessToken()', () => {
  const { getAccessToken } = createCloudConnectionLibrary(myeyesidConfigs);

  it('should get access token and cached', async () => {
    nock(adminEndpoint).post('/oidc/token').reply(200, {
      access_token: mockAccessToken,
      expires_in: 3600,
      token_type: 'Bearer',
    });
    const token = await getAccessToken();
    expect(token).toBe(mockAccessToken);

    nock(adminEndpoint).post('/oidc/token').reply(200, {
      access_token: 'anotherAccessToken',
      expires_in: 3600,
      token_type: 'Bearer',
    });
    const cachedToken = await getAccessToken();
    expect(cachedToken).toBe(mockAccessToken);
  });
});
