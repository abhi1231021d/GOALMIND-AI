package com.goalmind.dto;

import java.util.ArrayList;
import java.util.List;

public class ProgressAnalyticsResponse {

    public static class CategoryProgress {
        private String category;
        private Long goalCount;
        private Long totalTasks;
        private Long completedTasks;
        private Double progressPercentage;

        public CategoryProgress() {}

        public CategoryProgress(String category, Long goalCount, Long totalTasks, Long completedTasks, Double progressPercentage) {
            this.category = category;
            this.goalCount = goalCount;
            this.totalTasks = totalTasks;
            this.completedTasks = completedTasks;
            this.progressPercentage = progressPercentage;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public Long getGoalCount() { return goalCount; }
        public void setGoalCount(Long goalCount) { this.goalCount = goalCount; }

        public Long getTotalTasks() { return totalTasks; }
        public void setTotalTasks(Long totalTasks) { this.totalTasks = totalTasks; }

        public Long getCompletedTasks() { return completedTasks; }
        public void setCompletedTasks(Long completedTasks) { this.completedTasks = completedTasks; }

        public Double getProgressPercentage() { return progressPercentage; }
        public void setProgressPercentage(Double progressPercentage) { this.progressPercentage = progressPercentage; }
    }

    private List<CategoryProgress> categoryBreakdowns = new ArrayList<>();
    private List<GoalResponse> activeGoals = new ArrayList<>();
    private Long totalCompletedMilestones = 0L;
    private Long totalPendingMilestones = 0L;

    public ProgressAnalyticsResponse() {}

    public List<CategoryProgress> getCategoryBreakdowns() { return categoryBreakdowns; }
    public void setCategoryBreakdowns(List<CategoryProgress> categoryBreakdowns) { this.categoryBreakdowns = categoryBreakdowns; }

    public List<GoalResponse> getActiveGoals() { return activeGoals; }
    public void setActiveGoals(List<GoalResponse> activeGoals) { this.activeGoals = activeGoals; }

    public Long getTotalCompletedMilestones() { return totalCompletedMilestones; }
    public void setTotalCompletedMilestones(Long totalCompletedMilestones) { this.totalCompletedMilestones = totalCompletedMilestones; }

    public Long getTotalPendingMilestones() { return totalPendingMilestones; }
    public void setTotalPendingMilestones(Long totalPendingMilestones) { this.totalPendingMilestones = totalPendingMilestones; }
}
