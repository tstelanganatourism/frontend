'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, AlertCircle, Briefcase, ShieldAlert, RefreshCw, CheckCircle2, ChevronLeft } from 'lucide-react';
import { sendPhoneOtp, verifyPhoneOtp } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

function getApiError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e?.response?.data?.detail || fallback;
}

function useCountdown(initial: number) {
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback((seconds: number) => {
    setRemaining(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  return { remaining, start };
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [locked, setLocked] = useState(false);
  const [apiError, setApiError] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { remaining: cooldown, start: startCooldown } = useCountdown(60);

  // Redirect if already logged in
  useEffect(() => {
    if (isHydrated && isAuthenticated && user) {
      const dest = redirect || (user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'AGENT' ? '/agent/dashboard' : '/dashboard');
      router.replace(dest);
    }
  }, [isHydrated, isAuthenticated, user, redirect, router]);

  const agentHref = `/agent/login${redirect?.startsWith('/agent') ? `?redirect=${encodeURIComponent(redirect)}` : ''}`;
  const adminHref = `/admin/login${redirect?.startsWith('/admin') ? `?redirect=${encodeURIComponent(redirect)}` : ''}`;

  // ── Step 1: Send OTP ───────────────────────────────────────────────────────

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleaned = phone.trim().replace(/\D/g, '');
    if (!/^\d{10}$/.test(cleaned)) {
      setPhoneError('Enter a valid 10-digit mobile number');
      return;
    }
    setPhoneError('');
    setApiError('');
    setSubmitting(true);
    try {
      const res = await sendPhoneOtp(cleaned);
      setAttemptsLeft(res.attempts_remaining);
      startCooldown(res.cooldown_seconds || 60);
      setStep('otp');
      // Auto-focus first OTP box
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      const msg = getApiError(err, 'Failed to send OTP. Please try again.');
      if (msg.toLowerCase().includes('wait')) {
        setLocked(msg.toLowerCase().includes('too many'));
        setApiError(msg);
      } else {
        setApiError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── OTP input logic ────────────────────────────────────────────────────────

  const handleOtpChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setOtpError('');
    if (digit && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
    // Auto-submit when all 6 digits are filled
    if (digit && idx === 5 && next.every(d => d)) {
      handleVerify(next.join(''));
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      const next = paste.split('');
      setOtp(next);
      otpRefs.current[5]?.focus();
      setTimeout(() => handleVerify(paste), 50);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────

  const handleVerify = async (otpValue?: string) => {
    const code = otpValue ?? otp.join('');
    if (code.length < 6) { setOtpError('Enter the 6-digit code'); return; }
    setSubmitting(true);
    setOtpError('');
    try {
      const res = await verifyPhoneOtp(phone.trim().replace(/\D/g, ''), code);
      const role = res.user?.role;
      const dest = redirect || (role === 'ADMIN' ? '/admin/dashboard' : role === 'AGENT' ? '/agent/dashboard' : '/dashboard');
      router.replace(dest);
    } catch (err) {
      setOtpError(getApiError(err, 'Invalid or expired OTP. Please try again.'));
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (cooldown > 0 || locked) return;
    setOtpError('');
    setApiError('');
    setSubmitting(true);
    try {
      const res = await sendPhoneOtp(phone.trim().replace(/\D/g, ''));
      setAttemptsLeft(res.attempts_remaining);
      startCooldown(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = getApiError(err, 'Failed to resend OTP.');
      if (msg.toLowerCase().includes('too many')) setLocked(true);
      setOtpError(msg);
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#061d2b] flex items-center justify-center px-4 py-8">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(26,107,122,0.28),transparent_60%),radial-gradient(ellipse_at_80%_20%,rgba(15,61,86,0.45),transparent_55%)]" />
      <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431872/maredumilli-13_mdqgmv.jpg')] bg-cover bg-center opacity-[0.07]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden bg-white shadow-md p-1 border border-white/20">
            <img src="/apple-touch-icon.png" alt="TS Boat Tourism" className="h-full w-full object-contain rounded-xl" />
          </div>
          <h1 className="text-2xl font-black text-white">
            {step === 'phone' ? 'Welcome back' : 'Verify your number'}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            {step === 'phone'
              ? 'Sign in with your mobile number — no password needed'
              : `Enter the 6-digit code sent to +91 ${phone.replace(/\D/g, '')}`}
          </p>
        </div>

        <div className="rounded-3xl border border-white/12 bg-white/8 p-7 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Phone ── */}
            {step === 'phone' && (
              <motion.div key="phone-step" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.25 }}>


                <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">Mobile Number</label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        value={phone}
                        onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setPhoneError(''); setApiError(''); }}
                        placeholder="10-digit mobile number"
                        className="w-full rounded-xl border border-white/15 bg-white/8 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none ring-0 transition-all duration-200 focus:border-[#5ac4d7]/70 focus:bg-white/12 focus:ring-2 focus:ring-[#5ac4d7]/20"
                      />
                    </div>
                    {phoneError && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400"><AlertCircle className="h-3 w-3" />{phoneError}</p>
                    )}
                  </div>

                  <AnimatePresence>
                    {apiError && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{apiError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={submitting || phone.replace(/\D/g, '').length !== 10}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a6b7a] py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,107,122,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1d7a8a] hover:shadow-[0_12px_32px_rgba(26,107,122,0.5)] disabled:opacity-60 disabled:translate-y-0"
                  >
                    {submitting ? (
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>
                    ) : (<>Send OTP <ArrowRight className="h-4 w-4" /></>)}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 'otp' && (
              <motion.div key="otp-step" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setOtpError(''); setApiError(''); }}
                  className="mb-5 flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white/80 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Change number
                </button>

                {/* OTP success hint */}
                <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-300 font-semibold">OTP sent! Check your SMS.</p>
                </div>

                {/* 6-box OTP input */}
                <div className="mb-5">
                  <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-white/60">Enter 6-digit OTP</label>
                  <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => { otpRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        className={`h-12 w-full max-w-[3rem] rounded-xl border text-center text-xl font-black text-white outline-none ring-0 transition-all duration-150 bg-white/8
                          ${digit ? 'border-[#5ac4d7] bg-[#5ac4d7]/15' : 'border-white/20'}
                          focus:border-[#5ac4d7]/80 focus:ring-2 focus:ring-[#5ac4d7]/25
                          ${otpError ? 'border-red-400/60 bg-red-500/10' : ''}`}
                        aria-label={`OTP digit ${idx + 1}`}
                      />
                    ))}
                  </div>
                  {otpError && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-red-400"><AlertCircle className="h-3 w-3" />{otpError}</p>
                  )}
                </div>

                {/* Verify button */}
                <button
                  type="button"
                  onClick={() => handleVerify()}
                  disabled={submitting || otp.some(d => !d)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a6b7a] py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,107,122,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1d7a8a] disabled:opacity-60 disabled:translate-y-0"
                >
                  {submitting ? (
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>
                  ) : (<>Verify & Sign In <ArrowRight className="h-4 w-4" /></>)}
                </button>

                {/* Resend section */}
                <div className="mt-4 text-center">
                  {locked ? (
                    <p className="text-xs text-amber-400 font-semibold">Too many attempts. Please wait 10 minutes before retrying.</p>
                  ) : cooldown > 0 ? (
                    <p className="text-xs text-white/40">Resend OTP in <span className="font-black text-white/70">{cooldown}s</span> &nbsp;·&nbsp; {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} left</p>
                  ) : attemptsLeft > 0 ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5ac4d7] hover:text-white transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Resend OTP ({attemptsLeft} left)
                    </button>
                  ) : (
                    <p className="text-xs text-amber-400 font-semibold">No resend attempts left. Please wait 10 minutes.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Portal logins */}
        <div className="mt-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/12" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Portal logins</span>
            <div className="h-px flex-1 bg-white/12" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href={agentHref}
              className="group flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-teal-300/20 bg-teal-400/10 px-4 py-3 text-sm font-bold text-teal-100 transition-all hover:-translate-y-0.5 hover:border-teal-300/45 hover:bg-teal-400/18"
            >
              <Briefcase className="h-4 w-4 text-teal-300 transition-transform group-hover:scale-110" />
              Agent Login
            </Link>
            <Link href={adminHref}
              className="group flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 text-sm font-bold text-violet-100 transition-all hover:-translate-y-0.5 hover:border-violet-300/45 hover:bg-violet-400/18"
            >
              <ShieldAlert className="h-4 w-4 text-violet-300 transition-transform group-hover:scale-110" />
              Admin Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-[calc(100vh-4rem)] w-full bg-[#061d2b] flex items-center justify-center">
        <div className="text-white/60 text-sm">Loading sign in...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
