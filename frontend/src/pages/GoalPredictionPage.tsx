import React, { useState, useEffect } from 'react';
import { goalService, predictionService } from '../services/api';
import { Goal, GoalForecast } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Play,
  Video,
  Info,
  BookOpen,
  Zap,
  ShieldCheck,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const GoalPredictionPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [forecast, setForecast] = useState<GoalForecast | null>(null);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Explanatory drawer toggles
  const [showFormulaDrawer, setShowFormulaDrawer] = useState<boolean>(false);
  const [expandedFactorIdx, setExpandedFactorIdx] = useState<number | null>(null);

  // What-If Scenario Simulator state
  const [simulatedDailyHours, setSimulatedDailyHours] = useState<number>(2);
  const [simulatedDaysPerWeek, setSimulatedDaysPerWeek] = useState<number>(5);

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
        setSimulatedDailyHours(res.data[0].dailyHours || 2);
        setSimulatedDaysPerWeek(res.data[0].daysPerWeek || 5);
        fetchForecast(res.data[0].id);
      }
    } catch (err: any) {
      setError('Failed to load goals. Ensure the backend is running.');
    } finally {
      setLoadingGoals(false);
    }
  };

  const fetchForecast = async (goalId: number) => {
    try {
      setLoadingForecast(true);
      setError(null);
      const res = await predictionService.getForecast(goalId);
      setForecast(res.data);
      const g = goals.find((item) => item.id === goalId);
      if (g) {
        setSimulatedDailyHours(g.dailyHours || 2);
        setSimulatedDaysPerWeek(g.daysPerWeek || 5);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to calculate goal forecast.');
    } finally {
      setLoadingForecast(false);
    }
  };

  const handleGoalChange = (goalId: number) => {
    setSelectedGoalId(goalId);
    fetchForecast(goalId);
  };

  if (loadingGoals) {
    return <LoadingSpinner text="Initializing prediction engine..." />;
  }

  if (goals.length === 0) {
    return (
      <EmptyState
        title="No Goals Available for Forecasting"
        description="Create a goal and establish milestone tasks to run velocity and capacity predictions."
        actionText="Create New Goal"
        actionLink="/goals/new"
        icon={<TrendingUp className="w-12 h-12 text-indigo-500" />}
      />
    );
  }

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  // Client-side simulation of What-if Scenario
  const remainingHours = forecast?.remainingHours || 0;
  const simulatedWeeklyCapacity = simulatedDailyHours * simulatedDaysPerWeek;
  const simulatedWeeksNeeded = simulatedWeeklyCapacity > 0 ? remainingHours / simulatedWeeklyCapacity : 999;
  const simulatedDaysNeeded = Math.ceil(simulatedWeeksNeeded * 7);
  const simulatedProjectedDate = new Date();
  simulatedProjectedDate.setDate(simulatedProjectedDate.getDate() + simulatedDaysNeeded);
  const targetDateObj = forecast ? new Date(forecast.targetDate) : new Date();
  const simulatedDeadlineFeasible = simulatedProjectedDate <= targetDateObj;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> On Track (Target Achievable)
          </span>
        );
      case 'NEEDS_ATTENTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-3.5 h-3.5" /> Needs Attention (Buffer Tight)
          </span>
        );
      case 'AT_RISK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">
            <ShieldAlert className="w-3.5 h-3.5" /> High Risk of Delay (Deficit Detected)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
            <HelpCircle className="w-3.5 h-3.5" /> Preliminary Baseline Model
          </span>
        );
    }
  };

  const getDetailedFactorExplanation = (factor: string, idx: number) => {
    if (factor.toLowerCase().includes('remaining workload')) {
      return {
        tag: 'Workload vs. Capacity',
        level: 'Critical',
        explanation:
          'This compares the sum of all unfinished task estimates against your total scheduled working hours between now and your deadline. A positive margin provides resilience against unexpected emergencies; a negative margin guarantees delay unless adjusted.',
        formula: 'Capacity Margin = Available Working Capacity - Remaining Task Hours',
      };
    }
    if (factor.toLowerCase().includes('required daily focus')) {
      return {
        tag: 'Pacing Requirement',
        level: 'Pacing',
        explanation:
          'The daily hours of concentrated focus required on every single scheduled working day to cross the finish line by your target date. If this number exceeds your planned daily hours, your current schedule cannot support the goal.',
        formula: 'Required Daily Focus = Remaining Workload ÷ (Remaining Calendar Days × Working Day Ratio)',
      };
    }
    if (factor.toLowerCase().includes('overdue')) {
      return {
        tag: 'Velocity Friction',
        level: 'Friction',
        explanation:
          'Overdue tasks act as a friction drag on your completion trajectory. The engine penalizes historical velocity to reflect that tasks took longer than anticipated or were deferred.',
        formula: 'Velocity Factor = Completed Tasks ÷ (Completed Tasks + Overdue Tasks)',
      };
    }
    return {
      tag: 'Schedule Metric',
      level: 'Insight',
      explanation:
        'This metric directly informs the mathematical completion date. As you complete daily tasks in focused sessions, this value recalculates in real-time.',
      formula: 'Real-time telemetry updated on every session log',
    };
  };

  const getActionDetails = (action: string) => {
    if (action.toLowerCase().includes('adaptive')) {
      return {
        tag: 'Immediate Recovery',
        cta: 'Open Adaptive Planner',
        link: '/adaptive',
        benefit: 'Redistributes overdue workload across upcoming working days and recalibrates deadline.',
      };
    }
    if (action.toLowerCase().includes('retrospective')) {
      return {
        tag: 'Milestone Closure',
        cta: 'View Reports',
        link: '/reports',
        benefit: 'Consolidates lessons learned, time utilization, and streak records for future goals.',
      };
    }
    if (action.toLowerCase().includes('habits') || action.toLowerCase().includes('protect')) {
      return {
        tag: 'Execution Habit',
        cta: 'Go to Daily Planner',
        link: '/planner',
        benefit: 'Locks in daily focus sessions to avoid schedule slippage and protect momentum.',
      };
    }
    return {
      tag: 'Strategic Action',
      cta: 'View Daily Tasks',
      link: '/planner',
      benefit: 'Aligns execution with the highest-priority milestone criteria.',
    };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Goal Completion Prediction Engine
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Transparent workload vs. capacity forecasting based on historical completion pace, remaining tasks, and velocity integrals.
          </p>
        </div>

        {/* Goal Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
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
              onClick={() => selectedGoalId && fetchForecast(selectedGoalId)}
              disabled={loadingForecast}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loadingForecast ? 'Recalculating...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loadingForecast ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Computing capacity integrals and realistic completion trajectories...
          </p>
        </div>
      ) : forecast ? (
        <div className="space-y-6">
          {/* Main Status Hero Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Forecast Assessment & Trajectory
                </span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {forecast.goalTitle}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(forecast.status)}
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Target Deadline
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {forecast.targetDate}
                </span>
                <span className="text-xs text-gray-400 block mt-1">
                  {forecast.daysRemaining} calendar days remaining
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Projected Finish
                </span>
                <span
                  className={`text-lg font-bold flex items-center gap-1.5 ${
                    forecast.deadlineFeasible
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  {forecast.projectedCompletionDate || 'Undetermined'}
                </span>
                <span className="text-xs text-gray-400 block mt-1">
                  {forecast.deadlineFeasible ? '✓ Hits or beats target' : '⚠ Delay projected'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Required Daily Focus
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {forecast.requiredDailyHours?.toFixed(1) || '0.0'} hrs/day
                </span>
                <span className="text-xs text-gray-400 block mt-1">
                  Pace required to meet deadline
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Actual Realistic Velocity
                </span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {forecast.currentRealisticDailyPace?.toFixed(1) || '0.0'} hrs/day
                </span>
                <span className="text-xs text-gray-400 block mt-1">
                  Pace adjusted for task friction
                </span>
              </div>
            </div>

            {/* Detailed Diagnosis Card with Expandable Mathematical Explanation */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Engine Diagnosis & Mathematical Interpretation</span>
                </div>
                <button
                  onClick={() => setShowFormulaDrawer(!showFormulaDrawer)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 font-semibold"
                >
                  <span>{showFormulaDrawer ? 'Hide Formula' : 'Inspect Math Formula'}</span>
                  {showFormulaDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                {forecast.detailedDiagnosis}
              </p>

              {showFormulaDrawer && (
                <div className="pt-3 border-t border-indigo-200/60 dark:border-indigo-900/60 text-xs text-gray-700 dark:text-gray-300 space-y-2.5 animate-fadeIn">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-gray-700 font-mono text-indigo-900 dark:text-indigo-300">
                    Projected Date = Today + ⌈ RemainingWorkloadHours ÷ (DailyHours × VelocityFactor × WorkingDaysRatio) ⌉
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2.5 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-indigo-50 dark:border-gray-700">
                      <strong>Remaining Workload:</strong> {forecast.remainingHours?.toFixed(1)} hours across all incomplete roadmap tasks.
                    </div>
                    <div className="p-2.5 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-indigo-50 dark:border-gray-700">
                      <strong>Available Capacity:</strong> {forecast.availableCapacityHours?.toFixed(1)} hours (excluding scheduled rest days).
                    </div>
                    <div className="p-2.5 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-indigo-50 dark:border-gray-700">
                      <strong>Capacity Margin:</strong> {((forecast.availableCapacityHours || 0) - (forecast.remainingHours || 0)).toFixed(1)} hours buffer.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Workload vs Capacity Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workload Balance & Capacity Margin Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold">Workload vs. Capacity Hours</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {Math.round(forecast.currentProgressPercentage || 0)}% Completed
                </span>
              </div>

              {/* Progress Bar Visual */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Completed: <strong>{forecast.completedHours?.toFixed(1) || 0} hrs</strong></span>
                  <span>Remaining: <strong>{forecast.remainingHours?.toFixed(1) || 0} hrs</strong></span>
                </div>
                <div className="w-full h-3.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, forecast.currentProgressPercentage || 0)}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 block">
                  Total Roadmap Workload: {forecast.totalEstimatedHours?.toFixed(1) || 0} hours
                </span>
              </div>

              {/* Balance Table */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-gray-700 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 dark:text-gray-400">Total Workload Remaining:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {forecast.remainingHours?.toFixed(1) || 0} hrs
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 dark:text-gray-400">Available Working Capacity:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {forecast.availableCapacityHours?.toFixed(1) || 0} hrs
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-600 dark:text-gray-400">Capacity Margin (Buffer):</span>
                    <span title="Positive margin protects you from slippage; negative margin indicates delay.">
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                    </span>
                  </div>
                  <span
                    className={`font-bold ${
                      (forecast.availableCapacityHours || 0) >= (forecast.remainingHours || 0)
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {((forecast.availableCapacityHours || 0) - (forecast.remainingHours || 0)).toFixed(1)} hrs
                  </span>
                </div>
              </div>

              {/* Explanatory callout */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-750 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white">Why Rest Days Matter: </span>
                Scheduled rest days are intentionally excluded from the capacity denominator. You are not penalized for resting on weekends when no tasks were planned.
              </div>
            </div>

            {/* Contributing Factors & Detailed Diagnostic Explanations */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Key Contributing Factors & Root Causes
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  The primary mathematical drivers shaping your predicted timeline. Click any factor to expand its underlying diagnosis:
                </p>

                <div className="space-y-3">
                  {forecast.mainFactors && forecast.mainFactors.map((factor, idx) => {
                    const details = getDetailedFactorExplanation(factor, idx);
                    const isExpanded = expandedFactorIdx === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition"
                      >
                        <div
                          onClick={() => setExpandedFactorIdx(isExpanded ? null : idx)}
                          className="p-3.5 bg-gray-50 dark:bg-gray-750 flex items-start justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          <div className="flex items-start space-x-2.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                            <div>
                              <div className="flex items-center space-x-2 mb-0.5">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 uppercase">
                                  {details.tag}
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                {factor}
                              </span>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          )}
                        </div>

                        {isExpanded && (
                          <div className="p-3.5 bg-white dark:bg-gray-800 text-xs space-y-2 border-t border-gray-100 dark:border-gray-700 animate-fadeIn">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                              {details.explanation}
                            </p>
                            <div className="p-2 rounded bg-slate-50 dark:bg-slate-750 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {details.formula}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {!forecast.deadlineFeasible && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Link
                    to="/adaptive"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    Generate Adaptive Recovery Plan <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Actionable Strategic Interventions with Detailed Guidance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Recommended Strategic Interventions & Action Steps
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Actionable, high-leverage steps calculated to recover lost time and preserve your target deadline.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {forecast.recommendedActions && forecast.recommendedActions.map((action, idx) => {
                const details = getActionDetails(action);
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-indigo-50/20 dark:from-gray-750 dark:to-indigo-950/20 border border-gray-200/80 dark:border-gray-700 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                          {details.tag}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          Priority #{idx + 1}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                        {action}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                        {details.benefit}
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Link
                        to={details.link}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>{details.cta}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive "What-If" Scenario Simulator with Deep Explanation */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-5 h-5" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Interactive Schedule Simulator ("What-If" Analysis)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Dynamically simulate how modifying your daily commitment or weekly frequency accelerates your trajectory without altering your saved plan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Controls */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center text-sm font-medium mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Daily Working Hours:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {simulatedDailyHours} hrs/day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="8"
                    step="0.5"
                    value={simulatedDailyHours}
                    onChange={(e) => setSimulatedDailyHours(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>30m</span>
                    <span>4 hrs</span>
                    <span>8 hrs</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm font-medium mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Working Days Per Week:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {simulatedDaysPerWeek} days/week
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    value={simulatedDaysPerWeek}
                    onChange={(e) => setSimulatedDaysPerWeek(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 day</span>
                    <span>4 days</span>
                    <span>7 days</span>
                  </div>
                </div>
              </div>

              {/* Simulation Result Output */}
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 flex flex-col justify-center space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Simulated Trajectory Outcome
                </span>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Weekly Available Capacity:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {simulatedWeeklyCapacity.toFixed(1)} hrs/week
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Estimated Calendar Time:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      ~{Math.ceil(simulatedWeeksNeeded)} weeks ({simulatedDaysNeeded} days)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Simulated Completion Date:</span>
                    <span
                      className={`font-bold text-base ${
                        simulatedDeadlineFeasible
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {simulatedProjectedDate.toISOString().split('T')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pt-1 leading-relaxed">
                    {simulatedDeadlineFeasible
                      ? '✓ At this simulated pace, you would comfortably hit your target deadline!'
                      : '⚠ At this pace, you will finish after your target deadline. Consider extending your deadline or scheduling an extra 30 minutes daily.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default GoalPredictionPage;
