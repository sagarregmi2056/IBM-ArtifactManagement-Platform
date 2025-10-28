package com.ibmprojects.spring_boot_service.service.impl;

import com.ibmprojects.spring_boot_service.model.Artifact;
import com.ibmprojects.spring_boot_service.repository.ArtifactRepository;
import com.ibmprojects.spring_boot_service.service.SyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class SyncServiceImpl implements SyncService {

    private final ArtifactRepository artifactRepository;
    private final RestTemplate restTemplate;

    @Value("${nodejs.service.url}")
    private String nodejsServiceUrl;

    // 00:00:00 - Spring Boot starts
    // - RestConfig.restTemplate() executes (ONCE)
    // - RestTemplate bean created with custom error handler

    // 00:05:00 - Scheduled sync triggered
    // - scheduledSync() runs
    // - Finds 3 unsynced artifacts
    // - Calls syncArtifacts([1, 2, 3])
    // - ↓
    // - restTemplate.postForEntity() called
    // - ↓
    // - hasError() executes (checks if 500+)
    // - If hasError() = true → handleError() executes
    // - Response received and processed

    // 00:10:00 - Scheduled sync triggered again
    // - (same flow repeats)

    @Override
    public void syncArtifacts(List<Artifact> artifacts) {
        log.info("Starting sync for {} artifacts", artifacts.size());
        try {

            ResponseEntity<Object> response = restTemplate.postForEntity(
                    nodejsServiceUrl + "/api/sync",
                    artifacts,
                    Object.class);

           
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
            List<Artifact> successfullySynced = new ArrayList<>();
            List<Artifact> failedToSync = new ArrayList<>();

            if (responseBody != null && responseBody.containsKey("results")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> results = (List<Map<String, Object>>) responseBody.get("results");

                for (int i = 0; i < artifacts.size() && i < results.size(); i++) {
                    Map<String, Object> result = results.get(i);
                    Artifact artifact = artifacts.get(i);

                    Boolean success = (Boolean) result.get("success");
                    if (Boolean.TRUE.equals(success)) {
                        successfullySynced.add(artifact);
                        log.debug("Artifact {} synced successfully", artifact.getId());
                    } else {
                        failedToSync.add(artifact);
                        Object error = result.get("error");
                        log.warn("Artifact {} failed to sync: {}", artifact.getId(), error);
                    }
                }
            } else {
                log.error("Unexpected response format from Node.js service");
                return;
            }

            if (!successfullySynced.isEmpty()) {
                markAsSynced(successfullySynced);
                log.info("Successfully synced {}/{} artifacts",
                        successfullySynced.size(), artifacts.size());
            }

            if (!failedToSync.isEmpty()) {
                log.warn("{} artifacts failed to sync and will be retried",
                        failedToSync.size());
            }

        } catch (Exception e) {
            log.error("Failed to sync artifacts: {}", e.getMessage(), e);

        }
    }

    @Override
    public void syncArtifact(Artifact artifact) {
        syncArtifacts(Collections.singletonList(artifact));
    }

    @Override
    public void markAsSynced(List<Artifact> artifacts) {
        artifacts.forEach(this::markAsSynced);
        artifactRepository.saveAll(artifacts);
        log.info("Updated sync status for {} artifacts", artifacts.size());
    }

    @Override
    public void markAsSynced(Artifact artifact) {
        artifact.setIsSynced(true);
        artifact.setLastSyncTime(LocalDateTime.now());
    }

    // schedule for every 5 minutes to sync non-synced artifacts
    @Scheduled(fixedRateString = "${sync.interval:300000}")
    public void scheduledSync() {
        log.info("Starting scheduled artifact sync...");
        try {

            List<Artifact> nonSyncedArtifacts = artifactRepository.findByIsSyncedFalseOrLastSyncTimeIsNull();

            if (nonSyncedArtifacts.isEmpty()) {
                log.info("No artifacts to sync");
                return;
            }

            syncArtifacts(nonSyncedArtifacts);
            log.info("Scheduled sync completed successfully");
        } catch (Exception e) {
            log.error("Scheduled sync failed: {}", e.getMessage(), e);
        }
    }
}
