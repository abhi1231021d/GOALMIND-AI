package com.goalmind.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class AcceptRecoveryPlanRequest {
    private LocalDate newTargetDate;
    private List<RescheduleItem> reschedules = new ArrayList<>();

    public static class RescheduleItem {
        private Long taskId;
        private LocalDate proposedDueDate;

        public RescheduleItem() {}

        public RescheduleItem(Long taskId, LocalDate proposedDueDate) {
            this.taskId = taskId;
            this.proposedDueDate = proposedDueDate;
        }

        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }

        public LocalDate getProposedDueDate() { return proposedDueDate; }
        public void setProposedDueDate(LocalDate proposedDueDate) { this.proposedDueDate = proposedDueDate; }
    }

    public AcceptRecoveryPlanRequest() {}

    public LocalDate getNewTargetDate() { return newTargetDate; }
    public void setNewTargetDate(LocalDate newTargetDate) { this.newTargetDate = newTargetDate; }

    public List<RescheduleItem> getReschedules() { return reschedules; }
    public void setReschedules(List<RescheduleItem> reschedules) { this.reschedules = reschedules; }
}
