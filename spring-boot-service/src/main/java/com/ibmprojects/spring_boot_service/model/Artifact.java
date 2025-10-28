package com.ibmprojects.spring_boot_service.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Entity
@Table(name = "Artifact")
public class Artifact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String version;

    @Column(nullable = false)
    private String type;

    private String description;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    private String checksum;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metadata;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Sync tracking for Vector DB
    @Column(nullable = false)
    private Boolean isSynced = false;

    @Column(name = "last_sync_time")
    private LocalDateTime lastSyncTime;

    // CI/CD Integration fields
    @Column(name = "repository_url")
    private String repositoryUrl;

    private String branch;

    @Column(name = "commit_hash")
    private String commitHash;

    @Column(name = "commit_author")
    private String commitAuthor;

    @Column(name = "pipeline_id")
    private String pipelineId;

    @Column(name = "build_number")
    private String buildNumber;

    @Column(name = "build_status")
    private String buildStatus;

    // GitHub profile info (optional, fetched on demand)
    @Column(name = "author_avatar_url")
    private String authorAvatarUrl;

    @Column(name = "author_github_username")
    private String authorGithubUsername;
}
