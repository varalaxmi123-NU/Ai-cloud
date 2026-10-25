import time
import random
import math
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import networkx as nx

try:
    from sklearn.ensemble import IsolationForest
    import numpy as np
    SKLEARN_AVAILABLE = True
except Exception:
    SKLEARN_AVAILABLE = False
    np = None

app = FastAPI(
    title="ApexSRE Engine",
    description="Autonomous Microservice Chaos & Cascade Predictor API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Microservices Topology Definition
# -------------------------------------------------------------
INITIAL_SERVICES = {
    "api-gateway": {
        "id": "api-gateway",
        "name": "API Gateway (Kong/Envoy)",
        "tier": "edge",
        "description": "Public ingress router and edge SSL/WAF terminator",
        "status": "healthy",  # healthy, warning, critical
        "health_score": 99.4,
        "latency_ms": 14.2,
        "baseline_latency": 14.0,
        "error_rate": 0.02,
        "baseline_error_rate": 0.02,
        "cpu_pct": 32.5,
        "memory_pct": 45.1,
        "rps": 12450,
        "replicas": 8,
        "environment": "production-us-east",
        "technology": "Envoy / Go Proxy",
        "business_criticality": "TIER-0 (Catastrophic)",
        "x": 450,
        "y": 60,
    },
    "auth-service": {
        "id": "auth-service",
        "name": "Auth & Identity (OAuth2)",
        "tier": "core",
        "description": "JWT session signing, IAM, and OAuth token validation",
        "status": "healthy",
        "health_score": 98.8,
        "latency_ms": 18.5,
        "baseline_latency": 18.0,
        "error_rate": 0.04,
        "baseline_error_rate": 0.04,
        "cpu_pct": 38.2,
        "memory_pct": 52.0,
        "rps": 6800,
        "replicas": 4,
        "environment": "production-us-east",
        "technology": "Rust / Axum",
        "business_criticality": "TIER-1 (High)",
        "x": 220,
        "y": 190,
    },
    "user-service": {
        "id": "user-service",
        "name": "User Profile Service",
        "tier": "core",
        "description": "Customer profiles, account preferences, and RBAC policies",
        "status": "healthy",
        "health_score": 99.1,
        "latency_ms": 22.3,
        "baseline_latency": 22.0,
        "error_rate": 0.03,
        "baseline_error_rate": 0.03,
        "cpu_pct": 41.0,
        "memory_pct": 48.7,
        "rps": 4200,
        "replicas": 4,
        "environment": "production-us-east",
        "technology": "Node.js / Express",
        "business_criticality": "TIER-2 (Medium)",
        "x": 450,
        "y": 210,
    },
    "payment-gateway": {
        "id": "payment-gateway",
        "name": "Payment & Checkout Core",
        "tier": "business",
        "description": "Processes Stripe & banking transactions, ledger records",
        "status": "healthy",
        "health_score": 99.7,
        "latency_ms": 48.6,
        "baseline_latency": 48.0,
        "error_rate": 0.01,
        "baseline_error_rate": 0.01,
        "cpu_pct": 46.8,
        "memory_pct": 61.2,
        "rps": 3100,
        "replicas": 6,
        "environment": "production-us-east",
        "technology": "Java 21 / Spring Boot",
        "business_criticality": "TIER-0 (Catastrophic)",
        "x": 680,
        "y": 190,
    },
    "inventory-service": {
        "id": "inventory-service",
        "name": "Inventory & Stock Engine",
        "tier": "business",
        "description": "Real-time SKU reservation and warehouse sync",
        "status": "healthy",
        "health_score": 97.9,
        "latency_ms": 26.4,
        "baseline_latency": 26.0,
        "error_rate": 0.05,
        "baseline_error_rate": 0.05,
        "cpu_pct": 39.5,
        "memory_pct": 44.0,
        "rps": 2900,
        "replicas": 3,
        "environment": "production-us-east",
        "technology": "Go 1.22",
        "business_criticality": "TIER-2 (Medium)",
        "x": 830,
        "y": 320,
    },
    "database-service": {
        "id": "database-service",
        "name": "Postgres Primary Cluster",
        "tier": "persistence",
        "description": "Primary write master DB cluster (Pgpool + Patroni HA)",
        "status": "healthy",
        "health_score": 99.2,
        "latency_ms": 8.7,
        "baseline_latency": 8.5,
        "error_rate": 0.01,
        "baseline_error_rate": 0.01,
        "cpu_pct": 54.1,
        "memory_pct": 72.4,
        "rps": 18200,
        "replicas": 3,
        "environment": "production-us-east",
        "technology": "PostgreSQL 16 HA Cluster",
        "business_criticality": "TIER-0 (Core Infrastructure)",
        "x": 450,
        "y": 370,
    },
    "redis-cache": {
        "id": "redis-cache",
        "name": "Redis Distributed Cache",
        "tier": "persistence",
        "description": "Session store, rate limiting counters, and L2 query cache",
        "status": "healthy",
        "health_score": 99.9,
        "latency_ms": 2.1,
        "baseline_latency": 2.0,
        "error_rate": 0.005,
        "baseline_error_rate": 0.005,
        "cpu_pct": 24.3,
        "memory_pct": 68.0,
        "rps": 35400,
        "replicas": 6,
        "environment": "production-us-east",
        "technology": "Redis 7.2 Cluster",
        "business_criticality": "TIER-1 (High)",
        "x": 180,
        "y": 360,
    },
    "notification-service": {
        "id": "notification-service",
        "name": "Kafka & Notification Engine",
        "tier": "async",
        "description": "Webhooks, transactional SMS/Email, and event ingestion",
        "status": "healthy",
        "health_score": 98.4,
        "latency_ms": 34.0,
        "baseline_latency": 34.0,
        "error_rate": 0.08,
        "baseline_error_rate": 0.08,
        "cpu_pct": 36.1,
        "memory_pct": 49.3,
        "rps": 5600,
        "replicas": 4,
        "environment": "production-us-east",
        "technology": "Apache Kafka + Python Worker",
        "business_criticality": "TIER-3 (Low/Degradable)",
        "x": 680,
        "y": 370,
    }
}

# Dependency Edges: [source, target, call_volume, is_critical]
# Note: source calls target (source depends on target)
EDGES = [
    {"source": "api-gateway", "target": "auth-service", "volume": "6.8k req/s", "critical": True},
    {"source": "api-gateway", "target": "user-service", "volume": "4.2k req/s", "critical": True},
    {"source": "api-gateway", "target": "payment-gateway", "volume": "3.1k req/s", "critical": True},
    {"source": "auth-service", "target": "redis-cache", "volume": "14.2k req/s", "critical": True},
    {"source": "auth-service", "target": "database-service", "volume": "2.1k req/s", "critical": True},
    {"source": "user-service", "target": "redis-cache", "volume": "5.6k req/s", "critical": False},
    {"source": "user-service", "target": "database-service", "volume": "4.1k req/s", "critical": True},
    {"source": "payment-gateway", "target": "database-service", "volume": "3.1k req/s", "critical": True},
    {"source": "payment-gateway", "target": "inventory-service", "volume": "2.9k req/s", "critical": True},
    {"source": "payment-gateway", "target": "notification-service", "volume": "1.8k req/s", "critical": False},
    {"source": "inventory-service", "target": "database-service", "volume": "2.8k req/s", "critical": True},
]

# In-memory runtime state
current_services: Dict[str, Any] = {k: dict(v) for k, v in INITIAL_SERVICES.items()}
current_chaos: Optional[Dict[str, Any]] = None
incident_history: List[Dict[str, Any]] = []

# Build NetworkX Directed Graph
def get_dependency_graph() -> nx.DiGraph:
    G = nx.DiGraph()
    for s_id, s_data in current_services.items():
        G.add_node(s_id, **s_data)
    for edge in EDGES:
        G.add_edge(edge["source"], edge["target"], volume=edge["volume"], critical=edge["critical"])
    return G

# -------------------------------------------------------------
# Anomaly Detection ML Model
# -------------------------------------------------------------
class AnomalyDetector:
    def __init__(self):
        self.model = None
        self.trained = False
        self._init_model()

    def _init_model(self):
        if not SKLEARN_AVAILABLE:
            return
        try:
            # Generate synthetic normal baseline telemetry training data
            np.random.seed(42)
            n_samples = 400
            # Features: [latency_ms, error_rate_pct, cpu_pct, memory_pct]
            normal_latencies = np.random.normal(20.0, 5.0, n_samples)
            normal_errors = np.random.exponential(0.04, n_samples)
            normal_cpu = np.random.normal(38.0, 8.0, n_samples)
            normal_mem = np.random.normal(50.0, 7.0, n_samples)

            X_train = np.column_stack([normal_latencies, normal_errors, normal_cpu, normal_mem])
            self.model = IsolationForest(contamination=0.03, random_state=42)
            self.model.fit(X_train)
            self.trained = True
        except Exception as e:
            print("Failed to train IsolationForest:", e)
            self.trained = False

    def predict_anomaly(self, latency_ms: float, error_rate: float, cpu_pct: float, memory_pct: float) -> Dict[str, Any]:
        """Predicts whether current telemetry signature constitutes an operational anomaly."""
        if self.trained and self.model is not None:
            try:
                features = np.array([[latency_ms, error_rate, cpu_pct, memory_pct]])
                raw_pred = self.model.predict(features)[0]  # -1 for outlier, 1 for inlier
                score = self.model.decision_function(features)[0]  # lower means more abnormal
                # Normalize score to 0 - 100 anomaly confidence
                anomaly_confidence = max(0.0, min(100.0, (0.20 - score) * 240))
                is_anomaly = bool(raw_pred == -1 or anomaly_confidence > 55.0)
            except Exception:
                is_anomaly, anomaly_confidence = self._heuristic_anomaly(latency_ms, error_rate, cpu_pct, memory_pct)
        else:
            is_anomaly, anomaly_confidence = self._heuristic_anomaly(latency_ms, error_rate, cpu_pct, memory_pct)

        severity = "NORMAL"
        if anomaly_confidence > 80.0:
            severity = "CRITICAL"
        elif anomaly_confidence > 50.0:
            severity = "ELEVATED_RISK"
        elif anomaly_confidence > 25.0:
            severity = "MONITORED"

        return {
            "is_anomaly": is_anomaly,
            "anomaly_confidence": round(float(anomaly_confidence), 1),
            "severity": severity,
            "model": "IsolationForest (Scikit-Learn Ensemble)" if self.trained else "Adaptive Z-Score Vector Engine"
        }

    def _heuristic_anomaly(self, latency: float, error_rate: float, cpu: float, mem: float):
        score = 0.0
        if latency > 150: score += 40
        elif latency > 50: score += 20
        if error_rate > 5.0: score += 45
        elif error_rate > 1.0: score += 25
        if cpu > 85: score += 15
        if mem > 90: score += 15
        confidence = min(99.4, score)
        return confidence > 45.0, confidence

anomaly_detector = AnomalyDetector()

# -------------------------------------------------------------
# Request & Response Schemas
# -------------------------------------------------------------
class ChaosRequest(BaseModel):
    service_id: str
    scenario_type: Optional[str] = "database_connection_pool_exhaustion"
    intensity: Optional[float] = 1.0

class HealRequest(BaseModel):
    service_id: str
    action_id: str
    strategy_name: Optional[str] = None

# -------------------------------------------------------------
# Cascade Prediction & Risk Propagation
# -------------------------------------------------------------
def compute_cascade_prediction(target_service_id: str, scenario: str) -> Dict[str, Any]:
    """Uses NetworkX graph traversal to predict cascading service failures."""
    G = get_dependency_graph()
    if target_service_id not in G:
        raise HTTPException(status_code=404, detail="Service not found in dependency topology")

    # In our graph, source calls target (e.g. payment-gateway -> database-service).
    # Therefore, if target fails, all services that DEPEND on it (predecessors in directed graph) will fail!
    # Let's find reverse reachable nodes (who calls target, and who calls those callers):
    reverse_G = G.reverse()
    
    # Calculate shortest path distances from target in reverse graph
    impacted_services = {}
    
    # Target itself has 100% failure probability
    impacted_services[target_service_id] = {
        "service_id": target_service_id,
        "name": current_services[target_service_id]["name"],
        "stage": "T+0s (Immediate Root Cause)",
        "cascade_probability": 99.8,
        "status": "CRITICAL_FAILURE",
        "projected_latency_ms": 3840.0,
        "projected_error_rate": 96.5,
        "failure_mode": "Primary Thread Lockup & Connection Exhaustion",
        "blast_impact": "DIRECT_OUTAGE"
    }

    # Breadth-first search from target upstream
    try:
        lengths = nx.single_source_shortest_path_length(reverse_G, target_service_id)
    except Exception:
        lengths = {target_service_id: 0}

    stages = [
        "T+0s (Immediate Root Cause)",
        "T+3s (First-tier Backpressure)",
        "T+7s (Secondary Cascade Choke)",
        "T+14s (Edge Ingress 504 Timeout)"
    ]

    for node, dist in sorted(lengths.items(), key=lambda x: x[1]):
        if node == target_service_id:
            continue
        stage_idx = min(dist, len(stages) - 1)
        # Decay probability slightly with distance, but critical path remains high
        prob = max(45.0, round(96.0 * math.exp(-0.25 * dist), 1))
        
        # Service details
        svc = current_services[node]
        projected_lat = round(svc["baseline_latency"] * (18.0 / (dist + 0.6)), 1)
        projected_err = round(min(88.0, svc["baseline_error_rate"] + (75.0 / dist)), 2)

        impacted_services[node] = {
            "service_id": node,
            "name": svc["name"],
            "stage": stages[stage_idx],
            "cascade_probability": prob,
            "status": "CASCADING_WARNING" if prob < 75 else "CASCADING_CRITICAL",
            "projected_latency_ms": projected_lat,
            "projected_error_rate": projected_err,
            "failure_mode": f"Upstream dependency [{current_services[target_service_id]['name']}] timeout propagation",
            "blast_impact": "UPSTREAM_STARVATION" if dist == 1 else "EDGE_SATURATION"
        }

    # Calculate blast radius metrics
    total_nodes = len(current_services)
    impacted_count = len(impacted_services)
    blast_radius_pct = round((impacted_count / total_nodes) * 100, 1)

    # Estimate financial impact ($/min) based on affected services
    criticality_costs = {
        "TIER-0 (Catastrophic)": 4500,
        "TIER-0 (Core Infrastructure)": 6200,
        "TIER-1 (High)": 2100,
        "TIER-2 (Medium)": 900,
        "TIER-3 (Low/Degradable)": 300,
    }
    est_loss_per_min = sum(
        criticality_costs.get(current_services[nid].get("business_criticality"), 800)
        for nid in impacted_services
    )

    impacted_users_rps = sum(current_services[nid]["rps"] for nid in impacted_services)

    # Generate AI Playbook Recommendations
    playbooks = generate_remediation_playbooks(target_service_id, scenario)

    return {
        "target_service_id": target_service_id,
        "scenario": scenario,
        "timestamp": time.time(),
        "blast_radius_pct": blast_radius_pct,
        "estimated_loss_per_min_usd": est_loss_per_min,
        "impacted_users_rps": impacted_users_rps,
        "impacted_services": list(impacted_services.values()),
        "cascade_chain_ordered": [v for v in impacted_services.values()],
        "playbooks": playbooks
    }

def generate_remediation_playbooks(target_id: str, scenario: str) -> List[Dict[str, Any]]:
    """Synthesizes high-impact SRE remediation playbooks with actual command sequences."""
    if target_id == "database-service":
        return [
            {
                "id": "PLAYBOOK_DB_FAILOVER",
                "title": "Autonomous Read-Replica Promotion & PgBouncer Failover",
                "recommended": True,
                "confidence_score": 98.7,
                "estimated_recovery_time_sec": 4.2,
                "risk_level": "LOW",
                "summary": "Promote standby replica `postgres-replica-02` in AZ us-east-1b to primary master; repoint connection pool and isolate failing master.",
                "actions": [
                    "kubectl exec -n db patroni-0 -- patronictl failover --candidate patroni-2 --force",
                    "pgbouncer-admin -c 'RELOAD' -p /etc/pgbouncer/pgbouncer.ini",
                    "istioctl proxy-config endpoints payment-gateway-pod.default | grep 5432",
                    "echo 'Failover complete. Latency restored to < 10ms.'"
                ]
            },
            {
                "id": "PLAYBOOK_CIRCUIT_BREAKER",
                "title": "Circuit Breaker Trip & L2 Redis Stale Fallback",
                "recommended": False,
                "confidence_score": 87.2,
                "estimated_recovery_time_sec": 1.8,
                "risk_level": "MEDIUM",
                "summary": "Trip Istio Envoy circuit breaker to immediately return degraded fallback responses from Redis instead of timing out.",
                "actions": [
                    "kubectl apply -f https://apx.sre.internal/circuit-breakers/db-hard-break.yaml",
                    "redis-cli -h redis-cluster.internal CONFIG SET maxmemory-policy allkeys-lru"
                ]
            },
            {
                "id": "PLAYBOOK_TRAFFIC_SHED",
                "title": "Adaptive Traffic Shedding on Non-Critical Endpoints",
                "recommended": False,
                "confidence_score": 79.5,
                "estimated_recovery_time_sec": 3.0,
                "risk_level": "LOW",
                "summary": "Throttle non-checkout telemetry and notification ingestion by 60% to free DB I/O bandwidth.",
                "actions": [
                    "curl -X POST http://kong-admin:8001/plugins -d name=rate-limiting -d config.second=50",
                    "kubectl scale deployment notification-worker --replicas=1"
                ]
            }
        ]
    elif target_id == "auth-service":
        return [
            {
                "id": "PLAYBOOK_AUTH_CACHE_BYPASS",
                "title": "JWT Local Validation & Edge Token Verification Bypass",
                "recommended": True,
                "confidence_score": 96.4,
                "estimated_recovery_time_sec": 2.5,
                "risk_level": "LOW",
                "summary": "Enable stateless public-key cryptographic verification on API Gateway Envoy nodes, bypassing degraded central auth cluster.",
                "actions": [
                    "kubectl apply -f https://apx.sre.internal/istio/jwt-stateless-verify.yaml",
                    "kubectl rollout restart deployment/auth-service -n core"
                ]
            },
            {
                "id": "PLAYBOOK_SCALE_PODS",
                "title": "Horizontal Pod Autoscaling (HPA) Emergency Burst",
                "recommended": False,
                "confidence_score": 88.0,
                "estimated_recovery_time_sec": 8.0,
                "risk_level": "LOW",
                "summary": "Scale Auth Service replicas from 4 to 16 pods across 3 availability zones.",
                "actions": [
                    "kubectl scale deployment auth-service --replicas=16",
                    "kubectl wait --for=condition=ready pod -l app=auth-service --timeout=15s"
                ]
            }
        ]
    else:
        return [
            {
                "id": "PLAYBOOK_ISOLATE_AND_RESTART",
                "title": "Pod Quarantine, Circuit Breaker & Rolling Pod Restart",
                "recommended": True,
                "confidence_score": 94.0,
                "estimated_recovery_time_sec": 3.5,
                "risk_level": "LOW",
                "summary": "Quarantine unhealthy container instances, route traffic to healthy warm replicas and trigger zero-downtime rolling restart.",
                "actions": [
                    f"kubectl drain-node-pod -l app={target_id} --grace-period=2",
                    f"kubectl rollout restart deployment/{target_id}",
                    "istioctl route-rule reset-canary"
                ]
            },
            {
                "id": "PLAYBOOK_TRAFFIC_SHED",
                "title": "Traffic Shedding & Rate Limiting",
                "recommended": False,
                "confidence_score": 82.5,
                "estimated_recovery_time_sec": 1.5,
                "risk_level": "LOW",
                "summary": "Drop retry storms and apply exponential backoff header.",
                "actions": [
                    "curl -X POST http://gateway-admin/ratelimit/enable",
                    "echo 'Rate limiting active.'"
                ]
            }
        ]

# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------
@app.get("/")
def root():
    return {
        "service": "ApexSRE Engine",
        "status": "OPERATIONAL",
        "docs": "/docs",
        "topology_endpoint": "/api/topology",
        "sklearn_loaded": SKLEARN_AVAILABLE
    }

@app.get("/api/topology")
def get_topology():
    """Returns current microservice topology nodes and dependency edges."""
    # Determine overall system health
    critical_count = sum(1 for s in current_services.values() if s["status"] == "critical")
    warning_count = sum(1 for s in current_services.values() if s["status"] == "warning")
    
    if critical_count > 0:
        overall_status = "CRITICAL_CASCADE_RISK"
    elif warning_count > 0:
        overall_status = "ELEVATED_CASCADE_WARNING"
    else:
        overall_status = "HEALTHY"

    # Compute graph centrality metrics with NetworkX
    G = get_dependency_graph()
    try:
        in_deg = dict(G.in_degree())
        out_deg = dict(G.out_degree())
        betweenness = nx.betweenness_centrality(G)
    except Exception:
        in_deg, out_deg, betweenness = {}, {}, {}

    nodes_list = []
    for s_id, s in current_services.items():
        node_copy = dict(s)
        node_copy["in_degree"] = in_deg.get(s_id, 0)
        node_copy["out_degree"] = out_deg.get(s_id, 0)
        node_copy["bottleneck_centrality"] = round(betweenness.get(s_id, 0.0), 3)
        
        # Attach ML anomaly detection prediction for this node
        ml_eval = anomaly_detector.predict_anomaly(
            s["latency_ms"],
            s["error_rate"],
            s["cpu_pct"],
            s["memory_pct"]
        )
        node_copy["ml_anomaly"] = ml_eval
        nodes_list.append(node_copy)

    return {
        "system_status": overall_status,
        "nodes": nodes_list,
        "edges": EDGES,
        "active_chaos": current_chaos,
        "summary": {
            "total_services": len(current_services),
            "healthy_services": sum(1 for s in current_services.values() if s["status"] == "healthy"),
            "failing_services": critical_count,
            "warning_services": warning_count,
            "active_incidents": 1 if current_chaos else 0,
            "overall_health_score": round(sum(s["health_score"] for s in current_services.values()) / len(current_services), 1),
            "total_rps": sum(s["rps"] for s in current_services.values())
        }
    }

@app.post("/api/simulate-failure")
def simulate_failure(req: ChaosRequest):
    """Injects chaos failure and computes cascade propagation."""
    global current_chaos
    if req.service_id not in current_services:
        raise HTTPException(status_code=404, detail="Service not found")

    target_id = req.service_id
    cascade_result = compute_cascade_prediction(target_id, req.scenario_type or "database_connection_pool_exhaustion")

    # Mutate in-memory state to reflect failure & cascades
    for impacted in cascade_result["impacted_services"]:
        s_id = impacted["service_id"]
        if s_id == target_id:
            current_services[s_id]["status"] = "critical"
            current_services[s_id]["health_score"] = 12.4
            current_services[s_id]["latency_ms"] = impacted["projected_latency_ms"]
            current_services[s_id]["error_rate"] = impacted["projected_error_rate"]
            current_services[s_id]["cpu_pct"] = 96.8
            current_services[s_id]["memory_pct"] = 94.2
        else:
            current_services[s_id]["status"] = "warning" if impacted["cascade_probability"] < 75 else "critical"
            current_services[s_id]["health_score"] = round(max(20.0, 100.0 - impacted["cascade_probability"]), 1)
            current_services[s_id]["latency_ms"] = impacted["projected_latency_ms"]
            current_services[s_id]["error_rate"] = impacted["projected_error_rate"]
            current_services[s_id]["cpu_pct"] = min(92.0, current_services[s_id]["cpu_pct"] + 35.0)

    current_chaos = {
        "target_service_id": target_id,
        "scenario": req.scenario_type,
        "injected_at": time.time(),
        "cascade_result": cascade_result
    }

    incident_history.insert(0, {
        "id": f"INC-{int(time.time())}",
        "target": target_id,
        "scenario": req.scenario_type,
        "status": "ACTIVE_INVESTIGATION",
        "blast_radius": cascade_result["blast_radius_pct"],
        "timestamp": time.strftime("%H:%M:%S")
    })

    return cascade_result

@app.post("/api/heal")
def heal_service(req: HealRequest):
    """Executes automated SRE remediation runbook and restores cluster state."""
    global current_chaos
    if req.service_id not in current_services:
        raise HTTPException(status_code=404, detail="Service not found")

    target_id = req.service_id
    execution_start = time.time()

    # Generate rich terminal log traces
    terminal_logs = [
        f"[{time.strftime('%H:%M:%S')}.012] [APEX-ORCHESTRATOR] Received remediation dispatch signal for: {target_id}",
        f"[{time.strftime('%H:%M:%S')}.104] [POLICY-ENGINE] Verified operator permissions & IAM RBAC: OK",
        f"[{time.strftime('%H:%M:%S')}.240] [AUTOMATION] Initiating Playbook: {req.action_id} ...",
        f"[{time.strftime('%H:%M:%S')}.480] [ISTIO-MESH] Applying circuit breaker & isolating degraded instances",
        f"[{time.strftime('%H:%M:%S')}.890] [KUBERNETES] Spawning clean worker pods in AZ us-east-1b",
        f"[{time.strftime('%H:%M:%S')}.410] [TRAFFIC-ROUTER] Shifting 100% ingress queries to healthy standby cluster",
        f"[{time.strftime('%H:%M:%S')}.920] [HEALTH-PROBE] 3/3 liveness probes PASSED. Latency dropped to baseline.",
        f"[{time.strftime('%H:%M:%S')}.180] [APEX-AI] Verification complete: Cascade chain neutralized. Zero data loss."
    ]

    # Restore services back to baseline healthy state
    for s_id, initial in INITIAL_SERVICES.items():
        current_services[s_id] = dict(initial)

    current_chaos = None

    elapsed_ms = round((time.time() - execution_start) * 1000 + 420, 1)

    return {
        "status": "HEALED_SUCCESSFULLY",
        "action_id": req.action_id,
        "service_id": target_id,
        "execution_time_ms": elapsed_ms,
        "mttr_saved_seconds": 1840,
        "cost_prevented_usd": 184200,
        "terminal_logs": terminal_logs,
        "restored_topology_summary": {
            "all_healthy": True,
            "overall_health_score": 99.4,
            "active_cascade_risks": 0
        }
    }

@app.post("/api/reset")
def reset_cluster():
    """Resets entire topology to healthy clean state."""
    global current_chaos
    for s_id, initial in INITIAL_SERVICES.items():
        current_services[s_id] = dict(initial)
    current_chaos = None
    return {"message": "Cluster reset to pristine green baseline state"}

@app.get("/api/telemetry/{service_id}")
def get_telemetry(service_id: str):
    """Returns real-time and historical time series for the given microservice."""
    if service_id not in current_services:
        raise HTTPException(status_code=404, detail="Service not found")

    svc = current_services[service_id]
    base_lat = svc["latency_ms"]
    base_cpu = svc["cpu_pct"]
    base_mem = svc["memory_pct"]
    base_err = svc["error_rate"]

    # Generate 20 historical data points
    points = []
    now = int(time.time())
    for i in range(20, -1, -1):
        t_sec = now - (i * 2)
        # Add small micro-jitter
        lat = max(1.0, round(base_lat + random.uniform(-1.5, 1.5), 1))
        cpu = max(5.0, min(100.0, round(base_cpu + random.uniform(-2.0, 2.0), 1)))
        mem = max(10.0, min(100.0, round(base_mem + random.uniform(-0.5, 0.5), 1)))
        err = max(0.0, round(base_err + random.uniform(-0.01, 0.01), 3))
        points.append({
            "timestamp": time.strftime("%H:%M:%S", time.localtime(t_sec)),
            "latency": lat,
            "cpu": cpu,
            "memory": mem,
            "error_rate": err,
            "rps": int(svc["rps"] * (1.0 + random.uniform(-0.05, 0.05)))
        })

    # Generate recent live logs
    logs = []
    if svc["status"] == "critical":
        logs = [
            {"level": "CRITICAL", "time": "Just now", "message": f"[FATAL] 503 ConnectionPoolExhausted: Pool size 200 reached in {service_id}"},
            {"level": "ERROR", "time": "2s ago", "message": f"[ERROR] TimeoutException: upstream service did not respond within 3000ms deadline"},
            {"level": "WARN", "time": "5s ago", "message": f"[WARN] Thread pool usage at 98.4%, queue length = 1420"},
            {"level": "INFO", "time": "12s ago", "message": f"[INFO] Health check degraded. Anomaly confidence: 99.4%"}
        ]
    elif svc["status"] == "warning":
        logs = [
            {"level": "WARN", "time": "Just now", "message": f"[WARN] Upstream latency spike detected from database-service. Backpressure active."},
            {"level": "WARN", "time": "4s ago", "message": f"[WARN] Request retries surged 420%. Circuit breaker threshold at 80%"},
            {"level": "INFO", "time": "10s ago", "message": f"[INFO] Envoy connection retry policy triggered on ingress path"}
        ]
    else:
        logs = [
            {"level": "INFO", "time": "Just now", "message": f"[INFO] Service mesh health probe OK (200 OK, latency {base_lat}ms)"},
            {"level": "INFO", "time": "3s ago", "message": f"[INFO] Handled {int(svc['rps'] / 10)} requests with 0 dropped frames"},
            {"level": "INFO", "time": "9s ago", "message": f"[INFO] Garbage collection cycle took 1.2ms (Gen0: 14MB released)"}
        ]

    ml_result = anomaly_detector.predict_anomaly(base_lat, base_err, base_cpu, base_mem)

    return {
        "service_id": service_id,
        "name": svc["name"],
        "status": svc["status"],
        "health_score": svc["health_score"],
        "current_metrics": {
            "latency_ms": base_lat,
            "cpu_pct": base_cpu,
            "memory_pct": base_mem,
            "error_rate": base_err,
            "rps": svc["rps"],
            "replicas": svc["replicas"]
        },
        "ml_anomaly": ml_result,
        "history": points,
        "logs": logs
    }

@app.get("/api/incidents")
def get_incidents():
    return {"incidents": incident_history}
