'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Expand, Pause, Play, Volume2, VolumeX, Sparkles } from 'lucide-react';

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
 * Premium, glassmorphic presentation player for public package and room videos.
 * Features customizable playback speeds, smooth transition animations, hover controls,
 * custom progress track, double-click fullscreen, and keyboard accessibility.
 */
export function ExperienceVideoPlayer({ videoUrl, label }: ExperienceVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0); // Default to 0 when muted initially
  const [hasStarted, setHasStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showControls, setShowControls] = useState(false);

  // Auto-play silent preview when player is scrolled into view
  useEffect(() => {
    const video = videoRef.current;
    const player = playerRef.current;
    if (!video || !player || hasStarted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        video.play()
          .then(() => {
            setHasStarted(true);
            setIsPlaying(true);
          })
          .catch(() => {});
      },
      { threshold: 0.55 }
    );

    observer.observe(player);
    return () => observer.disconnect();
  }, [hasStarted]);

  // Keyboard accessibility listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video || !playerRef.current) return;

      // Only handle events if focus is inside the player, or body is focused
      const isFocused = playerRef.current.contains(document.activeElement) || document.activeElement === document.body;
      if (!isFocused) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        openFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, volume]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuteState = !video.muted;
    video.muted = newMuteState;
    setIsMuted(newMuteState);

    if (newMuteState) {
      setVolume(0);
    } else {
      const targetVol = video.volume > 0 ? video.volume : 0.8;
      video.volume = targetVol;
      setVolume(targetVol);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const val = Number(e.target.value);
    video.volume = val;
    setVolume(val);

    const muted = val === 0;
    video.muted = muted;
    setIsMuted(muted);
  };

  const cycleSpeed = () => {
    const video = videoRef.current;
    if (!video) return;

    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];

    video.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
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
    <div
      ref={playerRef}
      tabIndex={0}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onFocus={() => setShowControls(true)}
      onBlur={() => setShowControls(false)}
      className="relative w-full overflow-hidden rounded-[24px] bg-slate-950 shadow-[0_24px_55px_-12px_rgba(7,29,43,0.4)] border border-white/5 outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:rounded-[30px]"
    >
      <div className="group relative isolate overflow-hidden w-full aspect-video" onContextMenu={preventContextMenu}>
        {/* Actual Video */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="h-full w-full cursor-pointer object-cover"
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          disableRemotePlayback
          aria-label={`${label} video`}
          onClick={togglePlay}
          onDoubleClick={openFullscreen}
          onContextMenu={preventContextMenu}
          onLoadedMetadata={(event) => {
            setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0);
            // Sync initial state
            setIsMuted(event.currentTarget.muted);
            setVolume(event.currentTarget.muted ? 0 : event.currentTarget.volume);
          }}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onVolumeChange={(event) => {
            setIsMuted(event.currentTarget.muted);
            if (event.currentTarget.muted) setVolume(0);
          }}
        />

        {/* Dynamic Dark Gradients Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Premium Floating "Experience Preview" Badge */}
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-slate-950/60 px-3.5 py-1.5 border border-white/10 backdrop-blur-md transition-all duration-300 group-hover:translate-y-1 sm:left-6 sm:top-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Experience preview</span>
        </div>

        {/* Premium Floating Sparkle Accent */}
        <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-slate-950/60 p-2.5 border border-white/10 backdrop-blur-md transition-all duration-300 group-hover:translate-y-1 sm:right-6 sm:top-6">
          <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
        </div>

        {/* Centered Large Pulse Play/Pause Button Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-[2px] transition-all duration-300">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={`Play ${label} video`}
              className="group/btn relative flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-2xl backdrop-blur-lg transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:border-white/40 focus:outline-none"
            >
              {/* Pulsing visual outer rings */}
              <span className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
              <span className="absolute -inset-2 rounded-full bg-white/5 animate-ping opacity-60" />
              <Play className="ml-1.5 h-9 w-9 fill-current text-white transition-transform duration-300 group-hover/btn:scale-105" />
            </button>
          </div>
        )}

        {/* Frosted Glass Floating Controls Bar */}
        <div className={`absolute inset-x-0 bottom-0 p-4 transition-all duration-300 ease-out sm:p-6 ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3.5 shadow-2xl backdrop-blur-xl sm:p-4">
            
            {/* Custom Interactive Progress Bar */}
            <div className="group/progress relative mb-3.5 flex items-center">
              <input
                aria-label="Video progress slider"
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={Math.min(currentTime, duration || 0)}
                onChange={seek}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/20 transition-all duration-150 group-hover/progress:h-2.5 focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #2dd4bf 0%, #2dd4bf ${progress}%, rgba(255,255,255,0.2) ${progress}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-3 text-white">
              {/* Play, Pause, Timeline */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? `Pause ${label} video` : `Play ${label} video`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0b5361] transition-transform hover:scale-105 active:scale-95 focus:outline-none"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  )}
                </button>
                <span className="text-xs font-semibold tabular-nums text-white/90">
                  {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
                </span>
              </div>

              {/* Volume Slider, Playback Speed, Fullscreen */}
              <div className="flex items-center gap-3.5">
                {/* Volume Section with expanding slider */}
                <div className="group/volume flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? `Unmute ${label} video` : `Mute ${label} video`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 focus:outline-none"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4.5 w-4.5" />
                    ) : (
                      <Volume2 className="h-4.5 w-4.5" />
                    )}
                  </button>
                  <input
                    aria-label="Volume slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="h-1 w-0 opacity-0 group-hover/volume:w-16 group-hover/volume:opacity-100 transition-all duration-300 bg-white/20 accent-teal-400 rounded-full cursor-pointer"
                  />
                </div>

                {/* Cycle Playback Speed Button */}
                <button
                  type="button"
                  onClick={cycleSpeed}
                  aria-label="Change playback speed"
                  className="inline-flex h-9 min-w-[50px] items-center justify-center rounded-full bg-white/10 px-2.5 text-[10px] font-black uppercase tracking-wider text-white hover:bg-white/20 transition focus:outline-none"
                >
                  {playbackSpeed.toFixed(2)}x
                </button>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={openFullscreen}
                  aria-label="Open video in fullscreen"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 focus:outline-none"
                >
                  <Expand className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
