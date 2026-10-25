package com.goalmind.service;

import com.goalmind.dto.TaskDto;
import com.goalmind.dto.TaskRequest;
import com.goalmind.dto.TaskStatusUpdateRequest;
import com.goalmind.exception.ResourceNotFoundException;
import com.goalmind.model.Goal;
import com.goalmind.model.Milestone;
import com.goalmind.model.Task;
import com.goalmind.model.User;
import com.goalmind.repository.GoalRepository;
import com.goalmind.repository.MilestoneRepository;
import com.goalmind.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final GoalRepository goalRepository;
    private final MilestoneRepository milestoneRepository;

    public TaskService(TaskRepository taskRepository,
                       GoalRepository goalRepository,
                       MilestoneRepository milestoneRepository) {
        this.taskRepository = taskRepository;
        this.goalRepository = goalRepository;
        this.milestoneRepository = milestoneRepository;
    }

    public List<TaskDto> getTodayTasks(User user, LocalDate date) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        List<Task> tasks = taskRepository.findByUserIdAndDueDateOrderByPriorityDesc(user.getId(), queryDate);
        return tasks.stream().map(this::mapTaskToDto).toList();
    }

    public List<TaskDto> getUserTasks(User user, Long goalId, String status, LocalDate fromDate, LocalDate toDate) {
        List<Task> tasks;
        if (goalId != null) {
            tasks = taskRepository.findByGoalIdAndUserIdOrderByDueDateAsc(goalId, user.getId());
        } else if (fromDate != null && toDate != null) {
            tasks = taskRepository.findByUserIdAndDueDateBetweenOrderByDueDateAsc(user.getId(), fromDate, toDate);
        } else {
            tasks = taskRepository.findByUserIdOrderByDueDateAscPriorityDesc(user.getId());
        }

        if (status != null && !status.isBlank()) {
            tasks = tasks.stream().filter(t -> status.equalsIgnoreCase(t.getStatus())).toList();
        }

        return tasks.stream().map(this::mapTaskToDto).toList();
    }

    public TaskDto getTaskById(User user, Long taskId) {
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));
        return mapTaskToDto(task);
    }

    @Transactional
    public TaskDto createTask(User user, TaskRequest request) {
        Goal goal = goalRepository.findByIdAndUserId(request.getGoalId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + request.getGoalId()));

        Milestone milestone = null;
        if (request.getMilestoneId() != null) {
            milestone = milestoneRepository.findByIdAndGoalUserId(request.getMilestoneId(), user.getId())
                    .orElse(null);
        }

        Task task = new Task();
        task.setUser(user);
        task.setGoal(goal);
        task.setMilestone(milestone);
        task.setTitle(request.getTitle().trim());
        task.setInstructions(request.getInstructions());
        task.setEstimatedMinutes(request.getEstimatedMinutes() != null ? request.getEstimatedMinutes() : 60);
        task.setActualMinutes(request.getActualMinutes() != null ? request.getActualMinutes() : 0);
        task.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        task.setDifficulty(request.getDifficulty() != null ? request.getDifficulty() : "MEDIUM");
        task.setDueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now());
        task.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
        task.setDependencies(request.getDependencies());
        task.setCompletionCriteria(request.getCompletionCriteria());
        task.setCompletionNotes(request.getCompletionNotes());
        task.setBlockerNotes(request.getBlockerNotes());
        task.setTopicExplanation(request.getTopicExplanation());
        task.setVideoUrl(request.getVideoUrl());

        Task saved = taskRepository.save(task);
        return mapTaskToDto(saved);
    }

    @Transactional
    public TaskDto updateTaskStatus(User user, Long taskId, TaskStatusUpdateRequest request) {
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            String newStatus = request.getStatus().toUpperCase();
            task.setStatus(newStatus);
            if ("COMPLETED".equals(newStatus)) {
                task.setCompletedAt(LocalDateTime.now());
            } else {
                task.setCompletedAt(null);
            }
        }

        if (request.getAdditionalMinutes() != null && request.getAdditionalMinutes() > 0) {
            task.setActualMinutes(task.getActualMinutes() + request.getAdditionalMinutes());
        } else if (request.getActualMinutes() != null) {
            task.setActualMinutes(request.getActualMinutes());
        }

        if (request.getCompletionNotes() != null) {
            task.setCompletionNotes(request.getCompletionNotes());
        }

        if (request.getBlockerNotes() != null) {
            task.setBlockerNotes(request.getBlockerNotes());
        }

        if (request.getNewDueDate() != null) {
            task.setDueDate(request.getNewDueDate());
        }

        Task saved = taskRepository.save(task);
        return mapTaskToDto(saved);
    }

    @Transactional
    public TaskDto updateTask(User user, Long taskId, TaskRequest request) {
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        task.setTitle(request.getTitle().trim());
        task.setInstructions(request.getInstructions());
        if (request.getEstimatedMinutes() != null) task.setEstimatedMinutes(request.getEstimatedMinutes());
        if (request.getActualMinutes() != null) task.setActualMinutes(request.getActualMinutes());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDifficulty() != null) task.setDifficulty(request.getDifficulty());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        task.setDependencies(request.getDependencies());
        task.setCompletionCriteria(request.getCompletionCriteria());
        task.setCompletionNotes(request.getCompletionNotes());
        task.setBlockerNotes(request.getBlockerNotes());
        if (request.getTopicExplanation() != null) task.setTopicExplanation(request.getTopicExplanation());
        if (request.getVideoUrl() != null) task.setVideoUrl(request.getVideoUrl());

        Task saved = taskRepository.save(task);
        return mapTaskToDto(saved);
    }

    @Transactional
    public void deleteTask(User user, Long taskId) {
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));
        taskRepository.delete(task);
    }

    public TaskDto mapTaskToDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setGoalId(task.getGoal().getId());
        if (task.getMilestone() != null) {
            dto.setMilestoneId(task.getMilestone().getId());
            dto.setMilestoneTitle(task.getMilestone().getTitle());
        }
        dto.setTitle(task.getTitle());
        dto.setInstructions(task.getInstructions());
        dto.setEstimatedMinutes(task.getEstimatedMinutes());
        dto.setActualMinutes(task.getActualMinutes());
        dto.setPriority(task.getPriority());
        dto.setDifficulty(task.getDifficulty());
        dto.setDueDate(task.getDueDate());
        dto.setStatus(task.getStatus());
        dto.setDependencies(task.getDependencies());
        dto.setCompletionCriteria(task.getCompletionCriteria());
        dto.setCompletionNotes(task.getCompletionNotes());
        dto.setBlockerNotes(task.getBlockerNotes());
        dto.setTopicExplanation(task.getTopicExplanation());
        dto.setVideoUrl(task.getVideoUrl());
        dto.setCompletedAt(task.getCompletedAt());
        return dto;
    }
}
