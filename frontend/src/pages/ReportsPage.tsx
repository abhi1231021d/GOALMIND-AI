import React, { useState, useEffect } from 'react';
import { reportService, goalService } from '../services/api';
import { ReportItem, Goal } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertOctagon,
  Award,
  Sparkles,
  Download,
  Printer,
  ChevronDown
} from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<number | undefined>(undefined);
  const [report, setReport] = useState<ReportItem | null>(null);
  const [pastReports, setPastReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    fetchCurrentReport();
    fetchPastReports();
  }, [reportType, selectedGoalId]);

  const fetchGoals = async () => {
    try {
      const res = await goalService.getGoals();
      setGoals(res.data);
    } catch (err) {
      console.error('Failed to load goals for report selector');
    }
  };

  const fetchCurrentReport = async () => {
    try {
      setLoading(true);
      setError(null);
      if (reportType === 'WEEKLY') {
        const res = await reportService.getWeeklyReport(selectedGoalId);
        setReport(res.data);
      } else {
        const res = await reportService.getMonthlyReport(selectedGoalId);
        setReport(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate review report.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPastReports = async () => {
    try {
      const res = await reportService.getReports(reportType);
      setPastReports(res.data);
    } catch (err) {
      console.error('Failed to fetch historical reports');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 print:p-0 print:m-0">
      {/* Header (hidden in print mode) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Periodic Executive Reviews
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Weekly and monthly performance synthesis comparing planned workload vs actual achievements.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Report Type Toggle */}
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setReportType('WEEKLY')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                reportType === 'WEEKLY'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Weekly Review
            </button>
            <button
              onClick={() => setReportType('MONTHLY')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                reportType === 'MONTHLY'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Monthly Review
            </button>
          </div>

          {/* Goal Filter */}
          <select
            value={selectedGoalId || ''}
            onChange={(e) => setSelectedGoalId(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Active Goals</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>

          {/* Print/Export */}
          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text={`Synthesizing ${reportType.toLowerCase()} retrospective...`} />
      ) : report ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Document Header */}
          <div className="border-b border-gray-100 dark:border-gray-700 pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                GoalMind AI Retrospective
              </span>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                {reportType === 'WEEKLY' ? 'Weekly Performance Brief' : 'Monthly Performance Audit'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                Period: {report.periodStart} to {report.periodEnd}
                {report.goalTitle && (
                  <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                    • Goal: {report.goalTitle}
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                {reportType} CADENCE
              </span>
            </div>
          </div>

          {/* 4 Pillars Metrics Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                Task Completion Rate
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {report.completionRate?.toFixed(1) || '0.0'}%
                </span>
              </div>
              <span className="text-xs text-gray-400 block mt-1">
                {report.completedTasks} / {report.totalPlannedTasks} tasks finished
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                Total Focus Time
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {Math.round((report.totalFocusedMinutes || 0) / 60)} hrs
                </span>
                <span className="text-xs text-gray-400">({report.totalFocusedMinutes || 0}m)</span>
              </div>
              <span className="text-xs text-gray-400 block mt-1">
                Logged in verified sessions
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                Daily Consistency
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {report.consistencyRate?.toFixed(1) || '0.0'}%
                </span>
              </div>
              <span className="text-xs text-gray-400 block mt-1">
                Days with meaningful progress
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                Best Performing Day
              </span>
              <div className="flex items-center gap-1.5 text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                <Award className="w-5 h-5 text-amber-500" />
                {report.bestPerformingDay || 'N/A'}
              </div>
              <span className="text-xs text-gray-400 block mt-1">
                Peak output & deep focus
              </span>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="bg-indigo-50/60 dark:bg-indigo-950/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2 mb-2 text-indigo-900 dark:text-indigo-300">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-base">Executive Retrospective Synthesis</h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {report.aiSummary}
            </p>
          </div>

          {/* Accomplishments & Obstacles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Accomplishments */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                <CheckCircle2 className="w-5 h-5" />
                <h3>Verified Accomplishments</h3>
              </div>
              {report.keyAccomplishments && report.keyAccomplishments.length > 0 ? (
                <ul className="space-y-2.5">
                  {report.keyAccomplishments.map((item, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg text-sm text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">No tasks completed during this period.</p>
              )}
            </div>

            {/* Recurring Obstacles */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
                <AlertOctagon className="w-5 h-5" />
                <h3>Recurring Obstacles & Friction</h3>
              </div>
              {report.recurringObstacles && report.recurringObstacles.length > 0 ? (
                <ul className="space-y-2.5">
                  {report.recurringObstacles.map((item, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg text-sm text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">No recurring friction patterns recorded.</p>
              )}
            </div>
          </div>

          {/* Recommendations for Next Period */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-base">
              <TrendingUp className="w-5 h-5" />
              <h3>Action Items for Upcoming Cadence</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.recommendationsForNextPeriod && report.recommendationsForNextPeriod.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    RECOMMENDATION #{idx + 1}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Report Data Available"
          description="Log daily tasks and focus sessions to generate comprehensive retrospectives."
          actionText="Open Daily Planner"
          actionLink="/planner"
          icon={<FileText className="w-12 h-12 text-gray-400" />}
        />
      )}
    </div>
  );
};

export default ReportsPage;
