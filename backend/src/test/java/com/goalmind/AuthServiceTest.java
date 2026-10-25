package com.goalmind;

import com.goalmind.config.JwtTokenProvider;
import com.goalmind.dto.AuthResponse;
import com.goalmind.dto.LoginRequest;
import com.goalmind.dto.RegisterRequest;
import com.goalmind.exception.BadRequestException;
import com.goalmind.model.User;
import com.goalmind.model.UserPreference;
import com.goalmind.repository.UserPreferenceRepository;
import com.goalmind.repository.UserRepository;
import com.goalmind.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserPreferenceRepository userPreferenceRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, userPreferenceRepository, passwordEncoder, authenticationManager, jwtTokenProvider);
    }

    @Test
    void testRegisterSuccessWithUsernameAndStrongPassword() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("alex_mercer");
        request.setPassword("StrongP@ss123!");

        when(userRepository.existsByUsernameIgnoreCase("alex_mercer")).thenReturn(false);
        when(passwordEncoder.encode("StrongP@ss123!")).thenReturn("$2a$12$hashedPassword");

        User savedUser = new User("alex_mercer", "$2a$12$hashedPassword");
        savedUser.setId(1L);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenProvider.generateTokenForUsername("alex_mercer")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("alex_mercer", response.getUser().getUsername());
        assertEquals("alex_mercer", response.getUser().getFullName());
        verify(userPreferenceRepository).save(any(UserPreference.class));
    }

    @Test
    void testRegisterFailsWhenPasswordIsWeak() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("alex_mercer");
        request.setPassword("weakpass"); // Missing uppercase, number, symbol

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterDuplicateUsernameThrowsBadRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("existing_user");
        request.setPassword("StrongP@ss123!");

        when(userRepository.existsByUsernameIgnoreCase("existing_user")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLoginSuccessWithUsername() {
        LoginRequest request = new LoginRequest();
        request.setUsername("alex_mercer");
        request.setPassword("StrongP@ss123!");

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtTokenProvider.generateToken(auth)).thenReturn("login-jwt-token");

        User user = new User("alex_mercer", "hash");
        user.setId(1L);
        when(userRepository.findByUsernameIgnoreCase("alex_mercer")).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("login-jwt-token", response.getToken());
        assertEquals("alex_mercer", response.getUser().getUsername());
    }
}
