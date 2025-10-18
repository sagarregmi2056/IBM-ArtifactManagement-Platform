package com.ibmprojects.spring_boot_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
class SpringBootServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
