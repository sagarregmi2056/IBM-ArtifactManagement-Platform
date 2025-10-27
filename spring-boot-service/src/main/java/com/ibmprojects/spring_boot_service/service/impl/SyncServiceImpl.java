package com.ibmprojects.spring_boot_service.service.impl;

import com.ibmprojects.spring_boot_service.model.Artifact;
import com.ibmprojects.spring_boot_service.repository.ArtifactRepository;
import com.ibmprojects.spring_boot_service.service.SyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
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

    @Override
    public void syncArtifacts(List<Artifact> artifacts) {
        log.info("Starting sync for {} artifacts", artifacts.size());
        try {
            // Send to Node.js service
            restTemplate.postForEntity(
                    nodejsServiceUrl + "/api/sync",
                    artifacts,
                    Map.class);

            // Mark as synced
            markAsSynced(artifacts);
            log.info("Successfully synced {} artifacts", artifacts.size());
        } catch (Exception e) {
            log.error("Failed to sync artifacts: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to sync artifacts", e);
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

    /**
     * Scheduled task that runs every 5 minutes to sync non-synced artifacts
     */
    @Scheduled(fixedRateString = "${sync.interval:300000}") // 5 minutes by default
    public void scheduledSync() {
        log.info("Starting scheduled artifact sync...");
        try {
            // Find all non-synced artifacts
            List<Artifact> nonSyncedArtifacts = artifactRepository.findByIsSyncedFalseOrLastSyncTimeIsNull();

            if (nonSyncedArtifacts.isEmpty()) {
                log.info("No artifacts to sync");
                return;
            }

            // Sync them
            syncArtifacts(nonSyncedArtifacts);
            log.info("Scheduled sync completed successfully");
        } catch (Exception e) {
            log.error("Scheduled sync failed: {}", e.getMessage(), e);
        }
    }
}
