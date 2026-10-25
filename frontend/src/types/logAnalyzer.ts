export type LogSeverity = "CRITICAL" | "ERROR" | "WARN" | "INFO" | "DEBUG";

export interface CloudLog {
  id: string;
  timestamp: string;
  timestampMs: number;
  service: string;
  level: LogSeverity;
  message: string;
  latencyMs: number;
  statusCode: number;
  traceId: string;
  environment: string;
  isAnomaly?: boolean;
  exceptionType?: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
}

export interface NLPQueryParsed {
  rawQuery: string;
  targetService?: string;
  targetLevels?: LogSeverity[];
  timeWindowMinutes?: number;
  minLatencyMs?: number;
  keywords?: string[];
  explanation: string;
}

export interface AIRootCauseAnalysis {
  logId: string;
  service: string;
  errorSignature: string;
  rootCauseSummary: string;
  detailedAnalysis: string;
  affectedComponents: string[];
  recommendedSteps: string[];
  remediationScript: string;
  confidenceScore: number;
  engineUsed: "LLM (Claude / GPT-4 SRE Engine)" | "Deterministic Rule-Based Engine";
}

export interface CorrelatedIncident {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  priority: "P1" | "P2" | "P3" | "P4";
  rootService: string;
  affectedServices: string[];
  rawAlertsCount: number;
  duplicateAlertsSuppressed: number;
  noiseReductionPct: number;
  summary: string;
  timestamp: string;
  firstSeenAt: string;
  lastSeenAt: string;
  status: "ACTIVE_INVESTIGATION" | "MITIGATING" | "RESOLVED";
  errorRateSpike: string;
}

export interface DeploymentRegressionData {
  currentRelease: string;
  deployedAt: string;
  baselineRelease: string;
  deploymentStatus: "REGRESSION_DETECTED" | "HEALTHY_STABLE" | "CANARY_ELEVATED";
  errorRatePrePct: number;
  errorRatePostPct: number;
  errorRateDeltaPct: number;
  p99LatencyPreMs: number;
  p99LatencyPostMs: number;
  p99LatencyDeltaMs: number;
  canaryRolloutPct: number;
  newErrorSignatures: {
    signature: string;
    service: string;
    occurrences: number;
    firstSeenInVersion: string;
  }[];
  rollbackRecommended: boolean;
}

export interface IncidentPriorityScore {
  incidentId: string;
  title: string;
  priority: "P1" | "P2" | "P3" | "P4";
  totalScore: number; // 0 - 100
  factors: {
    severityWeight: number; // max 35
    criticalityWeight: number; // max 30
    growthWeight: number; // max 20
    userBlastWeight: number; // max 15
  };
  affectedService: string;
  serviceTier: string;
  growthRatePct: number;
  impactedUsersCount: number;
  recommendedSLA: string;
  actionRequired: string;
}
