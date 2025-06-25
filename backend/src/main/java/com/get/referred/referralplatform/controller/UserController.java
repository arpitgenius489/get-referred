package com.get.referred.referralplatform.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.get.referred.referralplatform.model.User;
import com.get.referred.referralplatform.service.UserService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.get.referred.referralplatform.dto.UserDTO;
import com.get.referred.referralplatform.dto.ApiResponse;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final FirebaseAuth firebaseAuth;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    public UserController(UserService userService, FirebaseAuth firebaseAuth) {
        this.userService = userService;
        this.firebaseAuth = firebaseAuth;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String idToken = authHeader.substring(7); // Remove "Bearer "
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
            String firebaseUid = decodedToken.getUid();
            return userService.findByFirebaseUid(firebaseUid)
                .map(user -> {
                    if (!user.isEmailVerified()) {
                        logger.warn("User {} attempted to access profile with unverified email", firebaseUid);
                        return ResponseEntity.status(403)
                            .body(new ApiResponse<>(false, "Please verify your email before accessing your profile", null));
                    }
                    return ResponseEntity.ok(new ApiResponse<>(true, "User profile fetched successfully", UserDTO.fromEntity(user)));
                })
                .orElse(ResponseEntity.status(404).body(new ApiResponse<>(false, "User not found", null)));
        } catch (Exception e) {
            logger.error("Error getting current user: {}", e.getMessage());
            return ResponseEntity.status(401)
                .body(new ApiResponse<>(false, "Authentication failed: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<String>> deleteAccount(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Token must be provided as 'Bearer {token}'", null));
            }
            String idToken = authHeader.substring(7); // Remove "Bearer "
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
            String firebaseUid = decodedToken.getUid();

            boolean dbSuccess = false;
            StringBuilder errorMsg = new StringBuilder();

            // Database deletion logic only
            try {
                Optional<User> userOpt = userService.findByFirebaseUid(firebaseUid);
                if (userOpt.isPresent()) {
                    userService.deleteByFirebaseUid(firebaseUid);
                    dbSuccess = true;
                } else {
                    // Not found in DB, treat as success
                    dbSuccess = true;
                }
            } catch (Exception e) {
                errorMsg.append("Failed to delete from database: ").append(e.getMessage()).append(". ");
            }

            // Only if DB deletion is successful, return success
            if (dbSuccess) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Account deletion completed", null));
            } else {
                return ResponseEntity.internalServerError().body(new ApiResponse<>(false, errorMsg.toString(), null));
            }
        } catch (IllegalArgumentException e) {
            logger.error("Invalid token format: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            logger.error("Error during account deletion: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
            .map(user -> {
                if (!user.isEmailVerified()) {
                    logger.warn("Attempted to access user {} with unverified email", id);
                    return ResponseEntity.status(403)
                        .body(new ApiResponse<>(false, "This user's email is not verified", null));
                }
                return ResponseEntity.ok(new ApiResponse<>(true, "User profile fetched successfully", UserDTO.fromEntity(user)));
            })
            .orElse(ResponseEntity.status(404).body(new ApiResponse<>(false, "User not found", null)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(@PathVariable Long id, @Valid @RequestBody User updatedUser) {
        try {
            Optional<User> existingUserOpt = userService.getUserById(id);
            if (existingUserOpt.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(false, "User not found", null));
            }
            User existingUser = existingUserOpt.get();
            if (!existingUser.isEmailVerified()) {
                logger.warn("Attempted to update user {} with unverified email", id);
                return ResponseEntity.status(403)
                    .body(new ApiResponse<>(false, "Please verify your email before updating your profile", null));
            }
            User user = userService.updateUser(id, updatedUser);
            return ResponseEntity.ok(new ApiResponse<>(true, "User updated successfully", UserDTO.fromEntity(user)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/employees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getEmployees() {
        List<UserDTO> employees = userService.getUserDTOsByRole(User.UserRole.USER);
        return ResponseEntity.ok(new ApiResponse<>(true, "Employees fetched successfully", employees));
    }
}