package com.goalmind.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class RecoveryPlanResponse {
    private Long goalId;
    private String goalTitle;
    private String triggerReason; // e.g., "3 overdue tasks detected", "Velocity fell 40% below target"
    private Integer unfinishedTasksCount;
    private Long remainingWorkloadMinutes;
    private LocalDate originalTargetDate;
    private LocalDate suggestedTargetDate;
    private String rationale;

    public static class TaskRescheduleProposal {
        private Long taskId;
        private String taskTitle;
        private String priority;
        private LocalDate currentDueDate;
        private LocalDate proposedDueDate;
        private Integer proposedMinutes;
        private String justification;

        public TaskRescheduleProposal() {}

        public TaskRescheduleProposal(Long taskId, String taskTitle, String priority, LocalDate currentDueDate, LocalDate proposedDueDate, Integer proposedMinutes, String justification) {
            this.taskId = taskId;
            this.taskTitle = taskTitle;
            this.priority = priority;
            this.currentDueDate = currentDueDate;
            this.proposedDueDate = proposedDueDate;
            this.proposedMinutes = proposedMinutes;
            this.justification = justification;
        }

        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }

        public String getTaskTitle() { return taskTitle; }
        public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public LocalDate getCurrentDueDate() { return currentDueDate; }
        public void setCurrentDueDate(LocalDate currentDueDate) { this.currentDueDate = currentDueDate; }

        public LocalDate getProposedDueDate() { return proposedDueDate; }
        public void setProposedDueDate(LocalDate proposedDueDate) { this.proposedDueDate = proposedDueDate; }

        public Integer getProposedMinutes() { return proposedMinutes; }
        public void setProposedMinutes(Integer proposedMinutes) { this.proposedMinutes = proposedMinutes; }

        public String getJustification() { return justification; }
        public void setJustification(String justification) { this.justification = justification; }
    }

    private List<TaskRescheduleProposal> proposedTaskReschedules = new ArrayList<>();
    private List<String> strategicAdjustments = new ArrayList<>();
    private Boolean requiresUserApproval = true;

    public RecoveryPlanResponse() {}

    public Long getGoalId() { return goalId; }
    public void setGoalId(Long goalId) { this.goalId = goalId; }

    public String getGoalTitle() { return goalTitle; }
    public void setGoalTitle(String goalTitle) { this.goalTitle = goalTitle; }

    public String getTriggerReason() { return triggerReason; }
    public void setTriggerReason(String triggerReason) { this.triggerReason = triggerReason; }

    public Integer getUnfinishedTasksCount() { return unfinishedTasksCount; }
    public void setUnfinishedTasksCount(Integer unfinishedTasksCount) { this.unfinishedTasksCount = unfinishedTasksCount; }

    public Long getRemainingWorkloadMinutes() { return remainingWorkloadMinutes; }
    public void setRemainingWorkloadMinutes(Long remainingWorkloadMinutes) { this.remainingWorkloadMinutes = remainingWorkloadMinutes; }

    public LocalDate getOriginalTargetDate() { return originalTargetDate; }
    public void setOriginalTargetDate(LocalDate originalTargetDate) { this.originalTargetDate = originalTargetDate; }

    public LocalDate getSuggestedTargetDate() { return suggestedTargetDate; }
    public void setSuggestedTargetDate(LocalDate suggestedTargetDate) { this.suggestedTargetDate = suggestedTargetDate; }

    public String getRationale() { return rationale; }
    public void setRationale(String rationale) { this.rationale = rationale; }

    public List<TaskRescheduleProposal> getProposedTaskReschedules() { return proposedTaskReschedules; }
    public void setProposedTaskReschedules(List<TaskRescheduleProposal> proposedTaskReschedules) { this.proposedTaskReschedules = proposedTaskReschedules; }

    public List<String> getStrategicAdjustments() { return strategicAdjustments; }
    public void setStrategicAdjustments(List<String> strategicAdjustments) { this.strategicAdjustments = strategicAdjustments; }

    public Boolean getRequiresUserApproval() { return requiresUserApproval; }
    public void setRequiresUserApproval(Boolean requiresUserApproval) { this.requiresUserApproval = requiresUserApproval; }
}
