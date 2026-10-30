import React, { useState, useEffect } from 'react';
import { X, Flame, Sliders, Music, MessageCircle, Send, Play, Heart } from 'lucide-react';

interface CommunityMix {
  id: string;
  title: string;
  djName: string;
  avatarSeed: string;
  genre: string;
  bpm: number;
  durationSeconds: number;
  createdAt: string;
  tracklist: string[];
  description: string;
  likes: number;
  fireRating: number;
  smoothRating: number;
  grooveRating: number;
  comments: Array<{
    id: string;
    user: string;
    text: string;
    timestamp: string;
  }>;
  waveformSnippet?: number[];
}

interface CommunityFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityFeedModal: React.FC<CommunityFeedModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [mixes, setMixes] = useState<CommunityMix[]>([]);
  const [activeCommentMixId, setActiveCommentMixId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [userName, setUserName] = useState('Tokyo Club DJ');

  useEffect(() => {
    if (!isOpen) return;
    fetchMixes();
  }, [isOpen]);

  const fetchMixes = async () => {
    try {
      const res = await fetch('/api/community/mixes');
      if (res.ok) {
        const data = await res.json();
        setMixes(data.mixes || []);
      }
    } catch {
      // Offline fallback
    }
  };

  const handleReact = async (mixId: string, type: 'fire' | 'smooth' | 'groove' | 'like') => {
    try {
      const res = await fetch(`/api/community/mixes/${mixId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        setMixes((prev) => prev.map((m) => (m.id === mixId ? data.mix : m)));
      }
    } catch {
      // Local optimistic update
      setMixes((prev) =>
        prev.map((m) => {
          if (m.id !== mixId) return m;
          return {
            ...m,
            fireRating: type === 'fire' ? m.fireRating + 1 : m.fireRating,
            smoothRating: type === 'smooth' ? m.smoothRating + 1 : m.smoothRating,
            grooveRating: type === 'groove' ? m.grooveRating + 1 : m.grooveRating,
            likes: type === 'like' ? m.likes + 1 : m.likes,
          };
        })
      );
    }
  };

  const handlePostComment = async (mixId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`/api/community/mixes/${mixId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentText: commentText.trim(),
          userName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMixes((prev) => prev.map((m) => (m.id === mixId ? data.mix : m)));
      }
      setCommentText('');
    } catch {
      // Offline
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#0c0d16] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#121422]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff2a85] to-[#ffb800] flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Tokyo DJ Community Feed</span>
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>SHARE, LISTEN & RATE LIVE MIXES</span>
                <span>·</span>
                <span className="text-[#ff2a85] font-bold">PEER FEEDBACK</span>
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

        {/* Mixes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mixes.map((mix) => (
            <div
              key={mix.id}
              className="p-4 bg-[#111322] border border-slate-800 rounded-2xl space-y-3"
            >
              {/* Mix Title & DJ Lockup */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff2a85] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm shadow-md">
                    🎧
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{mix.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                      <span className="text-purple-300 font-semibold">{mix.djName}</span>
                      <span>·</span>
                      <span>{mix.genre}</span>
                      <span>·</span>
                      <span className="text-cyan-400">{mix.bpm} BPM</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <button
                    onClick={() => handleReact(mix.id, 'like')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#181b2c] hover:bg-[#23273e] text-rose-400 border border-slate-700 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>{mix.likes}</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {mix.description}
              </p>

              {/* Waveform graphic snippet preview */}
              <div className="h-10 bg-[#090a12] rounded-xl border border-slate-800 p-1 flex items-center gap-1 justify-between">
                {(mix.waveformSnippet || [0.3, 0.6, 0.8, 0.4, 0.7, 0.9, 0.6, 0.4]).map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-[1px] bg-gradient-to-t from-[#ff2a85] to-[#00f0ff] opacity-80"
                    style={{ height: `${val * 100}%` }}
                  />
                ))}
              </div>

              {/* Tracklist tags */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="text-slate-500">TRACKS:</span>
                {mix.tracklist.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-[#181a2b] text-slate-300 border border-slate-800">
                    {t}
                  </span>
                ))}
              </div>

              {/* Reaction Badges (Fire 🔥, Smooth Transition 🎚️, Groove 💃) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReact(mix.id, 'fire')}
                    className="h-8 px-2.5 rounded-lg bg-[#1e1319] hover:bg-[#2c1a25] border border-orange-900/60 text-orange-400 font-mono text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                    title="Vote Fire Mix"
                  >
                    <span>🔥 Fire</span>
                    <span className="bg-orange-950 px-1.5 py-0.2 rounded text-[10px] text-orange-200">
                      {mix.fireRating}%
                    </span>
                  </button>

                  <button
                    onClick={() => handleReact(mix.id, 'smooth')}
                    className="h-8 px-2.5 rounded-lg bg-[#111c22] hover:bg-[#182931] border border-cyan-900/60 text-cyan-400 font-mono text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                    title="Vote Smooth Transitions"
                  >
                    <span>🎚️ Smooth</span>
                    <span className="bg-cyan-950 px-1.5 py-0.2 rounded text-[10px] text-cyan-200">
                      {mix.smoothRating}%
                    </span>
                  </button>

                  <button
                    onClick={() => handleReact(mix.id, 'groove')}
                    className="h-8 px-2.5 rounded-lg bg-[#1b1426] hover:bg-[#271d37] border border-purple-900/60 text-purple-400 font-mono text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                    title="Vote Dance Groove"
                  >
                    <span>💃 Groove</span>
                    <span className="bg-purple-950 px-1.5 py-0.2 rounded text-[10px] text-purple-200">
                      {mix.grooveRating}%
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => setActiveCommentMixId(activeCommentMixId === mix.id ? null : mix.id)}
                  className="h-8 px-3 rounded-lg bg-[#17192a] hover:bg-[#22253e] text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{mix.comments.length} Comments</span>
                </button>
              </div>

              {/* Comments Accordion */}
              {activeCommentMixId === mix.id && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {mix.comments.length === 0 ? (
                      <div className="text-xs font-mono text-slate-500 py-2">
                        Be the first to leave feedback on this mix!
                      </div>
                    ) : (
                      mix.comments.map((c) => (
                        <div key={c.id} className="p-2 bg-[#090a12] rounded-lg border border-slate-800/80 text-xs font-mono">
                          <span className="text-[#ff2a85] font-bold">{c.user}: </span>
                          <span className="text-slate-200">{c.text}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={(e) => handlePostComment(mix.id, e)} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Leave critique or props on EQing & transitions..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-xl bg-[#090a12] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff2a85]"
                    />
                    <button
                      type="submit"
                      className="h-9 px-3 rounded-xl bg-[#ff2a85] hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
