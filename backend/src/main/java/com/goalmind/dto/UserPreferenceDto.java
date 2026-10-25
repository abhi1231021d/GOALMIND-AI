package com.goalmind.dto;

public class UserPreferenceDto {
    private String theme;
    private Integer meaningfulProgressThresholdMinutes;
    private Boolean meaningfulTaskRequired;
    private String dailyReminderTime;
    private Boolean notificationsEnabled;

    public UserPreferenceDto() {}

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public Integer getMeaningfulProgressThresholdMinutes() { return meaningfulProgressThresholdMinutes; }
    public void setMeaningfulProgressThresholdMinutes(Integer meaningfulProgressThresholdMinutes) { this.meaningfulProgressThresholdMinutes = meaningfulProgressThresholdMinutes; }

    public Boolean getMeaningfulTaskRequired() { return meaningfulTaskRequired; }
    public void setMeaningfulTaskRequired(Boolean meaningfulTaskRequired) { this.meaningfulTaskRequired = meaningfulTaskRequired; }

    public String getDailyReminderTime() { return dailyReminderTime; }
    public void setDailyReminderTime(String dailyReminderTime) { this.dailyReminderTime = dailyReminderTime; }

    public Boolean getNotificationsEnabled() { return notificationsEnabled; }
    public void setNotificationsEnabled(Boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; }
}
