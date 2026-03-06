import type { CustomClientMetadata } from '@myeyesid/schemas';

declare module 'oidc-provider' {
  export interface AllClientMetadata extends CustomClientMetadata {}

  export interface Configuration {
    allowWildcardRedirectUris?: boolean;
  }
}
