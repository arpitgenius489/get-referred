package com.get.referred.referralplatform.service;

import com.get.referred.referralplatform.model.User;
import com.get.referred.referralplatform.model.User.AuthProvider;
import com.get.referred.referralplatform.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.get.referred.referralplatform.dto.UserDTO;

@Service
public class AuthService {
    private final UserService userService;
    private final FirebaseAuth firebaseAuth;
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    public AuthService(UserService userService, FirebaseAuth firebaseAuth) {
        this.userService = userService;
        this.firebaseAuth = firebaseAuth;
    }

    public Map<String, Object> authenticateUser(String idToken) throws Exception {
        try {
            // 1. Verify the ID token
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
            String firebaseUid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            boolean isEmailVerified = decodedToken.isEmailVerified();

            logger.info("Authenticating user with Firebase UID: {}", firebaseUid);

            // 2. Check if user exists by Firebase UID
            Optional<User> existingUser = userService.findByFirebaseUid(firebaseUid);
            
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                logger.info("Found existing user with Firebase UID: {}", firebaseUid);
                
                // For Google auth, email is always verified
                if (user.getAuthProvider() == User.AuthProvider.GOOGLE) {
                    user.setEmailVerified(true);
                    user = userService.save(user);
                    logger.info("Updated email verification status for Google user: {}", firebaseUid);
                } 
                // For Email auth, check verification status
                else if (user.getAuthProvider() == User.AuthProvider.EMAIL && !user.isEmailVerified()) {
                    logger.warn("User {} attempted to access with unverified email", firebaseUid);
                    return Map.of(
                        "requiresVerification", true,
                        "message", "Email verification required",
                        "authProvider", "EMAIL"
                    );
                }

                return Map.of(
                    "user", UserDTO.fromEntity(user),
                    "requiresVerification", false,
                    "authProvider", user.getAuthProvider().name()
                );
            } else {
                // Create new user
                logger.info("Creating new user for Firebase UID: {}", firebaseUid);
                User newUser = new User();
                newUser.setFirebaseUid(firebaseUid);
                newUser.setEmail(email);
                
                // Set auth provider and verification status
                // Check if the token is from Google auth
                if (decodedToken.getIssuer() != null && 
                    decodedToken.getIssuer().equals("https://securetoken.google.com/your-project-id")) {
                    newUser.setAuthProvider(User.AuthProvider.GOOGLE);
                    newUser.setEmailVerified(true); // Google emails are always verified
                } else {
                    newUser.setAuthProvider(User.AuthProvider.EMAIL);
                    newUser.setEmailVerified(isEmailVerified);
                }
                
                newUser.setRole(User.UserRole.USER);
                newUser = userService.save(newUser);

                // For Email auth, check verification status
                if (newUser.getAuthProvider() == User.AuthProvider.EMAIL && !newUser.isEmailVerified()) {
                    logger.warn("New user {} created with unverified email", firebaseUid);
                    return Map.of(
                        "requiresVerification", true,
                        "message", "Email verification required",
                        "authProvider", "EMAIL"
                    );
                }

                logger.info("Successfully created new user with Firebase UID: {}", firebaseUid);
                return Map.of(
                    "user", UserDTO.fromEntity(newUser),
                    "requiresVerification", false,
                    "authProvider", newUser.getAuthProvider().name()
                );
            }
        } catch (Exception e) {
            logger.error("Error authenticating user: {}", e.getMessage(), e);
            throw e;
        }
    }

    public User getUserFromToken(String idToken) throws Exception {
        try {
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
            String firebaseUid = decodedToken.getUid();
            
            return userService.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new Exception("User not found"));
        } catch (Exception e) {
            logger.error("Error getting user from token: {}", e.getMessage(), e);
            throw e;
        }
    }
} 