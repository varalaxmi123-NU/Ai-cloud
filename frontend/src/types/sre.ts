export type ServiceTier = "edge" | "core" | "business" | "persistence" | "async";
export type ServiceStatus = "healthy" | "warning" | "critical";

export interface MLAnomaly {
  is_anomaly: boolean;
  anomaly_confidence: number;
  severity: "NORMAL" | "MONITORED" | "ELEVATED_RISK" | "CRITICAL";
  model: string;
}

export interface ServiceNode {
  id: string;
  name: string;
  tier: ServiceTier;
  description: string;
  status: ServiceStatus;
  health_score: number;
  latency_ms: number;
  baseline_latency: number;
  error_rate: number;
  baseline_error_rate: number;
  cpu_pct: number;
  memory_pct: number;
  rps: number;
  replicas: number;
  environment: string;
  technology: string;
  business_criticality: string;
  x: number;
  y: number;
  in_degree?: number;
  out_degree?: number;
  bottleneck_centrality?: number;
  ml_anomaly?: MLAnomaly;
}

export interface DependencyEdge {
  source: string;
  target: string;
  volume: string;
  critical: boolean;
}

export interface ImpactedService {
  service_id: string;
  name: string;
  stage: string;
  cascade_probability: number;
  status: string;
  projected_latency_ms: number;
  projected_error_rate: number;
  failure_mode: string;
  blast_impact: string;
}

export interface RemediationPlaybook {
  id: string;
  title: string;
  recommended: boolean;
  confidence_score: number;
  estimated_recovery_time_sec: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  summary: string;
  actions: string[];
}

export interface CascadeResult {
  target_service_id: string;
  scenario: string;
  timestamp: number;
  blast_radius_pct: number;
  estimated_loss_per_min_usd: number;
  impacted_users_rps: number;
  impacted_services: ImpactedService[];
  cascade_chain_ordered: ImpactedService[];
  playbooks: RemediationPlaybook[];
}

export interface TopologySummary {
  total_services: number;
  healthy_services: number;
  failing_services: number;
  warning_services: number;
  active_incidents: number;
  overall_health_score: number;
  total_rps: number;
}

export interface TopologyResponse {
  system_status: "HEALTHY" | "ELEVATED_CASCADE_WARNING" | "CRITICAL_CASCADE_RISK";
  nodes: ServiceNode[];
  edges: DependencyEdge[];
  active_chaos: {
    target_service_id: string;
    scenario: string;
    injected_at: number;
    cascade_result: CascadeResult;
  } | null;
  summary: TopologySummary;
}

export interface TelemetryPoint {
  timestamp: string;
  latency: number;
  cpu: number;
  memory: number;
  error_rate: number;
  rps: number;
}

export interface LogEntry {
  level: "INFO" | "WARN" | "ERROR" | "CRITICAL";
  time: string;
  message: string;
}

export interface TelemetryResponse {
  service_id: string;
  name: string;
  status: ServiceStatus;
  health_score: number;
  current_metrics: {
    latency_ms: number;
    cpu_pct: number;
    memory_pct: number;
    error_rate: number;
    rps: number;
    replicas: number;
  };
  ml_anomaly: MLAnomaly;
  history: TelemetryPoint[];
  logs: LogEntry[];
}
