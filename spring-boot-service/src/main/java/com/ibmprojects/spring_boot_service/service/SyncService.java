package com.ibmprojects.spring_boot_service.service;

import com.ibmprojects.spring_boot_service.model.Artifact;
import java.util.List;

public interface SyncService {
    void syncArtifacts(List<Artifact> artifacts);

    void syncArtifact(Artifact artifact);

    void markAsSynced(List<Artifact> artifacts);

    void markAsSynced(Artifact artifact);
}
// This interface is used to sync the artifacts to the nodejs service