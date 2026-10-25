package com.goalmind.repository;

import com.goalmind.model.PeriodicReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeriodicReportRepository extends JpaRepository<PeriodicReport, Long> {
    List<PeriodicReport> findByUserIdAndReportTypeOrderByPeriodStartDesc(Long userId, String reportType);
    List<PeriodicReport> findByUserIdOrderByPeriodStartDesc(Long userId);
    Optional<PeriodicReport> findByIdAndUserId(Long id, Long userId);
}
