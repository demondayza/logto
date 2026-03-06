import type { MyEyesIDConfigKey } from '@myeyesid/schemas';
import {
  defaultTenantId,
  MyEyesIDOidcConfigKey,
  myeyesidConfigGuards,
  myeyesidConfigKeys,
  SupportedSigningKeyAlgorithm,
} from '@myeyesid/schemas';
import { deduplicate, noop } from '@silverhand/essentials';
import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { createPoolFromConfig } from '../../database.js';
import { getRowsByKeys, updateValueByKey } from '../../queries/myeyesid-config.js';
import { consoleLog } from '../../utils.js';

import { generateOidcCookieKey, generateOidcPrivateKey } from './utils.js';

const validKeysDisplay = chalk.green(myeyesidConfigKeys.join(', '));

type ValidateKeysFunction = {
  (keys: string[]): asserts keys is MyEyesIDConfigKey[];
  (key: string): asserts key is MyEyesIDConfigKey;
};

const validateKeys: ValidateKeysFunction = (keys) => {
  const invalidKey = (Array.isArray(keys) ? keys : [keys]).find(
    // Using `.includes()` will result a type error
    // eslint-disable-next-line unicorn/prefer-includes
    (key) => !myeyesidConfigKeys.some((element) => element === key)
  );

  if (invalidKey) {
    consoleLog.fatal(
      `Invalid config key ${chalk.red(invalidKey)} found, expected one of ${validKeysDisplay}`
    );
  }
};

const validRotateKeys = Object.freeze([
  MyEyesIDOidcConfigKey.PrivateKeys,
  MyEyesIDOidcConfigKey.CookieKeys,
] as const);

const validPrivateKeyTypes = Object.freeze([
  SupportedSigningKeyAlgorithm.RSA,
  SupportedSigningKeyAlgorithm.EC,
] as const);

type ValidateRotateKeyFunction = (key: string) => asserts key is (typeof validRotateKeys)[number];

type ValidatePrivateKeyTypeFunction = (
  key: string
) => asserts key is (typeof validPrivateKeyTypes)[number];

const validateRotateKey: ValidateRotateKeyFunction = (key) => {
  // Using `.includes()` will result a type error
  // eslint-disable-next-line unicorn/prefer-includes
  if (!validRotateKeys.some((element) => element === key)) {
    consoleLog.fatal(
      `Invalid config key ${chalk.red(key)} found, expected one of ${validKeysDisplay}`
    );
  }
};

const validatePrivateKeyType: ValidatePrivateKeyTypeFunction = (key) => {
  // Using `.includes()` will result a type error
  // eslint-disable-next-line unicorn/prefer-includes
  if (!validPrivateKeyTypes.some((element) => element === key)) {
    consoleLog.fatal(
      `Invalid private key type ${chalk.red(
        key
      )} found, expected one of ${validPrivateKeyTypes.join(', ')}`
    );
  }
};

const getConfig: CommandModule<unknown, { key: string; keys: string[]; tenantId: string }> = {
  command: 'get <key> [keys...]',
  describe: 'Get config value(s) of the given key(s) in MyEyesID database',
  builder: (yargs) =>
    yargs
      .positional('key', {
        describe: `The key to get from database, one of ${validKeysDisplay}`,
        type: 'string',
        demandOption: true,
      })
      .positional('keys', {
        describe: 'The additional keys to get from database',
        type: 'string',
        array: true,
        default: [],
      })
      .option('tenantId', {
        describe: 'The tenant to operate',
        type: 'string',
        default: defaultTenantId,
      }),
  handler: async ({ key, keys, tenantId }) => {
    const queryKeys = deduplicate([key, ...keys]);
    validateKeys(queryKeys);

    const pool = await createPoolFromConfig();
    const { rows } = await getRowsByKeys(pool, tenantId, queryKeys);
    await pool.end();

    consoleLog.plain(
      queryKeys
        .map((currentKey) => {
          const value = rows.find(({ key }) => currentKey === key)?.value;

          return (
            chalk.magenta(currentKey) +
            '=' +
            (value === undefined ? chalk.gray(value) : chalk.green(JSON.stringify(value)))
          );
        })
        .join('\n')
    );
  },
};

const setConfig: CommandModule<unknown, { key: string; value: string; tenantId: string }> = {
  command: 'set <key> <value>',
  describe: 'Set config value of the given key in MyEyesID database',
  builder: (yargs) =>
    yargs
      .positional('key', {
        describe: `The key to get from database, one of ${validKeysDisplay}`,
        type: 'string',
        demandOption: true,
      })
      .positional('value', {
        describe: 'The value to set, should be a valid JSON string',
        type: 'string',
        demandOption: true,
      })
      .option('tenantId', {
        describe: 'The tenant to operate',
        type: 'string',
        default: defaultTenantId,
      }),
  handler: async ({ key, value, tenantId }) => {
    validateKeys(key);

    const guarded = myeyesidConfigGuards[key].parse(JSON.parse(value));

    const pool = await createPoolFromConfig();
    await updateValueByKey(pool, tenantId, key, guarded);
    await pool.end();

    consoleLog.info(`Update ${chalk.green(key)} succeeded`);
  },
};

const rotateConfig: CommandModule<unknown, { key: string; tenantId: string; type: string }> = {
  command: 'rotate <key>',
  describe:
    'Generate a new private or secret key for the given config key and prepend to the key array',
  builder: (yargs) =>
    yargs
      .positional('key', {
        describe: `The key to rotate, one of ${chalk.green(validRotateKeys.join(', '))}`,
        type: 'string',
        demandOption: true,
      })
      .option('tenantId', {
        describe: 'The tenant to operate',
        type: 'string',
        default: defaultTenantId,
      })
      .option('type', {
        describe: `The key type for ${
          MyEyesIDOidcConfigKey.PrivateKeys
        }, one of ${validPrivateKeyTypes.join(', ')}`,
        type: 'string',
        default: 'ec',
      }),
  handler: async ({ key, tenantId, type }) => {
    const keyType = type.toUpperCase();
    validateRotateKey(key);
    validatePrivateKeyType(keyType);

    const pool = await createPoolFromConfig();
    const { rows } = await getRowsByKeys(pool, tenantId, [key]);

    if (!rows[0]) {
      consoleLog.warn('No key found, create a new one');
    }

    const getValue = async () => {
      const parsed = myeyesidConfigGuards[key].safeParse(rows[0]?.value);
      const original = parsed.success ? parsed.data : [];

      // No need for default. It's already exhaustive
      switch (key) {
        case MyEyesIDOidcConfigKey.PrivateKeys: {
          return [await generateOidcPrivateKey(keyType), ...original];
        }

        case MyEyesIDOidcConfigKey.CookieKeys: {
          return [generateOidcCookieKey(), ...original];
        }
      }
    };
    const rotated = await getValue();
    await updateValueByKey(pool, tenantId, key, rotated);
    await pool.end();

    consoleLog.info(`Rotate ${chalk.green(key)} succeeded, now it has ${rotated.length} keys`);
  },
};

const trimConfig: CommandModule<unknown, { key: string; length: number; tenantId: string }> = {
  command: 'trim <key> [length]',
  describe: 'Remove the last [length] number of private or secret keys for the given config key',
  builder: (yargs) =>
    yargs
      .positional('key', {
        describe: `The config key to trim, one of ${chalk.green(validRotateKeys.join(', '))}`,
        type: 'string',
        demandOption: true,
      })
      .positional('length', {
        describe: 'Number of private or secret keys to trim',
        type: 'number',
        default: 1,
        demandOption: true,
      })
      .option('tenantId', {
        describe: 'The tenant to operate',
        type: 'string',
        default: defaultTenantId,
      }),
  handler: async ({ key, length, tenantId }) => {
    validateRotateKey(key);

    if (length < 1) {
      consoleLog.fatal('Invalid length provided');
    }

    const pool = await createPoolFromConfig();
    const { rows } = await getRowsByKeys(pool, tenantId, [key]);

    if (!rows[0]) {
      consoleLog.warn('No key found, create a new one');
    }

    const getValue = async () => {
      const value = myeyesidConfigGuards[key].parse(rows[0]?.value);

      if (value.length - length < 1) {
        await pool.end();
        consoleLog.fatal(
          `You should keep at least one key in the array, current length=${value.length}`
        );
      }

      return value.slice(0, -length);
    };
    const trimmed = await getValue();
    await updateValueByKey(pool, tenantId, key, trimmed);
    await pool.end();

    consoleLog.info(`Trim ${chalk.green(key)} succeeded, now it has ${trimmed.length} keys`);
  },
};

const config: CommandModule = {
  command: ['config', 'configs'],
  describe: 'Commands for MyEyesID database config',
  builder: (yargs) =>
    yargs
      .command(getConfig)
      .command(setConfig)
      .command(rotateConfig)
      .command(trimConfig)
      .demandCommand(1),
  handler: noop,
};

export default config;
