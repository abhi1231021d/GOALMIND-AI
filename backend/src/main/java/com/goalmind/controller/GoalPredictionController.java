package com.goalmind.controller;

import com.goalmind.dto.GoalForecastResponse;
import com.goalmind.model.ForecastRecord;
import com.goalmind.model.User;
import com.goalmind.repository.ForecastRecordRepository;
import com.goalmind.service.AuthService;
import com.goalmind.service.GoalPredictionEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/goals/{goalId}/forecast")
public class GoalPredictionController {

    private final GoalPredictionEngine predictionEngine;
    private final ForecastRecordRepository forecastRecordRepository;
    private final AuthService authService;

    public GoalPredictionController(GoalPredictionEngine predictionEngine,
                                    ForecastRecordRepository forecastRecordRepository,
                                    AuthService authService) {
        this.predictionEngine = predictionEngine;
        this.forecastRecordRepository = forecastRecordRepository;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<GoalForecastResponse> getForecast(@PathVariable Long goalId) {
        User user = authService.getAuthenticatedUser();
        GoalForecastResponse response = predictionEngine.generateForecast(user, goalId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ForecastRecord>> getForecastHistory(@PathVariable Long goalId) {
        User user = authService.getAuthenticatedUser();
        List<ForecastRecord> records = forecastRecordRepository.findByGoalIdOrderByForecastDateDesc(goalId);
        return ResponseEntity.ok(records);
    }
}
