package com.goalmind.service;

import com.goalmind.dto.FinishSessionRequest;
import com.goalmind.dto.StartSessionRequest;
import com.goalmind.dto.TaskSessionDto;
import com.goalmind.exception.ResourceNotFoundException;
import com.goalmind.model.Task;
import com.goalmind.model.TaskSession;
import com.goalmind.model.User;
import com.goalmind.repository.TaskRepository;
import com.goalmind.repository.TaskSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskSessionService {

    private final TaskSessionRepository taskSessionRepository;
    private final TaskRepository taskRepository;

    public TaskSessionService(TaskSessionRepository taskSessionRepository,
                              TaskRepository taskRepository) {
        this.taskSessionRepository = taskSessionRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional
    public TaskSessionDto startSession(User user, Long taskId, StartSessionRequest request) {
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        // If there's an existing active session for this task, finish or pause it
        taskSessionRepository.findFirstByTaskIdAndUserIdAndStatus(taskId, user.getId(), "RUNNING")
                .ifPresent(existing -> {
                    existing.setStatus("PAUSED");
                    taskSessionRepository.save(existing);
                });

        TaskSession session = new TaskSession();
        session.setTask(task);
        session.setUser(user);
        session.setStartTime(LocalDateTime.now());
        session.setStatus("RUNNING");
        session.setDurationSeconds(0L);
        session.setNotes(request != null ? request.getNotes() : null);

        // Transition task to IN_PROGRESS if PENDING
        if ("PENDING".equalsIgnoreCase(task.getStatus())) {
            task.setStatus("IN_PROGRESS");
            taskRepository.save(task);
        }

        TaskSession saved = taskSessionRepository.save(session);
        return mapSessionToDto(saved);
    }

    @Transactional
    public TaskSessionDto pauseSession(User user, Long taskId, Long sessionId) {
        TaskSession session = taskSessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task session not found with ID: " + sessionId));

        if ("RUNNING".equalsIgnoreCase(session.getStatus())) {
            LocalDateTime now = LocalDateTime.now();
            long additionalSeconds = Duration.between(session.getStartTime(), now).getSeconds();
            session.setDurationSeconds(session.getDurationSeconds() + Math.max(0, additionalSeconds));
            session.setStatus("PAUSED");
            session = taskSessionRepository.save(session);
        }

        return mapSessionToDto(session);
    }

    @Transactional
    public TaskSessionDto resumeSession(User user, Long taskId, Long sessionId) {
        TaskSession session = taskSessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task session not found with ID: " + sessionId));

        if ("PAUSED".equalsIgnoreCase(session.getStatus())) {
            session.setStartTime(LocalDateTime.now());
            session.setStatus("RUNNING");
            session = taskSessionRepository.save(session);
        }

        return mapSessionToDto(session);
    }

    @Transactional
    public TaskSessionDto finishSession(User user, Long taskId, Long sessionId, FinishSessionRequest request) {
        TaskSession session = taskSessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task session not found with ID: " + sessionId));

        Task task = session.getTask();

        long finalDurationSeconds = 0L;
        if (request != null && request.getDurationSeconds() != null && request.getDurationSeconds() > 0) {
            finalDurationSeconds = request.getDurationSeconds();
        } else if ("RUNNING".equalsIgnoreCase(session.getStatus())) {
            long delta = Duration.between(session.getStartTime(), LocalDateTime.now()).getSeconds();
            finalDurationSeconds = session.getDurationSeconds() + Math.max(0, delta);
        } else {
            finalDurationSeconds = session.getDurationSeconds();
        }

        session.setDurationSeconds(finalDurationSeconds);
        session.setEndTime(LocalDateTime.now());
        session.setStatus("COMPLETED");

        if (request != null && request.getNotes() != null) {
            session.setNotes(request.getNotes());
        }

        TaskSession savedSession = taskSessionRepository.save(session);

        // Update task actual minutes: add recorded focused minutes
        int additionalMinutes = (int) Math.ceil(finalDurationSeconds / 60.0);
        task.setActualMinutes(task.getActualMinutes() + additionalMinutes);

        if (request != null) {
            if (Boolean.TRUE.equals(request.getMarkTaskComplete())) {
                task.setStatus("COMPLETED");
                task.setCompletedAt(LocalDateTime.now());
            } else if (Boolean.TRUE.equals(request.getMarkTaskPartiallyComplete())) {
                task.setStatus("PARTIALLY_COMPLETED");
            }

            if (request.getBlockerNotes() != null && !request.getBlockerNotes().isBlank()) {
                task.setBlockerNotes(request.getBlockerNotes());
            }
        }

        taskRepository.save(task);
        return mapSessionToDto(savedSession);
    }

    public List<TaskSessionDto> getTaskSessions(User user, Long taskId) {
        taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        List<TaskSession> sessions = taskSessionRepository.findByTaskIdAndUserIdOrderByStartTimeDesc(taskId, user.getId());
        return sessions.stream().map(this::mapSessionToDto).toList();
    }

    private TaskSessionDto mapSessionToDto(TaskSession s) {
        TaskSessionDto dto = new TaskSessionDto();
        dto.setId(s.getId());
        dto.setTaskId(s.getTask().getId());
        dto.setTaskTitle(s.getTask().getTitle());
        dto.setStartTime(s.getStartTime());
        dto.setEndTime(s.getEndTime());
        dto.setDurationSeconds(s.getDurationSeconds());
        dto.setStatus(s.getStatus());
        dto.setNotes(s.getNotes());
        return dto;
    }
}
