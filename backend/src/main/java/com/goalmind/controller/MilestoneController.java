package com.goalmind.controller;

import com.goalmind.dto.MilestoneDto;
import com.goalmind.model.User;
import com.goalmind.service.AuthService;
import com.goalmind.service.MilestoneService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MilestoneController {

    private final MilestoneService milestoneService;
    private final AuthService authService;

    public MilestoneController(MilestoneService milestoneService, AuthService authService) {
        this.milestoneService = milestoneService;
        this.authService = authService;
    }

    @GetMapping("/goals/{goalId}/milestones")
    public ResponseEntity<List<MilestoneDto>> getMilestonesByGoal(@PathVariable Long goalId) {
        User user = authService.getAuthenticatedUser();
        List<MilestoneDto> list = milestoneService.getMilestonesByGoal(user, goalId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/goals/{goalId}/milestones")
    public ResponseEntity<MilestoneDto> createMilestone(@PathVariable Long goalId, @RequestBody MilestoneDto dto) {
        User user = authService.getAuthenticatedUser();
        MilestoneDto created = milestoneService.createMilestone(user, goalId, dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/milestones/{id}")
    public ResponseEntity<MilestoneDto> updateMilestoneStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = authService.getAuthenticatedUser();
        String status = body.getOrDefault("status", "IN_PROGRESS");
        MilestoneDto updated = milestoneService.updateMilestoneStatus(user, id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/milestones/{id}")
    public ResponseEntity<Map<String, String>> deleteMilestone(@PathVariable Long id) {
        User user = authService.getAuthenticatedUser();
        milestoneService.deleteMilestone(user, id);
        return ResponseEntity.ok(Map.of("message", "Milestone deleted successfully"));
    }
}
