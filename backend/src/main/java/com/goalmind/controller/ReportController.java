package com.goalmind.controller;

import com.goalmind.dto.ReportResponse;
import com.goalmind.model.User;
import com.goalmind.service.AuthService;
import com.goalmind.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final AuthService authService;

    public ReportController(ReportService reportService, AuthService authService) {
        this.reportService = reportService;
        this.authService = authService;
    }

    @GetMapping("/weekly")
    public ResponseEntity<ReportResponse> getWeeklyReport(@RequestParam(required = false) Long goalId) {
        User user = authService.getAuthenticatedUser();
        ReportResponse report = reportService.generateWeeklyReport(user, goalId);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/monthly")
    public ResponseEntity<ReportResponse> getMonthlyReport(@RequestParam(required = false) Long goalId) {
        User user = authService.getAuthenticatedUser();
        ReportResponse report = reportService.generateMonthlyReport(user, goalId);
        return ResponseEntity.ok(report);
    }

    @GetMapping
    public ResponseEntity<List<ReportResponse>> getPastReports(@RequestParam(required = false) String reportType) {
        User user = authService.getAuthenticatedUser();
        List<ReportResponse> reports = reportService.getUserReports(user, reportType);
        return ResponseEntity.ok(reports);
    }
}
