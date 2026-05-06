import { cloneVNode, computed, useSlots, type VNode } from 'vue';
import { usePermission } from '@/composables/usePermission';
import type { PermissionAction } from '@/types/permission.types';

export type GuardMode = 'hide' | 'disable';

export interface PermissionGuardResolvedProps {
  action: PermissionAction;
}

export function usePermissionGuard(props: PermissionGuardResolvedProps) {
  const { can } = usePermission();
  const slots = useSlots();

  const allowed = computed<boolean>(() => can(props.action));

  function getSlotNodes(): VNode[] {
    const renderFn = slots.default;
    if (!renderFn) return [];
    return renderFn().filter((vnode): vnode is VNode => vnode != null);
  }

  function renderDisabled(): VNode[] {
    return getSlotNodes().map((vnode) => {
      const vnodeProps: Record<string, unknown> = { disabled: true };
      return cloneVNode(vnode, vnodeProps);
    });
  }

  return { allowed, renderDisabled };
}
