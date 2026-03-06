import type { Role } from '@myeyesid/schemas';

export type RoleDetailsOutletContext = {
  role: Role;
  isDeleting: boolean;
  onRoleUpdated: (role: Role) => void;
};
