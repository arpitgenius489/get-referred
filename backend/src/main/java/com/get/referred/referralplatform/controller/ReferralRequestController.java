package com.get.referred.referralplatform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.get.referred.referralplatform.model.ReferralRequest;
import com.get.referred.referralplatform.model.ReferralRequest.Status;
import com.get.referred.referralplatform.service.ReferralRequestService;
import com.get.referred.referralplatform.dto.ReferralRequestDTO;
import com.get.referred.referralplatform.dto.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/referral-requests")
public class ReferralRequestController {
    private final ReferralRequestService referralRequestService;

    public ReferralRequestController(ReferralRequestService referralRequestService) {
        this.referralRequestService = referralRequestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApiResponse<ReferralRequestDTO>> createReferralRequest(@Valid @RequestBody ReferralRequest request) {
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

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApiResponse<List<ReferralRequestDTO>>> getMyReferralRequests() {
        Long userId = 1L; // TODO: Replace with actual user ID from security context
        List<ReferralRequestDTO> dtos = referralRequestService.toDTOList(referralRequestService.getReferralRequestsByJobSeeker(userId));
        return ResponseEntity.ok(new ApiResponse<>(true, "My referral requests fetched", dtos));
    }

    @GetMapping("/received-requests")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<ReferralRequestDTO>>> getReceivedReferralRequests() {
        Long userId = 1L; // TODO: Replace with actual user ID from security context
        List<ReferralRequestDTO> dtos = referralRequestService.toDTOList(referralRequestService.getReferralRequestsByEmployee(userId));
        return ResponseEntity.ok(new ApiResponse<>(true, "Received referral requests fetched", dtos));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('EMPLOYEE') and @referralRequestService.isEmployee(#id, authentication.principal.id)")
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
    @PreAuthorize("hasRole('JOB_SEEKER') and @referralRequestService.isJobSeeker(#id, authentication.principal.id)")
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
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<ReferralRequestDTO>>> getPendingReferralRequests() {
        List<ReferralRequestDTO> dtos = referralRequestService.toDTOList(referralRequestService.getPendingReferralRequests());
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending referral requests fetched", dtos));
    }

    @GetMapping("/hired")
    public ResponseEntity<ApiResponse<List<ReferralRequestDTO>>> getHiredReferralRequests() {
        List<ReferralRequestDTO> dtos = referralRequestService.toDTOList(referralRequestService.getHiredReferralRequests());
        return ResponseEntity.ok(new ApiResponse<>(true, "Hired referral requests fetched", dtos));
    }
}