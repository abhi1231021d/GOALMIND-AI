package com.goalmind;

import com.goalmind.dto.GoalForecastResponse;
import com.goalmind.model.Goal;
import com.goalmind.model.Task;
import com.goalmind.model.User;
import com.goalmind.repository.ForecastRecordRepository;
import com.goalmind.repository.GoalRepository;
import com.goalmind.repository.TaskRepository;
import com.goalmind.service.GoalPredictionEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GoalPredictionEngineTest {

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ForecastRecordRepository forecastRecordRepository;

    private GoalPredictionEngine engine;
    private User testUser;
    private Goal testGoal;

    @BeforeEach
    void setUp() {
        engine = new GoalPredictionEngine(goalRepository, taskRepository, forecastRecordRepository);
        testUser = new User("user@test.com", "pass", "User");
        testUser.setId(1L);

        testGoal = new Goal();
        testGoal.setId(100L);
        testGoal.setUser(testUser);
        testGoal.setTitle("Learn Spring Boot");
        testGoal.setStartDate(LocalDate.now());
        testGoal.setTargetDate(LocalDate.now().plusDays(30)); // 30 days left
        testGoal.setDailyHours(2.0);
        testGoal.setDaysPerWeek(6);
    }

    @Test
    void testForecastEmptyTasksReturnsInsufficientData() {
        when(goalRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(testGoal));
        when(taskRepository.findByGoalIdOrderByDueDateAsc(100L)).thenReturn(Collections.emptyList());

        GoalForecastResponse res = engine.generateForecast(testUser, 100L);

        assertNotNull(res);
        assertEquals("INSUFFICIENT_DATA", res.getStatus());
    }

    @Test
    void testForecastOnTrackWhenWorkloadIsComfortablyWithinCapacity() {
        when(goalRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(testGoal));

        List<Task> tasks = new ArrayList<>();
        // 5 tasks of 60 mins each = 5 hours remaining workload, available capacity ~51 hours
        for (int i = 0; i < 5; i++) {
            Task t = new Task();
            t.setGoal(testGoal);
            t.setEstimatedMinutes(60);
            t.setStatus("PENDING");
            tasks.add(t);
        }

        when(taskRepository.findByGoalIdOrderByDueDateAsc(100L)).thenReturn(tasks);

        GoalForecastResponse res = engine.generateForecast(testUser, 100L);

        assertNotNull(res);
        assertEquals("ON_TRACK", res.getStatus());
        assertTrue(res.getDeadlineFeasible());
        assertTrue(res.getRequiredDailyHours() < testGoal.getDailyHours());
    }
}
