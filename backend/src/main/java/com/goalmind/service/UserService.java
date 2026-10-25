package com.goalmind.service;

import com.goalmind.dto.UpdateProfileRequest;
import com.goalmind.dto.UserDto;
import com.goalmind.dto.UserPreferenceDto;
import com.goalmind.model.User;
import com.goalmind.model.UserPreference;
import com.goalmind.repository.UserPreferenceRepository;
import com.goalmind.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;

    public UserService(UserRepository userRepository,
                       UserPreferenceRepository userPreferenceRepository) {
        this.userRepository = userRepository;
        this.userPreferenceRepository = userPreferenceRepository;
    }

    public UserDto getUserProfile(User user) {
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getTimezone(),
                user.getCreatedAt()
        );
    }

    @Transactional
    public UserDto updateProfile(User user, UpdateProfileRequest request) {
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getTimezone() != null && !request.getTimezone().isBlank()) {
            user.setTimezone(request.getTimezone().trim());
        }
        User saved = userRepository.save(user);
        return new UserDto(
                saved.getId(),
                saved.getUsername(),
                saved.getEmail(),
                saved.getFullName(),
                saved.getTimezone(),
                saved.getCreatedAt()
        );
    }

    public UserPreferenceDto getUserPreferences(User user) {
        UserPreference p = userPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserPreference np = new UserPreference(user);
                    return userPreferenceRepository.save(np);
                });

        UserPreferenceDto dto = new UserPreferenceDto();
        dto.setTheme(p.getTheme());
        dto.setMeaningfulProgressThresholdMinutes(p.getMeaningfulProgressThresholdMinutes());
        dto.setMeaningfulTaskRequired(p.getMeaningfulTaskRequired());
        dto.setDailyReminderTime(p.getDailyReminderTime());
        dto.setNotificationsEnabled(p.getNotificationsEnabled());
        return dto;
    }

    @Transactional
    public UserPreferenceDto updatePreferences(User user, UserPreferenceDto dto) {
        UserPreference p = userPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> new UserPreference(user));

        if (dto.getTheme() != null) p.setTheme(dto.getTheme());
        if (dto.getMeaningfulProgressThresholdMinutes() != null) p.setMeaningfulProgressThresholdMinutes(dto.getMeaningfulProgressThresholdMinutes());
        if (dto.getMeaningfulTaskRequired() != null) p.setMeaningfulTaskRequired(dto.getMeaningfulTaskRequired());
        if (dto.getDailyReminderTime() != null) p.setDailyReminderTime(dto.getDailyReminderTime());
        if (dto.getNotificationsEnabled() != null) p.setNotificationsEnabled(dto.getNotificationsEnabled());

        UserPreference saved = userPreferenceRepository.save(p);

        UserPreferenceDto res = new UserPreferenceDto();
        res.setTheme(saved.getTheme());
        res.setMeaningfulProgressThresholdMinutes(saved.getMeaningfulProgressThresholdMinutes());
        res.setMeaningfulTaskRequired(saved.getMeaningfulTaskRequired());
        res.setDailyReminderTime(saved.getDailyReminderTime());
        res.setNotificationsEnabled(saved.getNotificationsEnabled());
        return res;
    }
}
