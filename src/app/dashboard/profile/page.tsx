'use client';

import { useAuthStore } from '@/stores/authStore';
import {
  User,
  Mail,
  Phone,
  Edit2,
  Camera,
  Loader2,
  Building2,
  Percent,
  IndianRupee,
  FileText,
  MapPin,
  CheckCircle,
  Shield,
  Star,
  Check,
  X,
  Briefcase,
  BadgeCheck,
  Sparkles,
} from 'lucide-react';
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
  const [imgError, setImgError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAgent = user?.role === 'AGENT';

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

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only image files (JPG, PNG, WEBP, GIF) are allowed.');
      return;
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    const loadingToast = toast.loading('Uploading profile picture...');

    try {
      const response = await apiClient.post('/api/v1/auth/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newUrl = response.data.url;
      setAvatarUrl(newUrl);
      setImgError(false);

      // Save updated avatar URL to user profile
      const updateResponse = await apiClient.put('/api/v1/auth/me', { avatar_url: newUrl });
      updateUser(updateResponse.data);
      toast.success('Profile picture updated successfully!', { id: loadingToast });
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      toast.error(err.response?.data?.detail || 'Failed to upload image.', { id: loadingToast });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

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

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : isAgent
    ? 'AG'
    : 'US';

  return (
    <>
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-up { animation: fade-up 0.4s ease forwards; }

        .profile-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid rgba(30,70,138,0.07);
          box-shadow: 0 1px 14px rgba(30,70,138,0.05);
          transition: all 0.22s ease;
        }

        .profile-field-label {
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .profile-field-value {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          padding: 8px 14px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }

        .profile-input {
          width: 100%;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          transition: all 0.18s;
          background: #fff;
        }

        .profile-input:focus {
          border-color: ${isAgent ? '#1e3a5f' : '#0e6b74'};
          box-shadow: 0 0 0 3px ${isAgent ? 'rgba(30,58,95,0.1)' : 'rgba(14,107,116,0.1)'};
        }
      `}</style>

      <div className="space-y-5 max-w-3xl mx-auto anim-fade-up">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Manage your personal information and account preferences
            </p>
          </div>

          {!isEditingProfile ? (
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
            >
              <Edit2 className="h-3.5 w-3.5 text-slate-500" />
              Edit Profile
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-all cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          )}
        </div>

        {/* ── User Overview Hero Card (Clean Aesthetic - No Harsh Gradients) ── */}
        <div className="profile-card p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

            {/* Avatar Container with Upload Trigger */}
            <div className="relative group shrink-0">
              <div
                onClick={triggerFileInput}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden cursor-pointer border-2 border-slate-100 shadow-sm flex items-center justify-center transition-all group-hover:border-teal-500"
                style={{
                  background: isAgent
                    ? 'linear-gradient(135deg, #12283a, #1e3a5f)'
                    : 'linear-gradient(135deg, #0b3d52, #0e6b74)',
                }}
              >
                {avatarUrl && !imgError ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-white font-black text-3xl sm:text-4xl tracking-wider">
                    {initials}
                  </span>
                )}

                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-5 w-5 text-white mb-1" />
                      <span className="text-[10px] text-white font-bold">Change Photo</span>
                    </>
                  )}
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleAvatarChange}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
              />

              {/* Camera badge icon */}
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={isUploading}
                aria-label="Upload profile picture"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-teal-600 hover:border-teal-300 transition-all cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Profile Info Summary */}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider"
                  style={{
                    background: isAgent ? '#fef3c7' : '#e8f8fb',
                    color: isAgent ? '#b45309' : '#0e6b74',
                    border: isAgent ? '1px solid #fde68a' : '1px solid rgba(14,107,116,0.18)',
                  }}
                >
                  {isAgent ? (
                    <>
                      <Briefcase className="h-3 w-3 text-amber-600" /> Agent Console
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="h-3 w-3 text-teal-600" /> Tourist Account
                    </>
                  )}
                </span>

                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200"
                >
                  <CheckCircle className="h-3 w-3 text-emerald-500" /> Verified
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {user?.full_name || 'Traveler'}
              </h2>

              <p className="text-xs font-medium text-slate-400 mt-1">
                {isAgent
                  ? `Authorized Partner #${user?.id || ''} — Managed via TS Boat Tourism`
                  : 'Godavari Tourist Portal Member'}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{user?.phone_number || 'No phone number'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate max-w-[200px]">{user?.email || 'No email attached'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Personal Information Section ── */}
        <div className="profile-card p-6 sm:p-7">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
            <User className="h-4 w-4 text-teal-600" />
            Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Full Name */}
            <div>
              <div className="profile-field-label">
                <User className="h-3.5 w-3.5 text-slate-400" /> Full Name
              </div>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="profile-input"
                  placeholder="Your full name"
                />
              ) : (
                <div className="profile-field-value">{user?.full_name || '—'}</div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <div className="profile-field-label">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> Phone Number
              </div>
              {isEditingProfile ? (
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className="profile-input"
                />
              ) : (
                <div className="profile-field-value">{user?.phone_number || '—'}</div>
              )}
            </div>

            {/* Email Address */}
            <div className="sm:col-span-2">
              <div className="profile-field-label">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address
              </div>
              {user?.email ? (
                <div className="flex items-center gap-3">
                  <div className="profile-field-value flex-1">{user.email}</div>
                  <span className="text-[10px] font-bold text-slate-400 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                    Primary Account Email
                  </span>
                </div>
              ) : isEditingProfile ? (
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address for booking receipts & ticket PDFs"
                    className="profile-input"
                  />
                  <p className="text-[11px] text-amber-700 font-medium mt-1.5">
                    Adding an email allows sending PDF tickets directly to your inbox.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="profile-field-value text-slate-400 font-normal italic flex-1">
                    Not set
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="text-[11px] text-teal-700 font-bold px-3 py-1 rounded-lg bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors shrink-0"
                  >
                    + Add Email
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Agent Business Details (Shown only for AGENT role) ── */}
        {isAgent && (
          <div className="profile-card p-6 sm:p-7 space-y-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-600" />
              Agent Business Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Company Name */}
              <div>
                <div className="profile-field-label">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> Agency / Company Name
                </div>
                <div className="profile-field-value">
                  {user?.company_name || <span className="text-slate-400 font-normal italic">Not specified</span>}
                </div>
              </div>

              {/* GSTIN */}
              <div>
                <div className="profile-field-label">
                  <FileText className="h-3.5 w-3.5 text-slate-400" /> GST Number (GSTIN)
                </div>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    placeholder="Enter 15-character GSTIN"
                    className="profile-input font-mono"
                  />
                ) : (
                  <div className="profile-field-value font-mono">
                    {user?.gst_number || <span className="text-slate-400 font-normal italic font-sans">Not configured</span>}
                  </div>
                )}
              </div>

              {/* Business Address */}
              <div className="sm:col-span-2">
                <div className="profile-field-label">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Registered Business Address
                </div>
                {isEditingProfile ? (
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    placeholder="Enter your business location address"
                    className="profile-input resize-none"
                  />
                ) : (
                  <div className="profile-field-value whitespace-pre-wrap">
                    {user?.address || <span className="text-slate-400 font-normal italic">Not configured</span>}
                  </div>
                )}
              </div>

              {/* Commission Structure */}
              <div className="sm:col-span-2">
                <div className="profile-field-label">
                  {user?.commission_type === 'PERCENTAGE' ? (
                    <Percent className="h-3.5 w-3.5 text-amber-600" />
                  ) : (
                    <IndianRupee className="h-3.5 w-3.5 text-amber-600" />
                  )}
                  Commission Structure
                </div>
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center gap-3">
                  <Star className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    {user?.commission_type === 'PERCENTAGE' ? (
                      <p className="text-sm font-bold text-amber-900">
                        Percentage-based Commission:{' '}
                        <span className="text-amber-700 text-base font-black">
                          {user?.commission_percentage}%
                        </span>{' '}
                        per booking
                      </p>
                    ) : user?.commission_type === 'FIXED_AMOUNT' ? (
                      <p className="text-sm font-bold text-amber-900">
                        Fixed Amount Commission:{' '}
                        <span className="text-amber-700 text-base font-black">
                          ₹{user?.commission_fixed_amount}
                        </span>{' '}
                        per booking
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 font-medium italic">
                        No commission structure configured yet. Contact admin.
                      </p>
                    )}
                    <p className="text-[11px] text-amber-700/80 font-medium mt-0.5">
                      Margin retained automatically on offline bookings
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {user?.admin_notes && (
                <div className="sm:col-span-2">
                  <div className="profile-field-label">
                    <FileText className="h-3.5 w-3.5 text-slate-400" /> Admin Instructions
                  </div>
                  <div className="p-4 rounded-xl text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 border border-slate-200 whitespace-pre-line">
                    {user.admin_notes}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ── Save / Action Button Group ── */}
        {isEditingProfile && (
          <div className="profile-card p-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer hover:-translate-y-0.5 shadow-sm"
              style={{
                background: isAgent ? '#12283a' : '#0b3d52',
                boxShadow: isAgent ? '0 4px 14px rgba(18,40,58,0.2)' : '0 4px 14px rgba(11,61,82,0.2)',
              }}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save Profile
            </button>
          </div>
        )}

      </div>
    </>
  );
}
