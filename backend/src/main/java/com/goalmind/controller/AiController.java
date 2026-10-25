package com.goalmind.controller;

import com.goalmind.dto.AiPerformanceReportResponse;
import com.goalmind.dto.ConsistencyAnalyticsResponse;
import com.goalmind.dto.RecoveryPlanResponse;
import com.goalmind.exception.ResourceNotFoundException;
import com.goalmind.model.Goal;
import com.goalmind.model.Task;
import com.goalmind.model.User;
import com.goalmind.repository.GoalRepository;
import com.goalmind.repository.TaskRepository;
import com.goalmind.repository.TaskSessionRepository;
import com.goalmind.service.AiService;
import com.goalmind.service.AuthService;
import com.goalmind.service.ConsistencyAnalysisEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;
    private final AuthService authService;
    private final GoalRepository goalRepository;
    private final TaskRepository taskRepository;
    private final TaskSessionRepository taskSessionRepository;
    private final ConsistencyAnalysisEngine consistencyEngine;

    public AiController(AiService aiService,
                        AuthService authService,
                        GoalRepository goalRepository,
                        TaskRepository taskRepository,
                        TaskSessionRepository taskSessionRepository,
                        ConsistencyAnalysisEngine consistencyEngine) {
        this.aiService = aiService;
        this.authService = authService;
        this.goalRepository = goalRepository;
        this.taskRepository = taskRepository;
        this.taskSessionRepository = taskSessionRepository;
        this.consistencyEngine = consistencyEngine;
    }

    @PostMapping("/analyse-performance/{goalId}")
    public ResponseEntity<AiPerformanceReportResponse> analyzePerformance(@PathVariable Long goalId) {
        User user = authService.getAuthenticatedUser();
        Goal goal = goalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        List<Task> tasks = taskRepository.findByGoalIdOrderByDueDateAsc(goalId);

        LocalDate today = LocalDate.now();
        ConsistencyAnalyticsResponse consistency = consistencyEngine.analyze(user, today.minusDays(29), today, "LAST_30_DAYS");

        long completedCount = tasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        double compRate = tasks.isEmpty() ? 0.0 : ((double) completedCount / tasks.size()) * 100.0;

        LocalDateTime start = LocalDateTime.of(today.minusDays(30), LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(today, LocalTime.MAX);
        long totalSecs = taskSessionRepository.sumDurationSecondsByUserIdAndPeriod(user.getId(), start, end);
        long focusedMinutes = totalSecs / 60;

        long plannedMinutes = tasks.stream().mapToLong(Task::getEstimatedMinutes).sum();
        double utilRate = plannedMinutes > 0 ? ((double) focusedMinutes / plannedMinutes) * 100.0 : 0.0;

        AiPerformanceReportResponse report = aiService.analyzePerformance(
                goal, tasks, consistency.getConsistencyRate(), compRate, utilRate, focusedMinutes
        );

        return ResponseEntity.ok(report);
    }

    @PostMapping("/recovery-plan/{goalId}")
    public ResponseEntity<RecoveryPlanResponse> generateRecoveryPlan(@PathVariable Long goalId) {
        User user = authService.getAuthenticatedUser();
        Goal goal = goalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        List<Task> allTasks = taskRepository.findByGoalIdOrderByDueDateAsc(goalId);
        LocalDate today = LocalDate.now();

        List<Task> overdue = allTasks.stream()
                .filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus()) && (t.getDueDate().isBefore(today) || "OVERDUE".equalsIgnoreCase(t.getStatus())))
                .toList();

        List<Task> remaining = allTasks.stream()
                .filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus()))
                .toList();

        RecoveryPlanResponse response = aiService.generateRecoveryPlan(goal, overdue, remaining);
        return ResponseEntity.ok(response);
    }
}
