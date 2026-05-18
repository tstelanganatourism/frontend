'use client';

import React, { useState, useRef } from 'react';
import { Upload, X as CloseIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
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
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload image');
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

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>}
      
      {value ? (
        <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 h-48 flex items-center justify-center">
          <img src={value} alt="Preview" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button 
              type="button"
              onClick={() => onChange('')} 
              className="p-3 bg-red-600 hover:bg-red-500 rounded-full text-white transition-all transform hover:scale-110"
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
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all min-h-48 text-center ${
            dragActive 
              ? 'border-[#5ac4d7] bg-[#5ac4d7]/5' 
              : 'border-slate-200 hover:border-[#5ac4d7] hover:bg-slate-50'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden" 
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 text-[#5ac4d7] animate-spin" />
              <p className="text-sm font-semibold text-slate-500">Uploading to Cloudinary...</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-slate-100 rounded-2xl">
                <Upload className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Drag & drop your image here</p>
                <p className="text-xs text-slate-400 mt-1">or click to browse from your computer</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
