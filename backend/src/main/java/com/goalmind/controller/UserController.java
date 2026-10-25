package com.goalmind.controller;

import com.goalmind.dto.UpdateProfileRequest;
import com.goalmind.dto.UserDto;
import com.goalmind.dto.UserPreferenceDto;
import com.goalmind.model.User;
import com.goalmind.service.AuthService;
import com.goalmind.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile() {
        User user = authService.getAuthenticatedUser();
        UserDto profile = userService.getUserProfile(user);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(@RequestBody UpdateProfileRequest request) {
        User user = authService.getAuthenticatedUser();
        UserDto updated = userService.updateProfile(user, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/preferences")
    public ResponseEntity<UserPreferenceDto> getPreferences() {
        User user = authService.getAuthenticatedUser();
        UserPreferenceDto preferences = userService.getUserPreferences(user);
        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserPreferenceDto> updatePreferences(@RequestBody UserPreferenceDto dto) {
        User user = authService.getAuthenticatedUser();
        UserPreferenceDto updated = userService.updatePreferences(user, dto);
        return ResponseEntity.ok(updated);
    }
}
