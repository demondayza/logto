// https://react.i18next.com/latest/typescript#create-a-declaration-file

import type { LocalePhrase } from '@myeyesid/phrases-experience';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: LocalePhrase;
  }
}
