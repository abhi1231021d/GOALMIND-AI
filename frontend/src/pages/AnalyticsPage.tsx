import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import { ConsistencyAnalytics, ProgressAnalytics, TimeUsageAnalytics } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatCard } from '../components/common/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Flame,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<string>('LAST_30_DAYS');
  const [consistency, setConsistency] = useState<ConsistencyAnalytics | null>(null);
  const [progress, setProgress] = useState<ProgressAnalytics | null>(null);
  const [timeUsage, setTimeUsage] = useState<TimeUsageAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [cRes, pRes, tRes] = await Promise.all([
        analyticsService.getConsistency({ period }),
        analyticsService.getProgress(),
        analyticsService.getTimeUsage(),
      ]);
      setConsistency(cRes.data);
      setProgress(pRes.data);
      setTimeUsage(tRes.data);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !consistency) {
    return <LoadingSpinner size="lg" text="Crunching consistency formulas and performance metrics..." />;
  }

  // Prepare chart data
  const chartDailyData = consistency.dailyActivity.map((d) => ({
    name: d.date.slice(5), // MM-DD
    day: d.dayOfWeek,
    minutes: d.focusedMinutes,
    tasksDone: d.tasksCompleted,
    isMeaningful: d.isMeaningful,
  }));

  const pieColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];
  const categoryData = progress?.categoryBreakdowns.map((c) => ({
    name: c.category,
    value: c.goalCount,
  })) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>METRICS & CONSISTENCY ENGINE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Progress & Consistency Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Clearly distinguishing Task Completion, Time Utilization, Goal Progress, and Daily Consistency.
          </p>
        </div>

        {/* Date Filters */}
        <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          {['LAST_7_DAYS', 'LAST_30_DAYS', 'THIS_MONTH'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl transition ${
                period === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p === 'LAST_7_DAYS' ? '7 Days' : p === 'LAST_30_DAYS' ? '30 Days' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Distinct Performance Rate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Consistency Rate"
          value={`${consistency.consistencyRate}%`}
          subtitle={`${consistency.meaningfulProgressDays} of ${consistency.plannedWorkingDays} planned days`}
          icon={Flame}
          color="indigo"
        />
        <StatCard
          title="Task Completion"
          value={`${consistency.taskCompletionRate}%`}
          subtitle="Tasks completed vs due in period"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Time Utilization"
          value={`${consistency.timeUtilizationRate}%`}
          subtitle="Actual focus vs planned duration"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Current Streak"
          value={`${consistency.currentStreakDays} Days`}
          subtitle={`Best: ${consistency.longestStreakDays} days streak`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Written Analysis Diagnosis */}
      <div className="p-6 bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm flex items-start space-x-4">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/25">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Engine Analysis & Consistency Diagnosis
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {consistency.writtenExplanation}
          </p>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Focused Minutes Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Daily Focused Minutes</h3>
              <p className="text-xs text-slate-400">Minutes recorded via focus timer sessions</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              Avg: {consistency.averageDailyFocusedMinutes}m / active day
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${val} mins`, 'Focused Time']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                />
                <Bar dataKey="minutes" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goal Category Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Goals by Category</h3>
            <p className="text-xs text-slate-400 mb-4">Distribution across personal domains</p>

            <div className="h-52 w-full flex items-center justify-center">
              {categoryData.length === 0 ? (
                <p className="text-xs text-slate-400">No active goals</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-500">
            {categoryData.map((c, i) => (
              <span key={i} className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                <span>{c.name} ({c.value})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Heatmap Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Activity Heatmap</h3>
            <p className="text-xs text-slate-400">
              Green denotes meaningful progress days (≥30m focus or priority task completed)
            </p>
          </div>
          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-semibold">
            <span>Rest / Inactive</span>
            <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            <span className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900/60" />
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span>High Focus</span>
          </div>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-2">
          {consistency.dailyActivity.map((point, index) => {
            let bgClass = 'bg-slate-100 dark:bg-slate-800/80 text-slate-400';
            if (point.focusedMinutes >= 60) {
              bgClass = 'bg-emerald-600 text-white font-bold shadow-sm';
            } else if (point.isMeaningful) {
              bgClass = 'bg-emerald-400 text-slate-950 font-bold';
            } else if (point.focusedMinutes > 0) {
              bgClass = 'bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200';
            }

            return (
              <div
                key={index}
                className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition cursor-pointer hover:ring-2 hover:ring-indigo-500/50 ${bgClass}`}
                title={`${point.date} (${point.dayOfWeek}): ${point.focusedMinutes}m focused, ${point.tasksCompleted} tasks completed`}
              >
                <span className="text-[9px] opacity-80">{point.dayOfWeek}</span>
                <span className="text-xs font-bold">{point.date.slice(8)}</span>
                <span className="text-[9px] mt-0.5">{point.focusedMinutes}m</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
