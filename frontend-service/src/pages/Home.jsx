import { Tile, Tabs, TabList, TabPanels, Tab, TabPanel, CodeSnippet } from '@carbon/react'
import { Box, Catalog, Search } from '@carbon/icons-react'

export default function Home() {
    return (
        <div style={{ margin: '2rem 0' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 600 }}>
                IBM Artifact Management Platform
            </h1>
            <p style={{ fontSize: '1.125rem', marginBottom: '3rem', color: '#525252', maxWidth: '700px' }}>
                Manage and search your software artifacts with AI-powered semantic search capabilities.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                <Tile style={{ padding: '2rem', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => window.location.href = '/artifacts'}>
                    <Box size={48} style={{ marginBottom: '1rem', color: '#0f62fe' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>Artifacts</h3>
                    <p style={{ color: '#525252', lineHeight: 1.6 }}>
                        Create, view, and manage your software artifacts. Track versions, metadata, and dependencies in one centralized platform.
                    </p>
                </Tile>
                <Tile style={{ padding: '2rem', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => window.location.href = '/ai'}>
                    <Search size={48} style={{ marginBottom: '1rem', color: '#0f62fe' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>AI Search</h3>
                    <p style={{ color: '#525252', lineHeight: 1.6 }}>
                        Use natural language to search artifacts semantically. Find what you need quickly and accurately with AI-powered insights.
                    </p>
                </Tile>
            </div>
            <div style={{ marginTop: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>CI/CD Examples: Call Spring Boot API</h2>
                <p style={{ color: '#525252', marginBottom: '1rem' }}>
                    Use these examples to integrate the Artifact API from your pipelines.
                    Replace <code>our-artifact-api.com</code> with our deployed Artifact API URL.
                </p>
                <Tabs>
                    <TabList aria-label="CI/CD options">
                        <Tab>GitHub Actions</Tab>
                        <Tab>Tekton</Tab>
                        <Tab>Jenkins</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <CodeSnippet type="multi" feedback="Copied" maxCollapsedNumberOfRows={30}>
                                {`name: Deploy and Register Artifact
on: [workflow_dispatch]

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      SPRING_BOOT_URL: "https://our-artifact-api.com"
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push to IBM Cloud Object Storage
        run: |
          # Upload to IBM Cloud Object Storage
          ibmcloud cos upload --bucket my-cos-bucket --key artifacts/my-artifact-v1.0.jar --file my-artifact.jar
      
      - name: Register artifact in API
        run: |
          curl -X POST "\${SPRING_BOOT_URL}/api/v1/artifacts" \\
            -H "Content-Type: application/json" \\
            -d '{
              "name": "my-service",
              "version": "1.0.0",
              "description": "My microservice artifact",
              "filePath": "cos://my-cos-bucket/artifacts/my-artifact-v1.0.jar",
              "type": "JAR",
              "repositoryUrl": "https://github.com/org/repo",
              "branch": "main",
              "commitHash": "abc123def456",
              "commitAuthor": "developer@company.com",
              "pipelineId": "github-actions-123456",
              "buildNumber": "42",
              "buildStatus": "SUCCESS"
            }'
      
      - name: List all artifacts
        run: |
          curl -sS "\${SPRING_BOOT_URL}/api/v1/artifacts" | jq .
`}
                            </CodeSnippet>
                        </TabPanel>
                        <TabPanel>
                            <CodeSnippet type="multi" feedback="Copied" maxCollapsedNumberOfRows={40}>
                                {`apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: artifact-pipeline
spec:
  params:
    - name: artifact-name
    - name: artifact-version
  tasks:
    - name: upload-to-storage
      taskRef:
        name: ibm-cloud-cli
      params:
        - name: COS_BUCKET
          value: my-cos-bucket
        - name: FILE
          value: ./target/my-service.jar
    
    - name: register-artifact
      taskRef:
        name: curl
      params:
        - name: SPRING_BOOT_URL
          value: "https://our-artifact-api.com"
      script: |
        curl -X POST "$(params.SPRING_BOOT_URL)/api/v1/artifacts" \\
          -H "Content-Type: application/json" \\
          -d '{
            "name": "$(params.artifact-name)",
            "version": "$(params.artifact-version)",
            "filePath": "cos://my-cos-bucket/artifacts/$(params.artifact-name)-$(params.artifact-version).jar",
            "type": "JAR",
            "repositoryUrl": "$(params.REPO_URL)",
            "branch": "$(params.BRANCH)",
            "commitHash": "$(params.COMMIT_SHA)",
            "commitAuthor": "$(params.COMMIT_AUTHOR)",
            "pipelineId": "$(params.PIPELINE_RUN)",
            "buildNumber": "$(params.BUILD_NUM)",
            "buildStatus": "SUCCESS"
          }'
`}
                            </CodeSnippet>
                        </TabPanel>
                        <TabPanel>
                            <CodeSnippet type="multi" feedback="Copied" maxCollapsedNumberOfRows={40}>
                                {`pipeline {
  agent any
  environment {
    SPRING_BOOT_URL = credentials('SPRING_BOOT_URL')
    COS_BUCKET = credentials('COS_BUCKET')
  }
  stages {
    stage('Build') {
      steps {
        sh './mvnw clean package'
      }
    }
    stage('Upload to IBM Cloud Object Storage') {
      steps {
        sh '''
          ibmcloud cos upload --bucket $COS_BUCKET \\
            --key artifacts/my-service-1.0.0.jar \\
            --file target/my-service.jar
        '''
      }
    }
    stage('Register Artifact') {
      steps {
        sh '''
          curl -X POST "$SPRING_BOOT_URL/api/v1/artifacts" \\
            -H "Content-Type: application/json" \\
            -d '{
              "name": "my-service",
              "version": "1.0.0",
              "filePath": "cos://'$COS_BUCKET'/artifacts/my-service-1.0.0.jar",
              "type": "JAR",
              "repositoryUrl": "https://github.com/org/repo",
              "branch": "main",
              "commitHash": "abc123def456",
              "commitAuthor": "jenkins-user",
              "pipelineId": "jenkins-123456",
              "buildNumber": "42",
              "buildStatus": "SUCCESS"
            }'
        '''
      }
    }
  }
}
`}
                            </CodeSnippet>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        </div>
    )
}


