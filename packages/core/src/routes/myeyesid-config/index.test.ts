import { MyEyesIDOidcConfigKey, type AdminConsoleData } from '@myeyesid/schemas';
import { generateStandardId } from '@myeyesid/shared';
import { createMockUtils, pickDefault } from '@myeyesid/shared/esm';
import Sinon from 'sinon';

import { mockAdminConsoleData, mockCookieKeys, mockPrivateKeys } from '#src/__mocks__/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const { mockEsmWithActual, mockEsmDefault } = createMockUtils(jest);

const newPrivateKey = {
  id: generateStandardId(),
  value: '-----BEGIN PRIVATE KEY-----\naaaaa\nbbbbb\nccccc\n-----END PRIVATE KEY-----\n',
  createdAt: Math.floor(Date.now() / 1000),
};
const newCookieKey = {
  id: generateStandardId(),
  value: 'abcdefg',
  createdAt: Math.floor(Date.now() / 1000),
};

const { exportJWK } = await mockEsmWithActual('#src/utils/jwks.js', () => ({
  exportJWK: jest.fn(async () => ({ kty: 'EC' })),
}));

const { generateOidcPrivateKey } = await mockEsmWithActual(
  '@myeyesid/cli/lib/commands/database/utils.js',
  () => ({
    generateOidcCookieKey: jest.fn(() => newCookieKey),
    generateOidcPrivateKey: jest.fn(async () => newPrivateKey),
  })
);

mockEsmDefault('node:crypto', () => ({
  createPrivateKey: jest.fn((value) => value),
}));

const myeyesidConfigQueries = {
  getAdminConsoleConfig: async () => ({ value: mockAdminConsoleData }),
  updateAdminConsoleConfig: async (data: Partial<AdminConsoleData>) => ({
    value: {
      ...mockAdminConsoleData,
      ...data,
    },
  }),
  updateOidcConfigsByKey: jest.fn(),
};

const myeyesidConfigLibraries = {
  getOidcConfigs: jest.fn(async () => ({
    [MyEyesIDOidcConfigKey.PrivateKeys]: mockPrivateKeys,
    [MyEyesIDOidcConfigKey.CookieKeys]: mockCookieKeys,
  })),
};

const settingRoutes = await pickDefault(import('./index.js'));

describe('configs routes', () => {
  const tenantContext = new MockTenant(undefined, { myeyesidConfigs: myeyesidConfigQueries });
  Sinon.stub(tenantContext, 'myeyesidConfigs').value(myeyesidConfigLibraries);

  const routeRequester = createRequester({
    authedRoutes: settingRoutes,
    tenantContext,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /configs/admin-console', async () => {
    const response = await routeRequester.get('/configs/admin-console');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockAdminConsoleData);
  });

  it('PATCH /configs/admin-console', async () => {
    const signInExperienceCustomized = !mockAdminConsoleData.signInExperienceCustomized;
    const response = await routeRequester
      .patch('/configs/admin-console')
      .send({ signInExperienceCustomized });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockAdminConsoleData,
      signInExperienceCustomized,
    });
  });

  it('GET /configs/oidc/:keyType', async () => {
    const response = await routeRequester.get('/configs/oidc/private-keys');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(
      mockPrivateKeys.map(({ id, createdAt }) => ({
        id,
        createdAt,
        signingKeyAlgorithm: 'EC',
      }))
    );

    const response2 = await routeRequester.get('/configs/oidc/cookie-keys');
    expect(response2.status).toEqual(200);
    expect(response2.body).toEqual(
      mockCookieKeys.map(({ id, createdAt }) => ({
        id,
        createdAt,
      }))
    );
  });

  it('DELETE /configs/oidc/:keyType/:keyId will fail if there is only one key', async () => {
    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/${mockPrivateKeys[0]!.id}`)
    ).resolves.toHaveProperty('status', 422);

    expect(myeyesidConfigQueries.updateOidcConfigsByKey).not.toBeCalled();
  });

  it('DELETE /configs/oidc/:keyType/:keyId', async () => {
    myeyesidConfigLibraries.getOidcConfigs.mockResolvedValue({
      [MyEyesIDOidcConfigKey.PrivateKeys]: [newPrivateKey, ...mockPrivateKeys],
      [MyEyesIDOidcConfigKey.CookieKeys]: [newCookieKey, ...mockCookieKeys],
    });

    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/${mockPrivateKeys[0]!.id}`)
    ).resolves.toHaveProperty('status', 204);

    expect(myeyesidConfigQueries.updateOidcConfigsByKey).toBeCalledWith(
      MyEyesIDOidcConfigKey.PrivateKeys,
      [newPrivateKey]
    );

    await expect(
      routeRequester.delete(`/configs/oidc/cookie-keys/${mockCookieKeys[0]!.id}`)
    ).resolves.toHaveProperty('status', 204);

    expect(myeyesidConfigQueries.updateOidcConfigsByKey).toBeCalledWith(
      MyEyesIDOidcConfigKey.CookieKeys,
      [newCookieKey]
    );

    myeyesidConfigLibraries.getOidcConfigs.mockRestore();
  });

  it('DELETE /configs/oidc/:keyType/:keyId will fail if key is not found', async () => {
    myeyesidConfigLibraries.getOidcConfigs.mockResolvedValue({
      [MyEyesIDOidcConfigKey.PrivateKeys]: [newPrivateKey, ...mockPrivateKeys],
      [MyEyesIDOidcConfigKey.CookieKeys]: [newCookieKey, ...mockCookieKeys],
    });

    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/fake_key_id`)
    ).resolves.toHaveProperty('status', 404);

    await expect(
      routeRequester.delete(`/configs/oidc/private-keys/fake_key_id`)
    ).resolves.toHaveProperty('status', 404);

    expect(myeyesidConfigQueries.updateOidcConfigsByKey).not.toBeCalled();
    myeyesidConfigLibraries.getOidcConfigs.mockRestore();
  });

  it('POST /configs/oidc/:keyType/rotate', async () => {
    myeyesidConfigLibraries.getOidcConfigs.mockResolvedValue({
      [MyEyesIDOidcConfigKey.PrivateKeys]: mockPrivateKeys,
      [MyEyesIDOidcConfigKey.CookieKeys]: mockCookieKeys,
    });
    exportJWK.mockResolvedValueOnce({ kty: 'RSA' });

    const response = await routeRequester.post('/configs/oidc/private-keys/rotate');
    expect(response.status).toEqual(200);
    expect(myeyesidConfigQueries.updateOidcConfigsByKey).toHaveBeenCalledWith(
      MyEyesIDOidcConfigKey.PrivateKeys,
      [newPrivateKey, ...mockPrivateKeys]
    );
    expect(response.body[0]).toEqual({
      id: newPrivateKey.id,
      createdAt: newPrivateKey.createdAt,
      signingKeyAlgorithm: 'RSA',
    });

    const response2 = await routeRequester.post('/configs/oidc/cookie-keys/rotate');
    expect(response2.status).toEqual(200);
    expect(myeyesidConfigQueries.updateOidcConfigsByKey).toHaveBeenCalledWith(
      MyEyesIDOidcConfigKey.CookieKeys,
      [newCookieKey, ...mockCookieKeys]
    );
    expect(response2.body[0]).toEqual({
      id: newCookieKey.id,
      createdAt: newCookieKey.createdAt,
    });
    myeyesidConfigLibraries.getOidcConfigs.mockRestore();
  });

  it('keeps only the last 2 recent private keys when rotating', async () => {
    myeyesidConfigLibraries.getOidcConfigs.mockResolvedValueOnce({
      [MyEyesIDOidcConfigKey.PrivateKeys]: [newPrivateKey, ...mockPrivateKeys],
      [MyEyesIDOidcConfigKey.CookieKeys]: [newCookieKey, ...mockCookieKeys],
    });

    const newPrivateKey2 = {
      id: generateStandardId(),
      value: '-----BEGIN PRIVATE KEY-----\nnew\nprivate\nkey\n-----END PRIVATE KEY-----\n',
      createdAt: Math.floor(Date.now() / 1000),
    };
    generateOidcPrivateKey.mockResolvedValueOnce(newPrivateKey2);

    await routeRequester.post('/configs/oidc/private-keys/rotate');

    // Only has two keys and the original mocked private keys are clamped off
    expect(myeyesidConfigQueries.updateOidcConfigsByKey).toHaveBeenCalledWith(
      MyEyesIDOidcConfigKey.PrivateKeys,
      [newPrivateKey2, newPrivateKey]
    );
  });
});
