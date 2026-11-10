'use client';

import { useAuthStore } from '@/stores/authStore';

export const BOOKING_AUTH_STORAGE_KEYS = {
  packageVariantId: 'last_pkg_checkout_variant_id',
  roomVariantId: 'last_checkout_selected_variant_id',
};

/**
 * Checks whether the current visitor is authenticated before opening a booking modal.
 * If not logged in, redirects immediately to `/login?redirect=...` so the user logs in
 * before selecting dates or filling any booking details, then returns to auto-open booking.
 *
 * Returns `true` when the booking modal can open immediately.
 */
export function ensureAuthenticatedForBooking(options: {
  router: { push: (url: string) => void };
  storageKey?: string;
  variantId?: number | null;
}): boolean {
  if (typeof window === 'undefined') return false;

  const { isAuthenticated, isHydrated } = useAuthStore.getState();
  const hasSessionFlag = localStorage.getItem('has_session') === '1';

  if (isAuthenticated) {
    return true;
  }

  // Wait for AuthProvider refresh if a session cookie exists and hydration has not finished yet
  if (!isHydrated && hasSessionFlag) {
    return true;
  }

  if (options.storageKey && options.variantId) {
    try {
      sessionStorage.setItem(options.storageKey, String(options.variantId));
    } catch {}
  }

  const url = new URL(window.location.href);
  url.searchParams.delete('restore_pkg_checkout');
  url.searchParams.delete('restore_checkout');
  url.searchParams.set('open_booking', 'true');

  const returnUrl = `${url.pathname}${url.search}`;
  options.router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
  return false;
}

