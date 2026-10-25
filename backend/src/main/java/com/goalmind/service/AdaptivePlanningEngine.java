package com.goalmind.service;

import com.goalmind.dto.AcceptRecoveryPlanRequest;
import com.goalmind.dto.RecoveryPlanResponse;
import com.goalmind.exception.ResourceNotFoundException;
import com.goalmind.model.Goal;
import com.goalmind.model.Task;
import com.goalmind.model.User;
import com.goalmind.repository.GoalRepository;
import com.goalmind.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AdaptivePlanningEngine {

    private final GoalRepository goalRepository;
    private final TaskRepository taskRepository;
    private final AiService aiService;
    private final NotificationService notificationService;

    public AdaptivePlanningEngine(GoalRepository goalRepository,
                                  TaskRepository taskRepository,
                                  AiService aiService,
                                  NotificationService notificationService) {
        this.goalRepository = goalRepository;
        this.taskRepository = taskRepository;
        this.aiService = aiService;
        this.notificationService = notificationService;
    }

    public RecoveryPlanResponse proposeRecoveryPlan(User user, Long goalId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        List<Task> allTasks = taskRepository.findByGoalIdOrderByDueDateAsc(goalId);
        LocalDate today = LocalDate.now();

        List<Task> overdueTasks = allTasks.stream()
                .filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus()) && (t.getDueDate().isBefore(today) || "OVERDUE".equalsIgnoreCase(t.getStatus())))
                .toList();

        List<Task> remainingTasks = allTasks.stream()
                .filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus()))
                .toList();

        return aiService.generateRecoveryPlan(goal, overdueTasks, remainingTasks);
    }

    @Transactional
    public void applyRecoveryPlan(User user, Long goalId, AcceptRecoveryPlanRequest request) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        if (request.getNewTargetDate() != null && !request.getNewTargetDate().isBefore(goal.getStartDate())) {
            goal.setTargetDate(request.getNewTargetDate());
            goalRepository.save(goal);
        }

        if (request.getReschedules() != null) {
            for (AcceptRecoveryPlanRequest.RescheduleItem item : request.getReschedules()) {
                taskRepository.findByIdAndUserId(item.getTaskId(), user.getId()).ifPresent(task -> {
                    if (item.getProposedDueDate() != null) {
                        task.setDueDate(item.getProposedDueDate());
                        if ("OVERDUE".equalsIgnoreCase(task.getStatus())) {
                            task.setStatus("PENDING");
                        }
                        taskRepository.save(task);
                    }
                });
            }
        }

        notificationService.createNotification(
                user,
                "Adaptive Schedule Updated",
                String.format("Adaptive recovery plan for '%s' has been applied. Schedules have been calibrated.", goal.getTitle()),
                "PLANNING_REMINDER",
                "/goals/" + goalId
        );
    }
}
