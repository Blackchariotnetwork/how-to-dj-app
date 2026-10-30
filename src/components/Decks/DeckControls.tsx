import React from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { DeckState } from '../../types/dj';

interface DeckControlsProps {
  deck: DeckState;
  otherDeckBpm: number;
  onPlayToggle: () => void;
  onCue: () => void;
  onSync: () => void;
  onPitchChange: (percent: number) => void;
  onHotcue: (slot: number) => void;
  onLoopToggle: (beats: number) => void;
  onOpenLibrary: () => void;
  highlightControl?: string;
}

export const DeckControls: React.FC<DeckControlsProps> = ({
  deck,
  otherDeckBpm,
  onPlayToggle,
  onCue,
  onSync,
  onPitchChange,
  onHotcue,
  onLoopToggle,
  onOpenLibrary,
  highlightControl,
}) => {
  const isA = deck.id === 'A';
  const accentColor = isA ? '#ff2a85' : '#00f0ff';
  const track = deck.track;

  const currentBpm = track ? (track.bpm * deck.playbackRate).toFixed(1) : '128.0';
  const pitchPercent = ((deck.playbackRate - 1) * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-3 p-3 bg-[#11121d] rounded-2xl border border-slate-800 shadow-xl">
      {/* Track Title, Key & BPM Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono text-black"
              style={{ backgroundColor: accentColor }}
            >
              DECK {deck.id}
            </span>
            <h3 className="text-sm font-bold text-slate-100 truncate">
              {track ? track.title : 'No Track Loaded'}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
            <span>{track ? track.artist : 'Select track to start'}</span>
            <span>·</span>
            <span className="text-amber-400 font-bold">{track ? track.key : '--'}</span>
          </div>
        </div>

        <button
          onClick={onOpenLibrary}
          className="h-8 px-2.5 rounded-lg bg-[#1a1c2a] hover:bg-[#25283d] text-xs font-semibold text-slate-200 border border-slate-700 transition-colors whitespace-nowrap shrink-0 active:scale-95"
        >
          {track ? 'Change' : 'Load Track'}
        </button>
      </div>

      {/* BPM & Pitch Telemetry Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0a0b12] rounded-xl border border-slate-800/80 font-mono">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">BPM</span>
          <span className="text-lg font-bold text-white tracking-wider">{currentBpm}</span>
        </div>

        <div className="text-center">
          <span className="text-[10px] text-slate-500 block uppercase">Pitch</span>
          <span
            className={`text-sm font-bold ${
              parseFloat(pitchPercent) > 0
                ? 'text-emerald-400'
                : parseFloat(pitchPercent) < 0
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {parseFloat(pitchPercent) > 0 ? `+${pitchPercent}%` : `${pitchPercent}%`}
          </span>
        </div>

        <button
          onClick={onSync}
          className={`h-9 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 border ${
            highlightControl === 'sync' ? 'ring-2 ring-amber-400 animate-pulse' : ''
          } ${
            track && Math.abs(track.bpm * deck.playbackRate - otherDeckBpm) < 0.2
              ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30'
              : 'bg-[#1b1e2c] text-slate-300 border-slate-700 hover:bg-[#262a3f]'
          }`}
          title="Sync BPM to other deck"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>SYNC</span>
        </button>
      </div>

      {/* Primary Performance Controls: CUE & PLAY (>=44px hitboxes) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Illuminated CUE Button */}
        <button
          onClick={onCue}
          className={`h-14 rounded-xl flex flex-col items-center justify-center font-bold tracking-widest text-sm transition-all border active:scale-95 ${
            highlightControl === 'cue' ? 'ring-2 ring-amber-400 animate-bounce' : ''
          } ${
            !deck.isPlaying
              ? 'bg-[#ff9500] text-black border-amber-300 shadow-lg shadow-amber-500/40'
              : 'bg-[#1e1a12] text-amber-500 border-amber-900/60 hover:bg-[#2d2415]'
          }`}
        >
          <span>CUE</span>
          <span className="text-[9px] font-mono opacity-80">JUMP & STOP</span>
        </button>

        {/* Illuminated PLAY/PAUSE Button */}
        <button
          onClick={onPlayToggle}
          className={`h-14 rounded-xl flex items-center justify-center gap-2 font-bold tracking-widest text-sm transition-all border active:scale-95 ${
            highlightControl === 'play' ? 'ring-2 ring-cyan-400 animate-pulse' : ''
          } ${
            deck.isPlaying
              ? 'bg-emerald-500 text-black border-emerald-300 shadow-lg shadow-emerald-500/40'
              : 'bg-[#121c17] text-emerald-400 border-emerald-900/60 hover:bg-[#182820]'
          }`}
        >
          {deck.isPlaying ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>PLAY</span>
            </>
          )}
        </button>
      </div>

      {/* Pitch Fader Slider */}
      <div className="p-2.5 bg-[#0a0b12] rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
          <span>TEMPO FADER</span>
          <button
            onClick={() => onPitchChange(0)}
            className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1"
            title="Reset to 0%"
          >
            <RotateCcw className="w-3 h-3" />
            <span>0% RESET</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-500">-16%</span>
          <input
            type="range"
            min="-16"
            max="16"
            step="0.1"
            value={((deck.playbackRate - 1) * 100).toFixed(1)}
            onChange={(e) => onPitchChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff2a85]"
          />
          <span className="text-[10px] font-mono text-slate-500">+16%</span>
        </div>
      </div>

      {/* 4 Performance Hotcue Pads */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5 px-1">
          <span>HOTCUES</span>
          <span className="text-slate-600">TAP TO JUMP</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((slot) => {
            const hasCue = deck.hotcues && typeof deck.hotcues[slot] === 'number';
            return (
              <button
                key={slot}
                onClick={() => onHotcue(slot)}
                className={`h-11 rounded-lg flex flex-col items-center justify-center border font-mono text-xs font-bold transition-all active:scale-90 ${
                  highlightControl === 'hotcue' ? 'ring-2 ring-purple-400' : ''
                } ${
                  hasCue
                    ? 'bg-[#1b1e2c] border-amber-500/70 text-amber-400 shadow-sm shadow-amber-500/20'
                    : 'bg-[#0f1019] border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <span>PAD {slot}</span>
                <span className="text-[8px] opacity-75">
                  {hasCue ? `${deck.hotcues[slot].toFixed(1)}s` : 'EMPTY'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-Loop Selector */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5 px-1">
          <span>BEAT LOOP</span>
          <span className={deck.loopActive ? 'text-amber-400 font-bold' : 'text-slate-600'}>
            {deck.loopActive ? `${deck.loopLengthBeats} BEATS ACTIVE` : 'OFF'}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 4, 8, 16].map((beats) => (
            <button
              key={beats}
              onClick={() => onLoopToggle(beats)}
              className={`h-8 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 border ${
                deck.loopActive && deck.loopLengthBeats === beats
                  ? 'bg-amber-500 text-black border-amber-300'
                  : 'bg-[#141624] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {beats}B
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
