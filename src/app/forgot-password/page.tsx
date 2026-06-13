'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, Key, ShieldCheck, ArrowLeft, ArrowRight, CheckCircle2, KeyRound, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'EMAIL' | 'OTP' | 'PASSWORD' | 'SUCCESS';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('EMAIL');
  const [loginId, setLoginId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showWhatsAppReset, setShowWhatsAppReset] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginId.trim()) {
      toast.error('Please enter your email or phone number');
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiClient.post('/api/v1/auth/forgot-password', { login_id: loginId.trim() });
      toast.success('Reset code sent to your registered email');
      if (res.data?.email) {
        setUserEmail(res.data.email);
      } else {
        setUserEmail('');
      }
      setStep('OTP');
      setResendTimer(60);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail === 'no_email_on_account') {
        setShowWhatsAppReset(true);
      } else {
        toast.error(detail || 'Failed to send reset code');
      }
    } finally {
      setIsLoading(false);
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
    otpRefs.current[Math.min(startIndex + digits.length, 5)]?.focus();
  };

  const handleOtpPaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
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
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/api/v1/auth/verify-reset-otp', {
        login_id: loginId.trim()
      }, {
        params: { otp: fullOtp }
      });
      setStep('PASSWORD');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid or expired reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/api/v1/auth/reset-password', {
        login_id: loginId.trim(),
        otp: otp.join(''),
        new_password: newPassword,
      });
      toast.success('Password reset successful');
      setStep('SUCCESS');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Reset failed. Check your code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#061d2b] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(26,107,122,0.28),transparent_60%),radial-gradient(ellipse_at_80%_20%,rgba(15,61,86,0.45),transparent_55%)]" />
      <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912203/slider4_rikfsq.jpg')] bg-cover bg-center opacity-[0.07]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
            <KeyRound className="h-6 w-6 text-[#5ac4d7]" />
          </div>
          <h1 className="text-2xl font-black text-white">
            {step === 'SUCCESS' ? 'All Done!' : 'Reset Password'}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            {showWhatsAppReset ? "Unable to reset automatically." : (
              <>
                {step === 'EMAIL' && "Enter your email or phone number to receive a reset code."}
                {step === 'OTP' && (userEmail ? `We sent a 6-digit code to ${userEmail}.` : "We sent a 6-digit code to your email.")}
                {step === 'PASSWORD' && "Choose a strong new password."}
                {step === 'SUCCESS' && "Your password has been reset successfully."}
              </>
            )}
          </p>
        </div>

        <div className="rounded-3xl border border-white/12 bg-white/8 p-7 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.45)]">

          <AnimatePresence mode="wait">
            {showWhatsAppReset ? (
              <motion.div
                key="whatsapp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6 animate-pulse">
                  <AlertCircle className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white">No Email Address Set</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Your account has no email address. We cannot send an automated password reset code. 
                  Please contact support on WhatsApp to reset your password.
                </p>
                <a
                  href={`https://wa.me/919849848938?text=${encodeURIComponent(
                    `Hi Telangana Boat Tourism Support, I need to reset my password for my account. My registered phone/email identifier is: ${loginId.trim()}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(37,211,102,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#20ba5a] active:translate-y-0"
                >
                  Contact Support on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setShowWhatsAppReset(false);
                    setStep('EMAIL');
                  }}
                  className="text-xs font-semibold text-white/40 hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1 mx-auto mt-4"
                >
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
              </motion.div>
            ) : (
              <>
                {step === 'EMAIL' && (
                  <motion.form
                    key="email"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                    onSubmit={handleSendOtp}
                  >
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                        Email or Phone Number
                      </label>
                      <div className="relative">
                        {(() => {
                          const isPhoneNumber = /^\d{10}$/.test(loginId.trim());
                          const InputIcon = isPhoneNumber ? Phone : Mail;
                          return <InputIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70 z-10 transition-colors duration-200" />;
                        })()}
                        <input
                          type="text"
                          required
                          value={loginId}
                          onChange={(e) => setLoginId(e.target.value)}
                          className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none ring-0 transition-all focus:border-[#5ac4d7]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#5ac4d7]/20"
                          placeholder="Email or 10-digit number"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a6b7a] py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,107,122,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1d7a8a] hover:shadow-[0_12px_32px_rgba(26,107,122,0.5)] disabled:opacity-60 disabled:translate-y-0"
                    >
                      {isLoading ? (
                        <span className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                      ) : (
                        <>Send Reset Code <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </motion.form>
                )}

                {step === 'OTP' && (
                  <motion.form
                    key="otp"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                    onSubmit={handleVerifyOtp}
                  >
                    <div>
                      <label className="mb-3 block text-center text-xs font-semibold uppercase tracking-wider text-white/60">
                        Enter 6-Digit Code
                      </label>
                      <div className="flex justify-between gap-2">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => { otpRefs.current[i] = el; }}
                            type="text"
                            maxLength={1}
                            inputMode="numeric"
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onPaste={(e) => handleOtpPaste(i, e)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            className="w-full h-12 rounded-xl border border-white/15 bg-white/10 text-center text-xl font-black text-white outline-none transition-all focus:border-[#5ac4d7]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#5ac4d7]/20"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a6b7a] py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,107,122,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1d7a8a] hover:shadow-[0_12px_32px_rgba(26,107,122,0.5)]"
                    >
                      Verify Code
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <div className="flex flex-col items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={resendTimer > 0 || isLoading}
                        className={`text-xs font-bold transition-colors ${resendTimer > 0
                            ? 'text-white/30 cursor-not-allowed'
                            : 'text-[#5ac4d7] hover:text-white'
                          }`}
                      >
                        {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Did not receive a code? Resend'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep('EMAIL')}
                        className="text-xs font-semibold text-white/40 hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1"
                      >
                        <ArrowLeft className="h-3 w-3" /> Back to start
                      </button>
                    </div>
                  </motion.form>
                )}

                {step === 'PASSWORD' && (
                  <motion.form
                    key="password"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                    onSubmit={handleResetPassword}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                          New Password
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70 z-10" />
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none ring-0 transition-all focus:border-[#5ac4d7]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#5ac4d7]/20"
                            placeholder="Min. 8 characters"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70 z-10" />
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none ring-0 transition-all focus:border-[#5ac4d7]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#5ac4d7]/20"
                            placeholder="Confirm password"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a6b7a] py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,107,122,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1d7a8a] hover:shadow-[0_12px_32px_rgba(26,107,122,0.5)] disabled:opacity-60 disabled:translate-y-0"
                    >
                      {isLoading ? (
                        <span className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </motion.form>
                )}

                {step === 'SUCCESS' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-6">Success!</h3>
                    <Link
                      href="/login"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a6b7a] py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,107,122,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1d7a8a] hover:shadow-[0_12px_32px_rgba(26,107,122,0.5)]"
                    >
                      Continue to Login
                    </Link>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>

        </div>

        <p className="mt-6 text-center text-sm text-white/50">
          Remembered your password?{' '}
          <Link href="/login" className="font-semibold text-[#5ac4d7] hover:text-white transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
