package com.goalmind.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "forecast_records", indexes = {
    @Index(name = "idx_forecast_goal", columnList = "goal_id"),
    @Index(name = "idx_forecast_user", columnList = "user_id")
})
public class ForecastRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    @JsonIgnore
    private Goal goal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private LocalDate forecastDate;

    @Column(nullable = false, length = 30)
    private String status = "ON_TRACK"; // ON_TRACK, NEEDS_ATTENTION, AT_RISK, INSUFFICIENT_DATA

    @Column(nullable = false)
    private Double remainingWorkHours = 0.0;

    @Column(nullable = false)
    private Double availableCapacityHours = 0.0;

    @Column(nullable = false)
    private Double requiredDailyHours = 0.0;

    private LocalDate projectedCompletionDate;

    @Column(nullable = false)
    private Boolean deadlineFeasible = true;

    @Column(columnDefinition = "TEXT")
    private String keyFactors;

    @Column(columnDefinition = "TEXT")
    private String recommendedActions;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ForecastRecord() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.forecastDate == null) this.forecastDate = LocalDate.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Goal getGoal() { return goal; }
    public void setGoal(Goal goal) { this.goal = goal; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getForecastDate() { return forecastDate; }
    public void setForecastDate(LocalDate forecastDate) { this.forecastDate = forecastDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getRemainingWorkHours() { return remainingWorkHours; }
    public void setRemainingWorkHours(Double remainingWorkHours) { this.remainingWorkHours = remainingWorkHours; }

    public Double getAvailableCapacityHours() { return availableCapacityHours; }
    public void setAvailableCapacityHours(Double availableCapacityHours) { this.availableCapacityHours = availableCapacityHours; }

    public Double getRequiredDailyHours() { return requiredDailyHours; }
    public void setRequiredDailyHours(Double requiredDailyHours) { this.requiredDailyHours = requiredDailyHours; }

    public LocalDate getProjectedCompletionDate() { return projectedCompletionDate; }
    public void setProjectedCompletionDate(LocalDate projectedCompletionDate) { this.projectedCompletionDate = projectedCompletionDate; }

    public Boolean getDeadlineFeasible() { return deadlineFeasible; }
    public void setDeadlineFeasible(Boolean deadlineFeasible) { this.deadlineFeasible = deadlineFeasible; }

    public String getKeyFactors() { return keyFactors; }
    public void setKeyFactors(String keyFactors) { this.keyFactors = keyFactors; }

    public String getRecommendedActions() { return recommendedActions; }
    public void setRecommendedActions(String recommendedActions) { this.recommendedActions = recommendedActions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
