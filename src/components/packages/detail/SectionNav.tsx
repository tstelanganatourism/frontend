'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Camera, CheckCircle2, FileText, Info, MapPin, ShieldCheck } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon?: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Details', icon: Info },
  { id: 'itinerary', label: 'Schedule', icon: Calendar },
  { id: 'inclusions', label: 'Includes', icon: CheckCircle2 },
  { id: 'boarding', label: 'Boarding', icon: MapPin },
  { id: 'faqs', label: 'FAQs', icon: ShieldCheck },
  { id: 'policies', label: 'Terms', icon: FileText },
  { id: 'gallery', label: 'Gallery', icon: Camera },
];

export const SectionNav = () => {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-130px 0px -70% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elements = navItems.map((item) => document.getElementById(item.id)).filter(Boolean);
    elements.forEach((el) => observer.observe(el!));

    return () => {
      elements.forEach((el) => observer.unobserve(el!));
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id); // Instantly set active
    const el = document.getElementById(id);
    if (el) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="sticky top-[65px] sm:top-[79px] z-30 border-b border-slate-200/70 bg-white/92 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
        <div className="flex flex-nowrap gap-2 overflow-x-auto py-3 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                type="button"
                className={`flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition-all whitespace-nowrap
                  ${isActive 
                    ? 'bg-[#0f3d56] text-white shadow-md shadow-[#0f3d56]/15'
                    : 'bg-slate-100 text-slate-600 hover:bg-[#e9f6f4] hover:text-[#0f3d56]'
                  }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
