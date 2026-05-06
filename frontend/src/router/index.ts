import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouteRecordRaw,
  type Router,
} from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTE_NAMES } from '@/constants/messages';
import type { PermissionAction } from '@/types/permission.types';

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean;
    requireAny?: readonly PermissionAction[];
  }
}

const ROUTE_PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  FORBIDDEN: '/forbidden',
  NOT_FOUND: '/not-found',
  WILDCARD: '/:pathMatch(.*)*',
} as const;

const LoginPage = () => import('@/pages/LoginPage.vue');
const DashboardPage = () => import('@/pages/DashboardPage.vue');
const ForbiddenPage = () => import('@/pages/ForbiddenPage.vue');
const NotFoundPage = () => import('@/pages/NotFoundPage.vue');

const routes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.ROOT,
    redirect: () => ({ name: ROUTE_NAMES.DASHBOARD }),
  },
  {
    path: ROUTE_PATHS.LOGIN,
    name: ROUTE_NAMES.LOGIN,
    component: LoginPage,
    meta: { public: true },
  },
  {
    path: ROUTE_PATHS.DASHBOARD,
    name: ROUTE_NAMES.DASHBOARD,
    component: DashboardPage,
    meta: { public: false, requireAny: ['view_users', 'view_roles'] },
  },
  {
    path: ROUTE_PATHS.FORBIDDEN,
    name: ROUTE_NAMES.FORBIDDEN,
    component: ForbiddenPage,
    meta: { public: true },
  },
  {
    path: ROUTE_PATHS.NOT_FOUND,
    name: ROUTE_NAMES.NOT_FOUND,
    component: NotFoundPage,
    meta: { public: true },
  },
  {
    path: ROUTE_PATHS.WILDCARD,
    redirect: () => ({ name: ROUTE_NAMES.NOT_FOUND }),
  },
];

const router: Router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(
  async (to: RouteLocationNormalized): Promise<boolean | { name: string }> => {
    const auth = useAuthStore();
    if (!auth.initialized) {
      await auth.fetchMe();
    }

    if (!to.meta.public && !auth.isAuthenticated) {
      return { name: ROUTE_NAMES.LOGIN };
    }

    if (to.name === ROUTE_NAMES.LOGIN && auth.isAuthenticated) {
      return { name: ROUTE_NAMES.DASHBOARD };
    }

    const required = to.meta.requireAny;
    if (required && required.length > 0 && auth.isAuthenticated) {
      const has = required.some((p) => auth.permissions.includes(p));
      if (!has) {
        return { name: ROUTE_NAMES.FORBIDDEN };
      }
    }

    return true;
  },
);

export default router;
