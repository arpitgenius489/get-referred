package com.get.referred.referralplatform.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "referral_requests")
public class ReferralRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_seeker_id", nullable = false)
    @NotNull
    private User jobSeeker;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = true)
    private User employee;

    @NotBlank
    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "job_id", nullable = true)
    private String jobId;

    @Column(name = "job_link", nullable = true)
    private String jobLink;

    @NotBlank
    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    private Integer rating;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "resume_link")
    private String resumeLink;

    public enum Status {
        PENDING,
        ACCEPTED,
        REJECTED,
        HIRED
    }

    public Status getStatus() {
        return status;
    }
    public void setStatus(Status status) {
        this.status = status;
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
    public Integer getRating() {
        return rating;
    }
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    public User getJobSeeker() {
        return jobSeeker;
    }
    public void setJobSeeker(User jobSeeker) {
        this.jobSeeker = jobSeeker;
    }
    public User getEmployee() {
        return employee;
    }
    public void setEmployee(User employee) {
        this.employee = employee;
    }
    public Long getId() {
        return id;
    }
    public String getJobId() {
        return jobId;
    }
    public String getCompanyName() {
        return companyName;
    }
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
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
    public void setJobId(String jobId) {
        this.jobId = jobId;
    }
    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
}