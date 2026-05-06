import { computed, type ComputedRef } from 'vue';
import type {
  ButtonSize,
  ButtonVariant,
} from './BaseButton.types';

export interface BaseButtonPropsReadonly {
  readonly variant: ButtonVariant;
  readonly size: ButtonSize;
  readonly disabled: boolean;
  readonly loading: boolean;
  readonly block: boolean;
}

export function useBaseButton(props: BaseButtonPropsReadonly): {
  classes: ComputedRef<string[]>;
  isDisabled: ComputedRef<boolean>;
} {
  const classes = computed<string[]>(() => {
    const base = [
      'inline-flex items-center justify-center gap-2 rounded-md font-medium',
      'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ];

    const sizeMap: Record<ButtonSize, string> = {
      sm: 'px-2.5 py-1 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    };

    const variantMap: Record<ButtonVariant, string> = {
      default:
        'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 focus-visible:ring-slate-500',
      primary:
        'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-600',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
    };

    return [
      ...base,
      sizeMap[props.size],
      variantMap[props.variant],
      props.block ? 'w-full' : '',
    ];
  });

  const isDisabled = computed<boolean>(
    () => props.disabled || props.loading,
  );

  return { classes, isDisabled };
}
