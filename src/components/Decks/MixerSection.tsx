import React from 'react';
import { Volume2, Sparkles, SlidersHorizontal, Headphones } from 'lucide-react';
import { DeckState, MasterState } from '../../types/dj';

interface MixerSectionProps {
  deckA: DeckState;
  deckB: DeckState;
  master: MasterState;
  vuA: number;
  vuB: number;
  onEqChange: (deckId: 'A' | 'B', band: 'high' | 'mid' | 'low', value: number) => void;
  onEqKillToggle: (deckId: 'A' | 'B', band: 'high' | 'mid' | 'low') => void;
  onFilterChange: (deckId: 'A' | 'B', value: number) => void;
  onGainChange: (deckId: 'A' | 'B', value: number) => void;
  onCrossfaderChange: (val: number) => void;
  onCrossfaderCurveToggle: () => void;
  onTriggerAutoMix: () => void;
  isAutoMixing: boolean;
  highlightControl?: string;
}

export const MixerSection: React.FC<MixerSectionProps> = ({
  deckA,
  deckB,
  master,
  vuA,
  vuB,
  onEqChange,
  onEqKillToggle,
  onFilterChange,
  onGainChange,
  onCrossfaderChange,
  onCrossfaderCurveToggle,
  onTriggerAutoMix,
  isAutoMixing,
  highlightControl,
}) => {
  // Render multi-segment LED VU Meter
  const renderVUMeter = (level: number, accentColor: string) => {
    const totalSegments = 10;
    const activeSegments = Math.round(level * totalSegments);

    return (
      <div className="flex flex-col-reverse gap-1 p-1 bg-[#0a0b11] rounded-md border border-slate-800 w-3.5 h-36">
        {Array.from({ length: totalSegments }).map((_, i) => {
          const isActive = i < activeSegments;
          const isPeak = i >= 8;
          const isMid = i >= 5 && i < 8;

          let segColor = '#1f2937';
          if (isActive) {
            segColor = isPeak ? '#ef4444' : isMid ? '#f59e0b' : accentColor;
          }

          return (
            <div
              key={i}
              className="w-full h-2 rounded-[1px] transition-colors"
              style={{
                backgroundColor: segColor,
                boxShadow: isActive ? `0 0 6px ${segColor}` : 'none',
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col p-3 bg-[#0d0e17] rounded-2xl border border-slate-800 shadow-2xl">
      {/* Mixer Header & Smart Auto-Mix Action */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold font-mono tracking-wider text-slate-300">
            CLUB MIXER
          </span>
        </div>

        {/* AI Smart Auto-Mix Button */}
        <button
          onClick={onTriggerAutoMix}
          disabled={isAutoMixing}
          className={`h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 border ${
            isAutoMixing
              ? 'bg-purple-600 text-white border-purple-400 animate-pulse'
              : 'bg-gradient-to-r from-[#ff2a85] to-[#8b5cf6] text-white border-transparent hover:opacity-95 shadow-md shadow-pink-500/20'
          }`}
          title="AI harmonic analysis and automated level-balanced transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAutoMixing ? 'AUTO-MIXING...' : 'AI AUTO-MIX'}</span>
        </button>
      </div>

      {/* Channel Strips (Deck A | VU Meters | Deck B) */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        {/* Deck A Channel Strip */}
        <div className="flex flex-col gap-2.5">
          {/* GAIN TRIM */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono text-slate-500">GAIN</span>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={deckA.gainTrim}
              onChange={(e) => onGainChange('A', parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#ff2a85]"
            />
          </div>

          {/* HIGH EQ */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full text-[9px] font-mono text-slate-400">
              <span>HI</span>
              <span>{deckA.highKill ? 'KILL' : `${deckA.highEq > 0 ? '+' : ''}${deckA.highEq}dB`}</span>
            </div>
            <input
              type="range"
              min="-26"
              max="6"
              step="1"
              value={deckA.highEq}
              onChange={(e) => onEqChange('A', 'high', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#ff2a85]"
            />
            <button
              onClick={() => onEqKillToggle('A', 'high')}
              className={`mt-1 text-[8px] font-mono px-2 py-0.5 rounded border transition-colors ${
                deckA.highKill
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-[#181a28] text-slate-400 border-slate-700'
              }`}
            >
              KILL
            </button>
          </div>

          {/* MID EQ */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full text-[9px] font-mono text-slate-400">
              <span>MID</span>
              <span>{deckA.midKill ? 'KILL' : `${deckA.midEq > 0 ? '+' : ''}${deckA.midEq}dB`}</span>
            </div>
            <input
              type="range"
              min="-26"
              max="6"
              step="1"
              value={deckA.midEq}
              onChange={(e) => onEqChange('A', 'mid', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#ff2a85]"
            />
            <button
              onClick={() => onEqKillToggle('A', 'mid')}
              className={`mt-1 text-[8px] font-mono px-2 py-0.5 rounded border transition-colors ${
                deckA.midKill
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-[#181a28] text-slate-400 border-slate-700'
              }`}
            >
              KILL
            </button>
          </div>

          {/* LOW EQ */}
          <div
            className={`flex flex-col items-center p-1 rounded-lg ${
              highlightControl === 'eq_low' ? 'ring-2 ring-amber-400 bg-amber-500/10' : ''
            }`}
          >
            <div className="flex items-center justify-between w-full text-[9px] font-mono text-slate-400">
              <span className="font-bold text-amber-400">LOW</span>
              <span>{deckA.lowKill ? 'KILL' : `${deckA.lowEq > 0 ? '+' : ''}${deckA.lowEq}dB`}</span>
            </div>
            <input
              type="range"
              min="-26"
              max="6"
              step="1"
              value={deckA.lowEq}
              onChange={(e) => onEqChange('A', 'low', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
            />
            <button
              onClick={() => onEqKillToggle('A', 'low')}
              className={`mt-1 text-[8px] font-mono px-2 py-0.5 rounded border transition-colors ${
                deckA.lowKill
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-[#181a28] text-slate-400 border-slate-700'
              }`}
            >
              KILL
            </button>
          </div>

          {/* BI-DIRECTIONAL FILTER (LPF <-> HPF) */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono text-slate-400">FILTER</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={deckA.filterFreq}
              onChange={(e) => onFilterChange('A', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#ff2a85]"
            />
            <div className="flex justify-between w-full text-[7px] font-mono text-slate-500 mt-0.5">
              <span>LPF</span>
              <span>FLAT</span>
              <span>HPF</span>
            </div>
          </div>
        </div>

        {/* Central VU Meters Strip */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#07080e] rounded-xl border border-slate-800/80">
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-mono text-[#ff2a85] font-bold mb-1">A</span>
            {renderVUMeter(vuA, '#ff2a85')}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-mono text-[#00f0ff] font-bold mb-1">B</span>
            {renderVUMeter(vuB, '#00f0ff')}
          </div>
        </div>

        {/* Deck B Channel Strip */}
        <div className="flex flex-col gap-2.5">
          {/* GAIN TRIM */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono text-slate-500">GAIN</span>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={deckB.gainTrim}
              onChange={(e) => onGainChange('B', parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#00f0ff]"
            />
          </div>

          {/* HIGH EQ */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full text-[9px] font-mono text-slate-400">
              <span>HI</span>
              <span>{deckB.highKill ? 'KILL' : `${deckB.highEq > 0 ? '+' : ''}${deckB.highEq}dB`}</span>
            </div>
            <input
              type="range"
              min="-26"
              max="6"
              step="1"
              value={deckB.highEq}
              onChange={(e) => onEqChange('B', 'high', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#00f0ff]"
            />
            <button
              onClick={() => onEqKillToggle('B', 'high')}
              className={`mt-1 text-[8px] font-mono px-2 py-0.5 rounded border transition-colors ${
                deckB.highKill
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-[#181a28] text-slate-400 border-slate-700'
              }`}
            >
              KILL
            </button>
          </div>

          {/* MID EQ */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full text-[9px] font-mono text-slate-400">
              <span>MID</span>
              <span>{deckB.midKill ? 'KILL' : `${deckB.midEq > 0 ? '+' : ''}${deckB.midEq}dB`}</span>
            </div>
            <input
              type="range"
              min="-26"
              max="6"
              step="1"
              value={deckB.midEq}
              onChange={(e) => onEqChange('B', 'mid', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#00f0ff]"
            />
            <button
              onClick={() => onEqKillToggle('B', 'mid')}
              className={`mt-1 text-[8px] font-mono px-2 py-0.5 rounded border transition-colors ${
                deckB.midKill
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-[#181a28] text-slate-400 border-slate-700'
              }`}
            >
              KILL
            </button>
          </div>

          {/* LOW EQ */}
          <div
            className={`flex flex-col items-center p-1 rounded-lg ${
              highlightControl === 'eq_low' ? 'ring-2 ring-amber-400 bg-amber-500/10' : ''
            }`}
          >
            <div className="flex items-center justify-between w-full text-[9px] font-mono text-slate-400">
              <span className="font-bold text-amber-400">LOW</span>
              <span>{deckB.lowKill ? 'KILL' : `${deckB.lowEq > 0 ? '+' : ''}${deckB.lowEq}dB`}</span>
            </div>
            <input
              type="range"
              min="-26"
              max="6"
              step="1"
              value={deckB.lowEq}
              onChange={(e) => onEqChange('B', 'low', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
            />
            <button
              onClick={() => onEqKillToggle('B', 'low')}
              className={`mt-1 text-[8px] font-mono px-2 py-0.5 rounded border transition-colors ${
                deckB.lowKill
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-[#181a28] text-slate-400 border-slate-700'
              }`}
            >
              KILL
            </button>
          </div>

          {/* BI-DIRECTIONAL FILTER (LPF <-> HPF) */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono text-slate-400">FILTER</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={deckB.filterFreq}
              onChange={(e) => onFilterChange('B', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#00f0ff]"
            />
            <div className="flex justify-between w-full text-[7px] font-mono text-slate-500 mt-0.5">
              <span>LPF</span>
              <span>FLAT</span>
              <span>HPF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Master Crossfader Section */}
      <div
        className={`mt-4 pt-3 border-t border-slate-800/90 ${
          highlightControl === 'crossfader' ? 'ring-2 ring-purple-400 rounded-xl p-2' : ''
        }`}
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
          <div className="flex items-center gap-1 text-[#ff2a85] font-bold">
            <span>DECK A</span>
          </div>

          <button
            onClick={onCrossfaderCurveToggle}
            className="text-[9px] px-2 py-0.5 bg-[#171926] rounded border border-slate-700 text-slate-300 hover:text-white"
          >
            CURVE: {master.crossfaderCurve.toUpperCase()}
          </button>

          <div className="flex items-center gap-1 text-[#00f0ff] font-bold">
            <span>DECK B</span>
          </div>
        </div>

        {/* Tactile Crossfader Slider */}
        <div className="relative px-2">
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={master.crossfader}
            onChange={(e) => onCrossfaderChange(parseFloat(e.target.value))}
            className="w-full h-6 bg-[#0a0b12] rounded-lg appearance-none cursor-pointer border border-slate-700 shadow-inner accent-white"
          />
          {/* Center Detent Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-slate-600 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
