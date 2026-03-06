import ky, { type KyInstance } from 'ky';

import { type UserProfile } from '../types.js';

export type GetAccessToken = () => Promise<string>;

/**
 * The API client for the MyEyesID account elements
 *
 * Used to interact with Account-related backend APIs, including the Profile API.
 */
export class MyEyesIDAccountApi {
  private readonly ky: KyInstance;

  constructor(
    /**
     * The endpoint URL of the MyEyesID service.
     *
     * Example: 'https://your-tenant-id.myeyesid.app'
     */
    myeyesidEndpoint: string,
    /**
     * Obtains the access token for Account-related API interactions.
     *
     * Called every time the account elements make a request to the backend API.
     *
     * Should handle access token expiration and request a new token when needed.
     *
     * Note: If using the `getAccessToken` method provided by the MyEyesID SDK,
     * it already ensures a valid access token is obtained.
     */
    getAccessToken: GetAccessToken
  ) {
    this.ky = ky.create({
      prefixUrl: myeyesidEndpoint,
      hooks: {
        beforeRequest: [
          async (request) => {
            request.headers.set('Authorization', `Bearer ${await getAccessToken()}`);
          },
        ],
      },
    });
  }

  async fetchUserProfile() {
    return this.ky.get('api/profile').json<UserProfile>();
  }
}
