import React, { useState, useEffect } from 'react';
import { goalService, aiService } from '../services/api';
import { Goal, AiPerformanceReport } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  Calendar,
  Zap,
  ShieldAlert,
  ArrowRight,
  Info,
  Clock,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PerformanceAnalystPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [report, setReport] = useState<AiPerformanceReport | null>(null);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoadingGoals(true);
      const res = await goalService.getGoals();
      setGoals(res.data);
      if (res.data.length > 0) {
        setSelectedGoalId(res.data[0].id);
        runAnalysis(res.data[0].id);
      }
    } catch (err: any) {
      setError('Failed to load goals. Please ensure the backend server is reachable.');
    } finally {
      setLoadingGoals(false);
    }
  };

  const runAnalysis = async (goalId: number) => {
    try {
      setAnalyzing(true);
      setError(null);
      const res = await aiService.analyzePerformance(goalId);
      setReport(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate performance analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGoalChange = (goalId: number) => {
    setSelectedGoalId(goalId);
    runAnalysis(goalId);
  };

  if (loadingGoals) {
    return <LoadingSpinner text="Loading performance review engine..." />;
  }

  if (goals.length === 0) {
    return (
      <EmptyState
        title="No active goals to analyse"
        description="Set up your first goal with an active roadmap before running the AI Performance Analyst."
        actionText="Create Goal"
        actionLink="/goals/new"
        icon={<Sparkles className="w-12 h-12 text-indigo-500" />}
      />
    );
  }

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Performance Analyst
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Deep automated diagnostics on consistency, execution patterns, velocity bottlenecks, and next steps.
          </p>
        </div>

        {/* Goal Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Selected Goal:
          </label>
          <select
            value={selectedGoalId || ''}
            onChange={(e) => handleGoalChange(Number(e.target.value))}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title} ({goal.progressPercentage || 0}%)
              </option>
            ))}
          </select>
          <button
            onClick={() => selectedGoalId && runAnalysis(selectedGoalId)}
            disabled={analyzing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Analysing...' : 'Re-Analyse'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {analyzing ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Evaluating historical sessions, completion logs, and consistency velocity...
          </p>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Data Sufficiency Alert */}
          {!report.sufficientDataAvailable && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Preliminary Analysis (Limited Historical Data)
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                  You have logged under 3 days of task completions. Insights below reflect your current plan structure, target pace, and initial sessions. Confidence will increase automatically as daily tracking accumulates.
                </p>
              </div>
            </div>
          )}

          {/* Goal Overview Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Diagnosis Summary
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                  {report.goalTitle}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Confidence:</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {report.confidenceLevel || 'MODERATE'}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Executive Synthesis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                {report.overallProgress}
              </p>
            </div>

            {report.consistencyChanges && (
              <div className="mt-4 flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">Consistency Trend: </span>
                  {report.consistencyChanges}
                </div>
              </div>
            )}
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Positive Improvements / Strengths */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Demonstrated Strengths & Momentum
                </h3>
              </div>
              {report.positiveImprovements && report.positiveImprovements.length > 0 ? (
                <ul className="space-y-3">
                  {report.positiveImprovements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">No positive patterns recorded yet.</p>
              )}
            </div>

            {/* Weak Areas & Friction */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Execution Friction & Weak Areas
                </h3>
              </div>
              {report.weakAreas && report.weakAreas.length > 0 ? (
                <ul className="space-y-3">
                  {report.weakAreas.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">No significant friction detected.</p>
              )}
            </div>
          </div>

          {/* Obstacles & Workload Concerns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Potential Obstacles & Procrastination Triggers
                </h3>
              </div>
              {report.potentialObstacles && report.potentialObstacles.length > 0 ? (
                <ul className="space-y-3">
                  {report.potentialObstacles.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">No recurring blockers logged.</p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
                <Clock className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Workload & Capacity Balance
                </h3>
              </div>
              {report.workloadConcerns && report.workloadConcerns.length > 0 ? (
                <ul className="space-y-3">
                  {report.workloadConcerns.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">Workload is balanced with scheduled capacity.</p>
              )}
            </div>
          </div>

          {/* 3 High-Impact Recommended Actions */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-indigo-950/30 rounded-xl p-6 border border-indigo-200 dark:border-indigo-900 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-indigo-700 dark:text-indigo-300">
              <Zap className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-bold">
                Top 3 Recommended Strategic Actions
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.recommendedActions && report.recommendedActions.slice(0, 3).map((action, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-750 p-4 rounded-lg border border-indigo-100 dark:border-gray-700 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority Strategy
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                    {action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Priorities: Tomorrow & Next Week */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tomorrow's Priorities */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold">Suggested Tomorrow Priorities</h3>
              </div>
              <ul className="space-y-3">
                {report.suggestedTomorrowPriorities && report.suggestedTomorrowPriorities.map((task, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <Link
                  to="/planner"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Open Daily Planner <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Next Week's Priorities */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold">Next Week's Milestone Focus</h3>
              </div>
              <ul className="space-y-3">
                {report.suggestedNextWeekPriorities && report.suggestedNextWeekPriorities.map((item, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 flex items-start gap-2.5"
                  >
                    <Compass className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <Link
                  to="/adaptive"
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  Inspect Adaptive Plan <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PerformanceAnalystPage;
