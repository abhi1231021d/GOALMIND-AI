package com.goalmind.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class GoalRequest {

    @NotBlank(message = "Goal title is required")
    @Size(max = 200, message = "Goal title cannot exceed 200 characters")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category = "CAREER";

    private String currentLevel = "BEGINNER";

    private String targetOutcome;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Target completion date is required")
    private LocalDate targetDate;

    @NotNull(message = "Daily hours is required")
    @DecimalMin(value = "0.5", message = "Daily hours must be at least 30 minutes (0.5 hrs)")
    @DecimalMax(value = "16.0", message = "Daily hours cannot exceed 16 hours")
    private Double dailyHours = 2.0;

    @NotNull(message = "Days per week is required")
    @Min(value = 1, message = "Days per week must be between 1 and 7")
    @Max(value = 7, message = "Days per week must be between 1 and 7")
    private Integer daysPerWeek = 6;

    private String priority = "HIGH";
    private String difficulty = "MODERATE";
    private String reason;
    private String learningStyle = "PRACTICAL_PROJECTS";
    private String status = "ACTIVE";

    public GoalRequest() {}

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
}
