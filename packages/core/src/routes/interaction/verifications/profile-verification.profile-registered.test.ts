import { InteractionEvent } from '@myeyesid/schemas';
import { pickDefault } from '@myeyesid/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import type { Identifier, IdentifierVerifiedInteractionResult } from '../types/index.js';

const { jest } = import.meta;

const userQueries = {
  hasUser: jest.fn().mockResolvedValue(false),
  findUserById: jest.fn().mockResolvedValue({ id: 'foo' }),
  hasUserWithEmail: jest.fn().mockResolvedValue(false),
  hasUserWithNormalizedPhone: jest.fn().mockResolvedValue(false),
  hasUserWithIdentity: jest.fn().mockResolvedValue(false),
};
const { hasUser, hasUserWithEmail, hasUserWithNormalizedPhone, hasUserWithIdentity } = userQueries;

const getMyEyesIDConnectorById = jest.fn().mockResolvedValue({
  metadata: { target: 'myeyesid' },
});

const tenantContext = new MockTenant(undefined, { users: userQueries }, { getMyEyesIDConnectorById });
const verifyProfile = await pickDefault(import('./profile-verification.js'));

const identifiers: Identifier[] = [
  { key: 'accountId', value: 'foo' },
  { key: 'emailVerified', value: 'email@myeyesid.io' },
  { key: 'phoneVerified', value: '123456' },
  { key: 'social', connectorId: 'connectorId', userInfo: { id: 'foo' } },
];

const baseInteraction: IdentifierVerifiedInteractionResult = {
  event: InteractionEvent.Register,
  identifiers,
};

describe('profile registered validation', () => {
  it('username is registered', async () => {
    hasUser.mockResolvedValueOnce(true);

    const interaction = {
      ...baseInteraction,
      profile: {
        username: 'username',
        password: 'password',
      },
    };

    await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.username_already_in_use',
        status: 422,
      })
    );
  });

  it('email is registered', async () => {
    hasUserWithEmail.mockResolvedValueOnce(true);
    const interaction = {
      ...baseInteraction,
      profile: {
        email: 'email@myeyesid.io',
      },
    };

    await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.email_already_in_use',
        status: 422,
      })
    );
  });

  it('phone is registered', async () => {
    hasUserWithNormalizedPhone.mockResolvedValueOnce(true);
    const interaction = {
      ...baseInteraction,
      profile: {
        phone: '123456',
      },
    };

    await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.phone_already_in_use',
        status: 422,
      })
    );
  });

  it('connector identity exist', async () => {
    hasUserWithIdentity.mockResolvedValueOnce(true);

    const interaction = {
      ...baseInteraction,
      profile: {
        connectorId: 'connectorId',
      },
    };

    await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.identity_already_in_use',
        status: 422,
      })
    );
  });
});
