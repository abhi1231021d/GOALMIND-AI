package com.goalmind;

import com.goalmind.dto.FinishSessionRequest;
import com.goalmind.dto.StartSessionRequest;
import com.goalmind.dto.TaskSessionDto;
import com.goalmind.model.Task;
import com.goalmind.model.TaskSession;
import com.goalmind.model.User;
import com.goalmind.repository.TaskRepository;
import com.goalmind.repository.TaskSessionRepository;
import com.goalmind.service.TaskSessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TaskSessionTest {

    @Mock
    private TaskSessionRepository taskSessionRepository;

    @Mock
    private TaskRepository taskRepository;

    private TaskSessionService service;
    private User testUser;
    private Task testTask;

    @BeforeEach
    void setUp() {
        service = new TaskSessionService(taskSessionRepository, taskRepository);
        testUser = new User("user@test.com", "pass", "User");
        testUser.setId(1L);

        testTask = new Task();
        testTask.setId(5L);
        testTask.setTitle("Implement JPA Mapping");
        testTask.setStatus("PENDING");
        testTask.setActualMinutes(0);
    }

    @Test
    void testStartSessionTransitionsTaskToInProgress() {
        when(taskRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(testTask));
        when(taskSessionRepository.findFirstByTaskIdAndUserIdAndStatus(5L, 1L, "RUNNING")).thenReturn(Optional.empty());

        TaskSession session = new TaskSession();
        session.setId(20L);
        session.setTask(testTask);
        session.setStartTime(LocalDateTime.now());
        session.setStatus("RUNNING");
        when(taskSessionRepository.save(any(TaskSession.class))).thenReturn(session);

        TaskSessionDto dto = service.startSession(testUser, 5L, new StartSessionRequest());

        assertNotNull(dto);
        assertEquals("RUNNING", dto.getStatus());
        assertEquals("IN_PROGRESS", testTask.getStatus());
        verify(taskRepository).save(testTask);
    }

    @Test
    void testFinishSessionAddsMinutesWithoutMarkingCompleteUnlessExplicit() {
        TaskSession session = new TaskSession();
        session.setId(20L);
        session.setTask(testTask);
        session.setStartTime(LocalDateTime.now().minusMinutes(25));
        session.setStatus("RUNNING");
        session.setDurationSeconds(0L);

        when(taskSessionRepository.findByIdAndUserId(20L, 1L)).thenReturn(Optional.of(session));
        when(taskSessionRepository.save(any(TaskSession.class))).thenReturn(session);

        FinishSessionRequest finishReq = new FinishSessionRequest();
        finishReq.setDurationSeconds(1500L); // 25 mins
        finishReq.setMarkTaskComplete(false); // User did NOT mark complete

        service.finishSession(testUser, 5L, 20L, finishReq);

        assertEquals(25, testTask.getActualMinutes());
        assertNotEquals("COMPLETED", testTask.getStatus()); // Does NOT automatically complete
        verify(taskRepository).save(testTask);
    }
}
