package com.get.referred.referralplatform.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.get.referred.referralplatform.model.User;
import com.get.referred.referralplatform.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;

class UserServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private FirebaseAuth firebaseAuth;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindByFirebaseUid_UserExists() {
        User user = new User();
        user.setFirebaseUid("testUid");
        when(userRepository.findByFirebaseUid("testUid")).thenReturn(Optional.of(user));
        Optional<User> result = userService.findByFirebaseUid("testUid");
        assertTrue(result.isPresent());
        assertEquals("testUid", result.get().getFirebaseUid());
    }

    @Test
    void testFindByFirebaseUid_UserNotFound() {
        when(userRepository.findByFirebaseUid("notFound")).thenReturn(Optional.empty());
        Optional<User> result = userService.findByFirebaseUid("notFound");
        assertFalse(result.isPresent());
    }
} 