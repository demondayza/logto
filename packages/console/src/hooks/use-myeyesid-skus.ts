import { type Optional } from '@silverhand/essentials';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type MyEyesIDSkuResponse } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';
// Used in the docs
// eslint-disable-next-line unused-imports/no-unused-imports
import TenantAccess from '@/containers/TenantAccess';
// eslint-disable-next-line unused-imports/no-unused-imports -- for jsDoc use
import type { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { MyEyesIDSkuType } from '@/types/skus';
import { formatMyEyesIDSkusResponses } from '@/utils/subscription';

/**
 * Fetch public MyEyesID SKUs from the cloud API.
 *
 * @remarks
 * Note: This hook is used for retrieving public available MyEyesID SKUs for all the users.
 * If you want to retrieve tenant specific available MyEyesID SKUs under the {@link TenantAccess} component,
 * e.g. For enterprise tenant who have their own private SKUs, and all grandfathered plan tenants,
 * use the myeyesidSkus from the {@link SubscriptionDataContext} instead.
 */
const useMyEyesIDSkus = () => {
  const cloudApi = useCloudApi();

  const useSwrResponse = useSWRImmutable<MyEyesIDSkuResponse[], Error>(
    isCloud && '/api/skus',
    async () =>
      cloudApi.get('/api/skus', {
        search: { type: MyEyesIDSkuType.Basic },
      })
  );

  const { data: myeyesidSkuResponse } = useSwrResponse;

  const myeyesidSkus: Optional<MyEyesIDSkuResponse[]> = useMemo(
    () => formatMyEyesIDSkusResponses(myeyesidSkuResponse),
    [myeyesidSkuResponse]
  );

  return {
    ...useSwrResponse,
    data: myeyesidSkus,
  };
};

export default useMyEyesIDSkus;
