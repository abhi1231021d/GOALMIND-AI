import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';

// Lazy-loaded routes for optimal initial bundle performance
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CreateGoalPage = React.lazy(() => import('./pages/CreateGoalPage').then(m => ({ default: m.CreateGoalPage })));
const GoalsPage = React.lazy(() => import('./pages/GoalsPage').then(m => ({ default: m.GoalsPage })));
const GoalDetailPage = React.lazy(() => import('./pages/GoalDetailPage').then(m => ({ default: m.GoalDetailPage })));
const AiRoadmapPage = React.lazy(() => import('./pages/AiRoadmapPage').then(m => ({ default: m.AiRoadmapPage })));
const DailyPlannerPage = React.lazy(() => import('./pages/DailyPlannerPage').then(m => ({ default: m.DailyPlannerPage })));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage').then(m => ({ default: m.CalendarPage })));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));

// Default exports
const PerformanceAnalystPage = React.lazy(() => import('./pages/PerformanceAnalystPage'));
const GoalPredictionPage = React.lazy(() => import('./pages/GoalPredictionPage'));
const AdaptivePlanningPage = React.lazy(() => import('./pages/AdaptivePlanningPage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

// Heavy Career Intelligence Suite Modules
const ResumeAnalyzerPage = React.lazy(() => import('./pages/ResumeAnalyzerPage').then(m => ({ default: m.ResumeAnalyzerPage })));
const InterviewSimulatorPage = React.lazy(() => import('./pages/InterviewSimulatorPage').then(m => ({ default: m.InterviewSimulatorPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    <p className="text-sm font-medium text-slate-500 animate-pulse">Loading Career Intelligence Suite...</p>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Dashboard App Shell */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/goals/new" element={<CreateGoalPage />} />
            <Route path="/create-goal" element={<CreateGoalPage />} />
            <Route path="/goals/:id" element={<GoalDetailPage />} />
            <Route path="/goals/:id/roadmap" element={<AiRoadmapPage />} />

            {/* Daily Planner & Execution */}
            <Route path="/daily-planner" element={<DailyPlannerPage />} />
            <Route path="/planner" element={<DailyPlannerPage />} />
            <Route path="/calendar" element={<CalendarPage />} />

            {/* Analytics, Forecasting & AI Intelligence */}
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/performance-analyst" element={<PerformanceAnalystPage />} />
            <Route path="/predictions" element={<GoalPredictionPage />} />
            <Route path="/predictions/:id" element={<GoalPredictionPage />} />
            <Route path="/prediction" element={<GoalPredictionPage />} />

            {/* Adaptive Rescheduling & Reporting */}
            <Route path="/adaptive-planning" element={<AdaptivePlanningPage />} />
            <Route path="/adaptive" element={<AdaptivePlanningPage />} />
            <Route path="/reports" element={<ReportsPage />} />

            {/* User Settings & System Notifications */}
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Career Intelligence Suite */}
            <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
            <Route path="/resume" element={<ResumeAnalyzerPage />} />
            <Route path="/interview-simulator" element={<InterviewSimulatorPage />} />
            <Route path="/interview" element={<InterviewSimulatorPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
