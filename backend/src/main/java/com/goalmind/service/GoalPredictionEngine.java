package com.goalmind.service;

import com.goalmind.dto.GoalForecastResponse;
import com.goalmind.exception.ResourceNotFoundException;
import com.goalmind.model.ForecastRecord;
import com.goalmind.model.Goal;
import com.goalmind.model.Task;
import com.goalmind.model.User;
import com.goalmind.repository.ForecastRecordRepository;
import com.goalmind.repository.GoalRepository;
import com.goalmind.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class GoalPredictionEngine {

    private final GoalRepository goalRepository;
    private final TaskRepository taskRepository;
    private final ForecastRecordRepository forecastRecordRepository;

    public GoalPredictionEngine(GoalRepository goalRepository,
                                TaskRepository taskRepository,
                                ForecastRecordRepository forecastRecordRepository) {
        this.goalRepository = goalRepository;
        this.taskRepository = taskRepository;
        this.forecastRecordRepository = forecastRecordRepository;
    }

    @Transactional
    public GoalForecastResponse generateForecast(User user, Long goalId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        List<Task> tasks = taskRepository.findByGoalIdOrderByDueDateAsc(goalId);

        GoalForecastResponse response = new GoalForecastResponse();
        response.setGoalId(goal.getId());
        response.setGoalTitle(goal.getTitle());
        response.setTargetDate(goal.getTargetDate());

        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate());
        response.setDaysRemaining(Math.max(0, daysRemaining));

        if (tasks.isEmpty()) {
            response.setStatus("INSUFFICIENT_DATA");
            response.setCurrentProgressPercentage(0.0);
            response.setTotalEstimatedHours(0.0);
            response.setCompletedHours(0.0);
            response.setRemainingHours(0.0);
            response.setAvailableCapacityHours(0.0);
            response.setRequiredDailyHours(0.0);
            response.setCurrentRealisticDailyPace(0.0);
            response.setDeadlineFeasible(true);
            response.setMainFactors(List.of("No tasks currently assigned to this goal.", "Generate a roadmap to establish workload metrics."));
            response.setRecommendedActions(List.of("Generate your initial AI roadmap.", "Review milestone completion criteria."));
            response.setDetailedDiagnosis("Forecasting model requires scheduled tasks and initial work sessions to calculate completion trajectory.");
            return response;
        }

        long totalEstMins = tasks.stream().mapToLong(Task::getEstimatedMinutes).sum();
        long completedMins = tasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()))
                .mapToLong(Task::getEstimatedMinutes).sum();
        long remainingMins = Math.max(0, totalEstMins - completedMins);

        double totalEstHours = Math.round((totalEstMins / 60.0) * 10.0) / 10.0;
        double completedHours = Math.round((completedMins / 60.0) * 10.0) / 10.0;
        double remainingHours = Math.round((remainingMins / 60.0) * 10.0) / 10.0;

        double progressPct = totalEstMins > 0 ? ((double) completedMins / totalEstMins) * 100.0 : 0.0;
        response.setCurrentProgressPercentage(Math.round(progressPct * 10.0) / 10.0);
        response.setTotalEstimatedHours(totalEstHours);
        response.setCompletedHours(completedHours);
        response.setRemainingHours(remainingHours);

        // Calculate available capacity: remaining days * (daysPerWeek / 7) * dailyHours
        double workingDaysRatio = (double) goal.getDaysPerWeek() / 7.0;
        double remainingWorkingDays = Math.max(1.0, (double) Math.max(1, daysRemaining) * workingDaysRatio);
        double availableCapacityHours = Math.round((remainingWorkingDays * goal.getDailyHours()) * 10.0) / 10.0;
        response.setAvailableCapacityHours(availableCapacityHours);

        // Required daily work to finish on time
        double requiredDailyHours = remainingWorkingDays > 0 ? (remainingHours / remainingWorkingDays) : remainingHours;
        response.setRequiredDailyHours(Math.round(requiredDailyHours * 10.0) / 10.0);

        // Historical completion velocity / efficiency factor
        long completedTaskCount = tasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        long overdueTaskCount = tasks.stream().filter(t -> "OVERDUE".equalsIgnoreCase(t.getStatus()) || (t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()) && !"COMPLETED".equalsIgnoreCase(t.getStatus()))).count();

        double velocityFactor = 1.0;
        if (completedTaskCount + overdueTaskCount > 0) {
            velocityFactor = (double) completedTaskCount / (completedTaskCount + overdueTaskCount);
            if (velocityFactor < 0.4) velocityFactor = 0.4;
        }

        double realisticDailyPace = Math.round((goal.getDailyHours() * velocityFactor) * 10.0) / 10.0;
        response.setCurrentRealisticDailyPace(realisticDailyPace);

        // Projected completion date
        double daysNeededAtPace = realisticDailyPace > 0 ? (remainingHours / (realisticDailyPace * workingDaysRatio)) : 30.0;
        LocalDate projectedDate = LocalDate.now().plusDays((long) Math.ceil(daysNeededAtPace));
        response.setProjectedCompletionDate(projectedDate);

        boolean feasible = !projectedDate.isAfter(goal.getTargetDate());
        response.setDeadlineFeasible(feasible);

        List<String> factors = new ArrayList<>();
        List<String> actions = new ArrayList<>();

        factors.add(String.format("Remaining workload: %.1f hours against %.1f hours of capacity.", remainingHours, availableCapacityHours));
        factors.add(String.format("Required daily focus: %.1f hours/day (planned capacity: %.1f hours/day).", requiredDailyHours, goal.getDailyHours()));

        if (overdueTaskCount > 0) {
            factors.add(String.format("%d overdue task(s) decelerating projected completion.", overdueTaskCount));
        }

        String forecastStatus;
        if (remainingHours <= 0) {
            forecastStatus = "ON_TRACK";
            response.setDetailedDiagnosis("All planned tasks have been completed. Milestone outcomes achieved!");
            actions.add("Conduct end-of-goal retrospective.");
        } else if (feasible && requiredDailyHours <= goal.getDailyHours() * 0.85) {
            forecastStatus = "ON_TRACK";
            response.setDetailedDiagnosis("Progress velocity is aligned with target deadline. Workload is comfortable.");
            actions.add("Maintain steady daily session habits.");
            actions.add("Begin previewing upcoming milestone tasks.");
        } else if (feasible || (requiredDailyHours <= goal.getDailyHours() * 1.15)) {
            forecastStatus = "NEEDS_ATTENTION";
            response.setDetailedDiagnosis("Schedule buffer is tight. Any missed sessions will push projected completion past the deadline.");
            actions.add("Protect high-priority work sessions from interruptions.");
            actions.add("Consider increasing daily session time by 30 minutes.");
        } else {
            forecastStatus = "AT_RISK";
            response.setDetailedDiagnosis("Workload exceeds remaining available capacity. Target deadline is likely to be missed without schedule adjustment.");
            actions.add("Initiate an Adaptive Recovery Plan to reschedule non-critical tasks.");
            actions.add("Extend target completion date by 2-3 weeks to avoid burnout.");
        }

        response.setStatus(forecastStatus);
        response.setMainFactors(factors);
        response.setRecommendedActions(actions);

        // Save forecast record for trend history
        ForecastRecord record = new ForecastRecord();
        record.setGoal(goal);
        record.setUser(user);
        record.setForecastDate(LocalDate.now());
        record.setStatus(forecastStatus);
        record.setRemainingWorkHours(remainingHours);
        record.setAvailableCapacityHours(availableCapacityHours);
        record.setRequiredDailyHours(requiredDailyHours);
        record.setProjectedCompletionDate(projectedDate);
        record.setDeadlineFeasible(feasible);
        record.setKeyFactors(String.join("; ", factors));
        record.setRecommendedActions(String.join("; ", actions));
        forecastRecordRepository.save(record);

        return response;
    }
}
