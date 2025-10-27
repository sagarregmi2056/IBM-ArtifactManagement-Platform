package com.ibmprojects.spring_boot_service.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

@Configuration
@Slf4j
public class RestConfig {

    // hasError() logic:
    // • Status 200/201/207 → is5xxServerError() = false → returns false → continues
    // ✅
    // • Status 400/404 → is5xxServerError() = false → returns false → continues ✅
    // • Status 500/502/503 → is5xxServerError() = true → returns true →
    // handleError() called ❌
    // • Exception reading status → returns true → handleError() called ❌

    // Example 1: Successful sync
    // POST to Node.js → Returns 200
    // → is5xxServerError() → false
    // → hasError() → false
    // → RestTemplate processes response normally ✅

    // // Example 2: Partial sync (207 Multi-Status)
    // POST to Node.js → Returns 207
    // → is5xxServerError() → false
    // → hasError() → false
    // → RestTemplate processes response normally ✅

    // // Example 3: Server error
    // POST to Node.js → Returns 500
    // → is5xxServerError() → true
    // → hasError() → true
    // → RestTemplate throws exception ❌
    // → Caught in catch block
    // → Artifacts remain isSynced=false for retry

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();

        // Custom error handler to allow 207 (Multi-Status) and process responses
        restTemplate.setErrorHandler(new ResponseErrorHandler() {
            @Override
            public boolean hasError(ClientHttpResponse response) {
                // if 500 error return true
                try {
                    return response.getStatusCode().is5xxServerError();
                } catch (Exception e) {
                    return true;
                }
            }

            @Override
            public void handleError(ClientHttpResponse response) {
                // Log error for debugging, but don't throw exception
                // This allows 207 Multi-Status responses to be processed
            }
        });

        return restTemplate;
    }
}
