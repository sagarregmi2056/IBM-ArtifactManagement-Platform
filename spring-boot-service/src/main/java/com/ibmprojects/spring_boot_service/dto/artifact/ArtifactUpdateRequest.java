package com.ibmprojects.spring_boot_service.dto.artifact;


import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Map;

@Data
public class ArtifactUpdateRequest {
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Size(max = 50, message = "Version must not exceed 50 characters")
    private String version;

    @Size(max = 100, message = "Type must not exceed 100 characters")
    private String type;

    private String description;
    private String filePath;
    private Long sizeBytes;
    private Map<String, Object> metadata;
}
