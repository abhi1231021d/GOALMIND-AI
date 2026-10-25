package com.goalmind;

import com.goalmind.dto.MilestoneDto;
import com.goalmind.dto.RoadmapResponse;
import com.goalmind.dto.TaskDto;
import com.goalmind.model.Goal;
import com.goalmind.model.Milestone;
import com.goalmind.model.Task;
import com.goalmind.model.User;
import com.goalmind.repository.GoalRepository;
import com.goalmind.repository.MilestoneRepository;
import com.goalmind.repository.TaskRepository;
import com.goalmind.service.AiService;
import com.goalmind.service.MilestoneService;
import com.goalmind.service.RoadmapService;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RoadmapServiceTest {

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private MilestoneRepository milestoneRepository;

    @Mock
    private TaskRepository taskRepository;

    private AiService aiService;
    private MilestoneService milestoneService;
    private RoadmapService roadmapService;
    private User testUser;
    private Goal testGoal;

    @BeforeEach
    void setUp() {
        aiService = new AiService();
        milestoneService = new MilestoneService(milestoneRepository, goalRepository, taskRepository);
        roadmapService = new RoadmapService(goalRepository, milestoneRepository, taskRepository, aiService, milestoneService);

        testUser = new User("user@test.com", "pass", "User");
        testUser.setId(1L);

        testGoal = new Goal();
        testGoal.setId(10L);
        testGoal.setUser(testUser);
        testGoal.setTitle("Become a Java Developer");
        testGoal.setDescription("Study Java, OOP, Spring Boot");
        testGoal.setCurrentLevel("BEGINNER");
        testGoal.setStartDate(LocalDate.now());
        testGoal.setTargetDate(LocalDate.now().plusMonths(6));
        testGoal.setDailyHours(2.0);
        testGoal.setDaysPerWeek(6);
    }

    @Test
    void testGenerateRoadmapPreviewProducesTailoredPhases() {
        when(goalRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(testGoal));

        RoadmapResponse preview = roadmapService.generateRoadmapPreview(testUser, 10L);

        assertNotNull(preview);
        assertEquals(10L, preview.getGoalId());
        assertTrue(preview.getTotalMilestones() >= 3);
        assertTrue(preview.getTotalTasks() >= 5);
        assertNotNull(preview.getMilestones().get(0).getTitle());
        assertNotNull(preview.getMilestones().get(0).getTasks());
    }

    @Test
    void testApplyRoadmapSavesMilestonesAndTasks() {
        when(goalRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(testGoal));
        when(milestoneRepository.findByGoalIdOrderByOrderIndexAsc(10L)).thenReturn(Collections.emptyList());

        Milestone savedMilestone = new Milestone();
        savedMilestone.setId(101L);
        savedMilestone.setGoal(testGoal);
        when(milestoneRepository.save(any(Milestone.class))).thenReturn(savedMilestone);

        Task savedTask = new Task();
        savedTask.setId(201L);
        savedTask.setGoal(testGoal);
        savedTask.setMilestone(savedMilestone);
        savedTask.setTitle("Syntax Practice");
        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        RoadmapResponse inputRoadmap = new RoadmapResponse();
        MilestoneDto mDto = new MilestoneDto();
        mDto.setTitle("Java Fundamentals");
        mDto.setEstimatedHours(20.0);
        TaskDto tDto = new TaskDto();
        tDto.setTitle("Syntax Practice");
        tDto.setEstimatedMinutes(60);
        mDto.setTasks(List.of(tDto));
        inputRoadmap.setMilestones(List.of(mDto));

        RoadmapResponse result = roadmapService.applyRoadmap(testUser, 10L, inputRoadmap);

        assertNotNull(result);
        assertEquals(1, result.getTotalMilestones());
        verify(milestoneRepository).save(any(Milestone.class));
        verify(taskRepository).save(any(Task.class));
    }
}
