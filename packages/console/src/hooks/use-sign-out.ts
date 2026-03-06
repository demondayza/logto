import { useMyEyesID } from '@myeyesid/react';
import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

/**
 * A hook that returns a wrapped `signOut` function from `useMyEyesID` with necessary cleanup logic.
 *
 * Unless you have special needs, you should always use this hook instead of `useMyEyesID` directly.
 */
const useSignOut = () => {
  const { signOut: myeyesidSignOut } = useMyEyesID();
  const postHog = usePostHog();

  const signOut = useCallback<ReturnType<typeof useMyEyesID>['signOut']>(
    async (postSignOutRedirectUri) => {
      postHog.resetGroups(); // Not sure if this is needed, but just in case.
      postHog.reset();
      return myeyesidSignOut(postSignOutRedirectUri);
    },
    [myeyesidSignOut, postHog]
  );
  return {
    /** A wrapped version of `useMyEyesID`'s `signOut` with necessary cleanup logic. */
    signOut,
  };
};

export default useSignOut;
