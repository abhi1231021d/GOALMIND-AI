import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { goalService, milestoneService } from '../services/api';
import { Goal, Milestone } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { TopicLessonModal } from '../components/topic/TopicLessonModal';
import {
  Target,
  Sparkles,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle2,
  Trash2,
  ArrowRight,
  RefreshCw,
  Layers,
  ChevronRight,
  Video
} from 'lucide-react';

export const GoalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goalId = parseInt(id || '0', 10);

  const [goal, setGoal] = useState<Goal | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLessonTask, setSelectedLessonTask] = useState<any | null>(null);

  useEffect(() => {
    if (goalId) {
      loadGoalData();
    }
  }, [goalId]);

  const loadGoalData = async () => {
    setIsLoading(true);
    try {
      const [gRes, mRes] = await Promise.all([
        goalService.getGoalById(goalId),
        milestoneService.getMilestones(goalId),
      ]);
      setGoal(gRes.data);
      setMilestones(mRes.data);
    } catch (err) {
      console.error('Failed to load goal detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!goal || !window.confirm(`Delete goal "${goal.title}"?`)) return;
    try {
      await goalService.deleteGoal(goal.id);
      navigate('/goals');
    } catch (e) {
      console.error('Failed to delete goal:', e);
    }
  };

  if (isLoading || !goal) {
    return <LoadingSpinner size="lg" text="Loading goal details..." />;
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Breadcrumbs & Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
          <Link to="/goals" className="hover:underline">Goals</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-xs">{goal.title}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                {goal.category}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {goal.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {goal.title}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/goals/${goal.id}/roadmap`}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Roadmap</span>
            </Link>
            <Link
              to={`/goals/${goal.id}/prediction`}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition active:scale-95"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Forecast</span>
            </Link>
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Delete goal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Goal Parameters Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Timeline</span>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            {goal.startDate} → {goal.targetDate}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pacing Budget</span>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            {goal.dailyHours} hrs/day · {goal.daysPerWeek} days/week
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Rigor & Style</span>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            {goal.difficulty} · {goal.currentLevel}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Completion</span>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {goal.progressPercentage || 0}% ({goal.completedTasks || 0}/{goal.totalTasks || 0} tasks)
          </p>
        </div>
      </div>

      {/* Target Outcome & Rationale */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Target Outcome & Motivation
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-white">Target Outcome:</strong>{' '}
          {goal.targetOutcome || 'No specific target outcome detailed.'}
        </p>
        {goal.reason && (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Motivation / Why:</strong> {goal.reason}
          </p>
        )}
      </div>

      {/* Bi-directional Retest Loop Card */}
      {((goal.progressPercentage || 0) >= 100 || goal.status === 'COMPLETED') && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-indigo-500/10 to-transparent border border-emerald-500/25 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <span>Skill Mastered: {goal.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                100% Completed
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Ready to validate your knowledge under real-world interview conditions? Take a 5-minute mock simulation in the Adaptive Interview Lab!
            </p>
          </div>
          <Link
            to={`/interview-simulator?role=${encodeURIComponent(goal.category)}&topic=${encodeURIComponent(goal.title)}`}
            className="flex-shrink-0 inline-flex items-center space-x-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md hover:shadow-indigo-500/25 active:scale-95"
          >
            <span>🎙️ Take 5-Min Mock Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Milestones & Tasks Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Roadmap Milestones ({milestones.length})
          </h2>
          <Link
            to={`/goals/${goal.id}/roadmap`}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>Manage Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {milestones.length === 0 ? (
          <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              No milestones have been created for this goal yet.
            </p>
            <Link
              to={`/goals/${goal.id}/roadmap`}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Roadmap</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {milestones.map((m, index) => (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{m.title}</h4>
                      <p className="text-[11px] text-slate-400">{m.expectedOutcome}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-400 font-medium">Est: {m.estimatedHours} hrs</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Target: {m.targetDate}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {m.status}
                    </span>
                  </div>
                </div>

                {/* Tasks inside milestone */}
                {m.tasks && m.tasks.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {m.tasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              t.status === 'COMPLETED' ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                          <div>
                            <span className={`font-semibold ${t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {t.title}
                            </span>
                            <span className="block text-[10px] text-slate-400">{t.instructions}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedLessonTask(t)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px] rounded-lg border border-indigo-200 dark:border-indigo-800 transition shadow-xs"
                            title="Topic Explanation & Video Lesson"
                          >
                            <Video className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                            <span>Lesson & Video</span>
                          </button>
                          <span className="text-[10px] font-bold text-slate-400">{t.estimatedMinutes} mins</span>
                          <span className="text-[10px] font-bold text-slate-500">Due: {t.dueDate}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.priority === 'HIGH'
                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lesson & Video Modal */}
      {selectedLessonTask && (
        <TopicLessonModal
          task={selectedLessonTask}
          isOpen={!!selectedLessonTask}
          onClose={() => setSelectedLessonTask(null)}
          onUpdateTask={(updatedTask) => {
            if (milestones) {
              const updatedMilestones = milestones.map((m) => ({
                ...m,
                tasks: m.tasks?.map((t) =>
                  (t.id && updatedTask.id && t.id === updatedTask.id) || t.title === updatedTask.title
                    ? { ...t, ...updatedTask }
                    : t
                ),
              }));
              setMilestones(updatedMilestones);
            }
            setSelectedLessonTask(updatedTask);
          }}
        />
      )}
    </div>
  );
};
