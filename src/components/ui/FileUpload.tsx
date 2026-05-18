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
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload file');
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
        <div className="relative group overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 h-32 flex items-center justify-center p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
              <FileText className="h-8 w-8" />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-sm font-bold text-emerald-800 truncate max-w-[200px]">{getDisplayFilename(value)}</p>
              <p className="text-xs font-semibold text-emerald-600/70 mt-0.5">Uploaded successfully</p>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button 
              type="button"
              onClick={() => onChange('')} 
              className="p-3 bg-red-600 hover:bg-red-500 rounded-full text-white transition-all transform hover:scale-110 shadow-lg"
              title="Remove File"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
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
