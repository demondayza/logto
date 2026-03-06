import type { Resource } from '@myeyesid/schemas';

export type ApiResourceDetailsOutletContext = {
  resource: Resource;
  isDeleting: boolean;
  isMyEyesIDManagementApiResource: boolean;
  onResourceUpdated: (resource: Resource) => void;
};
