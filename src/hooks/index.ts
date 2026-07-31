/**
 * Hooks — Barrel Export
 * ======================
 * All custom React hooks exported from one location.
 * TanStack Query v5 API — onSuccess/onError removed from useMutation options.
 */
export * from './useDebounce';
export * from './useMediaQuery';
export * from './useLocalStorage';
export * from './useIntersectionObserver';
export * from './useVirtualScroll';
export * from './useNetworkStatus';

// ── TanStack Query hooks (from main hooks file) ───────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { esimService } from '@/services/esim.service';
import { plansService, countriesService } from '@/services/plans.service';
import { ordersService } from '@/services/orders.service';
import { userService } from '@/services/user.service';
import { QUERY_KEYS } from '@/constants';
import type { LoginCredentials, RegisterCredentials, PlanFilters } from '@/types';

// ── Auth ──────────────────────────────────────────────────────
export function useLogin() {
  return useMutation({ mutationFn: (creds: LoginCredentials) => authService.login(creds) });
}

export function useRegister() {
  return useMutation({ mutationFn: (creds: RegisterCredentials) => authService.register(creds) });
}

export function useLogout() {
  return useMutation({ mutationFn: () => authService.logout() });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.USER,
    queryFn: () => authService.getMe(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// ── ESIMs ─────────────────────────────────────────────────────
export function useESIMs() {
  return useQuery({ queryKey: QUERY_KEYS.ESIMS, queryFn: () => esimService.getAll() });
}

export function useESIM(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ESIMS, id],
    queryFn: () => esimService.getById(id),
    enabled: !!id,
  });
}

// ── Plans ─────────────────────────────────────────────────────
export function usePlans(filters?: PlanFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PLANS, filters],
    queryFn: () => plansService.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PLANS, id],
    queryFn: () => plansService.getById(id),
    enabled: !!id,
  });
}

// ── Countries ─────────────────────────────────────────────────
export function useCountries() {
  return useQuery({
    queryKey: QUERY_KEYS.COUNTRIES,
    queryFn: () => countriesService.getAll(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCountry(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.COUNTRIES, id],
    queryFn: () => countriesService.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

// ── Orders ────────────────────────────────────────────────────
export function useOrders() {
  return useQuery({ queryKey: QUERY_KEYS.ORDERS, queryFn: () => ordersService.getAll() });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { planId: string; couponCode?: string; paymentMethodId: string }) =>
      ordersService.create(payload),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESIMS });
    },
  });
}

export function useApplyCoupon() {
  return useMutation({
    mutationFn: ({ couponCode, planId }: { couponCode: string; planId: string }) =>
      ordersService.applyCoupon(couponCode, planId),
  });
}

// ── User data ─────────────────────────────────────────────────
export function useAnalytics() {
  return useQuery({ queryKey: QUERY_KEYS.ANALYTICS, queryFn: () => userService.getAnalytics() });
}

export function useNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS,
    queryFn: () => userService.getNotifications(),
    refetchInterval: 60_000,
  });
}

export function useSupportTickets() {
  return useQuery({
    queryKey: QUERY_KEYS.SUPPORT_TICKETS,
    queryFn: () => userService.getSupportTickets(),
  });
}

export function useReferral() {
  return useQuery({ queryKey: QUERY_KEYS.REFERRAL, queryFn: () => userService.getReferralData() });
}

export function useRewards() {
  return useQuery({ queryKey: QUERY_KEYS.REWARDS, queryFn: () => userService.getRewardData() });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: QUERY_KEYS.PAYMENT_METHODS,
    queryFn: () => userService.getPaymentMethods(),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userService.updateProfile,
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.USER }),
  });
}

export function useActivityLog() {
  return useQuery({ queryKey: ['activity-log'], queryFn: () => userService.getActivityLog() });
}

export function useActiveSessions() {
  return useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => userService.getActiveSessions(),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (p: { currentPassword: string; newPassword: string }) =>
      userService.changePassword(p),
  });
}

export function useDeleteAccount() {
  return useMutation({ mutationFn: () => userService.deleteAccount() });
}

export function useExportData() {
  return useMutation({ mutationFn: () => userService.exportData() });
}

export function useAddPaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { token: string; type: string }) => userService.addPaymentMethod(p),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENT_METHODS }),
  });
}

export function useRemovePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.removePaymentMethod(id),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENT_METHODS }),
  });
}

export function useSettings() {
  return useQuery({ queryKey: ['user-settings'], queryFn: () => userService.getSettings() });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Record<string, unknown>) => userService.updateSettings(p),
    onSettled: () => qc.invalidateQueries({ queryKey: ['user-settings'] }),
  });
}

export function useKnowledgeBaseArticles(_params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['kb-articles', _params],
    queryFn: () => import('@/lib/mock/data').then((m) => m.MOCK_ARTICLES),
    staleTime: 5 * 60 * 1000,
  });
}
