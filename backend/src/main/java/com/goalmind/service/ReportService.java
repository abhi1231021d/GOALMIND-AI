package com.goalmind.service;

import com.goalmind.dto.ConsistencyAnalyticsResponse;
import com.goalmind.dto.ReportResponse;
import com.goalmind.model.Goal;
import com.goalmind.model.PeriodicReport;
import com.goalmind.model.Task;
import com.goalmind.model.User;
import com.goalmind.repository.GoalRepository;
import com.goalmind.repository.PeriodicReportRepository;
import com.goalmind.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class ReportService {

    private final PeriodicReportRepository reportRepository;
    private final TaskRepository taskRepository;
    private final GoalRepository goalRepository;
    private final ConsistencyAnalysisEngine consistencyEngine;

    public ReportService(PeriodicReportRepository reportRepository,
                         TaskRepository taskRepository,
                         GoalRepository goalRepository,
                         ConsistencyAnalysisEngine consistencyEngine) {
        this.reportRepository = reportRepository;
        this.taskRepository = taskRepository;
        this.goalRepository = goalRepository;
        this.consistencyEngine = consistencyEngine;
    }

    @Transactional
    public ReportResponse generateWeeklyReport(User user, Long goalId) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6); // last 7 days

        return buildAndSaveReport(user, goalId, "WEEKLY", start, end);
    }

    @Transactional
    public ReportResponse generateMonthlyReport(User user, Long goalId) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(29); // last 30 days

        return buildAndSaveReport(user, goalId, "MONTHLY", start, end);
    }

    public List<ReportResponse> getUserReports(User user, String reportType) {
        List<PeriodicReport> reports;
        if (reportType != null && !reportType.isBlank()) {
            reports = reportRepository.findByUserIdAndReportTypeOrderByPeriodStartDesc(user.getId(), reportType.toUpperCase());
        } else {
            reports = reportRepository.findByUserIdOrderByPeriodStartDesc(user.getId());
        }
        return reports.stream().map(this::mapToResponse).toList();
    }

    private ReportResponse buildAndSaveReport(User user, Long goalId, String reportType, LocalDate start, LocalDate end) {
        Goal goal = null;
        if (goalId != null) {
            goal = goalRepository.findByIdAndUserId(goalId, user.getId()).orElse(null);
        }

        ConsistencyAnalyticsResponse consistency = consistencyEngine.analyze(user, start, end, reportType);

        List<Task> tasks;
        if (goal != null) {
            tasks = taskRepository.findByGoalIdAndUserIdOrderByDueDateAsc(goal.getId(), user.getId());
        } else {
            tasks = taskRepository.findByUserIdAndDueDateBetweenOrderByDueDateAsc(user.getId(), start, end);
        }

        int plannedCount = tasks.size();
        int completedCount = (int) tasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        double compRate = plannedCount > 0 ? ((double) completedCount / plannedCount) * 100.0 : 0.0;

        int missedPriorities = (int) tasks.stream()
                .filter(t -> "HIGH".equalsIgnoreCase(t.getPriority()) && !"COMPLETED".equalsIgnoreCase(t.getStatus()) && t.getDueDate().isBefore(LocalDate.now()))
                .count();

        // Find best performing day of week from consistency dailyActivity
        Map<String, Integer> minsByDay = new HashMap<>();
        for (ConsistencyAnalyticsResponse.DayActivityPoint p : consistency.getDailyActivity()) {
            minsByDay.put(p.getDayOfWeek(), minsByDay.getOrDefault(p.getDayOfWeek(), 0) + p.getFocusedMinutes());
        }
        String bestDay = minsByDay.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Monday");

        PeriodicReport report = new PeriodicReport();
        report.setUser(user);
        report.setGoal(goal);
        report.setReportType(reportType);
        report.setPeriodStart(start);
        report.setPeriodEnd(end);
        report.setTotalPlannedTasks(plannedCount);
        report.setCompletedTasks(completedCount);
        report.setCompletionRate(Math.round(compRate * 10.0) / 10.0);
        report.setTotalFocusedMinutes(consistency.getDailyActivity().stream().mapToInt(ConsistencyAnalyticsResponse.DayActivityPoint::getFocusedMinutes).sum());
        report.setConsistencyRate(consistency.getConsistencyRate());
        report.setBestPerformingDay(bestDay);
        report.setMissedPriorities(missedPriorities);

        String summary = String.format("%s Performance Summary: %d tasks completed (%.1f%% completion) with %d focused minutes recorded. Consistency evaluated at %.1f%% with peak velocity observed on %ss.",
                reportType, completedCount, compRate, report.getTotalFocusedMinutes(), consistency.getConsistencyRate(), bestDay);
        report.setAiSummary(summary);

        String recommendations = "Maintain protected 45-minute morning sessions; address any remaining high-priority backlog items; log end-of-day reflections consistently.";
        report.setRecommendations(recommendations);

        PeriodicReport saved = reportRepository.save(report);
        return mapToResponse(saved);
    }

    private ReportResponse mapToResponse(PeriodicReport r) {
        ReportResponse response = new ReportResponse();
        response.setId(r.getId());
        response.setReportType(r.getReportType());
        response.setPeriodStart(r.getPeriodStart());
        response.setPeriodEnd(r.getPeriodEnd());
        if (r.getGoal() != null) {
            response.setGoalId(r.getGoal().getId());
            response.setGoalTitle(r.getGoal().getTitle());
        }
        response.setTotalPlannedTasks(r.getTotalPlannedTasks());
        response.setCompletedTasks(r.getCompletedTasks());
        response.setCompletionRate(r.getCompletionRate());
        response.setTotalFocusedMinutes(r.getTotalFocusedMinutes());
        response.setConsistencyRate(r.getConsistencyRate());
        response.setBestPerformingDay(r.getBestPerformingDay());
        response.setMissedPriorities(r.getMissedPriorities());
        response.setAiSummary(r.getAiSummary());

        response.setKeyAccomplishments(List.of(
                String.format("Successfully completed %d tasks during the period.", r.getCompletedTasks()),
                String.format("Logged %d total minutes of deep focus.", r.getTotalFocusedMinutes()),
                String.format("Maintained highest execution momentum on %ss.", r.getBestPerformingDay())
        ));

        response.setRecurringObstacles(List.of(
                r.getMissedPriorities() > 0 ? String.format("%d high priority tasks were deferred past their due date.", r.getMissedPriorities()) : "No high-priority task delays observed."
        ));

        response.setRecommendationsForNextPeriod(List.of(
                "Lock in core work intervals on your calendar before taking on new commitments.",
                "Review daily reflections to resolve chronic friction points."
        ));

        return response;
    }
}
