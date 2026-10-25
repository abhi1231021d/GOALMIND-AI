package com.goalmind.controller;

import com.goalmind.dto.ConsistencyAnalyticsResponse;
import com.goalmind.dto.DashboardAnalyticsResponse;
import com.goalmind.dto.ProgressAnalyticsResponse;
import com.goalmind.dto.TimeUsageResponse;
import com.goalmind.model.User;
import com.goalmind.service.AnalyticsService;
import com.goalmind.service.AuthService;
import com.goalmind.service.ConsistencyAnalysisEngine;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final ConsistencyAnalysisEngine consistencyEngine;
    private final AuthService authService;

    public AnalyticsController(AnalyticsService analyticsService,
                               ConsistencyAnalysisEngine consistencyEngine,
                               AuthService authService) {
        this.analyticsService = analyticsService;
        this.consistencyEngine = consistencyEngine;
        this.authService = authService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardAnalyticsResponse> getDashboardAnalytics() {
        User user = authService.getAuthenticatedUser();
        DashboardAnalyticsResponse response = analyticsService.getDashboardAnalytics(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/consistency")
    public ResponseEntity<ConsistencyAnalyticsResponse> getConsistencyAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "LAST_30_DAYS") String period) {
        User user = authService.getAuthenticatedUser();
        ConsistencyAnalyticsResponse response = consistencyEngine.analyze(user, startDate, endDate, period);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/progress")
    public ResponseEntity<ProgressAnalyticsResponse> getProgressAnalytics() {
        User user = authService.getAuthenticatedUser();
        ProgressAnalyticsResponse response = analyticsService.getProgressAnalytics(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/time-usage")
    public ResponseEntity<TimeUsageResponse> getTimeUsageAnalytics() {
        User user = authService.getAuthenticatedUser();
        TimeUsageResponse response = analyticsService.getTimeUsage(user);
        return ResponseEntity.ok(response);
    }
}
