package com.goalmind.controller;

import com.goalmind.dto.DailyReflectionRequest;
import com.goalmind.dto.DailyReflectionResponse;
import com.goalmind.model.User;
import com.goalmind.service.AuthService;
import com.goalmind.service.DailyReflectionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reflections")
public class DailyReflectionController {

    private final DailyReflectionService dailyReflectionService;
    private final AuthService authService;

    public DailyReflectionController(DailyReflectionService dailyReflectionService, AuthService authService) {
        this.dailyReflectionService = dailyReflectionService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<DailyReflectionResponse> saveReflection(@Valid @RequestBody DailyReflectionRequest request) {
        User user = authService.getAuthenticatedUser();
        DailyReflectionResponse response = dailyReflectionService.saveReflection(user, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/today")
    public ResponseEntity<DailyReflectionResponse> getTodayReflection(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = authService.getAuthenticatedUser();
        DailyReflectionResponse response = dailyReflectionService.getReflectionByDate(user, date);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DailyReflectionResponse>> getRecentReflections(
            @RequestParam(defaultValue = "30") int limit) {
        User user = authService.getAuthenticatedUser();
        List<DailyReflectionResponse> list = dailyReflectionService.getRecentReflections(user, limit);
        return ResponseEntity.ok(list);
    }
}
