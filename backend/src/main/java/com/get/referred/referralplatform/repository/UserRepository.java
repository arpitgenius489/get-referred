package com.get.referred.referralplatform.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.get.referred.referralplatform.model.User;
import com.get.referred.referralplatform.model.User.UserRole;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByFirebaseUid(String firebaseUid);
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
    boolean existsByEmail(String email);
    boolean existsByFirebaseUid(String firebaseUid);
    List<User> findByCompanyNameIgnoreCaseAndIsEmployeeTrue(String companyName);
}