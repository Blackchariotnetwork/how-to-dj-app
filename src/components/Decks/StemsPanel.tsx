import React from 'react';
import { Mic, Disc, Music } from 'lucide-react';
import { DeckState } from '../../types/dj';

interface StemsPanelProps {
  deckA: DeckState;
  deckB: DeckState;
  onStemChange: (deckId: 'A' | 'B', stem: 'vocals' | 'drums' | 'melody', val: number) => void;
}

export const StemsPanel: React.FC<StemsPanelProps> = ({
  deckA,
  deckB,
  onStemChange,
}) => {
  return (
    <div className="p-3 bg-[#0d0e17] rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-[#ff2a85]" />
          <span className="text-xs font-bold font-mono text-slate-300">
            STEM ISOLATION & REMIX MASHUP
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">REAL-TIME SEPARATION</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Deck A Stems */}
        <div className="p-2.5 bg-[#0a0b12] rounded-xl border border-slate-800/80">
          <div className="text-[10px] font-bold font-mono text-[#ff2a85] mb-2 flex items-center justify-between">
            <span>DECK A STEMS</span>
            <span>{deckA.track?.title || 'No Track'}</span>
          </div>

          <div className="flex flex-col gap-2">
            {/* Vocals */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <Mic className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="w-14 text-slate-400 text-[10px]">VOCALS</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={deckA.stemVocals}
                onChange={(e) => onStemChange('A', 'vocals', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#ff2a85]"
              />
              <span className="w-8 text-right text-[10px] text-slate-400">
                {Math.round(deckA.stemVocals * 100)}%
              </span>
            </div>

            {/* Drums */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <Disc className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="w-14 text-slate-400 text-[10px]">DRUMS</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={deckA.stemDrums}
                onChange={(e) => onStemChange('A', 'drums', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
              />
              <span className="w-8 text-right text-[10px] text-slate-400">
                {Math.round(deckA.stemDrums * 100)}%
              </span>
            </div>

            {/* Melody */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="w-14 text-slate-400 text-[10px]">MELODY</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={deckA.stemMelody}
                onChange={(e) => onStemChange('A', 'melody', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#00f0ff]"
              />
              <span className="w-8 text-right text-[10px] text-slate-400">
                {Math.round(deckA.stemMelody * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Deck B Stems */}
        <div className="p-2.5 bg-[#0a0b12] rounded-xl border border-slate-800/80">
          <div className="text-[10px] font-bold font-mono text-[#00f0ff] mb-2 flex items-center justify-between">
            <span>DECK B STEMS</span>
            <span>{deckB.track?.title || 'No Track'}</span>
          </div>

          <div className="flex flex-col gap-2">
            {/* Vocals */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <Mic className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="w-14 text-slate-400 text-[10px]">VOCALS</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={deckB.stemVocals}
                onChange={(e) => onStemChange('B', 'vocals', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#ff2a85]"
              />
              <span className="w-8 text-right text-[10px] text-slate-400">
                {Math.round(deckB.stemVocals * 100)}%
              </span>
            </div>

            {/* Drums */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <Disc className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="w-14 text-slate-400 text-[10px]">DRUMS</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={deckB.stemDrums}
                onChange={(e) => onStemChange('B', 'drums', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
              />
              <span className="w-8 text-right text-[10px] text-slate-400">
                {Math.round(deckB.stemDrums * 100)}%
              </span>
            </div>

            {/* Melody */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="w-14 text-slate-400 text-[10px]">MELODY</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={deckB.stemMelody}
                onChange={(e) => onStemChange('B', 'melody', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#00f0ff]"
              />
              <span className="w-8 text-right text-[10px] text-slate-400">
                {Math.round(deckB.stemMelody * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
