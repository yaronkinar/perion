import { computed, type ComputedRef } from 'vue';
import type { BadgeVariant } from './BaseBadge.types';

export interface BaseBadgeResolvedProps {
  variant: BadgeVariant;
  size: 'sm' | 'md';
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  inactive: 'bg-slate-100 text-slate-500 ring-slate-200',
  admin: 'bg-brand-50 text-brand-700 ring-brand-200',
  editor: 'bg-amber-50 text-amber-700 ring-amber-200',
  viewer: 'bg-slate-100 text-slate-600 ring-slate-200',
  permission: 'bg-violet-50 text-violet-700 ring-violet-200',
};

const SIZE_CLASSES: Record<NonNullable<BaseBadgeResolvedProps['size']>, string> =
  {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

export function useBaseBadge(props: BaseBadgeResolvedProps): {
  classes: ComputedRef<string[]>;
} {
  const classes = computed<string[]>(() => [
    'inline-flex items-center rounded-full font-medium ring-1 ring-inset',
    VARIANT_CLASSES[props.variant],
    SIZE_CLASSES[props.size],
  ]);

  return { classes };
}
