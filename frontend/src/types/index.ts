export interface User {
  id: number;
  username: string;
  email?: string | null;
  fullName?: string | null;
  timezone?: string;
  createdAt: string;
}

export interface UserPreference {
  theme: string;
  meaningfulProgressThresholdMinutes: number;
  meaningfulTaskRequired: boolean;
  dailyReminderTime: string;
  notificationsEnabled: boolean;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  category: string;
  currentLevel: string;
  targetOutcome: string;
  startDate: string;
  targetDate: string;
  dailyHours: number;
  daysPerWeek: number;
  priority: string;
  difficulty: string;
  reason: string;
  learningStyle: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalMilestones?: number;
  completedMilestones?: number;
  totalTasks?: number;
  completedTasks?: number;
  progressPercentage?: number;
  totalEstimatedMinutes?: number;
  totalActualMinutes?: number;
  milestones?: Milestone[];
}

export interface FeasibilityCheckResponse {
  status: 'FEASIBLE' | 'CHALLENGING' | 'AT_RISK' | 'UNREALISTIC';
  estimatedWorkloadHours: number;
  availableWorkingHours: number;
  capacityUtilizationRatio: number;
  constraints: string[];
  potentialRisks: string[];
  suggestedAdjustments: string[];
  summaryMessage: string;
}

export interface Milestone {
  id: number;
  goalId: number;
  title: string;
  description: string;
  expectedOutcome: string;
  estimatedHours: number;
  targetDate: string;
  orderIndex: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  completionCriteria: string;
  tasks?: Task[];
}

export interface Task {
  id: number;
  goalId: number;
  milestoneId?: number;
  milestoneTitle?: string;
  title: string;
  instructions: string;
  estimatedMinutes: number;
  actualMinutes: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'PARTIALLY_COMPLETED' | 'COMPLETED' | 'OVERDUE';
  dependencies?: string;
  completionCriteria?: string;
  completionNotes?: string;
  blockerNotes?: string;
  topicExplanation?: string;
  videoUrl?: string;
  completedAt?: string;
}

export interface TaskSession {
  id: number;
  taskId: number;
  taskTitle?: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface DailyReflection {
  id?: number;
  date: string;
  accomplishments: string;
  blockers: string;
  learnings: string;
  improvementsForTomorrow: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardAnalytics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  pendingTasks: number;
  totalPlannedMinutes: number;
  totalActualMinutes: number;
  taskCompletionRate: number;
  timeUtilizationRate: number;
  goalProgressRate: number;
  consistencyRate: number;
  currentStreakDays: number;
  longestStreakDays: number;
  todayPlannedTasks: number;
  todayCompletedTasks: number;
  todayFocusMinutes: number;
  upcomingTasks: Task[];
  activeGoalsSummary: Goal[];
}

export interface DayActivityPoint {
  date: string;
  dayOfWeek: string;
  focusedMinutes: number;
  tasksCompleted: number;
  tasksPlanned: number;
  isMeaningful: boolean;
  isRestDay: boolean;
}

export interface ConsistencyAnalytics {
  period: string;
  startDate: string;
  endDate: string;
  meaningfulProgressDays: number;
  plannedWorkingDays: number;
  consistencyRate: number;
  taskCompletionRate: number;
  timeUtilizationRate: number;
  averageDailyFocusedMinutes: number;
  missedWorkSessions: number;
  currentStreakDays: number;
  longestStreakDays: number;
  dailyActivity: DayActivityPoint[];
  writtenExplanation: string;
}

export interface ProgressAnalytics {
  categoryBreakdowns: Array<{
    category: string;
    goalCount: number;
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
  }>;
  activeGoals: Goal[];
  totalCompletedMilestones: number;
  totalPendingMilestones: number;
}

export interface TimeUsageAnalytics {
  totalPlannedMinutes: number;
  totalActualMinutes: number;
  overallUtilizationRate: number;
  averageSessionDurationMinutes: number;
  goalBreakdown: Array<{
    goalId: number;
    goalTitle: string;
    plannedMinutes: number;
    actualMinutes: number;
    utilizationPercentage: number;
  }>;
}

export interface GoalForecast {
  goalId: number;
  goalTitle: string;
  targetDate: string;
  daysRemaining: number;
  status: 'ON_TRACK' | 'NEEDS_ATTENTION' | 'AT_RISK' | 'INSUFFICIENT_DATA';
  currentProgressPercentage: number;
  totalEstimatedHours: number;
  completedHours: number;
  remainingHours: number;
  availableCapacityHours: number;
  requiredDailyHours: number;
  currentRealisticDailyPace: number;
  projectedCompletionDate: string;
  deadlineFeasible: boolean;
  mainFactors: string[];
  recommendedActions: string[];
  detailedDiagnosis: string;
}

export interface AiPerformanceReport {
  goalId: number;
  goalTitle: string;
  overallProgress: string;
  positiveImprovements: string[];
  weakAreas: string[];
  consistencyChanges: string;
  potentialObstacles: string[];
  workloadConcerns: string[];
  recommendedActions: string[];
  suggestedTomorrowPriorities: string[];
  suggestedNextWeekPriorities: string[];
  sufficientDataAvailable: boolean;
  confidenceLevel: string;
}

export interface TaskRescheduleProposal {
  taskId: number;
  taskTitle: string;
  priority: string;
  currentDueDate: string;
  proposedDueDate: string;
  proposedMinutes: number;
  justification: string;
}

export interface RecoveryPlan {
  goalId: number;
  goalTitle: string;
  triggerReason: string;
  unfinishedTasksCount: number;
  remainingWorkloadMinutes: number;
  originalTargetDate: string;
  suggestedTargetDate: string;
  rationale: string;
  proposedTaskReschedules: TaskRescheduleProposal[];
  strategicAdjustments: string[];
  requiresUserApproval: boolean;
}

export interface ReportItem {
  id: number;
  reportType: 'WEEKLY' | 'MONTHLY';
  periodStart: string;
  periodEnd: string;
  goalId?: number;
  goalTitle?: string;
  totalPlannedTasks: number;
  completedTasks: number;
  completionRate: number;
  totalFocusedMinutes: number;
  consistencyRate: number;
  bestPerformingDay: string;
  missedPriorities: number;
  aiSummary: string;
  keyAccomplishments: string[];
  recurringObstacles: string[];
  recommendationsForNextPeriod: string[];
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}
