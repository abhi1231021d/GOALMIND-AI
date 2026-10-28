package com.example.interview.repository;

import com.example.interview.model.InterviewSession;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    @Override
    @EntityGraph(attributePaths = {"questions"})
    Optional<InterviewSession> findById(Long id);

    @EntityGraph(attributePaths = {"questions"})
    List<InterviewSession> findTop20ByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"questions"})
    List<InterviewSession> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"questions"})
    List<InterviewSession> findTop20ByUserIdIsNullOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"questions"})
    List<InterviewSession> findTop5ByRoleIgnoreCaseAndIdNotOrderByCreatedAtDesc(String role, Long id);

    @EntityGraph(attributePaths = {"questions"})
    List<InterviewSession> findTop5ByRoleIgnoreCaseAndUserIdAndIdNotOrderByCreatedAtDesc(String role, Long userId, Long id);

    @Modifying
    @Transactional
    void deleteByUserId(Long userId);

    @Modifying
    @Transactional
    void deleteByUserIdIsNull();
}
