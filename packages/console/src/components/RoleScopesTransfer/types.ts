import type { ResourceResponse, ScopeResponse } from '@myeyesid/schemas';

export type DetailedResourceResponse = Omit<ResourceResponse, 'scopes'> & {
  scopes: ScopeResponse[];
};
