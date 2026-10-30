import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Repeat,
  Radio,
  Sliders,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Search,
  Menu,
  Music,
  ArrowLeft,
  Bookmark,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { DeckState, Track } from '../../types/dj';
import { JogWheel } from './JogWheel';
import { CDJWaveformDisplay } from './CDJWaveformDisplay';

interface CDJPlayerProps {
  deck: DeckState;
  otherDeckBpm: number;
  playerNumber?: number;
  userName?: string;
  flagEmoji?: string;
  onPlayToggle: () => void;
  onCue: () => void;
  onSync: () => void;
  onPitchChange: (percent: number) => void;
  onPitchBend: (direction: number) => void;
  onScratchNudge: (delta: number) => void;
  onHotcue: (slot: number) => void;
  onLoopToggle: (beats: number) => void;
  onSeek: (time: number) => void;
  onOpenLibrary: () => void;
  highlightControl?: string;
}

export const CDJPlayer: React.FC<CDJPlayerProps> = ({
  deck,
  otherDeckBpm,
  playerNumber = 1,
  userName = 'YOU',
  flagEmoji = '🇧🇷',
  onPlayToggle,
  onCue,
  onSync,
  onPitchChange,
  onPitchBend,
  onScratchNudge,
  onHotcue,
  onLoopToggle,
  onSeek,
  onOpenLibrary,
  highlightControl,
}) => {
  const [tempoRange, setTempoRange] = useState<6 | 10 | 16 | 100>(16);
  const [activeScreenTab, setActiveScreenTab] = useState<'SOURCE' | 'BROWSE' | 'TAG LIST' | 'PLAYLIST' | 'SEARCH' | 'MENU'>('BROWSE');
  const [isSlipActive, setIsSlipActive] = useState(false);
  const [isMasterTempoActive, setIsMasterTempoActive] = useState(true);

  const track = deck.track;
  // If track is default or loaded, compute BPM exactly matching reference photo
  const currentBpm = track ? track.bpm * deck.playbackRate : (playerNumber === 1 ? 172.0 : 171.9);
  const pitchPercent = (deck.playbackRate - 1) * 100;

  const cycleTempoRange = () => {
    setTempoRange((prev) => (prev === 6 ? 10 : prev === 10 ? 16 : prev === 16 ? 100 : 6));
  };

  const hotCueSlots = [
    { label: '1', num: 1, color: '#ef4444' }, // Red
    { label: '2', num: 2, color: '#f59e0b' }, // Amber
    { label: '3', num: 3, color: '#10b981' }, // Green
    { label: '4', num: 4, color: '#06b6d4' }, // Cyan
    { label: '5', num: 5, color: '#8b5cf6' }, // Purple
    { label: '6', num: 6, color: '#ec4899' }, // Pink
    { label: '7', num: 7, color: '#3b82f6' }, // Blue
    { label: '8', num: 8, color: '#ffffff' }, // White
  ];

  // Format large remain time: 00:42.691 (Deck 1) or 03:17.057 (Deck 2)
  const remaining = Math.max(0, (track?.duration || 180) - deck.currentTime);
  const remMinutes = Math.floor(remaining / 60);
  const remSeconds = Math.floor(remaining % 60);
  const remMillis = Math.floor((remaining % 1) * 1000);
  const formattedRemain = `${remMinutes.toString().padStart(2, '0')}:${remSeconds.toString().padStart(2, '0')}.${remMillis.toString().padStart(3, '0')}`;

  const defaultTitle = playerNumber === 1 ? 'BOLADONA' : 'Syú - Invisible [Drumad Dub]';
  const defaultArtist = playerNumber === 1 ? 'Tokyo Soundworks' : 'Syú feat. Vocal';
  const defaultKey = playerNumber === 1 ? 'Bbm' : 'Ebm';

  return (
    <div className="flex flex-col bg-[#07080d] rounded-t-lg rounded-b-none border-x border-t border-[#1a1c26] shadow-[0_25px_60px_rgba(0,0,0,0.98)] p-2.5 sm:p-3 select-none relative w-full text-slate-200">
      {/* Top Player Identity Banner ("YOU [Flag]") matching reference photo exactly */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-2">
          {/* Solid Royal Blue Rectangle Badge from photo */}
          <div className="px-3 py-1 rounded-[2px] bg-[#004fc7] text-white font-extrabold text-[12px] font-sans tracking-wider flex items-center gap-1.5 shadow-[0_2px_10px_rgba(0,79,199,0.7)] border border-[#2b72e5]">
            <span>{userName}</span>
            <span className="text-[13px]">{flagEmoji}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-[9px] font-mono text-slate-500">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border border-slate-500 shadow-inner" title="Hex bolt" />
          <span className="font-bold tracking-wider text-slate-400">PRO DJ LINK #{playerNumber}</span>
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border border-slate-500 shadow-inner" title="Hex bolt" />
        </div>
      </div>

      {/* Pioneer CDJ-3000 Main Touchscreen Display Section flanked by physical hardware strips */}
      <div className="grid grid-cols-[36px_1fr_40px] gap-1.5 bg-[#030408] rounded-xl border-2 border-[#151722] p-1.5 shadow-inner mb-3">
        {/* LEFT HARDWARE STRIP (USB 1 STOP, SD DOOR, SLIP, TRACK SEARCH) */}
        <div className="flex flex-col items-center justify-between py-1 border-r border-[#151724]">
          {/* USB 1 Slot / Illuminated Amber STOP button */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse" title="USB LED" />
            <button
              onClick={onOpenLibrary}
              className="w-8 h-8 rounded-[3px] bg-[#ff9900] border border-amber-300 text-black font-black text-[7px] font-mono flex flex-col items-center justify-center shadow-[0_0_10px_rgba(255,153,0,0.8)] active:scale-95 leading-tight"
              title="USB 1 / STOP"
            >
              <span>USB 1</span>
              <span className="text-[6px] tracking-tighter">STOP</span>
            </button>
            <span className="text-[6px] font-mono text-slate-500 font-bold mt-0.5">SD</span>
          </div>

          {/* SLIP Rocker / Button */}
          <div className="flex flex-col items-center gap-1 my-2">
            <button
              onClick={() => setIsSlipActive(!isSlipActive)}
              className={`w-7 h-5 rounded-[2px] text-[7px] font-mono font-black border transition-all active:scale-95 ${
                isSlipActive
                  ? 'bg-red-600 text-white border-red-400 shadow-[0_0_8px_#ef4444]'
                  : 'bg-[#10121c] text-slate-400 border-slate-700/80 hover:text-white'
              }`}
              title="SLIP Mode"
            >
              SLIP
            </button>
          </div>

          {/* Track Search << >> */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[5px] font-mono text-slate-600 uppercase">TRACK</span>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => onSeek(Math.max(0, deck.currentTime - 10))}
                className="w-6 h-4 rounded-[2px] bg-[#0d0f17] border border-slate-800 text-[8px] text-slate-400 hover:text-white flex items-center justify-center active:scale-90"
                title="Track Search Backward"
              >
                ◀◀
              </button>
              <button
                onClick={() => onSeek(Math.min(track?.duration || 180, deck.currentTime + 10))}
                className="w-6 h-4 rounded-[2px] bg-[#0d0f17] border border-slate-800 text-[8px] text-slate-400 hover:text-white flex items-center justify-center active:scale-90"
                title="Track Search Forward"
              >
                ▶▶
              </button>
            </div>
          </div>
        </div>

        {/* CENTER HIGH-RES REKORDBOX TOUCHSCREEN */}
        <div className="flex flex-col bg-[#020306] rounded-lg p-2 border border-slate-900 shadow-inner">
          {/* Top Screen Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-1.5 text-[8.5px] font-mono font-bold text-slate-400 overflow-x-auto">
            {(['SOURCE', 'BROWSE', 'TAG LIST', 'PLAYLIST', 'SEARCH', 'MENU'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveScreenTab(tab);
                  if (tab === 'BROWSE' || tab === 'SOURCE') onOpenLibrary();
                }}
                className={`px-1.5 py-0.5 rounded-[2px] transition-colors whitespace-nowrap ${
                  activeScreenTab === tab
                    ? 'bg-slate-800 text-white font-extrabold shadow-sm'
                    : 'hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Track Header Bar (Title, Artist, Duration, BPM, Key, Beat Jump) */}
          <div className="flex items-center justify-between bg-[#060810] px-2 py-1.5 rounded border border-slate-800/70 mb-1.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className={`w-4 h-4 rounded-[2px] flex items-center justify-center text-[9px] shrink-0 font-bold ${
                  playerNumber === 1
                    ? 'bg-red-600/30 border border-red-500 text-red-400'
                    : 'bg-cyan-600/30 border border-cyan-500 text-cyan-400'
                }`}
              >
                ♪
              </div>
              <div className="truncate">
                <span className="text-[11px] font-extrabold text-white block truncate tracking-wide font-sans leading-tight">
                  {track ? track.title : defaultTitle}
                </span>
                <div className="flex items-center gap-1.5 text-[8px] font-mono text-slate-400">
                  <span className="truncate">{track ? track.artist : defaultArtist}</span>
                  <span>·</span>
                  <span>
                    {track
                      ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
                      : playerNumber === 1
                      ? '02:17'
                      : '03:18'}
                  </span>
                  <span>·</span>
                  <span className="text-cyan-400 font-bold">{currentBpm.toFixed(1)}</span>
                  <span>·</span>
                  <span className="text-amber-400 font-bold">{track ? track.key : defaultKey}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Beat Loop, Key Shift, Beat Jump) */}
            <div className="hidden sm:flex items-center gap-1 text-[7.5px] font-mono font-bold text-slate-400 shrink-0">
              <span className="px-1 py-0.5 rounded-[2px] bg-[#0c0f1c] border border-slate-800">BEAT LOOP</span>
              <span className="px-1 py-0.5 rounded-[2px] bg-[#0c0f1c] border border-slate-800">KEY SHIFT</span>
              <span className="px-1 py-0.5 rounded-[2px] bg-[#0c0f1c] border border-slate-800">BEAT JUMP</span>
            </div>
          </div>

          {/* 3-Band High-Contrast RGB Waveform & Full Overview Ribbon */}
          <CDJWaveformDisplay
            deck={deck}
            otherDeckBpm={otherDeckBpm}
            onSeek={onSeek}
          />

          {/* Lower Screen Telemetry Bar (Remain Time, Synced Tempo, Big Amber BPM Badge) */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 mt-1.5 font-mono">
            <div className="flex items-center gap-1.5 text-[8.5px] text-slate-400">
              <span className="font-extrabold text-white">PLAYER {playerNumber === 1 ? '2' : '3'}</span>
              <span>TRACK 01</span>
              <span className="px-1 py-0.2 rounded bg-slate-900 border border-slate-800 text-[7px] text-emerald-400 font-bold">
                QUANTIZE 16
              </span>
            </div>

            {/* Large Digital Remain Time Clock from Reference Photo */}
            <div className="flex flex-col items-center">
              <span className="text-[6.5px] text-slate-500 uppercase tracking-widest font-bold">REMAIN TIME</span>
              <span className="text-sm sm:text-base font-black text-white tracking-widest leading-none font-mono drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                {formattedRemain}
              </span>
            </div>

            {/* Tempo & Big Amber BPM Badge */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-[6.5px] text-slate-500 block uppercase font-bold">SYNCED TEMPO</span>
                <span
                  className={`text-[9px] font-extrabold ${
                    pitchPercent > 0 ? 'text-emerald-400' : pitchPercent < 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {pitchPercent > 0 ? `+ ${pitchPercent.toFixed(2)}%` : `${pitchPercent.toFixed(2)}%`}
                </span>
              </div>

              {/* Big High-Contrast Amber BPM Box matching reference photo */}
              <div className="px-2 py-0.5 rounded-[2px] bg-[#1a1104] border border-amber-500 flex flex-col items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                <span className="text-xs sm:text-sm font-black text-amber-400 leading-none">
                  {currentBpm.toFixed(1)}
                </span>
                <span className="text-[7.5px] font-black text-amber-300/90 leading-tight">
                  {track ? track.key : defaultKey}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT HARDWARE STRIP (ROTARY PUSH ENCODER & 4 TACTILE HARDWARE BUTTONS) */}
        <div className="flex flex-col items-center justify-between py-1 border-l border-[#151724]">
          {/* Rotary Push Browser Hardware Knob */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={onOpenLibrary}
              className="w-8 h-8 rounded-full bg-gradient-to-b from-[#3a3f5a] via-[#1e2132] to-[#0c0d16] border-2 border-slate-600 shadow-md flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
              title="Rotary Push Browser Encoder (Click to open crate)"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-500 shadow-inner flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              </div>
            </button>
            <span className="text-[5.5px] font-mono text-slate-500 uppercase font-bold">PUSH</span>
          </div>

          {/* 4 Tactile Hardware Buttons: BACK, TAG TRACK, SHORT CUT, TRACK FILTER */}
          <div className="flex flex-col gap-1 w-full px-0.5 my-1">
            <button
              onClick={onOpenLibrary}
              className="w-full h-4 rounded-[2px] bg-[#101320] border border-slate-700/80 text-[6px] font-mono font-bold text-slate-300 hover:text-white flex items-center justify-center active:scale-95"
              title="BACK"
            >
              BACK
            </button>
            <button
              onClick={onOpenLibrary}
              className="w-full h-4 rounded-[2px] bg-[#101320] border border-slate-700/80 text-[6px] font-mono font-bold text-slate-300 hover:text-white flex items-center justify-center active:scale-95"
              title="TAG TRACK"
            >
              TAG
            </button>
            <button
              onClick={onOpenLibrary}
              className="w-full h-4 rounded-[2px] bg-[#101320] border border-slate-700/80 text-[6px] font-mono font-bold text-slate-300 hover:text-white flex items-center justify-center active:scale-95"
              title="SHORT CUT"
            >
              SHORT
            </button>
            <button
              onClick={onOpenLibrary}
              className="w-full h-4 rounded-[2px] bg-[#101320] border border-slate-700/80 text-[6px] font-mono font-bold text-slate-300 hover:text-white flex items-center justify-center active:scale-95"
              title="TRACK FILTER"
            >
              FILTER
            </button>
          </div>
        </div>
      </div>

      {/* CDJ 8-Pad Multi-Color Hot Cue Button Bank (Backlit Rectangles) */}
      <div className="mb-2.5">
        <div className="grid grid-cols-8 gap-1">
          {hotCueSlots.map((slot) => {
            const hasCue = deck.hotcues && typeof deck.hotcues[slot.num] === 'number';
            return (
              <button
                key={slot.label}
                onClick={() => onHotcue(slot.num)}
                className="h-7 rounded-[2px] font-mono font-black text-[11px] flex items-center justify-center border transition-all active:scale-95"
                style={{
                  backgroundColor: hasCue ? '#10121d' : '#07080f',
                  borderColor: hasCue ? slot.color : '#202436',
                  color: hasCue ? slot.color : '#64748b',
                  boxShadow: hasCue ? `0 0 10px ${slot.color}55` : 'none',
                }}
              >
                <span>{slot.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle Loop Section: Orange 4-BEAT IN, OUT, RELOOP & BEAT FRACTION */}
      <div className="flex items-center justify-between mb-2.5 px-1 py-1 bg-[#05060b] rounded border border-slate-800/80 font-mono text-[9px]">
        {/* Loop In & Out buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onLoopToggle(4)}
            className={`px-2.5 py-1 rounded-full font-black border transition-all active:scale-95 flex items-center gap-1 ${
              deck.loopActive
                ? 'bg-amber-400 text-black border-amber-200 shadow-[0_0_12px_#f59e0b]'
                : 'bg-[#181206] text-amber-400 border-amber-800 hover:bg-[#261c0a]'
            }`}
          >
            <span>4 BEAT LOOP</span>
          </button>
        </div>

        {/* 1/2X, Current Beats, 2X */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onLoopToggle(Math.max(1, deck.loopLengthBeats / 2))}
            className="h-5 px-1.5 rounded-[2px] bg-[#111422] border border-slate-700 text-slate-300 hover:text-white font-bold"
          >
            1/2X
          </button>
          <span className="text-amber-400 font-black px-1.5 text-[10px]">{deck.loopLengthBeats} BEATS</span>
          <button
            onClick={() => onLoopToggle(Math.min(32, deck.loopLengthBeats * 2))}
            className="h-5 px-1.5 rounded-[2px] bg-[#111422] border border-slate-700 text-slate-300 hover:text-white font-bold"
          >
            2X
          </button>
        </div>

        {/* Beat Sync Button */}
        <button
          onClick={onSync}
          className={`px-2.5 py-1 rounded-[2px] font-black border transition-all active:scale-95 text-[9px] ${
            Math.abs(currentBpm - otherDeckBpm) < 0.15
              ? 'bg-cyan-500 text-black border-cyan-200 shadow-[0_0_10px_#00f0ff]'
              : 'bg-[#0d1424] text-cyan-400 border-cyan-800 hover:bg-[#131d33]'
          }`}
          title="Beat Sync to Master Deck"
        >
          BEAT SYNC
        </button>
      </div>

      {/* Main Jog Wheel & Vertical Pitch Fader Row */}
      <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
        {/* CDJ-3000 Jog Wheel with Authentic On-Jog LCD Display */}
        <div className="flex flex-col items-center justify-center">
          <JogWheel
            deckId={deck.id}
            isPlaying={deck.isPlaying}
            bpm={currentBpm}
            pitchPercent={pitchPercent}
            currentTime={deck.currentTime}
            duration={track?.duration || 180}
            musicalKey={track?.key || defaultKey}
            color={playerNumber === 1 ? '#ff2a85' : '#00f0ff'}
            onScratchNudge={onScratchNudge}
            onPitchBend={onPitchBend}
          />

          {/* Authentic CDJ Hardware Deck Switch Badge from reference photo (DECK 2 ◀ ▶ 1) */}
          <div className="mt-1 flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#05060b] border border-slate-800 text-[8.5px] font-mono font-bold text-slate-400 shadow-inner">
            <span className="text-slate-500">◀</span>
            <span className="text-white font-black tracking-wider">
              {playerNumber === 1 ? 'DECK 2 · 1' : 'DECK 3 · 4'}
            </span>
            <span className="text-slate-500">▶</span>
          </div>
        </div>

        {/* 100mm Vertical Tempo Fader Strip */}
        <div className="flex flex-col items-center bg-[#040509] p-2 rounded-xl border border-slate-800/90 shadow-inner h-[270px] justify-between">
          <button
            onClick={() => setIsMasterTempoActive(!isMasterTempoActive)}
            className={`h-5 px-1.5 rounded-[2px] font-mono text-[7px] font-black border transition-colors ${
              isMasterTempoActive
                ? 'bg-cyan-950 text-cyan-400 border-cyan-500 shadow-[0_0_6px_#06b6d4]'
                : 'bg-[#101322] text-slate-500 border-slate-700'
            }`}
            title="Master Tempo (Key Lock)"
          >
            MASTER TEMPO
          </button>

          <button
            onClick={cycleTempoRange}
            className="text-[8px] font-mono font-bold text-slate-400 hover:text-white"
          >
            ±{tempoRange}%
          </button>

          {/* Mechanical Fader Track & Cap */}
          <div className="relative flex items-center justify-center h-44 w-7">
            {/* Center Zero Detent Tick */}
            <div
              className={`absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full -translate-y-1/2 ${
                Math.abs(pitchPercent) < 0.05
                  ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                  : 'bg-slate-700'
              }`}
            />

            <input
              type="range"
              min={-tempoRange}
              max={tempoRange}
              step={0.05}
              value={pitchPercent}
              onChange={(e) => onPitchChange(parseFloat(e.target.value))}
              className="absolute w-40 h-7 opacity-0 cursor-ns-resize -rotate-90 z-20"
            />

            {/* Aluminum Fader Handle */}
            <div
              className="w-7 h-5 bg-gradient-to-b from-[#3a3f59] via-[#1a1c28] to-[#0d0f18] rounded-[2px] border border-slate-500 shadow-xl flex items-center justify-center pointer-events-none transition-none"
              style={{
                transform: `translateY(${(-pitchPercent / tempoRange) * 68}px)`,
              }}
            >
              <div className="w-5 h-[1.5px] bg-white rounded-full shadow-sm" />
            </div>
          </div>

          <button
            onClick={() => onPitchChange(0)}
            className="text-[7.5px] font-mono text-slate-500 hover:text-white flex items-center gap-0.5"
            title="Reset to 0.0%"
          >
            <RotateCcw className="w-2 h-2" />
            <span>0.0%</span>
          </button>
        </div>
      </div>

      {/* Bottom Transport Buttons & P2P-3000X Hardware Label */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-3">
          {/* Pioneer Large Circular CUE Button (Amber Glow) */}
          <button
            onClick={onCue}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-black font-mono text-sm tracking-wider transition-all border-4 active:scale-95 cursor-pointer ${
              !deck.isPlaying
                ? 'bg-[#ff9500] text-black border-amber-300 shadow-[0_0_22px_rgba(245,158,11,0.85)]'
                : 'bg-[#181308] text-amber-500 border-amber-900/60 hover:bg-[#241c0c]'
            }`}
          >
            <span>CUE</span>
          </button>

          {/* Pioneer Large Circular PLAY/PAUSE Button (Green Glow) */}
          <button
            onClick={onPlayToggle}
            className={`w-14 h-14 rounded-full flex items-center justify-center gap-1 font-black font-mono text-sm tracking-wider transition-all border-4 active:scale-95 cursor-pointer ${
              deck.isPlaying
                ? 'bg-[#10b981] text-black border-emerald-300 shadow-[0_0_22px_rgba(16,185,129,0.85)]'
                : 'bg-[#09150e] text-emerald-400 border-emerald-900/60 hover:bg-[#112419]'
            }`}
          >
            {deck.isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
        </div>

        {/* Pioneer Model Plate Badge in Corner */}
        <div className="text-right">
          <span className="text-[11px] font-black font-mono tracking-widest text-slate-300 block">
            P2P-3000X
          </span>
          <span className="text-[7.5px] font-mono text-slate-500 font-bold uppercase">PRO MULTI PLAYER</span>
        </div>
      </div>
    </div>
  );
};
