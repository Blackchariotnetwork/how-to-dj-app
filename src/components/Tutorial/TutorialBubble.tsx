import React, { useState } from 'react';
import { Sparkles, ChevronRight, CheckCircle2, X } from 'lucide-react';
import { TutorialLesson } from '../../types/dj';

interface TutorialBubbleProps {
  lesson: TutorialLesson;
  onCompleteLesson: () => void;
  onNextLesson: () => void;
  onClose: () => void;
  isPassed: boolean;
}

export const TutorialBubble: React.FC<TutorialBubbleProps> = ({
  lesson,
  onCompleteLesson,
  onNextLesson,
  onClose,
  isPassed,
}) => {
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);

  const handleAskMentor = async () => {
    setIsLoadingTip(true);
    try {
      const res = await fetch('/api/ai/mentor-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: lesson.title,
          userSkillLevel: lesson.tierName,
          currentExercise: lesson.practiceGoal,
        }),
      });
      const data = await res.json();
      if (data.actionableTip) {
        setAiTip(`"${data.quote}" — ${data.actionableTip}`);
      }
    } catch {
      setAiTip('Count in sets of 4 beats: 1, 2, 3, 4. Nudge gently and let the audio transients lock into place!');
    } finally {
      setIsLoadingTip(false);
    }
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 bg-[#07080f] border-2 border-slate-700/80 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.95)] p-4 select-none backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 font-mono">
      {/* Hardware Lab Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-2 mb-2.5">
        <div className="flex items-center gap-2.5">
          {/* Hardware LED Status Indicator */}
          <div className="w-8 h-8 rounded bg-[#101322] border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-extrabold text-xs shadow-inner">
            <span>PRO</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wider">HARDWARE ACADEMY</span>
              <span className="text-[9px] text-amber-400 font-bold px-1.5 py-0.2 bg-[#1c1408] rounded border border-amber-600/60">
                {lesson.tierName.toUpperCase()}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {lesson.title} · +{lesson.xpReward} XP
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          title="Minimize Guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Technical Guidance */}
      <div className="text-xs text-slate-300 leading-relaxed mb-2.5 font-sans">
        {lesson.bubbleText}
      </div>

      {/* Target Drill Objective */}
      <div className="p-2.5 bg-[#030408] rounded-lg border border-slate-800/80 mb-2.5 text-[11px]">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>HARDWARE DRILL TARGET:</span>
        </div>
        <span className="text-slate-300 font-sans">{lesson.practiceGoal}</span>
      </div>

      {/* AI Pro Audio Engineer Tip */}
      {aiTip && (
        <div className="p-2.5 bg-[#0b1020] rounded-lg border border-cyan-800/60 mb-2.5 text-[11px] text-cyan-200 leading-relaxed font-sans">
          <span className="text-cyan-400 font-bold block mb-0.5 font-mono">TECHNICAL ADVICE:</span>
          {aiTip}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={handleAskMentor}
          disabled={isLoadingTip}
          className="h-7 px-2.5 rounded bg-[#101322] hover:bg-[#1a2038] border border-slate-700 text-[10px] font-bold text-slate-300 transition-colors flex items-center gap-1.5 active:scale-95"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>{isLoadingTip ? 'CALCULATING...' : 'AI ADVICE'}</span>
        </button>

        <div className="flex items-center gap-2">
          {!isPassed ? (
            <button
              onClick={onCompleteLesson}
              className="h-7 px-3 rounded bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-[11px] transition-transform flex items-center gap-1.5 shadow-md shadow-emerald-900/50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>COMPLETE DRILL</span>
            </button>
          ) : (
            <button
              onClick={onNextLesson}
              className="h-7 px-3 rounded bg-[#0051c7] hover:bg-blue-600 active:scale-95 text-white font-extrabold text-[11px] transition-transform flex items-center gap-1.5 shadow-md shadow-blue-900/50"
            >
              <span>NEXT DRILL</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
