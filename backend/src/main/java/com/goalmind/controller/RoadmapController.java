package com.goalmind.controller;

import com.goalmind.dto.RoadmapResponse;
import com.goalmind.model.User;
import com.goalmind.service.AuthService;
import com.goalmind.service.RoadmapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goals/{goalId}/roadmap")
public class RoadmapController {

    private final RoadmapService roadmapService;
    private final AuthService authService;

    public RoadmapController(RoadmapService roadmapService, AuthService authService) {
        this.roadmapService = roadmapService;
        this.authService = authService;
    }

    @PostMapping("/generate")
    public ResponseEntity<RoadmapResponse> generateRoadmapPreview(@PathVariable Long goalId) {
        User user = authService.getAuthenticatedUser();
        RoadmapResponse response = roadmapService.generateRoadmapPreview(user, goalId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/apply")
    public ResponseEntity<RoadmapResponse> applyRoadmap(@PathVariable Long goalId, @RequestBody RoadmapResponse approvedRoadmap) {
        User user = authService.getAuthenticatedUser();
        RoadmapResponse response = roadmapService.applyRoadmap(user, goalId, approvedRoadmap);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<RoadmapResponse> getRoadmap(@PathVariable Long goalId) {
        User user = authService.getAuthenticatedUser();
        RoadmapResponse response = roadmapService.getGoalRoadmap(user, goalId);
        return ResponseEntity.ok(response);
    }
}
