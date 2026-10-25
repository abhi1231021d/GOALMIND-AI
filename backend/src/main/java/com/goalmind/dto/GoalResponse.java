package com.goalmind.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class GoalResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String currentLevel;
    private String targetOutcome;
    private LocalDate startDate;
    private LocalDate targetDate;
    private Double dailyHours;
    private Integer daysPerWeek;
    private String priority;
    private String difficulty;
    private String reason;
    private String learningStyle;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Progress statistics
    private Integer totalMilestones = 0;
    private Integer completedMilestones = 0;
    private Integer totalTasks = 0;
    private Integer completedTasks = 0;
    private Double progressPercentage = 0.0;
    private Long totalEstimatedMinutes = 0L;
    private Long totalActualMinutes = 0L;

    private List<MilestoneDto> milestones = new ArrayList<>();

    public GoalResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(String currentLevel) { this.currentLevel = currentLevel; }

    public String getTargetOutcome() { return targetOutcome; }
    public void setTargetOutcome(String targetOutcome) { this.targetOutcome = targetOutcome; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

    public Double getDailyHours() { return dailyHours; }
    public void setDailyHours(Double dailyHours) { this.dailyHours = dailyHours; }

    public Integer getDaysPerWeek() { return daysPerWeek; }
    public void setDaysPerWeek(Integer daysPerWeek) { this.daysPerWeek = daysPerWeek; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getLearningStyle() { return learningStyle; }
    public void setLearningStyle(String learningStyle) { this.learningStyle = learningStyle; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Integer getTotalMilestones() { return totalMilestones; }
    public void setTotalMilestones(Integer totalMilestones) { this.totalMilestones = totalMilestones; }

    public Integer getCompletedMilestones() { return completedMilestones; }
    public void setCompletedMilestones(Integer completedMilestones) { this.completedMilestones = completedMilestones; }

    public Integer getTotalTasks() { return totalTasks; }
    public void setTotalTasks(Integer totalTasks) { this.totalTasks = totalTasks; }

    public Integer getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Integer completedTasks) { this.completedTasks = completedTasks; }

    public Double getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Double progressPercentage) { this.progressPercentage = progressPercentage; }

    public Long getTotalEstimatedMinutes() { return totalEstimatedMinutes; }
    public void setTotalEstimatedMinutes(Long totalEstimatedMinutes) { this.totalEstimatedMinutes = totalEstimatedMinutes; }

    public Long getTotalActualMinutes() { return totalActualMinutes; }
    public void setTotalActualMinutes(Long totalActualMinutes) { this.totalActualMinutes = totalActualMinutes; }

    public List<MilestoneDto> getMilestones() { return milestones; }
    public void setMilestones(List<MilestoneDto> milestones) { this.milestones = milestones; }
}
