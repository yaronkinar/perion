import { computed } from 'vue';
import { roleBadgeVariant } from '@/constants/roles';
import { COPY } from '@/constants/messages';
import type { Role } from '@/types/role.types';

export function useRoleCard(props: { role: Role }) {
  const variant = computed(() => roleBadgeVariant(props.role.name));
  const permissionsLabel = computed<string>(() =>
    COPY.permissionsCount(props.role.permissions.length),
  );
  return { variant, permissionsLabel };
}
