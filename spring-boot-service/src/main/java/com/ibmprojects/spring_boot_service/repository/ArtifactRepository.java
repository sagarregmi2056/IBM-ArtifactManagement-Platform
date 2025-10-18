package com.ibmprojects.spring_boot_service.repository;

import com.ibmprojects.spring_boot_service.model.Artifact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ArtifactRepository extends JpaRepository<Artifact,Long> {
    Optional<Artifact> findByNameAndVersion(String name, String version);

}
