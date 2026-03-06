import {
  MyEyesIDJwtTokenKey,
  MyEyesIDJwtTokenKeyType,
  type JwtCustomizerTestRequestBody,
} from '@myeyesid/schemas';
import { ConsoleLog } from '@myeyesid/shared';
import { pickDefault } from '@myeyesid/shared/esm';
import { pick } from '@silverhand/essentials';

import {
  mockJwtCustomizerConfigForAccessToken,
  mockJwtCustomizerConfigForClientCredentials,
  mockMyEyesIDConfigRows,
} from '#src/__mocks__/index.js';
import { mockCloudClient, mockMyEyesIDConfigsLibrary } from '#src/test-utils/mock-libraries.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const myeyesidConfigQueries = {
  getRowsByKeys: jest.fn(async () => mockMyEyesIDConfigRows),
  deleteJwtCustomizer: jest.fn(),
};

const settingRoutes = await pickDefault(import('./index.js'));

describe('configs JWT customizer routes', () => {
  const tenantContext = new MockTenant(
    undefined,
    { myeyesidConfigs: myeyesidConfigQueries },
    undefined,
    {
      jwtCustomizers: {
        deployJwtCustomizerScript: jest.fn(),
        undeployJwtCustomizerScript: jest.fn(),
      },
    },
    mockMyEyesIDConfigsLibrary
  );

  const routeRequester = createRequester({
    authedRoutes: settingRoutes,
    tenantContext,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('PUT /configs/jwt-customizer/:tokenType should add a record successfully', async () => {
    myeyesidConfigQueries.getRowsByKeys.mockResolvedValueOnce({
      ...mockMyEyesIDConfigRows,
      rows: [],
      rowCount: 0,
    });
    mockMyEyesIDConfigsLibrary.upsertJwtCustomizer.mockResolvedValueOnce(
      mockJwtCustomizerConfigForAccessToken
    );
    const response = await routeRequester
      .put(`/configs/jwt-customizer/access-token`)
      .send(mockJwtCustomizerConfigForAccessToken.value);

    expect(tenantContext.libraries.jwtCustomizers.deployJwtCustomizerScript).toHaveBeenCalledWith(
      expect.any(ConsoleLog),
      {
        key: MyEyesIDJwtTokenKey.AccessToken,
        value: mockJwtCustomizerConfigForAccessToken.value,
        useCase: 'production',
      }
    );

    expect(mockMyEyesIDConfigsLibrary.upsertJwtCustomizer).toHaveBeenCalledWith(
      MyEyesIDJwtTokenKey.AccessToken,
      mockJwtCustomizerConfigForAccessToken.value
    );
    expect(response.status).toEqual(201);
    expect(response.body).toEqual(mockJwtCustomizerConfigForAccessToken.value);
  });

  it('PUT /configs/jwt-customizer/:tokenType should update a record successfully', async () => {
    myeyesidConfigQueries.getRowsByKeys.mockResolvedValueOnce({
      ...mockMyEyesIDConfigRows,
      rows: [mockJwtCustomizerConfigForAccessToken],
      rowCount: 1,
    });
    mockMyEyesIDConfigsLibrary.upsertJwtCustomizer.mockResolvedValueOnce(
      mockJwtCustomizerConfigForAccessToken
    );
    const response = await routeRequester
      .put('/configs/jwt-customizer/access-token')
      .send(mockJwtCustomizerConfigForAccessToken.value);
    expect(mockMyEyesIDConfigsLibrary.upsertJwtCustomizer).toHaveBeenCalledWith(
      MyEyesIDJwtTokenKey.AccessToken,
      mockJwtCustomizerConfigForAccessToken.value
    );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockJwtCustomizerConfigForAccessToken.value);
  });

  it('PATCH /configs/jwt-customizer/:tokenType should update a record successfully', async () => {
    mockMyEyesIDConfigsLibrary.updateJwtCustomizer.mockResolvedValueOnce(
      mockJwtCustomizerConfigForAccessToken.value
    );
    const response = await routeRequester
      .patch('/configs/jwt-customizer/access-token')
      .send(mockJwtCustomizerConfigForAccessToken.value);

    expect(tenantContext.libraries.jwtCustomizers.deployJwtCustomizerScript).toHaveBeenCalledWith(
      expect.any(ConsoleLog),
      {
        key: MyEyesIDJwtTokenKey.AccessToken,
        value: mockJwtCustomizerConfigForAccessToken.value,
        useCase: 'production',
      }
    );

    expect(mockMyEyesIDConfigsLibrary.updateJwtCustomizer).toHaveBeenCalledWith(
      MyEyesIDJwtTokenKey.AccessToken,
      mockJwtCustomizerConfigForAccessToken.value
    );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockJwtCustomizerConfigForAccessToken.value);
  });

  it('GET /configs/jwt-customizer should return all records', async () => {
    mockMyEyesIDConfigsLibrary.getJwtCustomizers.mockResolvedValueOnce({
      [MyEyesIDJwtTokenKey.AccessToken]: mockJwtCustomizerConfigForAccessToken.value,
      [MyEyesIDJwtTokenKey.ClientCredentials]: mockJwtCustomizerConfigForClientCredentials.value,
    });
    const response = await routeRequester.get('/configs/jwt-customizer');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([
      pick(mockJwtCustomizerConfigForAccessToken, 'key', 'value'),
      pick(mockJwtCustomizerConfigForClientCredentials, 'key', 'value'),
    ]);
  });

  it('GET /configs/jwt-customizer/:tokenType should return the record', async () => {
    mockMyEyesIDConfigsLibrary.getJwtCustomizer.mockResolvedValueOnce(
      mockJwtCustomizerConfigForAccessToken.value
    );
    const response = await routeRequester.get('/configs/jwt-customizer/access-token');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockJwtCustomizerConfigForAccessToken.value);
  });

  it('DELETE /configs/jwt-customizer/:tokenType should delete the record', async () => {
    const response = await routeRequester.delete('/configs/jwt-customizer/client-credentials');
    expect(tenantContext.libraries.jwtCustomizers.undeployJwtCustomizerScript).toHaveBeenCalledWith(
      expect.any(ConsoleLog),
      MyEyesIDJwtTokenKey.ClientCredentials
    );
    expect(myeyesidConfigQueries.deleteJwtCustomizer).toHaveBeenCalledWith(
      MyEyesIDJwtTokenKey.ClientCredentials
    );
    expect(response.status).toEqual(204);
  });

  it('POST /configs/jwt-customizer/test should not call cloud connection client post (non-cloud)', async () => {
    jest.spyOn(tenantContext.cloudConnection, 'getClient').mockResolvedValue(mockCloudClient);
    const clientPostSpy = jest.spyOn(mockCloudClient, 'post');

    const payload: JwtCustomizerTestRequestBody = {
      tokenType: MyEyesIDJwtTokenKeyType.ClientCredentials,
      script: mockJwtCustomizerConfigForClientCredentials.value.script,
      environmentVariables: mockJwtCustomizerConfigForClientCredentials.value.environmentVariables,
      token: {},
      context: { application: { id: 'my-app' } },
    };

    await routeRequester.post('/configs/jwt-customizer/test').send(payload);

    expect(tenantContext.libraries.jwtCustomizers.deployJwtCustomizerScript).toHaveBeenCalledTimes(
      0
    );

    expect(clientPostSpy).toHaveBeenCalledTimes(0);

    // TODO: Add the test on nested class static method.
  });
});
