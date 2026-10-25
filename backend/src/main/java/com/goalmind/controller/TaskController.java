package com.goalmind.controller;

import com.goalmind.dto.TaskDto;
import com.goalmind.dto.TaskRequest;
import com.goalmind.dto.TaskStatusUpdateRequest;
import com.goalmind.model.User;
import com.goalmind.service.AuthService;
import com.goalmind.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final AuthService authService;

    public TaskController(TaskService taskService, AuthService authService) {
        this.taskService = taskService;
        this.authService = authService;
    }

    @GetMapping("/today")
    public ResponseEntity<List<TaskDto>> getTodayTasks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = authService.getAuthenticatedUser();
        List<TaskDto> tasks = taskService.getTodayTasks(user, date);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping
    public ResponseEntity<List<TaskDto>> getTasks(
            @RequestParam(required = false) Long goalId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        User user = authService.getAuthenticatedUser();
        List<TaskDto> tasks = taskService.getUserTasks(user, goalId, status, fromDate, toDate);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id) {
        User user = authService.getAuthenticatedUser();
        TaskDto task = taskService.getTaskById(user, id);
        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskRequest request) {
        User user = authService.getAuthenticatedUser();
        TaskDto task = taskService.createTask(user, request);
        return new ResponseEntity<>(task, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        User user = authService.getAuthenticatedUser();
        TaskDto updated = taskService.updateTask(user, id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(@PathVariable Long id, @RequestBody TaskStatusUpdateRequest request) {
        User user = authService.getAuthenticatedUser();
        TaskDto updated = taskService.updateTaskStatus(user, id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable Long id) {
        User user = authService.getAuthenticatedUser();
        taskService.deleteTask(user, id);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
    }
}
