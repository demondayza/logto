import { createComponent } from '@lit/react';

import { MyEyesIDUsername } from './elements/myeyesid-username.js';
import {
  MyEyesIDAccountCenter,
  MyEyesIDAccountProvider,
  MyEyesIDSocialIdentity,
  MyEyesIDUserEmail,
  MyEyesIDUserPassword,
  MyEyesIDUserPhone,
} from './index.js';

export * from './api/index.js';

export const createReactComponents = (react: Parameters<typeof createComponent>[0]['react']) => {
  return {
    MyEyesIDAccountProvider: createComponent({
      tagName: MyEyesIDAccountProvider.tagName,
      elementClass: MyEyesIDAccountProvider,
      react,
    }),
    MyEyesIDUsername: createComponent({
      tagName: MyEyesIDUsername.tagName,
      elementClass: MyEyesIDUsername,
      react,
    }),
    MyEyesIDUserEmail: createComponent({
      tagName: MyEyesIDUserEmail.tagName,
      elementClass: MyEyesIDUserEmail,
      react,
    }),
    MyEyesIDUserPassword: createComponent({
      tagName: MyEyesIDUserPassword.tagName,
      elementClass: MyEyesIDUserPassword,
      react,
    }),
    MyEyesIDUserPhone: createComponent({
      tagName: MyEyesIDUserPhone.tagName,
      elementClass: MyEyesIDUserPhone,
      react,
    }),
    MyEyesIDSocialIdentity: createComponent({
      tagName: MyEyesIDSocialIdentity.tagName,
      elementClass: MyEyesIDSocialIdentity,
      react,
    }),
    MyEyesIDAccountCenter: createComponent({
      tagName: MyEyesIDAccountCenter.tagName,
      elementClass: MyEyesIDAccountCenter,
      react,
    }),
  };
};
