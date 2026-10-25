package com.goalmind.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DailyReflectionResponse {
    private Long id;
    private LocalDate date;
    private String accomplishments;
    private String blockers;
    private String learnings;
    private String improvementsForTomorrow;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DailyReflectionResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
