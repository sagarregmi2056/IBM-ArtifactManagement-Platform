package com.ibmprojects.spring_boot_service.controller;

import com.ibmprojects.spring_boot_service.dto.artifact.ArtifactCreateRequest;
import com.ibmprojects.spring_boot_service.dto.artifact.ArtifactResponse;
import com.ibmprojects.spring_boot_service.dto.artifact.ArtifactUpdateRequest;
import com.ibmprojects.spring_boot_service.service.ArtifactService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/artifacts")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "https://ibm-artifact-management-platform.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173"
})
public class ArtifactController {

    private final ArtifactService artifactService;

    @PostMapping
    public ResponseEntity<ArtifactResponse> createArtifact(@Valid @RequestBody ArtifactCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(artifactService.createArtifact(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArtifactResponse> getArtifact(@PathVariable Long id) {
        return ResponseEntity.ok(artifactService.getArtifactById(id));
    }

    @GetMapping
    public ResponseEntity<List<ArtifactResponse>> getAllArtifacts() {
        return ResponseEntity.ok(artifactService.getAllArtifacts());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArtifactResponse> updateArtifact(
            @PathVariable Long id,
            @Valid @RequestBody ArtifactUpdateRequest request) {
        return ResponseEntity.ok(artifactService.updateArtifact(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArtifact(@PathVariable Long id) {
        artifactService.deleteArtifact(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<ArtifactResponse> findByNameAndVersion(
            @RequestParam String name,
            @RequestParam String version) {
        return ResponseEntity.ok(artifactService.findByNameAndVersion(name, version));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ArtifactResponse>> getArtifactHistory(@PathVariable Long id) {
        return ResponseEntity.ok(artifactService.getArtifactHistoryByName(id));
    }

    @GetMapping("/by-repository")
    public ResponseEntity<Map<String, Object>> getArtifactsByRepository(
            @RequestParam String repositoryUrl) {
        Map<String, Object> response = new HashMap<>();
        response.put("repositoryUrl", repositoryUrl);
        response.put("artifacts", artifactService.getArtifactsByRepository(repositoryUrl));
        response.put("totalCount", artifactService.getArtifactsByRepository(repositoryUrl).size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-commit-hash")
    public ResponseEntity<ArtifactResponse> getArtifactByCommitHash(
            @RequestParam String commitHash) {
        return ResponseEntity.ok(artifactService.getArtifactByCommitHash(commitHash));
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getArtifactStatistics() {
        return ResponseEntity.ok(artifactService.getArtifactStatistics());
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEntityNotFound(
            EntityNotFoundException ex,
            HttpServletRequest request) {

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", HttpStatus.NOT_FOUND.value());
        errorResponse.put("error", "Not Found");
        errorResponse.put("message", ex.getMessage());
        errorResponse.put("path", request.getRequestURI());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    // for exceptional handling of duplicate entries

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateEntry(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", HttpStatus.CONFLICT.value());
        errorResponse.put("error", "Conflict");
        errorResponse.put("message",
                "An artifact with this name and version already exists. Please use a different version or update the existing artifact.");
        errorResponse.put("path", request.getRequestURI());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }
}
