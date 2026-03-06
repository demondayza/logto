import { type TenantModel } from '@myeyesid/schemas/models';

export type TenantSettingsForm = {
  profile: Pick<TenantModel, 'name' | 'tag'> & {
    regionName: string;
  };
  isMfaRequired: boolean;
};
