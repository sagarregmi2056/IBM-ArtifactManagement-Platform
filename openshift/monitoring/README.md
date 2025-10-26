# OpenShift Monitoring Setup

This guide explains how to use OpenShift's built-in monitoring capabilities for our Spring Boot application.

## Architecture Overview

```mermaid
graph TD
    A[Spring Boot App] -->|Exposes| B[/actuator/prometheus]
    B -->|Scraped by| C[OpenShift Prometheus]
    C -->|Stores| D[Time Series Data]
    C -->|Alerts| E[Alert Manager]
    C -->|Visualizes| F[OpenShift Console]

    subgraph OpenShift Built-in Monitoring
        C
        D
        E
        F
    end
```

## Components

1. **ServiceMonitor**:
   ```yaml
   apiVersion: monitoring.coreos.com/v1
   kind: ServiceMonitor
   metadata:
     name: spring-boot-monitor
   spec:
     endpoints:
     - port: http
       path: /actuator/prometheus
   ```

2. **Spring Boot Actuator**:
   ```yaml
   management:
     endpoints:
       web:
         exposure:
           include: prometheus,health,info
   ```

## Accessing Metrics

1. **OpenShift Console**:
   - Navigate to: Monitoring → Metrics
   - Use PromQL queries to view metrics

2. **Common Queries**:
   ```promql
   # Request Rate
   rate(http_server_requests_seconds_count{job="spring-boot"}[5m])

   # Error Rate
   rate(http_server_requests_seconds_count{status="500"}[5m])

   # JVM Memory
   jvm_memory_used_bytes{area="heap"}
   ```

## Setting Up Alerts

1. **Via OpenShift Console**:
   - Navigate to: Monitoring → Alerting
   - Create Alert Rules
   - Configure Receivers

2. **Common Alert Rules**:
   - High Error Rate (>1% errors)
   - High Latency (>1s response time)
   - Memory Usage (>85% heap)
   - CPU Usage (>80% utilization)

## Adding New Services

1. **Enable Metrics**:
   ```xml
   <!-- Add to pom.xml -->
   <dependency>
       <groupId>io.micrometer</groupId>
       <artifactId>micrometer-registry-prometheus</artifactId>
   </dependency>
   ```

2. **Configure Endpoints**:
   ```yaml
   # In application.yml
   management:
     endpoints:
       web:
         exposure:
           include: prometheus,health,info
   ```

3. **Create ServiceMonitor**:
   ```yaml
   apiVersion: monitoring.coreos.com/v1
   kind: ServiceMonitor
   metadata:
     name: new-service-monitor
   spec:
     selector:
       matchLabels:
         app: new-service
     endpoints:
     - port: http
       path: /actuator/prometheus
   ```

## Troubleshooting

1. **Check Metrics Endpoint**:
   ```bash
   # Test metrics endpoint
   curl http://your-service:8081/actuator/prometheus
   ```

2. **Verify ServiceMonitor**:
   ```bash
   # Check ServiceMonitor status
   oc get servicemonitor
   
   # Describe for more details
   oc describe servicemonitor spring-boot-monitor
   ```

3. **Common Issues**:
   - Metrics endpoint not exposed
   - Wrong port configuration
   - Missing service labels
   - RBAC issues

## Best Practices

1. **Metrics Naming**:
   - Use consistent naming conventions
   - Add relevant labels
   - Document custom metrics

2. **Resource Usage**:
   - Monitor memory usage
   - Track CPU utilization
   - Watch disk I/O

3. **Alert Configuration**:
   - Set appropriate thresholds
   - Add clear descriptions
   - Configure proper severity levels

## Useful Commands

```bash
# Check metrics endpoint
oc exec <pod-name> -- curl localhost:8081/actuator/prometheus

# View ServiceMonitor
oc get servicemonitor

# Check OpenShift monitoring status
oc get pods -n openshift-monitoring

# View metrics in OpenShift console
oc get route -n openshift-monitoring
```