import { type ProtectedAppMetadata } from '@myeyesid/schemas';

export const defaultProtectedAppSessionDuration: ProtectedAppMetadata['sessionDuration'] =
  60 * 60 * 24 * 14; // 14 days

export const defaultProtectedAppPageRules: ProtectedAppMetadata['pageRules'] = [];
