-- V1__Create_artifact_table.sql

CREATE TABLE IF NOT EXISTS artifact (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    size_bytes BIGINT,
    checksum VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    metadata JSON,

    CONSTRAINT uk_artifact_name_version UNIQUE (name, version)
);

-- Create indexes for better performance
CREATE INDEX idx_artifact_name ON artifact(name);
CREATE INDEX idx_artifact_type ON artifact(type);
CREATE INDEX idx_artifact_created_at ON artifact(created_at);
CREATE INDEX idx_artifact_updated_at ON artifact(updated_at);

-- Insert sample data (optional)
INSERT INTO artifact (name, version, type, description, file_path, size_bytes, checksum, metadata) VALUES
('spring-boot-starter-web', '2.7.0', 'JAR', 'Spring Boot Web Starter', '/repos/spring/jars/spring-boot-starter-web-2.7.0.jar', 2048576, 'a1b2c3d4e5f6', '{"groupId": "org.springframework.boot", "artifactId": "spring-boot-starter-web", "license": "Apache-2.0"}'),
('hibernate-core', '5.6.0', 'JAR', 'Hibernate ORM Core', '/repos/hibernate/jars/hibernate-core-5.6.0.jar', 3562147, 'b2c3d4e5f6g7', '{"groupId": "org.hibernate", "artifactId": "hibernate-core", "license": "LGPL-2.1"}'),
('artifact-management-ui', '1.0.0', 'WAR', 'Web Application Interface', '/repos/app/wars/artifact-management-ui-1.0.0.war', 15728640, 'c3d4e5f6g7h8', '{"technology": "React", "framework": "Spring Boot", "deployment": "Tomcat"}');