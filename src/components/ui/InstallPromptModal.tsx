'use client';

import { useState, useEffect } from 'react';
import { X, Download, Share, PlusSquare } from 'lucide-react';

export default function InstallPromptModal() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone || 
                             document.referrer.includes('android-app://');
    
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode || localStorage.getItem('pwa-prompt-dismissed') === 'true') {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // Show immediately on iOS if not dismissed
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-10 fade-in duration-500 sm:bottom-4 sm:left-auto sm:right-4 sm:w-[380px]">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 p-5">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full bg-slate-100 p-1.5 text-slate-500 transition-colors hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5ac4d7] to-[#1a6b7a] shadow-inner">
            <Download className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-black text-slate-900 leading-tight mb-1">
              Install our App
            </h3>
            
            {isIOS ? (
              <div className="text-xs text-slate-600 font-medium space-y-2">
                <p>Install Telangana Boat Tourism for a faster, better experience.</p>
                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex items-center gap-2">
                  <span className="flex items-center gap-1">1. Tap <Share className="h-3.5 w-3.5 text-blue-500" /></span>
                  <span className="flex items-center gap-1">2. Tap <PlusSquare className="h-3.5 w-3.5 text-slate-700" /> <b>Add to Home Screen</b></span>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Install Telangana Boat Tourism for offline access, faster booking, and exclusive updates.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full rounded-xl bg-[#1a6b7a] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#0f3d56] hover:-translate-y-0.5"
                >
                  Install App Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
