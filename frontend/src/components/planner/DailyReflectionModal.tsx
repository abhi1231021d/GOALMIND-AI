import React, { useState, useEffect } from 'react';
import { reflectionService } from '../../services/api';
import { BookOpen, X, Check, Sparkles } from 'lucide-react';

interface DailyReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  initialDate?: string;
}

export const DailyReflectionModal: React.FC<DailyReflectionModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialDate,
}) => {
  const date = initialDate || new Date().toISOString().split('T')[0];
  const [accomplishments, setAccomplishments] = useState('');
  const [blockers, setBlockers] = useState('');
  const [learnings, setLearnings] = useState('');
  const [improvements, setImprovements] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSaved(false);
      reflectionService.getTodayReflection(date).then((res) => {
        if (res.data) {
          setAccomplishments(res.data.accomplishments || '');
          setBlockers(res.data.blockers || '');
          setLearnings(res.data.learnings || '');
          setImprovements(res.data.improvementsForTomorrow || '');
        }
      }).catch((e) => console.log('No reflection found for today:', e));
    }
  }, [isOpen, date]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await reflectionService.saveReflection({
        date,
        accomplishments,
        blockers,
        learnings,
        improvementsForTomorrow: improvements,
      });
      setIsSaved(true);
      if (onSaved) onSaved();
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      console.error('Failed to save reflection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Daily Reflection</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Date: {date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              1. What did I accomplish today?
            </label>
            <textarea
              rows={2}
              required
              placeholder="Completed Milestone 1 task, finished 45 min focus session..."
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              2. What prevented me from completing other tasks?
            </label>
            <textarea
              rows={2}
              placeholder="Unexpected meetings, phone notifications, ambiguous instructions..."
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              3. What did I learn?
            </label>
            <textarea
              rows={2}
              placeholder="Understanding immutable records in Java 21, solving race conditions..."
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              4. What should I improve tomorrow?
            </label>
            <textarea
              rows={2}
              placeholder="Start working 30 mins earlier, silence phone during focus sprints..."
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isSaved}
              className="inline-flex items-center space-x-1.5 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-violet-500/20 active:scale-95 transition disabled:opacity-50"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isLoading ? 'Saving...' : 'Save Reflection'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
