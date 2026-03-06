import { InteractionEvent } from '@myeyesid/schemas';
import { pickDefault } from '@myeyesid/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import type { Identifier } from '../types/index.js';

const { jest } = import.meta;

const tenantContext = new MockTenant(
  undefined,
  {
    users: {
      findUserById: jest.fn().mockResolvedValue({ id: 'foo' }),
      hasUserWithEmail: jest.fn().mockResolvedValue(false),
      hasUserWithNormalizedPhone: jest.fn().mockResolvedValue(false),
      hasUserWithIdentity: jest.fn().mockResolvedValue(false),
    },
  },
  {
    getMyEyesIDConnectorById: jest.fn().mockResolvedValue({
      metadata: { target: 'myeyesid' },
    }),
  }
);
const verifyProfile = await pickDefault(import('./profile-verification.js'));

describe('profile protected identifier verification', () => {
  const baseInteraction = {
    event: InteractionEvent.SignIn,
    identifiers: [{ key: 'accountId', value: 'foo' }] as Identifier[],
    accountId: 'foo',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('email, phone and social identifier must be verified', () => {
    it('email without a verified identifier should throw', async () => {
      const interaction = {
        ...baseInteraction,
        profile: {
          email: 'email',
        },
      };

      await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
        new RequestError({ code: 'session.verification_session_not_found', status: 404 })
      );
    });

    it('email with unmatched identifier should throw', async () => {
      const identifiers: Identifier[] = [{ key: 'emailVerified', value: 'phone' }];
      const interaction = {
        ...baseInteraction,
        identifiers,
        profile: {
          email: 'email',
        },
      };

      await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
        new RequestError({ code: 'session.verification_session_not_found', status: 404 })
      );
    });

    it('email with proper identifier should not throw', async () => {
      const identifiers: Identifier[] = [{ key: 'emailVerified', value: 'email' }];
      const interaction = {
        ...baseInteraction,
        identifiers,
        profile: {
          email: 'email',
        },
      };

      await expect(verifyProfile(tenantContext, interaction)).resolves.not.toThrow();
    });

    it('phone without a verified identifier should throw', async () => {
      const interaction = {
        ...baseInteraction,
        profile: {
          phone: 'phone',
        },
      };

      await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
        new RequestError({ code: 'session.verification_session_not_found', status: 404 })
      );
    });

    it('phone with unmatched identifier should throw', async () => {
      const identifiers: Identifier[] = [{ key: 'phoneVerified', value: 'email' }];
      const interaction = {
        ...baseInteraction,
        identifiers,
        profile: {
          phone: 'phone',
        },
      };

      await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
        new RequestError({ code: 'session.verification_session_not_found', status: 404 })
      );
    });

    it('phone with proper identifier should not throw', async () => {
      const identifiers: Identifier[] = [{ key: 'phoneVerified', value: 'phone' }];
      const interaction = {
        ...baseInteraction,
        identifiers,
        profile: {
          phone: 'phone',
        },
      };

      await expect(verifyProfile(tenantContext, interaction)).resolves.not.toThrow();
    });

    it('connectorId without a verified identifier should throw', async () => {
      const identifiers: Identifier[] = [{ key: 'emailVerified', value: 'foo@myeyesid.io' }];
      const interaction = {
        ...baseInteraction,
        identifiers,
        profile: {
          connectorId: 'connectorId',
        },
      };

      await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
        new RequestError({ code: 'session.connector_session_not_found', status: 404 })
      );
    });

    it('connectorId with unmatched identifier should throw', async () => {
      const identifiers: Identifier[] = [
        { key: 'social', connectorId: 'connectorId', userInfo: { id: 'foo' } },
      ];
      const interaction = {
        ...baseInteraction,
        identifiers,
        profile: {
          connectorId: 'myeyesid',
        },
      };

      await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
        new RequestError({ code: 'session.connector_session_not_found', status: 404 })
      );
    });

    it('connectorId with proper identifier should not throw', async () => {
      const identifiers: Identifier[] = [
        { key: 'accountId', value: 'foo' },
        { key: 'social', connectorId: 'myeyesid', userInfo: { id: 'foo' } },
      ];

      const interaction = {
        ...baseInteraction,
        identifiers,
        profile: {
          connectorId: 'myeyesid',
        },
      };

      await expect(verifyProfile(tenantContext, interaction)).resolves.not.toThrow();
    });
  });
});
