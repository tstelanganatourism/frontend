'use client';

import { useState, useRef, useEffect, Suspense, type ClipboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, EyeOff, Eye } from 'lucide-react';
import { adminLogin, adminVerifyOTP, resendAdminOtp } from '@/services/authService';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Enter a valid admin email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginData = z.infer<typeof loginSchema>;

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

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      const { email, password } = getValues();
      await resendAdminOtp({ email, password });
      setResendTimer(60);
      toast.success('A new code has been sent to your email.');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to resend code.');
    }
  };

  const onLoginSubmit = async (data: LoginData) => {
    setApiError(null);
    setSuccessMessage(null);
    try {
      const res = await adminLogin(data);
      setUserId(res.user_id);
      setSuccessMessage(res.message);
      setStep(2);
      setResendTimer(60);
    } catch (err: any) {
      setApiError(err?.response?.data?.detail || 'Invalid credentials or unauthorized.');
    }
  };

  const applyOtpDigits = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    const startIndex = digits.length === 6 ? 0 : index;
    const newOtp = [...otp];
    for (let i = 0; i < digits.length && startIndex + i < 6; i++) {
      newOtp[startIndex + i] = digits[i];
    }

    setOtp(newOtp);
    inputRefs.current[Math.min(startIndex + digits.length, 5)]?.focus();
  };

  const handleOtpPaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted.replace(/\D/g, '')) {
      e.preventDefault();
      applyOtpDigits(index, pasted);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      applyOtpDigits(index, value);
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      verifyOtp();
    }
  };

  const verifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6 || !userId) {
      setApiError('Please enter all 6 digits.');
      return;
    }

    setApiError(null);
    setOtpLoading(true);
    try {
      await adminVerifyOTP({ user_id: userId, otp: fullOtp });
      const destination = redirect || '/admin/dashboard';
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setApiError(err?.response?.data?.detail || 'Invalid or expired OTP.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setOtpLoading(false);
    }
  };

  useEffect(() => {
    if (step === 2) {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#04060a] flex items-center justify-center px-4 py-12">
      {/* Dynamic Glowing Mesh Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.18),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.12),transparent_55%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-500/8 blur-[130px] pointer-events-none" />

      {/* Cyber Grid Lines for elite high-tech aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500/25 to-indigo-500/10 border border-violet-500/30 shadow-[0_0_35px_rgba(139,92,246,0.25)]">
            <span className="absolute inset-0 rounded-2xl bg-violet-400/20 blur-md animate-pulse pointer-events-none" />
            <ShieldAlert className="h-7 w-7 text-violet-400 relative z-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase sm:text-4xl bg-gradient-to-r from-white via-white to-violet-300 bg-clip-text text-transparent">
            Super Admin Portal
          </h1>
          <p className="mt-2 text-xs font-medium uppercase tracking-widest text-violet-400/60">
            Restricted Admin Console
          </p>
        </div>

        {/* Premium Translucent Glassmorphic Card */}
        <div className="relative rounded-3xl border border-white/[0.08] bg-[#090b14]/65 p-8 backdrop-blur-3xl shadow-[0_32px_80px_rgba(0,0,0,0.85)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit(onLoginSubmit)}
                className="space-y-6 relative z-10"
                noValidate
              >
                <div>
                  <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-widest text-violet-400/70">
                    Administrator Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-violet-400" />
                    <input
                      {...register('email')}
                      type="email"
                      autoComplete="username"
                      placeholder="admin@example.com"
                      className="w-full rounded-2xl border border-white/10 bg-black/45 py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-violet-400 focus:bg-black/60 focus:ring-4 focus:ring-violet-400/10"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-widest text-violet-400/70">
                    Secure Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-violet-400" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-white/10 bg-black/45 py-3.5 pl-12 pr-12 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-violet-400 focus:bg-black/60 focus:ring-4 focus:ring-violet-400/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-violet-400 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.password.message}
                    </p>
                  )}
                </div>

                <AnimatePresence>
                  {apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="flex items-start gap-2.5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3.5 text-sm text-red-300"
                    >
                      <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-400" />
                      <span>{apiError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative mt-8 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-550 py-4 text-sm font-black uppercase tracking-wider text-white shadow-[0_8px_30px_rgba(99,102,241,0.35)] transition-all hover:shadow-[0_12px_40px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none animate-shimmer"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                      </svg>
                      <span>Generating OTP Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Authorize Administrator</span>
                      <ArrowRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 relative z-10"
              >
                {successMessage && (
                  <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                    <p className="text-sm text-emerald-200 font-medium">{successMessage}</p>
                  </div>
                )}

                <div>
                  <label className="mb-4 block text-center text-xs font-extrabold uppercase tracking-widest text-violet-400/80">
                    Verification Code Sent
                  </label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onPaste={(e) => handleOtpPaste(i, e)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="h-14 w-12 rounded-2xl border border-white/10 bg-black/45 text-center text-2xl font-black text-white outline-none transition-all duration-300 focus:border-violet-400 focus:bg-black/60 focus:ring-4 focus:ring-violet-400/15 shadow-lg"
                      />
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="flex items-start gap-2.5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3.5 text-sm text-red-300"
                    >
                      <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-400" />
                      <span>{apiError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={otpLoading}
                      className="w-1/3 rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-bold text-white/80 hover:text-white transition-all hover:bg-white/10 disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={otpLoading || otp.some(d => !d)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-550 py-4 text-sm font-black uppercase tracking-wider text-white shadow-[0_8px_30px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_12px_40px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {otpLoading ? (
                        <>
                          <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                          </svg>
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify OTP</span>
                      )}
                    </button>
                  </div>

                  <div className="text-center mt-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0}
                      className={`text-xs font-semibold tracking-wider uppercase transition-all ${
                        resendTimer > 0 
                          ? 'text-white/40 cursor-not-allowed' 
                          : 'text-violet-400 hover:text-violet-300 underline decoration-2 underline-offset-4'
                      }`}
                    >
                      {resendTimer > 0 ? `Resend OTP code in ${resendTimer}s` : 'Did not receive code? Resend'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-[calc(100vh-4rem)] w-full bg-[#04060a] flex items-center justify-center">
        <div className="text-violet-400/60 text-sm font-semibold tracking-wider animate-pulse uppercase">
          Loading Secret Admin Portal...
        </div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
