import { computed, type ComputedRef } from 'vue';
import type { SelectOption } from './BaseSelect.types';

export interface BaseSelectResolvedProps<T extends string | number> {
  id?: string;
  error?: string;
  options: SelectOption<T>[];
}

export function useBaseSelect<T extends string | number>(
  props: BaseSelectResolvedProps<T>,
): {
  selectId: ComputedRef<string>;
  selectClasses: ComputedRef<string[]>;
  castValue: (raw: string) => T | null;
} {
  const selectId = computed<string>(
    () => props.id ?? `select-${Math.random().toString(36).slice(2, 9)}`,
  );

  const selectClasses = computed<string[]>(() => {
    const base = [
      'block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm',
      'focus:outline-none focus:ring-2',
      'disabled:cursor-not-allowed disabled:bg-slate-100',
    ];
    if (props.error) {
      base.push(
        'border-rose-400 focus:border-rose-500 focus:ring-rose-200 text-rose-900',
      );
    } else {
      base.push(
        'border-slate-300 focus:border-brand-500 focus:ring-brand-200 text-slate-900',
      );
    }
    return base;
  });

  function castValue(raw: string): T | null {
    if (raw === '') return null;
    if (props.options.length > 0 && typeof props.options[0].value === 'number') {
      const num = Number(raw);
      return (Number.isNaN(num) ? null : (num as T));
    }
    return raw as T;
  }

  return { selectId, selectClasses, castValue };
}
