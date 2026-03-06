import { myeyesidGoogleOneTapCookieKey } from '@myeyesid/connector-kit';
import { adminConsoleApplicationId, myeyesidCookieKey, myeyesidUiCookieGuard } from '@myeyesid/schemas';
import { trySafe } from '@silverhand/essentials';
import { getCookie } from 'tiny-cookie';

export const myeyesidCookies =
  trySafe(() => myeyesidUiCookieGuard.parse(getCookie(myeyesidCookieKey, JSON.parse))) ?? {};

export const shouldTrack = myeyesidCookies.appId === adminConsoleApplicationId;

export const myeyesidGoogleOneTapCookie =
  trySafe(() => {
    const cookieValue = getCookie(myeyesidGoogleOneTapCookieKey);
    return cookieValue ?? null;
  }) ?? null;
