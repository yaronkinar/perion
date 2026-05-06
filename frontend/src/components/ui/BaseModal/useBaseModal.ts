import { onBeforeUnmount, ref, watch, type Ref } from 'vue';

export interface BaseModalResolvedProps {
  open: boolean;
  closeOnBackdrop: boolean;
}

export type BaseModalEmit = (event: 'close') => void;

export const BASE_MODAL_SIZE_CLASS_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const;

export type ModalSize = keyof typeof BASE_MODAL_SIZE_CLASS_MAP;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let titleIdCounter = 0;
function nextTitleId(): string {
  titleIdCounter += 1;
  return `base-modal-title-${titleIdCounter}`;
}

export function useBaseModal(
  props: BaseModalResolvedProps,
  emit: BaseModalEmit,
): {
  panelRef: Ref<HTMLElement | null>;
  titleId: string;
  handleBackdropClick: () => void;
  handleKeydown: (e: KeyboardEvent) => void;
  sizeClassMap: typeof BASE_MODAL_SIZE_CLASS_MAP;
} {
  const panelRef = ref<HTMLElement | null>(null);
  const titleId = nextTitleId();
  let previouslyFocused: HTMLElement | null = null;

  function handleBackdropClick(): void {
    if (props.closeOnBackdrop) {
      emit('close');
    }
  }

  function getFocusableElements(): HTMLElement[] {
    if (!panelRef.value) return [];
    return Array.from(
      panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((el) => !el.hasAttribute('aria-hidden'));
  }

  function focusFirstElement(): void {
    const focusables = getFocusableElements();
    const target = focusables[0] ?? panelRef.value;
    target?.focus();
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (!props.open) return;

    if (e.key === 'Escape') {
      emit('close');
      return;
    }

    if (e.key !== 'Tab') return;

    const focusables = getFocusableElements();
    if (focusables.length === 0) {
      e.preventDefault();
      panelRef.value?.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey && (active === first || !panelRef.value?.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function cleanupDom(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('keydown', handleKeydown);
    document.body.style.overflow = '';
  }

  watch(
    () => props.open,
    (open) => {
      if (typeof window === 'undefined') return;
      if (open) {
        previouslyFocused = document.activeElement as HTMLElement | null;
        window.addEventListener('keydown', handleKeydown);
        document.body.style.overflow = 'hidden';
        // Defer focus until the panel is rendered.
        queueMicrotask(() => focusFirstElement());
      } else {
        window.removeEventListener('keydown', handleKeydown);
        document.body.style.overflow = '';
        previouslyFocused?.focus?.();
        previouslyFocused = null;
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    cleanupDom();
  });

  return {
    panelRef,
    titleId,
    handleBackdropClick,
    handleKeydown,
    sizeClassMap: BASE_MODAL_SIZE_CLASS_MAP,
  };
}
