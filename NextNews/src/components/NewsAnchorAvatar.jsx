// src/components/NewsAnchorAvatar.jsx
import React, { useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

/**
 * NewsAnchorAvatar — Plays a pre-generated silent video of the anchor
 * and overlays audio from ElevenLabs TTS in sync.
 *
 * The video loops while playing and pauses when the audio pauses.
 */
const NewsAnchorAvatar = ({ audioUrl, isPlaying, onTogglePlay, volume = 80 }) => {
  const videoRef     = useRef(null);
  const audioRef     = useRef(null);
  const ctxRef       = useRef(null);
  const gainRef      = useRef(null);
  const sourceRef    = useRef(null);
  const connectedRef = useRef(false);

  // Connect audio to Web Audio API with a GainNode for volume control
  const ensureAudioContext = useCallback(() => {
    if (connectedRef.current || !audioRef.current) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const source = ctx.createMediaElementSource(audioRef.current);
    const gain = ctx.createGain();
    gain.gain.value = volume / 100;
    source.connect(gain);
    gain.connect(ctx.destination);
    sourceRef.current = source;
    gainRef.current = gain;

    connectedRef.current = true;
  }, []);

  // Apply volume changes in real time via the GainNode
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  // Sync video play/pause with audio play/pause
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    if (isPlaying && audioUrl) {
      // Resume AudioContext if suspended (browser autoplay policy)
      if (ctxRef.current?.state === "suspended") {
        ctxRef.current.resume();
      }
      video.play().catch(() => {});
      if (audio) audio.play().catch(() => {});
    } else {
      video.pause();
      if (audio) audio.pause();
    }
  }, [isPlaying, audioUrl]);

  // When audio ends, pause the video and notify parent
  const handleAudioEnded = useCallback(() => {
    if (videoRef.current) videoRef.current.pause();
    onTogglePlay?.();
  }, [onTogglePlay]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (sourceRef.current) { try { sourceRef.current.disconnect(); } catch {} }
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handlePlayClick = () => {
    ensureAudioContext();
    onTogglePlay?.();
  };

  return (
    <div className="relative w-full h-full">
      {/* Hidden audio element for ElevenLabs TTS */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          crossOrigin="anonymous"
          preload="auto"
          onEnded={handleAudioEnded}
        />
      )}

      <div className="aspect-video bg-[#0b0b1a] rounded-2xl overflow-hidden relative flex items-center justify-center">
        {/* The silent anchor video */}
        <video
          ref={videoRef}
          src="/anchor_video.mp4"
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          poster="/avatars/idle.png"
        />

        {/* Play / Pause overlay */}
        {audioUrl && (
          <button
            onClick={handlePlayClick}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/90 hover:bg-cyan-500 text-black font-semibold text-sm transition-all shadow-lg shadow-cyan-500/30 backdrop-blur-sm"
          >
            {isPlaying ? (
              <><Pause className="w-4 h-4" /> Pause</>
            ) : (
              <><Play className="w-4 h-4" /> Play News</>
            )}
          </button>
        )}

        {/* LIVE badge */}
        {isPlaying && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-xs text-white/60 font-medium">LIVE</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsAnchorAvatar;
