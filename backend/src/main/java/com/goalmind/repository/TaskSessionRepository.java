package com.goalmind.repository;

import com.goalmind.model.TaskSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskSessionRepository extends JpaRepository<TaskSession, Long> {
    List<TaskSession> findByTaskIdAndUserIdOrderByStartTimeDesc(Long taskId, Long userId);
    List<TaskSession> findByUserIdOrderByStartTimeDesc(Long userId);
    List<TaskSession> findByUserIdAndStartTimeBetween(Long userId, LocalDateTime start, LocalDateTime end);
    Optional<TaskSession> findFirstByTaskIdAndUserIdAndStatus(Long taskId, Long userId, String status);
    Optional<TaskSession> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(s.durationSeconds), 0) FROM TaskSession s WHERE s.user.id = :userId AND s.startTime >= :start AND s.startTime <= :end AND s.status = 'COMPLETED'")
    Long sumDurationSecondsByUserIdAndPeriod(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
