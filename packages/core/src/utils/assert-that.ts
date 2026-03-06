import type { MyEyesIDErrorCode } from '@myeyesid/phrases';
import { assert } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';

type AssertThatFunction = {
  <E extends Error>(value: unknown, error: E): asserts value;
  (value: unknown, error: MyEyesIDErrorCode, status?: number): asserts value;
};

const assertThat: AssertThatFunction = <E extends Error>(
  value: unknown,
  error: E | MyEyesIDErrorCode,
  status?: number
): asserts value => {
  assert(value, error instanceof Error ? error : new RequestError({ code: error, status }));
};

export default assertThat;
