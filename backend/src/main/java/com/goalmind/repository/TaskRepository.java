package com.goalmind.repository;

import com.goalmind.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdOrderByDueDateAscPriorityDesc(Long userId);
    List<Task> findByUserIdAndDueDateOrderByPriorityDesc(Long userId, LocalDate dueDate);
    List<Task> findByUserIdAndDueDateBetweenOrderByDueDateAsc(Long userId, LocalDate startDate, LocalDate endDate);
    List<Task> findByGoalIdOrderByDueDateAsc(Long goalId);
    List<Task> findByGoalIdAndUserIdOrderByDueDateAsc(Long goalId, Long userId);
    List<Task> findByMilestoneIdOrderByDueDateAsc(Long milestoneId);
    Optional<Task> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, String status);
    long countByGoalId(Long goalId);
    long countByGoalIdAndStatus(Long goalId, String status);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.dueDate < :currentDate AND t.status != 'COMPLETED'")
    List<Task> findOverdueTasks(@Param("userId") Long userId, @Param("currentDate") LocalDate currentDate);

    @Query("SELECT COALESCE(SUM(t.estimatedMinutes), 0) FROM Task t WHERE t.user.id = :userId")
    Long sumEstimatedMinutesByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(t.actualMinutes), 0) FROM Task t WHERE t.user.id = :userId")
    Long sumActualMinutesByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(t.estimatedMinutes), 0) FROM Task t WHERE t.goal.id = :goalId")
    Long sumEstimatedMinutesByGoalId(@Param("goalId") Long goalId);

    @Query("SELECT COALESCE(SUM(t.actualMinutes), 0) FROM Task t WHERE t.goal.id = :goalId")
    Long sumActualMinutesByGoalId(@Param("goalId") Long goalId);

    @Query("SELECT COALESCE(SUM(t.actualMinutes), 0) FROM Task t WHERE t.goal.id = :goalId AND t.status = 'COMPLETED'")
    Long sumCompletedMinutesByGoalId(@Param("goalId") Long goalId);
}
