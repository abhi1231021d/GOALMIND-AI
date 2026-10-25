import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService, goalService } from '../services/api';
import { DashboardAnalytics, Goal } from '../types';
import { StatCard } from '../components/common/StatCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Target,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  CalendarCheck,
  Bot,
  RefreshCw,
  Award
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, goalsRes] = await Promise.all([
        analyticsService.getDashboard(),
        goalService.getGoals(),
      ]);
      setData(analyticsRes.data);
      setGoals(goalsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return <LoadingSpinner size="lg" text="Analyzing real performance metrics..." />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 sm:p-8 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl text-white shadow-xl shadow-indigo-600/15">
        <div className="max-w-xl mb-4 md:mb-0">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Goal Intelligence Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard & Execution Hub
          </h1>
          <p className="text-sm text-indigo-100/90 mt-1.5 leading-relaxed">
            Continuously tracking the gap between what you planned and what you executed.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/daily-planner"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold rounded-2xl shadow-md transition active:scale-95"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Daily Planner</span>
          </Link>
          <Link
            to="/goals/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-500/40 hover:bg-indigo-500/60 text-white border border-white/20 text-xs font-bold rounded-2xl backdrop-blur-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (4 Distinct Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Consistency Rate"
          value={`${data.consistencyRate}%`}
          subtitle="Meaningful days vs planned working days"
          icon={Flame}
          color="indigo"
          trend={{ value: data.consistencyRate, isPositive: data.consistencyRate >= 70, label: '30-day rate' }}
        />
        <StatCard
          title="Task Completion Rate"
          value={`${data.taskCompletionRate}%`}
          subtitle={`${data.completedTasks} completed of ${data.totalTasks} total tasks`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Time Utilization"
          value={`${data.timeUtilizationRate}%`}
          subtitle={`${Math.round(data.totalActualMinutes / 60)}h actual vs ${Math.round(data.totalPlannedMinutes / 60)}h planned`}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Active Streak"
          value={`${data.currentStreakDays} Days`}
          subtitle={`Best streak: ${data.longestStreakDays} consecutive days`}
          icon={Award}
          color="amber"
        />
      </div>

      {/* Focus & Quick AI Assistant Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Focus Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Focus</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {data.todayPlannedTasks} Tasks Scheduled
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {data.todayCompletedTasks} of {data.todayPlannedTasks} Tasks Completed Today
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {data.todayFocusMinutes} minutes of focused deep work logged today.
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden mb-6">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${data.todayPlannedTasks > 0 ? (data.todayCompletedTasks / data.todayPlannedTasks) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <Link
            to="/daily-planner"
            className="inline-flex items-center justify-center space-x-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow transition"
          >
            <span>Open Daily Focus Timer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* AI Performance Analyst Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-3">
              <Bot className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Performance Review</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              SW-OT & Real Data Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              GoalMind continuously evaluates your velocity, overdue bottlenecks, and work duration patterns to generate custom recovery priorities.
            </p>
          </div>

          <Link
            to="/performance-analyst"
            className="inline-flex items-center justify-center space-x-2 w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl transition"
          >
            <span>View Performance Diagnosis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Adaptive Scheduling Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 mb-3">
              <RefreshCw className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Adaptive Pacing</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {data.overdueTasks > 0 ? `${data.overdueTasks} Overdue Tasks Detected` : 'Schedule Adherence Normal'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {data.overdueTasks > 0
                ? 'Your workload has experienced minor schedule slippage. Generate an adaptive recovery proposal to rebalance your daily tasks.'
                : 'Current daily execution matches target completion pace. No urgent schedule re-balancing required.'}
            </p>
          </div>

          <Link
            to="/adaptive-planning"
            className="inline-flex items-center justify-center space-x-2 w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl transition"
          >
            <span>Review Adaptive Plan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Active Goals Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Goals</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track progress, view roadmaps, and forecast completion dates
            </p>
          </div>
          <Link
            to="/goals"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>View all ({goals.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {goals.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No goals created yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              Create your first personal or career goal to start generating AI roadmaps and daily schedules.
            </p>
            <Link
              to="/goals/new"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create My First Goal</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((g) => (
              <div
                key={g.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      {g.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Target: {g.targetDate}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                    {g.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                    {g.description || g.targetOutcome || 'No description provided.'}
                  </p>

                  {/* Progress Stats */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{g.progressPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${g.progressPercentage || 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                      <span>{g.completedTasks || 0} / {g.totalTasks || 0} Tasks</span>
                      <span>{g.completedMilestones || 0} / {g.totalMilestones || 0} Milestones</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to={`/goals/${g.id}/roadmap`}
                    className="inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Roadmap</span>
                  </Link>
                  <Link
                    to={`/goals/${g.id}/prediction`}
                    className="inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Forecast</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
