package com.ibmprojects.spring_boot_service.service;

import com.ibmprojects.spring_boot_service.dto.artifact.ArtifactCreateRequest;
import com.ibmprojects.spring_boot_service.dto.artifact.ArtifactResponse;
import com.ibmprojects.spring_boot_service.dto.artifact.ArtifactUpdateRequest;

import java.util.List;
import java.util.Map;

public interface ArtifactService {

    ArtifactResponse createArtifact(ArtifactCreateRequest request);

    ArtifactResponse getArtifactById(Long id);

    List<ArtifactResponse> getAllArtifacts();

    ArtifactResponse updateArtifact(Long id, ArtifactUpdateRequest request);

    void deleteArtifact(Long id);

    ArtifactResponse findByNameAndVersion(String name, String version);

    List<ArtifactResponse> getArtifactHistoryByName(Long id);

    List<ArtifactResponse> getArtifactsByRepository(String repositoryUrl);

    ArtifactResponse getArtifactByCommitHash(String commitHash);

    Map<String, Object> getArtifactStatistics();
}
