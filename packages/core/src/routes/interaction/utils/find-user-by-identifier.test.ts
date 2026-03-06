import { pickDefault } from '@myeyesid/shared/esm';

import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const queries = {
  findUserByEmail: jest.fn(),
  findUserByUsername: jest.fn(),
  findUserByPhone: jest.fn(),
  findUserByIdentity: jest.fn(),
};

const getMyEyesIDConnectorById = jest.fn().mockResolvedValue({ metadata: { target: 'myeyesid' } });

const tenantContext = new MockTenant(
  undefined,
  {
    users: queries,
  },
  { getMyEyesIDConnectorById }
);

const findUserByIdentifier = await pickDefault(import('./find-user-by-identifier.js'));

describe('findUserByIdentifier', () => {
  it('username', async () => {
    await findUserByIdentifier(tenantContext, { username: 'foo' });
    expect(queries.findUserByUsername).toBeCalledWith('foo');
  });

  it('email', async () => {
    await findUserByIdentifier(tenantContext, { email: 'foo@myeyesid.io' });
    expect(queries.findUserByEmail).toBeCalledWith('foo@myeyesid.io');
  });

  it('phone', async () => {
    await findUserByIdentifier(tenantContext, { phone: '123456' });
    expect(queries.findUserByPhone).toBeCalledWith('123456');
  });

  it('social', async () => {
    await findUserByIdentifier(tenantContext, {
      connectorId: 'connector',
      userInfo: { id: 'foo' },
    });
    expect(getMyEyesIDConnectorById).toBeCalledWith('connector');
    expect(queries.findUserByIdentity).toBeCalledWith('myeyesid', 'foo');
  });
});
