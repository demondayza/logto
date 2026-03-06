import type { AccessTokenJwtCustomizer, ClientCredentialsJwtCustomizer } from '@myeyesid/schemas';
import { MyEyesIDJwtTokenKeyType } from '@myeyesid/schemas';
import { z } from 'zod';

export type JwtCustomizerForm = {
  tokenType: MyEyesIDJwtTokenKeyType;
  script: string;
  environmentVariables?: Array<{ key: string; value: string }>;
  testSample: {
    contextSample?: string;
    tokenSample?: string;
  };
};

export type Action = 'create' | 'edit';

export type JwtCustomizer<T extends MyEyesIDJwtTokenKeyType> =
  T extends MyEyesIDJwtTokenKeyType.AccessToken
    ? AccessTokenJwtCustomizer
    : ClientCredentialsJwtCustomizer;

export const pageParamsGuard = z.object({
  tokenType: z.nativeEnum(MyEyesIDJwtTokenKeyType),
  action: z.union([z.literal('create'), z.literal('edit')]),
});
