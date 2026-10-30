import React, { useState } from 'react';
import { X, Award, Disc, Trophy, Share2, Download, CheckCircle2 } from 'lucide-react';
import { UserAwardState } from '../../types/dj';
import { DJ_CURRICULUM } from '../../data/curriculum';

interface DJProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAwards: UserAwardState;
}

export const DJProfileModal: React.FC<DJProfileModalProps> = ({
  isOpen,
  onClose,
  userAwards,
}) => {
  const [showCertificate, setShowCertificate] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const allCompleted = userAwards.completedLessonIds.length >= DJ_CURRICULUM.length;

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `Check out my DJ profile on Tokyo Beatmatch! Rank: ${userAwards.rankTitle} (${userAwards.xp} XP).`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#0c0d16] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#121422]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff2a85] to-[#8b5cf6] flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>DJ Profile & Award Showcase</span>
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-purple-400 font-bold">{userAwards.rankTitle}</span>
                <span>·</span>
                <span>STUDIO PERFORMANCE STATS</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="h-8 px-3 rounded-lg bg-[#1a1c2d] hover:bg-[#25283e] border border-slate-700 text-xs font-mono text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Link!' : 'Share Profile'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Identity Card */}
        <div className="p-5 bg-gradient-to-r from-[#171126] via-[#101222] to-[#0c0d18] border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff2a85] to-[#00f0ff] p-0.5 shadow-xl shadow-pink-500/25">
              <div className="w-full h-full rounded-2xl bg-[#090a10] flex items-center justify-center text-3xl">
                🎛️
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">DJ Resident</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ff2a85]/20 text-[#ff2a85] font-bold border border-[#ff2a85]/40">
                  LEVEL {userAwards.level}
                </span>
              </div>
              <p className="text-xs text-purple-300 font-mono mt-0.5">
                {userAwards.rankTitle} · Tokyo Beatmatch Certified
              </p>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                Total XP: <span className="text-amber-400 font-bold">{userAwards.xp}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCertificate(true)}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
          >
            <Trophy className="w-4 h-4" />
            <span>View DJ Certificate</span>
          </button>
        </div>

        {/* Performance Statistics Grid */}
        <div className="p-5 border-b border-slate-800 bg-[#0c0e18] grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[#111322] rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block">TOTAL TRANSITIONS</span>
            <span className="text-lg font-bold text-white font-mono">
              {userAwards.stats.transitionsCompleted}
            </span>
          </div>

          <div className="p-3 bg-[#111322] rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block">PERFECT SYNCS</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {userAwards.stats.perfectSyncs}
            </span>
          </div>

          <div className="p-3 bg-[#111322] rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block">SCRATCH TIME</span>
            <span className="text-lg font-bold text-[#00f0ff] font-mono">
              {userAwards.stats.scratchSeconds}s
            </span>
          </div>

          <div className="p-3 bg-[#111322] rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block">MIXES SHARED</span>
            <span className="text-lg font-bold text-[#ff2a85] font-mono">
              {userAwards.stats.mixesShared}
            </span>
          </div>
        </div>

        {/* Badges Showcase */}
        <div className="flex-1 overflow-y-auto p-5">
          <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-3">
            ACQUIRED PERFORMANCE BADGES ({userAwards.earnedBadges.length} / {DJ_CURRICULUM.length})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DJ_CURRICULUM.map((lesson) => {
              const badge = lesson.badgeReward;
              if (!badge) return null;
              const isEarned = userAwards.earnedBadges.some((b) => b.id === badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                    isEarned
                      ? 'bg-[#141628] border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-[#0f1019] border-slate-800 opacity-50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                      isEarned ? 'bg-amber-950/80 border border-amber-600' : 'bg-slate-900 border border-slate-800'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-white">{badge.title}</h5>
                      {isEarned && (
                        <span className="text-[9px] font-mono text-amber-400 font-bold">UNLOCKED</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate Modal */}
        {showCertificate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative w-full max-w-xl bg-[#090a10] border-4 border-amber-500 rounded-3xl p-8 text-center shadow-2xl space-y-4">
              <button
                onClick={() => setShowCertificate(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-4xl mb-1">👑</div>
              <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-serif">
                CERTIFICATE OF DJ MASTERY
              </h3>
              <p className="text-xs font-mono text-slate-400 tracking-widest uppercase">
                Tokyo Beatmatch DJ Academy · Tokyo, Japan
              </p>

              <div className="my-6 py-4 border-y border-amber-500/40">
                <p className="text-xs text-slate-300">This honor is officially awarded to</p>
                <p className="text-xl font-bold text-white mt-1">DJ Resident</p>
                <p className="text-xs text-amber-400 font-mono mt-1">
                  for demonstrating exceptional competence in Low-Latency Beatmatching, Harmonic Phrasing, 3-Band EQ Sculpting, and Live Performance.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2">
                <div>
                  <span className="text-white block font-bold">Sensei Kaori</span>
                  <span className="text-[10px]">HEAD INSTRUCTOR</span>
                </div>
                <div>
                  <span className="text-amber-400 block font-bold">{userAwards.rankTitle.toUpperCase()}</span>
                  <span className="text-[10px]">ACCREDITATION TIER</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
