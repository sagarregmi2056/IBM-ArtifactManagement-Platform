package com.ibmprojects.spring_boot_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SpringBootServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringBootServiceApplication.class, args);
	}

}
