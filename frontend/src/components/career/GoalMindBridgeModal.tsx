import React from 'react';
import { Target, ArrowRight, X, Sparkles, BookOpen, Clock } from 'lucide-react';

export interface BridgePayload {
  skill: string;
  category?: string;
  sourceContext: string;
  notes?: string;
}

interface GoalMindBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: BridgePayload | null;
  onConfirm: (payload: BridgePayload) => void;
}

export const GoalMindBridgeModal: React.FC<GoalMindBridgeModalProps> = ({
  isOpen,
  onClose,
  payload,
  onConfirm,
}) => {
  if (!isOpen || !payload) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Master in GoalMind AI</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Personalized Learning Roadmap Bridge</p>
          </div>
        </div>

        <div className="p-3.5 mb-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Target Skill / Topic
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium">
              {payload.sourceContext}
            </span>
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">{payload.skill}</p>
          {payload.notes && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">"{payload.notes}"</p>
          )}
        </div>

        <div className="space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>AI generates a tailored, milestone-by-milestone curriculum</span>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Curates free YouTube tutorials, quizzes, and documentation</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span>Bite-sized daily tasks with built-in Focus Mode timers</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(payload)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/25 active:scale-95 transition flex items-center justify-center space-x-1.5"
          >
            <span>Create Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
