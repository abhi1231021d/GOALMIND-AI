package com.goalmind.dto;

public class FinishSessionRequest {
    private Long durationSeconds;
    private String notes;
    private Boolean markTaskComplete = false;
    private Boolean markTaskPartiallyComplete = false;
    private String blockerNotes;

    public FinishSessionRequest() {}

    public Long getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Long durationSeconds) { this.durationSeconds = durationSeconds; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getMarkTaskComplete() { return markTaskComplete; }
    public void setMarkTaskComplete(Boolean markTaskComplete) { this.markTaskComplete = markTaskComplete; }

    public Boolean getMarkTaskPartiallyComplete() { return markTaskPartiallyComplete; }
    public void setMarkTaskPartiallyComplete(Boolean markTaskPartiallyComplete) { this.markTaskPartiallyComplete = markTaskPartiallyComplete; }

    public String getBlockerNotes() { return blockerNotes; }
    public void setBlockerNotes(String blockerNotes) { this.blockerNotes = blockerNotes; }
}
