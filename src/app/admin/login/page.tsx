'use client';

import { useState, useRef, useEffect, Suspense, type ClipboardEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, EyeOff, Eye, Waves, MapPin, BarChart3, Settings } from 'lucide-react';
import { adminLogin, adminVerifyOTP, resendAdminOtp } from '@/services/authService';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Enter a valid admin email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginData = z.infer<typeof loginSchema>;

function getAuthErrorMessage(error: unknown, fallback: string) {
  const responseError = error as { response?: { data?: { detail?: string } } };
  return responseError.response?.data?.detail || fallback;
}

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [step, setStep] = useState<1 | 2>(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) interval = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => { if (step === 2) inputRefs.current[0]?.focus(); }, [step]);

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      const { email, password } = getValues();
      await resendAdminOtp({ email, password });
      setResendTimer(60);
      toast.success('A new code has been sent to your email.');
    } catch (err: unknown) { toast.error(getAuthErrorMessage(err, 'Failed to resend code.')); }
  };

  const onLoginSubmit = async (data: LoginData) => {
    setApiError(null); setSuccessMessage(null);
    try {
      const res = await adminLogin(data);
      setUserId(res.user_id);
      setSuccessMessage(res.message);
      setStep(2);
      setResendTimer(60);
    } catch (err: unknown) { setApiError(getAuthErrorMessage(err, 'Invalid credentials or unauthorized.')); }
  };

  const applyOtpDigits = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    const startIndex = digits.length === 6 ? 0 : index;
    const newOtp = [...otp];
    for (let i = 0; i < digits.length && startIndex + i < 6; i++) newOtp[startIndex + i] = digits[i];
    setOtp(newOtp);
    inputRefs.current[Math.min(startIndex + digits.length, 5)]?.focus();
  };

  const handleOtpPaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted.replace(/\D/g, '')) { e.preventDefault(); applyOtpDigits(index, pasted); }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) { applyOtpDigits(index, value); return; }
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp]; newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    else if (e.key === 'Enter') verifyOtp();
  };

  const verifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6 || !userId) { setApiError('Please enter all 6 digits.'); return; }
    setApiError(null); setOtpLoading(true);
    try {
      await adminVerifyOTP({ user_id: userId, otp: fullOtp });
      router.push(redirect || '/admin/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setApiError(getAuthErrorMessage(err, 'Invalid or expired OTP.'));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex">
      {/* ── LEFT PANEL: Brand Content ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-[#061d2b]">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('https://res.cloudinary.com/r929tquv/image/upload/v1785917157/ts_boat_tourism/images/evafz4lgjowhjztykdvz.webp')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#061d2b]/80 via-[#0a2c42]/55 to-[#0f0f1a]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061d2b]/95 via-transparent to-[#061d2b]/40" />

        <div className="relative z-10 flex flex-col h-full p-12 justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/10 p-1 border border-white/20">
              <img src="/apple-touch-icon.png" alt="TS Boat Tourism" className="h-full w-full object-contain rounded-lg" />
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-wide">TS Boat Tourism</p>
              <p className="text-white/50 text-xs">Administration Console</p>
            </div>
          </div>

          {/* Headline */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="h-4 w-4 text-violet-400" />
              <span className="text-violet-400 text-xs font-bold uppercase tracking-widest">Secure Admin Access</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Manage &<br />
              <span className="text-violet-400">control</span> your<br />
              operations.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Full access to inventory, bookings, agents, packages, and financial reports from one powerful dashboard.
            </p>

            {/* Capabilities */}
            <div className="space-y-3 mt-8">
              {[
                { icon: BarChart3, label: 'Revenue & Analytics', sub: 'Real-time financial dashboards' },
                { icon: Settings, label: 'Inventory Management', sub: 'Packages, rooms & schedules' },
                { icon: Waves, label: 'Booking Operations', sub: 'Manage all reservations & agents' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-violet-400/15 border border-violet-400/20 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{item.label}</p>
                    <p className="text-white/45 text-xs">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="flex flex-wrap gap-2">
            {['Papikondalu', 'Bhadrachalam', 'Maredumilli', 'Kolluru'].map(loc => (
              <div key={loc} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5">
                <MapPin className="h-3 w-3 text-violet-400" />
                <span className="text-white/70 text-xs font-semibold">{loc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Admin Login Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile brand */}
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-200">
              <img src="/apple-touch-icon.png" alt="TS Boat Tourism" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-slate-900 font-black text-sm">TS Boat Tourism</p>
              <p className="text-slate-400 text-xs">Administration Console</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
                    <ShieldAlert className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900">Admin Portal</h1>
                    <p className="text-xs text-slate-400">Authorized personnel only</p>
                  </div>
                </div>

                <p className="text-sm text-slate-500 mb-8">Sign in with your administrator credentials. A 2FA code will be sent to your email.</p>

                <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        {...register('email')}
                        type="email"
                        autoComplete="username"
                        placeholder="admin@example.com"
                        className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-300 outline-none transition-all focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                      />
                    </div>
                    {errors.email && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••••"
                        className={`w-full rounded-xl border pl-10 pr-11 py-3 text-sm text-slate-900 placeholder-slate-300 outline-none transition-all focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.password.message}</p>}
                  </div>

                  <AnimatePresence>
                    {apiError && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{apiError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {isSubmitting
                      ? <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>
                      : <><span>Continue</span><ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                <button type="button" onClick={() => setStep(1)}
                  className="mb-6 flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                  ← Back
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900">Verify Identity</h1>
                    <p className="text-xs text-slate-400">2-Factor Authentication</p>
                  </div>
                </div>

                {successMessage && (
                  <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-3 mb-6">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-700 font-semibold">{successMessage}</p>
                  </div>
                )}

                <p className="text-sm text-slate-500 mb-6">Enter the 6-digit verification code sent to your email.</p>

                <div className="mb-5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Verification Code</label>
                  <div className="flex gap-2 justify-between">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onPaste={e => handleOtpPaste(i, e)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className={`h-12 w-full max-w-[3rem] rounded-xl border text-center text-xl font-black text-slate-900 outline-none transition-all
                          ${digit ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 bg-slate-50'}
                          focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20`}
                      />
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {apiError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600 mb-4">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{apiError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} disabled={otpLoading}
                    className="w-1/3 rounded-xl border border-slate-200 bg-slate-50 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50">
                    Back
                  </button>
                  <button type="button" onClick={verifyOtp} disabled={otpLoading || otp.some(d => !d)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-bold text-white hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {otpLoading
                      ? <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>
                      : <><span>Verify & Sign In</span><ArrowRight className="h-4 w-4" /></>}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <button type="button" onClick={handleResendOtp} disabled={resendTimer > 0}
                    className={`text-xs font-semibold transition-colors ${resendTimer > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-violet-600 hover:text-violet-800'}`}>
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend verification code'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <Link href="/login" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">← Customer Login</Link>
            <Link href="/agent/login" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">Agent Portal →</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] w-full bg-white flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
