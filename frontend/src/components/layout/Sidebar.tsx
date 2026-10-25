import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  PlusCircle,
  CalendarCheck,
  Calendar,
  BarChart3,
  Bot,
  RefreshCw,
  FileText,
  Bell,
  Settings,
  Sparkles,
  FileCheck2,
  Mic
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Main Dashboard' },
    { to: '/goals', icon: Target, label: 'My Goals' },
    { to: '/goals/new', icon: PlusCircle, label: 'Create Goal' },
    { to: '/daily-planner', icon: CalendarCheck, label: 'Daily Planner', badge: 'Active' },
    { to: '/calendar', icon: Calendar, label: 'Calendar View' },
    { to: '/analytics', icon: BarChart3, label: 'Progress Analytics' },
    { to: '/performance-analyst', icon: Bot, label: 'AI Performance Analyst', highlight: true },
    { to: '/adaptive-planning', icon: RefreshCw, label: 'Adaptive Planning' },
    { to: '/reports', icon: FileText, label: 'Weekly & Monthly Reports' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/settings', icon: Settings, label: 'Settings & Profile' },
  ];

  const careerItems = [
    { to: '/resume-analyzer', icon: FileCheck2, label: 'Resume Analyzer', highlight: true },
    { to: '/interview-simulator', icon: Mic, label: 'Interview Simulator', highlight: true },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 h-screen sticky top-0 transition-colors">
      {/* Brand Header */}
      <div className="flex items-center px-6 h-16 border-b border-slate-100 dark:border-slate-800">
        <NavLink to="/dashboard" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
              GoalMind <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </span>
            <span className="block text-[10px] font-medium text-slate-400 tracking-wider uppercase">
              Achievement Suite
            </span>
          </div>
        </NavLink>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Productivity Hub
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : item.highlight
                    ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Career Intelligence Suite
        </div>
        {careerItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-500 dark:text-indigo-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {!isActive && (
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status Banner */}
      <div className="p-4 m-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl">
        <div className="flex items-center space-x-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-4" />
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
            GoalMind AI Engine
          </span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Prediction & consistency calibration active.
        </p>
      </div>
    </aside>
  );
};
