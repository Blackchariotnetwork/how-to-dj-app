import React, { useRef, useEffect } from 'react';
import { DeckState } from '../../types/dj';
import { audioEngine } from '../../services/audioEngine';

interface WaveformVisualizerProps {
  deckA: DeckState;
  deckB: DeckState;
  onSeek: (deckId: 'A' | 'B', timeSeconds: number) => void;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  deckA,
  deckB,
  onSeek,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataArrayA = useRef(new Uint8Array(128));
  const dataArrayB = useRef(new Uint8Array(128));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const halfHeight = height / 2;

      // Clear dark background
      ctx.fillStyle = '#0a0b12';
      ctx.fillRect(0, 0, width, height);

      // Center divider line
      ctx.strokeStyle = '#1e2235';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, halfHeight);
      ctx.lineTo(width, halfHeight);
      ctx.stroke();

      // Retrieve audio frequency data
      audioEngine.getDeckFrequencyData('A', dataArrayA.current);
      audioEngine.getDeckFrequencyData('B', dataArrayB.current);

      // Render Deck A Waveform (Top Half)
      renderDeckWaveform(
        ctx,
        deckA,
        dataArrayA.current,
        0,
        halfHeight,
        width,
        '#ff2a85',
        '#00f0ff',
        'A'
      );

      // Render Deck B Waveform (Bottom Half)
      renderDeckWaveform(
        ctx,
        deckB,
        dataArrayB.current,
        halfHeight,
        halfHeight,
        width,
        '#00f0ff',
        '#a855f7',
        'B'
      );

      // Center Alignment Playhead (The Needle)
      const playheadX = width / 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Playhead center diamond markers
      ctx.fillStyle = '#ff2a85';
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX - 6, 8);
      ctx.lineTo(playheadX + 6, 8);
      ctx.fill();

      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(playheadX, height);
      ctx.lineTo(playheadX - 6, height - 8);
      ctx.lineTo(playheadX + 6, height - 8);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [deckA, deckB]);

  const renderDeckWaveform = (
    ctx: CanvasRenderingContext2D,
    deck: DeckState,
    freqData: Uint8Array,
    topY: number,
    deckHeight: number,
    width: number,
    bassColor: string,
    midColor: string,
    deckId: 'A' | 'B'
  ) => {
    const centerY = topY + deckHeight / 2;
    const isPlaying = deck.isPlaying;
    const bpm = deck.track?.bpm || 128;
    const duration = deck.track?.duration || 180;
    const currentTime = deck.currentTime;

    // Moving window around currentTime: 8 seconds visible
    const visibleTimeWindow = 8.0;
    const pixelsPerSecond = width / visibleTimeWindow;
    const playheadX = width / 2;

    // 1. Draw Beat Grid Lines (downbeats and 4-beat bars)
    const beatDuration = (60 / bpm) / deck.playbackRate;
    const firstVisibleBeat = Math.floor((currentTime - visibleTimeWindow / 2) / beatDuration);
    const lastVisibleBeat = Math.ceil((currentTime + visibleTimeWindow / 2) / beatDuration);

    ctx.save();
    for (let b = firstVisibleBeat; b <= lastVisibleBeat; b++) {
      if (b < 0) continue;
      const beatTime = b * beatDuration;
      const x = playheadX + (beatTime - currentTime) * pixelsPerSecond;
      if (x >= 0 && x <= width) {
        const isBar = b % 4 === 0;
        ctx.strokeStyle = isBar ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = isBar ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.moveTo(x, topY + 4);
        ctx.lineTo(x, topY + deckHeight - 4);
        ctx.stroke();

        if (isBar) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '9px "Space Mono", monospace';
          ctx.fillText(`BAR ${Math.floor(b / 4) + 1}`, x + 4, topY + 12);
        }
      }
    }
    ctx.restore();

    // 2. High-Contrast Multi-Band Waveform Bars
    const barWidth = 3;
    const barGap = 2;
    const step = barWidth + barGap;
    const numBars = Math.floor(width / step);

    for (let i = 0; i < numBars; i++) {
      const x = i * step;
      const barTimeOffset = (x - playheadX) / pixelsPerSecond;
      const barTime = currentTime + barTimeOffset;

      if (barTime >= 0 && barTime <= duration) {
        // Frequency amplitude formula
        const freqIndex = (i * 2) % freqData.length;
        const liveAmp = isPlaying ? (freqData[freqIndex] || 50) / 255 : 0.2;

        // Multi-frequency transient calculation based on time
        const beatPhase = (barTime % beatDuration) / beatDuration;
        const kickTransient = Math.exp(-beatPhase * 6.0); // sharp kick transient
        const midEnergy = 0.4 + 0.3 * Math.sin(barTime * 3.5);

        const totalAmp = Math.min(1.0, (liveAmp * 0.4 + kickTransient * 0.5 + midEnergy * 0.2));
        const barHeight = Math.max(3, totalAmp * (deckHeight * 0.42));

        // Multi-band high-contrast coloring
        let strokeColor = midColor;
        if (kickTransient > 0.45) {
          strokeColor = bassColor; // Bass transient
        } else if (totalAmp > 0.75) {
          strokeColor = '#ffffff'; // High crisp peaks
        }

        ctx.fillStyle = strokeColor;
        ctx.fillRect(x, centerY - barHeight, barWidth, barHeight * 2);
      }
    }

    // 3. Hotcue Markers along the waveform
    if (deck.hotcues) {
      Object.entries(deck.hotcues).forEach(([slot, cueTime]) => {
        const x = playheadX + (cueTime - currentTime) * pixelsPerSecond;
        if (x >= 0 && x <= width) {
          ctx.fillStyle = '#ffb800';
          ctx.beginPath();
          ctx.moveTo(x - 5, centerY - 16);
          ctx.lineTo(x + 5, centerY - 16);
          ctx.lineTo(x, centerY - 8);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 8px sans-serif';
          ctx.fillText(slot, x - 2.5, centerY - 11);
        }
      });
    }

    // Deck HUD badge in corner
    ctx.fillStyle = 'rgba(10, 11, 18, 0.85)';
    ctx.fillRect(10, topY + 6, 84, 20);
    ctx.strokeStyle = '#23273c';
    ctx.strokeRect(10, topY + 6, 84, 20);
    ctx.fillStyle = bassColor;
    ctx.font = 'bold 10px "Space Mono", monospace';
    ctx.fillText(`DECK ${deckId}  ${deck.track?.key || '--'}`, 16, topY + 20);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const clickX = e.clientX - rect.left;
    const isDeckA = clickY < rect.height / 2;

    const deck = isDeckA ? deckA : deckB;
    if (!deck.track) return;

    // Needle jump scrub
    const visibleTimeWindow = 8.0;
    const pixelsPerSecond = rect.width / visibleTimeWindow;
    const timeDelta = (clickX - rect.width / 2) / pixelsPerSecond;
    const newTime = Math.max(0, Math.min(deck.track.duration, deck.currentTime + timeDelta));

    onSeek(isDeckA ? 'A' : 'B', newTime);
  };

  return (
    <div className="w-full bg-[#0c0d15] border-y border-slate-800 relative select-none">
      <div className="flex items-center justify-between px-3 py-1 bg-[#10121d] border-b border-slate-800 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="text-[#ff2a85] font-bold">DECK A: {deckA.track?.title || 'No Track Loaded'}</span>
          <span>·</span>
          <span>BPM {deckA.track ? (deckA.track.bpm * deckA.playbackRate).toFixed(1) : '--'}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-500">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
          <span>PARALLEL TRANSIENT BEATMATCHING</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#00f0ff] font-bold">DECK B: {deckB.track?.title || 'No Track Loaded'}</span>
          <span>·</span>
          <span>BPM {deckB.track ? (deckB.track.bpm * deckB.playbackRate).toFixed(1) : '--'}</span>
        </div>
      </div>

      <div className="relative h-28 sm:h-36 w-full cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={1200}
          height={144}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Needle Search Hint */}
        <div className="absolute bottom-1 right-2 pointer-events-none text-[9px] font-mono text-slate-500 bg-black/60 px-1.5 py-0.5 rounded">
          CLICK TO NEEDLE SCRUB
        </div>
      </div>
    </div>
  );
};
