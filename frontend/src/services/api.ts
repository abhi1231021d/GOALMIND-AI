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

// Response Interceptor for handling session expirations
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on unauthorized
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('goalmind_token');
        localStorage.removeItem('goalmind_user');
        window.location.href = '/login';
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
