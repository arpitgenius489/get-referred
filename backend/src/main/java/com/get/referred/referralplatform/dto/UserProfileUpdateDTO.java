package com.get.referred.referralplatform.dto;

public class UserProfileUpdateDTO {
    private String name;
    private String profilePictureUrl;
    private String githubLink;
    private String linkedinLink;
    private String resumeLink;
    private Boolean isEmployee;
    private String companyName;

    // Getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public String getGithubLink() { return githubLink; }
    public void setGithubLink(String githubLink) { this.githubLink = githubLink; }
    public String getLinkedinLink() { return linkedinLink; }
    public void setLinkedinLink(String linkedinLink) { this.linkedinLink = linkedinLink; }
    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }
    public Boolean getIsEmployee() { return isEmployee; }
    public void setIsEmployee(Boolean isEmployee) { this.isEmployee = isEmployee; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
}
