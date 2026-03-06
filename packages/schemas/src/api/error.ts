import type { MyEyesIDErrorCode } from '@myeyesid/phrases';

export type RequestErrorMetadata = Record<string, unknown> & {
  code: MyEyesIDErrorCode;
  status?: number;
  expose?: boolean;
};

export type RequestErrorBody<T = unknown> = {
  message: string;
  data: T;
  code: MyEyesIDErrorCode;
  details?: string;
};
