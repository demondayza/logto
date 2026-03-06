import { type SsrData } from '@myeyesid/schemas';

type MyEyesIDNativeSdkInfo = {
  platform: 'ios' | 'android';
  callbackLink: string;
  getPostMessage: () => (data: { callbackUri?: string; redirectTo?: string }) => void;
  supportedConnector: {
    universal: boolean;
    nativeTargets: string[];
  };
};

type MyEyesIDSsr = string | Readonly<SsrData> | undefined;

declare global {
  const myeyesidNativeSdk: MyEyesIDNativeSdkInfo | undefined;
  const myeyesidSsr: MyEyesIDSsr;

  interface Window {
    myeyesidNativeSdk: MyEyesIDNativeSdkInfo | undefined;
    myeyesidSsr: MyEyesIDSsr;

    // Captcha providers
    grecaptcha?: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (sitekey: string, options: { action: string }) => Promise<string>;
        render: (
          element: HTMLElement,
          options: {
            sitekey: string;
            callback: (token: string) => void;
            theme?: 'light' | 'dark';
            'error-callback'?: (errorCode?: string) => void;
          }
        ) => number;
      };
    };
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          theme: 'light' | 'dark';
          'error-callback': (errorCode: string) => void;
          size: string;
        }
      ) => void;
    };
  }
}
