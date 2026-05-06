import { COPY } from '@/constants/messages';

export function useRolesList(): {
  loadingText: string;
  emptyText: string;
} {
  return {
    loadingText: COPY.loadingRoles,
    emptyText: COPY.noRolesFound,
  };
}
