package com.goalmind.dto;

import java.util.List;

public class DashboardAnalyticsResponse {
    // Goal metrics
    private Long totalGoals;
    private Long activeGoals;
    private Long completedGoals;

    // Task metrics
    private Long totalTasks;
    private Long completedTasks;
    private Long inProgressTasks;
    private Long overdueTasks;
    private Long pendingTasks;

    // Time metrics (in minutes)
    private Long totalPlannedMinutes;
    private Long totalActualMinutes;

    // Distinct Rates
    private Double taskCompletionRate; // Completed / Due * 100
    private Double timeUtilizationRate; // Actual / Planned * 100
    private Double goalProgressRate; // Overall goal completion %
    private Double consistencyRate; // Meaningful days / Planned days * 100

    // Streaks
    private Integer currentStreakDays;
    private Integer longestStreakDays;

    // Today's summary
    private Integer todayPlannedTasks;
    private Integer todayCompletedTasks;
    private Long todayFocusMinutes;

    // Recent activity list
    private List<TaskDto> upcomingTasks;
    private List<GoalResponse> activeGoalsSummary;

    public DashboardAnalyticsResponse() {}

    public Long getTotalGoals() { return totalGoals; }
    public void setTotalGoals(Long totalGoals) { this.totalGoals = totalGoals; }

    public Long getActiveGoals() { return activeGoals; }
    public void setActiveGoals(Long activeGoals) { this.activeGoals = activeGoals; }

    public Long getCompletedGoals() { return completedGoals; }
    public void setCompletedGoals(Long completedGoals) { this.completedGoals = completedGoals; }

    public Long getTotalTasks() { return totalTasks; }
    public void setTotalTasks(Long totalTasks) { this.totalTasks = totalTasks; }

    public Long getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Long completedTasks) { this.completedTasks = completedTasks; }

    public Long getInProgressTasks() { return inProgressTasks; }
    public void setInProgressTasks(Long inProgressTasks) { this.inProgressTasks = inProgressTasks; }

    public Long getOverdueTasks() { return overdueTasks; }
    public void setOverdueTasks(Long overdueTasks) { this.overdueTasks = overdueTasks; }

    public Long getPendingTasks() { return pendingTasks; }
    public void setPendingTasks(Long pendingTasks) { this.pendingTasks = pendingTasks; }

    public Long getTotalPlannedMinutes() { return totalPlannedMinutes; }
    public void setTotalPlannedMinutes(Long totalPlannedMinutes) { this.totalPlannedMinutes = totalPlannedMinutes; }

    public Long getTotalActualMinutes() { return totalActualMinutes; }
    public void setTotalActualMinutes(Long totalActualMinutes) { this.totalActualMinutes = totalActualMinutes; }

    public Double getTaskCompletionRate() { return taskCompletionRate; }
    public void setTaskCompletionRate(Double taskCompletionRate) { this.taskCompletionRate = taskCompletionRate; }

    public Double getTimeUtilizationRate() { return timeUtilizationRate; }
    public void setTimeUtilizationRate(Double timeUtilizationRate) { this.timeUtilizationRate = timeUtilizationRate; }

    public Double getGoalProgressRate() { return goalProgressRate; }
    public void setGoalProgressRate(Double goalProgressRate) { this.goalProgressRate = goalProgressRate; }

    public Double getConsistencyRate() { return consistencyRate; }
    public void setConsistencyRate(Double consistencyRate) { this.consistencyRate = consistencyRate; }

    public Integer getCurrentStreakDays() { return currentStreakDays; }
    public void setCurrentStreakDays(Integer currentStreakDays) { this.currentStreakDays = currentStreakDays; }

    public Integer getLongestStreakDays() { return longestStreakDays; }
    public void setLongestStreakDays(Integer longestStreakDays) { this.longestStreakDays = longestStreakDays; }

    public Integer getTodayPlannedTasks() { return todayPlannedTasks; }
    public void setTodayPlannedTasks(Integer todayPlannedTasks) { this.todayPlannedTasks = todayPlannedTasks; }

    public Integer getTodayCompletedTasks() { return todayCompletedTasks; }
    public void setTodayCompletedTasks(Integer todayCompletedTasks) { this.todayCompletedTasks = todayCompletedTasks; }

    public Long getTodayFocusMinutes() { return todayFocusMinutes; }
    public void setTodayFocusMinutes(Long todayFocusMinutes) { this.todayFocusMinutes = todayFocusMinutes; }

    public List<TaskDto> getUpcomingTasks() { return upcomingTasks; }
    public void setUpcomingTasks(List<TaskDto> upcomingTasks) { this.upcomingTasks = upcomingTasks; }

    public List<GoalResponse> getActiveGoalsSummary() { return activeGoalsSummary; }
    public void setActiveGoalsSummary(List<GoalResponse> activeGoalsSummary) { this.activeGoalsSummary = activeGoalsSummary; }
}
