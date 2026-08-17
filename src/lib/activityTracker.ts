/**
 * Activity Tracker — Production-grade user funnel activity logging.
 * Captures user login, package viewing, passenger details fill, checkout initiation,
 * and payment abandonment, sending real-time alerts to the Admin via Brevo.
 */

export interface FunnelEventPayload {
  funnel_stage: 'CONFIGURING' | 'PASSENGERS_FILLED' | 'CHECKOUT_INITIATED' | 'PAYMENT_ABANDONED' | 'PAYMENT_COMPLETED' | 'MODAL_CLOSED_AFTER_FILL';
  target_type?: 'package' | 'room';
  target_id?: number;
  target_title?: string;
  variant_id?: number;
  variant_title?: string;
  travel_date?: string;
  adult_count?: number;
  child_count?: number;
  student_count?: number;
  total_amount?: number;
  coupon_code?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  passengers_data?: Array<{ full_name: string; age: number; gender?: string }>;
  booking_public_id?: string;
  payment_gateway?: string;
  abandonment_reason?: string;
}

const SESSION_KEY = 'tsb_funnel_session_id';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `tsb_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `tsb_sess_${Date.now()}`;
  }
}

export async function trackFunnelEvent(payload: FunnelEventPayload): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const sessionId = getOrCreateSessionId();
  const url = '/api/v1/activity/funnel-event';

  const bodyData = {
    session_id: sessionId,
    ...payload,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    // Ignore storage read errors
  }

  // Use sendBeacon if unloading/closing page
  if (payload.funnel_stage === 'MODAL_CLOSED_AFTER_FILL' || payload.funnel_stage === 'PAYMENT_ABANDONED') {
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(bodyData)], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
        return true;
      } catch {
        // Fall back to fetch
      }
    }
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyData),
      keepalive: true,
    });
    return res.ok;
  } catch (err) {
    console.warn('Funnel event tracking failover:', err);
    return false;
  }
}
