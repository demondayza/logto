import { ApplicationType } from '@myeyesid/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'WordPress plugin',
  description: 'Use official WordPress plugin to integrate MyEyesID into your WordPress website.',
  target: ApplicationType.Traditional,
  fullGuide: 'wordpress-plugin',
});

export default metadata;
