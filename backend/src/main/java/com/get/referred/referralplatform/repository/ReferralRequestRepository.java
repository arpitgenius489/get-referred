package com.get.referred.referralplatform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.get.referred.referralplatform.model.ReferralRequest;
import com.get.referred.referralplatform.model.ReferralRequest.Status;

@Repository
public interface ReferralRequestRepository extends JpaRepository<ReferralRequest, Long> {
    List<ReferralRequest> findByJobSeekerId(Long jobSeekerId);
    List<ReferralRequest> findByEmployeeId(Long employeeId);
    List<ReferralRequest> findByStatus(Status status);
    List<ReferralRequest> findByCompanyNameIgnoreCaseAndStatusAndEmployeeIsNull(String companyName, ReferralRequest.Status status);
    List<ReferralRequest> findByCompanyNameIgnoreCase(String companyName);
}