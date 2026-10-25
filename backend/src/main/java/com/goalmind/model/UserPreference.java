package com.goalmind.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_preferences")
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 20)
    private String theme = "system";

    @Column(nullable = false)
    private Integer meaningfulProgressThresholdMinutes = 30;

    @Column(nullable = false)
    private Boolean meaningfulTaskRequired = true;

    @Column(length = 10)
    private String dailyReminderTime = "09:00";

    @Column(nullable = false)
    private Boolean notificationsEnabled = true;

    public UserPreference() {}

    public UserPreference(User user) {
        this.user = user;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public Integer getMeaningfulProgressThresholdMinutes() { return meaningfulProgressThresholdMinutes; }
    public void setMeaningfulProgressThresholdMinutes(Integer minutes) { this.meaningfulProgressThresholdMinutes = minutes; }

    public Boolean getMeaningfulTaskRequired() { return meaningfulTaskRequired; }
    public void setMeaningfulTaskRequired(Boolean required) { this.meaningfulTaskRequired = required; }

    public String getDailyReminderTime() { return dailyReminderTime; }
    public void setDailyReminderTime(String time) { this.dailyReminderTime = time; }

    public Boolean getNotificationsEnabled() { return notificationsEnabled; }
    public void setNotificationsEnabled(Boolean enabled) { this.notificationsEnabled = enabled; }
}
