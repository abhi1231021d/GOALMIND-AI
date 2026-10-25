package com.goalmind.service;

import com.goalmind.dto.DashboardAnalyticsResponse;
import com.goalmind.dto.ProgressAnalyticsResponse;
import com.goalmind.dto.TimeUsageResponse;
import com.goalmind.model.Goal;
import com.goalmind.model.Task;
import com.goalmind.model.User;
import com.goalmind.repository.GoalRepository;
import com.goalmind.repository.MilestoneRepository;
import com.goalmind.repository.TaskRepository;
import com.goalmind.repository.TaskSessionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class AnalyticsService {

    private final GoalRepository goalRepository;
    private final MilestoneRepository milestoneRepository;
    private final TaskRepository taskRepository;
    private final TaskSessionRepository taskSessionRepository;
    private final ConsistencyAnalysisEngine consistencyEngine;
    private final GoalService goalService;

    public AnalyticsService(GoalRepository goalRepository,
                            MilestoneRepository milestoneRepository,
                            TaskRepository taskRepository,
                            TaskSessionRepository taskSessionRepository,
                            ConsistencyAnalysisEngine consistencyEngine,
                            GoalService goalService) {
        this.goalRepository = goalRepository;
        this.milestoneRepository = milestoneRepository;
        this.taskRepository = taskRepository;
        this.taskSessionRepository = taskSessionRepository;
        this.consistencyEngine = consistencyEngine;
        this.goalService = goalService;
    }

    public DashboardAnalyticsResponse getDashboardAnalytics(User user) {
        DashboardAnalyticsResponse res = new DashboardAnalyticsResponse();

        long totalGoals = goalRepository.countByUserId(user.getId());
        long activeGoals = goalRepository.countByUserIdAndStatus(user.getId(), "ACTIVE");
        long completedGoals = goalRepository.countByUserIdAndStatus(user.getId(), "COMPLETED");

        res.setTotalGoals(totalGoals);
        res.setActiveGoals(activeGoals);
        res.setCompletedGoals(completedGoals);

        List<Task> allTasks = taskRepository.findByUserIdOrderByDueDateAscPriorityDesc(user.getId());
        long totalTasks = allTasks.size();
        long completedTasks = allTasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        long inProgressTasks = allTasks.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count();
        long pendingTasks = allTasks.stream().filter(t -> "PENDING".equalsIgnoreCase(t.getStatus())).count();

        LocalDate today = LocalDate.now();
        long overdueTasks = allTasks.stream()
                .filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus()) && (t.getDueDate().isBefore(today) || "OVERDUE".equalsIgnoreCase(t.getStatus())))
                .count();

        res.setTotalTasks(totalTasks);
        res.setCompletedTasks(completedTasks);
        res.setInProgressTasks(inProgressTasks);
        res.setPendingTasks(pendingTasks);
        res.setOverdueTasks(overdueTasks);

        long plannedMinutes = allTasks.stream().mapToLong(Task::getEstimatedMinutes).sum();
        long actualMinutes = allTasks.stream().mapToLong(Task::getActualMinutes).sum();
        res.setTotalPlannedMinutes(plannedMinutes);
        res.setTotalActualMinutes(actualMinutes);

        // Task Completion Rate: Completed / Total * 100
        double compRate = totalTasks > 0 ? ((double) completedTasks / totalTasks) * 100.0 : 0.0;
        res.setTaskCompletionRate(Math.round(compRate * 10.0) / 10.0);

        // Time Utilization: Actual / Planned * 100
        double utilRate = plannedMinutes > 0 ? ((double) actualMinutes / plannedMinutes) * 100.0 : 0.0;
        res.setTimeUtilizationRate(Math.round(utilRate * 10.0) / 10.0);

        // Goal Progress Rate: Completed Goals / Total Goals * 100 or milestone average
        double goalProgress = totalGoals > 0 ? ((double) completedGoals / totalGoals) * 100.0 : 0.0;
        res.setGoalProgressRate(Math.round(goalProgress * 10.0) / 10.0);

        // Consistency & Streaks from Engine
        var consistency = consistencyEngine.analyze(user, today.minusDays(29), today, "LAST_30_DAYS");
        res.setConsistencyRate(consistency.getConsistencyRate());
        res.setCurrentStreakDays(consistency.getCurrentStreakDays());
        res.setLongestStreakDays(consistency.getLongestStreakDays());

        // Today's stats
        List<Task> todayTasks = taskRepository.findByUserIdAndDueDateOrderByPriorityDesc(user.getId(), today);
        res.setTodayPlannedTasks(todayTasks.size());
        res.setTodayCompletedTasks((int) todayTasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count());

        LocalDateTime startOfToday = LocalDateTime.of(today, LocalTime.MIN);
        LocalDateTime endOfToday = LocalDateTime.of(today, LocalTime.MAX);
        long todaySeconds = taskSessionRepository.sumDurationSecondsByUserIdAndPeriod(user.getId(), startOfToday, endOfToday);
        res.setTodayFocusMinutes(todaySeconds / 60);

        // Upcoming tasks (next 5)
        res.setUpcomingTasks(allTasks.stream()
                .filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus()))
                .limit(5)
                .map(t -> {
                    var dto = new com.goalmind.dto.TaskDto();
                    dto.setId(t.getId());
                    dto.setGoalId(t.getGoal().getId());
                    dto.setTitle(t.getTitle());
                    dto.setDueDate(t.getDueDate());
                    dto.setPriority(t.getPriority());
                    dto.setStatus(t.getStatus());
                    dto.setEstimatedMinutes(t.getEstimatedMinutes());
                    dto.setActualMinutes(t.getActualMinutes());
                    return dto;
                }).toList());

        // Active Goals Summary
        List<Goal> activeGoalEntities = goalRepository.findByUserIdAndStatus(user.getId(), "ACTIVE");
        res.setActiveGoalsSummary(activeGoalEntities.stream().limit(4).map(goalService::mapGoalToResponse).toList());

        return res;
    }

    public ProgressAnalyticsResponse getProgressAnalytics(User user) {
        ProgressAnalyticsResponse response = new ProgressAnalyticsResponse();

        List<Goal> goals = goalRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        Map<String, List<Goal>> byCategory = new HashMap<>();
        for (Goal g : goals) {
            byCategory.computeIfAbsent(g.getCategory(), k -> new ArrayList<>()).add(g);
        }

        List<ProgressAnalyticsResponse.CategoryProgress> catProgressList = new ArrayList<>();
        for (Map.Entry<String, List<Goal>> entry : byCategory.entrySet()) {
            String cat = entry.getKey();
            List<Goal> catGoals = entry.getValue();
            long goalCount = catGoals.size();

            long totalTasks = 0;
            long completedTasks = 0;
            for (Goal g : catGoals) {
                List<Task> tasks = taskRepository.findByGoalIdOrderByDueDateAsc(g.getId());
                totalTasks += tasks.size();
                completedTasks += tasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
            }

            double pct = totalTasks > 0 ? ((double) completedTasks / totalTasks) * 100.0 : 0.0;
            catProgressList.add(new ProgressAnalyticsResponse.CategoryProgress(
                    cat, goalCount, totalTasks, completedTasks, Math.round(pct * 10.0) / 10.0
            ));
        }

        response.setCategoryBreakdowns(catProgressList);
        response.setActiveGoals(goals.stream().filter(g -> "ACTIVE".equalsIgnoreCase(g.getStatus())).map(goalService::mapGoalToResponse).toList());

        long completedMilestones = milestoneRepository.findByGoalUserIdAndStatus(user.getId(), "COMPLETED").size();
        long pendingMilestones = milestoneRepository.findByGoalUserIdAndStatus(user.getId(), "IN_PROGRESS").size()
                + milestoneRepository.findByGoalUserIdAndStatus(user.getId(), "NOT_STARTED").size();

        response.setTotalCompletedMilestones(completedMilestones);
        response.setTotalPendingMilestones(pendingMilestones);

        return response;
    }

    public TimeUsageResponse getTimeUsage(User user) {
        TimeUsageResponse res = new TimeUsageResponse();

        List<Goal> goals = goalRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        long totalPlanned = 0L;
        long totalActual = 0L;

        List<TimeUsageResponse.GoalTimeBreakdown> breakdowns = new ArrayList<>();
        for (Goal g : goals) {
            List<Task> tasks = taskRepository.findByGoalIdOrderByDueDateAsc(g.getId());
            long planned = tasks.stream().mapToLong(Task::getEstimatedMinutes).sum();
            long actual = tasks.stream().mapToLong(Task::getActualMinutes).sum();
            totalPlanned += planned;
            totalActual += actual;

            double util = planned > 0 ? ((double) actual / planned) * 100.0 : 0.0;
            breakdowns.add(new TimeUsageResponse.GoalTimeBreakdown(
                    g.getId(), g.getTitle(), planned, actual, Math.round(util * 10.0) / 10.0
            ));
        }

        res.setTotalPlannedMinutes(totalPlanned);
        res.setTotalActualMinutes(totalActual);
        double overallUtil = totalPlanned > 0 ? ((double) totalActual / totalPlanned) * 100.0 : 0.0;
        res.setOverallUtilizationRate(Math.round(overallUtil * 10.0) / 10.0);

        var sessions = taskSessionRepository.findByUserIdOrderByStartTimeDesc(user.getId());
        if (!sessions.isEmpty()) {
            double avgSec = sessions.stream().mapToLong(s -> s.getDurationSeconds()).average().orElse(0.0);
            res.setAverageSessionDurationMinutes(Math.round((avgSec / 60.0) * 10.0) / 10.0);
        }

        res.setGoalBreakdown(breakdowns);
        return res;
    }
}
