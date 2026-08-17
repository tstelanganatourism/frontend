'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Expand, Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface ExperienceVideoPlayerProps {
  videoUrl: string;
  label: string;
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Shared, download-free presentation player for public package and room videos.
 * The actual media remains protected by the delivery layer; this component removes
 * browser download/PiP affordances from the public viewing experience.
 */
export function ExperienceVideoPlayer({ videoUrl, label }: ExperienceVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Start a silent preview only once the player itself is comfortably in view.
  useEffect(() => {
    const video = videoRef.current;
    const player = playerRef.current;
    if (!video || !player || hasStarted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        video.play().then(() => setHasStarted(true)).catch(() => {});
      },
      { threshold: 0.55 }
    );

    observer.observe(player);
    return () => observer.disconnect();
  }, [hasStarted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const seek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = Number(event.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const openFullscreen = () => {
    videoRef.current?.requestFullscreen?.().catch(() => {});
  };

  const preventContextMenu = (event: React.MouseEvent) => event.preventDefault();
  const progress = duration ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <div ref={playerRef} className="max-w-4xl rounded-[24px] bg-gradient-to-br from-[#0c4054] via-[#0b6370] to-[#102c3e] p-1 shadow-[0_18px_45px_-25px_rgba(10,73,91,0.65)] sm:rounded-[30px] sm:p-1.5">
      <div className="group relative isolate overflow-hidden rounded-[20px] bg-[#071d2b] sm:rounded-[25px]" onContextMenu={preventContextMenu}>
        <video
          ref={videoRef}
          src={videoUrl}
          className="aspect-video w-full cursor-pointer object-cover"
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          disableRemotePlayback
          aria-label={`${label} video`}
          onClick={togglePlay}
          onContextMenu={preventContextMenu}
          onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onVolumeChange={(event) => setIsMuted(event.currentTarget.muted)}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#071d2b]/50 via-transparent to-[#071d2b]/90" />

        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 sm:left-5 sm:top-5">
          <span className="h-2 w-2 rounded-full bg-[#7ce1d7] shadow-[0_0_0_4px_rgba(124,225,215,0.15)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/90">Experience preview</span>
        </div>

        {!isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={`Play ${label} video`}
            className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white shadow-xl backdrop-blur-md transition hover:scale-105 hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:h-16 sm:w-16"
          >
            <Play className="ml-0.5 h-6 w-6 fill-current" />
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3 transition-all duration-200 sm:p-4 md:pointer-events-none md:translate-y-3 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          <div className="rounded-2xl border border-white/15 bg-[#072535]/65 p-2.5 shadow-lg backdrop-blur-md sm:p-3">
            <input
              aria-label="Video progress"
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={seek}
              className="mb-2 block h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-[#7ce1d7]"
              style={{ background: `linear-gradient(to right, #7ce1d7 ${progress}%, rgba(255,255,255,.25) ${progress}%)` }}
            />
            <div className="flex items-center justify-between gap-2 text-white">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? `Pause ${label} video` : `Play ${label} video`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0b5361] transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-9 sm:w-9"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
                </button>
                <span className="text-[10px] font-bold text-white/80 sm:text-xs">
                  {formatTime(currentTime)} <span className="text-white/45">/</span> {formatTime(duration)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? `Unmute ${label} video` : `Mute ${label} video`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-9 sm:w-9"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={openFullscreen}
                  aria-label="Open video in fullscreen"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-9 sm:w-9"
                >
                  <Expand className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
