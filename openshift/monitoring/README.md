# Monitoring Setup for OpenShift

This directory contains the monitoring setup for our OpenShift deployment using Prometheus and Grafana.

## Quick Start

```bash
# 1. Create monitoring namespace
oc new-project monitoring

# 2. Deploy Prometheus
oc apply -f prometheus/

# 3. Deploy Grafana
oc apply -f grafana/

# 4. Get Grafana route
oc get route grafana
```

## Components

### Prometheus
- Metrics collection
- Data storage
- Query interface
- Alert management

### Grafana
- Visualization
- Dashboards
- Alerting
- User management

## Architecture

```mermaid
graph TD
    subgraph Applications
        A[Spring Boot App] -->|Exposes| B[/actuator/prometheus]
        C[MySQL] -->|Exposes| D[MySQL Metrics]
    end
    
    subgraph Monitoring Stack
        E[Prometheus Server] -->|Scrapes| B
        E -->|Scrapes| D
        E -->|Data Source| F[Grafana]
        F -->|Displays| G[Dashboards]
    end
    
    subgraph Access
        H[OpenShift Route] -->|External Access| F
    end
```

## Configuration

### Prometheus

```yaml
# Key configurations in prometheus-configmap.yaml
scrape_configs:
  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: spring-boot-app
        action: keep
```

### Grafana

```yaml
# Default credentials
username: admin
password: admin

# Data source configuration
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090
```

## Dashboards

### Spring Boot Dashboard
- JVM Metrics
- HTTP Request Metrics
- Database Connection Pool
- Custom Business Metrics

### MySQL Dashboard
- Connection Stats
- Query Performance
- InnoDB Metrics
- System Resources

## Usage

1. **Access Grafana**:
   ```bash
   # Get Grafana URL
   oc get route grafana -o jsonpath='{.spec.host}'
   ```

2. **Import Dashboards**:
   - Login to Grafana
   - Go to Dashboards -> Import
   - Select dashboard JSON from dashboards/

3. **View Metrics**:
   - Spring Boot: http://your-app/actuator/prometheus
   - Prometheus: http://prometheus:9090
   - Grafana: http://grafana-route

## Maintenance

### Scaling
```bash
# Scale Prometheus
oc scale deployment prometheus --replicas=2

# Scale Grafana
oc scale deployment grafana --replicas=2
```

### Updates
```bash
# Update Prometheus config
oc create configmap prometheus-config --from-file=prometheus.yml -o yaml --dry-run=client | oc replace -f -

# Update Grafana
oc set image deployment/grafana grafana=grafana/grafana:latest
```

### Backup
```bash
# Backup Grafana dashboards
oc exec grafana-pod -- curl -X GET http://localhost:3000/api/dashboards/uid/your-dashboard-uid

# Backup Prometheus data
oc rsync prometheus-pod:/prometheus ./prometheus-backup
```

## Troubleshooting

### Common Issues

1. **Prometheus Not Scraping**:
   ```bash
   # Check Prometheus targets
   curl http://prometheus:9090/api/v1/targets
   ```

2. **Grafana Can't Connect**:
   ```bash
   # Check Prometheus service
   oc get svc prometheus
   ```

3. **Missing Metrics**:
   ```bash
   # Check Spring Boot actuator
   curl http://your-app/actuator/prometheus
   ```

### Debug Commands
```bash
# Check Prometheus logs
oc logs -l app=prometheus

# Check Grafana logs
oc logs -l app=grafana

# Check configurations
oc describe configmap prometheus-config
```

## Security

1. **Authentication**:
   - Grafana: OAuth integration available
   - Prometheus: Network policies

2. **Authorization**:
   - RBAC for Prometheus
   - Grafana organizations and teams

3. **Network**:
   - Internal services not exposed
   - TLS for routes
