import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  CreateGoalPage,
  GoalsPage,
  GoalDetailPage,
  AiRoadmapPage,
  DailyPlannerPage,
  CalendarPage,
  AnalyticsPage,
  PerformanceAnalystPage,
  GoalPredictionPage,
  AdaptivePlanningPage,
  ReportsPage,
  NotificationsPage,
  SettingsPage,
  ResumeAnalyzerPage,
  InterviewSimulatorPage,
} from './pages';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
};

export default App;
