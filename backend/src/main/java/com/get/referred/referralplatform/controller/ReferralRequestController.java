package com.get.referred.referralplatform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.get.referred.referralplatform.model.ReferralRequest;
import com.get.referred.referralplatform.model.User;
import com.get.referred.referralplatform.service.ReferralRequestService;
import com.get.referred.referralplatform.dto.ReferralRequestDTO;
import com.get.referred.referralplatform.dto.ApiResponse;
import com.get.referred.referralplatform.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/referrals")
public class ReferralRequestController {
    private final ReferralRequestService referralRequestService;
    private final UserService userService;

    public ReferralRequestController(ReferralRequestService referralRequestService, UserService userService) {
        this.referralRequestService = referralRequestService;
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReferralRequestDTO>> createReferralRequest(@Valid @RequestBody ReferralRequestDTO requestDto, @RequestHeader("Authorization") String authHeader) {
        if (requestDto.getJobTitle() == null || requestDto.getJobTitle().isBlank()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Job title is required", null));
        }
        ReferralRequest request = new ReferralRequest();
        request.setJobTitle(requestDto.getJobTitle());
        request.setJobId(requestDto.getJobId());
        request.setJobLink(requestDto.getJobLink());
        request.setCompanyName(requestDto.getCompanyName());
        request.setGithubUrl(requestDto.getGithubLink());
        request.setResumeLink(requestDto.getResumeLink());
        request.setLinkedinUrl(requestDto.getLinkedinLink());
        // Set jobSeeker from the authenticated user
        String firebaseUid = userService.extractFirebaseUidFromAuthHeader(authHeader);
        User jobSeeker = userService.findByFirebaseUid(firebaseUid).orElse(null);
        if (jobSeeker == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "User not found", null));
        }
        request.setJobSeeker(jobSeeker);
        ReferralRequest created = referralRequestService.createReferralRequest(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Referral request created successfully", ReferralRequestDTO.fromEntity(created)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @referralRequestService.isUserInvolved(#id, authentication.principal.id)")
    public ResponseEntity<ApiResponse<ReferralRequestDTO>> getReferralRequest(@PathVariable Long id) {
        return referralRequestService.getReferralRequestById(id)
            .map(req -> ResponseEntity.ok(new ApiResponse<>(true, "Referral request fetched", ReferralRequestDTO.fromEntity(req))))
            .orElse(ResponseEntity.status(404).body(new ApiResponse<>(false, "Referral request not found", null)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ReferralRequestDTO>>> getMyReferralRequests(@RequestHeader("Authorization") String authHeader) {
        String firebaseUid = userService.extractFirebaseUidFromAuthHeader(authHeader);
        List<ReferralRequestDTO> dtos = referralRequestService.toDTOList(referralRequestService.getReferralRequestsByJobSeekerFirebaseUid(firebaseUid));
        return ResponseEntity.ok(new ApiResponse<>(true, "My referral requests fetched", dtos));
    }

    @GetMapping("/received")
    public ResponseEntity<ApiResponse<List<ReferralRequestDTO>>> getReceivedReferralRequests(@RequestHeader("Authorization") String authHeader) {
        String firebaseUid = userService.extractFirebaseUidFromAuthHeader(authHeader);
        User user = userService.findByFirebaseUid(firebaseUid).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(new ApiResponse<>(false, "User not found", null));
        }
        String companyName = user.getCompanyName();
        if (companyName == null || companyName.trim().isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Please set your company name to view provider referrals.", List.of()));
        }
        List<ReferralRequestDTO> dtos = referralRequestService.toDTOList(referralRequestService.getReferralRequestsByCompanyName(companyName));
        return ResponseEntity.ok(new ApiResponse<>(true, "Received referral requests fetched", dtos));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("@userService.hasEmployeeAccess(authentication.principal.id) and @referralRequestService.isEmployee(#id, authentication.principal.id)")
    public ResponseEntity<ApiResponse<ReferralRequestDTO>> updateReferralRequestStatus(
            @PathVariable Long id,
            @RequestBody ReferralRequest.Status newStatus) {
        try {
            ReferralRequest request = referralRequestService.updateReferralRequestStatus(id, newStatus);
            return ResponseEntity.ok(new ApiResponse<>(true, "Referral request status updated", ReferralRequestDTO.fromEntity(request)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{id}/rating")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReferralRequestDTO>> addRating(
            @PathVariable Long id,
            @RequestBody int rating) {
        try {
            ReferralRequest request = referralRequestService.addRating(id, rating);
            return ResponseEntity.ok(new ApiResponse<>(true, "Referral request rated", ReferralRequestDTO.fromEntity(request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("@userService.hasEmployeeAccess(authentication.principal.id)")
    public ResponseEntity<ApiResponse<List<ReferralRequestDTO>>> getPendingReferralRequests() {
        List<ReferralRequestDTO> dtos = referralRequestService.toDTOList(referralRequestService.getPendingReferralRequests());
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending referral requests fetched", dtos));
    }

    @GetMapping("/hired")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ReferralRequestDTO>>> getHiredReferralRequests(@RequestHeader("Authorization") String authHeader) {
        String firebaseUid = userService.extractFirebaseUidFromAuthHeader(authHeader);
        List<ReferralRequestDTO> dtos = referralRequestService.filterReferralRequestsByStatusAndUser(firebaseUid, "HIRED");
        return ResponseEntity.ok(new ApiResponse<>(true, "Hired referral requests fetched", dtos));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<ReferralRequestDTO>>> filterReferralRequests(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("status") String status) {
        String firebaseUid = userService.extractFirebaseUidFromAuthHeader(authHeader);
        List<ReferralRequestDTO> dtos = referralRequestService.filterReferralRequestsByStatusAndUser(firebaseUid, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Filtered referral requests fetched", dtos));
    }
}