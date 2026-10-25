package com.goalmind.service;

import com.goalmind.dto.ConsistencyAnalyticsResponse;
import com.goalmind.model.Task;
import com.goalmind.model.TaskSession;
import com.goalmind.model.User;
import com.goalmind.model.UserPreference;
import com.goalmind.repository.TaskRepository;
import com.goalmind.repository.TaskSessionRepository;
import com.goalmind.repository.UserPreferenceRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class ConsistencyAnalysisEngine {

    private final TaskRepository taskRepository;
    private final TaskSessionRepository taskSessionRepository;
    private final UserPreferenceRepository userPreferenceRepository;

    public ConsistencyAnalysisEngine(TaskRepository taskRepository,
                                     TaskSessionRepository taskSessionRepository,
                                     UserPreferenceRepository userPreferenceRepository) {
        this.taskRepository = taskRepository;
        this.taskSessionRepository = taskSessionRepository;
        this.userPreferenceRepository = userPreferenceRepository;
    }

    public ConsistencyAnalyticsResponse analyze(User user, LocalDate startDate, LocalDate endDate, String periodName) {
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        LocalDate start = startDate != null ? startDate : end.minusDays(29); // default 30 days

        if (start.isAfter(end)) {
            LocalDate temp = start;
            start = end;
            end = temp;
        }

        UserPreference preference = userPreferenceRepository.findByUserId(user.getId())
                .orElse(new UserPreference(user));

        int thresholdMinutes = preference.getMeaningfulProgressThresholdMinutes() != null
                ? preference.getMeaningfulProgressThresholdMinutes() : 30;
        boolean requirePriorityTask = Boolean.TRUE.equals(preference.getMeaningfulTaskRequired());

        // Load tasks and sessions in window
        List<Task> tasksInWindow = taskRepository.findByUserIdAndDueDateBetweenOrderByDueDateAsc(user.getId(), start, end);
        LocalDateTime windowStart = LocalDateTime.of(start, LocalTime.MIN);
        LocalDateTime windowEnd = LocalDateTime.of(end, LocalTime.MAX);
        List<TaskSession> sessionsInWindow = taskSessionRepository.findByUserIdAndStartTimeBetween(user.getId(), windowStart, windowEnd);

        // Group tasks by dueDate
        Map<LocalDate, List<Task>> tasksByDate = new HashMap<>();
        for (Task t : tasksInWindow) {
            tasksByDate.computeIfAbsent(t.getDueDate(), k -> new ArrayList<>()).add(t);
        }

        // Group session duration by date
        Map<LocalDate, Long> secondsByDate = new HashMap<>();
        for (TaskSession s : sessionsInWindow) {
            LocalDate sessionDate = s.getStartTime().toLocalDate();
            secondsByDate.put(sessionDate, secondsByDate.getOrDefault(sessionDate, 0L) + s.getDurationSeconds());
        }

        List<ConsistencyAnalyticsResponse.DayActivityPoint> dayPoints = new ArrayList<>();
        int meaningfulDays = 0;
        int plannedWorkingDays = 0;
        int completedTasksCount = 0;
        int dueTasksCount = tasksInWindow.size();
        long totalFocusedMinutes = 0L;
        long totalPlannedMinutes = tasksInWindow.stream().mapToLong(Task::getEstimatedMinutes).sum();
        int missedSessions = 0;

        long totalDaysCount = ChronoUnit.DAYS.between(start, end) + 1;

        for (int i = 0; i < totalDaysCount; i++) {
            LocalDate date = start.plusDays(i);
            DayOfWeek dow = date.getDayOfWeek();
            boolean isWeekend = (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY);

            List<Task> dayTasks = tasksByDate.getOrDefault(date, Collections.emptyList());
            long dayDurationSec = secondsByDate.getOrDefault(date, 0L);
            int dayFocusedMins = (int) (dayDurationSec / 60);
            totalFocusedMinutes += dayFocusedMins;

            int dayCompleted = (int) dayTasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
            completedTasksCount += dayCompleted;

            boolean hasHighPriorityDone = dayTasks.stream()
                    .anyMatch(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()) && "HIGH".equalsIgnoreCase(t.getPriority()));

            // Determine if day is a planned working day
            boolean isPlannedWorkingDay = !dayTasks.isEmpty() || (!isWeekend);
            if (isPlannedWorkingDay) {
                plannedWorkingDays++;
            }

            // Determine if day had meaningful progress
            boolean isMeaningful = (dayFocusedMins >= thresholdMinutes) || (requirePriorityTask && hasHighPriorityDone) || (dayCompleted > 0 && !dayTasks.isEmpty());
            if (isMeaningful) {
                meaningfulDays++;
            } else if (isPlannedWorkingDay && date.isBefore(LocalDate.now())) {
                missedSessions++;
            }

            boolean isRestDay = !isPlannedWorkingDay;

            String dayOfWeekName = dow.getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            dayPoints.add(new ConsistencyAnalyticsResponse.DayActivityPoint(
                    date,
                    dayOfWeekName,
                    dayFocusedMins,
                    dayCompleted,
                    dayTasks.size(),
                    isMeaningful,
                    isRestDay
            ));
        }

        // Rates
        double consistencyRate = plannedWorkingDays > 0
                ? ((double) meaningfulDays / plannedWorkingDays) * 100.0
                : 0.0;

        double taskCompletionRate = dueTasksCount > 0
                ? ((double) completedTasksCount / dueTasksCount) * 100.0
                : 0.0;

        double timeUtilizationRate = totalPlannedMinutes > 0
                ? ((double) totalFocusedMinutes / totalPlannedMinutes) * 100.0
                : 0.0;

        double avgDailyMinutes = meaningfulDays > 0
                ? (double) totalFocusedMinutes / meaningfulDays
                : 0.0;

        // Calculate streaks
        int[] streaks = calculateStreaks(user.getId(), thresholdMinutes);

        ConsistencyAnalyticsResponse response = new ConsistencyAnalyticsResponse();
        response.setPeriod(periodName != null ? periodName : "LAST_30_DAYS");
        response.setStartDate(start);
        response.setEndDate(end);
        response.setMeaningfulProgressDays(meaningfulDays);
        response.setPlannedWorkingDays(plannedWorkingDays);
        response.setConsistencyRate(Math.round(consistencyRate * 10.0) / 10.0);
        response.setTaskCompletionRate(Math.round(taskCompletionRate * 10.0) / 10.0);
        response.setTimeUtilizationRate(Math.round(timeUtilizationRate * 10.0) / 10.0);
        response.setAverageDailyFocusedMinutes(Math.round(avgDailyMinutes * 10.0) / 10.0);
        response.setMissedWorkSessions(missedSessions);
        response.setCurrentStreakDays(streaks[0]);
        response.setLongestStreakDays(streaks[1]);
        response.setDailyActivity(dayPoints);

        // Written explanation
        response.setWrittenExplanation(buildWrittenExplanation(consistencyRate, taskCompletionRate, timeUtilizationRate, meaningfulDays, plannedWorkingDays, streaks[0]));

        return response;
    }

    private int[] calculateStreaks(Long userId, int thresholdMinutes) {
        // Look back 90 days to calculate active current streak and longest streak
        LocalDate today = LocalDate.now();
        LocalDate lookbackStart = today.minusDays(90);

        LocalDateTime start = LocalDateTime.of(lookbackStart, LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(today, LocalTime.MAX);
        List<TaskSession> sessions = taskSessionRepository.findByUserIdAndStartTimeBetween(userId, start, end);
        List<Task> tasks = taskRepository.findByUserIdAndDueDateBetweenOrderByDueDateAsc(userId, lookbackStart, today);

        Map<LocalDate, Long> secondsByDate = new HashMap<>();
        for (TaskSession s : sessions) {
            LocalDate d = s.getStartTime().toLocalDate();
            secondsByDate.put(d, secondsByDate.getOrDefault(d, 0L) + s.getDurationSeconds());
        }

        Map<LocalDate, Long> completedTasksByDate = new HashMap<>();
        for (Task t : tasks) {
            if ("COMPLETED".equalsIgnoreCase(t.getStatus())) {
                LocalDate d = t.getCompletedAt() != null ? t.getCompletedAt().toLocalDate() : t.getDueDate();
                completedTasksByDate.put(d, completedTasksByDate.getOrDefault(d, 0L) + 1);
            }
        }

        int currentStreak = 0;
        int longestStreak = 0;
        int tempStreak = 0;

        // Check backwards from today for current streak
        LocalDate checkDate = today;
        boolean checkTodayMeaningful = isDayMeaningful(checkDate, secondsByDate, completedTasksByDate, thresholdMinutes);

        // If today not yet completed, check starting from yesterday
        if (!checkTodayMeaningful) {
            checkDate = today.minusDays(1);
        }

        while (!checkDate.isBefore(lookbackStart)) {
            if (isDayMeaningful(checkDate, secondsByDate, completedTasksByDate, thresholdMinutes)) {
                currentStreak++;
                checkDate = checkDate.minusDays(1);
            } else {
                break;
            }
        }

        // Calculate longest streak chronologically
        for (LocalDate d = lookbackStart; !d.isAfter(today); d = d.plusDays(1)) {
            if (isDayMeaningful(d, secondsByDate, completedTasksByDate, thresholdMinutes)) {
                tempStreak++;
                if (tempStreak > longestStreak) {
                    longestStreak = tempStreak;
                }
            } else {
                tempStreak = 0;
            }
        }

        return new int[]{currentStreak, longestStreak};
    }

    private boolean isDayMeaningful(LocalDate date, Map<LocalDate, Long> seconds, Map<LocalDate, Long> completed, int threshold) {
        long sec = seconds.getOrDefault(date, 0L);
        long comp = completed.getOrDefault(date, 0L);
        return (sec / 60 >= threshold) || (comp > 0);
    }

    private String buildWrittenExplanation(double consistencyRate, double taskCompletionRate, double timeUtilizationRate, int meaningfulDays, int plannedDays, int streak) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("You logged meaningful progress on %d of %d planned days (Consistency Rate: %.1f%%). ",
                meaningfulDays, plannedDays, consistencyRate));

        if (consistencyRate >= 80.0) {
            sb.append("Your execution discipline is strong, with dependable habits formed. ");
        } else if (consistencyRate >= 60.0) {
            sb.append("Consistency is moderate; missed days are typically concentrated around mid-week or rest transitions. ");
        } else {
            sb.append("Execution is intermittent; narrowing daily scope or scheduling protected focus blocks will stabilize momentum. ");
        }

        sb.append(String.format("Task Completion Rate is %.1f%% with a Time Utilization of %.1f%%. ", taskCompletionRate, timeUtilizationRate));

        if (streak > 0) {
            sb.append(String.format("Active streak stands at %d consecutive days.", streak));
        } else {
            sb.append("Start a focus session today to re-ignite your active streak.");
        }

        return sb.toString();
    }
}
