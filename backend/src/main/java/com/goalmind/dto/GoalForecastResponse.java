package com.goalmind.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class GoalForecastResponse {
    private Long goalId;
    private String goalTitle;
    private LocalDate targetDate;
    private Long daysRemaining;

    private String status; // ON_TRACK, NEEDS_ATTENTION, AT_RISK, INSUFFICIENT_DATA
    private Double currentProgressPercentage;

    // Mathematical workload vs capacity
    private Double totalEstimatedHours;
    private Double completedHours;
    private Double remainingHours;
    private Double availableCapacityHours;
    private Double requiredDailyHours;
    private Double currentRealisticDailyPace;

    private LocalDate projectedCompletionDate;
    private Boolean deadlineFeasible;

    // Explainable factors & actions
    private List<String> mainFactors = new ArrayList<>();
    private List<String> recommendedActions = new ArrayList<>();
    private String detailedDiagnosis;

    public GoalForecastResponse() {}

    public Long getGoalId() { return goalId; }
    public void setGoalId(Long goalId) { this.goalId = goalId; }

    public String getGoalTitle() { return goalTitle; }
    public void setGoalTitle(String goalTitle) { this.goalTitle = goalTitle; }

    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

    public Long getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(Long daysRemaining) { this.daysRemaining = daysRemaining; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getCurrentProgressPercentage() { return currentProgressPercentage; }
    public void setCurrentProgressPercentage(Double currentProgressPercentage) { this.currentProgressPercentage = currentProgressPercentage; }

    public Double getTotalEstimatedHours() { return totalEstimatedHours; }
    public void setTotalEstimatedHours(Double totalEstimatedHours) { this.totalEstimatedHours = totalEstimatedHours; }

    public Double getCompletedHours() { return completedHours; }
    public void setCompletedHours(Double completedHours) { this.completedHours = completedHours; }

    public Double getRemainingHours() { return remainingHours; }
    public void setRemainingHours(Double remainingHours) { this.remainingHours = remainingHours; }

    public Double getAvailableCapacityHours() { return availableCapacityHours; }
    public void setAvailableCapacityHours(Double availableCapacityHours) { this.availableCapacityHours = availableCapacityHours; }

    public Double getRequiredDailyHours() { return requiredDailyHours; }
    public void setRequiredDailyHours(Double requiredDailyHours) { this.requiredDailyHours = requiredDailyHours; }

    public Double getCurrentRealisticDailyPace() { return currentRealisticDailyPace; }
    public void setCurrentRealisticDailyPace(Double currentRealisticDailyPace) { this.currentRealisticDailyPace = currentRealisticDailyPace; }

    public LocalDate getProjectedCompletionDate() { return projectedCompletionDate; }
    public void setProjectedCompletionDate(LocalDate projectedCompletionDate) { this.projectedCompletionDate = projectedCompletionDate; }

    public Boolean getDeadlineFeasible() { return deadlineFeasible; }
    public void setDeadlineFeasible(Boolean deadlineFeasible) { this.deadlineFeasible = deadlineFeasible; }

    public List<String> getMainFactors() { return mainFactors; }
    public void setMainFactors(List<String> mainFactors) { this.mainFactors = mainFactors; }

    public List<String> getRecommendedActions() { return recommendedActions; }
    public void setRecommendedActions(List<String> recommendedActions) { this.recommendedActions = recommendedActions; }

    public String getDetailedDiagnosis() { return detailedDiagnosis; }
    public void setDetailedDiagnosis(String detailedDiagnosis) { this.detailedDiagnosis = detailedDiagnosis; }
}
