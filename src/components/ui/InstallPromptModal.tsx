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

    const params = new URLSearchParams(window.location.search);
    const forceShow = params.get('force-pwa') === 'true';

    // Dismissed check (expires after 3 days)
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed-time');
    const hasOldDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
    let isCurrentlyDismissed = false;

    if (dismissedTime) {
      const parsedTime = parseInt(dismissedTime, 10);
      if (!isNaN(parsedTime) && (Date.now() - parsedTime < 3 * 24 * 60 * 60 * 1000)) {
        isCurrentlyDismissed = true;
      }
    } else if (hasOldDismissed) {
      isCurrentlyDismissed = true;
    }

    if (isStandaloneMode || (isCurrentlyDismissed && !forceShow)) {
      return;
    }

    // Detect iOS (including iPadOS 13+)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || 
                        (window.navigator.maxTouchPoints > 0 && /macintosh/.test(userAgent));
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // Show immediately on iOS if not dismissed (or if forced)
      const timer = setTimeout(() => setShowPrompt(true), 2500);
      return () => clearTimeout(timer);
    }

    // Android / Chrome: check if prompt is already captured by global listener
    const globalPrompt = (window as any).deferredPrompt;
    if (globalPrompt) {
      setDeferredPrompt(globalPrompt);
      setShowPrompt(true);
    }

    // Handlers for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
      setShowPrompt(true);
    };

    const handleCustomPromptEvent = () => {
      const p = (window as any).deferredPrompt;
      if (p) {
        setDeferredPrompt(p);
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('deferredpromptavailable', handleCustomPromptEvent);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('deferredpromptavailable', handleCustomPromptEvent);
    };
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed-time', Date.now().toString());
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    }
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-10 fade-in duration-500 sm:bottom-4 sm:left-4 sm:right-auto sm:w-[380px]">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 p-5">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full bg-slate-100 p-1.5 text-slate-500 transition-colors hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-4 items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0f3d56] p-1.5 shadow-md border border-white/20">
            <img src="/logo.png" alt="TS Boat Tourism Logo" className="h-full w-full object-contain" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-black text-slate-900 leading-tight mb-1">
              Install TS Tourism App
            </h3>
            
            {isIOS ? (
              <div className="text-xs text-slate-600 font-medium space-y-2">
                <p className="leading-snug">Install TS Boat Tourism for instant Godavari cruise bookings &amp; offline ticket access.</p>
                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5">1. Tap the Share button <Share className="h-3.5 w-3.5 text-blue-500 inline" /></span>
                  <span className="flex items-center gap-1.5">2. Scroll down &amp; select <b>Add to Home Screen</b> <PlusSquare className="h-3.5 w-3.5 text-slate-700 inline" /></span>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500 font-medium mb-3 leading-relaxed">
                  Get instant Godavari cruise bookings, bamboo hut stays &amp; offline ticket access directly on your phone!
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full rounded-xl bg-[#0d6e75] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#0b5c62] hover:-translate-y-0.5"
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
