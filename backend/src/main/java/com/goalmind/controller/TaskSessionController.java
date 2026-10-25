package com.goalmind.controller;

import com.goalmind.dto.FinishSessionRequest;
import com.goalmind.dto.StartSessionRequest;
import com.goalmind.dto.TaskSessionDto;
import com.goalmind.model.User;
import com.goalmind.service.AuthService;
import com.goalmind.service.TaskSessionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/sessions")
public class TaskSessionController {

    private final TaskSessionService taskSessionService;
    private final AuthService authService;

    public TaskSessionController(TaskSessionService taskSessionService, AuthService authService) {
        this.taskSessionService = taskSessionService;
        this.authService = authService;
    }

    @PostMapping("/start")
    public ResponseEntity<TaskSessionDto> startSession(@PathVariable Long taskId, @RequestBody(required = false) StartSessionRequest request) {
        User user = authService.getAuthenticatedUser();
        TaskSessionDto session = taskSessionService.startSession(user, taskId, request);
        return new ResponseEntity<>(session, HttpStatus.CREATED);
    }

    @PostMapping("/{sessionId}/pause")
    public ResponseEntity<TaskSessionDto> pauseSession(@PathVariable Long taskId, @PathVariable Long sessionId) {
        User user = authService.getAuthenticatedUser();
        TaskSessionDto session = taskSessionService.pauseSession(user, taskId, sessionId);
        return ResponseEntity.ok(session);
    }

    @PostMapping("/{sessionId}/resume")
    public ResponseEntity<TaskSessionDto> resumeSession(@PathVariable Long taskId, @PathVariable Long sessionId) {
        User user = authService.getAuthenticatedUser();
        TaskSessionDto session = taskSessionService.resumeSession(user, taskId, sessionId);
        return ResponseEntity.ok(session);
    }

    @PostMapping("/{sessionId}/finish")
    public ResponseEntity<TaskSessionDto> finishSession(@PathVariable Long taskId, @PathVariable Long sessionId, @RequestBody(required = false) FinishSessionRequest request) {
        User user = authService.getAuthenticatedUser();
        TaskSessionDto session = taskSessionService.finishSession(user, taskId, sessionId, request);
        return ResponseEntity.ok(session);
    }

    @GetMapping
    public ResponseEntity<List<TaskSessionDto>> getTaskSessions(@PathVariable Long taskId) {
        User user = authService.getAuthenticatedUser();
        List<TaskSessionDto> sessions = taskSessionService.getTaskSessions(user, taskId);
        return ResponseEntity.ok(sessions);
    }
}
