import React, { useState, useEffect } from 'react';
import { Task, TaskSession } from '../../types';
import { taskSessionService } from '../../services/api';
import { Play, Pause, Square, RotateCcw, X, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface FocusTimerModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
}) => {
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<TaskSession | null>(null);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [blockerNotes, setBlockerNotes] = useState<string>('');
  const [markComplete, setMarkComplete] = useState<boolean>(false);
  const [markPartiallyComplete, setMarkPartiallyComplete] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isOpen) return null;

  const handleStart = async () => {
    try {
      const res = await taskSessionService.startSession(task.id, sessionNotes);
      setCurrentSession(res.data);
      setIsActive(true);
    } catch (err) {
      console.error('Failed to start session:', err);
      // Fallback local timer if offline
      setIsActive(true);
    }
  };

  const handlePause = async () => {
    setIsActive(false);
    if (currentSession) {
      try {
        await taskSessionService.pauseSession(task.id, currentSession.id);
      } catch (err) {
        console.error('Failed to pause session:', err);
      }
    }
  };

  const handleResume = async () => {
    setIsActive(true);
    if (currentSession) {
      try {
        await taskSessionService.resumeSession(task.id, currentSession.id);
      } catch (err) {
        console.error('Failed to resume session:', err);
      }
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    setIsActive(false);
    try {
      if (currentSession) {
        await taskSessionService.finishSession(task.id, currentSession.id, {
          durationSeconds: seconds,
          notes: sessionNotes,
          markTaskComplete: markComplete,
          markTaskPartiallyComplete: markPartiallyComplete,
          blockerNotes: blockerNotes.trim() ? blockerNotes : undefined,
        });
      }
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to finish session:', err);
      onTaskUpdated();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Focus Session</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{task.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Timer Display */}
          <div className="flex flex-col items-center justify-center my-4">
            <div className="relative flex items-center justify-center w-52 h-52 rounded-full border-4 border-indigo-100 dark:border-indigo-950/80 bg-indigo-50/30 dark:bg-slate-950 shadow-inner">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                {formatTime(seconds)}
              </span>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center space-x-3 mt-6">
              {!isActive ? (
                <button
                  onClick={currentSession ? handleResume : handleStart}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl shadow-md hover:shadow-indigo-500/20 active:scale-95 transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{currentSession ? 'Resume' : 'Start Focus'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-2xl shadow-md hover:shadow-amber-500/20 active:scale-95 transition"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={handleReset}
                disabled={seconds === 0}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleFinish}
                disabled={seconds === 0 || isSubmitting}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-2xl shadow-md hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-40 transition"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Finish & Record</span>
              </button>
            </div>
          </div>

          {/* Form Options upon finish */}
          <div className="space-y-3.5 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Session Notes (Learnings / Summary)
              </label>
              <input
                type="text"
                placeholder="What did you work on or discover?"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Any Blockers Encountered?</span>
              </label>
              <input
                type="text"
                placeholder="E.g., difficult bug, unclear concept, lack of documentation"
                value={blockerNotes}
                onChange={(e) => setBlockerNotes(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Explicit Completion Checkboxes */}
            <div className="pt-2 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={markComplete}
                  onChange={(e) => {
                    setMarkComplete(e.target.checked);
                    if (e.target.checked) setMarkPartiallyComplete(false);
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Mark task fully complete upon finishing session</span>
                </span>
              </label>

              {!markComplete && (
                <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={markPartiallyComplete}
                    onChange={(e) => setMarkPartiallyComplete(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>Mark task partially complete</span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
