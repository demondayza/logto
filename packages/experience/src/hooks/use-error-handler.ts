import type { MyEyesIDErrorCode } from '@myeyesid/phrases';
import type { RequestErrorBody } from '@myeyesid/schemas';
import { HTTPError, TimeoutError } from 'ky';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import useToast from './use-toast';

export type ErrorHandlers = {
  [key in MyEyesIDErrorCode]?: (error: RequestErrorBody) => void | Promise<void>;
} & {
  // Overwrite default global error handle logic
  global?: (error: RequestErrorBody) => void | Promise<void>;
};

const useErrorHandler = () => {
  const { t } = useTranslation();
  const { setToast } = useToast();

  const handleError = useCallback(
    async (error: unknown, errorHandlers?: ErrorHandlers) => {
      if (error instanceof HTTPError) {
        try {
          const myeyesidError = await error.response.json<RequestErrorBody>();

          const { code, message } = myeyesidError;

          const handler = errorHandlers?.[code] ?? errorHandlers?.global;

          if (handler) {
            await handler(myeyesidError);
          } else {
            setToast(message);
          }

          return;
        } catch (error) {
          setToast(t('error.unknown'));
          console.error(error);

          return;
        }
      }

      if (error instanceof TimeoutError) {
        setToast(t('error.timeout'));

        return;
      }

      setToast(t('error.unknown'));
      console.error(error);
    },
    [setToast, t]
  );

  return handleError;
};

export default useErrorHandler;
