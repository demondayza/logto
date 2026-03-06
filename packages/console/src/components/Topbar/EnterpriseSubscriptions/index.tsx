import classNames from 'classnames';
import useSWR from 'swr';

import CardIcon from '@/assets/icons/card.svg?react';
import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type MyEyesIDEnterpriseResponse } from '@/cloud/types/router';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import TextLink from '@/ds-components/TextLink';

import styles from '../index.module.scss';

type Props = {
  readonly className?: string;
};

function EnterpriseSubscriptions({ className }: Props) {
  const cloudApi = useCloudApi();

  const { data } = useSWR<{ myeyesidEnterprises: MyEyesIDEnterpriseResponse[] }, Error>(
    '/api/me/myeyesid-enterprises',
    async () => cloudApi.get('/api/me/myeyesid-enterprises')
  );

  if (!data || data.myeyesidEnterprises.length === 0) {
    return null;
  }

  // Currently only support one enterprise subscription per user
  // If there are multiple, consider adding a dropdown selector in the future
  const defaultEnterpriseSubscription = data.myeyesidEnterprises[0];

  if (!defaultEnterpriseSubscription) {
    return null;
  }

  return (
    <TextLink
      className={classNames(styles.button, className)}
      icon={<CardIcon className={styles.icon} />}
      onClick={() => {
        window.open(`${GlobalRoute.EnterpriseSubscription}/${defaultEnterpriseSubscription.id}`);
      }}
    >
      <DynamicT forKey="topbar.subscription" />
    </TextLink>
  );
}

export default EnterpriseSubscriptions;
