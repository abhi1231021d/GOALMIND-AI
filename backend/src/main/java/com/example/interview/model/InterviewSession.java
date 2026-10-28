package com.example.interview.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
public class InterviewSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String role;
    private String experienceLevel;
    private String interviewType;
    private String mode = "standard";
    private String projectTitle;
    @Column(length = 4000)
    private String projectSummary;
    private String company;
    @Column(length = 1000)
    private String topics;
    private Instant createdAt = Instant.now();
    private Integer score;

    @Column(name = "user_id")
    private Long userId;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequenceNumber ASC")
    private List<InterviewQuestion> questions = new ArrayList<>();

    protected InterviewSession() {}
    public InterviewSession(String role, String experienceLevel, String interviewType, String topics,
                            String mode, String projectTitle, String projectSummary, String company) {
        this.role = role; this.experienceLevel = experienceLevel == null || experienceLevel.isBlank() ? "MID" : experienceLevel; this.interviewType = interviewType == null || interviewType.isBlank() ? "MIXED" : interviewType; this.topics = topics;
        this.mode = mode == null || mode.isBlank() ? "standard" : mode;
        this.projectTitle = projectTitle; this.projectSummary = projectSummary; this.company = company;
    }
    public void addQuestion(InterviewQuestion question) { questions.add(question); question.setSession(this); }
    public Long getId() { return id; }
    public String getRole() { return role; }
    public String getExperienceLevel() { return experienceLevel; }
    public String getInterviewType() { return interviewType; }
    public String getMode() { return mode; }
    public String getProjectTitle() { return projectTitle; }
    public String getProjectSummary() { return projectSummary; }
    public String getCompany() { return company; }
    public String getTopics() { return topics; }
    public Instant getCreatedAt() { return createdAt; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public List<InterviewQuestion> getQuestions() { return questions; }
}
