package com.goalmind.repository;

import com.goalmind.model.DailyReflection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyReflectionRepository extends JpaRepository<DailyReflection, Long> {
    Optional<DailyReflection> findByUserIdAndDate(Long userId, LocalDate date);
    List<DailyReflection> findByUserIdOrderByDateDesc(Long userId);
    List<DailyReflection> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate startDate, LocalDate endDate);
    Optional<DailyReflection> findByIdAndUserId(Long id, Long userId);
}
