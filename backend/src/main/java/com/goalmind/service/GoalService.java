package com.goalmind.service;

import com.goalmind.dto.*;
import com.goalmind.exception.BadRequestException;
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

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final MilestoneRepository milestoneRepository;
    private final TaskRepository taskRepository;

    public GoalService(GoalRepository goalRepository,
                       MilestoneRepository milestoneRepository,
                       TaskRepository taskRepository) {
        this.goalRepository = goalRepository;
        this.milestoneRepository = milestoneRepository;
        this.taskRepository = taskRepository;
    }

    public FeasibilityCheckResponse checkFeasibility(GoalRequest request) {
        if (request.getStartDate() == null) {
            request.setStartDate(LocalDate.now());
        }
        if (request.getTargetDate() == null || !request.getTargetDate().isAfter(request.getStartDate())) {
            request.setTargetDate(request.getStartDate().plusMonths(3));
        }

        long totalDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getTargetDate());
        if (totalDays <= 0) totalDays = 1;

        double workingDaysRatio = (double) request.getDaysPerWeek() / 7.0;
        double availableWorkingDays = totalDays * workingDaysRatio;
        double availableWorkingHours = availableWorkingDays * request.getDailyHours();

        // Baseline workload estimation based on difficulty and level
        double baselineHours;
        switch (request.getDifficulty().toUpperCase()) {
            case "EASY" -> baselineHours = 80.0;
            case "CHALLENGING" -> baselineHours = 350.0;
            case "HARD" -> baselineHours = 600.0;
            default -> baselineHours = 200.0; // MODERATE
        }

        // Adjust for current level
        if ("ADVANCED".equalsIgnoreCase(request.getCurrentLevel())) {
            baselineHours *= 0.75;
        } else if ("BEGINNER".equalsIgnoreCase(request.getCurrentLevel())) {
            baselineHours *= 1.25;
        }

        double ratio = baselineHours / Math.max(1.0, availableWorkingHours);

        FeasibilityCheckResponse response = new FeasibilityCheckResponse();
        response.setEstimatedWorkloadHours(Math.round(baselineHours * 10.0) / 10.0);
        response.setAvailableWorkingHours(Math.round(availableWorkingHours * 10.0) / 10.0);
        response.setCapacityUtilizationRatio(Math.round(ratio * 100.0) / 100.0);

        List<String> constraints = new ArrayList<>();
        List<String> risks = new ArrayList<>();
        List<String> adjustments = new ArrayList<>();

        constraints.add(String.format("Available: %.1f total days, working %d days/week at %.1f hrs/day.", (double) totalDays, request.getDaysPerWeek(), request.getDailyHours()));
        constraints.add(String.format("Target deadline: %s.", request.getTargetDate()));

        if (ratio <= 0.70) {
            response.setStatus("FEASIBLE");
            response.setSummaryMessage("The goal is realistic and well-dimensioned with healthy buffer capacity for unforeseen delays.");
            adjustments.add("Maintain consistent daily tracking to prevent procrastination complacency.");
        } else if (ratio <= 0.90) {
            response.setStatus("CHALLENGING");
            response.setSummaryMessage("The goal is achievable, but requires consistent adherence with limited margin for missed sessions.");
            risks.add("Missing more than 2-3 sessions per month will create schedule slippage.");
            adjustments.add("Consider increasing daily time by 30 minutes to create a safety margin.");
        } else if (ratio <= 1.15) {
            response.setStatus("AT_RISK");
            response.setSummaryMessage("Estimated effort exceeds comfortable capacity. There is significant risk of schedule compression.");
            risks.add("Burnout risk from overly demanding schedule.");
            risks.add("Insufficient buffer for complex topics.");
            adjustments.add("Extend target completion date by 3 to 5 weeks.");
            adjustments.add("Narrow the initial scope to core essentials.");
        } else {
            response.setStatus("UNREALISTIC");
            response.setSummaryMessage("The planned timeline is mathematically insufficient for the target outcome and difficulty level.");
            risks.add("High probability of abandoned goal due to unrealistic daily requirements.");
            adjustments.add(String.format("Extend deadline by at least %d days.", (int) (baselineHours / (request.getDailyHours() * workingDaysRatio) - totalDays)));
            adjustments.add("Break into smaller multi-phase sub-goals.");
        }

        response.setConstraints(constraints);
        response.setPotentialRisks(risks);
        response.setSuggestedAdjustments(adjustments);
        return response;
    }

    @Transactional
    public GoalResponse createGoal(User user, GoalRequest request) {
        if (request.getStartDate() == null) {
            request.setStartDate(LocalDate.now());
        }
        if (request.getTargetDate() == null || !request.getTargetDate().isAfter(request.getStartDate())) {
            request.setTargetDate(request.getStartDate().plusMonths(3));
        }

        Goal goal = new Goal();
        goal.setUser(user);
        mapRequestToGoal(request, goal);

        Goal savedGoal = goalRepository.save(goal);
        return mapGoalToResponse(savedGoal);
    }

    public List<GoalResponse> getUserGoals(User user) {
        List<Goal> goals = goalRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return goals.stream().map(this::mapGoalToResponse).toList();
    }

    public GoalResponse getGoalById(User user, Long goalId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));
        return mapGoalToResponse(goal);
    }

    @Transactional
    public GoalResponse updateGoal(User user, Long goalId, GoalRequest request) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        mapRequestToGoal(request, goal);
        Goal updatedGoal = goalRepository.save(goal);
        return mapGoalToResponse(updatedGoal);
    }

    @Transactional
    public void deleteGoal(User user, Long goalId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));
        goalRepository.delete(goal);
    }

    private void mapRequestToGoal(GoalRequest request, Goal goal) {
        goal.setTitle(request.getTitle().trim());
        goal.setDescription(request.getDescription());
        goal.setCategory(request.getCategory());
        goal.setCurrentLevel(request.getCurrentLevel());
        goal.setTargetOutcome(request.getTargetOutcome());
        goal.setStartDate(request.getStartDate());
        goal.setTargetDate(request.getTargetDate());
        goal.setDailyHours(request.getDailyHours());
        goal.setDaysPerWeek(request.getDaysPerWeek());
        goal.setPriority(request.getPriority());
        goal.setDifficulty(request.getDifficulty());
        goal.setReason(request.getReason());
        goal.setLearningStyle(request.getLearningStyle());
        if (request.getStatus() != null) {
            goal.setStatus(request.getStatus());
        }
    }

    public GoalResponse mapGoalToResponse(Goal goal) {
        GoalResponse response = new GoalResponse();
        response.setId(goal.getId());
        response.setTitle(goal.getTitle());
        response.setDescription(goal.getDescription());
        response.setCategory(goal.getCategory());
        response.setCurrentLevel(goal.getCurrentLevel());
        response.setTargetOutcome(goal.getTargetOutcome());
        response.setStartDate(goal.getStartDate());
        response.setTargetDate(goal.getTargetDate());
        response.setDailyHours(goal.getDailyHours());
        response.setDaysPerWeek(goal.getDaysPerWeek());
        response.setPriority(goal.getPriority());
        response.setDifficulty(goal.getDifficulty());
        response.setReason(goal.getReason());
        response.setLearningStyle(goal.getLearningStyle());
        response.setStatus(goal.getStatus());
        response.setCreatedAt(goal.getCreatedAt());
        response.setUpdatedAt(goal.getUpdatedAt());

        // Milestones
        List<Milestone> milestones = milestoneRepository.findByGoalIdOrderByOrderIndexAsc(goal.getId());
        response.setTotalMilestones(milestones.size());
        int completedMilestones = (int) milestones.stream().filter(m -> "COMPLETED".equalsIgnoreCase(m.getStatus())).count();
        response.setCompletedMilestones(completedMilestones);

        // Tasks
        List<Task> tasks = taskRepository.findByGoalIdOrderByDueDateAsc(goal.getId());
        response.setTotalTasks(tasks.size());
        int completedTasks = (int) tasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        response.setCompletedTasks(completedTasks);

        long totalEstimated = tasks.stream().mapToLong(Task::getEstimatedMinutes).sum();
        long totalActual = tasks.stream().mapToLong(Task::getActualMinutes).sum();
        response.setTotalEstimatedMinutes(totalEstimated);
        response.setTotalActualMinutes(totalActual);

        if (tasks.isEmpty()) {
            response.setProgressPercentage(0.0);
        } else {
            double pct = ((double) completedTasks / tasks.size()) * 100.0;
            response.setProgressPercentage(Math.round(pct * 10.0) / 10.0);
        }

        List<MilestoneDto> milestoneDtos = milestones.stream().map(m -> {
            MilestoneDto mDto = new MilestoneDto();
            mDto.setId(m.getId());
            mDto.setGoalId(goal.getId());
            mDto.setTitle(m.getTitle());
            mDto.setDescription(m.getDescription());
            mDto.setExpectedOutcome(m.getExpectedOutcome());
            mDto.setEstimatedHours(m.getEstimatedHours());
            mDto.setTargetDate(m.getTargetDate());
            mDto.setOrderIndex(m.getOrderIndex());
            mDto.setStatus(m.getStatus());
            mDto.setCompletionCriteria(m.getCompletionCriteria());
            return mDto;
        }).toList();

        response.setMilestones(milestoneDtos);
        return response;
    }
}
