package com.goalmind.dto;

import java.util.ArrayList;
import java.util.List;

public class TimeUsageResponse {

    public static class GoalTimeBreakdown {
        private Long goalId;
        private String goalTitle;
        private Long plannedMinutes;
        private Long actualMinutes;
        private Double utilizationPercentage;

        public GoalTimeBreakdown() {}

        public GoalTimeBreakdown(Long goalId, String goalTitle, Long plannedMinutes, Long actualMinutes, Double utilizationPercentage) {
            this.goalId = goalId;
            this.goalTitle = goalTitle;
            this.plannedMinutes = plannedMinutes;
            this.actualMinutes = actualMinutes;
            this.utilizationPercentage = utilizationPercentage;
        }

        public Long getGoalId() { return goalId; }
        public void setGoalId(Long goalId) { this.goalId = goalId; }

        public String getGoalTitle() { return goalTitle; }
        public void setGoalTitle(String goalTitle) { this.goalTitle = goalTitle; }

        public Long getPlannedMinutes() { return plannedMinutes; }
        public void setPlannedMinutes(Long plannedMinutes) { this.plannedMinutes = plannedMinutes; }

        public Long getActualMinutes() { return actualMinutes; }
        public void setActualMinutes(Long actualMinutes) { this.actualMinutes = actualMinutes; }

        public Double getUtilizationPercentage() { return utilizationPercentage; }
        public void setUtilizationPercentage(Double utilizationPercentage) { this.utilizationPercentage = utilizationPercentage; }
    }

    private Long totalPlannedMinutes = 0L;
    private Long totalActualMinutes = 0L;
    private Double overallUtilizationRate = 0.0;
    private Double averageSessionDurationMinutes = 0.0;
    private List<GoalTimeBreakdown> goalBreakdown = new ArrayList<>();

    public TimeUsageResponse() {}

    public Long getTotalPlannedMinutes() { return totalPlannedMinutes; }
    public void setTotalPlannedMinutes(Long totalPlannedMinutes) { this.totalPlannedMinutes = totalPlannedMinutes; }

    public Long getTotalActualMinutes() { return totalActualMinutes; }
    public void setTotalActualMinutes(Long totalActualMinutes) { this.totalActualMinutes = totalActualMinutes; }

    public Double getOverallUtilizationRate() { return overallUtilizationRate; }
    public void setOverallUtilizationRate(Double overallUtilizationRate) { this.overallUtilizationRate = overallUtilizationRate; }

    public Double getAverageSessionDurationMinutes() { return averageSessionDurationMinutes; }
    public void setAverageSessionDurationMinutes(Double averageSessionDurationMinutes) { this.averageSessionDurationMinutes = averageSessionDurationMinutes; }

    public List<GoalTimeBreakdown> getGoalBreakdown() { return goalBreakdown; }
    public void setGoalBreakdown(List<GoalTimeBreakdown> goalBreakdown) { this.goalBreakdown = goalBreakdown; }
}
