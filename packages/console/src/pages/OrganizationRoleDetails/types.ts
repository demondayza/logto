import { type OrganizationRole } from '@myeyesid/schemas';

export type OrganizationRoleDetailsOutletContext = {
  organizationRole: OrganizationRole;
  isDeleting: boolean;
  onOrganizationRoleUpdated: (organizationRole: OrganizationRole) => void;
};
