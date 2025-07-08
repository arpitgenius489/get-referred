package com.get.referred.referralplatform.dto;

public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String profilePictureUrl;
    private String githubLink;
    private String linkedinLink;
    private String resumeLink;
    private String companyName;

    public UserDTO() {}

    public UserDTO(Long id, String name, String email, String role, String profilePictureUrl, String githubLink, String linkedinLink, String resumeLink, String companyName) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.profilePictureUrl = profilePictureUrl;
        this.githubLink = githubLink;
        this.linkedinLink = linkedinLink;
        this.resumeLink = resumeLink;
        this.companyName = companyName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public String getGithubLink() { return githubLink; }
    public void setGithubLink(String githubLink) { this.githubLink = githubLink; }
    public String getLinkedinLink() { return linkedinLink; }
    public void setLinkedinLink(String linkedinLink) { this.linkedinLink = linkedinLink; }
    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public static UserDTO fromEntity(com.get.referred.referralplatform.model.User user) {
        if (user == null) return null;
        return new UserDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole() != null ? user.getRole().name() : null,
            user.getProfilePictureUrl(),
            user.getGithubLink(),
            user.getLinkedinLink(),
            user.getResumeLink(),
            user.getCompanyName()
        );
    }
}