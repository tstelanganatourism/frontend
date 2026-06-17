'use client';

import { useAuthStore } from '@/stores/authStore';
import { User, Mail, Phone, Edit2, Camera, Loader2, Building2, Percent, IndianRupee, FileText, MapPin } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with store user data
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhoneNumber(user.phone_number || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatar_url || '');
      setGstNumber(user.gst_number || '');
      setAddress(user.address || '');
    }
  }, [user, isEditingProfile]);

  // Handle avatar upload click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle avatar file selection & upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only image files (JPG, PNG, WEBP, GIF) are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading profile image...');
    try {
      const response = await apiClient.post('/api/v1/auth/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newUrl = response.data.url;
      setAvatarUrl(newUrl);
      
      // Auto-save the avatar URL to the profile immediately
      const updateResponse = await apiClient.put('/api/v1/auth/me', {
        avatar_url: newUrl,
      });
      updateUser(updateResponse.data);

      toast.success('Profile picture updated successfully!', { id: loadingToast });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload profile picture.', { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle saving personal info changes
  const handleSaveChanges = async () => {
    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (phoneNumber.trim() && !/^\d{10}$/.test(phoneNumber.trim())) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiClient.put('/api/v1/auth/me', {
        full_name: fullName.trim(),
        email: email.trim() || null,
        phone_number: phoneNumber.trim() || null,
        avatar_url: avatarUrl || null,
        gst_number: gstNumber.trim() || null,
        address: address.trim() || null,
      });
      updateUser(response.data);
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-[var(--color-brand-river)]">My Profile</h1>
            <p className="text-sm text-slate-500">Manage your personal information and contact details.</p>
          </div>
          <button 
            type="button"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors w-full sm:w-auto cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
            {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Area with Image Upload */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative group">
              <div 
                onClick={triggerFileInput}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const fakeEvent = { target: { files: e.dataTransfer.files } } as any;
                    handleAvatarChange(fakeEvent);
                  }
                }}
                className="h-32 w-32 rounded-full bg-[var(--color-brand-sand)] flex items-center justify-center text-[var(--color-brand-river)] text-4xl font-black shadow-inner relative overflow-hidden cursor-pointer border-2 border-slate-100"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  user?.full_name?.charAt(0).toUpperCase() || 'U'
                )}

                {/* Hover Camera Icon overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-6 w-6 text-white mb-1" />
                      <span className="text-[10px] text-white font-bold uppercase tracking-wider">Upload</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              accept="image/*;capture=camera" 
              className="hidden" 
            />

            <div className="inline-flex flex-col gap-2 items-center">
              <div className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
                Verified Account
              </div>
              {user?.role === 'AGENT' && (
                <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-[#0f3d56] ring-1 ring-inset ring-[#0f3d56]/20">
                  AGENT_{String(user.id).padStart(3, '0')}
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <User className="h-4 w-4 text-[#5ac4d7]" /> Full Name
              </label>
              {isEditingProfile ? (
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-[#5ac4d7] focus:ring-1 focus:ring-[#5ac4d7] font-semibold text-slate-800 transition-all" 
                />
              ) : (
                <div className="text-slate-800 font-bold py-2">{user?.full_name}</div>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Mail className="h-4 w-4 text-[#5ac4d7]" /> Email Address
              </label>
              {user?.email ? (
                <div className="text-slate-800 font-bold py-2 opacity-70 cursor-not-allowed flex items-center">
                  {user.email} <span className="text-xs text-slate-400 ml-2 font-normal">(Cannot be changed)</span>
                </div>
              ) : isEditingProfile ? (
                <div className="space-y-1">
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="add-email@example.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-[#5ac4d7] focus:ring-1 focus:ring-[#5ac4d7] font-semibold text-slate-800 transition-all" 
                  />
                  <p className="text-[10px] text-amber-600 font-bold">Required for account recovery. Once added, it cannot be changed.</p>
                </div>
              ) : (
                <div className="text-slate-800 font-bold py-2 flex items-center gap-2">
                  <span className="text-slate-400 italic">Not set</span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/50">Required for account recovery</span>
                </div>
              )}
            </div>
            
            <div className="space-y-1.5 sm:col-span-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Phone className="h-4 w-4 text-[#5ac4d7]" /> Phone Number
              </label>
              {isEditingProfile ? (
                <input 
                  type="tel" 
                  id="phoneNumber"
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  placeholder="Enter phone number" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-[#5ac4d7] focus:ring-1 focus:ring-[#5ac4d7] max-w-sm font-semibold text-slate-800 transition-all" 
                />
              ) : (
                <div className="text-slate-800 font-bold py-2">{user?.phone_number || 'Not provided'}</div>
              )}
            </div>

            {/* Agent Specific Details */}
            {user?.role === 'AGENT' && (
              <>
                <div className="sm:col-span-2 my-2 border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0f3d56] mb-4">Agent Business Information</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Building2 className="h-4 w-4 text-[#5ac4d7]" /> Company Name
                  </label>
                  <div className="text-slate-800 font-bold py-2">
                    {user?.company_name || <span className="text-slate-400 font-normal italic">Not configured</span>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <FileText className="h-4 w-4 text-[#5ac4d7]" /> GST Number
                  </label>
                  {isEditingProfile ? (
                    <input 
                      type="text" 
                      value={gstNumber} 
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="Enter GSTIN"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-[#5ac4d7] focus:ring-1 focus:ring-[#5ac4d7] font-semibold text-slate-800 transition-all" 
                    />
                  ) : (
                    <div className="text-slate-800 font-bold py-2">
                      {user?.gst_number || <span className="text-slate-400 font-normal italic">Not configured</span>}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <MapPin className="h-4 w-4 text-[#5ac4d7]" /> Address
                  </label>
                  {isEditingProfile ? (
                    <textarea 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      placeholder="Enter business address"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-[#5ac4d7] focus:ring-1 focus:ring-[#5ac4d7] font-semibold text-slate-800 transition-all resize-none" 
                    />
                  ) : (
                    <div className="text-slate-800 font-bold py-2 whitespace-pre-wrap">
                      {user?.address || <span className="text-slate-400 font-normal italic">Not configured</span>}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {user?.commission_type === 'PERCENTAGE' ? (
                      <Percent className="h-4 w-4 text-[#5ac4d7]" />
                    ) : (
                      <IndianRupee className="h-4 w-4 text-[#5ac4d7]" />
                    )}
                    Commission Settings
                  </label>
                  <div className="text-slate-800 font-bold py-2">
                    {user?.commission_type === 'PERCENTAGE' ? (
                      <span>Percentage-based: <strong className="text-green-600">{user?.commission_percentage}%</strong></span>
                    ) : user?.commission_type === 'FIXED_AMOUNT' ? (
                      <span>Fixed Amount per seat/booking: <strong className="text-green-600">₹{user?.commission_fixed_amount}</strong></span>
                    ) : (
                      <span className="text-slate-400 font-normal italic">No commission configured</span>
                    )}
                  </div>
                </div>

                {user?.admin_notes && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <FileText className="h-4 w-4 text-[#5ac4d7]" /> Admin Notes / Instructions
                    </label>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 font-medium text-sm leading-relaxed whitespace-pre-line">
                      {user.admin_notes}
                    </div>
                  </div>
                )}
              </>
            )}

            {isEditingProfile && (
              <div className="sm:col-span-2 pt-4">
                <button 
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="rounded-xl bg-[#0f3d56] text-white px-8 py-3 text-sm font-bold shadow-md hover:bg-[#1a5663] transition-all hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
