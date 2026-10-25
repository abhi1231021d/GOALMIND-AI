import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { goalService } from '../services/api';
import { Goal } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  Target,
  Plus,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const res = await goalService.getGoals();
      setGoals(res.data);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete goal: "${title}"?`)) return;
    try {
      await goalService.deleteGoal(id);
      setGoals(goals.filter((g) => g.id !== id));
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const filteredGoals = goals.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = filterCategory === 'ALL' || g.category === filterCategory;
    const matchesStat = filterStatus === 'ALL' || g.status === filterStatus;
    return matchesSearch && matchesCat && matchesStat;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Goals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your personal and career objectives, roadmaps, and progress forecasts
          </p>
        </div>
        <Link
          to="/goals/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex space-x-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="CAREER">Career</option>
            <option value="EDUCATION">Education</option>
            <option value="HEALTH">Health</option>
            <option value="PERSONAL_FINANCE">Finance</option>
            <option value="CREATIVE">Creative</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>
      </div>

      {/* Goal Cards */}
      {isLoading ? (
        <LoadingSpinner size="md" text="Loading goals..." />
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals found"
          description={
            searchTerm || filterCategory !== 'ALL'
              ? 'No goals match your search or filter criteria.'
              : 'You have not added any goals yet. Start by defining your first goal!'
          }
          actionLabel="Create a Goal"
          onAction={() => (window.location.href = '/goals/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((g) => (
            <div
              key={g.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                    {g.category}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        g.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {g.status}
                    </span>
                    <button
                      onClick={() => handleDelete(g.id, g.title)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Link to={`/goals/${g.id}`} className="hover:underline">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 line-clamp-1">
                    {g.title}
                  </h3>
                </Link>

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
                    <span>Deadline: {g.targetDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  to={`/goals/${g.id}`}
                  className="py-2 px-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Overview
                </Link>
                <Link
                  to={`/goals/${g.id}/roadmap`}
                  className="py-2 px-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl transition"
                >
                  Roadmap
                </Link>
                <Link
                  to={`/goals/${g.id}/prediction`}
                  className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl transition"
                >
                  Forecast
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
