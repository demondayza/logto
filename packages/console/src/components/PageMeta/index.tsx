import type { AdminConsoleKey } from '@myeyesid/phrases';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

type Props = {
  readonly titleKey: AdminConsoleKey | AdminConsoleKey[];
};

function PageMeta({ titleKey }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const keys = typeof titleKey === 'string' ? [titleKey] : titleKey;
  const title = keys.map((key) => t(key)).join(' - ');

  return <Helmet title={title} />;
}

export default PageMeta;
