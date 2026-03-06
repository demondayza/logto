/**
 * Native SDK Utility Methods
 */
export const getMyEyesIDNativeSdk = () => {
  if (typeof myeyesidNativeSdk !== 'undefined') {
    return myeyesidNativeSdk;
  }
};

export const isNativeWebview = () => {
  const platform = getMyEyesIDNativeSdk()?.platform ?? '';

  return ['ios', 'android'].includes(platform);
};
