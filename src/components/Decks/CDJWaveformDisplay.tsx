import React, { useRef, useEffect } from 'react';
import { DeckState } from '../../types/dj';
import { audioEngine } from '../../services/audioEngine';

interface CDJWaveformDisplayProps {
  deck: DeckState;
  otherDeckBpm: number;
  onSeek: (time: number) => void;
}

export const CDJWaveformDisplay: React.FC<CDJWaveformDisplayProps> = ({
  deck,
  otherDeckBpm,
  onSeek,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overviewRef = useRef<HTMLCanvasElement>(null);
  const dataArray = useRef(new Uint8Array(128));

  const track = deck.track;
  const currentBpm = track ? track.bpm * deck.playbackRate : 128.0;
  const pitchPercent = (deck.playbackRate - 1) * 100;

  // Render Pioneer CDJ-3000 RGB 3-Band Zoom Waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Dark screen background
      ctx.fillStyle = '#020306';
      ctx.fillRect(0, 0, width, height);

      // Subtle horizontal center line
      ctx.strokeStyle = '#181c2b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      audioEngine.getDeckFrequencyData(deck.id, dataArray.current);

      const isPlaying = deck.isPlaying;
      const bpm = currentBpm;
      const duration = track?.duration || 180;
      const currentTime = deck.currentTime;

      // Zoom window: 6.5 seconds visible around playhead
      const visibleWindow = 6.5;
      const pixelsPerSec = width / visibleWindow;
      const playheadX = width / 2;

      // 1. Draw Beat Grid Markers (Red downbeats on 1, white on 2, 3, 4)
      const beatDuration = 60 / bpm;
      const firstBeat = Math.floor((currentTime - visibleWindow / 2) / beatDuration);
      const lastBeat = Math.ceil((currentTime + visibleWindow / 2) / beatDuration);

      for (let b = firstBeat; b <= lastBeat; b++) {
        if (b < 0) continue;
        const beatTime = b * beatDuration;
        const x = playheadX + (beatTime - currentTime) * pixelsPerSec;
        if (x >= 0 && x <= width) {
          const isBar = b % 4 === 0;
          ctx.strokeStyle = isBar ? 'rgba(239, 68, 68, 0.85)' : 'rgba(255, 255, 255, 0.18)';
          ctx.lineWidth = isBar ? 1.5 : 0.8;
          ctx.beginPath();
          ctx.moveTo(x, 4);
          ctx.lineTo(x, height - 4);
          ctx.stroke();

          // Bar number tick
          if (isBar) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
            ctx.font = 'bold 9px "Space Mono", monospace';
            ctx.fillText(`${Math.floor(b / 4) + 1}`, x + 3, 11);
          }
        }
      }

      // 2. High-Density Pioneer 3-Band RGB Waveform Bars
      // Lows (Bass/Kick) = Red/Magenta, Mids (Vocals/Leads) = Blue/Cyan, Highs = White/Yellow
      const barWidth = 2.5;
      const barGap = 1.5;
      const step = barWidth + barGap;
      const numBars = Math.floor(width / step);

      for (let i = 0; i < numBars; i++) {
        const x = i * step;
        const barTimeOffset = (x - playheadX) / pixelsPerSec;
        const barTime = currentTime + barTimeOffset;

        if (barTime >= 0 && barTime <= duration) {
          const freqIndex = (i * 2) % dataArray.current.length;
          const liveAmp = isPlaying ? (dataArray.current[freqIndex] || 60) / 255 : 0.25;

          const phase = (barTime % beatDuration) / beatDuration;
          const kickTransient = Math.exp(-phase * 6.0); // sharp kick punch
          const midLead = 0.4 + 0.3 * Math.sin(barTime * 4.0);
          const highSizzle = (dataArray.current[(freqIndex + 16) % dataArray.current.length] || 30) / 255;

          const totalAmp = Math.min(1.0, liveAmp * 0.4 + kickTransient * 0.45 + midLead * 0.25);
          const barH = Math.max(2, totalAmp * (height * 0.44));

          // Draw layered 3-Band colors:
          // Low Frequency (Red/Hot Pink)
          const lowH = barH * Math.min(1, kickTransient * 1.3 + 0.3);
          ctx.fillStyle = '#ff1a53';
          ctx.fillRect(x, centerY - lowH, barWidth, lowH * 2);

          // Mid Frequency (Electric Blue / Purple overlay)
          const midH = barH * 0.75;
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(x, centerY - midH, barWidth, midH * 2);

          // High Spikes (White / Cyan crest)
          if (kickTransient > 0.6 || highSizzle > 0.6) {
            const highH = barH * 0.4;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, centerY - highH, barWidth, highH * 2);
          }
        }
      }

      // 3. Center Red/White Dual Needle Playhead
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Top red needle flag
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(playheadX - 5, 0);
      ctx.lineTo(playheadX + 5, 0);
      ctx.lineTo(playheadX, 7);
      ctx.fill();

      // Bottom red needle flag
      ctx.beginPath();
      ctx.moveTo(playheadX - 5, height);
      ctx.lineTo(playheadX + 5, height);
      ctx.lineTo(playheadX, height - 7);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [deck, currentBpm, track]);

  // Render Full Track Overview Waveform Ribbon (Underneath)
  useEffect(() => {
    const canvas = overviewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    // Dark background
    ctx.fillStyle = '#06070d';
    ctx.fillRect(0, 0, width, height);

    const duration = track?.duration || 180;
    const currentTime = deck.currentTime;

    // Draw full track energy waveform with gradient (blue intro -> white/orange drops)
    const numPoints = 180;
    const pointWidth = width / numPoints;

    for (let p = 0; p < numPoints; p++) {
      const frac = p / numPoints;
      // Simulated energy envelope of club track (intro -> build -> drop 1 -> breakdown -> drop 2)
      let energy = 0.3 + 0.3 * Math.sin(frac * Math.PI);
      if ((frac > 0.22 && frac < 0.45) || (frac > 0.65 && frac < 0.88)) {
        energy = 0.85 + 0.15 * Math.sin(p * 0.8); // High drop intensity
      }
      const h = Math.max(2, energy * (height * 0.42));
      const x = p * pointWidth;

      // Color based on energy: cool blue for intro, radiant white/orange for drops
      ctx.fillStyle = energy > 0.7 ? '#fbbf24' : energy > 0.5 ? '#3b82f6' : '#6366f1';
      ctx.fillRect(x, centerY - h, pointWidth - 0.5, h * 2);
    }

    // Playhead line on overview
    const playX = (currentTime / duration) * width;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(playX - 1, 0, 2, height);

    // Red Hotcue pins on overview
    if (deck.hotcues) {
      Object.entries(deck.hotcues).forEach(([slot, t]) => {
        const hx = (t / duration) * width;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(hx - 1.5, 0, 3, 5);
      });
    }
  }, [track, deck.currentTime, deck.hotcues]);

  const handleOverviewClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overviewRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = clickX / rect.width;
    const newTime = fraction * (track?.duration || 180);
    onSeek(newTime);
  };

  return (
    <div className="w-full flex flex-col bg-[#030408] rounded-xl border border-slate-800/80 overflow-hidden select-none">
      {/* 1. Pioneer CDJ-3000 Zoom Waveform Viewport */}
      <div className="relative h-24 w-full">
        <canvas ref={canvasRef} width={800} height={96} className="w-full h-full block" />
      </div>

      {/* 2. Pioneer Full-Track Overview Ribbon (Clickable Needle Scrub) */}
      <div className="relative h-6 w-full border-t border-slate-900 cursor-pointer" title="Click to needle search">
        <canvas
          ref={overviewRef}
          width={800}
          height={24}
          onClick={handleOverviewClick}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
