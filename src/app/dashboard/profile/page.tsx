'use client';

import { useAuthStore } from '@/stores/authStore';
import { User, Mail, Phone, Edit2, Camera, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with store user data
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhoneNumber(user.phone_number || '');
      setAvatarUrl(user.avatar_url || '');
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

    setIsSaving(true);
    try {
      const response = await apiClient.put('/api/v1/auth/me', {
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim() || null,
        avatar_url: avatarUrl || null,
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
              accept="image/*" 
              className="hidden" 
            />

            <div className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
              Verified Account
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
              <div className="text-slate-800 font-bold py-2 opacity-70 cursor-not-allowed">
                {user?.email} <span className="text-xs text-amber-600 ml-2 font-normal">(Cannot be changed)</span>
              </div>
            </div>
            
            <div className="space-y-1.5 sm:col-span-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Phone className="h-4 w-4 text-[#5ac4d7]" /> Phone Number
              </label>
              {isEditingProfile ? (
                <input 
                  type="tel" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-[#5ac4d7] focus:ring-1 focus:ring-[#5ac4d7] max-w-sm font-semibold text-slate-800 transition-all" 
                />
              ) : (
                <div className="text-slate-800 font-bold py-2">{user?.phone_number || 'Not provided'}</div>
              )}
            </div>

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
