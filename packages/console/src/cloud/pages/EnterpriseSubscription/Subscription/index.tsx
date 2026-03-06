import { type ResponseError } from '@withtyped/client';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type MyEyesIDEnterpriseSubscriptionResponse } from '@/cloud/types/router';
import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import CardTitle from '@/ds-components/CardTitle';
import FormField from '@/ds-components/FormField';

import AddOnTable from './AddOnTable';
import BillInfo from './BillInfo';
import SubscriptionPlanTable from './SubscriptionPlanTable';
import styles from './index.module.scss';

function Subscription() {
  const { myeyesidEnterpriseId = '' } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const cloudApi = useCloudApi();

  const { data, isLoading } = useSWR<MyEyesIDEnterpriseSubscriptionResponse, ResponseError>(
    myeyesidEnterpriseId && `/api/me/myeyesid-enterprises/${myeyesidEnterpriseId}`,
    async () =>
      cloudApi.get(`/api/me/myeyesid-enterprises/:id`, {
        params: { id: myeyesidEnterpriseId },
        search: {
          includeSharedQuota: 'true',
          includeSkuItems: 'true',
          includeUsages: 'true',
        },
      }),
    {
      // This request will query real-time subscription usages,
      // cross tenants, relatively expensive, so we set a 30s deduping interval,
      // to avoid too frequent requests
      dedupingInterval: 30_000,
    }
  );

  const upcomingBill = useMemo(() => {
    return data?.subscription?.upcomingInvoice?.subtotal ?? 0;
  }, [data?.subscription?.upcomingInvoice?.subtotal]);

  return (
    <div className={styles.container}>
      <PageMeta
        titleKey={[
          'enterprise_subscription.page_title',
          'enterprise_subscription.subscription.title',
        ]}
      />
      <FormCard
        title="enterprise_subscription.subscription.title"
        description="enterprise_subscription.subscription.description"
      >
        <CardTitle title="enterprise_subscription.subscription.enterprise_plan_title" />
        <div className={styles.description}>
          {t('enterprise_subscription.subscription.enterprise_plan_description')}
        </div>
        <SubscriptionPlanTable data={data} isLoading={isLoading} />
        {data?.subscriptionSkuItems && (
          <AddOnTable skuItems={data.subscriptionSkuItems} quotaScope={data.quotaScope} />
        )}
        {data?.subscription && (
          <FormField title="subscription.next_bill">
            <BillInfo cost={upcomingBill} myeyesidEnterpriseId={myeyesidEnterpriseId} />
          </FormField>
        )}
      </FormCard>
    </div>
  );
}

export default Subscription;
