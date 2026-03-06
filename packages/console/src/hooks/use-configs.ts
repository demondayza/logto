import { useMyEyesID } from '@myeyesid/react';
import type { AdminConsoleData } from '@myeyesid/schemas';
import useSWR from 'swr';

import type { RequestError } from './use-api';
import useApi from './use-api';

const useConfigs = () => {
  const { isAuthenticated, error: authError } = useMyEyesID();
  const shouldFetch = isAuthenticated && !authError;
  const {
    data: configs,
    error,
    mutate,
  } = useSWR<AdminConsoleData, RequestError>(shouldFetch && 'api/configs/admin-console');
  const api = useApi();

  const updateConfigs = async (json: Partial<AdminConsoleData>) => {
    const updatedConfigs = await api
      .patch('api/configs/admin-console', {
        json,
      })
      .json<AdminConsoleData>();
    void mutate(updatedConfigs);
  };

  return {
    isLoading: !configs && !error,
    configs,
    error,
    mutate,
    updateConfigs,
  };
};

export default useConfigs;
