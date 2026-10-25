package com.goalmind;

import com.goalmind.dto.AcceptRecoveryPlanRequest;
import com.goalmind.dto.RecoveryPlanResponse;
import com.goalmind.model.Goal;
import com.goalmind.model.Task;
import com.goalmind.model.User;
import com.goalmind.repository.GoalRepository;
import com.goalmind.repository.TaskRepository;
import com.goalmind.service.AdaptivePlanningEngine;
import com.goalmind.service.AiService;
import com.goalmind.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdaptivePlanningTest {

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private NotificationService notificationService;

    private AiService aiService;
    private AdaptivePlanningEngine engine;
    private User testUser;
    private Goal testGoal;

    @BeforeEach
    void setUp() {
        aiService = new AiService();
        engine = new AdaptivePlanningEngine(goalRepository, taskRepository, aiService, notificationService);

        testUser = new User("user@test.com", "pass", "User");
        testUser.setId(1L);

        testGoal = new Goal();
        testGoal.setId(10L);
        testGoal.setUser(testUser);
        testGoal.setTitle("Become a Java Developer");
        testGoal.setStartDate(LocalDate.now().minusDays(10));
        testGoal.setTargetDate(LocalDate.now().plusDays(20));
        testGoal.setDailyHours(2.0);
        testGoal.setDaysPerWeek(6);
    }

    @Test
    void testProposeRecoveryPlanWithOverdueTasksRequiresApproval() {
        when(goalRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(testGoal));

        Task overdueTask = new Task();
        overdueTask.setId(101L);
        overdueTask.setGoal(testGoal);
        overdueTask.setTitle("OOP Polymorphism Practice");
        overdueTask.setPriority("HIGH");
        overdueTask.setStatus("PENDING");
        overdueTask.setDueDate(LocalDate.now().minusDays(3)); // 3 days overdue!
        overdueTask.setEstimatedMinutes(120);

        when(taskRepository.findByGoalIdOrderByDueDateAsc(10L)).thenReturn(List.of(overdueTask));

        RecoveryPlanResponse proposal = engine.proposeRecoveryPlan(testUser, 10L);

        assertNotNull(proposal);
        assertTrue(proposal.getRequiresUserApproval());
        assertEquals(1, proposal.getUnfinishedTasksCount());
        assertFalse(proposal.getProposedTaskReschedules().isEmpty());
        assertEquals(101L, proposal.getProposedTaskReschedules().get(0).getTaskId());
    }

    @Test
    void testApplyRecoveryPlanUpdatesDueDatesAndNotifiesUser() {
        when(goalRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(testGoal));

        Task task = new Task();
        task.setId(101L);
        task.setStatus("OVERDUE");
        task.setDueDate(LocalDate.now().minusDays(2));

        when(taskRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(task));

        AcceptRecoveryPlanRequest req = new AcceptRecoveryPlanRequest();
        req.setNewTargetDate(LocalDate.now().plusDays(30));
        req.setReschedules(List.of(new AcceptRecoveryPlanRequest.RescheduleItem(101L, LocalDate.now().plusDays(2))));

        engine.applyRecoveryPlan(testUser, 10L, req);

        assertEquals(LocalDate.now().plusDays(2), task.getDueDate());
        assertEquals("PENDING", task.getStatus());
        verify(taskRepository).save(task);
        verify(goalRepository).save(testGoal);
        verify(notificationService).createNotification(eq(testUser), any(), any(), eq("PLANNING_REMINDER"), any());
    }
}
