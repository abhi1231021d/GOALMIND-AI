package com.goalmind;

import com.goalmind.dto.FeasibilityCheckResponse;
import com.goalmind.dto.GoalRequest;
import com.goalmind.dto.GoalResponse;
import com.goalmind.exception.BadRequestException;
import com.goalmind.exception.ResourceNotFoundException;
import com.goalmind.model.Goal;
import com.goalmind.model.User;
import com.goalmind.repository.GoalRepository;
import com.goalmind.repository.MilestoneRepository;
import com.goalmind.repository.TaskRepository;
import com.goalmind.service.GoalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GoalServiceTest {

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private MilestoneRepository milestoneRepository;

    @Mock
    private TaskRepository taskRepository;

    private GoalService goalService;
    private User testUser;

    @BeforeEach
    void setUp() {
        goalService = new GoalService(goalRepository, milestoneRepository, taskRepository);
        testUser = new User("user@test.com", "pass", "Test User");
        testUser.setId(10L);
    }

    @Test
    void testFeasibilityAnalysisFeasibleGoal() {
        GoalRequest req = new GoalRequest();
        req.setTitle("Master Java 21");
        req.setCategory("CAREER");
        req.setCurrentLevel("INTERMEDIATE");
        req.setDifficulty("MODERATE");
        req.setStartDate(LocalDate.now());
        req.setTargetDate(LocalDate.now().plusMonths(6)); // 180 days
        req.setDailyHours(2.5);
        req.setDaysPerWeek(6);

        FeasibilityCheckResponse res = goalService.checkFeasibility(req);

        assertNotNull(res);
        assertTrue(res.getStatus().equals("FEASIBLE") || res.getStatus().equals("CHALLENGING"));
        assertTrue(res.getAvailableWorkingHours() > 300.0);
        assertTrue(res.getEstimatedWorkloadHours() > 0);
    }

    @Test
    void testFeasibilityAnalysisUnrealisticGoal() {
        GoalRequest req = new GoalRequest();
        req.setTitle("Master Complex Distributed Systems from scratch");
        req.setCategory("CAREER");
        req.setCurrentLevel("BEGINNER");
        req.setDifficulty("HARD");
        req.setStartDate(LocalDate.now());
        req.setTargetDate(LocalDate.now().plusDays(5)); // Only 5 days!
        req.setDailyHours(1.0);
        req.setDaysPerWeek(4);

        FeasibilityCheckResponse res = goalService.checkFeasibility(req);

        assertNotNull(res);
        assertEquals("UNREALISTIC", res.getStatus());
        assertTrue(res.getCapacityUtilizationRatio() > 1.15);
    }

    @Test
    void testCreateGoalInvalidDatesThrowsException() {
        GoalRequest req = new GoalRequest();
        req.setTitle("Invalid Goal");
        req.setStartDate(LocalDate.now());
        req.setTargetDate(LocalDate.now().minusDays(10)); // target before start!

        assertThrows(BadRequestException.class, () -> goalService.createGoal(testUser, req));
    }

    @Test
    void testUserDataIsolationGoalNotFoundForOtherUser() {
        // Goal owned by user 99, queried by user 10
        when(goalRepository.findByIdAndUserId(50L, 10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> goalService.getGoalById(testUser, 50L));
    }
}
