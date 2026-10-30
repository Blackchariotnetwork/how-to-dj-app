import React, { useState } from 'react';
import { Sparkles, Radio, Waves, Volume2, Mic, Headphones } from 'lucide-react';
import { DeckState, MasterState, FXState } from '../../types/dj';
import { RotaryKnob } from './RotaryKnob';
import { FaderSlider } from './FaderSlider';

interface DJMMixerProps {
  deckA: DeckState;
  deckB: DeckState;
  master: MasterState;
  fx: FXState;
  vuA: number;
  vuB: number;
  onEqChange: (deckId: 'A' | 'B', band: 'high' | 'mid' | 'low', value: number) => void;
  onEqKillToggle: (deckId: 'A' | 'B', band: 'high' | 'mid' | 'low') => void;
  onFilterChange: (deckId: 'A' | 'B', value: number) => void;
  onGainChange: (deckId: 'A' | 'B', value: number) => void;
  onVolumeChange: (deckId: 'A' | 'B', val: number) => void;
  onCrossfaderChange: (val: number) => void;
  onCrossfaderCurveToggle: () => void;
  onFxChange: (fx: FXState) => void;
  onTriggerAutoMix: () => void;
  isAutoMixing: boolean;
  highlightControl?: string;
}

export const DJMMixer: React.FC<DJMMixerProps> = ({
  deckA,
  deckB,
  master,
  fx,
  vuA,
  vuB,
  onEqChange,
  onEqKillToggle,
  onFilterChange,
  onGainChange,
  onVolumeChange,
  onCrossfaderChange,
  onCrossfaderCurveToggle,
  onFxChange,
  onTriggerAutoMix,
  isAutoMixing,
  highlightControl,
}) => {
  const [activeColorFx, setActiveColorFx] = useState<'SPACE' | 'DUB ECHO' | 'SWEEP' | 'NOISE' | 'CRUSH' | 'FILTER'>('FILTER');
  const [activeBeatFxName, setActiveBeatFxName] = useState<'REVERB' | 'DELAY' | 'ECHO' | 'FLANGER' | 'ROLL'>('REVERB');
  const [activeFxBeatFraction, setActiveFxBeatFraction] = useState<number>(0.5);
  const [cueCh1, setCueCh1] = useState(false);
  const [cueCh2, setCueCh2] = useState(true); // Channel 2 Cue is lit in reference!
  const [cueCh3, setCueCh3] = useState(false);
  const [cueCh4, setCueCh4] = useState(false);

  // High-Density 15-Segment Stereo LED Meter
  const render15SegmentVU = (level: number) => {
    const total = 14;
    const activeCount = Math.round(level * total);

    return (
      <div className="flex flex-col-reverse gap-0.5 p-0.5 bg-[#030408] rounded border border-slate-900 w-2.5 h-36 shadow-inner">
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i < activeCount;
          const isRed = i >= 12;
          const isAmber = i >= 9 && i < 12;
          let color = '#0f1322';
          if (isActive) {
            color = isRed ? '#ef4444' : isAmber ? '#f59e0b' : '#10b981';
          }
          return (
            <div
              key={i}
              className="w-full h-2 rounded-[0.5px]"
              style={{
                backgroundColor: color,
                boxShadow: isActive ? `0 0 5px ${color}` : 'none',
              }}
            />
          );
        })}
      </div>
    );
  };

  const handleBeatFxToggle = () => {
    if (activeBeatFxName === 'DELAY' || activeBeatFxName === 'ECHO') {
      onFxChange({ ...fx, delayActive: !fx.delayActive, delayTimeBeats: activeFxBeatFraction });
    } else if (activeBeatFxName === 'REVERB') {
      onFxChange({ ...fx, reverbActive: !fx.reverbActive });
    } else if (activeBeatFxName === 'FLANGER') {
      onFxChange({ ...fx, flangerActive: !fx.flangerActive });
    }
  };

  const isCurrentBeatFxOn =
    (activeBeatFxName === 'DELAY' && fx.delayActive) ||
    (activeBeatFxName === 'REVERB' && fx.reverbActive) ||
    (activeBeatFxName === 'FLANGER' && fx.flangerActive);

  return (
    <div className="flex flex-col bg-[#07080d] rounded-t-lg rounded-b-none border-x border-t border-[#1a1c26] shadow-[0_25px_60px_rgba(0,0,0,0.98)] p-2.5 sm:p-3 select-none relative w-full text-slate-200">
      {/* Top Header Plate ("B2B STUDIO" - exactly matching the reference photo!) */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500 shadow-inner" title="Hex bolt" />
          <span className="text-[12px] font-extrabold tracking-widest text-slate-100 font-mono">
            B2B STUDIO
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">
            PRO CLUB MIXER
          </span>

          {/* AI Auto-Mix Tactile Hardware Macro Button */}
          <button
            onClick={onTriggerAutoMix}
            disabled={isAutoMixing}
            className={`h-7 px-3 rounded text-[9px] font-extrabold font-mono transition-all flex items-center gap-1.5 active:scale-95 border ${
              isAutoMixing
                ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_12px_#f59e0b] animate-pulse'
                : 'bg-[#121522] text-amber-400 border-amber-800/80 hover:bg-[#1a1f33] shadow-sm'
            }`}
            title="Automated harmonic level-balanced transition"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{isAutoMixing ? 'MIXING...' : 'SMART AUTO-MIX'}</span>
          </button>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500 shadow-inner" title="Hex bolt" />
        </div>
      </div>

      {/* Main Mixer Body Grid: Left Sub-Panel | 4 Channels | Right Beat FX */}
      <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-start pb-2">
        {/* LEFT SUB-PANEL: MIC & SOUND COLOR FX BANK */}
        <div className="flex flex-col gap-3 bg-[#05060b] p-2 rounded-xl border border-slate-800/80 w-16 sm:w-20">
          <span className="text-[7px] font-mono font-bold text-slate-500 text-center uppercase">
            COLOR FX
          </span>

          {/* Sound Color FX Buttons Column (Space, Dub Echo, Sweep, Noise, Crush, Filter) */}
          <div className="flex flex-col gap-1">
            {(['SPACE', 'DUB ECHO', 'SWEEP', 'NOISE', 'CRUSH', 'FILTER'] as const).map((fxName) => (
              <button
                key={fxName}
                onClick={() => setActiveColorFx(fxName)}
                className={`py-1 rounded text-[7px] font-mono font-extrabold border transition-colors ${
                  activeColorFx === fxName
                    ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_8px_#00f0ff]'
                    : 'bg-[#0e101b] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {fxName}
              </button>
            ))}
          </div>

          {/* Parameter Knob */}
          <div className="mt-1 flex flex-col items-center">
            <RotaryKnob
              label="PARAM"
              value={0}
              min={-1}
              max={1}
              defaultValue={0}
              size="sm"
              isCenterDetent
              onChange={() => {}}
            />
          </div>

          {/* Headphone A Section */}
          <div className="pt-2 border-t border-slate-800 flex flex-col items-center gap-1">
            <span className="text-[7px] font-mono text-slate-500">PHONES</span>
            <RotaryKnob
              label="MIX"
              value={0}
              min={-1}
              max={1}
              size="sm"
              isCenterDetent
              onChange={() => {}}
            />
          </div>
        </div>

        {/* 4 CHANNEL STRIPS: CH 1 | CH 2 | CH 3 | CH 4 */}
        <div className="grid grid-cols-4 gap-1.5 bg-[#05060a] p-2 rounded-xl border border-slate-800/80">
          {/* CH 1 (Deck A) */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[9px] font-mono font-extrabold text-[#ff2a85]">1</span>

            <RotaryKnob
              label="TRIM"
              value={deckA.gainTrim}
              min={0.5}
              max={1.5}
              size="sm"
              color="#ff2a85"
              onChange={(v) => onGainChange('A', v)}
            />

            <RotaryKnob
              label="HI"
              value={deckA.highEq}
              min={-26}
              max={6}
              size="sm"
              isCenterDetent
              color="#ff2a85"
              onChange={(v) => onEqChange('A', 'high', v)}
            />

            <RotaryKnob
              label="MID"
              value={deckA.midEq}
              min={-26}
              max={6}
              size="sm"
              isCenterDetent
              color="#ff2a85"
              onChange={(v) => onEqChange('A', 'mid', v)}
            />

            <RotaryKnob
              label="LOW"
              value={deckA.lowEq}
              min={-26}
              max={6}
              size="sm"
              isCenterDetent
              color="#f59e0b"
              onChange={(v) => onEqChange('A', 'low', v)}
            />

            <RotaryKnob
              label="COLOR"
              value={(deckA.filterFreq - 0.5) * 2}
              min={-1}
              max={1}
              size="sm"
              isCenterDetent
              color="#00f0ff"
              onChange={(v) => onFilterChange('A', v / 2 + 0.5)}
            />

            {/* Rectangular Orange Channel Cue Button */}
            <button
              onClick={() => setCueCh1(!cueCh1)}
              className={`w-9 h-5 rounded font-mono text-[8px] font-extrabold border transition-all active:scale-90 flex items-center justify-center ${
                cueCh1
                  ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_10px_#f59e0b]'
                  : 'bg-[#10121d] text-amber-500/70 border-amber-900/50 hover:bg-[#1a1e30]'
              }`}
            >
              CUE
            </button>

            {/* 60mm Level Fader */}
            <FaderSlider
              value={deckA.volume}
              onChange={(v) => onVolumeChange('A', v)}
              length={120}
              showScale={false}
              accentColor="#ff2a85"
            />
          </div>

          {/* CH 2 (Deck B) - Active in reference with glowing orange CUE */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[9px] font-mono font-extrabold text-[#00f0ff]">2</span>

            <RotaryKnob
              label="TRIM"
              value={deckB.gainTrim}
              min={0.5}
              max={1.5}
              size="sm"
              color="#00f0ff"
              onChange={(v) => onGainChange('B', v)}
            />

            <RotaryKnob
              label="HI"
              value={deckB.highEq}
              min={-26}
              max={6}
              size="sm"
              isCenterDetent
              color="#00f0ff"
              onChange={(v) => onEqChange('B', 'high', v)}
            />

            <RotaryKnob
              label="MID"
              value={deckB.midEq}
              min={-26}
              max={6}
              size="sm"
              isCenterDetent
              color="#00f0ff"
              onChange={(v) => onEqChange('B', 'mid', v)}
            />

            <RotaryKnob
              label="LOW"
              value={deckB.lowEq}
              min={-26}
              max={6}
              size="sm"
              isCenterDetent
              color="#f59e0b"
              onChange={(v) => onEqChange('B', 'low', v)}
            />

            <RotaryKnob
              label="COLOR"
              value={(deckB.filterFreq - 0.5) * 2}
              min={-1}
              max={1}
              size="sm"
              isCenterDetent
              color="#00f0ff"
              onChange={(v) => onFilterChange('B', v / 2 + 0.5)}
            />

            {/* Rectangular Orange Channel Cue Button (LIT IN REFERENCE) */}
            <button
              onClick={() => setCueCh2(!cueCh2)}
              className={`w-9 h-5 rounded font-mono text-[8px] font-extrabold border transition-all active:scale-90 flex items-center justify-center ${
                cueCh2
                  ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_12px_#f59e0b]'
                  : 'bg-[#10121d] text-amber-500/70 border-amber-900/50 hover:bg-[#1a1e30]'
              }`}
            >
              CUE
            </button>

            {/* 60mm Level Fader */}
            <FaderSlider
              value={deckB.volume}
              onChange={(v) => onVolumeChange('B', v)}
              length={120}
              showScale={false}
              accentColor="#00f0ff"
            />
          </div>

          {/* CH 3 (Stems / Vocal Channel) */}
          <div className="flex flex-col items-center gap-2 opacity-85">
            <span className="text-[9px] font-mono font-extrabold text-slate-400">3</span>

            <RotaryKnob label="TRIM" value={1.0} min={0.5} max={1.5} size="sm" onChange={() => {}} />
            <RotaryKnob label="HI" value={0} min={-26} max={6} size="sm" isCenterDetent onChange={() => {}} />
            <RotaryKnob label="MID" value={0} min={-26} max={6} size="sm" isCenterDetent onChange={() => {}} />
            <RotaryKnob label="LOW" value={0} min={-26} max={6} size="sm" isCenterDetent onChange={() => {}} />
            <RotaryKnob label="COLOR" value={0} min={-1} max={1} size="sm" isCenterDetent onChange={() => {}} />

            <button
              onClick={() => setCueCh3(!cueCh3)}
              className={`w-9 h-5 rounded font-mono text-[8px] font-extrabold border transition-all ${
                cueCh3 ? 'bg-amber-500 text-black border-amber-300 shadow-md' : 'bg-[#10121d] text-slate-500 border-slate-800'
              }`}
            >
              CUE
            </button>

            <FaderSlider value={0.7} onChange={() => {}} length={120} showScale={false} />
          </div>

          {/* CH 4 (Stems / Sampler Channel) */}
          <div className="flex flex-col items-center gap-2 opacity-85">
            <span className="text-[9px] font-mono font-extrabold text-slate-400">4</span>

            <RotaryKnob label="TRIM" value={1.0} min={0.5} max={1.5} size="sm" onChange={() => {}} />
            <RotaryKnob label="HI" value={0} min={-26} max={6} size="sm" isCenterDetent onChange={() => {}} />
            <RotaryKnob label="MID" value={0} min={-26} max={6} size="sm" isCenterDetent onChange={() => {}} />
            <RotaryKnob label="LOW" value={0} min={-26} max={6} size="sm" isCenterDetent onChange={() => {}} />
            <RotaryKnob label="COLOR" value={0} min={-1} max={1} size="sm" isCenterDetent onChange={() => {}} />

            <button
              onClick={() => setCueCh4(!cueCh4)}
              className={`w-9 h-5 rounded font-mono text-[8px] font-extrabold border transition-all ${
                cueCh4 ? 'bg-amber-500 text-black border-amber-300 shadow-md' : 'bg-[#10121d] text-slate-500 border-slate-800'
              }`}
            >
              CUE
            </button>

            <FaderSlider value={0.6} onChange={() => {}} length={120} showScale={false} />
          </div>
        </div>

        {/* RIGHT SUB-PANEL: BEAT FX OLED SCREEN, X-PAD & STOMP SWITCH */}
        <div className="flex flex-col gap-2 bg-[#05060b] p-2 rounded-xl border border-slate-800/80 w-28 sm:w-32">
          {/* Master & Booth Level Knobs */}
          <div className="flex justify-between items-center px-1">
            <RotaryKnob label="MASTER" value={1.0} min={0} max={1.5} size="sm" onChange={() => {}} />
            <RotaryKnob label="BOOTH" value={0.8} min={0} max={1.5} size="sm" onChange={() => {}} />
          </div>

          {/* Central High-Res VU Meters Strip */}
          <div className="flex justify-center items-center gap-1 py-1">
            {render15SegmentVU(vuA)}
            {render15SegmentVU(vuB)}
          </div>

          {/* BEAT FX SECTION (Exact Match with Reference Image!) */}
          <div className="pt-1 border-t border-slate-800 flex flex-col gap-1.5">
            <span className="text-[7px] font-mono font-bold text-slate-400 text-center uppercase">
              BEAT FX
            </span>

            {/* Red/Orange OLED Display */}
            <div className="bg-[#020306] p-1.5 rounded-lg border border-red-900/60 font-mono text-center shadow-inner">
              <div className="flex items-center justify-between text-[8px]">
                <span className="text-red-500 font-extrabold">AUTO</span>
                <span className="text-amber-400 font-extrabold">172.0 BPM</span>
              </div>
              <div className="text-xs font-black text-white tracking-wider my-0.5">
                {activeBeatFxName}
              </div>
              <div className="flex justify-center gap-1 text-[7px] text-slate-400">
                <span>1/4</span>
                <span className="text-amber-400 font-bold">1/2</span>
                <span>1</span>
                <span>2</span>
              </div>
            </div>

            {/* X-PAD Touch Ribbon (from Reference Image!) */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[6px] font-mono text-slate-500 text-center">X-PAD TOUCH</span>
              <div
                className="h-4 bg-gradient-to-r from-purple-900 via-indigo-700 to-cyan-500 rounded border border-indigo-500/50 cursor-pointer flex items-center justify-center text-[7px] font-mono text-white font-bold shadow-inner active:scale-95 transition-transform"
                onClick={() => handleBeatFxToggle()}
              >
                <span>П L ^</span>
              </div>
            </div>

            {/* FX Selector buttons */}
            <div className="grid grid-cols-2 gap-1 text-[7px] font-mono">
              {(['REVERB', 'DELAY', 'ECHO', 'FLANGER'] as const).map((name) => (
                <button
                  key={name}
                  onClick={() => setActiveBeatFxName(name)}
                  className={`py-0.5 rounded border ${
                    activeBeatFxName === name
                      ? 'bg-purple-600 text-white border-purple-400 font-bold'
                      : 'bg-[#0f111a] text-slate-400 border-slate-800'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Large Flashing BEAT FX ON/OFF Stomp Switch */}
            <button
              onClick={handleBeatFxToggle}
              className={`w-full h-8 rounded-xl font-mono text-[9px] font-extrabold tracking-wider border-2 transition-all active:scale-95 flex items-center justify-center ${
                isCurrentBeatFxOn
                  ? 'bg-amber-400 text-black border-amber-200 shadow-[0_0_15px_#f59e0b] animate-pulse'
                  : 'bg-[#181308] text-amber-500 border-amber-900/60 hover:bg-[#251d0d]'
              }`}
            >
              <span>ON/OFF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Magvel Crossfader & BJM-A10 Brand Stamp (Bottom Center) */}
      <div className="mt-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 mb-1 px-1">
          <span className="text-white font-bold">&lt; A</span>
          <button
            onClick={onCrossfaderCurveToggle}
            className="px-2 py-0.5 rounded bg-[#10121d] border border-slate-700 text-slate-300 hover:text-white font-bold"
          >
            CH FADER: {master.crossfaderCurve.toUpperCase()}
          </button>
          <span className="text-white font-bold">B &gt;</span>
        </div>

        <FaderSlider
          value={master.crossfader}
          min={-1}
          max={1}
          step={0.01}
          orientation="horizontal"
          onChange={onCrossfaderChange}
        />

        {/* BJM-A10 Model Badge in Bottom Right Corner (Exact from Reference!) */}
        <div className="flex justify-end mt-1 text-right">
          <span className="text-[9px] font-extrabold font-mono tracking-widest text-slate-400">
            BJM-A10
          </span>
        </div>
      </div>
    </div>
  );
};
