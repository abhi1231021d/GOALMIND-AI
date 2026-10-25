package com.goalmind.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DailyReflectionRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String accomplishments;
    private String blockers;
    private String learnings;
    private String improvementsForTomorrow;

    public DailyReflectionRequest() {}

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getAccomplishments() { return accomplishments; }
    public void setAccomplishments(String accomplishments) { this.accomplishments = accomplishments; }

    public String getBlockers() { return blockers; }
    public void setBlockers(String blockers) { this.blockers = blockers; }

    public String getLearnings() { return learnings; }
    public void setLearnings(String learnings) { this.learnings = learnings; }

    public String getImprovementsForTomorrow() { return improvementsForTomorrow; }
    public void setImprovementsForTomorrow(String improvementsForTomorrow) { this.improvementsForTomorrow = improvementsForTomorrow; }
}
