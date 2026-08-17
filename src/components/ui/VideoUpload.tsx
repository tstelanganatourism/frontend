'use client';

import React, { useRef, useState } from 'react';
import { Video, Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface VideoUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string | null) => void;
}

export default function VideoUpload({ label = 'Tour Video', value, onChange }: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only MP4, WEBM, MOV video files are supported.');
      return;
    }
    const maxSizeMB = 100;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Video file must be under ${maxSizeMB}MB.`);
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/api/v1/admin/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 0,
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 90));
        },
      });
      setProgress(100);
      onChange(response.data.url);
      toast.success('Video uploaded successfully!');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(detail || err.message || 'Failed to upload video');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleRemove = () => {
    onChange(null);
    toast.info('Video removed.');
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
      )}

      {value ? (
        <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {/* Compact Video Player */}
            <div className="w-full sm:w-60 md:w-72 aspect-video max-h-[160px] sm:max-h-[180px] bg-black rounded-lg sm:rounded-xl overflow-hidden shrink-0 shadow-inner border border-slate-900/10">
              <video src={value} controls className="w-full h-full object-contain" preload="metadata" />
            </div>

            {/* Video Info & Action Controls */}
            <div className="flex-1 min-w-0 space-y-2 w-full">
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 w-fit">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs font-bold">Video uploaded & ready</span>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Highlight video is saved. It will render in the "Watch the Tour" section on the public page.
              </p>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0d6e75] text-slate-700 hover:text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  <Upload className="h-3 w-3" />
                  Replace Video
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all"
                  aria-label="Remove video"
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl sm:rounded-2xl border-2 border-dashed p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-[#5ac4d7] bg-[#5ac4d7]/5 scale-[1.005]'
              : 'border-slate-200 bg-white hover:border-[#5ac4d7]/60 hover:bg-slate-50/50'
          } ${uploading ? 'cursor-not-allowed opacity-80' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-full bg-[#0f3d56]/10 flex items-center justify-center shrink-0">
                <Loader2 className="h-5 w-5 text-[#5ac4d7] animate-spin" />
              </div>
              <div className="flex-1 w-full">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">Uploading to Cloudinary…</span>
                  <span className="text-xs font-black text-[#5ac4d7]">{progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#5ac4d7] to-[#0f8d7d] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0f3d56]/10 to-[#5ac4d7]/20 flex items-center justify-center shrink-0">
                  <Video className="h-4.5 w-4.5 text-[#0d6e75]" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-800">Upload Highlight Video</p>
                  <p className="text-[11px] font-semibold text-slate-400">Drag & drop or click to browse (MP4, WEBM, MOV · max 100MB)</p>
                </div>
              </div>
              <span className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#0d6e75] text-white text-xs font-bold shadow-xs hover:bg-[#0b5c62] transition-colors">
                Choose Video
              </span>
            </>
          )}
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
