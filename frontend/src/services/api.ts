import axios from 'axios';
import {
  AuthResponse,
  Goal,
  FeasibilityCheckResponse,
  Milestone,
  Task,
  TaskSession,
  DailyReflection,
  DashboardAnalytics,
  ConsistencyAnalytics,
  ProgressAnalytics,
  TimeUsageAnalytics,
  GoalForecast,
  AiPerformanceReport,
  RecoveryPlan,
  ReportItem,
  NotificationItem,
  User,
  UserPreference
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('goalmind_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for handling session expirations & graceful offline/cloud fallback
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isOfflineOrCloud500 =
      !error.response ||
      error.response.status >= 500 ||
      error.code === 'ERR_NETWORK' ||
      String(error.message || '').includes('Network Error');

    const token = localStorage.getItem('goalmind_token');
    const isDemoSession = token && token.startsWith('demo-token-');

    if (isOfflineOrCloud500 && isDemoSession) {
      const url = error.config?.url || '';

      // Determine current user storage key for complete multi-tenant isolation
      const cachedUserStr = localStorage.getItem('goalmind_user');
      let currentUsername = 'guest';
      try {
        if (cachedUserStr) {
          const u = JSON.parse(cachedUserStr);
          if (u.username) currentUsername = String(u.username).trim().toLowerCase();
        }
      } catch (_) {}

      const userGoalsKey = `goalmind_local_goals_${currentUsername}`;
      const getUserGoals = (): any[] => {
        try {
          const raw = localStorage.getItem(userGoalsKey);
          return raw ? JSON.parse(raw) : [];
        } catch (_) {
          return [];
        }
      };

      // Mock dashboard analytics - strictly computed from this specific user's goals
      if (url.includes('/analytics/dashboard')) {
        const goals = getUserGoals();
        const totalGoals = goals.length;
        const activeGoals = goals.filter((g: any) => g.status === 'ACTIVE' || !g.status).length;
        const completedGoals = goals.filter((g: any) => g.status === 'COMPLETED').length;

        const allTasks: any[] = [];
        goals.forEach((g: any) => {
          if (Array.isArray(g.tasks)) allTasks.push(...g.tasks);
          if (Array.isArray(g.milestones)) {
            g.milestones.forEach((m: any) => {
              if (Array.isArray(m.tasks)) allTasks.push(...m.tasks);
            });
          }
        });

        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter((t: any) => t.status === 'COMPLETED').length;
        const inProgressTasks = allTasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
        const pendingTasks = totalTasks - completedTasks - inProgressTasks;
        const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;
        const goalProgressRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 1000) / 10 : 0;
        const consistencyRate = totalGoals > 0 ? (completedTasks > 0 ? 85.0 : 50.0) : 0;
        const currentStreakDays = completedTasks > 0 ? 1 : 0;

        return Promise.resolve({
          data: {
            totalGoals,
            activeGoals,
            completedGoals,
            totalTasks,
            completedTasks,
            inProgressTasks: Math.max(0, inProgressTasks),
            pendingTasks: Math.max(0, pendingTasks),
            overdueTasks: 0,
            totalPlannedMinutes: allTasks.reduce((sum: number, t: any) => sum + (t.estimatedMinutes || 60), 0),
            totalActualMinutes: allTasks.reduce((sum: number, t: any) => sum + (t.actualMinutes || 0), 0),
            taskCompletionRate,
            timeUtilizationRate: totalTasks > 0 ? 70.0 : 0,
            goalProgressRate,
            consistencyRate,
            currentStreakDays,
            longestStreakDays: currentStreakDays,
            todayPlannedTasks: Math.min(3, totalTasks),
            todayCompletedTasks: Math.min(completedTasks, 3),
            todayFocusMinutes: completedTasks * 45,
            upcomingTasks: allTasks.filter((t: any) => t.status !== 'COMPLETED').slice(0, 5),
            activeGoalsSummary: goals.filter((g: any) => g.status !== 'COMPLETED').slice(0, 4)
          } as DashboardAnalytics
        });
      }

      // Mock single goal by ID
      const singleGoalMatch = url.match(/\/goals\/(\d+)$/);
      if (singleGoalMatch && error.config?.method === 'get') {
        const goalId = parseInt(singleGoalMatch[1], 10);
        const goals = getUserGoals();
        const found = goals.find((g: any) => g.id === goalId);
        if (found) return Promise.resolve({ data: found });
      }

      // Mock delete goal
      if (error.config?.method === 'delete' && singleGoalMatch) {
        const goalId = parseInt(singleGoalMatch[1], 10);
        const goals = getUserGoals().filter((g: any) => g.id !== goalId);
        localStorage.setItem(userGoalsKey, JSON.stringify(goals));
        return Promise.resolve({ data: { message: 'Goal deleted successfully' } });
      }

      // Mock goals list - strictly for this specific user
      if (url === '/goals' || url.endsWith('/goals')) {
        const goals = getUserGoals();
        return Promise.resolve({ data: goals });
      }

      // Mock feasibility check
      if (url.includes('/goals/feasibility')) {
        return Promise.resolve({
          data: {
            status: 'FEASIBLE',
            estimatedWorkloadHours: 120,
            availableWorkingHours: 160,
            capacityUtilizationRatio: 0.75,
            summaryMessage: 'Goal schedule is realistic and achievable with a healthy buffer margin.',
            constraints: ['Target: 2 hrs/day, 6 days/week'],
            potentialRisks: ['Maintain regular schedule tracking'],
            suggestedAdjustments: ['Great plan dimensioning!']
          } as FeasibilityCheckResponse
        });
      }

      // Mock create goal - saves strictly into this user's storage
      if (error.config?.method === 'post' && (url === '/goals' || url.endsWith('/goals'))) {
        const body = JSON.parse(error.config.data || '{}');
        const newGoal = {
          id: Date.now(),
          ...body,
          status: 'ACTIVE',
          progress: 0,
          progressPercentage: 0,
          totalTasks: 0,
          completedTasks: 0,
          totalMilestones: 0,
          completedMilestones: 0,
          milestones: []
        };
        const goals = getUserGoals();
        goals.unshift(newGoal);
        localStorage.setItem(userGoalsKey, JSON.stringify(goals));
        return Promise.resolve({ data: newGoal });
      }

      // Safe defaults
      if (url.includes('/notifications')) return Promise.resolve({ data: [] });
      if (url.includes('/reflections')) return Promise.resolve({ data: [] });
      if (url.includes('/tasks')) return Promise.resolve({ data: [] });
    }

    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('goalmind_token');
        localStorage.removeItem('goalmind_user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data: { username: string; password: string; timezone?: string; fullName?: string; email?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  getCurrentUser: () => api.get<User>('/auth/me'),
  logout: () => {
    localStorage.removeItem('goalmind_token');
    localStorage.removeItem('goalmind_user');
    return api.post('/auth/logout');
  },
};

export const goalService = {
  getGoals: () => api.get<Goal[]>('/goals'),
  getGoalById: (id: number) => api.get<Goal>(`/goals/${id}`),
  createGoal: (data: any) => api.post<Goal>('/goals', data),
  updateGoal: (id: number, data: any) => api.put<Goal>(`/goals/${id}`, data),
  deleteGoal: (id: number) => api.delete(`/goals/${id}`),
  checkFeasibility: (data: any) => api.post<FeasibilityCheckResponse>('/goals/feasibility', data),
};

export const roadmapService = {
  generatePreview: (goalId: number) => api.post<any>(`/goals/${goalId}/roadmap/generate`),
  applyRoadmap: (goalId: number, data: any) => api.post<any>(`/goals/${goalId}/roadmap/apply`, data),
  getRoadmap: (goalId: number) => api.get<any>(`/goals/${goalId}/roadmap`),
};

export const milestoneService = {
  getMilestones: (goalId: number) => api.get<Milestone[]>(`/goals/${goalId}/milestones`),
  createMilestone: (goalId: number, data: any) => api.post<Milestone>(`/goals/${goalId}/milestones`, data),
  updateStatus: (milestoneId: number, status: string) => api.patch<Milestone>(`/milestones/${milestoneId}`, { status }),
  deleteMilestone: (milestoneId: number) => api.delete(`/milestones/${milestoneId}`),
};

export const taskService = {
  getTodayTasks: (date?: string) => api.get<Task[]>('/tasks/today', { params: { date } }),
  getTasks: (params?: { goalId?: number; status?: string; fromDate?: string; toDate?: string }) =>
    api.get<Task[]>('/tasks', { params }),
  getTaskById: (id: number) => api.get<Task>(`/tasks/${id}`),
  createTask: (data: any) => api.post<Task>('/tasks', data),
  updateTask: (id: number, data: any) => api.put<Task>(`/tasks/${id}`, data),
  updateTaskStatus: (id: number, data: any) => api.patch<Task>(`/tasks/${id}/status`, data),
  deleteTask: (id: number) => api.delete(`/tasks/${id}`),
};

export const taskSessionService = {
  startSession: (taskId: number, notes?: string) =>
    api.post<TaskSession>(`/tasks/${taskId}/sessions/start`, { notes }),
  pauseSession: (taskId: number, sessionId: number) =>
    api.post<TaskSession>(`/tasks/${taskId}/sessions/${sessionId}/pause`),
  resumeSession: (taskId: number, sessionId: number) =>
    api.post<TaskSession>(`/tasks/${taskId}/sessions/${sessionId}/resume`),
  finishSession: (taskId: number, sessionId: number, data: { durationSeconds: number; notes?: string; markTaskComplete?: boolean; markTaskPartiallyComplete?: boolean; blockerNotes?: string }) =>
    api.post<TaskSession>(`/tasks/${taskId}/sessions/${sessionId}/finish`, data),
  getSessions: (taskId: number) => api.get<TaskSession[]>(`/tasks/${taskId}/sessions`),
};

export const reflectionService = {
  saveReflection: (data: DailyReflection) => api.post<DailyReflection>('/reflections', data),
  getTodayReflection: (date?: string) => api.get<DailyReflection>('/reflections/today', { params: { date } }),
  getRecentReflections: (limit = 30) => api.get<DailyReflection[]>('/reflections', { params: { limit } }),
};

export const analyticsService = {
  getDashboard: () => api.get<DashboardAnalytics>('/analytics/dashboard'),
  getConsistency: (params?: { startDate?: string; endDate?: string; period?: string }) =>
    api.get<ConsistencyAnalytics>('/analytics/consistency', { params }),
  getProgress: () => api.get<ProgressAnalytics>('/analytics/progress'),
  getTimeUsage: () => api.get<TimeUsageAnalytics>('/analytics/time-usage'),
};

export const predictionService = {
  getForecast: (goalId: number) => api.get<GoalForecast>(`/goals/${goalId}/forecast`),
  getHistory: (goalId: number) => api.get<any[]>(`/goals/${goalId}/forecast/history`),
};

export const aiService = {
  analyzePerformance: (goalId: number) => api.post<AiPerformanceReport>(`/ai/analyse-performance/${goalId}`),
  getRecoveryPlan: (goalId: number) => api.post<RecoveryPlan>(`/ai/recovery-plan/${goalId}`),
  getAdaptiveProposal: (goalId: number) => api.get<RecoveryPlan>(`/goals/${goalId}/adaptive/recovery-proposal`),
  applyAdaptivePlan: (goalId: number, data: any) => api.post(`/goals/${goalId}/adaptive/apply`, data),
};

export const reportService = {
  getWeeklyReport: (goalId?: number) => api.get<ReportItem>('/reports/weekly', { params: { goalId } }),
  getMonthlyReport: (goalId?: number) => api.get<ReportItem>('/reports/monthly', { params: { goalId } }),
  getReports: (reportType?: string) => api.get<ReportItem[]>('/reports', { params: { reportType } }),
};

export const notificationService = {
  getNotifications: () => api.get<NotificationItem[]>('/notifications'),
  getUnreadCount: () => api.get<{ unreadCount: number }>('/notifications/unread-count'),
  markAsRead: (id: number) => api.patch<NotificationItem>(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const userService = {
  getProfile: () => api.get<User>('/user/profile'),
  updateProfile: (data: { fullName?: string; timezone?: string }) => api.put<User>('/user/profile', data),
  getPreferences: () => api.get<UserPreference>('/user/preferences'),
  updatePreferences: (data: Partial<UserPreference>) => api.put<UserPreference>('/user/preferences', data),
};

export default api;
