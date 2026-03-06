import { ConnectorError, ConnectorErrorCodes } from '@myeyesid/connector-kit';
import { ConnectorType } from '@myeyesid/schemas';
import { pickDefault } from '@myeyesid/shared/esm';

import {
  mockMetadata,
  mockConnector,
  mockMyEyesIDConnectorList,
  mockMyEyesIDConnector,
} from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import assertThat from '#src/utils/assert-that.js';
import type { MyEyesIDConnector } from '#src/utils/connectors/types.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const removeUnavailableSocialConnectorTargets = jest.fn();

const getMyEyesIDConnectors: jest.MockedFunction<() => Promise<MyEyesIDConnector[]>> = jest.fn();
const getMyEyesIDConnectorById: jest.MockedFunction<(connectorId: string) => Promise<MyEyesIDConnector>> =
  jest.fn(async (connectorId: string) => {
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

    return {
      ...connector,
      sendMessage: sendMessagePlaceHolder,
    };
  });

const sendMessagePlaceHolder = jest.fn();

const connectorQueries = {
  findConnectorById: jest.fn(),
  deleteConnectorById: jest.fn(),
  updateConnector: jest.fn(),
} satisfies Partial<Queries['connectors']>;
const { updateConnector } = connectorQueries;

const tenantContext = new MockTenant(
  undefined,
  { connectors: connectorQueries },
  {
    getMyEyesIDConnectors,
    getMyEyesIDConnectorById,
  },
  {
    signInExperiences: { removeUnavailableSocialConnectorTargets },
  }
);

const connectorDataRoutes = await pickDefault(import('./index.js'));

describe('connector data routes', () => {
  const connectorRequest = createRequester({ authedRoutes: connectorDataRoutes, tenantContext });

  describe('PATCH /connectors/:id', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('throws when connector can not be found by given connectorId (locally)', async () => {
      getMyEyesIDConnectors.mockResolvedValueOnce(mockMyEyesIDConnectorList.slice(0, 1));
      const response = await connectorRequest.patch('/connectors/findConnector').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('throws when connector can not be found by given connectorId (remotely)', async () => {
      getMyEyesIDConnectors.mockResolvedValueOnce([]);
      const response = await connectorRequest.patch('/connectors/id0').send({});
      expect(response).toHaveProperty('statusCode', 404);
    });

    it('config validation fails', async () => {
      getMyEyesIDConnectors.mockResolvedValueOnce([
        {
          dbEntry: mockConnector,
          metadata: mockMetadata,
          type: ConnectorType.Sms,
          ...mockMyEyesIDConnector,
          validateConfig: () => {
            throw new ConnectorError(ConnectorErrorCodes.InvalidConfig);
          },
        },
      ]);
      const response = await connectorRequest
        .patch('/connectors/id')
        .send({ config: { cliend_id: 'client_id', client_secret: 'client_secret' } });
      expect(response).toHaveProperty('statusCode', 500);
    });

    it('throws when trying to update target', async () => {
      getMyEyesIDConnectors.mockResolvedValue([
        {
          dbEntry: mockConnector,
          metadata: { ...mockMetadata, isStandard: true },
          type: ConnectorType.Social,
          ...mockMyEyesIDConnector,
        },
      ]);
      const response = await connectorRequest.patch('/connectors/id').send({
        metadata: {
          target: 'target',
        },
      });
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('throws when updates non-standard connector metadata', async () => {
      getMyEyesIDConnectors.mockResolvedValue([
        {
          dbEntry: mockConnector,
          metadata: { ...mockMetadata },
          type: ConnectorType.Social,
          ...mockMyEyesIDConnector,
        },
      ]);
      const response = await connectorRequest.patch('/connectors/id').send({
        metadata: {
          target: 'connector',
          name: { en: 'connector_name', fr: 'connector_name' },
          logo: 'new_logo.png',
        },
      });
      expect(response).toHaveProperty('statusCode', 400);
    });

    it('throws when set syncProfile to `true` and with non-social connector', async () => {
      getMyEyesIDConnectors.mockResolvedValueOnce([
        {
          dbEntry: mockConnector,
          metadata: mockMetadata,
          type: ConnectorType.Sms,
          ...mockMyEyesIDConnector,
        },
      ]);
      const response = await connectorRequest.patch('/connectors/id').send({ syncProfile: true });
      expect(response).toHaveProperty('statusCode', 422);
      expect(updateConnector).toHaveBeenCalledTimes(0);
    });

    it('successfully updates connector config', async () => {
      getMyEyesIDConnectors.mockResolvedValue([
        {
          dbEntry: mockConnector,
          metadata: { ...mockMetadata, isStandard: true },
          type: ConnectorType.Social,
          ...mockMyEyesIDConnector,
        },
      ]);
      updateConnector.mockResolvedValueOnce({
        ...mockConnector,
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      const response = await connectorRequest.patch('/connectors/id').send({
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
      });
      expect(response).toHaveProperty('statusCode', 200);
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: {
            config: { cliend_id: 'client_id', client_secret: 'client_secret' },
          },
          jsonbMode: 'replace',
        })
      );
    });

    it('successfully reset connector config', async () => {
      getMyEyesIDConnectors.mockResolvedValue([
        {
          dbEntry: mockConnector,
          metadata: { ...mockMetadata, isStandard: true },
          type: ConnectorType.Social,
          ...mockMyEyesIDConnector,
        },
      ]);
      updateConnector.mockResolvedValueOnce({
        ...mockConnector,
        config: {},
      });
      const response = await connectorRequest.patch('/connectors/id').send({
        config: {},
      });
      expect(response).toHaveProperty('statusCode', 200);
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: {
            config: {},
          },
          jsonbMode: 'replace',
        })
      );
    });

    it('successfully updates connector config and metadata', async () => {
      getMyEyesIDConnectors.mockResolvedValue([
        {
          dbEntry: mockConnector,
          metadata: { ...mockMetadata, isStandard: true },
          type: ConnectorType.Social,
          ...mockMyEyesIDConnector,
        },
      ]);
      updateConnector.mockResolvedValueOnce({
        ...mockConnector,
        metadata: {
          target: 'connector',
          name: { en: 'connector_name', fr: 'connector_name' },
          logo: 'new_logo.png',
        },
      });
      const response = await connectorRequest.patch('/connectors/id').send({
        config: { cliend_id: 'client_id', client_secret: 'client_secret' },
        metadata: {
          name: { en: 'connector_name', fr: 'connector_name' },
          logo: 'new_logo.png',
          logoDark: null,
          target: 'connector',
        },
      });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: {
            config: { cliend_id: 'client_id', client_secret: 'client_secret' },
            metadata: {
              name: { en: 'connector_name', fr: 'connector_name' },
              logo: 'new_logo.png',
              target: 'connector',
            },
          },
          jsonbMode: 'replace',
        })
      );
      expect(response).toHaveProperty('statusCode', 200);
    });

    it('successfully clear connector config metadata', async () => {
      getMyEyesIDConnectors.mockResolvedValueOnce([
        {
          dbEntry: mockConnector,
          metadata: { ...mockMetadata, isStandard: true },
          type: ConnectorType.Social,
          ...mockMyEyesIDConnector,
        },
      ]);
      updateConnector.mockResolvedValueOnce({
        ...mockConnector,
        metadata: {
          target: 'connector',
        },
      });
      const response = await connectorRequest.patch('/connectors/id').send({
        metadata: { target: 'connector', name: { en: '' }, logo: '', logoDark: '' },
      });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: {
            metadata: { target: 'connector' },
          },
          jsonbMode: 'replace',
        })
      );
      expect(response).toHaveProperty('statusCode', 200);
    });

    it('successfully set syncProfile to `true` and with social connector', async () => {
      getMyEyesIDConnectors.mockResolvedValue([
        {
          dbEntry: { ...mockConnector, syncProfile: false },
          metadata: mockMetadata,
          type: ConnectorType.Social,
          ...mockMyEyesIDConnector,
        },
      ]);
      const response = await connectorRequest.patch('/connectors/id').send({ syncProfile: true });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: { syncProfile: true },
          jsonbMode: 'replace',
        })
      );
      expect(response).toHaveProperty('statusCode', 200);
    });

    it('successfully set syncProfile to `false`', async () => {
      getMyEyesIDConnectors.mockResolvedValue([
        {
          dbEntry: { ...mockConnector, syncProfile: false },
          metadata: mockMetadata,
          type: ConnectorType.Social,
          ...mockMyEyesIDConnector,
        },
      ]);
      const response = await connectorRequest.patch('/connectors/id').send({ syncProfile: false });
      expect(updateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'id' },
          set: { syncProfile: false },
          jsonbMode: 'replace',
        })
      );
      expect(response).toHaveProperty('statusCode', 200);
    });
  });
});
