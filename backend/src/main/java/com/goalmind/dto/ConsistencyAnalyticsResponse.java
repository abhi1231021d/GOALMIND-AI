package com.goalmind.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ConsistencyAnalyticsResponse {
    private String period; // LAST_7_DAYS, LAST_30_DAYS, THIS_MONTH, CUSTOM
    private LocalDate startDate;
    private LocalDate endDate;

    // Consistency calculations
    private Integer meaningfulProgressDays;
    private Integer plannedWorkingDays;
    private Double consistencyRate; // meaningful / planned * 100
    private Double taskCompletionRate; // completed / due * 100
    private Double timeUtilizationRate; // actual / planned * 100
    private Double averageDailyFocusedMinutes;
    private Integer missedWorkSessions;

    // Streaks
    private Integer currentStreakDays;
    private Integer longestStreakDays;

    // Heatmap / Daily activity points
    public static class DayActivityPoint {
        private LocalDate date;
        private String dayOfWeek;
        private Integer focusedMinutes;
        private Integer tasksCompleted;
        private Integer tasksPlanned;
        private Boolean isMeaningful;
        private Boolean isRestDay;

        public DayActivityPoint() {}

        public DayActivityPoint(LocalDate date, String dayOfWeek, Integer focusedMinutes, Integer tasksCompleted, Integer tasksPlanned, Boolean isMeaningful, Boolean isRestDay) {
            this.date = date;
            this.dayOfWeek = dayOfWeek;
            this.focusedMinutes = focusedMinutes;
            this.tasksCompleted = tasksCompleted;
            this.tasksPlanned = tasksPlanned;
            this.isMeaningful = isMeaningful;
            this.isRestDay = isRestDay;
        }

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }

        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

        public Integer getFocusedMinutes() { return focusedMinutes; }
        public void setFocusedMinutes(Integer focusedMinutes) { this.focusedMinutes = focusedMinutes; }

        public Integer getTasksCompleted() { return tasksCompleted; }
        public void setTasksCompleted(Integer tasksCompleted) { this.tasksCompleted = tasksCompleted; }

        public Integer getTasksPlanned() { return tasksPlanned; }
        public void setTasksPlanned(Integer tasksPlanned) { this.tasksPlanned = tasksPlanned; }

        public Boolean getIsMeaningful() { return isMeaningful; }
        public void setIsMeaningful(Boolean isMeaningful) { this.isMeaningful = isMeaningful; }

        public Boolean getIsRestDay() { return isRestDay; }
        public void setIsRestDay(Boolean isRestDay) { this.isRestDay = isRestDay; }
    }

    private List<DayActivityPoint> dailyActivity = new ArrayList<>();
    private String writtenExplanation;

    public ConsistencyAnalyticsResponse() {}

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getMeaningfulProgressDays() { return meaningfulProgressDays; }
    public void setMeaningfulProgressDays(Integer meaningfulProgressDays) { this.meaningfulProgressDays = meaningfulProgressDays; }

    public Integer getPlannedWorkingDays() { return plannedWorkingDays; }
    public void setPlannedWorkingDays(Integer plannedWorkingDays) { this.plannedWorkingDays = plannedWorkingDays; }

    public Double getConsistencyRate() { return consistencyRate; }
    public void setConsistencyRate(Double consistencyRate) { this.consistencyRate = consistencyRate; }

    public Double getTaskCompletionRate() { return taskCompletionRate; }
    public void setTaskCompletionRate(Double taskCompletionRate) { this.taskCompletionRate = taskCompletionRate; }

    public Double getTimeUtilizationRate() { return timeUtilizationRate; }
    public void setTimeUtilizationRate(Double timeUtilizationRate) { this.timeUtilizationRate = timeUtilizationRate; }

    public Double getAverageDailyFocusedMinutes() { return averageDailyFocusedMinutes; }
    public void setAverageDailyFocusedMinutes(Double averageDailyFocusedMinutes) { this.averageDailyFocusedMinutes = averageDailyFocusedMinutes; }

    public Integer getMissedWorkSessions() { return missedWorkSessions; }
    public void setMissedWorkSessions(Integer missedWorkSessions) { this.missedWorkSessions = missedWorkSessions; }

    public Integer getCurrentStreakDays() { return currentStreakDays; }
    public void setCurrentStreakDays(Integer currentStreakDays) { this.currentStreakDays = currentStreakDays; }

    public Integer getLongestStreakDays() { return longestStreakDays; }
    public void setLongestStreakDays(Integer longestStreakDays) { this.longestStreakDays = longestStreakDays; }

    public List<DayActivityPoint> getDailyActivity() { return dailyActivity; }
    public void setDailyActivity(List<DayActivityPoint> dailyActivity) { this.dailyActivity = dailyActivity; }

    public String getWrittenExplanation() { return writtenExplanation; }
    public void setWrittenExplanation(String writtenExplanation) { this.writtenExplanation = writtenExplanation; }
}
