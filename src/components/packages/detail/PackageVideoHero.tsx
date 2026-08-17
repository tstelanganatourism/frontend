'use client';

import { Film } from 'lucide-react';
import { ExperienceVideoPlayer } from '@/components/ui/ExperienceVideoPlayer';

interface PackageVideoHeroProps {
  videoUrl: string;
  title?: string;
  subtitle?: string;
}

export function PackageVideoHero({ videoUrl, title = 'Watch the Tour', subtitle }: PackageVideoHeroProps) {
  if (!videoUrl) return null;

  return (
    <section id="video" className="scroll-mt-[170px]">
      <div className="mb-5 max-w-2xl">
        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#117987] sm:text-xs">
          <Film className="h-3.5 w-3.5" />
          Tour film
        </span>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0f3d56] md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{subtitle}</p>}
      </div>

      <ExperienceVideoPlayer videoUrl={videoUrl} label={title} />

      <p className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-400">
        <span className="h-px w-6 bg-[#7ce1d7]/70" />
        Hover over the video to reveal controls.
      </p>
    </section>
  );
}
