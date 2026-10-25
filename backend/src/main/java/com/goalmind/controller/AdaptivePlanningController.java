package com.goalmind.controller;

import com.goalmind.dto.AcceptRecoveryPlanRequest;
import com.goalmind.dto.RecoveryPlanResponse;
import com.goalmind.model.User;
import com.goalmind.service.AdaptivePlanningEngine;
import com.goalmind.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/goals/{goalId}/adaptive")
public class AdaptivePlanningController {

    private final AdaptivePlanningEngine adaptivePlanningEngine;
    private final AuthService authService;

    public AdaptivePlanningController(AdaptivePlanningEngine adaptivePlanningEngine, AuthService authService) {
        this.adaptivePlanningEngine = adaptivePlanningEngine;
        this.authService = authService;
    }

    @GetMapping("/recovery-proposal")
    public ResponseEntity<RecoveryPlanResponse> getRecoveryProposal(@PathVariable Long goalId) {
        User user = authService.getAuthenticatedUser();
        RecoveryPlanResponse proposal = adaptivePlanningEngine.proposeRecoveryPlan(user, goalId);
        return ResponseEntity.ok(proposal);
    }

    @PostMapping("/apply")
    public ResponseEntity<Map<String, String>> applyRecoveryPlan(@PathVariable Long goalId, @RequestBody AcceptRecoveryPlanRequest request) {
        User user = authService.getAuthenticatedUser();
        adaptivePlanningEngine.applyRecoveryPlan(user, goalId, request);
        return ResponseEntity.ok(Map.of("message", "Recovery plan successfully applied. Tasks and deadlines have been updated."));
    }
}
