package com.goalmind.dto;

import java.time.LocalDateTime;

public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String timezone;
    private LocalDateTime createdAt;

    public UserDto() {}

    public UserDto(Long id, String username, String email, String fullName, String timezone, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = (fullName != null && !fullName.isBlank()) ? fullName : username;
        this.timezone = timezone;
        this.createdAt = createdAt;
    }

    public UserDto(Long id, String email, String fullName, String timezone, LocalDateTime createdAt) {
        this.id = id;
        if (email != null && email.contains("@")) {
            this.username = email.split("@")[0];
        } else if (email != null) {
            this.username = email;
        } else {
            this.username = "user";
        }
        this.email = email;
        this.fullName = (fullName != null && !fullName.isBlank()) ? fullName : this.username;
        this.timezone = timezone;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
