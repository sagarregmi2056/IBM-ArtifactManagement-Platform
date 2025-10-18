package com.ibmprojects.spring_boot_service;

import org.springframework.boot.SpringApplication;

public class TestSpringBootServiceApplication {

	public static void main(String[] args) {
		SpringApplication.from(SpringBootServiceApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
