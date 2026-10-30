import React from 'react';
import { Radio, Waves, Zap, Cpu } from 'lucide-react';
import { FXState } from '../../types/dj';

interface EffectsRackProps {
  fx: FXState;
  onChange: (fx: FXState) => void;
}

export const EffectsRack: React.FC<EffectsRackProps> = ({ fx, onChange }) => {
  return (
    <div className="p-3 bg-[#0d0e17] rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-xs font-mono font-bold text-slate-300">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-purple-400" />
          <span>ADVANCED PERFORMANCE FX RACK</span>
        </div>
        <span className="text-[10px] text-slate-500 font-normal">MASTER BUS</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* FX 1: BEAT DELAY / ECHO */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            fx.delayActive
              ? 'bg-[#151222] border-purple-500/70 shadow-md shadow-purple-500/20'
              : 'bg-[#0a0b12] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold font-mono text-purple-400 flex items-center gap-1">
              <Radio className="w-3 h-3" />
              <span>DELAY</span>
            </span>
            <button
              onClick={() => onChange({ ...fx, delayActive: !fx.delayActive })}
              className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border transition-colors ${
                fx.delayActive
                  ? 'bg-purple-500 text-white border-purple-300'
                  : 'bg-[#1a1c2b] text-slate-400 border-slate-700'
              }`}
            >
              {fx.delayActive ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>TIME</span>
              <span>{fx.delayTimeBeats} BEAT</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[0.25, 0.5, 0.75].map((t) => (
                <button
                  key={t}
                  onClick={() => onChange({ ...fx, delayTimeBeats: t })}
                  className={`text-[8px] font-mono py-1 rounded border ${
                    fx.delayTimeBeats === t
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-[#121420] text-slate-400 border-slate-800'
                  }`}
                >
                  {t === 0.25 ? '1/4' : t === 0.5 ? '1/2' : '3/4'}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
              <span>WET MIX</span>
              <span>{Math.round(fx.delayMix * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={fx.delayMix}
              onChange={(e) => onChange({ ...fx, delayMix: parseFloat(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-purple-400"
            />
          </div>
        </div>

        {/* FX 2: LUSH STUDIO REVERB */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            fx.reverbActive
              ? 'bg-[#101923] border-cyan-500/70 shadow-md shadow-cyan-500/20'
              : 'bg-[#0a0b12] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold font-mono text-cyan-400 flex items-center gap-1">
              <Waves className="w-3 h-3" />
              <span>REVERB</span>
            </span>
            <button
              onClick={() => onChange({ ...fx, reverbActive: !fx.reverbActive })}
              className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border transition-colors ${
                fx.reverbActive
                  ? 'bg-cyan-500 text-black border-cyan-300'
                  : 'bg-[#1a1c2b] text-slate-400 border-slate-700'
              }`}
            >
              {fx.reverbActive ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>SPACE</span>
              <span>CLUB HALL</span>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
              <span>WET MIX</span>
              <span>{Math.round(fx.reverbMix * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={fx.reverbMix}
              onChange={(e) => onChange({ ...fx, reverbMix: parseFloat(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* FX 3: FLANGER / PHASER */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            fx.flangerActive
              ? 'bg-[#1f1320] border-pink-500/70 shadow-md shadow-pink-500/20'
              : 'bg-[#0a0b12] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold font-mono text-pink-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>FLANGER</span>
            </span>
            <button
              onClick={() => onChange({ ...fx, flangerActive: !fx.flangerActive })}
              className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border transition-colors ${
                fx.flangerActive
                  ? 'bg-pink-500 text-white border-pink-300'
                  : 'bg-[#1a1c2b] text-slate-400 border-slate-700'
              }`}
            >
              {fx.flangerActive ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>JET SWEEP</span>
              <span>0.5 HZ</span>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
              <span>DEPTH</span>
              <span>{Math.round(fx.flangerMix * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={fx.flangerMix}
              onChange={(e) => onChange({ ...fx, flangerMix: parseFloat(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-pink-400"
            />
          </div>
        </div>

        {/* FX 4: BITCRUSHER / LO-FI */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            fx.bitcrusherActive
              ? 'bg-[#1f1910] border-amber-500/70 shadow-md shadow-amber-500/20'
              : 'bg-[#0a0b12] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold font-mono text-amber-400 flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>LO-FI CRUSH</span>
            </span>
            <button
              onClick={() => onChange({ ...fx, bitcrusherActive: !fx.bitcrusherActive })}
              className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border transition-colors ${
                fx.bitcrusherActive
                  ? 'bg-amber-500 text-black border-amber-300'
                  : 'bg-[#1a1c2b] text-slate-400 border-slate-700'
              }`}
            >
              {fx.bitcrusherActive ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>RESOLUTION</span>
              <span>{fx.bitcrushBits} BITS</span>
            </div>
            <input
              type="range"
              min="4"
              max="16"
              step="1"
              value={fx.bitcrushBits}
              onChange={(e) => onChange({ ...fx, bitcrushBits: parseInt(e.target.value, 10) })}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400 mt-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
