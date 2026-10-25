import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  CalendarCheck,
  RefreshCw,
  Flame,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const cycleSteps = [
    { title: 'Set Goal', desc: 'Define target date & daily available hours' },
    { title: 'Analyse Goal', desc: 'Verify realistic workload vs capacity' },
    { title: 'Generate Roadmap', desc: 'Break into structured milestones & tasks' },
    { title: 'Daily Tasks', desc: 'Focus timer sessions & daily reflection' },
    { title: 'Track Progress', desc: 'Record actual minutes vs planned effort' },
    { title: 'Consistency Engine', desc: 'Analyze streaks & meaningful progress days' },
    { title: 'Predict Completion', desc: 'Transparent workload capacity forecasting' },
    { title: 'AI Analyst', desc: 'Personalized SW-OT reviews & recommendations' },
    { title: 'Adaptive Planning', desc: 'Propose recovery schedules when behind' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Target className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            GoalMind <span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl shadow-md hover:shadow-indigo-500/20 transition active:scale-95"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition px-3 py-2"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl shadow-md hover:shadow-indigo-500/20 transition active:scale-95"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-8">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Close the gap between what you plan and what you actually do</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6">
          Turn Ambitious Goals Into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
            Predictable Daily Action
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
          GoalMind AI combines automated roadmap generation, focus session timers, mathematical consistency tracking,
          and transparent completion forecasting to ensure you stay on track until milestone completion.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-16">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition active:scale-95"
          >
            <span>Start Planning Today</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-base font-semibold rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition"
          >
            <span>Existing User Login</span>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-5">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">AI Roadmap Breakdown</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Transform high-level ambitions into milestone phases, weekly plans, and actionable daily tasks calibrated to your daily hours.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Completion Forecasting</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Transparent algorithms calculate remaining workload against realistic capacity to forecast whether you will finish before target dates.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-5">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Adaptive Recovery</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              When sessions are missed, the adaptive engine proposes intelligent reschedule adjustments with user approval — never silently mutating deadlines.
            </p>
          </div>
        </div>
      </section>

      {/* The GoalMind Cycle */}
      <section className="bg-slate-100/70 dark:bg-slate-900/40 py-20 border-y border-slate-200/60 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              The Continuous Achievement Loop
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              How GoalMind AI keeps you systematically aligned throughout your journey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cycleSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start space-x-3.5"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{step.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
        <p>© 2026 GoalMind AI. Full-stack personal goal achievement assistant.</p>
        <p>Java 21 LTS · Spring Boot 3 · MySQL 8.0 · React TypeScript</p>
      </footer>
    </div>
  );
};
