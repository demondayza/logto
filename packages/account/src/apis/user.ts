import type { UserProfileResponse } from '@myeyesid/schemas';

import { createAuthenticatedKy } from './base-ky';

export const getUserInfo = async (accessToken: string) => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account')
    .json<Partial<UserProfileResponse>>();
};
