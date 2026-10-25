package com.goalmind.service;

import com.goalmind.dto.MilestoneDto;
import com.goalmind.dto.RoadmapResponse;
import com.goalmind.dto.TaskDto;
import com.goalmind.exception.ResourceNotFoundException;
import com.goalmind.model.Goal;
import com.goalmind.model.Milestone;
import com.goalmind.model.Task;
import com.goalmind.model.User;
import com.goalmind.repository.GoalRepository;
import com.goalmind.repository.MilestoneRepository;
import com.goalmind.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class RoadmapService {

    private final GoalRepository goalRepository;
    private final MilestoneRepository milestoneRepository;
    private final TaskRepository taskRepository;
    private final AiService aiService;
    private final MilestoneService milestoneService;

    public RoadmapService(GoalRepository goalRepository,
                          MilestoneRepository milestoneRepository,
                          TaskRepository taskRepository,
                          AiService aiService,
                          MilestoneService milestoneService) {
        this.goalRepository = goalRepository;
        this.milestoneRepository = milestoneRepository;
        this.taskRepository = taskRepository;
        this.aiService = aiService;
        this.milestoneService = milestoneService;
    }

    public RoadmapResponse generateRoadmapPreview(User user, Long goalId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        return aiService.generateRoadmap(goal);
    }

    @Transactional
    public RoadmapResponse applyRoadmap(User user, Long goalId, RoadmapResponse approvedRoadmap) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        // Clear existing roadmap items for this goal if replacing
        List<Milestone> existingMilestones = milestoneRepository.findByGoalIdOrderByOrderIndexAsc(goalId);
        if (!existingMilestones.isEmpty()) {
            milestoneRepository.deleteAll(existingMilestones);
        }

        List<MilestoneDto> savedMilestoneDtos = new ArrayList<>();

        if (approvedRoadmap.getMilestones() != null) {
            int mIndex = 1;
            for (MilestoneDto mDto : approvedRoadmap.getMilestones()) {
                Milestone milestone = new Milestone();
                milestone.setGoal(goal);
                milestone.setTitle(mDto.getTitle());
                milestone.setDescription(mDto.getDescription());
                milestone.setExpectedOutcome(mDto.getExpectedOutcome());
                milestone.setEstimatedHours(mDto.getEstimatedHours() != null ? mDto.getEstimatedHours() : 20.0);
                milestone.setTargetDate(mDto.getTargetDate() != null ? mDto.getTargetDate() : goal.getTargetDate());
                milestone.setOrderIndex(mIndex++);
                milestone.setStatus("NOT_STARTED");
                milestone.setCompletionCriteria(mDto.getCompletionCriteria());

                Milestone savedMilestone = milestoneRepository.save(milestone);

                List<TaskDto> savedTaskDtos = new ArrayList<>();
                if (mDto.getTasks() != null) {
                    for (TaskDto tDto : mDto.getTasks()) {
                        Task task = new Task();
                        task.setGoal(goal);
                        task.setMilestone(savedMilestone);
                        task.setUser(user);
                        task.setTitle(tDto.getTitle());
                        task.setInstructions(tDto.getInstructions());
                        task.setEstimatedMinutes(tDto.getEstimatedMinutes() != null ? tDto.getEstimatedMinutes() : 60);
                        task.setActualMinutes(0);
                        task.setPriority(tDto.getPriority() != null ? tDto.getPriority() : "MEDIUM");
                        task.setDifficulty(tDto.getDifficulty() != null ? tDto.getDifficulty() : "MEDIUM");
                        task.setDueDate(tDto.getDueDate() != null ? tDto.getDueDate() : savedMilestone.getTargetDate());
                        task.setStatus("PENDING");
                        task.setCompletionCriteria(tDto.getCompletionCriteria());
                        task.setTopicExplanation(tDto.getTopicExplanation());
                        task.setVideoUrl(tDto.getVideoUrl());

                        Task savedTask = taskRepository.save(task);

                        TaskDto resultTDto = new TaskDto();
                        resultTDto.setId(savedTask.getId());
                        resultTDto.setGoalId(goal.getId());
                        resultTDto.setMilestoneId(savedMilestone.getId());
                        resultTDto.setMilestoneTitle(savedMilestone.getTitle());
                        resultTDto.setTitle(savedTask.getTitle());
                        resultTDto.setInstructions(savedTask.getInstructions());
                        resultTDto.setEstimatedMinutes(savedTask.getEstimatedMinutes());
                        resultTDto.setActualMinutes(savedTask.getActualMinutes());
                        resultTDto.setPriority(savedTask.getPriority());
                        resultTDto.setDifficulty(savedTask.getDifficulty());
                        resultTDto.setDueDate(savedTask.getDueDate());
                        resultTDto.setStatus(savedTask.getStatus());
                        resultTDto.setCompletionCriteria(savedTask.getCompletionCriteria());
                        resultTDto.setTopicExplanation(savedTask.getTopicExplanation());
                        resultTDto.setVideoUrl(savedTask.getVideoUrl());
                        savedTaskDtos.add(resultTDto);
                    }
                }

                MilestoneDto resultMDto = new MilestoneDto();
                resultMDto.setId(savedMilestone.getId());
                resultMDto.setGoalId(goal.getId());
                resultMDto.setTitle(savedMilestone.getTitle());
                resultMDto.setDescription(savedMilestone.getDescription());
                resultMDto.setExpectedOutcome(savedMilestone.getExpectedOutcome());
                resultMDto.setEstimatedHours(savedMilestone.getEstimatedHours());
                resultMDto.setTargetDate(savedMilestone.getTargetDate());
                resultMDto.setOrderIndex(savedMilestone.getOrderIndex());
                resultMDto.setStatus(savedMilestone.getStatus());
                resultMDto.setCompletionCriteria(savedMilestone.getCompletionCriteria());
                resultMDto.setTasks(savedTaskDtos);
                savedMilestoneDtos.add(resultMDto);
            }
        }

        RoadmapResponse response = new RoadmapResponse();
        response.setGoalId(goal.getId());
        response.setGoalTitle(goal.getTitle());
        response.setTargetOutcome(goal.getTargetOutcome());
        response.setTotalMilestones(savedMilestoneDtos.size());
        response.setTotalTasks(savedMilestoneDtos.stream().mapToInt(m -> m.getTasks().size()).sum());
        response.setMilestones(savedMilestoneDtos);
        response.setAiStrategySummary(approvedRoadmap.getAiStrategySummary() != null ? approvedRoadmap.getAiStrategySummary() : "Active Custom Roadmap");

        return response;
    }

    public RoadmapResponse getGoalRoadmap(User user, Long goalId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        List<MilestoneDto> milestoneDtos = milestoneService.getMilestonesByGoal(user, goalId);

        RoadmapResponse response = new RoadmapResponse();
        response.setGoalId(goal.getId());
        response.setGoalTitle(goal.getTitle());
        response.setTargetOutcome(goal.getTargetOutcome());
        response.setTotalMilestones(milestoneDtos.size());
        response.setTotalTasks(milestoneDtos.stream().mapToInt(m -> m.getTasks().size()).sum());
        response.setMilestones(milestoneDtos);
        response.setAiStrategySummary("Active Goal Roadmap");
        return response;
    }
}
