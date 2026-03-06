import type { LanguageTag } from '@myeyesid/language-kit';
import type { Translation } from '@myeyesid/schemas';

export type CustomPhraseResponse = {
  languageTag: LanguageTag;
  translation: Translation;
};
