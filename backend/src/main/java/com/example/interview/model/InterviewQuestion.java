package com.example.interview.model;

import jakarta.persistence.*;

@Entity
public class InterviewQuestion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int sequenceNumber;
    private String category;
    @Column(length = 2000, nullable = false)
    private String question;
    @Column(length = 10000)
    private String answer;
    private Integer score;
    @Column(length = 5000)
    private String feedback;
    @Column(length = 1000)
    private String learningConcept;
    @Column(length = 2000)
    private String learningExample;
    @Column(length = 1000)
    private String practiceQuestion;
    @Column(length = 1000)
    private String harderFollowUp;
    private String followUp;

    @Column(length = 6000)
    private String staffAnswer;
    @Column(length = 1500)
    private String elevatorPitch;
    @Column(length = 2000)
    private String conceptsCovered;
    @Column(length = 2000)
    private String conceptsMissed;
    private int hintsUsed = 0;
    @Column(length = 8000)
    private String clarificationsJson;
    @Column(length = 4000)
    private String telemetryJson;

    @ManyToOne(fetch = FetchType.LAZY)
    private InterviewSession session;

    protected InterviewQuestion() {}
    public InterviewQuestion(int sequenceNumber, String category, String question) {
        this.sequenceNumber = sequenceNumber; this.category = category; this.question = question;
    }
    public void setSession(InterviewSession session) { this.session = session; }
    public InterviewSession getSession() { return session; }
    public Long getId() { return id; }
    public int getSequenceNumber() { return sequenceNumber; }
    public String getQuestion() { return question; }
    public String getCategory() { return category; }
    public String getAnswer() { return answer; }
    public Integer getScore() { return score; }
    public String getFeedback() { return feedback; }
    public String getLearningConcept() { return learningConcept; }
    public String getLearningExample() { return learningExample; }
    public String getPracticeQuestion() { return practiceQuestion; }
    public String getHarderFollowUp() { return harderFollowUp; }
    public String getStaffAnswer() { return staffAnswer; }
    public String getElevatorPitch() { return elevatorPitch; }
    public String getConceptsCovered() { return conceptsCovered; }
    public String getConceptsMissed() { return conceptsMissed; }
    public int getHintsUsed() { return hintsUsed; }
    public String getClarificationsJson() { return clarificationsJson; }
    public String getTelemetryJson() { return telemetryJson; }
    public boolean isFollowUp() { return "true".equalsIgnoreCase(followUp) || "1".equals(followUp); }

    public void addLearning(String concept, String example, String practice, String harder) {
        this.learningConcept = concept; this.learningExample = example;
        this.practiceQuestion = practice; this.harderFollowUp = harder;
    }
    public void markFollowUp() { this.followUp = "true"; }
    public void replaceQuestion(String category, String question) {
        this.category = category;
        this.question = question;
        this.followUp = "true";
    }
    public void submit(String answer, int score, String feedback) {
        this.answer = answer; this.score = score; this.feedback = feedback;
    }
    public void setStaffModel(String staffAnswer, String elevatorPitch, String conceptsCovered, String conceptsMissed) {
        this.staffAnswer = staffAnswer;
        this.elevatorPitch = elevatorPitch;
        this.conceptsCovered = conceptsCovered;
        this.conceptsMissed = conceptsMissed;
    }
    public void setTelemetryJson(String telemetryJson) {
        this.telemetryJson = telemetryJson;
    }
    public void setClarificationsJson(String clarificationsJson) {
        this.clarificationsJson = clarificationsJson;
    }
    public void incrementHints() {
        this.hintsUsed++;
    }
}
