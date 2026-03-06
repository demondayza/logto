import { ConnectorPlatform } from '@myeyesid/connector-kit';
import type { Connector } from '@myeyesid/schemas';
import { ConnectorType } from '@myeyesid/schemas';
import { pickDefault, createMockUtils } from '@myeyesid/shared/esm';
import { type Nullable } from '@silverhand/essentials';
import { any } from 'zod';

import {
  mockMetadata,
  mockConnector,
  mockConnectorFactory,
  mockMyEyesIDConnector,
} from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import { createMockQuotaLibrary } from '#src/test-utils/quota.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import assertThat from '#src/utils/assert-that.js';
import type { MyEyesIDConnector } from '#src/utils/connectors/types.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const connectorQueries = {
  countConnectorByConnectorId: jest.fn(),
  deleteConnectorByIds: jest.fn(),
  insertConnector: jest.fn(async (body) => body as Connector),
} satisfies Partial<Queries['connectors']>;
const { countConnectorByConnectorId, deleteConnectorByIds, insertConnector } = connectorQueries;

// eslint-disable-next-line @typescript-eslint/ban-types
const getMyEyesIDConnectors = jest.fn<Promise<MyEyesIDConnector[]>, []>();

const { loadConnectorFactories } = await mockEsmWithActual(
  '#src/utils/connectors/index.js',
  () => ({
    loadConnectorFactories: jest.fn(),
  })
);

const { buildRawConnector } = await mockEsmWithActual('@myeyesid/cli/lib/connector/index.js', () => ({
  buildRawConnector: jest.fn(),
}));

const { validateConfig } = await mockEsmWithActual('@myeyesid/connector-kit', () => ({
  validateConfig: jest.fn(),
}));

const tenantContext = new MockTenant(
  undefined,
  { connectors: connectorQueries },
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
    getMyEyesIDConnectorByTargetAndPlatform: async (
      target: string,
      platform: Nullable<ConnectorPlatform>
    ) => {
      const connectors = await getMyEyesIDConnectors();

      return connectors.find(({ type, metadata }) => {
        return (
          type === ConnectorType.Social &&
          metadata.target === target &&
          metadata.platform === platform
        );
      });
    },
  },
  {
    quota: createMockQuotaLibrary(),
  }
);

const connectorDataRoutes = await pickDefault(import('./index.js'));

describe('connector data route', () => {
  const connectorRequest = createRequester({ authedRoutes: connectorDataRoutes, tenantContext });

  describe('POST /connectors', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should post a new connector record', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: { ...mockConnectorFactory.metadata, id: 'connectorId' },
        },
      ]);
      countConnectorByConnectorId.mockResolvedValueOnce({ count: 0 });
      getMyEyesIDConnectors.mockResolvedValueOnce([
        {
          dbEntry: { ...mockConnector, connectorId: 'id0' },
          metadata: { ...mockMetadata, id: 'id0' },
          type: ConnectorType.Sms,
          ...mockMyEyesIDConnector,
        },
      ]);
      validateConfig.mockReturnValueOnce(null);
      buildRawConnector.mockResolvedValueOnce({ rawConnector: { configGuard: any() } });
      await connectorRequest.post('/connectors').send({
        connectorId: 'connectorId',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(insertConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          connectorId: 'connectorId',
          config: { cliend_id: 'client_id', client_secret: 'client_secret' },
        })
      );
    });

    it('throw when create a new connector record with wrong config', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: { ...mockConnectorFactory.metadata, id: 'connectorId' },
        },
      ]);
      countConnectorByConnectorId.mockResolvedValueOnce({ count: 0 });
      getMyEyesIDConnectors.mockResolvedValueOnce([
        {
          dbEntry: { ...mockConnector, connectorId: 'id0' },
          metadata: { ...mockMetadata, id: 'id0' },
          type: ConnectorType.Sms,
          ...mockMyEyesIDConnector,
        },
      ]);
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'connectorId',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(response).toHaveProperty('statusCode', 500);
    });

    it('throws when connector factory not found', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: { ...mockConnectorFactory.metadata, id: 'connectorId' },
        },
      ]);
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(response).toHaveProperty('statusCode', 422);
    });

    it('should post a new record when add more than 1 instance with standard connector factory', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: {
            ...mockMetadata,
            id: 'id0',
            isStandard: true,
            platform: ConnectorPlatform.Universal,
          },
        },
      ]);
      countConnectorByConnectorId.mockResolvedValueOnce({ count: 1 });
      getMyEyesIDConnectors.mockResolvedValueOnce([
        {
          dbEntry: { ...mockConnector, connectorId: 'id0' },
          metadata: { ...mockMetadata, id: 'id0', platform: ConnectorPlatform.Universal },
          type: ConnectorType.Social,
          ...mockMyEyesIDConnector,
        },
      ]);
      validateConfig.mockReturnValueOnce(null);
      buildRawConnector.mockResolvedValueOnce({ rawConnector: { configGuard: any() } });
      await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
        metadata: { target: 'new_target' },
      });
      expect(insertConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          connectorId: 'id0',
          config: {
            cliend_id: 'client_id',
            client_secret: 'client_secret',
          },
          metadata: { target: 'new_target' },
        })
      );
    });

    it('throws when add more than 1 instance with target is an empty string with standard connector factory', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: {
            ...mockMetadata,
            id: 'id0',
            isStandard: true,
            platform: ConnectorPlatform.Universal,
          },
        },
      ]);
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
        metadata: { target: '' },
      });
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('throws when add more than 1 instance with non-standard connector factory', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: { ...mockConnectorFactory.metadata, id: 'id0' },
        },
      ]);
      countConnectorByConnectorId.mockResolvedValueOnce({ count: 1 });
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(response).toHaveProperty('statusCode', 422);
    });

    it('should add a new record and delete old records with same connector type when add passwordless connectors', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          type: ConnectorType.Sms,
          metadata: { ...mockConnectorFactory.metadata, id: 'id1' },
        },
      ]);
      getMyEyesIDConnectors.mockResolvedValueOnce([
        {
          dbEntry: { ...mockConnector, connectorId: 'id0' },
          metadata: { ...mockMetadata, id: 'id0' },
          type: ConnectorType.Sms,
          ...mockMyEyesIDConnector,
        },
      ]);
      countConnectorByConnectorId.mockResolvedValueOnce({ count: 0 });
      validateConfig.mockReturnValueOnce(null);
      buildRawConnector.mockResolvedValueOnce({ rawConnector: { configGuard: any() } });
      await connectorRequest.post('/connectors').send({
        connectorId: 'id1',
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(insertConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          connectorId: 'id1',
          config: {
            cliend_id: 'client_id',
            client_secret: 'client_secret',
          },
        })
      );
      expect(deleteConnectorByIds).toHaveBeenCalledWith(['id']);
    });

    it('throws when add more than 1 social connector instance with same target and platform (add from standard connector)', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: {
            ...mockConnectorFactory.metadata,
            id: 'id0',
            platform: ConnectorPlatform.Universal,
            isStandard: true,
          },
        },
      ]);
      countConnectorByConnectorId.mockResolvedValueOnce({ count: 0 });
      getMyEyesIDConnectors.mockResolvedValueOnce([
        {
          dbEntry: { ...mockConnector, connectorId: 'id0', metadata: { target: 'target' } },
          metadata: {
            ...mockMetadata,
            id: 'id0',
            target: 'target',
            platform: ConnectorPlatform.Universal,
          },
          type: ConnectorType.Social,
          ...mockMyEyesIDConnector,
        },
      ]);
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
        metadata: { target: 'target' },
      });
      expect(response).toHaveProperty('statusCode', 422);
    });

    it('throws when add more than 1 social connector instance with same target and platform (add social connector)', async () => {
      loadConnectorFactories.mockResolvedValueOnce([
        {
          ...mockConnectorFactory,
          metadata: {
            ...mockConnectorFactory.metadata,
            id: 'id0',
            platform: ConnectorPlatform.Universal,
            target: 'target',
          },
        },
      ]);
      countConnectorByConnectorId.mockResolvedValueOnce({ count: 0 });
      getMyEyesIDConnectors.mockResolvedValueOnce([
        {
          dbEntry: { ...mockConnector, connectorId: 'id0', metadata: { target: 'target' } },
          metadata: {
            ...mockMetadata,
            id: 'id0',
            target: 'target',
            platform: ConnectorPlatform.Universal,
          },
          type: ConnectorType.Social,
          ...mockMyEyesIDConnector,
        },
      ]);
      const response = await connectorRequest.post('/connectors').send({
        connectorId: 'id0',
      });
      expect(response).toHaveProperty('statusCode', 422);
    });
  });
});
