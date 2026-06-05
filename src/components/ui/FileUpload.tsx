'use client';

import React, { useState, useRef } from 'react';
import { Upload, X as CloseIcon, FileText, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  fileTypeLabel?: string;
}

export default function FileUpload({ value, onChange, label, accept = "application/pdf", fileTypeLabel = "PDF Document" }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    const acceptedTypes = accept.split(',').map((type) => type.trim()).filter(Boolean);
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      toast.error(`Please upload a valid ${fileTypeLabel}.`);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/api/v1/admin/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onChange(response.data.url);
      toast.success('File uploaded successfully');
    } catch (err: unknown) {
      const responseData = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } | string } }).response?.data
        : undefined;
      const detail = typeof responseData === 'string' ? responseData : responseData?.detail;
      toast.error(detail || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleFileClick = async () => {
    if (!value) return;
    try {
      if (value.startsWith('private/')) {
        const response = await apiClient.post('/api/v1/documents/signed-url', {
          object_key: value
        });
        window.open(response.data.url, '_blank');
      } else {
        window.open(value, '_blank');
      }
    } catch (err) {
      toast.error('Failed to open file');
    }
  };

  // Extract filename from URL/Key if possible
  const getDisplayFilename = (path: string) => {
    const parts = path.split('/');
    const file = parts[parts.length - 1];
    // Remove the UUID if it matches the pattern (UUID length is 36 + 1 for underscore)
    if (file.length > 37 && file[36] === '_') {
      return file.substring(37);
    }
    return file;
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>}
      
      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:p-5 min-h-[96px] flex items-center justify-between gap-3 sm:gap-4 transition-all hover:border-emerald-200">
          <div 
            className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer group"
            onClick={handleFileClick}
          >
            <div className="p-3 bg-emerald-100/70 rounded-xl text-emerald-600 shrink-0 group-hover:bg-emerald-200/70 transition-colors">
              <FileText className="h-6 w-6" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors" title={getDisplayFilename(value)}>
                {getDisplayFilename(value)}
              </p>
              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Uploaded successfully • Click to view
              </p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={() => onChange('')} 
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:scale-105 shrink-0"
            title="Remove File"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all min-h-32 text-center ${
            dragActive 
              ? 'border-[#5ac4d7] bg-[#5ac4d7]/5' 
              : 'border-slate-200 hover:border-[#5ac4d7] hover:bg-slate-50'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden" 
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-[#5ac4d7] animate-spin" />
              <p className="text-sm font-semibold text-slate-500">Uploading securely...</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-slate-100 rounded-xl">
                <Upload className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Drag & drop your {fileTypeLabel}</p>
                <p className="text-xs text-slate-400 mt-1">or click to browse</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
