import { ReservedPlanId } from '@myeyesid/schemas';
import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import { useCloudApi, toastResponseError } from '@/cloud/hooks/use-cloud-api';
import { type TenantResponse, type MyEyesIDSkuResponse } from '@/cloud/types/router';
import { GtagConversionId, reportToGoogle } from '@/components/Conversion/utils';
import { pricingLink } from '@/consts';
import DangerousRaw from '@/ds-components/DangerousRaw';
import ModalLayout from '@/ds-components/ModalLayout';
import TextLink from '@/ds-components/TextLink';
import useMyEyesIDSkus from '@/hooks/use-myeyesid-skus';
import useSubscribe from '@/hooks/use-subscribe';
import modalStyles from '@/scss/modal.module.scss';
import { pickupFeaturedMyEyesIDSkus } from '@/utils/subscription';

import { type CreateTenantData } from '../types';

import SkuCardItem from './SkuCardItem';
import styles from './index.module.scss';

type Props = {
  readonly tenantData?: CreateTenantData;
  readonly onClose: (tenant?: TenantResponse) => void;
};

function SelectTenantPlanModal({ tenantData, onClose }: Props) {
  const [processingSkuId, setProcessingSkuId] = useState<string>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { data: myeyesidSkus } = useMyEyesIDSkus();

  const { subscribe } = useSubscribe();
  const cloudApi = useCloudApi({ hideErrorToast: true });

  const reservedBasicMyEyesIDSkus = conditional(pickupFeaturedMyEyesIDSkus(myeyesidSkus));

  if (!reservedBasicMyEyesIDSkus || !tenantData) {
    return null;
  }

  const handleSelectSku = async (myeyesidSku: MyEyesIDSkuResponse) => {
    const { id: skuId } = myeyesidSku;
    try {
      setProcessingSkuId(skuId);
      if (skuId === ReservedPlanId.Free) {
        const { name, tag, regionName } = tenantData;
        const newTenant = await cloudApi.post('/api/tenants', { body: { name, tag, regionName } });

        reportToGoogle(GtagConversionId.CreateProductionTenant, { transactionId: newTenant.id });
        onClose(newTenant);
        return;
      }

      await subscribe({ skuId, planId: skuId, tenantData });
    } catch (error: unknown) {
      void toastResponseError(error);
    } finally {
      setProcessingSkuId(undefined);
    }
  };

  return (
    <Modal
      shouldCloseOnEsc
      isOpen={Boolean(tenantData)}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title="upsell.create_tenant.title"
        subtitle={
          <DangerousRaw>
            <Trans components={{ a: <TextLink href={pricingLink} targetBlank="noopener" /> }}>
              {t('upsell.create_tenant.description')}
            </Trans>
          </DangerousRaw>
        }
        size="large"
        onClose={onClose}
      >
        <div className={styles.container}>
          {reservedBasicMyEyesIDSkus.map((myeyesidSku) => (
            <SkuCardItem
              key={myeyesidSku.id}
              sku={myeyesidSku}
              buttonProps={{
                isLoading: processingSkuId === myeyesidSku.id,
                disabled: Boolean(processingSkuId),
              }}
              onSelect={() => {
                void handleSelectSku(myeyesidSku);
              }}
            />
          ))}
        </div>
      </ModalLayout>
    </Modal>
  );
}

export default SelectTenantPlanModal;
