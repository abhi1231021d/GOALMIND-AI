package com.goalmind.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class TaskRequest {

    @NotNull(message = "Goal ID is required")
    private Long goalId;

    private Long milestoneId;

    @NotBlank(message = "Task title is required")
    private String title;

    private String instructions;

    private Integer estimatedMinutes = 60;

    private Integer actualMinutes = 0;

    private String priority = "MEDIUM";

    private String difficulty = "MEDIUM";

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private String status = "PENDING";

    private String dependencies;

    private String completionCriteria;

    private String completionNotes;

    private String blockerNotes;
    private String topicExplanation;
    private String videoUrl;

    public TaskRequest() {}

    public Long getGoalId() { return goalId; }
    public void setGoalId(Long goalId) { this.goalId = goalId; }

    public Long getMilestoneId() { return milestoneId; }
    public void setMilestoneId(Long milestoneId) { this.milestoneId = milestoneId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public Integer getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }

    public Integer getActualMinutes() { return actualMinutes; }
    public void setActualMinutes(Integer actualMinutes) { this.actualMinutes = actualMinutes; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDependencies() { return dependencies; }
    public void setDependencies(String dependencies) { this.dependencies = dependencies; }

    public String getCompletionCriteria() { return completionCriteria; }
    public void setCompletionCriteria(String completionCriteria) { this.completionCriteria = completionCriteria; }

    public String getCompletionNotes() { return completionNotes; }
    public void setCompletionNotes(String completionNotes) { this.completionNotes = completionNotes; }

    public String getBlockerNotes() { return blockerNotes; }
    public void setBlockerNotes(String blockerNotes) { this.blockerNotes = blockerNotes; }

    public String getTopicExplanation() { return topicExplanation; }
    public void setTopicExplanation(String topicExplanation) { this.topicExplanation = topicExplanation; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
}
