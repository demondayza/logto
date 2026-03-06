import type { MyEyesIDConfig, SignInOptions } from '@myeyesid/node';
import { InteractionEvent } from '@myeyesid/schemas';
import { assert } from '@silverhand/essentials';
import { type KyInstance } from 'ky';

import { ExperienceClient } from '#src/client/experience/index.js';
import MockClient from '#src/client/index.js';

export const initClient = async (
  config?: Partial<MyEyesIDConfig>,
  redirectUri?: string,
  options: Omit<SignInOptions, 'redirectUri'> = {}
) => {
  const client = new MockClient(config);
  await client.initSession(redirectUri, options);
  assert(client.interactionCookie, new Error('Session not found'));

  return client;
};

export const initExperienceClient = async ({
  interactionEvent = InteractionEvent.SignIn,
  config,
  redirectUri,
  options = {},
  api,
  captchaToken,
  extraHeaders,
}: {
  interactionEvent?: InteractionEvent;
  config?: Partial<MyEyesIDConfig>;
  redirectUri?: string;
  options?: Omit<SignInOptions, 'redirectUri'>;
  api?: KyInstance;
  captchaToken?: string;
  extraHeaders?: Record<string, string>;
} = {}) => {
  const client = new ExperienceClient(config, api);

  if (extraHeaders) {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    client.extraHeaders = extraHeaders;
  }

  await client.initSession(redirectUri, options);
  assert(client.interactionCookie, new Error('Session not found'));
  await client.initInteraction({ interactionEvent, captchaToken });

  return client;
};

export const processSession = async (client: MockClient, redirectTo: string) => {
  await client.processSession(redirectTo);

  await expect(client.isAuthenticated()).resolves.toBe(true);

  const { sub } = await client.getIdTokenClaims();

  return sub;
};

export const logoutClient = async (client: MockClient) => {
  await client.signOut();

  await expect(client.isAuthenticated()).resolves.toBe(false);
};
