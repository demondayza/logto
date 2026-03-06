import type {
  CloudConnectionData,
  IdTokenConfig,
  JwtCustomizerType,
  MyEyesIDOidcConfigType,
} from '@myeyesid/schemas';
import {
  MyEyesIDConfigs,
  MyEyesIDJwtTokenKey,
  MyEyesIDOidcConfigKey,
  MyEyesIDTenantConfigKey,
  cloudApiIndicator,
  cloudConnectionDataGuard,
  idTokenConfigGuard,
  jwtCustomizerConfigGuard,
  myeyesidOidcConfigGuard,
} from '@myeyesid/schemas';
import { type ConsoleLog } from '@myeyesid/shared';
import chalk from 'chalk';
import { ZodError, z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';

export type MyEyesIDConfigLibrary = ReturnType<typeof createMyEyesIDConfigLibrary>;

export const createMyEyesIDConfigLibrary = ({
  myeyesidConfigs: {
    getRowsByKeys,
    getCloudConnectionData: queryCloudConnectionData,
    upsertJwtCustomizer: queryUpsertJwtCustomizer,
    upsertIdTokenConfig: queryUpsertIdTokenConfig,
  },
}: Pick<Queries, 'myeyesidConfigs'>) => {
  const getOidcConfigs = async (consoleLog: ConsoleLog): Promise<MyEyesIDOidcConfigType> => {
    try {
      const { rows } = await getRowsByKeys(Object.values(MyEyesIDOidcConfigKey));

      return z
        .object(myeyesidOidcConfigGuard)
        .parse(Object.fromEntries(rows.map(({ key, value }) => [key, value])));
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        consoleLog.error(
          error.issues
            .map(({ message, path }) => `${message} at ${chalk.green(path.join('.'))}`)
            .join('\n')
        );
      } else {
        consoleLog.error(error);
      }

      consoleLog.error(
        `\nFailed to get OIDC configs from your MyEyesID database.` +
          ' Did you forget to seed your database?\n\n' +
          `  Use ${chalk.green('npm run cli db seed')} to seed your MyEyesID database;\n` +
          `  Or use ${chalk.green('npm run cli db seed oidc')} to seed OIDC configs alone.\n`
      );
      throw new Error('Failed to get configs');
    }
  };

  const getCloudConnectionData = async (): Promise<CloudConnectionData> => {
    const { value } = await queryCloudConnectionData();
    const result = cloudConnectionDataGuard.safeParse(value);

    if (!result.success) {
      throw new Error('Failed to get cloud connection data!');
    }

    return {
      appId: result.data.appId,
      appSecret: result.data.appSecret,
      resource: cloudApiIndicator,
    };
  };

  // Can not narrow down the type of value if we utilize `buildInsertIntoWithPool` method.
  const upsertJwtCustomizer = async <T extends MyEyesIDJwtTokenKey>(
    key: T,
    value: z.infer<(typeof jwtCustomizerConfigGuard)[T]>
  ) => {
    const { value: rawValue } = await queryUpsertJwtCustomizer(key, value);

    return {
      key,
      value: jwtCustomizerConfigGuard[key].parse(rawValue),
    };
  };

  const getJwtCustomizer = async <T extends MyEyesIDJwtTokenKey>(key: T) => {
    const { rows } = await getRowsByKeys([key]);

    // If the record does not exist (`rows` is empty)
    if (rows.length === 0) {
      throw new RequestError({
        code: 'entity.not_exists_with_id',
        name: MyEyesIDConfigs.tableSingular,
        id: key,
        status: 404,
      });
    }

    return z.object({ value: jwtCustomizerConfigGuard[key] }).parse(rows[0]).value;
  };

  const getJwtCustomizers = async (consoleLog: ConsoleLog): Promise<Partial<JwtCustomizerType>> => {
    try {
      const { rows } = await getRowsByKeys(Object.values(MyEyesIDJwtTokenKey));

      return z
        .object(jwtCustomizerConfigGuard)
        .partial()
        .parse(Object.fromEntries(rows.map(({ key, value }) => [key, value])));
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        consoleLog.error(
          error.issues
            .map(({ message, path }) => `${message} at ${chalk.green(path.join('.'))}`)
            .join('\n')
        );
      } else {
        consoleLog.error(error);
      }

      throw new Error('Failed to get JWT customizers');
    }
  };

  const updateJwtCustomizer = async <T extends MyEyesIDJwtTokenKey>(
    key: T,
    value: JwtCustomizerType[T]
  ): Promise<JwtCustomizerType[T]> => {
    const originValue = await getJwtCustomizer(key);
    const result = jwtCustomizerConfigGuard[key].parse({ ...originValue, ...value });
    const updatedRow = await upsertJwtCustomizer(key, result);
    return updatedRow.value;
  };

  const getIdTokenConfig = async () => {
    const { rows } = await getRowsByKeys([MyEyesIDTenantConfigKey.IdToken]);

    if (rows.length === 0) {
      return;
    }

    return idTokenConfigGuard.parse(rows[0]?.value);
  };

  const upsertIdTokenConfig = async (idTokenConfig: IdTokenConfig) => {
    const { value } = await queryUpsertIdTokenConfig(idTokenConfig);
    return idTokenConfigGuard.parse(value);
  };

  return {
    getOidcConfigs,
    getCloudConnectionData,
    upsertJwtCustomizer,
    getJwtCustomizer,
    getJwtCustomizers,
    updateJwtCustomizer,
    getIdTokenConfig,
    upsertIdTokenConfig,
  };
};
