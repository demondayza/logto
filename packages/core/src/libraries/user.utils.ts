import type { BindMfa, MfaVerification } from '@myeyesid/schemas';
import { MfaFactor, UsersPasswordEncryptionMethod } from '@myeyesid/schemas';
import { generateStandardId } from '@myeyesid/shared';

import { encryptPassword } from '#src/utils/password.js';

export const encryptUserPassword = async (
  password: string
): Promise<{
  passwordEncrypted: string;
  passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i;
}> => {
  const passwordEncryptionMethod = UsersPasswordEncryptionMethod.Argon2i;
  const passwordEncrypted = await encryptPassword(password, passwordEncryptionMethod);

  return { passwordEncrypted, passwordEncryptionMethod };
};

/**
 * Convert bindMfa to mfaVerification, add common fields like "id" and "createdAt"
 * and transpile formats like "codes" to "code" for backup code
 */
export const convertBindMfaToMfaVerification = (bindMfa: BindMfa): MfaVerification => {
  const { type } = bindMfa;
  const base = {
    id: generateStandardId(),
    createdAt: new Date().toISOString(),
  };

  if (type === MfaFactor.BackupCode) {
    const { codes } = bindMfa;

    return {
      ...base,
      type,
      codes: codes.map((code) => ({ code })),
    };
  }

  if (type === MfaFactor.TOTP) {
    const { secret } = bindMfa;

    return {
      ...base,
      type,
      key: secret,
    };
  }

  const { credentialId, counter, publicKey, transports, agent } = bindMfa;
  return {
    ...base,
    type,
    credentialId,
    counter,
    publicKey,
    transports,
    agent,
  };
};
