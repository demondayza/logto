import { useMyEyesID } from '@myeyesid/react';
import type { ReactElement } from 'react';
import { useEffect } from 'react';

/**
 * Keep children untouched but throw MyEyesID errors so upper error boundary can handle them.
 */
const MyEyesIDErrorBoundary = ({ children }: { readonly children: ReactElement }) => {
  const { error } = useMyEyesID();

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return children;
};

export default MyEyesIDErrorBoundary;
