package com.goalmind.repository;

import com.goalmind.model.ForecastRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ForecastRecordRepository extends JpaRepository<ForecastRecord, Long> {
    List<ForecastRecord> findByGoalIdOrderByForecastDateDesc(Long goalId);
    List<ForecastRecord> findByUserIdOrderByForecastDateDesc(Long userId);
    Optional<ForecastRecord> findFirstByGoalIdOrderByCreatedAtDesc(Long goalId);
}
