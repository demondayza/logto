import { type OrganizationScope } from '@myeyesid/schemas';

import { ApiFactory } from './factory.js';

export class OrganizationScopeApi extends ApiFactory<
  OrganizationScope,
  { name: string; description?: string }
> {
  constructor() {
    super('organization-scopes');
  }
}
