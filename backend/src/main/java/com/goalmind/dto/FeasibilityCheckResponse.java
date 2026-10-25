package com.goalmind.dto;

import java.util.List;

public class FeasibilityCheckResponse {
    private String status; // FEASIBLE, CHALLENGING, AT_RISK, UNREALISTIC
    private Double estimatedWorkloadHours;
    private Double availableWorkingHours;
    private Double capacityUtilizationRatio;
    private List<String> constraints;
    private List<String> potentialRisks;
    private List<String> suggestedAdjustments;
    private String summaryMessage;

    public FeasibilityCheckResponse() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getEstimatedWorkloadHours() { return estimatedWorkloadHours; }
    public void setEstimatedWorkloadHours(Double estimatedWorkloadHours) { this.estimatedWorkloadHours = estimatedWorkloadHours; }

    public Double getAvailableWorkingHours() { return availableWorkingHours; }
    public void setAvailableWorkingHours(Double availableWorkingHours) { this.availableWorkingHours = availableWorkingHours; }

    public Double getCapacityUtilizationRatio() { return capacityUtilizationRatio; }
    public void setCapacityUtilizationRatio(Double capacityUtilizationRatio) { this.capacityUtilizationRatio = capacityUtilizationRatio; }

    public List<String> getConstraints() { return constraints; }
    public void setConstraints(List<String> constraints) { this.constraints = constraints; }

    public List<String> getPotentialRisks() { return potentialRisks; }
    public void setPotentialRisks(List<String> potentialRisks) { this.potentialRisks = potentialRisks; }

    public List<String> getSuggestedAdjustments() { return suggestedAdjustments; }
    public void setSuggestedAdjustments(List<String> suggestedAdjustments) { this.suggestedAdjustments = suggestedAdjustments; }

    public String getSummaryMessage() { return summaryMessage; }
    public void setSummaryMessage(String summaryMessage) { this.summaryMessage = summaryMessage; }
}
