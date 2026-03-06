import type { AdminConsoleKey } from '@myeyesid/phrases';
import { ForgotPasswordMethod } from '@myeyesid/schemas';

type ForgotPasswordMethodPhrase = {
  [key in ForgotPasswordMethod]: AdminConsoleKey;
};

export const forgotPasswordMethodPhrase = Object.freeze({
  [ForgotPasswordMethod.EmailVerificationCode]:
    'sign_in_exp.sign_up_and_sign_in.sign_in.email_verification_code',
  [ForgotPasswordMethod.PhoneVerificationCode]:
    'sign_in_exp.sign_up_and_sign_in.sign_in.phone_verification_code',
}) satisfies ForgotPasswordMethodPhrase;
