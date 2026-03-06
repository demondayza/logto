import { useHandleSignInCallback, useMyEyesID } from '@myeyesid/react';
import { useEffect } from 'react';

const Callback = () => {
  const { clearAllTokens } = useMyEyesID();

  useEffect(() => {
    void clearAllTokens();
  }, [clearAllTokens]);

  const { error } = useHandleSignInCallback(() => {
    window.location.assign('/demo-app');
  });

  if (error) {
    return (
      <div>
        Error Occurred:
        <br />
        {error.message}
      </div>
    );
  }

  return <div>Loading...</div>;
};

export default Callback;
