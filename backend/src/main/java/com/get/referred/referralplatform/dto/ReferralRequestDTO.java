package com.get.referred.referralplatform.dto;

import java.time.LocalDateTime;

public class ReferralRequestDTO {
    private Long id;
    private String jobId;
    private String jobTitle;
    private String jobLink;
    private String companyName;
    private String status;
    private Integer rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long jobSeekerId;
    private Long employeeId;
    private String jobSeekerName;
    private String jobSeekerEmail;
    private String jobSeekerLinkedin;
    private String employeeName;
    private String employeeEmail;
    private String employeeLinkedin;

    public ReferralRequestDTO() {}

    public ReferralRequestDTO(Long id, String jobId, String jobTitle, String jobLink, String companyName, String status, Integer rating, LocalDateTime createdAt, LocalDateTime updatedAt, Long jobSeekerId, Long employeeId) {
        this.id = id;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.jobLink = jobLink;
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

    public String getJobTitle() {
        return jobTitle;
    }
    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }
    public String getJobLink() {
        return jobLink;
    }
    public void setJobLink(String jobLink) {
        this.jobLink = jobLink;
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

    public String getJobSeekerName() {
        return jobSeekerName;
    }

    public void setJobSeekerName(String jobSeekerName) {
        this.jobSeekerName = jobSeekerName;
    }

    public String getJobSeekerEmail() {
        return jobSeekerEmail;
    }

    public void setJobSeekerEmail(String jobSeekerEmail) {
        this.jobSeekerEmail = jobSeekerEmail;
    }

    public String getJobSeekerLinkedin() {
        return jobSeekerLinkedin;
    }

    public void setJobSeekerLinkedin(String jobSeekerLinkedin) {
        this.jobSeekerLinkedin = jobSeekerLinkedin;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getEmployeeEmail() {
        return employeeEmail;
    }

    public void setEmployeeEmail(String employeeEmail) {
        this.employeeEmail = employeeEmail;
    }

    public String getEmployeeLinkedin() {
        return employeeLinkedin;
    }

    public void setEmployeeLinkedin(String employeeLinkedin) {
        this.employeeLinkedin = employeeLinkedin;
    }

    public static ReferralRequestDTO fromEntity(com.get.referred.referralplatform.model.ReferralRequest request) {
        if (request == null) return null;
        ReferralRequestDTO dto = new ReferralRequestDTO(
            request.getId(),
            request.getJobId(),
            request.getJobTitle(),
            request.getJobLink(),
            request.getCompanyName(),
            request.getStatus() != null ? request.getStatus().name() : null,
            request.getRating(),
            request.getCreatedAt(),
            request.getUpdatedAt(),
            request.getJobSeeker() != null ? request.getJobSeeker().getId() : null,
            request.getEmployee() != null ? request.getEmployee().getId() : null
        );
        if (request.getJobSeeker() != null) {
            dto.setJobSeekerName(request.getJobSeeker().getName());
            dto.setJobSeekerEmail(request.getJobSeeker().getEmail());
            dto.setJobSeekerLinkedin(request.getJobSeeker().getLinkedinLink());
        }
        if (request.getEmployee() != null) {
            dto.setEmployeeName(request.getEmployee().getName());
            dto.setEmployeeEmail(request.getEmployee().getEmail());
            dto.setEmployeeLinkedin(request.getEmployee().getLinkedinLink());
        }
        return dto;
    }
}