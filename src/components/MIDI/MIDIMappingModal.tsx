import React, { useState, useEffect } from 'react';
import { X, Sliders, Radio, Check, AlertCircle } from 'lucide-react';
import { midiService } from '../../services/midiService';
import { MIDIMappingItem } from '../../types/dj';

interface MIDIMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MIDIMappingModal: React.FC<MIDIMappingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [devices, setDevices] = useState<string[]>([]);
  const [mappings, setMappings] = useState<MIDIMappingItem[]>([]);
  const [activeLearnTarget, setActiveLearnTarget] = useState<MIDIMappingItem['target'] | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Detecting MIDI hardware...');

  useEffect(() => {
    if (!isOpen) return;
    initMIDI();
  }, [isOpen]);

  const initMIDI = async () => {
    const res = await midiService.connect();
    setDevices(res.devices);
    setMappings(midiService.getMappings());
    if (res.supported) {
      setStatusMessage(
        res.devices.length > 0
          ? `Connected to ${res.devices.join(', ')}`
          : 'Web MIDI active. Connect your Pioneer, Traktor, or Hercules controller.'
      );
    } else {
      setStatusMessage('Web MIDI not supported in this browser. Use Chrome, Edge, or Opera.');
    }
  };

  const handleStartLearn = (target: MIDIMappingItem['target']) => {
    setActiveLearnTarget(target);
    midiService.startLearning(target, (newMapping) => {
      setMappings(midiService.getMappings());
      setActiveLearnTarget(null);
    });
  };

  if (!isOpen) return null;

  const controlLabels: Array<{ target: MIDIMappingItem['target']; label: string }> = [
    { target: 'crossfader', label: 'Master Crossfader (CC)' },
    { target: 'deckA_play', label: 'Deck A Play/Pause (Note)' },
    { target: 'deckA_cue', label: 'Deck A CUE Jump (Note)' },
    { target: 'deckA_pitch', label: 'Deck A Tempo Pitch Fader (CC)' },
    { target: 'deckA_low', label: 'Deck A Low EQ Rotary (CC)' },
    { target: 'deckA_filter', label: 'Deck A Bi-directional Filter (CC)' },
    { target: 'deckB_play', label: 'Deck B Play/Pause (Note)' },
    { target: 'deckB_cue', label: 'Deck B CUE Jump (Note)' },
    { target: 'deckB_pitch', label: 'Deck B Tempo Pitch Fader (CC)' },
    { target: 'deckB_low', label: 'Deck B Low EQ Rotary (CC)' },
    { target: 'deckB_filter', label: 'Deck B Bi-directional Filter (CC)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c0d16] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#121422]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ffb800] to-[#ff2a85] flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Hardware MIDI Controller Mapping</span>
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-amber-400 font-bold">LOW LATENCY (&lt;5ms)</span>
                <span>·</span>
                <span>PIONEER / TRAKTOR / HERCULES</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Status Bar */}
        <div className="p-3 bg-[#141626] border-b border-slate-800 flex items-center gap-2 text-xs font-mono text-slate-300">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{statusMessage}</span>
        </div>

        {/* Mapping Rows */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[60vh]">
          {controlLabels.map((item) => {
            const mapped = mappings.find((m) => m.target === item.target);
            const isLearningThis = activeLearnTarget === item.target;

            return (
              <div
                key={item.target}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isLearningThis
                    ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/50 animate-pulse'
                    : 'bg-[#111320] border-slate-800'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-white block">{item.label}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {mapped
                      ? `Mapped to Ch ${mapped.channel} · ${mapped.midiType.toUpperCase()} #${mapped.controlNumber}`
                      : 'Unassigned'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartLearn(item.target)}
                    className={`h-8 px-3 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 ${
                      isLearningThis
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/40'
                        : 'bg-[#1a1c2d] hover:bg-[#25283e] text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isLearningThis ? 'TOUCH CONTROL ON HARDWARE...' : 'MIDI LEARN'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#111322] flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Mappings save automatically to this device</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
