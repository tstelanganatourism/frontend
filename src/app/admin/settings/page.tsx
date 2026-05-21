'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { 
  Settings, 
  Save, 
  Globe, 
  Phone, 
  Mail, 
  CreditCard, 
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { settings, isLoading, fetchSettings, updateSettings } = useAdminStore();
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      toast.success('System settings updated successfully');
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  if (!formData) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#5ac4d7] border-t-transparent" />
    </div>
  );

  const isDirty = settings && formData && JSON.stringify(settings) !== JSON.stringify(formData);

  return (
    <div className="max-w-6xl space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">System Configuration</h1>
          <p className="text-slate-500 mt-1">Manage global settings, contact information, and business rules.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Two-column Balanced Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Company & Communication */}
          <div className="space-y-8">
            {/* Company Information */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Company Information</h3>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
                    <input 
                      type="text" 
                      name="company_name"
                      value={formData.company_name || ''} 
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                      placeholder="TS Tours & Travels"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GST Number</label>
                    <input 
                      type="text" 
                      name="gst_number"
                      value={formData.gst_number || ''} 
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Office Address</label>
                    <textarea 
                      name="address"
                      value={formData.address || ''} 
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all h-[90px] resize-none"
                      placeholder="Enter physical address..."
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Channels */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Phone className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Communication Channels</h3>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Support Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="email" 
                        name="support_email"
                        value={formData.support_email || ''} 
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                        placeholder="support@tstours.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">WhatsApp Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        name="whatsapp_number"
                        value={formData.whatsapp_number || ''} 
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Financial Configuration & Policies */}
          <div className="space-y-8">
            {/* Financial Settings */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Financial Configuration</h3>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Global Tax % (GST)</label>
                    <input 
                      type="number" 
                      name="global_tax_percentage"
                      value={formData.global_tax_percentage || 0} 
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Razorpay Key ID</label>
                    <input 
                      type="password" 
                      name="razorpay_key_id"
                      value={formData.razorpay_key_id || ''} 
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Policies Section */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <ShieldAlert className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Operational Policies</h3>
                </div>
                <div className="grid gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">General Booking Rules</label>
                    <textarea 
                      name="booking_rules"
                      value={formData.booking_rules || ''} 
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all h-[90px] resize-none"
                      placeholder="Enter rules visible during checkout..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Global Cancellation Policy</label>
                    <textarea 
                      name="cancellation_policies"
                      value={formData.cancellation_policies || ''} 
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all h-[90px] resize-none"
                      placeholder="Enter refund rules..."
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>

        {/* Bottom Save Action Bar - Persistent, Always Visible */}
        <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
          <button 
            type="submit" 
            disabled={isLoading || !isDirty}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-slate-800 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
