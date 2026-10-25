package com.goalmind.dto;

import java.util.ArrayList;
import java.util.List;

public class AiPerformanceReportResponse {
    private Long goalId;
    private String goalTitle;
    private String overallProgress;
    private List<String> positiveImprovements = new ArrayList<>();
    private List<String> weakAreas = new ArrayList<>();
    private String consistencyChanges;
    private List<String> potentialObstacles = new ArrayList<>();
    private String workloadConcerns;
    private List<String> recommendedActions = new ArrayList<>();
    private List<String> suggestedTomorrowPriorities = new ArrayList<>();
    private List<String> suggestedNextWeekPriorities = new ArrayList<>();
    private Boolean sufficientDataAvailable;
    private String confidenceLevel;

    public AiPerformanceReportResponse() {}

    public Long getGoalId() { return goalId; }
    public void setGoalId(Long goalId) { this.goalId = goalId; }

    public String getGoalTitle() { return goalTitle; }
    public void setGoalTitle(String goalTitle) { this.goalTitle = goalTitle; }

    public String getOverallProgress() { return overallProgress; }
    public void setOverallProgress(String overallProgress) { this.overallProgress = overallProgress; }

    public List<String> getPositiveImprovements() { return positiveImprovements; }
    public void setPositiveImprovements(List<String> positiveImprovements) { this.positiveImprovements = positiveImprovements; }

    public List<String> getWeakAreas() { return weakAreas; }
    public void setWeakAreas(List<String> weakAreas) { this.weakAreas = weakAreas; }

    public String getConsistencyChanges() { return consistencyChanges; }
    public void setConsistencyChanges(String consistencyChanges) { this.consistencyChanges = consistencyChanges; }

    public List<String> getPotentialObstacles() { return potentialObstacles; }
    public void setPotentialObstacles(List<String> potentialObstacles) { this.potentialObstacles = potentialObstacles; }

    public String getWorkloadConcerns() { return workloadConcerns; }
    public void setWorkloadConcerns(String workloadConcerns) { this.workloadConcerns = workloadConcerns; }

    public List<String> getRecommendedActions() { return recommendedActions; }
    public void setRecommendedActions(List<String> recommendedActions) { this.recommendedActions = recommendedActions; }

    public List<String> getSuggestedTomorrowPriorities() { return suggestedTomorrowPriorities; }
    public void setSuggestedTomorrowPriorities(List<String> suggestedTomorrowPriorities) { this.suggestedTomorrowPriorities = suggestedTomorrowPriorities; }

    public List<String> getSuggestedNextWeekPriorities() { return suggestedNextWeekPriorities; }
    public void setSuggestedNextWeekPriorities(List<String> suggestedNextWeekPriorities) { this.suggestedNextWeekPriorities = suggestedNextWeekPriorities; }

    public Boolean getSufficientDataAvailable() { return sufficientDataAvailable; }
    public void setSufficientDataAvailable(Boolean sufficientDataAvailable) { this.sufficientDataAvailable = sufficientDataAvailable; }

    public String getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(String confidenceLevel) { this.confidenceLevel = confidenceLevel; }
}
