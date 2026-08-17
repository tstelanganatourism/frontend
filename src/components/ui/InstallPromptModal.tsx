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

    // Dismissed check (expires after 3 days)
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed-time');
    const hasOldDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
    let isCurrentlyDismissed = false;

    if (dismissedTime) {
      const parsedTime = parseInt(dismissedTime, 10);
      if (!isNaN(parsedTime) && Date.now() - parsedTime < 3 * 24 * 60 * 60 * 1000) {
        isCurrentlyDismissed = true;
      }
    } else if (hasOldDismissed) {
      isCurrentlyDismissed = true;
    }

    if (isStandaloneMode || (isCurrentlyDismissed && !forceShow)) return;

    // Detect iOS (including iPadOS 13+)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.maxTouchPoints > 0 && /macintosh/.test(userAgent));
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 2500);
      return () => clearTimeout(timer);
    }

    // Android / Chrome
    const globalPrompt = (window as any).deferredPrompt;
    if (globalPrompt) {
      setDeferredPrompt(globalPrompt);
      setShowPrompt(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
      setShowPrompt(true);
    };

    const handleCustomPromptEvent = () => {
      const p = (window as any).deferredPrompt;
      if (p) { setDeferredPrompt(p); setShowPrompt(true); }
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
    }
  };

  if (!showPrompt || isStandalone || isPrintPage) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-10 fade-in duration-500 sm:bottom-4 sm:left-4 sm:right-auto sm:w-[340px] print:hidden">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.14)] border border-slate-200 p-4">
        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          aria-label="Close install prompt"
          className="absolute right-3 top-3 rounded-full bg-slate-100 p-1.5 text-slate-500 transition-colors hover:bg-slate-200"
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
