import React, { useState, useEffect } from 'react';
import { X, Users, Send, RefreshCw, Radio } from 'lucide-react';
import { DeckState, MasterState } from '../../types/dj';

interface B2BRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckA: DeckState;
  deckB: DeckState;
  master: MasterState;
  onSyncExternalState: (crossfader: number) => void;
}

export const B2BRoomModal: React.FC<B2BRoomModalProps> = ({
  isOpen,
  onClose,
  deckA,
  deckB,
  master,
  onSyncExternalState,
}) => {
  const [roomCode, setRoomCode] = useState('TOKYO-B2B');
  const [userName, setUserName] = useState('Guest DJ');
  const [assignedDeck, setAssignedDeck] = useState<'A' | 'B'>('B');
  const [roomData, setRoomData] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval);
  }, [isOpen, roomCode]);

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/b2b/rooms/${roomCode}`);
      if (res.ok) {
        const data = await res.json();
        setRoomData(data.room);
        if (typeof data.room?.crossfader === 'number') {
          // Sync crossfader if changed remotely
          // onSyncExternalState(data.room.crossfader);
        }
      }
    } catch {
      // Offline fallback
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      await fetch(`/api/b2b/rooms/${roomCode}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          djName: userName,
          crossfader: master.crossfader,
          chatMessage: {
            dj: `${userName} (Deck ${assignedDeck})`,
            message: chatInput.trim(),
          },
        }),
      });
      setChatInput('');
      fetchRoom();
    } catch {
      // Offline
    }
  };

  const handlePassCrossfader = async (toTarget: number) => {
    try {
      await fetch(`/api/b2b/rooms/${roomCode}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          djName: userName,
          crossfader: toTarget,
          activeTurnDj: assignedDeck === 'A' ? 'Deck B Partner' : 'Deck A Partner',
        }),
      });
      onSyncExternalState(toTarget);
      fetchRoom();
    } catch {
      onSyncExternalState(toTarget);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c0d16] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#121422]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b5cf6] to-[#00f0ff] flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Back-to-Back (B2B) Live Session</span>
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-purple-400 font-bold">ROOM: {roomCode}</span>
                <span>·</span>
                <span>REAL-TIME COLLABORATION</span>
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

        {/* Room Settings Bar */}
        <div className="p-4 bg-[#141626] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">YOUR DJ ALIAS:</span>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="h-8 px-2.5 rounded-lg bg-[#0a0b12] border border-slate-700 text-white font-bold w-32 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">ASSIGNED DECK:</span>
            <div className="flex items-center gap-1 bg-[#0a0b12] p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setAssignedDeck('A')}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  assignedDeck === 'A' ? 'bg-[#ff2a85] text-white' : 'text-slate-400'
                }`}
              >
                DECK A
              </button>
              <button
                onClick={() => setAssignedDeck('B')}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  assignedDeck === 'B' ? 'bg-[#00f0ff] text-black' : 'text-slate-400'
                }`}
              >
                DECK B
              </button>
            </div>
          </div>
        </div>

        {/* B2B Studio Status & Pass-The-Crossfader */}
        <div className="p-5 border-b border-slate-800 bg-[#0f111c] space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#0a0b12] rounded-xl border border-slate-800/80">
              <div className="text-[10px] font-mono text-[#ff2a85] font-bold mb-1">DECK A (HOST)</div>
              <div className="text-sm font-bold text-white truncate">
                {roomData?.deckA?.trackId || deckA.track?.title || 'Shibuya Neon Rush'}
              </div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                DJ: {roomData?.deckA?.djName || 'Sensei Kaori'} · 128 BPM
              </div>
            </div>

            <div className="p-3 bg-[#0a0b12] rounded-xl border border-slate-800/80">
              <div className="text-[10px] font-mono text-[#00f0ff] font-bold mb-1">DECK B (GUEST)</div>
              <div className="text-sm font-bold text-white truncate">
                {roomData?.deckB?.trackId || deckB.track?.title || 'Midnight Mirage'}
              </div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                DJ: {roomData?.deckB?.djName || userName} · 124 BPM
              </div>
            </div>
          </div>

          {/* Quick Pass The Crossfader Buttons */}
          <div className="flex items-center justify-between gap-3 p-3 bg-[#131522] rounded-xl border border-slate-800">
            <span className="text-xs font-mono text-slate-300">PASS THE MASTER MIX:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePassCrossfader(-1)}
                className="h-8 px-3 rounded-lg bg-[#ff2a85] hover:bg-pink-600 text-white font-mono text-xs font-bold transition-all active:scale-95"
              >
                PASS TO DECK A
              </button>
              <button
                onClick={() => handlePassCrossfader(0)}
                className="h-8 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-mono text-xs font-bold transition-all active:scale-95"
              >
                CENTER (50/50)
              </button>
              <button
                onClick={() => handlePassCrossfader(1)}
                className="h-8 px-3 rounded-lg bg-[#00f0ff] hover:bg-cyan-400 text-black font-mono text-xs font-bold transition-all active:scale-95"
              >
                PASS TO DECK B
              </button>
            </div>
          </div>
        </div>

        {/* Live Session Chat Log */}
        <div className="flex-1 p-4 bg-[#0a0b12] overflow-y-auto max-h-48 space-y-2">
          {roomData?.chatMessages && roomData.chatMessages.length > 0 ? (
            roomData.chatMessages.map((msg: any) => (
              <div key={msg.id} className="text-xs font-mono bg-[#111320] p-2 rounded-lg border border-slate-800/60">
                <span className="text-purple-400 font-bold">{msg.dj}: </span>
                <span className="text-slate-200">{msg.message}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs font-mono text-slate-600">
              No chat messages yet. Plan your next transition drop together!
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-[#111322] border-t border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Type cue advice, drop timing, or shoutouts..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 h-10 px-3 rounded-xl bg-[#0a0b12] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
