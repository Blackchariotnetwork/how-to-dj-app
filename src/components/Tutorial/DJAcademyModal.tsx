import React from 'react';
import { X, Award, CheckCircle2, Trophy, ArrowRight, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DJ_CURRICULUM } from '../../data/curriculum';
import { TutorialLesson, UserAwardState } from '../../types/dj';

interface DJAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAwards: UserAwardState;
  onSelectLesson: (lesson: TutorialLesson) => void;
  currentLessonId: string | null;
}

export const DJAcademyModal: React.FC<DJAcademyModalProps> = ({
  isOpen,
  onClose,
  userAwards,
  onSelectLesson,
  currentLessonId,
}) => {
  if (!isOpen) return null;

  // Level progress math
  const xpForNextLevel = userAwards.level * 500;
  const currentLevelBaseXP = (userAwards.level - 1) * 500;
  const progressInLevel = Math.max(0, userAwards.xp - currentLevelBaseXP);
  const percentToNext = Math.min(100, Math.round((progressInLevel / 500) * 100));

  const handleLaunch = (lesson: TutorialLesson) => {
    onSelectLesson(lesson);
    onClose();
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#ff2a85', '#00f0ff', '#ffb800'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0d0e17] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header with Professional Hardware Aesthetic */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#070912]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#101426] border border-cyan-500/50 flex items-center justify-center shadow-inner">
              <Trophy className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-mono">
                <span>Pioneer Pro DJ Masterclass & Hardware Drills</span>
              </h2>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span>REKORDBOX STANDARDS</span>
                <span>·</span>
                <span className="text-amber-400 font-bold">5 TIERS (NOVICE → HEADLINER)</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Progress Stats Header Card */}
        <div className="p-4 bg-[#0a0c16] border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="flex items-center gap-3 p-3 bg-[#05060b] rounded-lg border border-slate-800">
            <div className="w-9 h-9 rounded bg-[#101322] border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs">
              RANK
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">CURRENT RANK</span>
              <span className="text-sm font-bold text-white">
                {userAwards.rankTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#05060b] rounded-lg border border-slate-800">
            <div className="w-9 h-9 rounded bg-[#101322] border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
              XP
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-slate-500">LEVEL {userAwards.level}</span>
                <span className="text-amber-400 font-bold">{userAwards.xp} XP</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all"
                  style={{ width: `${percentToNext}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#05060b] rounded-lg border border-slate-800">
            <div className="w-9 h-9 rounded bg-[#101322] border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs">
              SPEC
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">CERTIFICATIONS</span>
              <span className="text-sm font-bold text-emerald-400">
                {userAwards.earnedBadges.length} / {DJ_CURRICULUM.length}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Curriculum List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {DJ_CURRICULUM.map((lesson) => {
            const isCompleted = userAwards.completedLessonIds.includes(lesson.id);
            const isCurrent = currentLessonId === lesson.id;

            return (
              <div
                key={lesson.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-[#1b1c2e] border-[#ff2a85] shadow-lg shadow-pink-500/20'
                    : isCompleted
                    ? 'bg-[#10121c] border-emerald-900/60'
                    : 'bg-[#10121c] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold font-mono text-sm ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                          : 'bg-[#181a29] text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : lesson.tier}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-semibold text-purple-400 px-2 py-0.5 bg-purple-950/60 rounded border border-purple-800/50">
                          TIER {lesson.tier}: {lesson.tierName.toUpperCase()}
                        </span>
                        <span className="text-xs font-mono text-amber-400 font-bold">
                          +{lesson.xpReward} XP
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">{lesson.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">
                        {lesson.description}
                      </p>

                      {/* Badge Reward Preview */}
                      {lesson.badgeReward && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                          <span>{lesson.badgeReward.icon}</span>
                          <span className="text-slate-300 font-semibold">{lesson.badgeReward.title}</span>
                          <span>·</span>
                          <span>{lesson.badgeReward.description}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Launch Drill Action */}
                  <div className="sm:shrink-0 flex items-center gap-2 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleLaunch(lesson)}
                      className={`w-full sm:w-auto h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 border ${
                        isCurrent
                          ? 'bg-[#ff2a85] text-white border-pink-400 shadow-md shadow-pink-500/30'
                          : isCompleted
                          ? 'bg-[#181a2a] text-slate-200 border-slate-700 hover:bg-[#22253b]'
                          : 'bg-gradient-to-r from-[#ff2a85] to-[#8b5cf6] text-white border-transparent'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCompleted ? 'Practice Again' : isCurrent ? 'Active Drill' : 'Start Drill'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#111320] flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Complete all 5 tiers to unlock the Master DJ Certificate</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Academy
          </button>
        </div>
      </div>
    </div>
  );
};
