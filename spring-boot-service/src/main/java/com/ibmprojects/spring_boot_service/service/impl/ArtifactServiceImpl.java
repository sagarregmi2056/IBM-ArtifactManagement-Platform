package com.ibmprojects.spring_boot_service.service.impl;

import com.ibmprojects.spring_boot_service.dto.artifact.ArtifactCreateRequest;
import com.ibmprojects.spring_boot_service.dto.artifact.ArtifactResponse;
import com.ibmprojects.spring_boot_service.dto.artifact.ArtifactUpdateRequest;
import com.ibmprojects.spring_boot_service.model.Artifact;
import com.ibmprojects.spring_boot_service.repository.ArtifactRepository;
import com.ibmprojects.spring_boot_service.service.ArtifactService;
import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ArtifactServiceImpl implements ArtifactService {

    private final ArtifactRepository artifactRepository;

    @Override
    public ArtifactResponse createArtifact(ArtifactCreateRequest request) {
        Artifact artifact = new Artifact();
        BeanUtils.copyProperties(request, artifact);
        Artifact savedArtifact = artifactRepository.save(artifact);
        ArtifactResponse response = new ArtifactResponse();
        BeanUtils.copyProperties(savedArtifact, response);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public ArtifactResponse getArtifactById(Long id) {
        Artifact artifact = artifactRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Artifact not found with id: " + id));
        ArtifactResponse response = new ArtifactResponse();
        BeanUtils.copyProperties(artifact, response);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArtifactResponse> getAllArtifacts() {
        return artifactRepository.findAll().stream()
                .map(artifact -> {
                    ArtifactResponse response = new ArtifactResponse();
                    BeanUtils.copyProperties(artifact, response);
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    public ArtifactResponse updateArtifact(Long id, ArtifactUpdateRequest request) {
        Artifact existingArtifact = artifactRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Artifact not found with id: " + id));

        BeanUtils.copyProperties(request, existingArtifact, "id", "createdAt", "updatedAt", "checksum");

        Artifact updatedArtifact = artifactRepository.save(existingArtifact);
        ArtifactResponse response = new ArtifactResponse();
        BeanUtils.copyProperties(updatedArtifact, response);
        return response;
    }

    @Override
    public void deleteArtifact(Long id) {
        if (!artifactRepository.existsById(id)) {
            throw new EntityNotFoundException("Artifact not found with id: " + id);
        }
        artifactRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ArtifactResponse findByNameAndVersion(String name, String version) {
        Artifact artifact = artifactRepository.findByNameAndVersion(name, version)
                .orElseThrow(() -> new EntityNotFoundException(
                        String.format("Artifact not found with name: %s and version: %s", name, version)));
        ArtifactResponse response = new ArtifactResponse();
        BeanUtils.copyProperties(artifact, response);
        return response;
    }
}
