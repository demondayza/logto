import { SignInIdentifier } from '@myeyesid/schemas';

import { createOneTimeToken } from '#src/api/one-time-token.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { waitFor } from '#src/utils.js';

describe('One-time token verification APIs', () => {
  it('should successfully verify one-time token', async () => {
    const client = await initExperienceClient();

    const oneTimeToken = await createOneTimeToken({
      email: 'foo@myeyesid.io',
    });

    const { verificationId } = await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: {
        type: SignInIdentifier.Email,
        value: 'foo@myeyesid.io',
      },
    });

    expect(verificationId).toBeTruthy();
  });

  it('should throw token_consumed error when token is already consumed', async () => {
    const client = await initExperienceClient();

    const oneTimeToken = await createOneTimeToken({
      email: 'foo@myeyesid.io',
    });

    await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: {
        type: SignInIdentifier.Email,
        value: 'foo@myeyesid.io',
      },
    });

    await expectRejects(
      client.verifyOneTimeToken({
        token: oneTimeToken.token,
        identifier: {
          type: SignInIdentifier.Email,
          value: 'foo@myeyesid.io',
        },
      }),
      {
        code: 'one_time_token.token_consumed',
        status: 400,
      }
    );
  });

  it('should throw token_expired error when token is expired', async () => {
    const client = await initExperienceClient();

    const oneTimeToken = await createOneTimeToken({
      email: 'foo@myeyesid.io',
      expiresIn: 1,
    });

    await waitFor(2000);

    await expectRejects(
      client.verifyOneTimeToken({
        token: oneTimeToken.token,
        identifier: {
          type: SignInIdentifier.Email,
          value: 'foo@myeyesid.io',
        },
      }),
      {
        code: 'one_time_token.token_expired',
        status: 400,
      }
    );
  });

  it('should throw token_not_found error when token is not found', async () => {
    const client = await initExperienceClient();

    await expectRejects(
      client.verifyOneTimeToken({
        token: 'invalid_token',
        identifier: {
          type: SignInIdentifier.Email,
          value: 'foo@myeyesid.io',
        },
      }),
      {
        code: 'one_time_token.token_not_found',
        status: 404,
      }
    );
  });

  it('should throw email_mismatch error when email is mismatched', async () => {
    const client = await initExperienceClient();

    const oneTimeToken = await createOneTimeToken({
      email: 'foo@myeyesid.io',
    });

    await expectRejects(
      client.verifyOneTimeToken({
        token: oneTimeToken.token,
        identifier: {
          type: SignInIdentifier.Email,
          value: 'bar@myeyesid.io',
        },
      }),
      {
        code: 'one_time_token.email_mismatch',
        status: 400,
      }
    );
  });
});
