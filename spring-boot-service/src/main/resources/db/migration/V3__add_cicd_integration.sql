-- V3__add_cicd_integration.sql
-- Simple CI/CD Integration - Auto-capture from pipeline

ALTER TABLE artifact
ADD COLUMN repository_url VARCHAR(500),
ADD COLUMN branch VARCHAR(100),
ADD COLUMN commit_hash VARCHAR(255),
ADD COLUMN commit_author VARCHAR(255),
ADD COLUMN pipeline_id VARCHAR(255),
ADD COLUMN build_number VARCHAR(100),
ADD COLUMN build_status VARCHAR(50) DEFAULT 'SUCCESS';
-- SUCCESS, FAILED, CANCELLED

CREATE INDEX idx_artifact_repo ON artifact (repository_url);

CREATE INDEX idx_artifact_commit ON artifact (commit_hash);

CREATE INDEX idx_artifact_pipeline ON artifact (pipeline_id);