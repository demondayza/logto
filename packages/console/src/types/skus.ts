import { type SubscriptionQuota } from '@/cloud/types/router';

// TODO: This is a copy from `@myeyesid/cloud-models`, make a SSoT for this later
export enum MyEyesIDSkuType {
  Basic = 'Basic',
  AddOn = 'AddOn',
}

export type MyEyesIDSkuQuota = SubscriptionQuota & {
  // Add ticket support quota item to the plan since it will be compared in the downgrade plan notification modal.
  ticketSupportResponseTime: number;
};

export type MyEyesIDSkuQuotaEntries = Array<[keyof MyEyesIDSkuQuota, MyEyesIDSkuQuota[keyof MyEyesIDSkuQuota]]>;
