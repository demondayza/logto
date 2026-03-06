import { MyEyesIDAccountApi } from '../api/index.js';
import { type UserProfile } from '../types.js';

type CreteMockAccountApiOptions = {
  fetchUserProfile: () => Promise<UserProfile>;
};

export const createMockAccountApi = ({
  fetchUserProfile,
}: CreteMockAccountApiOptions): MyEyesIDAccountApi => {
  class MockAccountApi extends MyEyesIDAccountApi {
    async fetchUserProfile(): Promise<UserProfile> {
      return fetchUserProfile();
    }
  }

  return new MockAccountApi('https://mock.myeyesid.app', async () => 'dummy_access_token');
};
