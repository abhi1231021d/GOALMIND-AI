import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roadmapService, goalService } from '../services/api';
import { Goal, Milestone, Task } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { TopicLessonModal } from '../components/topic/TopicLessonModal';
import {
  Sparkles,
  Check,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Video
} from 'lucide-react';

export const AiRoadmapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goalId = parseInt(id || '0', 10);

  const [goal, setGoal] = useState<Goal | null>(null);
  const [roadmap, setRoadmap] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Record<number, boolean>>({});
  const [selectedLessonTask, setSelectedLessonTask] = useState<Task | null>(null);

  useEffect(() => {
    if (goalId) {
      loadData();
    }
  }, [goalId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const gRes = await goalService.getGoalById(goalId);
      setGoal(gRes.data);

      // Check if goal already has an active roadmap
      const activeRes = await roadmapService.getRoadmap(goalId);
      if (activeRes.data && activeRes.data.milestones && activeRes.data.milestones.length > 0) {
        setRoadmap(activeRes.data);
        const exp: Record<number, boolean> = {};
        activeRes.data.milestones.forEach((_: any, idx: number) => {
          exp[idx] = true;
        });
        setExpandedMilestones(exp);
      } else {
        // Generate initial preview
        await generatePreview();
      }
    } catch (err) {
      console.error('Failed to load roadmap data:', err);
      // Attempt preview generation on failure
      await generatePreview();
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreview = async () => {
    setIsRegenerating(true);
    try {
      const res = await roadmapService.generatePreview(goalId);
      setRoadmap(res.data);
      const exp: Record<number, boolean> = {};
      if (res.data.milestones) {
        res.data.milestones.forEach((_: any, idx: number) => {
          exp[idx] = true;
        });
      }
      setExpandedMilestones(exp);
    } catch (e) {
      console.error('Failed to generate roadmap preview:', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedMilestones((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleDeleteTask = (milestoneIdx: number, taskIdx: number) => {
    if (!roadmap) return;
    const updated = { ...roadmap };
    updated.milestones[milestoneIdx].tasks.splice(taskIdx, 1);
    setRoadmap(updated);
  };

  const handleAddTask = (milestoneIdx: number) => {
    if (!roadmap) return;
    const taskTitle = prompt('Enter new task title:');
    if (!taskTitle) return;

    const updated = { ...roadmap };
    const m = updated.milestones[milestoneIdx];
    const newTask = {
      title: taskTitle,
      instructions: 'Custom user defined task instructions.',
      estimatedMinutes: 60,
      actualMinutes: 0,
      priority: 'MEDIUM',
      difficulty: 'MEDIUM',
      dueDate: m.targetDate || new Date().toISOString().split('T')[0],
      status: 'PENDING',
      completionCriteria: 'Verified completion of target criteria.',
    };
    m.tasks.push(newTask);
    setRoadmap(updated);
  };

  const handleApplyRoadmap = async () => {
    if (!roadmap) return;
    setIsApplying(true);
    setSuccessMessage(null);
    try {
      await roadmapService.applyRoadmap(goalId, roadmap);
      setSuccessMessage('Roadmap successfully activated! Tasks scheduled to your daily planner.');
      setTimeout(() => {
        navigate('/daily-planner');
      }, 1200);
    } catch (err) {
      console.error('Failed to apply roadmap:', err);
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Synthesizing AI roadmap..." />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI ROADMAP ARCHITECT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Roadmap: {goal?.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {roadmap?.aiStrategySummary ||
              'Review, edit tasks, or add custom drills before activating your roadmap schedule.'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={generatePreview}
            disabled={isRegenerating}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-2xl transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <button
            onClick={handleApplyRoadmap}
            disabled={isApplying || !roadmap}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md transition active:scale-95 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isApplying ? 'Activating...' : 'Approve & Activate'}</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center space-x-2 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Summary Stats */}
      {roadmap && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Total Phases</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {roadmap.milestones?.length || 0} Milestones
            </span>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Actionable Tasks</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {roadmap.milestones?.reduce((acc: number, m: any) => acc + (m.tasks?.length || 0), 0) || 0} Tasks
            </span>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Estimated Workload</span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {roadmap.estimatedTotalWorkload || 'Calibrated to daily schedule'}
            </span>
          </div>
        </div>
      )}

      {/* Milestones Accordion List */}
      <div className="space-y-4">
        {roadmap?.milestones?.map((m: any, mIdx: number) => {
          const isExpanded = expandedMilestones[mIdx] ?? true;
          return (
            <div
              key={mIdx}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm"
            >
              {/* Milestone Header */}
              <div
                onClick={() => toggleExpand(mIdx)}
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition select-none"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {mIdx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{m.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {m.estimatedHours} hrs
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.description}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      <strong>Expected Outcome:</strong> {m.expectedOutcome}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                    Target: {m.targetDate}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Tasks List */}
              {isExpanded && (
                <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between pt-4 pb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Tasks ({m.tasks?.length || 0})
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTask(mIdx);
                      }}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Task</span>
                    </button>
                  </div>

                  <div className="space-y-2 mt-2">
                    {m.tasks?.map((t: any, tIdx: number) => (
                      <div
                        key={tIdx}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-xs gap-2 group hover:border-indigo-300 dark:hover:border-indigo-800 transition"
                      >
                        <div className="flex items-start space-x-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {tIdx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{t.title}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">
                              {t.instructions}
                            </span>
                            {t.completionCriteria && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
                                ✓ Criteria: {t.completionCriteria}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 self-end sm:self-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-slate-400">{t.estimatedMinutes}m</span>
                          <span className="text-[10px] font-semibold text-slate-500">Due: {t.dueDate}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.priority === 'HIGH'
                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {t.priority}
                          </span>

                          {/* Lesson & Video Guide Button */}
                          <button
                            onClick={() => setSelectedLessonTask(t)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px] rounded-lg border border-indigo-200 dark:border-indigo-800 transition"
                            title="View concept explanation and video tutorial"
                          >
                            <Video className="w-3 h-3" />
                            <span>Lesson & Video</span>
                          </button>

                          <button
                            onClick={() => handleDeleteTask(mIdx, tIdx)}
                            className="p-1 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition"
                            title="Remove task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Topic Lesson & Video Modal */}
      {selectedLessonTask && (
        <TopicLessonModal
          task={selectedLessonTask}
          isOpen={!!selectedLessonTask}
          onClose={() => setSelectedLessonTask(null)}
          onUpdateTask={(updatedTask) => {
            if (roadmap && roadmap.milestones) {
              const updatedRoadmap = { ...roadmap };
              for (const m of updatedRoadmap.milestones) {
                if (m.tasks) {
                  const tIdx = m.tasks.findIndex((t: any) =>
                    (t.id && updatedTask.id && t.id === updatedTask.id) || t.title === updatedTask.title
                  );
                  if (tIdx !== -1) {
                    m.tasks[tIdx] = { ...m.tasks[tIdx], ...updatedTask };
                    break;
                  }
                }
              }
              setRoadmap(updatedRoadmap);
            }
            setSelectedLessonTask(updatedTask);
          }}
        />
      )}
    </div>
  );
};
