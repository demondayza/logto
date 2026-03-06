import { z } from 'zod';

import { type ToZodObject } from '../utils/zod.js';

export type MyEyesIDUiCookie = Partial<{
  appId: string;
  organizationId: string;
  uiLocales: string;
}>;

export const myeyesidUiCookieGuard = z
  .object({ appId: z.string(), organizationId: z.string(), uiLocales: z.string() })
  .partial() satisfies ToZodObject<MyEyesIDUiCookie>;
