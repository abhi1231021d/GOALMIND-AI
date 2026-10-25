package com.goalmind.repository;

import com.goalmind.model.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByGoalIdOrderByOrderIndexAsc(Long goalId);
    Optional<Milestone> findByIdAndGoalUserId(Long id, Long userId);
    List<Milestone> findByGoalUserIdAndStatus(Long userId, String status);
    long countByGoalId(Long goalId);
    long countByGoalIdAndStatus(Long goalId, String status);
}
