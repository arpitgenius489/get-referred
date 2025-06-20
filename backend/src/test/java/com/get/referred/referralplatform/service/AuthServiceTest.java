package com.get.referred.referralplatform.service;

import com.get.referred.referralplatform.model.User;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    @Mock
    private UserService userService;
    @Mock
    private FirebaseAuth firebaseAuth;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetUserFromToken_UserExists() throws Exception {
        FirebaseToken token = mock(FirebaseToken.class);
        when(firebaseAuth.verifyIdToken("token")).thenReturn(token);
        when(token.getUid()).thenReturn("uid123");
        User user = new User();
        user.setFirebaseUid("uid123");
        when(userService.findByFirebaseUid("uid123")).thenReturn(Optional.of(user));
        User result = authService.getUserFromToken("token");
        assertNotNull(result);
        assertEquals("uid123", result.getFirebaseUid());
    }

    @Test
    void testGetUserFromToken_UserNotFound() throws Exception {
        FirebaseToken token = mock(FirebaseToken.class);
        when(firebaseAuth.verifyIdToken("token")).thenReturn(token);
        when(token.getUid()).thenReturn("notfound");
        when(userService.findByFirebaseUid("notfound")).thenReturn(Optional.empty());
        Exception exception = assertThrows(Exception.class, () -> authService.getUserFromToken("token"));
        assertEquals("User not found", exception.getMessage());
    }
} 