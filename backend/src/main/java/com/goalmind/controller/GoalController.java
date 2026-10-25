package com.goalmind.controller;

import com.goalmind.dto.FeasibilityCheckResponse;
import com.goalmind.dto.GoalRequest;
import com.goalmind.dto.GoalResponse;
import com.goalmind.model.User;
import com.goalmind.service.AuthService;
import com.goalmind.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;
    private final AuthService authService;

    public GoalController(GoalService goalService, AuthService authService) {
        this.goalService = goalService;
        this.authService = authService;
    }

    @PostMapping("/feasibility")
    public ResponseEntity<FeasibilityCheckResponse> checkFeasibility(@Valid @RequestBody GoalRequest request) {
        FeasibilityCheckResponse response = goalService.checkFeasibility(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(@Valid @RequestBody GoalRequest request) {
        User user = authService.getAuthenticatedUser();
        GoalResponse response = goalService.createGoal(user, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getUserGoals() {
        User user = authService.getAuthenticatedUser();
        List<GoalResponse> goals = goalService.getUserGoals(user);
        return ResponseEntity.ok(goals);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponse> getGoalById(@PathVariable Long id) {
        User user = authService.getAuthenticatedUser();
        GoalResponse goal = goalService.getGoalById(user, id);
        return ResponseEntity.ok(goal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> updateGoal(@PathVariable Long id, @Valid @RequestBody GoalRequest request) {
        User user = authService.getAuthenticatedUser();
        GoalResponse response = goalService.updateGoal(user, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteGoal(@PathVariable Long id) {
        User user = authService.getAuthenticatedUser();
        goalService.deleteGoal(user, id);
        return ResponseEntity.ok(Map.of("message", "Goal deleted successfully"));
    }
}
