package com.goalmind.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "periodic_reports", indexes = {
    @Index(name = "idx_reports_user_type", columnList = "user_id, report_type"),
    @Index(name = "idx_reports_period", columnList = "period_start, period_end")
})
public class PeriodicReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id")
    @JsonIgnore
    private Goal goal;

    @Column(nullable = false, length = 20)
    private String reportType = "WEEKLY"; // WEEKLY, MONTHLY

    @Column(nullable = false)
    private LocalDate periodStart;

    @Column(nullable = false)
    private LocalDate periodEnd;

    @Column(nullable = false)
    private Integer totalPlannedTasks = 0;

    @Column(nullable = false)
    private Integer completedTasks = 0;

    @Column(nullable = false)
    private Double completionRate = 0.0;

    @Column(nullable = false)
    private Integer totalFocusedMinutes = 0;

    @Column(nullable = false)
    private Double consistencyRate = 0.0;

    @Column(length = 50)
    private String bestPerformingDay;

    @Column(nullable = false)
    private Integer missedPriorities = 0;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public PeriodicReport() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Goal getGoal() { return goal; }
    public void setGoal(Goal goal) { this.goal = goal; }

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }

    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }

    public Integer getTotalPlannedTasks() { return totalPlannedTasks; }
    public void setTotalPlannedTasks(Integer totalPlannedTasks) { this.totalPlannedTasks = totalPlannedTasks; }

    public Integer getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Integer completedTasks) { this.completedTasks = completedTasks; }

    public Double getCompletionRate() { return completionRate; }
    public void setCompletionRate(Double completionRate) { this.completionRate = completionRate; }

    public Integer getTotalFocusedMinutes() { return totalFocusedMinutes; }
    public void setTotalFocusedMinutes(Integer totalFocusedMinutes) { this.totalFocusedMinutes = totalFocusedMinutes; }

    public Double getConsistencyRate() { return consistencyRate; }
    public void setConsistencyRate(Double consistencyRate) { this.consistencyRate = consistencyRate; }

    public String getBestPerformingDay() { return bestPerformingDay; }
    public void setBestPerformingDay(String bestPerformingDay) { this.bestPerformingDay = bestPerformingDay; }

    public Integer getMissedPriorities() { return missedPriorities; }
    public void setMissedPriorities(Integer missedPriorities) { this.missedPriorities = missedPriorities; }

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }

    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
