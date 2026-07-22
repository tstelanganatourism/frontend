import React from 'react';
import type { LucideIcon } from 'lucide-react';

type PublicPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  children?: React.ReactNode;
};

export default function PublicPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}: PublicPageHeaderProps) {
  return (
    <section className="border-b border-[#b9e4e5] bg-[linear-gradient(135deg,#e3f6f6_0%,#f7fbfb_52%,#d7efed_100%)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 md:py-8 lg:px-8">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] md:items-end">
          <div className="min-w-0">
            {eyebrow ? (
              <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-[#1598a1]/20 bg-white/70 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#1598a1] shadow-sm">
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {eyebrow}
              </div>
            ) : null}
            <h1 className="text-3xl font-black tracking-tight text-[#0f3d56] sm:text-4xl md:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600 sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
          {children ? <div className="min-w-0">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
