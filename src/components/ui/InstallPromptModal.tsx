'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, Download } from 'lucide-react';

export default function InstallPromptModal() {
  const pathname = usePathname();
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Never show on print pages
  const isPrintPage = pathname?.startsWith('/print');

  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);

    const params = new URLSearchParams(window.location.search);
    const forceShow = params.get('force-pwa') === 'true';

    // Dismissed check
    const isDev = process.env.NODE_ENV === 'development';
    const dismissedTime = isDev
      ? sessionStorage.getItem('pwa-prompt-dismissed')
      : localStorage.getItem('pwa-prompt-dismissed-time');

    let isCurrentlyDismissed = false;
    if (dismissedTime && !isDev) {
      const parsedTime = parseInt(dismissedTime, 10);
      if (!isNaN(parsedTime) && Date.now() - parsedTime < 24 * 60 * 60 * 1000) {
        isCurrentlyDismissed = true;
      }
    } else if (isDev && dismissedTime === 'true') {
      isCurrentlyDismissed = true;
    }

    if (isStandaloneMode || (isCurrentlyDismissed && !forceShow)) return;

    // Detect iOS (including iPadOS 13+)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.maxTouchPoints > 0 && /macintosh/.test(userAgent));
    setIsIOS(isIosDevice);

    // Show prompt after a smooth 2.5s delay on all devices (mobile & desktop)
    const timer = setTimeout(() => setShowPrompt(true), 2500);

    // Android / Chrome deferred prompt capture
    const globalPrompt = (window as any).deferredPrompt;
    if (globalPrompt) {
      setDeferredPrompt(globalPrompt);
    }

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
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('deferredpromptavailable', handleCustomPromptEvent);
    };
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    if (process.env.NODE_ENV === 'development') {
      sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    } else {
      localStorage.setItem('pwa-prompt-dismissed-time', Date.now().toString());
    }
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      // On iOS — try to open the native Safari Share Sheet via Web Share API
      try {
        if (navigator.share) {
          await navigator.share({ title: 'TS Boat Tourism', url: window.location.origin });
        }
      } catch {
        // user cancelled — just dismiss
      }
      handleDismiss();
      return;
    }
    const promptEvent = deferredPrompt || (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') setShowPrompt(false);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    } else {
      // Direct navigation or fallback for installed state
      handleDismiss();
    }
  };

  if (!showPrompt || isStandalone || isPrintPage) return null;

  return (
    <div className="fixed bottom-[4.25rem] left-3 right-3 z-[85] animate-in slide-in-from-bottom-6 fade-in duration-300 sm:bottom-4 sm:left-4 sm:right-auto sm:w-[350px] print:hidden">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_12px_36px_rgba(0,0,0,0.18)] border border-slate-200/90 p-4">
        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          aria-label="Close install prompt"
          className="absolute right-3 top-3 z-20 rounded-full bg-slate-100 p-1.5 text-slate-600 transition-colors hover:bg-slate-200 shadow-xs"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex gap-3.5 items-center mb-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0f3d56] p-1.5 shadow-md">
            <img src="/logo.png" alt="TS Boat Tourism" className="h-full w-full object-contain" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="text-sm font-black text-slate-900 leading-tight">Install TS Tourism App</h3>
            <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">
              Godavari cruises &amp; offline tickets on your phone
            </p>
          </div>
        </div>

        {/* Single CTA — same for both iOS and Android */}
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1598a1] to-[#0d6e75] px-4 py-3 text-sm font-black text-white shadow-[0_6px_20px_rgba(21,152,161,0.4)] transition-all hover:shadow-[0_8px_24px_rgba(21,152,161,0.5)] active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          Install Now
        </button>
      </div>
    </div>
  );
}
