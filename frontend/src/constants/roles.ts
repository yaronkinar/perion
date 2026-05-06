import type { BadgeVariant } from '@/components/ui/BaseBadge/BaseBadge.types';
import type { RoleName } from '@/types/role.types';

export const ROLE_NAMES: Record<RoleName, RoleName> = {
  Admin: 'Admin',
  Editor: 'Editor',
  Viewer: 'Viewer',
} as const;

export type RoleBadgeVariant = Extract<
  BadgeVariant,
  'admin' | 'editor' | 'viewer' | 'neutral'
>;

const ROLE_BADGE_VARIANTS: Record<RoleName, RoleBadgeVariant> = {
  Admin: 'admin',
  Editor: 'editor',
  Viewer: 'viewer',
};

export function roleBadgeVariant(
  name: string | undefined,
): RoleBadgeVariant {
  if (name && name in ROLE_BADGE_VARIANTS) {
    return ROLE_BADGE_VARIANTS[name as RoleName];
  }
  return 'neutral';
}
