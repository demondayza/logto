import { pickDefault } from '@myeyesid/shared/esm';

import { mockMyEyesIDConnectorList } from '#src/__mocks__/connector.js';
import { mockConnector0, mockMyEyesIDConnector, mockMetadata0 } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import assertThat from '#src/utils/assert-that.js';
import { ConnectorType, type MyEyesIDConnector } from '#src/utils/connectors/types.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

// eslint-disable-next-line @typescript-eslint/ban-types
const getMyEyesIDConnectors = jest.fn<Promise<MyEyesIDConnector[]>, []>();

const tenantContext = new MockTenant(
  undefined,
  {},
  {
    getMyEyesIDConnectors,
    getMyEyesIDConnectorById: async (connectorId: string) => {
      const connectors = await getMyEyesIDConnectors();
      const connector = connectors.find(({ dbEntry }) => dbEntry.id === connectorId);
      assertThat(
        connector,
        new RequestError({
          code: 'entity.not_found',
          connectorId,
          status: 404,
        })
      );

      return connector;
    },
  },
  {}
);

const connectorAuthorizationUriRoutes = await pickDefault(import('./authorization-uri.js'));

describe('POST /connectors/:connectorId/authorization-uri', () => {
  const connectorRequest = createRequester({
    authedRoutes: connectorAuthorizationUriRoutes,
    tenantContext,
  });

  it('should return 404 if connector not found', async () => {
    getMyEyesIDConnectors.mockResolvedValueOnce([]);
    const response = await connectorRequest
      .post('/connectors/non-exist-connector-id/authorization-uri')
      .send({
        state: 'random_state',
        redirectUri: 'http://example.com/callback/random_string',
      });

    expect(response.status).toBe(404);
  });

  it('should return 400 if state is missing in payload', async () => {
    const response = await connectorRequest
      .post('/connectors/id0/authorization-uri')
      .send({ redirectUri: 'http://example.com/callback/random_string' });
    expect(response.status).toBe(400);
  });

  it('should return 400 if redirectUri is missing in payload', async () => {
    const response = await connectorRequest
      .post('/connectors/id0/authorization-uri')
      .send({ state: 'random_state' });
    expect(response.status).toBe(400);
  });

  it('should return 400 if connector type is not social', async () => {
    getMyEyesIDConnectors.mockResolvedValueOnce(mockMyEyesIDConnectorList);
    const response = await connectorRequest.post('/connectors/id1/authorization-uri').send({
      state: 'random_state',
      redirectUri: 'http://example.com/callback/random_string',
    });
    expect(response.status).toBe(400);
  });

  it('should return connector authorization URI successfully', async () => {
    getMyEyesIDConnectors.mockResolvedValueOnce([
      {
        dbEntry: mockConnector0,
        metadata: { ...mockMetadata0 },
        type: ConnectorType.Social,
        ...mockMyEyesIDConnector,
        getAuthorizationUri: async () => 'http://example.com',
      },
    ]);
    const response = await connectorRequest.post('/connectors/id0/authorization-uri').send({
      state: 'random_state',
      redirectUri: 'http://example.com/callback/random_string',
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('redirectTo');
    expect(response.body.redirectTo).toBe('http://example.com');
  });
});
