package com.get.referred.referralplatform.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.get.referred.referralplatform.model.ReferralRequest;
import com.get.referred.referralplatform.model.ReferralRequest.Status;
import com.get.referred.referralplatform.model.User;
import com.get.referred.referralplatform.repository.ReferralRequestRepository;
import com.get.referred.referralplatform.dto.ReferralRequestDTO;

@Service
public class ReferralRequestService {
    private final ReferralRequestRepository referralRequestRepository;
    private final UserService userService;

    public ReferralRequestService(ReferralRequestRepository referralRequestRepository, UserService userService) {
        this.referralRequestRepository = referralRequestRepository;
        this.userService = userService;
    }

    @Transactional
    public ReferralRequest createReferralRequest(ReferralRequest request) {
        // Check if a pending referral already exists for this job seeker and company
        List<ReferralRequest> existing = referralRequestRepository.findByJobSeekerId(request.getJobSeeker().getId())
            .stream().filter(r -> r.getCompanyName().equalsIgnoreCase(request.getCompanyName()) && r.getStatus() == Status.PENDING)
            .collect(Collectors.toList());
        if (!existing.isEmpty()) {
            throw new RuntimeException("A pending referral request for this company already exists.");
        }
        request.setStatus(Status.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        request.setEmployee(null); // Not claimed yet
        return referralRequestRepository.save(request);
    }

    public List<ReferralRequest> getReferralRequestsByJobSeeker(Long jobSeekerId) {
        return referralRequestRepository.findByJobSeekerId(jobSeekerId);
    }

    public List<ReferralRequest> getReferralRequestsByEmployee(Long employeeId) {
        return referralRequestRepository.findByEmployeeId(employeeId);
    }

    public Optional<ReferralRequest> getReferralRequestById(Long id) {
        return referralRequestRepository.findById(id);
    }

    @Transactional
    public ReferralRequest updateReferralRequestStatus(Long id, Status newStatus) {
        ReferralRequest request = referralRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Referral request not found"));

        request.setStatus(newStatus);
        request.setUpdatedAt(LocalDateTime.now());
        return referralRequestRepository.save(request);
    }

    @Transactional
    public ReferralRequest addRating(Long id, int rating) {
        ReferralRequest request = referralRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Referral request not found"));

        if (request.getStatus() != Status.HIRED) {
            throw new RuntimeException("Can only rate hired referrals");
        }

        request.setRating(rating);
        request.setUpdatedAt(LocalDateTime.now());
        return referralRequestRepository.save(request);
    }

    public List<ReferralRequest> getPendingReferralRequests() {
        return referralRequestRepository.findByStatus(Status.PENDING);
    }

    public List<ReferralRequest> getHiredReferralRequests() {
        return referralRequestRepository.findByStatus(Status.HIRED);
    }

    // Security-related methods
    public boolean isUserInvolved(Long requestId, Long userId) {
        return referralRequestRepository.findById(requestId)
            .map(request -> request.getJobSeeker().getId().equals(userId) || 
                           request.getEmployee().getId().equals(userId))
            .orElse(false);
    }

    public boolean isEmployee(Long requestId, Long userId) {
        return referralRequestRepository.findById(requestId)
            .map(request -> request.getEmployee().getId().equals(userId))
            .orElse(false);
    }

    public boolean isJobSeeker(Long requestId, Long userId) {
        return referralRequestRepository.findById(requestId)
            .map(request -> request.getJobSeeker().getId().equals(userId))
            .orElse(false);
    }

    public List<ReferralRequestDTO> toDTOList(List<ReferralRequest> requests) {
        return requests.stream().map(ReferralRequestDTO::fromEntity).collect(Collectors.toList());
    }

    public List<ReferralRequest> getReferralRequestsByJobSeekerFirebaseUid(String firebaseUid) {
        User user = userService.findByFirebaseUid(firebaseUid)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return referralRequestRepository.findByJobSeekerId(user.getId());
    }

    public List<ReferralRequest> getReferralRequestsByEmployeeFirebaseUid(String firebaseUid) {
        User user = userService.findByFirebaseUid(firebaseUid)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return referralRequestRepository.findByEmployeeId(user.getId());
    }

    public List<ReferralRequestDTO> filterReferralRequestsByStatusAndUser(String firebaseUid, String statusStr) {
        User user = userService.findByFirebaseUid(firebaseUid)
            .orElseThrow(() -> new RuntimeException("User not found"));
        ReferralRequest.Status status;
        try {
            status = ReferralRequest.Status.valueOf(statusStr.toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid status: " + statusStr);
        }
        List<ReferralRequest> asJobSeeker = referralRequestRepository.findByJobSeekerId(user.getId())
            .stream().filter(r -> r.getStatus() == status).collect(Collectors.toList());
        List<ReferralRequest> asEmployee = referralRequestRepository.findByEmployeeId(user.getId())
            .stream().filter(r -> r.getStatus() == status).collect(Collectors.toList());
        asEmployee.addAll(asJobSeeker);
        return toDTOList(asEmployee);
    }

    @Transactional
    public ReferralRequest acceptReferralRequest(Long id, User employee) {
        ReferralRequest request = referralRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Referral request not found"));
        if (request.getEmployee() != null || request.getStatus() != Status.PENDING) {
            throw new RuntimeException("Referral request already accepted or not pending");
        }
        request.setEmployee(employee);
        request.setStatus(Status.ACCEPTED);
        request.setUpdatedAt(LocalDateTime.now());
        referralRequestRepository.save(request);
        // Email notification will be handled after this
        return request;
    }

    public List<ReferralRequest> getUnclaimedReferralRequestsForEmployeeCompany(User employee) {
        String companyName = employee.getCompanyName();
        if (companyName == null || !Boolean.TRUE.equals(employee.getIsEmployee())) {
            return List.of();
        }
        return referralRequestRepository.findByCompanyNameIgnoreCaseAndStatusAndEmployeeIsNull(companyName, Status.PENDING);
    }
}