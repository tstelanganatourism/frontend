'use client';

import React, { useState, useRef } from 'react';
import { Upload, X as CloseIcon, Loader2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  helperText?: string;
}

export default function MultiImageUpload({ value, onChange, label, helperText }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | File[]) => {
    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      // Upload files sequentially to avoid rate limits / overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/api/v1/admin/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newUrls.push(response.data.url);
      }
      
      onChange([...value, ...newUrls]);
      toast.success(`Successfully uploaded ${newUrls.length} image(s)`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload one or more images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const newValues = value.filter((_, idx) => idx !== indexToRemove);
    onChange(newValues);
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files);
    }
    // Reset input so the same files can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {label && (
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
          {helperText && <p className="text-xs font-medium text-slate-400 mt-1">{helperText}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Render existing images */}
        {value.map((url, index) => (
          <div key={`${url}-${index}`} className="relative group aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
            <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2">
              <div className="flex justify-between items-start">
                {index === 0 ? (
                  <span className="bg-[#5ac4d7] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                    Cover
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white transition-transform transform hover:scale-110 shadow-sm"
                  title="Remove image"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Upload Button/Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragActive
              ? 'border-[#5ac4d7] bg-[#5ac4d7]/5'
              : 'border-slate-300 hover:border-[#5ac4d7] bg-slate-50 hover:bg-[#5ac4d7]/5'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*;capture=camera"
            multiple
            className="hidden"
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 text-[#5ac4d7] animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-full text-slate-400">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-600 text-center px-4">
                Drag & Drop Photos<br/><span className="font-normal text-[10px] text-slate-400">or click to browse</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
