'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X as CloseIcon } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
        >
          <div className="absolute top-4 right-4">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-8">
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
              type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
            }`}>
              <AlertCircle className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-black text-slate-800 text-center mb-2">{title}</h3>
            <p className="text-slate-500 text-center text-sm leading-relaxed mb-8">
              {message}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${
                  type === 'danger' 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                    : 'bg-[var(--color-brand-river)] hover:bg-[#1a5663] shadow-slate-200'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
