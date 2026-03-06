import { myeyesidUiCookieGuard, myeyesidCookieKey } from '@myeyesid/schemas';
import { trySafe } from '@silverhand/essentials';
import { type Context } from 'koa';

export const getMyEyesIDCookie = (ctx: Context) =>
  trySafe(() => myeyesidUiCookieGuard.parse(JSON.parse(ctx.cookies.get(myeyesidCookieKey) ?? '{}'))) ??
  {};
