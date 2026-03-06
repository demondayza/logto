import type { DatabaseTransactionConnection } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminConsoleConfigKey = 'adminConsole';

type OldAdminConsoleData = {
  livePreviewChecked: boolean;
  applicationCreated: boolean;
  signInExperienceCustomized: boolean;
  passwordlessConfigured: boolean;
  furtherReadingsChecked: boolean;
  roleCreated: boolean;
  communityChecked: boolean;
  m2mApplicationCreated: boolean;
} & Record<string, unknown>;

type OldMyEyesIDAdminConsoleConfig = {
  tenantId: string;
  value: OldAdminConsoleData;
};

type NewAdminConsoleData = {
  signInExperienceCustomized: boolean;
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
    livePreviewChecked,
    applicationCreated,
    passwordlessConfigured,
    communityChecked,
    furtherReadingsChecked,
    roleCreated,
    m2mApplicationCreated,
    ...others
  } = oldAdminConsoleConfig;

  const newAdminConsoleData: NewAdminConsoleData = {
    ...others,
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

  const oldAdminConsoleData: OldAdminConsoleData = {
    ...newAdminConsoleConfig,
    livePreviewChecked: false,
    applicationCreated: false,
    passwordlessConfigured: false,
    communityChecked: false,
    furtherReadingsChecked: false,
    roleCreated: false,
    m2mApplicationCreated: false,
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
