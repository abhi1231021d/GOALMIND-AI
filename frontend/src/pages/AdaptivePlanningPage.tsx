import React, { useState, useEffect } from 'react';
import { goalService, aiService } from '../services/api';
import { Goal, RecoveryPlan, TaskRescheduleProposal } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  RotateCcw,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  CalendarCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdaptivePlanningPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [proposal, setProposal] = useState<RecoveryPlan | null>(null);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [loadingProposal, setLoadingProposal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // User selections for explicit confirmation
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [updateDeadline, setUpdateDeadline] = useState<boolean>(true);
  const [userConfirmed, setUserConfirmed] = useState<boolean>(false);

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
        fetchRecoveryProposal(res.data[0].id);
      }
    } catch (err: any) {
      setError('Failed to fetch goals. Please ensure backend is running.');
    } finally {
      setLoadingGoals(false);
    }
  };

  const fetchRecoveryProposal = async (goalId: number) => {
    try {
      setLoadingProposal(true);
      setError(null);
      setSuccessMessage(null);
      setUserConfirmed(false);
      const res = await aiService.getAdaptiveProposal(goalId);
      setProposal(res.data);
      // Select all proposed reschedules by default
      if (res.data.proposedTaskReschedules) {
        const ids = new Set<number>(res.data.proposedTaskReschedules.map((t: TaskRescheduleProposal) => t.taskId));
        setSelectedTaskIds(ids);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch adaptive recovery proposal.');
    } finally {
      setLoadingProposal(false);
    }
  };

  const handleGoalChange = (goalId: number) => {
    setSelectedGoalId(goalId);
    fetchRecoveryProposal(goalId);
  };

  const toggleTaskSelection = (taskId: number) => {
    const next = new Set(selectedTaskIds);
    if (next.has(taskId)) {
      next.delete(taskId);
    } else {
      next.add(taskId);
    }
    setSelectedTaskIds(next);
  };

  const toggleSelectAll = () => {
    if (!proposal?.proposedTaskReschedules) return;
    if (selectedTaskIds.size === proposal.proposedTaskReschedules.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(proposal.proposedTaskReschedules.map((t) => t.taskId)));
    }
  };

  const handleApply = async () => {
    if (!selectedGoalId || !proposal) return;

    if (!userConfirmed) {
      setError('You must explicitly confirm you wish to apply these schedule updates.');
      return;
    }

    try {
      setApplying(true);
      setError(null);

      const approvedReschedules = proposal.proposedTaskReschedules.filter((t) =>
        selectedTaskIds.has(t.taskId)
      );

      const payload = {
        goalId: selectedGoalId,
        updateDeadline: updateDeadline,
        suggestedTargetDate: updateDeadline ? proposal.suggestedTargetDate : null,
        rescheduledTasks: approvedReschedules,
      };

      await aiService.applyAdaptivePlan(selectedGoalId, payload);
      setSuccessMessage('Adaptive recovery plan applied successfully! Your schedule and dates have been updated.');
      // Refresh proposal
      fetchRecoveryProposal(selectedGoalId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to apply adaptive recovery plan.');
    } finally {
      setApplying(false);
    }
  };

  if (loadingGoals) {
    return <LoadingSpinner text="Loading adaptive recovery planner..." />;
  }

  if (goals.length === 0) {
    return (
      <EmptyState
        title="No active goals found"
        description="Create your goal and milestones first before using adaptive planning."
        actionText="Create Goal"
        actionLink="/goals/new"
        icon={<RotateCcw className="w-12 h-12 text-indigo-500" />}
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
            <span className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <RotateCcw className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Adaptive Schedule Recovery
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Detect schedule slippage, redistribute overdue workload smoothly, and get back on track with explicit approval.
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
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title} ({goal.progressPercentage || 0}%)
              </option>
            ))}
          </select>
          <button
            onClick={() => selectedGoalId && fetchRecoveryProposal(selectedGoalId)}
            disabled={loadingProposal}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loadingProposal ? 'Evaluating...' : 'Recalculate'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            {successMessage}
          </span>
          <Link
            to="/planner"
            className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 underline"
          >
            Go to Daily Planner →
          </Link>
        </div>
      )}

      {loadingProposal ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-200 dark:border-amber-900 border-t-amber-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Scanning for overdue tasks and calculating optimal redistribution timetable...
          </p>
        </div>
      ) : proposal ? (
        <div className="space-y-6">
          {/* Proposal Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Adaptive Recovery Plan
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {proposal.goalTitle}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                  Trigger: {proposal.triggerReason || 'Schedule Slippage'}
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Overdue / Unfinished Tasks
                </span>
                <span className="text-xl font-bold text-red-600 dark:text-red-400">
                  {proposal.unfinishedTasksCount || 0}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Backlog Workload
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {Math.round((proposal.remainingWorkloadMinutes || 0) / 60)} hrs
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Original Target Date
                </span>
                <span className="text-base font-bold text-gray-700 dark:text-gray-300">
                  {proposal.originalTargetDate}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <span className="text-xs text-amber-700 dark:text-amber-400 block mb-1">
                  Suggested Target Date
                </span>
                <span className="text-base font-bold text-amber-900 dark:text-amber-300">
                  {proposal.suggestedTargetDate}
                </span>
              </div>
            </div>

            {/* Rationale */}
            <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Strategic Rationale
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {proposal.rationale}
              </p>
            </div>
          </div>

          {/* Strategic Adjustments Suggestions */}
          {proposal.strategicAdjustments && proposal.strategicAdjustments.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Strategic Recommendations
                </h3>
              </div>
              <ul className="space-y-2.5">
                {proposal.strategicAdjustments.map((adj, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    <span>{adj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Proposed Task Reschedules Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Proposed Task Reschedules ({proposal.proposedTaskReschedules?.length || 0})
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select which tasks you wish to reschedule to the new calculated dates.
                </p>
              </div>

              {proposal.proposedTaskReschedules && proposal.proposedTaskReschedules.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  {selectedTaskIds.size === proposal.proposedTaskReschedules.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              )}
            </div>

            {proposal.proposedTaskReschedules && proposal.proposedTaskReschedules.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-750 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="p-3 w-10">Select</th>
                      <th className="p-3">Task</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Current Due Date</th>
                      <th className="p-3">Proposed New Date</th>
                      <th className="p-3">Est. Duration</th>
                      <th className="p-3">Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {proposal.proposedTaskReschedules.map((task) => {
                      const isSelected = selectedTaskIds.has(task.taskId);
                      return (
                        <tr
                          key={task.taskId}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors ${
                            isSelected ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                          }`}
                        >
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => toggleTaskSelection(task.taskId)}
                              className="text-indigo-600 focus:outline-none"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-indigo-600" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="p-3 font-medium text-gray-900 dark:text-white">
                            {task.taskTitle}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-semibold ${
                                task.priority === 'HIGH'
                                  ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                  : task.priority === 'MEDIUM'
                                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                                  : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </td>
                          <td className="p-3 text-red-600 dark:text-red-400 font-medium">
                            {task.currentDueDate || 'Overdue'}
                          </td>
                          <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                            {task.proposedDueDate}
                          </td>
                          <td className="p-3 text-gray-500 dark:text-gray-400">
                            {task.proposedMinutes}m
                          </td>
                          <td className="p-3 text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                            {task.justification}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No individual task reschedules required. Your active schedule is aligned with capacity.
              </div>
            )}
          </div>

          {/* Explicit User Approval Card */}
          <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <ShieldCheck className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-base">Explicit Confirmation & Approval Required</h4>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  GoalMind AI never modifies deadlines or reallocates workload without your explicit consent.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updateDeadline}
                  onChange={(e) => setUpdateDeadline(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Extend goal target completion date to <strong className="text-amber-800 dark:text-amber-300">{proposal.suggestedTargetDate}</strong>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={userConfirmed}
                  onChange={(e) => setUserConfirmed(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  I review and approve rescheduling the <strong>{selectedTaskIds.size}</strong> selected task(s) to avoid burnout.
                </span>
              </label>
            </div>

            <div className="pt-3 border-t border-amber-200 dark:border-amber-800 flex justify-end">
              <button
                type="button"
                onClick={handleApply}
                disabled={!userConfirmed || applying || (selectedTaskIds.size === 0 && !updateDeadline)}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {applying ? 'Applying Changes...' : 'Apply Recovery Plan'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdaptivePlanningPage;
