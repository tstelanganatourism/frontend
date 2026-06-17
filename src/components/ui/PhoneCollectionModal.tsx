'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { updateProfile } from '@/services/authService';
import { toast } from 'sonner';

/**
 * PhoneCollectionModal
 *
 * Shows automatically for any logged-in USER with no phone number.
 * - Not shown for ADMIN or AGENT roles.
 * - Not dismissable — the user must provide a valid phone number.
 * - Calls PUT /api/v1/auth/me and updates the Zustand auth store on success.
 */
export default function PhoneCollectionModal() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  // Show only for hydrated, authenticated, USER-role accounts with no phone
  useEffect(() => {
    if (isHydrated && user && user.role === 'USER' && !user.phone_number) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isHydrated, user]);

  if (!visible) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (['0000000000', '1111111111', '1234567890'].includes(phone)) {
      setError('Please enter your real mobile number.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ phone_number: phone });
      toast.success('Phone number saved! You can now receive booking confirmations via SMS.');
      setVisible(false);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string' && detail.toLowerCase().includes('already')) {
        setError('This number is already linked to another account. Please use a different number.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    /* ── Backdrop ─────────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 61, 86, 0.65)', backdropFilter: 'blur(6px)' }}
    >
      {/* ── Modal card ──────────────────────────────────────────────────────── */}
      <div
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 24px 64px rgba(15,61,86,0.22)' }}
      >
        {/* Gradient accent stripe at top */}
        <div
          className="h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg, #1A6B7A 0%, #5ac4d7 50%, #1A6B7A 100%)' }}
        />

        <div className="px-8 pt-8 pb-9">
          {/* ── Icon + heading ─────────────────────────────────────────────── */}
          <div className="flex flex-col items-center text-center mb-7">
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #e8f8fb 0%, #d0f0f6 100%)', border: '1.5px solid #c0e8f0' }}
            >
              {/* Phone icon */}
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="#1A6B7A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.1 3.4 2 2 0 0 1 3.08 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/>
              </svg>
            </div>

            <h2
              className="text-xl font-bold mb-2"
              style={{ color: '#0F3D56', fontFamily: 'var(--font-outfit)' }}
            >
              One quick step!
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4a6272' }}>
              Add your mobile number so we can send you{' '}
              <strong style={{ color: '#1A6B7A' }}>booking confirmations</strong> and{' '}
              <strong style={{ color: '#1A6B7A' }}>travel reminders</strong> via SMS.
            </p>
          </div>

          {/* ── Who are you section ──────────────────────────────────────────── */}
          {user && (
            <div
              className="mb-5 flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: '#f4fbfd', border: '1px solid #c8eaf0' }}
            >
              {/* Avatar initial */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #1A6B7A, #5ac4d7)' }}
              >
                {(user.full_name || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#0F3D56' }}>
                  {user.full_name}
                </p>
                <p className="text-xs truncate" style={{ color: '#6b8a9a' }}>
                  {user.email || 'Signed in via phone OTP / Google'}
                </p>
              </div>
            </div>
          )}

          {/* ── Form ────────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate>
            <label
              htmlFor="phone-collection-input"
              className="mb-2 block text-sm font-semibold"
              style={{ color: '#0F3D56' }}
            >
              Mobile Number
            </label>

            <div className="relative mb-1">
              {/* Country prefix */}
              <div
                className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none select-none"
              >
                <span className="text-sm font-semibold" style={{ color: '#1A6B7A' }}>+91</span>
                <span className="mx-2 h-4 w-px" style={{ background: '#c8dde5' }} />
              </div>

              <input
                id="phone-collection-input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                autoFocus
                placeholder="Enter your 10-digit number"
                value={phone}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl border py-3.5 pr-4 text-sm transition-all outline-none"
                style={{
                  paddingLeft: '72px',
                  borderColor: error ? '#e05252' : phone.length === 10 ? '#1A6B7A' : '#c8dde5',
                  background: error ? '#fef8f8' : '#f9fdfe',
                  color: '#0F3D56',
                  fontWeight: '500',
                  boxShadow: error
                    ? '0 0 0 3px rgba(224,82,82,0.12)'
                    : phone.length === 10
                    ? '0 0 0 3px rgba(26,107,122,0.12)'
                    : 'none',
                }}
              />

              {/* Check mark when valid */}
              {phone.length === 10 && !error && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="#1A6B7A">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Progress dots */}
            <div className="mb-1 flex gap-0.5 h-0.5 rounded-full overflow-hidden" style={{ background: '#e8eff2' }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 transition-all duration-150"
                  style={{ background: i < phone.length ? '#1A6B7A' : 'transparent' }}
                />
              ))}
            </div>

            {/* Error message */}
            {error && (
              <p className="mt-2 text-xs font-medium" style={{ color: '#e05252' }}>
                {error}
              </p>
            )}

            {/* Info note */}
            {!error && (
              <p className="mt-2 text-xs" style={{ color: '#8aa5b2' }}>
                Used only for booking SMS. We never share your number.
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="mt-6 w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-200"
              style={{
                background:
                  loading || phone.length !== 10
                    ? '#a8c8d0'
                    : 'linear-gradient(135deg, #1A6B7A 0%, #145662 100%)',
                cursor: loading || phone.length !== 10 ? 'not-allowed' : 'pointer',
                boxShadow:
                  phone.length === 10 && !loading
                    ? '0 4px 16px rgba(26,107,122,0.3)'
                    : 'none',
                transform: phone.length === 10 && !loading ? 'translateY(0)' : 'none',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Saving…
                </span>
              ) : (
                'Save & Continue'
              )}
            </button>
          </form>

          {/* Fine print */}
          <p className="mt-4 text-center text-xs" style={{ color: '#9ab2bc' }}>
            This helps us send booking confirmations &amp; reminders.
          </p>
        </div>
      </div>
    </div>
  );
}
