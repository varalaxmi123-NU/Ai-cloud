import { ServiceNode, DependencyEdge, CascadeResult, RemediationPlaybook } from "@/types/sre";

export const INITIAL_SERVICES: ServiceNode[] = [
  {
    id: "api-gateway",
    name: "API Gateway (Kong/Envoy)",
    tier: "edge",
    description: "Public ingress router and edge SSL/WAF terminator",
    status: "healthy",
    health_score: 99.4,
    latency_ms: 14.2,
    baseline_latency: 14.0,
    error_rate: 0.02,
    baseline_error_rate: 0.02,
    cpu_pct: 32.5,
    memory_pct: 45.1,
    rps: 12450,
    replicas: 8,
    environment: "production-us-east",
    technology: "Envoy / Go Proxy",
    business_criticality: "TIER-0 (Catastrophic)",
    x: 450,
    y: 70,
    in_degree: 0,
    out_degree: 3,
    bottleneck_centrality: 0.35,
    ml_anomaly: {
      is_anomaly: false,
      anomaly_confidence: 2.1,
      severity: "NORMAL",
      model: "IsolationForest (Scikit-Learn Ensemble)"
    }
  },
  {
    id: "auth-service",
    name: "Auth & Identity (OAuth2)",
    tier: "core",
    description: "JWT session signing, IAM, and OAuth token validation",
    status: "healthy",
    health_score: 98.8,
    latency_ms: 18.5,
    baseline_latency: 18.0,
    error_rate: 0.04,
    baseline_error_rate: 0.04,
    cpu_pct: 38.2,
    memory_pct: 52.0,
    rps: 6800,
    replicas: 4,
    environment: "production-us-east",
    technology: "Rust / Axum",
    business_criticality: "TIER-1 (High)",
    x: 220,
    y: 195,
    in_degree: 1,
    out_degree: 2,
    bottleneck_centrality: 0.28,
    ml_anomaly: {
      is_anomaly: false,
      anomaly_confidence: 3.4,
      severity: "NORMAL",
      model: "IsolationForest (Scikit-Learn Ensemble)"
    }
  },
  {
    id: "user-service",
    name: "User Profile Service",
    tier: "core",
    description: "Customer profiles, account preferences, and RBAC policies",
    status: "healthy",
    health_score: 99.1,
    latency_ms: 22.3,
    baseline_latency: 22.0,
    error_rate: 0.03,
    baseline_error_rate: 0.03,
    cpu_pct: 41.0,
    memory_pct: 48.7,
    rps: 4200,
    replicas: 4,
    environment: "production-us-east",
    technology: "Node.js / Express",
    business_criticality: "TIER-2 (Medium)",
    x: 450,
    y: 215,
    in_degree: 1,
    out_degree: 2,
    bottleneck_centrality: 0.19,
    ml_anomaly: {
      is_anomaly: false,
      anomaly_confidence: 1.8,
      severity: "NORMAL",
      model: "IsolationForest (Scikit-Learn Ensemble)"
    }
  },
  {
    id: "payment-gateway",
    name: "Payment & Checkout Core",
    tier: "business",
    description: "Processes Stripe & banking transactions, ledger records",
    status: "healthy",
    health_score: 99.7,
    latency_ms: 48.6,
    baseline_latency: 48.0,
    error_rate: 0.01,
    baseline_error_rate: 0.01,
    cpu_pct: 46.8,
    memory_pct: 61.2,
    rps: 3100,
    replicas: 6,
    environment: "production-us-east",
    technology: "Java 21 / Spring Boot",
    business_criticality: "TIER-0 (Catastrophic)",
    x: 690,
    y: 195,
    in_degree: 1,
    out_degree: 3,
    bottleneck_centrality: 0.42,
    ml_anomaly: {
      is_anomaly: false,
      anomaly_confidence: 2.9,
      severity: "NORMAL",
      model: "IsolationForest (Scikit-Learn Ensemble)"
    }
  },
  {
    id: "inventory-service",
    name: "Inventory & Stock Engine",
    tier: "business",
    description: "Real-time SKU reservation and warehouse sync",
    status: "healthy",
    health_score: 97.9,
    latency_ms: 26.4,
    baseline_latency: 26.0,
    error_rate: 0.05,
    baseline_error_rate: 0.05,
    cpu_pct: 39.5,
    memory_pct: 44.0,
    rps: 2900,
    replicas: 3,
    environment: "production-us-east",
    technology: "Go 1.22",
    business_criticality: "TIER-2 (Medium)",
    x: 840,
    y: 335,
    in_degree: 1,
    out_degree: 1,
    bottleneck_centrality: 0.12,
    ml_anomaly: {
      is_anomaly: false,
      anomaly_confidence: 4.1,
      severity: "NORMAL",
      model: "IsolationForest (Scikit-Learn Ensemble)"
    }
  },
  {
    id: "database-service",
    name: "Postgres Primary Cluster",
    tier: "persistence",
    description: "Primary write master DB cluster (Pgpool + Patroni HA)",
    status: "healthy",
    health_score: 99.2,
    latency_ms: 8.7,
    baseline_latency: 8.5,
    error_rate: 0.01,
    baseline_error_rate: 0.01,
    cpu_pct: 54.1,
    memory_pct: 72.4,
    rps: 18200,
    replicas: 3,
    environment: "production-us-east",
    technology: "PostgreSQL 16 HA Cluster",
    business_criticality: "TIER-0 (Core Infrastructure)",
    x: 450,
    y: 375,
    in_degree: 4,
    out_degree: 0,
    bottleneck_centrality: 0.68,
    ml_anomaly: {
      is_anomaly: false,
      anomaly_confidence: 3.8,
      severity: "NORMAL",
      model: "IsolationForest (Scikit-Learn Ensemble)"
    }
  },
  {
    id: "redis-cache",
    name: "Redis Distributed Cache",
    tier: "persistence",
    description: "Session store, rate limiting counters, and L2 query cache",
    status: "healthy",
    health_score: 99.9,
    latency_ms: 2.1,
    baseline_latency: 2.0,
    error_rate: 0.005,
    baseline_error_rate: 0.005,
    cpu_pct: 24.3,
    memory_pct: 68.0,
    rps: 35400,
    replicas: 6,
    environment: "production-us-east",
    technology: "Redis 7.2 Cluster",
    business_criticality: "TIER-1 (High)",
    x: 175,
    y: 360,
    in_degree: 2,
    out_degree: 0,
    bottleneck_centrality: 0.31,
    ml_anomaly: {
      is_anomaly: false,
      anomaly_confidence: 1.2,
      severity: "NORMAL",
      model: "IsolationForest (Scikit-Learn Ensemble)"
    }
  },
  {
    id: "notification-service",
    name: "Kafka & Notification Engine",
    tier: "async",
    description: "Webhooks, transactional SMS/Email, and event ingestion",
    status: "healthy",
    health_score: 98.4,
    latency_ms: 34.0,
    baseline_latency: 34.0,
    error_rate: 0.08,
    baseline_error_rate: 0.08,
    cpu_pct: 36.1,
    memory_pct: 49.3,
    rps: 5600,
    replicas: 4,
    environment: "production-us-east",
    technology: "Apache Kafka + Python Worker",
    business_criticality: "TIER-3 (Low/Degradable)",
    x: 690,
    y: 375,
    in_degree: 1,
    out_degree: 0,
    bottleneck_centrality: 0.08,
    ml_anomaly: {
      is_anomaly: false,
      anomaly_confidence: 2.5,
      severity: "NORMAL",
      model: "IsolationForest (Scikit-Learn Ensemble)"
    }
  }
];

export const EDGES: DependencyEdge[] = [
  { source: "api-gateway", target: "auth-service", volume: "6.8k req/s", critical: true },
  { source: "api-gateway", target: "user-service", volume: "4.2k req/s", critical: true },
  { source: "api-gateway", target: "payment-gateway", volume: "3.1k req/s", critical: true },
  { source: "auth-service", target: "redis-cache", volume: "14.2k req/s", critical: true },
  { source: "auth-service", target: "database-service", volume: "2.1k req/s", critical: true },
  { source: "user-service", target: "redis-cache", volume: "5.6k req/s", critical: false },
  { source: "user-service", target: "database-service", volume: "4.1k req/s", critical: true },
  { source: "payment-gateway", target: "database-service", volume: "3.1k req/s", critical: true },
  { source: "payment-gateway", target: "inventory-service", volume: "2.9k req/s", critical: true },
  { source: "payment-gateway", target: "notification-service", volume: "1.8k req/s", critical: false },
  { source: "inventory-service", target: "database-service", volume: "2.8k req/s", critical: true }
];

// In-memory state across requests
let clusterServices: ServiceNode[] = JSON.parse(JSON.stringify(INITIAL_SERVICES));
let activeChaosState: any = null;

export function getClusterState() {
  const criticalCount = clusterServices.filter((s) => s.status === "critical").length;
  const warningCount = clusterServices.filter((s) => s.status === "warning").length;

  let system_status: "HEALTHY" | "ELEVATED_CASCADE_WARNING" | "CRITICAL_CASCADE_RISK" = "HEALTHY";
  if (criticalCount > 0) system_status = "CRITICAL_CASCADE_RISK";
  else if (warningCount > 0) system_status = "ELEVATED_CASCADE_WARNING";

  return {
    system_status,
    nodes: clusterServices,
    edges: EDGES,
    active_chaos: activeChaosState,
    summary: {
      total_services: clusterServices.length,
      healthy_services: clusterServices.filter((s) => s.status === "healthy").length,
      failing_services: criticalCount,
      warning_services: warningCount,
      active_incidents: activeChaosState ? 1 : 0,
      overall_health_score: Math.round(
        clusterServices.reduce((acc, s) => acc + s.health_score, 0) / clusterServices.length
      ),
      total_rps: clusterServices.reduce((acc, s) => acc + s.rps, 0)
    }
  };
}

export function simulateFailure(serviceId: string, scenario: string): CascadeResult {
  const target = clusterServices.find((s) => s.id === serviceId) || clusterServices[5];

  // Graph traversal to find all callers
  const callersMap: Record<string, string[]> = {};
  EDGES.forEach((e) => {
    if (!callersMap[e.target]) callersMap[e.target] = [];
    callersMap[e.target].push(e.source);
  });

  const impacted: any[] = [];
  impacted.push({
    service_id: target.id,
    name: target.name,
    stage: "T+0s (Immediate Root Cause)",
    cascade_probability: 99.8,
    status: "CRITICAL_FAILURE",
    projected_latency_ms: 3840.0,
    projected_error_rate: 96.5,
    failure_mode: "Connection Pool Exhaustion & Thread Lock",
    blast_impact: "DIRECT_OUTAGE"
  });

  // Level 1 callers
  const l1 = callersMap[target.id] || [];
  l1.forEach((id) => {
    const s = clusterServices.find((item) => item.id === id);
    if (s) {
      impacted.push({
        service_id: s.id,
        name: s.name,
        stage: "T+3s (First-tier Backpressure)",
        cascade_probability: 88.5,
        status: "CASCADING_CRITICAL",
        projected_latency_ms: Math.round(s.baseline_latency * 45),
        projected_error_rate: 68.2,
        failure_mode: `Upstream dependency [${target.name}] latency propagation`,
        blast_impact: "UPSTREAM_STARVATION"
      });
    }
  });

  // Level 2 callers (ingress gateway)
  if (serviceId !== "api-gateway") {
    const gw = clusterServices.find((s) => s.id === "api-gateway")!;
    impacted.push({
      service_id: gw.id,
      name: gw.name,
      stage: "T+7s (Edge Ingress 504 Timeout)",
      cascade_probability: 94.2,
      status: "CASCADING_CRITICAL",
      projected_latency_ms: 2400.0,
      projected_error_rate: 74.0,
      failure_mode: "Downstream 504 Gateway Timeouts across critical endpoints",
      blast_impact: "EDGE_SATURATION"
    });
  }

  // Mutate in-memory cluster state
  clusterServices.forEach((s) => {
    const imp = impacted.find((i) => i.service_id === s.id);
    if (imp) {
      s.status = imp.status.includes("CRITICAL") ? "critical" : "warning";
      s.health_score = s.id === serviceId ? 12.4 : 26.0;
      s.latency_ms = imp.projected_latency_ms;
      s.error_rate = imp.projected_error_rate;
      s.cpu_pct = 95.2;
      s.ml_anomaly = {
        is_anomaly: true,
        anomaly_confidence: imp.cascade_probability,
        severity: "CRITICAL",
        model: "IsolationForest (Scikit-Learn Ensemble)"
      };
    }
  });

  const playbooks: RemediationPlaybook[] = [
    {
      id: "PLAYBOOK_DB_FAILOVER",
      title: "Autonomous Read-Replica Promotion & PgBouncer Failover",
      recommended: true,
      confidence_score: 98.7,
      estimated_recovery_time_sec: 4.2,
      risk_level: "LOW",
      summary: "Promote standby replica `postgres-replica-02` in AZ us-east-1b to primary master; repoint connection pool and isolate failing master.",
      actions: [
        "kubectl exec -n db patroni-0 -- patronictl failover --candidate patroni-2 --force",
        "pgbouncer-admin -c 'RELOAD' -p /etc/pgbouncer/pgbouncer.ini",
        "istioctl proxy-config endpoints payment-gateway-pod.default | grep 5432",
        "echo 'Failover complete. Latency restored to < 10ms.'"
      ]
    },
    {
      id: "PLAYBOOK_CIRCUIT_BREAKER",
      title: "Circuit Breaker Trip & L2 Redis Stale Fallback",
      recommended: false,
      confidence_score: 87.2,
      estimated_recovery_time_sec: 1.8,
      risk_level: "MEDIUM",
      summary: "Trip Istio Envoy circuit breaker to immediately return degraded fallback responses from Redis instead of timing out.",
      actions: [
        "kubectl apply -f https://apx.sre.internal/circuit-breakers/db-hard-break.yaml",
        "redis-cli -h redis-cluster.internal CONFIG SET maxmemory-policy allkeys-lru"
      ]
    }
  ];

  const result: CascadeResult = {
    target_service_id: serviceId,
    scenario,
    timestamp: Date.now(),
    blast_radius_pct: Math.round((impacted.length / clusterServices.length) * 100),
    estimated_loss_per_min_usd: serviceId === "database-service" ? 13700 : 8400,
    impacted_users_rps: 24200,
    impacted_services: impacted,
    cascade_chain_ordered: impacted,
    playbooks
  };

  activeChaosState = {
    target_service_id: serviceId,
    scenario,
    injected_at: Date.now(),
    cascade_result: result
  };

  return result;
}

export function healCluster(serviceId: string, actionId: string) {
  clusterServices = JSON.parse(JSON.stringify(INITIAL_SERVICES));
  activeChaosState = null;

  return {
    status: "HEALED_SUCCESSFULLY",
    action_id: actionId,
    service_id: serviceId,
    execution_time_ms: 1240,
    mttr_saved_seconds: 1840,
    cost_prevented_usd: 184200,
    terminal_logs: [
      `[APEX-ORCHESTRATOR] Received remediation dispatch signal for: ${serviceId}`,
      `[POLICY-ENGINE] Verified operator permissions & IAM RBAC: OK`,
      `[AUTOMATION] Initiating Playbook: ${actionId} ...`,
      `[ISTIO-MESH] Applying circuit breaker & isolating degraded instances`,
      `[KUBERNETES] Spawning clean worker pods in AZ us-east-1b`,
      `[TRAFFIC-ROUTER] Shifting 100% ingress queries to healthy standby cluster`,
      `[HEALTH-PROBE] 3/3 liveness probes PASSED. Latency dropped to baseline.`,
      `[APEX-AI] Verification complete: Cascade chain neutralized. Zero data loss.`
    ]
  };
}

export function resetClusterState() {
  clusterServices = JSON.parse(JSON.stringify(INITIAL_SERVICES));
  activeChaosState = null;
  return { message: "Cluster reset to normal baseline state" };
}

export function getServiceTelemetry(serviceId: string) {
  const s = clusterServices.find((item) => item.id === serviceId) || clusterServices[0];
  const history = [];
  const now = Date.now();
  for (let i = 20; i >= 0; i--) {
    const t = new Date(now - i * 2000).toTimeString().split(" ")[0];
    history.push({
      timestamp: t,
      latency: Math.max(1, Math.round(s.latency_ms + (Math.random() * 4 - 2))),
      cpu: Math.max(5, Math.min(100, Math.round(s.cpu_pct + (Math.random() * 4 - 2)))),
      memory: Math.max(10, Math.min(100, Math.round(s.memory_pct + (Math.random() * 2 - 1)))),
      error_rate: Math.max(0, Number((s.error_rate + (Math.random() * 0.02 - 0.01)).toFixed(3))),
      rps: Math.round(s.rps * (1 + (Math.random() * 0.08 - 0.04)))
    });
  }

  const isFailing = s.status === "critical";
  return {
    service_id: s.id,
    name: s.name,
    status: s.status,
    health_score: s.health_score,
    current_metrics: {
      latency_ms: s.latency_ms,
      cpu_pct: s.cpu_pct,
      memory_pct: s.memory_pct,
      error_rate: s.error_rate,
      rps: s.rps,
      replicas: s.replicas
    },
    ml_anomaly: s.ml_anomaly || {
      is_anomaly: isFailing,
      anomaly_confidence: isFailing ? 98.4 : 2.5,
      severity: isFailing ? "CRITICAL" : "NORMAL",
      model: "IsolationForest (Scikit-Learn Ensemble)"
    },
    history,
    logs: isFailing
      ? [
          { level: "CRITICAL" as const, time: "Just now", message: `[FATAL] 503 ConnectionPoolExhausted: Pool size 200 reached in ${s.id}` },
          { level: "ERROR" as const, time: "2s ago", message: `[ERROR] TimeoutException: upstream service did not respond within 3000ms deadline` },
          { level: "WARN" as const, time: "5s ago", message: `[WARN] Thread pool usage at 98.4%, queue length = 1420` }
        ]
      : [
          { level: "INFO" as const, time: "Just now", message: `[INFO] Service mesh health probe OK (200 OK, latency ${s.latency_ms}ms)` },
          { level: "INFO" as const, time: "3s ago", message: `[INFO] Handled ${Math.round(s.rps / 10)} requests with 0 dropped frames` },
          { level: "INFO" as const, time: "8s ago", message: `[INFO] Garbage collection cycle took 1.1ms (Gen0: 12MB freed)` }
        ]
  };
}
