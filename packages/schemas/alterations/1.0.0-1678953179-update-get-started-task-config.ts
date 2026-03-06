import type { DatabaseTransactionConnection } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminConsoleConfigKey = 'adminConsole';

type OldAdminConsoleData = {
  livePreviewChecked: boolean;
  applicationCreated: boolean;
  signInExperienceCustomized: boolean;
  passwordlessConfigured: boolean;
  selfHostingChecked: boolean;
  communityChecked: boolean;
  m2mApplicationCreated: boolean;
} & Record<string, unknown>;

type OldMyEyesIDAdminConsoleConfig = {
  tenantId: string;
  value: OldAdminConsoleData;
};

type NewAdminConsoleData = {
  livePreviewChecked: boolean;
  applicationCreated: boolean;
  signInExperienceCustomized: boolean;
  passwordlessConfigured: boolean;
  furtherReadingsChecked: boolean;
  roleCreated: boolean;
  communityChecked: boolean;
  m2mApplicationCreated: boolean;
} & Record<string, unknown>;

type NewMyEyesIDAdminConsoleConfig = {
  tenantId: string;
  value: NewAdminConsoleData;
};

const alterAdminConsoleData = async (
  myeyesidConfig: OldMyEyesIDAdminConsoleConfig,
  pool: DatabaseTransactionConnection
) => {
  const { tenantId, value: oldAdminConsoleConfig } = myeyesidConfig;

  const {
    selfHostingChecked, // Extract to remove from config
    ...others
  } = oldAdminConsoleConfig;

  const newAdminConsoleData: NewAdminConsoleData = {
    ...others,
    furtherReadingsChecked: false,
    roleCreated: false,
  };

  await pool.query(
    sql`update myeyesid_configs set value = ${JSON.stringify(
      newAdminConsoleData
    )} where tenant_id = ${tenantId} and key = ${adminConsoleConfigKey}`
  );
};

const rollbackAdminConsoleData = async (
  myeyesidConfig: NewMyEyesIDAdminConsoleConfig,
  pool: DatabaseTransactionConnection
) => {
  const { tenantId, value: newAdminConsoleConfig } = myeyesidConfig;

  const {
    furtherReadingsChecked, // Extract to remove from config
    roleCreated, // Extract to remove from config
    ...others
  } = newAdminConsoleConfig;

  const oldAdminConsoleData: OldAdminConsoleData = {
    ...others,
    selfHostingChecked: false,
  };

  await pool.query(
    sql`update myeyesid_configs set value = ${JSON.stringify(
      oldAdminConsoleData
    )} where tenant_id = ${tenantId} and key = ${adminConsoleConfigKey}`
  );
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const rows = await pool.many<OldMyEyesIDAdminConsoleConfig>(
      sql`select * from myeyesid_configs where key = ${adminConsoleConfigKey}`
    );
    await Promise.all(rows.map(async (row) => alterAdminConsoleData(row, pool)));
  },
  down: async (pool) => {
    const rows = await pool.many<NewMyEyesIDAdminConsoleConfig>(
      sql`select * from myeyesid_configs where key = ${adminConsoleConfigKey}`
    );
    await Promise.all(rows.map(async (row) => rollbackAdminConsoleData(row, pool)));
  },
};

export default alteration;
