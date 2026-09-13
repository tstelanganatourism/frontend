'use client';

import React, { useState } from 'react';
import { ArrowUpRight, MapPin, Map as MapIcon } from 'lucide-react';

const MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3801.622075248225!2d80.8840206!3d17.6680497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a36a9b83aea4343%3A0x7108b8976c666ac7!2sTS%20BOAT%20TOURISM!5e0!3m2!1sen!2sin!4v1785936445858!5m2!1sen!2sin';

export default function FooterMapSection() {
  const [loadMap, setLoadMap] = useState(false);

  return (
    <section className="overflow-hidden rounded-md border border-white/10 bg-white/[0.04] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8eecee]">
          Official Map
        </h3>
        <a
          href="https://g.page/r/CcdqZmyXuAhxEAI"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/72 hover:text-white"
        >
          Open Maps
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
      {loadMap ? (
        <iframe
          title="TS Boat Tourism map"
          src={MAP_EMBED_URL}
          className="h-[15.5rem] w-full rounded-md bg-white md:h-[17.5rem] lg:h-full lg:min-h-[18rem]"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="relative flex h-[15.5rem] w-full flex-col items-center justify-center rounded-md border border-white/10 bg-[#082834]/80 p-6 text-center md:h-[17.5rem] lg:h-full lg:min-h-[18rem]">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#1598a1]/20 text-[#8eecee] shadow-inner">
            <MapPin className="h-6 w-6 text-[#8eecee]" />
          </div>
          <h4 className="text-sm font-bold text-white">Bhadrachalam Tourism Office</h4>
          <p className="mt-1 max-w-[240px] text-xs text-white/60">
            Om Shanthi Building, Near Bus Stand &amp; Godavari River Ghats
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setLoadMap(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1598a1] px-4 py-2 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 hover:bg-[#1bb2bd]"
            >
              <MapIcon className="h-3.5 w-3.5" />
              Load Interactive Map
            </button>
            <a
              href="https://g.page/r/CcdqZmyXuAhxEAI"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Open in App
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
