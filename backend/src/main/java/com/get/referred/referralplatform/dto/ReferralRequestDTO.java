package com.get.referred.referralplatform.dto;

import java.time.LocalDateTime;

public class ReferralRequestDTO {
    private Long id;
    private String jobId;
    private String companyName;
    private String status;
    private Integer rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long jobSeekerId;
    private Long employeeId;

    public ReferralRequestDTO() {}

    public ReferralRequestDTO(Long id, String jobId, String companyName, String status, Integer rating, LocalDateTime createdAt, LocalDateTime updatedAt, Long jobSeekerId, Long employeeId) {
        this.id = id;
        this.jobId = jobId;
        this.companyName = companyName;
        this.status = status;
        this.rating = rating;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.jobSeekerId = jobSeekerId;
        this.employeeId = employeeId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getJobSeekerId() {
        return jobSeekerId;
    }

    public void setJobSeekerId(Long jobSeekerId) {
        this.jobSeekerId = jobSeekerId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public static ReferralRequestDTO fromEntity(com.get.referred.referralplatform.model.ReferralRequest request) {
        if (request == null) return null;
        return new ReferralRequestDTO(
            request.getId(),
            request.getJobId(),
            request.getCompanyName(),
            request.getStatus() != null ? request.getStatus().name() : null,
            request.getRating(),
            request.getCreatedAt(),
            request.getUpdatedAt(),
            request.getJobSeeker() != null ? request.getJobSeeker().getId() : null,
            request.getEmployee() != null ? request.getEmployee().getId() : null
        );
    }
} 