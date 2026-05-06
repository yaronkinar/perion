import { computed, type ComputedRef } from 'vue';

export interface BaseInputResolvedProps {
  id?: string;
  error?: string;
}

export function useBaseInput(props: BaseInputResolvedProps): {
  inputId: ComputedRef<string>;
  inputClasses: ComputedRef<string[]>;
} {
  const inputId = computed<string>(
    () => props.id ?? `input-${Math.random().toString(36).slice(2, 9)}`,
  );

  const inputClasses = computed<string[]>(() => {
    const base = [
      'block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm',
      'focus:outline-none focus:ring-2',
      'disabled:cursor-not-allowed disabled:bg-slate-100',
    ];
    if (props.error) {
      base.push(
        'border-rose-400 focus:border-rose-500 focus:ring-rose-200 text-rose-900 placeholder-rose-300',
      );
    } else {
      base.push(
        'border-slate-300 focus:border-brand-500 focus:ring-brand-200 text-slate-900 placeholder-slate-400',
      );
    }
    return base;
  });

  return { inputId, inputClasses };
}
