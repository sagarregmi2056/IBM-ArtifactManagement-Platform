package com.ibmprojects.spring_boot_service.dto.artifact;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data

public class ArtifactResponse {

    private Long id;
    private String name;
    private String version;
    private String type;
    private String description;
    private String filePath;
    private Long sizeBytes;
    private String checksum;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Map<String, Object> metadata;
}
