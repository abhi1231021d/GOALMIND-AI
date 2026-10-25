import React, { useState, useEffect } from 'react';
import { taskService } from '../services/api';
import { Task } from '../types';
import { FocusTimerModal } from '../components/planner/FocusTimerModal';
import { DailyReflectionModal } from '../components/planner/DailyReflectionModal';
import { TopicLessonModal } from '../components/topic/TopicLessonModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  CalendarCheck,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  AlertTriangle,
  Video
} from 'lucide-react';

export const DailyPlannerPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [activeTimerTask, setActiveTimerTask] = useState<Task | null>(null);
  const [activeLessonTask, setActiveLessonTask] = useState<Task | null>(null);
  const [isReflectionOpen, setIsReflectionOpen] = useState<boolean>(false);

  useEffect(() => {
    loadDayTasks(currentDate);
  }, [currentDate]);

  const loadDayTasks = async (dateStr: string) => {
    setIsLoading(true);
    try {
      const res = await taskService.getTodayTasks(dateStr);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks for date:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTaskComplete = async (task: Task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await taskService.updateTaskStatus(task.id, {
        status: nextStatus,
      });
      loadDayTasks(currentDate);
    } catch (err) {
      console.error('Failed to toggle task status:', err);
    }
  };

  const shiftDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  // Aggregated Day Metrics
  const totalPlannedMins = tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
  const totalActualMins = tasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const overdueTasks = tasks.filter((t) => t.status === 'OVERDUE' || (t.dueDate < currentDate && t.status !== 'COMPLETED'));
  const remainingTasks = tasks.filter((t) => t.status !== 'COMPLETED');

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Header and Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>DAILY EXECUTION PLANNER</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {new Date(currentDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Day Navigator */}
          <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => shiftDate(-1)}
              className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-1 text-xs font-semibold rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              Today
            </button>
            <button
              onClick={() => shiftDate(1)}
              className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Daily Reflection Trigger */}
          <button
            onClick={() => setIsReflectionOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-2xl shadow-md transition active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Daily Reflection</span>
          </button>
        </div>
      </div>

      {/* Daily Focus Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Tasks Completed</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {completedCount} / {tasks.length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">{progressPct}% completion</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Planned Time</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {Math.floor(totalPlannedMins / 60)}h {totalPlannedMins % 60}m
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">Estimated effort</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Actual Focused Time</span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {Math.floor(totalActualMins / 60)}h {totalActualMins % 60}m
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">Logged in sessions</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Remaining Tasks</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {remainingTasks.length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
            {overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : 'On track'}
          </span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Planned Tasks for {currentDate}</h2>
        </div>

        {isLoading ? (
          <LoadingSpinner size="md" text="Loading daily schedule..." />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No tasks scheduled for this day"
            description="You don't have any tasks scheduled for this date. Check your roadmap or select another day."
            actionLabel="View Roadmaps"
            onAction={() => (window.location.href = '/goals')}
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                  task.status === 'COMPLETED'
                    ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-900/40'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/70 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => handleToggleTaskComplete(task)}
                    className="mt-0.5 flex-shrink-0 text-slate-300 dark:text-slate-600 hover:text-emerald-500 transition"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        task.status === 'COMPLETED' ? 'text-emerald-500 fill-emerald-50' : ''
                      }`}
                    />
                  </button>
                  <div>
                    <span
                      className={`text-sm font-bold block ${
                        task.status === 'COMPLETED'
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                      {task.instructions}
                    </span>
                    {task.milestoneTitle && (
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1 block">
                        Milestone: {task.milestoneTitle}
                      </span>
                    )}
                    {task.blockerNotes && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Blocker: {task.blockerNotes}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center flex-shrink-0">
                  <div className="text-right text-xs">
                    <span className="block font-semibold text-slate-700 dark:text-slate-300">
                      {task.actualMinutes}m / {task.estimatedMinutes}m
                    </span>
                    <span className="text-[10px] text-slate-400">Actual vs Est</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.priority === 'HIGH'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {task.priority}
                  </span>

                  {/* Topic Lesson & Video Button */}
                  <button
                    onClick={() => setActiveLessonTask(task)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition"
                    title="View topic explanation & video lesson"
                  >
                    <Video className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Lesson</span>
                  </button>

                  {/* Start Focus Timer Button */}
                  <button
                    onClick={() => setActiveTimerTask(task)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
                    title="Start focus timer session"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Focus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topic Lesson & Video Modal */}
      {activeLessonTask && (
        <TopicLessonModal
          task={activeLessonTask}
          isOpen={!!activeLessonTask}
          onClose={() => setActiveLessonTask(null)}
          onStartTimer={(t) => {
            setActiveLessonTask(null);
            setActiveTimerTask(t);
          }}
          onMarkComplete={(t) => {
            handleToggleTaskComplete(t);
          }}
          onUpdateTask={(updatedTask) => {
            setTasks((prev) =>
              prev.map((t) =>
                (t.id && updatedTask.id && t.id === updatedTask.id) || t.title === updatedTask.title
                  ? { ...t, ...updatedTask }
                  : t
              )
            );
            setActiveLessonTask(updatedTask);
          }}
        />
      )}

      {/* Focus Timer Modal */}
      {activeTimerTask && (
        <FocusTimerModal
          task={activeTimerTask}
          isOpen={!!activeTimerTask}
          onClose={() => setActiveTimerTask(null)}
          onTaskUpdated={() => loadDayTasks(currentDate)}
        />
      )}

      {/* Daily Reflection Modal */}
      <DailyReflectionModal
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
        initialDate={currentDate}
      />
    </div>
  );
};
