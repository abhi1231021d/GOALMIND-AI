package com.goalmind.service;

import com.goalmind.config.JwtTokenProvider;
import com.goalmind.dto.*;
import com.goalmind.exception.BadRequestException;
import com.goalmind.exception.ResourceNotFoundException;
import com.goalmind.model.User;
import com.goalmind.model.UserPreference;
import com.goalmind.repository.UserPreferenceRepository;
import com.goalmind.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final Pattern STRONG_PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#^()_+\\-=\\[\\]{}|;:,.<>~`'/\\\\]).{8,}$"
    );

    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       UserPreferenceRepository userPreferenceRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername();
        if (username == null || username.trim().isBlank()) {
            throw new BadRequestException("Username is required");
        }
        username = username.trim();

        if (username.length() < 3 || username.length() > 50) {
            throw new BadRequestException("Username must be between 3 and 50 characters");
        }

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new BadRequestException("Username is already taken: " + username);
        }

        String password = request.getPassword();
        if (password == null || !STRONG_PASSWORD_PATTERN.matcher(password).matches()) {
            throw new BadRequestException("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character");
        }

        String email = request.getEmail() != null && !request.getEmail().isBlank()
                ? request.getEmail().trim().toLowerCase() : null;

        if (email != null && userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Email is already registered: " + email);
        }

        String fullName = request.getFullName() != null && !request.getFullName().isBlank()
                ? request.getFullName().trim() : username;

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setEmail(email);
        user.setTimezone(request.getTimezone() != null ? request.getTimezone() : "UTC");
        User savedUser = userRepository.save(user);

        UserPreference preference = new UserPreference(savedUser);
        userPreferenceRepository.save(preference);

        String token = jwtTokenProvider.generateTokenForUsername(savedUser.getUsername());
        UserDto userDto = new UserDto(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getTimezone(),
                savedUser.getCreatedAt()
        );

        return new AuthResponse(token, userDto);
    }

    public AuthResponse login(LoginRequest request) {
        String username = request.getUsername();
        if (username == null || username.trim().isBlank()) {
            throw new BadRequestException("Username is required");
        }
        username = username.trim();

        final String searchIdentifier = username;
        User user = userRepository.findByUsernameIgnoreCase(searchIdentifier)
                .or(() -> userRepository.findByEmailIgnoreCase(searchIdentifier))
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);

        UserDto userDto = new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getTimezone(),
                user.getCreatedAt()
        );
        return new AuthResponse(token, userDto);
    }

    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BadRequestException("No authenticated user found in security context");
        }
        String identifier = authentication.getName();
        return userRepository.findByUsernameIgnoreCase(identifier)
                .or(() -> userRepository.findByEmailIgnoreCase(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found in database: " + identifier));
    }
}
