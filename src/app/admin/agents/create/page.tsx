'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/adminStore';
import { toast } from 'sonner';
import { 
  ArrowLeft, Save, UserPlus, User, Phone, Mail, Lock, Building2, 
  FileText, Percent, Eye, EyeOff, RefreshCw, MapPin, IndianRupee, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let pw = '';
  for (let i = 0; i < length; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export default function CreateAgentPage() {
  const router = useRouter();
  const { createAgent, isLoading } = useAdminStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [commission, setCommission] = useState('5.00');
  const [commissionType, setCommissionType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [fixedAmount, setFixedAmount] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    try {
      await createAgent({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone_number: phone.trim(),
        password: password,
        commission_type: commissionType,
        commission_percentage: parseFloat(commission) || 0,
        commission_fixed_amount: commissionType === 'FIXED_AMOUNT' ? (parseFloat(fixedAmount) || 0) : null,
        company_name: companyName.trim() || null,
        gst_number: gstNumber.trim() || null,
        address: address.trim() || null,
        admin_notes: adminNotes.trim() || null,
      });
      toast.success('Agent onboarded successfully');
      router.push('/admin/agents');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create agent');
    }
  };

  return (
    <div className="max-w-6xl space-y-8">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/agents" prefetch={false} className="rounded-xl bg-slate-100 p-2.5 text-slate-600 hover:bg-slate-200 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Onboard New Agent</h1>
          <p className="text-slate-500 mt-1">Create a new travel agent account with login credentials and commission settings.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Two-Column Form Layout - Automatically Aligned & Row-Stretched */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Personal Information */}
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg"><User className="h-5 w-5 text-blue-600" /></div>
                <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                    placeholder="Rajesh Kumar Sharma" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                      placeholder="agent@company.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                      placeholder="10 digit mobile number" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Commission & Business */}
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-50 rounded-lg"><Percent className="h-5 w-5 text-amber-600" /></div>
                <h3 className="text-lg font-bold text-slate-900">Commission & Business</h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Commission Type Toggle */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Commission Type</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setCommissionType('PERCENTAGE')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-bold transition ${
                        commissionType === 'PERCENTAGE' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}>
                      <Percent className="h-4 w-4" /> Percentage
                    </button>
                    <button type="button" onClick={() => setCommissionType('FIXED_AMOUNT')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-bold transition ${
                        commissionType === 'FIXED_AMOUNT' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}>
                      <IndianRupee className="h-4 w-4" /> Fixed Amount
                    </button>
                  </div>
                </div>

                {commissionType === 'PERCENTAGE' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Commission Percentage</label>
                    <div className="relative">
                      <Percent className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input type="number" step="0.01" min="0" max="100" value={commission} onChange={(e) => setCommission(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all" />
                    </div>
                    {parseFloat(commission) > 35 && (
                      <p className="flex items-center gap-1 text-xs text-amber-600 font-semibold mt-2">
                        <AlertTriangle className="h-3 w-3" /> Commission above 35% is unusually high
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">Applied to confirmed booking revenue.</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fixed Amount (INR)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input type="number" step="1" min="0" value={fixedAmount} onChange={(e) => setFixedAmount(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                        placeholder="e.g. 500" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Fixed discount per booking for this agent.</p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                      placeholder="Optional" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GST Number</label>
                  <input type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                    placeholder="22AAAAA0000A1Z5" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                      placeholder="Optional" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Login Credentials */}
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-50 rounded-lg"><Lock className="h-5 w-5 text-red-600" /></div>
                <h3 className="text-lg font-bold text-slate-900">Login Credentials</h3>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                      placeholder="Minimum 6 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button type="button" onClick={() => { const pw = generatePassword(); setPassword(pw); setShowPassword(true); toast.success('Password generated — copy it now!'); }}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap">
                    <RefreshCw className="h-4 w-4" /> Generate
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">Share this password securely with the agent. They will use it along with their email to login.</p>
              </div>
            </div>
          </section>

          {/* Admin Notes */}
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-lg"><FileText className="h-5 w-5 text-purple-600" /></div>
                <h3 className="text-lg font-bold text-slate-900">Internal Notes</h3>
              </div>
              <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all h-[115px] resize-none"
                placeholder="Private notes about this agent (only visible to admins)..." />
            </div>
          </section>

        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
          <Link href="/admin/agents" prefetch={false} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            Cancel
          </Link>
          <button type="submit" disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-slate-800 disabled:opacity-50 cursor-pointer">
            {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <UserPlus className="h-4 w-4" />}
            Create Agent Account
          </button>
        </div>
      </form>
    </div>
  );
}
