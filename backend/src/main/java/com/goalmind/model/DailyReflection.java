package com.goalmind.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_reflections", indexes = {
    @Index(name = "idx_reflections_user_date", columnList = "user_id, date", unique = true)
})
public class DailyReflection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(columnDefinition = "TEXT")
    private String accomplishments;

    @Column(columnDefinition = "TEXT")
    private String blockers;

    @Column(columnDefinition = "TEXT")
    private String learnings;

    @Column(columnDefinition = "TEXT")
    private String improvementsForTomorrow;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public DailyReflection() {}

    public DailyReflection(User user, LocalDate date, String accomplishments, String blockers, String learnings, String improvementsForTomorrow) {
        this.user = user;
        this.date = date;
        this.accomplishments = accomplishments;
        this.blockers = blockers;
        this.learnings = learnings;
        this.improvementsForTomorrow = improvementsForTomorrow;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.date == null) this.date = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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
