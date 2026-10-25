package com.goalmind.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ReportResponse {
    private Long id;
    private String reportType; // WEEKLY, MONTHLY
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private Long goalId;
    private String goalTitle;

    // Metrics
    private Integer totalPlannedTasks;
    private Integer completedTasks;
    private Double completionRate;
    private Integer totalFocusedMinutes;
    private Double consistencyRate;
    private String bestPerformingDay;
    private Integer missedPriorities;

    // AI Written sections
    private String aiSummary;
    private List<String> keyAccomplishments = new ArrayList<>();
    private List<String> recurringObstacles = new ArrayList<>();
    private List<String> recommendationsForNextPeriod = new ArrayList<>();

    public ReportResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }

    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }

    public Long getGoalId() { return goalId; }
    public void setGoalId(Long goalId) { this.goalId = goalId; }

    public String getGoalTitle() { return goalTitle; }
    public void setGoalTitle(String goalTitle) { this.goalTitle = goalTitle; }

    public Integer getTotalPlannedTasks() { return totalPlannedTasks; }
    public void setTotalPlannedTasks(Integer totalPlannedTasks) { this.totalPlannedTasks = totalPlannedTasks; }

    public Integer getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Integer completedTasks) { this.completedTasks = completedTasks; }

    public Double getCompletionRate() { return completionRate; }
    public void setCompletionRate(Double completionRate) { this.completionRate = completionRate; }

    public Integer getTotalFocusedMinutes() { return totalFocusedMinutes; }
    public void setTotalFocusedMinutes(Integer totalFocusedMinutes) { this.totalFocusedMinutes = totalFocusedMinutes; }

    public Double getConsistencyRate() { return consistencyRate; }
    public void setConsistencyRate(Double consistencyRate) { this.consistencyRate = consistencyRate; }

    public String getBestPerformingDay() { return bestPerformingDay; }
    public void setBestPerformingDay(String bestPerformingDay) { this.bestPerformingDay = bestPerformingDay; }

    public Integer getMissedPriorities() { return missedPriorities; }
    public void setMissedPriorities(Integer missedPriorities) { this.missedPriorities = missedPriorities; }

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }

    public List<String> getKeyAccomplishments() { return keyAccomplishments; }
    public void setKeyAccomplishments(List<String> keyAccomplishments) { this.keyAccomplishments = keyAccomplishments; }

    public List<String> getRecurringObstacles() { return recurringObstacles; }
    public void setRecurringObstacles(List<String> recurringObstacles) { this.recurringObstacles = recurringObstacles; }

    public List<String> getRecommendationsForNextPeriod() { return recommendationsForNextPeriod; }
    public void setRecommendationsForNextPeriod(List<String> recommendationsForNextPeriod) { this.recommendationsForNextPeriod = recommendationsForNextPeriod; }
}
