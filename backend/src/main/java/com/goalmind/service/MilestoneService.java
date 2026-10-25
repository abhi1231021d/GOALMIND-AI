package com.goalmind.service;

import com.goalmind.dto.MilestoneDto;
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

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final GoalRepository goalRepository;
    private final TaskRepository taskRepository;

    public MilestoneService(MilestoneRepository milestoneRepository,
                            GoalRepository goalRepository,
                            TaskRepository taskRepository) {
        this.milestoneRepository = milestoneRepository;
        this.goalRepository = goalRepository;
        this.taskRepository = taskRepository;
    }

    public List<MilestoneDto> getMilestonesByGoal(User user, Long goalId) {
        goalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        List<Milestone> milestones = milestoneRepository.findByGoalIdOrderByOrderIndexAsc(goalId);
        return milestones.stream().map(this::mapMilestoneToDto).toList();
    }

    @Transactional
    public MilestoneDto createMilestone(User user, Long goalId, MilestoneDto dto) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        Milestone milestone = new Milestone();
        milestone.setGoal(goal);
        milestone.setTitle(dto.getTitle());
        milestone.setDescription(dto.getDescription());
        milestone.setExpectedOutcome(dto.getExpectedOutcome());
        milestone.setEstimatedHours(dto.getEstimatedHours() != null ? dto.getEstimatedHours() : 20.0);
        milestone.setTargetDate(dto.getTargetDate() != null ? dto.getTargetDate() : goal.getTargetDate());
        milestone.setOrderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : 1);
        milestone.setStatus("NOT_STARTED");
        milestone.setCompletionCriteria(dto.getCompletionCriteria());

        Milestone saved = milestoneRepository.save(milestone);
        return mapMilestoneToDto(saved);
    }

    @Transactional
    public MilestoneDto updateMilestoneStatus(User user, Long milestoneId, String status) {
        Milestone milestone = milestoneRepository.findByIdAndGoalUserId(milestoneId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with ID: " + milestoneId));

        milestone.setStatus(status.toUpperCase());
        Milestone updated = milestoneRepository.save(milestone);
        return mapMilestoneToDto(updated);
    }

    @Transactional
    public void deleteMilestone(User user, Long milestoneId) {
        Milestone milestone = milestoneRepository.findByIdAndGoalUserId(milestoneId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with ID: " + milestoneId));
        milestoneRepository.delete(milestone);
    }

    public MilestoneDto mapMilestoneToDto(Milestone m) {
        MilestoneDto dto = new MilestoneDto();
        dto.setId(m.getId());
        dto.setGoalId(m.getGoal().getId());
        dto.setTitle(m.getTitle());
        dto.setDescription(m.getDescription());
        dto.setExpectedOutcome(m.getExpectedOutcome());
        dto.setEstimatedHours(m.getEstimatedHours());
        dto.setTargetDate(m.getTargetDate());
        dto.setOrderIndex(m.getOrderIndex());
        dto.setStatus(m.getStatus());
        dto.setCompletionCriteria(m.getCompletionCriteria());

        List<Task> tasks = taskRepository.findByMilestoneIdOrderByDueDateAsc(m.getId());
        List<TaskDto> taskDtos = tasks.stream().map(t -> {
            TaskDto tDto = new TaskDto();
            tDto.setId(t.getId());
            tDto.setGoalId(m.getGoal().getId());
            tDto.setMilestoneId(m.getId());
            tDto.setMilestoneTitle(m.getTitle());
            tDto.setTitle(t.getTitle());
            tDto.setInstructions(t.getInstructions());
            tDto.setEstimatedMinutes(t.getEstimatedMinutes());
            tDto.setActualMinutes(t.getActualMinutes());
            tDto.setPriority(t.getPriority());
            tDto.setDifficulty(t.getDifficulty());
            tDto.setDueDate(t.getDueDate());
            tDto.setStatus(t.getStatus());
            tDto.setDependencies(t.getDependencies());
            tDto.setCompletionCriteria(t.getCompletionCriteria());
            tDto.setCompletionNotes(t.getCompletionNotes());
            tDto.setBlockerNotes(t.getBlockerNotes());
            tDto.setCompletedAt(t.getCompletedAt());
            tDto.setTopicExplanation(t.getTopicExplanation());
            tDto.setVideoUrl(t.getVideoUrl());
            return tDto;
        }).toList();

        dto.setTasks(taskDtos);
        return dto;
    }
}
