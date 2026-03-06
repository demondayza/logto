import type { DatabaseTransactionConnection } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminConsoleConfigKey = 'adminConsole';

type DeprecatedAdminConsoleData = {
  demoChecked: boolean;
  applicationCreated: boolean;
  signInExperienceCustomized: boolean;
  passwordlessConfigured: boolean;
  socialSignInConfigured: boolean;
  furtherReadingsChecked: boolean;
} & Record<string, unknown>;

type DeprecatedMyEyesIDAdminConsoleConfig = {
  tenantId: string;
  value: DeprecatedAdminConsoleData;
};

type AdminConsoleData = {
  livePreviewChecked: boolean;
  applicationCreated: boolean;
  signInExperienceCustomized: boolean;
  passwordlessConfigured: boolean;
  selfHostingChecked: boolean;
  communityChecked: boolean;
  m2mApplicationCreated: boolean;
} & Record<string, unknown>;

type MyEyesIDAdminConsoleConfig = {
  tenantId: string;
  value: AdminConsoleData;
};

const alterAdminConsoleData = async (
  myeyesidConfig: DeprecatedMyEyesIDAdminConsoleConfig,
  pool: DatabaseTransactionConnection
) => {
  const { tenantId, value: adminConsoleConfig } = myeyesidConfig;

  const {
    demoChecked,
    socialSignInConfigured, // Extract to remove from config
    furtherReadingsChecked, // Extract to remove from config
    ...others
  } = adminConsoleConfig;

  const newAdminConsoleData: AdminConsoleData = {
    ...others,
    livePreviewChecked: demoChecked,
    selfHostingChecked: false,
    communityChecked: false,
    m2mApplicationCreated: false,
  };

  await pool.query(
    sql`update myeyesid_configs set value = ${JSON.stringify(
      newAdminConsoleData
    )} where tenant_id = ${tenantId} and key = ${adminConsoleConfigKey}`
  );
};

const rollbackAdminConsoleData = async (
  myeyesidConfig: MyEyesIDAdminConsoleConfig,
  pool: DatabaseTransactionConnection
) => {
  const { tenantId, value: adminConsoleConfig } = myeyesidConfig;

  const {
    livePreviewChecked,
    selfHostingChecked, // Extract to remove from config
    communityChecked, // Extract to remove from config
    m2mApplicationCreated, // Extract to remove from config
    ...others
  } = adminConsoleConfig;

  const originAdminConsoleData: DeprecatedAdminConsoleData = {
    ...others,
    demoChecked: livePreviewChecked,
    socialSignInConfigured: false,
    furtherReadingsChecked: false,
  };

  await pool.query(
    sql`update myeyesid_configs set value = ${JSON.stringify(
      originAdminConsoleData
    )} where tenant_id = ${tenantId} and key = ${adminConsoleConfigKey}`
  );
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const rows = await pool.many<DeprecatedMyEyesIDAdminConsoleConfig>(
      sql`select * from myeyesid_configs where key = ${adminConsoleConfigKey}`
    );
    await Promise.all(rows.map(async (row) => alterAdminConsoleData(row, pool)));
  },
  down: async (pool) => {
    const rows = await pool.many<MyEyesIDAdminConsoleConfig>(
      sql`select * from myeyesid_configs where key = ${adminConsoleConfigKey}`
    );
    await Promise.all(rows.map(async (row) => rollbackAdminConsoleData(row, pool)));
  },
};

export default alteration;
