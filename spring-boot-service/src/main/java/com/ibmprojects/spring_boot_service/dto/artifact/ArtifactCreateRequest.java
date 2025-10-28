package com.ibmprojects.spring_boot_service.dto.artifact;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Map;

@Data
public class ArtifactCreateRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @NotBlank(message = "Version is required")
    @Size(max = 50, message = "Version must not exceed 50 characters")
    private String version;

    @NotBlank(message = "Type is required")
    @Size(max = 100, message = "Type must not exceed 100 characters")
    private String type;

    private String description;
    private String filePath;
    private Long sizeBytes;
    private Map<String, Object> metadata;

    // CI/CD Integration fields
    private String repositoryUrl;
    private String branch;
    private String commitHash;
    private String commitAuthor;
    private String pipelineId;
    private String buildNumber;
    private String buildStatus;
}
