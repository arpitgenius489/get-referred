package com.get.referred.referralplatform.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.get.referred.referralplatform.model.User;
import com.get.referred.referralplatform.model.User.UserRole;
import com.get.referred.referralplatform.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.get.referred.referralplatform.dto.UserDTO;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FirebaseAuth firebaseAuth;
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, FirebaseAuth firebaseAuth) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.firebaseAuth = firebaseAuth;
    }

    @Transactional
    public User save(User user) {
        try {
            return userRepository.save(user);
        } catch (Exception e) {
            logger.error("Error saving user: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public User findOrCreateUserByFirebaseId(String firebaseUid, String email, boolean isEmailVerified) {
        return userRepository.findByFirebaseUid(firebaseUid)
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setFirebaseUid(firebaseUid);
                newUser.setEmail(email);
                newUser.setEmailVerified(isEmailVerified);
                newUser.setRole(UserRole.USER);
                newUser.setAuthProvider(User.AuthProvider.GOOGLE);
                newUser.setCreatedAt(LocalDateTime.now());
                return userRepository.save(newUser);
            });
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public User createUserWithEmail(String firebaseUid, String email, boolean isEmailVerified) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }
        User newUser = new User();
        newUser.setFirebaseUid(firebaseUid);
        newUser.setEmail(email);
        newUser.setEmailVerified(isEmailVerified);
        newUser.setRole(UserRole.USER);
        newUser.setAuthProvider(User.AuthProvider.EMAIL);
        newUser.setCreatedAt(LocalDateTime.now());
        return userRepository.save(newUser);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    @Transactional
    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(id)
            .map(existingUser -> {
                // Only update allowed fields
                if (updatedUser.getName() != null) {
                    existingUser.setName(updatedUser.getName());
                }
                if (updatedUser.getEmail() != null) {
                    existingUser.setEmail(updatedUser.getEmail());
                }
                if (updatedUser.isEmailVerified() != existingUser.isEmailVerified()) {
                    existingUser.setEmailVerified(updatedUser.isEmailVerified());
                }
                // Don't allow role changes through this method
                // Don't allow firebase_uid changes
                // Don't allow auth_provider changes
                return userRepository.save(existingUser);
            })
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public void deleteByFirebaseUid(String firebaseUid) {
        // 1. Try to delete from Firebase
        try {
            firebaseAuth.deleteUser(firebaseUid);
            logger.info("Successfully deleted user from Firebase: {}", firebaseUid);
        } catch (Exception e) {
            logger.info("User not found in Firebase or already deleted: {}", firebaseUid);
        }

        // 2. Try to delete from database
        try {
            userRepository.findByFirebaseUid(firebaseUid)
                .ifPresent(user -> {
                    userRepository.delete(user);
                    logger.info("Successfully deleted user from database: {}", firebaseUid);
                });
        } catch (Exception e) {
            logger.error("Error deleting user from database: {}", e.getMessage());
        }
    }

    @Transactional
    public void deleteByEmail(String email) {
        boolean deletedFromFirebase = false;
        boolean deletedFromDatabase = false;

        // 1. Try to find user in our database first
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String firebaseUid = user.getFirebaseUid();

            // 2. Try to delete from Firebase
            try {
                firebaseAuth.deleteUser(firebaseUid);
                deletedFromFirebase = true;
                logger.info("Successfully deleted user from Firebase: {}", firebaseUid);
            } catch (Exception e) {
                // If user doesn't exist in Firebase, that's fine
                logger.info("User not found in Firebase or already deleted: {}", firebaseUid);
            }

            // 3. Try to delete from our database
            try {
                userRepository.delete(user);
                deletedFromDatabase = true;
                logger.info("Successfully deleted user from database: {}", email);
            } catch (Exception e) {
                logger.error("Error deleting user from database: {}", e.getMessage());
            }
        } else {
            logger.info("User not found in database: {}", email);
        }

        // 4. Log the result
        if (deletedFromFirebase || deletedFromDatabase) {
            logger.info("User deletion completed - Firebase: {}, Database: {}", 
                deletedFromFirebase, deletedFromDatabase);
        } else {
            logger.info("User not found in either system: {}", email);
        }
    }

    @Transactional(readOnly = true)
    public Optional<User> findByFirebaseUid(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid);
    }

    public List<UserDTO> getUserDTOsByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
            .map(UserDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public String extractFirebaseUidFromAuthHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Token must be provided as 'Bearer {token}'");
        }
        String idToken = authHeader.substring(7);
        try {
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
            return decodedToken.getUid();
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired token");
        }
    }
}