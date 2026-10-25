package com.goalmind.dto;

import java.util.ArrayList;
import java.util.List;

public class RoadmapResponse {
    private Long goalId;
    private String goalTitle;
    private String targetOutcome;
    private String estimatedTotalWorkload;
    private Integer totalMilestones;
    private Integer totalTasks;
    private List<MilestoneDto> milestones = new ArrayList<>();
    private String aiStrategySummary;

    public RoadmapResponse() {}

    public Long getGoalId() { return goalId; }
    public void setGoalId(Long goalId) { this.goalId = goalId; }

    public String getGoalTitle() { return goalTitle; }
    public void setGoalTitle(String goalTitle) { this.goalTitle = goalTitle; }

    public String getTargetOutcome() { return targetOutcome; }
    public void setTargetOutcome(String targetOutcome) { this.targetOutcome = targetOutcome; }

    public String getEstimatedTotalWorkload() { return estimatedTotalWorkload; }
    public void setEstimatedTotalWorkload(String estimatedTotalWorkload) { this.estimatedTotalWorkload = estimatedTotalWorkload; }

    public Integer getTotalMilestones() { return totalMilestones; }
    public void setTotalMilestones(Integer totalMilestones) { this.totalMilestones = totalMilestones; }

    public Integer getTotalTasks() { return totalTasks; }
    public void setTotalTasks(Integer totalTasks) { this.totalTasks = totalTasks; }

    public List<MilestoneDto> getMilestones() { return milestones; }
    public void setMilestones(List<MilestoneDto> milestones) { this.milestones = milestones; }

    public String getAiStrategySummary() { return aiStrategySummary; }
    public void setAiStrategySummary(String aiStrategySummary) { this.aiStrategySummary = aiStrategySummary; }
}
