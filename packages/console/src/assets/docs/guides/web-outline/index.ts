import { ApplicationType } from '@myeyesid/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Outline',
  description: 'Use MyEyesID as an identity provider for Outline',
  target: ApplicationType.Traditional,
});

export default metadata;
