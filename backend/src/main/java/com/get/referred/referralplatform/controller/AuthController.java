package com.get.referred.referralplatform.controller;

import com.get.referred.referralplatform.model.User;
import com.get.referred.referralplatform.service.AuthService;
import com.get.referred.referralplatform.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.HttpStatus;
import com.google.firebase.auth.FirebaseAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.get.referred.referralplatform.dto.UserDTO;
import com.get.referred.referralplatform.dto.ApiResponse;

/**
 * Authentication Controller
 * 
 * Endpoints:
 * POST /api/auth/google - Google Sign In/Sign Up
 * POST /api/auth/email - Email/Password Sign In/Sign Up
 */
@RestController
@RequestMapping("/api")
public class AuthController {
    private final AuthService authService;
    private final UserService userService;
    private final FirebaseAuth firebaseAuth;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    public AuthController(AuthService authService, UserService userService, FirebaseAuth firebaseAuth) {
        this.authService = authService;
        this.userService = userService;
        this.firebaseAuth = firebaseAuth;
    }

    @PostMapping("/auth/google")
    public ResponseEntity<ApiResponse<UserDTO>> googleAuth(@RequestBody Map<String, String> request) {
        try {
            String idToken = request.get("idToken");
            if (idToken == null || idToken.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "idToken is required", null));
            }
            Map<String, Object> response = authService.authenticateUser(idToken);
            if ((boolean) response.getOrDefault("requiresVerification", false)) {
                return ResponseEntity.status(403)
                    .body(new ApiResponse<>(false, (String) response.get("message"), null));
            }
            UserDTO userDTO = (UserDTO) response.get("user");
            return ResponseEntity.ok(new ApiResponse<>(true, "Authentication successful", userDTO));
        } catch (Exception e) {
            return ResponseEntity.status(401)
                .body(new ApiResponse<>(false, "Authentication failed: " + e.getMessage(), null));
        }
    }

    @PostMapping("/auth/email")
    public ResponseEntity<ApiResponse<UserDTO>> emailAuth(@RequestBody Map<String, String> request) {
        try {
            String idToken = request.get("idToken");
            if (idToken == null || idToken.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "idToken is required", null));
            }
            Map<String, Object> response = authService.authenticateUser(idToken);
            if ((boolean) response.getOrDefault("requiresVerification", false)) {
                return ResponseEntity.status(403)
                    .body(new ApiResponse<>(false, (String) response.get("message"), null));
            }
            UserDTO userDTO = (UserDTO) response.get("user");
            return ResponseEntity.ok(new ApiResponse<>(true, "Authentication successful", userDTO));
        } catch (Exception e) {
            return ResponseEntity.status(401)
                .body(new ApiResponse<>(false, "Authentication failed: " + e.getMessage(), null));
        }
    }
}