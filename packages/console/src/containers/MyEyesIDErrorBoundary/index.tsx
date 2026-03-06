import { useMyEyesID } from '@myeyesid/react';
import { useEffect } from 'react';

/**
 * This component keep children as is, but throw error if there is any error from MyEyesID
 * (`useMyEyesID()`). The error should be handled by the upper `<ErrorBoundary />`.
 */
export default function MyEyesIDErrorBoundary({ children }: { children: JSX.Element }) {
  const { error } = useMyEyesID();

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return children;
}
