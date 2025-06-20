package com.get.referred.referralplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;


@SpringBootApplication
@ComponentScan(basePackages = "com.get.referred.referralplatform")
public class ReferralPlatformApplication {

	public static void main(String[] args) {
		
		SpringApplication.run(ReferralPlatformApplication.class, args);
	}

}