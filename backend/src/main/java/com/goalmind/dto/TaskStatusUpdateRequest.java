package com.goalmind.dto;

import java.time.LocalDate;

public class TaskStatusUpdateRequest {
    private String status; // PENDING, IN_PROGRESS, PARTIALLY_COMPLETED, COMPLETED, OVERDUE
    private Integer actualMinutes;
    private Integer additionalMinutes;
    private String completionNotes;
    private String blockerNotes;
    private LocalDate newDueDate;

    public TaskStatusUpdateRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getActualMinutes() { return actualMinutes; }
    public void setActualMinutes(Integer actualMinutes) { this.actualMinutes = actualMinutes; }

    public Integer getAdditionalMinutes() { return additionalMinutes; }
    public void setAdditionalMinutes(Integer additionalMinutes) { this.additionalMinutes = additionalMinutes; }

    public String getCompletionNotes() { return completionNotes; }
    public void setCompletionNotes(String completionNotes) { this.completionNotes = completionNotes; }

    public String getBlockerNotes() { return blockerNotes; }
    public void setBlockerNotes(String blockerNotes) { this.blockerNotes = blockerNotes; }

    public LocalDate getNewDueDate() { return newDueDate; }
    public void setNewDueDate(LocalDate newDueDate) { this.newDueDate = newDueDate; }
}
