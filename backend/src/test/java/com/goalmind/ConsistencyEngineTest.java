package com.goalmind;

import com.goalmind.dto.ConsistencyAnalyticsResponse;
import com.goalmind.model.Task;
import com.goalmind.model.TaskSession;
import com.goalmind.model.User;
import com.goalmind.model.UserPreference;
import com.goalmind.repository.TaskRepository;
import com.goalmind.repository.TaskSessionRepository;
import com.goalmind.repository.UserPreferenceRepository;
import com.goalmind.service.ConsistencyAnalysisEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ConsistencyEngineTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TaskSessionRepository taskSessionRepository;

    @Mock
    private UserPreferenceRepository userPreferenceRepository;

    private ConsistencyAnalysisEngine engine;
    private User testUser;

    @BeforeEach
    void setUp() {
        engine = new ConsistencyAnalysisEngine(taskRepository, taskSessionRepository, userPreferenceRepository);
        testUser = new User("tester@example.com", "pass", "Tester");
        testUser.setId(1L);

        UserPreference pref = new UserPreference(testUser);
        pref.setMeaningfulProgressThresholdMinutes(30);
        when(userPreferenceRepository.findByUserId(1L)).thenReturn(Optional.of(pref));
    }

    @Test
    void testFormulasWithZeroDenominator() {
        LocalDate start = LocalDate.now().minusDays(6);
        LocalDate end = LocalDate.now();

        when(taskRepository.findByUserIdAndDueDateBetweenOrderByDueDateAsc(eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());
        when(taskSessionRepository.findByUserIdAndStartTimeBetween(eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());

        ConsistencyAnalyticsResponse res = engine.analyze(testUser, start, end, "LAST_7_DAYS");

        assertNotNull(res);
        assertDoesNotThrow(() -> res.getConsistencyRate());
        assertEquals(0.0, res.getTaskCompletionRate());
        assertEquals(0.0, res.getTimeUtilizationRate());
    }

    @Test
    void testConsistencyAndCompletionFormulas() {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(4); // 5 days window

        List<Task> tasks = new ArrayList<>();
        Task t1 = new Task();
        t1.setDueDate(today.minusDays(1));
        t1.setEstimatedMinutes(60);
        t1.setStatus("COMPLETED");
        tasks.add(t1);

        Task t2 = new Task();
        t2.setDueDate(today.minusDays(1));
        t2.setEstimatedMinutes(60);
        t2.setStatus("PENDING");
        tasks.add(t2);

        when(taskRepository.findByUserIdAndDueDateBetweenOrderByDueDateAsc(eq(1L), any(), any()))
                .thenReturn(tasks);

        List<TaskSession> sessions = new ArrayList<>();
        TaskSession s1 = new TaskSession();
        s1.setStartTime(LocalDateTime.now().minusDays(1));
        s1.setDurationSeconds(2400L); // 40 minutes (above 30 min threshold)
        sessions.add(s1);

        when(taskSessionRepository.findByUserIdAndStartTimeBetween(eq(1L), any(), any()))
                .thenReturn(sessions);

        ConsistencyAnalyticsResponse res = engine.analyze(testUser, start, today, "CUSTOM");

        assertNotNull(res);
        // Completed 1 out of 2 tasks -> 50.0% completion rate
        assertEquals(50.0, res.getTaskCompletionRate());
        // 40 minutes logged against 120 planned minutes -> 33.3% utilization
        assertEquals(33.3, res.getTimeUtilizationRate());
        assertTrue(res.getMeaningfulProgressDays() >= 1);
        assertNotNull(res.getWrittenExplanation());
    }
}
