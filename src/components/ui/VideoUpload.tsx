'use client';

import React, { useRef, useState } from 'react';
import { Video, Upload, X, Loader2, CheckCircle2, Link as LinkIcon, Play } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { getYouTubeId, getYouTubeEmbedUrl } from '@/lib/utils';

function YoutubeIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

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
  const [mode, setMode] = useState<'upload' | 'youtube'>('youtube');
  const [youtubeInput, setYoutubeInput] = useState('');

  const ytId = value ? getYouTubeId(value) : null;
  const ytEmbed = ytId ? getYouTubeEmbedUrl(value, false) : null;

  const handleApplyYouTube = (urlToApply?: string) => {
    const raw = (urlToApply !== undefined ? urlToApply : youtubeInput).trim();
    if (!raw) {
      toast.error('Please enter a YouTube video URL');
      return;
    }
    const extractedId = getYouTubeId(raw);
    if (!extractedId) {
      toast.error('Invalid YouTube link. Please enter a valid YouTube video or shorts URL.');
      return;
    }
    const cleanUrl = `https://www.youtube.com/watch?v=${extractedId}`;
    onChange(cleanUrl);
    setYoutubeInput('');
    toast.success('YouTube video linked successfully!');
  };

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
    setYoutubeInput('');
    toast.info('Video removed.');
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
      )}

      {value ? (
        <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {/* Player Preview */}
            <div className="w-full sm:w-60 md:w-72 aspect-video max-h-[160px] sm:max-h-[180px] bg-black rounded-lg sm:rounded-xl overflow-hidden shrink-0 shadow-inner border border-slate-900/10 relative">
              {ytEmbed ? (
                <iframe
                  src={ytEmbed}
                  title="YouTube Preview"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <video src={value} controls className="w-full h-full object-contain" preload="none" />
              )}
            </div>

            {/* Video Info & Action Controls */}
            <div className="flex-1 min-w-0 space-y-2 w-full">
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 w-fit">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs font-bold">
                  {ytId ? `YouTube Video Linked (ID: ${ytId})` : 'Cloud Video Ready'}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed truncate">
                {value}
              </p>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0d6e75] text-slate-700 hover:text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  <Upload className="h-3 w-3" />
                  Upload MP4 File
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
        <div className="space-y-2.5">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
            <button
              type="button"
              onClick={() => setMode('youtube')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'youtube'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <YoutubeIcon className="h-3.5 w-3.5 text-rose-600" />
              YouTube Link (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'upload'
                  ? 'bg-[#0f3d56] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              Direct MP4 File Upload
            </button>
          </div>

          {mode === 'youtube' ? (
            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <YoutubeIcon className="h-4 w-4 text-rose-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Paste YouTube Video / Shorts Link</span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="url"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyYouTube();
                      }
                    }}
                    placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#5ac4d7] focus:bg-white transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyYouTube()}
                  className="px-4 py-2.5 rounded-xl bg-[#0d6e75] hover:bg-[#0b5c62] text-white text-xs font-black uppercase tracking-wider transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  Link Video
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Supports all YouTube links: watch videos, shorts, unlisted videos, and mobile links. Zero streaming bandwidth cost.
              </p>
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
                      <span className="text-xs font-bold text-slate-700">Uploading video to secure storage…</span>
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
                      <p className="text-xs font-black text-slate-800">Upload Video File</p>
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
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
