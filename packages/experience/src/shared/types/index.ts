import { type FullSignInExperience } from '@myeyesid/schemas';

export type SignInExperienceResponse = Omit<FullSignInExperience, 'socialSignInConnectorTargets'>;

export type Platform = 'web' | 'mobile';
