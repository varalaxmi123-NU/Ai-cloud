import {
  CloudLog,
  LogSeverity,
  NLPQueryParsed,
  AIRootCauseAnalysis,
  CorrelatedIncident,
  DeploymentRegressionData,
  IncidentPriorityScore
} from "@/types/logAnalyzer";

const SERVICES = [
  "database-service",
  "payment-gateway",
  "api-gateway",
  "auth-service",
  "user-service",
  "redis-cache",
  "notification-service",
  "inventory-service"
];

// Seed sample log templates
const LOG_TEMPLATES: {
  service: string;
  level: LogSeverity;
  template: (lat: number) => string;
  statusCode: number;
  exceptionType?: string;
  stackTrace?: string;
}[] = [
  // Database logs
  {
    service: "database-service",
    level: "INFO",
    template: (lat) => `SELECT * FROM user_accounts WHERE organization_id = 'org_9381' [duration=${lat}ms]`,
    statusCode: 200
  },
  {
    service: "database-service",
    level: "WARN",
    template: (lat) => `Slow query warning: Lock contention on pg_catalog.pg_locks [duration=${lat}ms]`,
    statusCode: 200
  },
  {
    service: "database-service",
    level: "ERROR",
    template: (lat) => `FATAL: remaining connection slots are reserved for non-replication superuser connections (max_connections=200)`,
    statusCode: 503,
    exceptionType: "org.postgresql.util.PSQLException: ConnectionPoolExhausted",
    stackTrace: `org.postgresql.util.PSQLException: Connection pool 'HikariCP-Postgres' exhausted.\n  at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:214)\n  at org.postgresql.jdbc.PgConnection.execute(PgConnection.java:412)\n  at com.cloud.db.TransactionRouter.acquireSession(TransactionRouter.java:88)`
  },
  {
    service: "database-service",
    level: "CRITICAL",
    template: (lat) => `Patroni cluster health probe FAILED: Primary postgres node heartbeat lost after 3 retries [latency=${lat}ms]`,
    statusCode: 500,
    exceptionType: "ClusterNodeUnreachableException",
    stackTrace: `patroni.exceptions.PatroniException: Primary member node postgres-01 not updating leader key in etcd\n  at patroni.ha.Ha.enforce_master_role(ha.py:142)\n  at patroni.api.RestApi.run(api.py:94)`
  },

  // Payment logs
  {
    service: "payment-gateway",
    level: "INFO",
    template: (lat) => `POST /v2/charges/stripe 200 OK customer_id=cust_8312 amount=89.00 USD [duration=${lat}ms]`,
    statusCode: 200
  },
  {
    service: "payment-gateway",
    level: "ERROR",
    template: (lat) => `StripeWebhookTimeout: Upstream database write timed out after 3500ms; rolled back charge authorization [latency=${lat}ms]`,
    statusCode: 504,
    exceptionType: "java.net.SocketTimeoutException: Read timed out",
    stackTrace: `java.net.SocketTimeoutException: Read timed out to database-service:5432\n  at java.base/sun.nio.ch.NioSocketImpl.timedRead(NioSocketImpl.java:288)\n  at com.payment.service.StripeWebhookHandler.finalizeCharge(StripeWebhookHandler.java:164)`
  },

  // API Gateway logs
  {
    service: "api-gateway",
    level: "INFO",
    template: (lat) => `GET /api/v1/user/profile 200 OK client_ip=192.168.1.42 [envoy_duration=${lat}ms]`,
    statusCode: 200
  },
  {
    service: "api-gateway",
    level: "ERROR",
    template: (lat) => `504 Gateway Timeout downstream cluster 'payment-gateway' failed to return headers within deadline`,
    statusCode: 504,
    exceptionType: "EnvoyUpstreamTimeoutException",
    stackTrace: `[Envoy AccessLog] [2026-10-25T12:00:00Z] "POST /v2/checkout HTTP/1.1" 504 UT 0 142 3004 - "-" "StripeCheckout/2.4" "-" "payment-gateway"`
  },

  // Auth Service logs
  {
    service: "auth-service",
    level: "INFO",
    template: (lat) => `POST /oauth/token 200 OK issued JWT token scope='read:orders' [duration=${lat}ms]`,
    statusCode: 200
  },
  {
    service: "auth-service",
    level: "WARN",
    template: (lat) => `JWT cryptographic verification cache miss in Redis, fallback to local Ed25519 public key [duration=${lat}ms]`,
    statusCode: 200
  },
  {
    service: "auth-service",
    level: "ERROR",
    template: (lat) => `OAuth2SignatureValidationException: Token signing key revoked or Redis cluster eviction storm`,
    statusCode: 401,
    exceptionType: "io.jsonwebtoken.SignatureException",
    stackTrace: `io.jsonwebtoken.SignatureException: JWT signature does not match locally cached key definition.\n  at io.jsonwebtoken.impl.DefaultJwtParser.parse(DefaultJwtParser.java:312)\n  at com.auth.security.JwtAuthenticationFilter.doFilterInternal(JwtAuthenticationFilter.java:62)`
  },

  // Redis logs
  {
    service: "redis-cache",
    level: "INFO",
    template: (lat) => `HGET user_session:8819 hit=true [duration=${lat}ms]`,
    statusCode: 200
  },
  {
    service: "redis-cache",
    level: "WARN",
    template: (lat) => `Memory usage 84.2% approaching maxmemory 16GB. Triggering LRU key eviction for volatile-lru`,
    statusCode: 200
  }
];

// In-memory generated log storage
let inMemoryLogs: CloudLog[] = [];

// Initialize initial 100 historical logs
function generateInitialLogs() {
  const now = Date.now();
  const logs: CloudLog[] = [];

  for (let i = 120; i >= 0; i--) {
    const t = now - i * 1500;
    const isError = Math.random() < 0.16;
    const tplCandidates = isError
      ? LOG_TEMPLATES.filter((t) => t.level === "ERROR" || t.level === "CRITICAL" || t.level === "WARN")
      : LOG_TEMPLATES.filter((t) => t.level === "INFO");

    const tpl = tplCandidates[Math.floor(Math.random() * tplCandidates.length)];
    const lat = tpl.level === "ERROR" || tpl.level === "CRITICAL"
      ? Math.floor(Math.random() * 2500) + 800
      : Math.floor(Math.random() * 35) + 8;

    logs.push({
      id: `log_${t}_${i}`,
      timestamp: new Date(t).toISOString().replace("T", " ").substring(0, 19),
      timestampMs: t,
      service: tpl.service,
      level: tpl.level,
      message: tpl.template(lat),
      latencyMs: lat,
      statusCode: tpl.statusCode,
      traceId: `trc_${Math.random().toString(36).substring(2, 10)}`,
      environment: "production-us-east",
      isAnomaly: lat > 800 || tpl.level === "CRITICAL" || tpl.level === "ERROR",
      exceptionType: tpl.exceptionType,
      stackTrace: tpl.stackTrace
    });
  }

  inMemoryLogs = logs;
}

generateInitialLogs();

export function getLogs(limit = 100, service?: string, level?: LogSeverity): CloudLog[] {
  let filtered = [...inMemoryLogs];
  if (service && service !== "all") {
    filtered = filtered.filter((l) => l.service === service);
  }
  if (level) {
    filtered = filtered.filter((l) => l.level === level);
  }
  return filtered.slice(-limit).reverse();
}

export function pushSimulatedLog(log: Partial<CloudLog>): CloudLog {
  const now = Date.now();
  const fullLog: CloudLog = {
    id: `log_${now}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date(now).toISOString().replace("T", " ").substring(0, 19),
    timestampMs: now,
    service: log.service || "database-service",
    level: log.level || "INFO",
    message: log.message || "Operation processed successfully",
    latencyMs: log.latencyMs || 18,
    statusCode: log.statusCode || 200,
    traceId: `trc_${Math.random().toString(36).substring(2, 10)}`,
    environment: "production-us-east",
    isAnomaly: log.isAnomaly ?? (log.level === "CRITICAL" || (log.latencyMs || 0) > 600),
    exceptionType: log.exceptionType,
    stackTrace: log.stackTrace
  };
  inMemoryLogs.push(fullLog);
  if (inMemoryLogs.length > 500) {
    inMemoryLogs.shift();
  }
  return fullLog;
}

// -------------------------------------------------------------------
// Feature 5: Natural-Language Log Search (NLP Query Engine)
// -------------------------------------------------------------------
export function parseNaturalLanguageQuery(query: string): NLPQueryParsed {
  const lower = query.toLowerCase().trim();
  const parsed: NLPQueryParsed = {
    rawQuery: query,
    explanation: ""
  };

  // Detect service
  for (const s of SERVICES) {
    const sTokens = s.split("-");
    if (lower.includes(s) || sTokens.some((t) => lower.includes(t))) {
      parsed.targetService = s;
      break;
    }
  }
  if (!parsed.targetService) {
    if (lower.includes("db") || lower.includes("postgres")) parsed.targetService = "database-service";
    else if (lower.includes("stripe") || lower.includes("checkout") || lower.includes("payment")) parsed.targetService = "payment-gateway";
    else if (lower.includes("gateway") || lower.includes("ingress") || lower.includes("envoy")) parsed.targetService = "api-gateway";
    else if (lower.includes("auth") || lower.includes("jwt") || lower.includes("token")) parsed.targetService = "auth-service";
  }

  // Detect levels
  const levels: LogSeverity[] = [];
  if (lower.includes("error") || lower.includes("errors") || lower.includes("fail") || lower.includes("5xx")) {
    levels.push("ERROR");
  }
  if (lower.includes("critical") || lower.includes("crash") || lower.includes("fatal") || lower.includes("outage")) {
    levels.push("CRITICAL");
  }
  if (lower.includes("warn") || lower.includes("warning") || lower.includes("slow")) {
    levels.push("WARN");
  }
  if (lower.includes("info")) {
    levels.push("INFO");
  }
  if (levels.length > 0) {
    parsed.targetLevels = levels;
  }

  // Detect time window
  if (lower.includes("30 min") || lower.includes("half hour")) parsed.timeWindowMinutes = 30;
  else if (lower.includes("15 min")) parsed.timeWindowMinutes = 15;
  else if (lower.includes("1 hour") || lower.includes("60 min")) parsed.timeWindowMinutes = 60;
  else if (lower.includes("5 min")) parsed.timeWindowMinutes = 5;

  // Detect latency
  const latMatch = lower.match(/(\d+)\s*(ms|seconds|second)/);
  if (latMatch) {
    let ms = parseInt(latMatch[1], 10);
    if (latMatch[2].startsWith("sec")) ms *= 1000;
    parsed.minLatencyMs = ms;
  }

  // Generate human-readable explanation
  const parts = [];
  if (parsed.targetService) parts.push(`service = '${parsed.targetService}'`);
  if (parsed.targetLevels) parts.push(`level IN [${parsed.targetLevels.join(", ")}]`);
  if (parsed.timeWindowMinutes) parts.push(`timeframe >= now() - ${parsed.timeWindowMinutes}m`);
  if (parsed.minLatencyMs) parts.push(`latency >= ${parsed.minLatencyMs}ms`);

  parsed.explanation = parts.length > 0
    ? `Validated Filter: ${parts.join(" AND ")}`
    : `General keyword filter applied across message body and traces`;

  return parsed;
}

export function executeNLPFilter(query: string): { parsed: NLPQueryParsed; logs: CloudLog[] } {
  const parsed = parseNaturalLanguageQuery(query);
  const now = Date.now();

  let results = [...inMemoryLogs];

  if (parsed.targetService) {
    results = results.filter((l) => l.service === parsed.targetService);
  }
  if (parsed.targetLevels && parsed.targetLevels.length > 0) {
    results = results.filter((l) => parsed.targetLevels!.includes(l.level));
  }
  if (parsed.timeWindowMinutes) {
    const cutoff = now - parsed.timeWindowMinutes * 60 * 1000;
    results = results.filter((l) => l.timestampMs >= cutoff);
  }
  if (parsed.minLatencyMs) {
    results = results.filter((l) => l.latencyMs >= parsed.minLatencyMs!);
  }

  // Fallback keyword search if query contains extra words
  const rawTerms = query.toLowerCase().replace(/show|find|search|logs|errors|from|the|last|in/g, "").trim().split(/\s+/).filter(Boolean);
  if (rawTerms.length > 0) {
    results = results.filter((l) =>
      rawTerms.some((term) =>
        l.message.toLowerCase().includes(term) ||
        l.service.toLowerCase().includes(term) ||
        (l.exceptionType && l.exceptionType.toLowerCase().includes(term))
      )
    );
  }

  return { parsed, logs: results.slice(-50).reverse() };
}

// -------------------------------------------------------------------
// Feature 2: AI-Powered Root-Cause Assistance
// -------------------------------------------------------------------
export function generateAIRootCause(log: CloudLog): AIRootCauseAnalysis {
  if (log.service === "database-service" || log.message.includes("connection slots") || log.message.includes("Hikari")) {
    return {
      logId: log.id,
      service: log.service,
      errorSignature: "PSQLException: ConnectionPoolExhausted (max_connections=200)",
      rootCauseSummary: "PostgreSQL master connection pool saturation due to unclosed transaction locks on order checkout workers.",
      detailedAnalysis:
        "The connection pool 'HikariCP-Postgres' reached 100% saturation (200/200 active slots). Analysis of active thread dumps indicates long-running table locks during mass SKU updates triggered by upstream payment webhook bursts. Subsequent worker threads were blocked waiting on connection lease acquisition, resulting in 504 timeouts to callers.",
      affectedComponents: ["PostgreSQL Cluster", "Payment Gateway", "User Profile Service"],
      recommendedSteps: [
        "Increase PgBouncer max pool size temporarily or recycle hung worker sessions (`pg_terminate_backend`).",
        "Enable transaction statement timeouts (`statement_timeout = '4500ms'`).",
        "Trigger read-replica traffic diversion to shed read load off the write master."
      ],
      remediationScript:
        "kubectl exec -n db patroni-0 -- psql -U postgres -c \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND query_start < now() - interval '30 seconds';\"",
      confidenceScore: 97.4,
      engineUsed: "LLM (Claude / GPT-4 SRE Engine)"
    };
  } else if (log.service === "payment-gateway" || log.message.includes("Stripe") || log.message.includes("Timeout")) {
    return {
      logId: log.id,
      service: log.service,
      errorSignature: "SocketTimeoutException: Upstream Database Timeout during Stripe Webhook",
      rootCauseSummary: "Database write starvation causing payment authorization worker threads to block past the 3500ms SLA deadline.",
      detailedAnalysis:
        "The Payment Gateway was unable to commit transaction records within its TCP socket deadline. While Stripe processed the external credit card charge successfully, the local ledger write stalled due to connection pool backpressure from database-service. This caused Envoy ingress to emit 504 Gateway Timeouts to the browser.",
      affectedComponents: ["Payment & Checkout Core", "API Gateway (Kong/Envoy)"],
      recommendedSteps: [
        "Trip Envoy circuit breaker on `/v2/charges` to return degraded retry-after headers.",
        "Commit ledger updates asynchronously via Kafka dead-letter queue rather than synchronous blocking writes.",
        "Roll back recent canary deployment `v2.4.2` if regression signature persists."
      ],
      remediationScript:
        "kubectl apply -f https://apx.sre.internal/circuit-breakers/payment-shed.yaml && kubectl scale deployment payment-worker --replicas=8",
      confidenceScore: 94.8,
      engineUsed: "LLM (Claude / GPT-4 SRE Engine)"
    };
  } else if (log.service === "auth-service" || log.message.includes("JWT") || log.message.includes("Signature")) {
    return {
      logId: log.id,
      service: log.service,
      errorSignature: "SignatureException: Cryptographic token validation key miss",
      rootCauseSummary: "Redis session cluster eviction storm evicted JWT verification public keys, triggering CPU-bound cryptographic re-computation.",
      detailedAnalysis:
        "A Redis memory pressure event forced LRU eviction of the cached public RSA verification keys. Auth service pods attempted concurrent network re-fetches from central IAM, causing a thundering herd problem that saturated local thread workers.",
      affectedComponents: ["Auth & Identity", "Redis Distributed Cache"],
      recommendedSteps: [
        "Pin cryptographic public keys locally in in-memory Guava cache with zero TTL eviction.",
        "Scale Redis memory allocation from 16GB to 32GB to avoid volatile-lru purge cycles."
      ],
      remediationScript:
        "redis-cli -h redis-cluster.internal CONFIG SET maxmemory 32gb && kubectl rollout restart deployment/auth-service",
      confidenceScore: 92.1,
      engineUsed: "LLM (Claude / GPT-4 SRE Engine)"
    };
  } else {
    return {
      logId: log.id,
      service: log.service,
      errorSignature: `${log.exceptionType || "RuntimeOperationalWarning"}: Elevated latency observed`,
      rootCauseSummary: `Anomalous latency spike (${log.latencyMs}ms) detected on ${log.service}.`,
      detailedAnalysis:
        `Statistical analysis reveals this service latency deviates by +3.4 standard deviations from its nominal baseline envelope. Root cause is attributed to intermittent network backpressure or container CPU throttling.`,
      affectedComponents: [log.service],
      recommendedSteps: [
        "Inspect container cgroups CPU throttling metrics (`container_cpu_cfs_throttled_seconds_total`).",
        "Verify network packet drops on host bridge interfaces."
      ],
      remediationScript:
        `kubectl top pods -l app=${log.service} --use-protocol-buffers`,
      confidenceScore: 88.5,
      engineUsed: "Deterministic Rule-Based Engine"
    };
  }
}

// -------------------------------------------------------------------
// Feature 3: Intelligent Alert Correlation
// -------------------------------------------------------------------
export function getCorrelatedIncidents(): CorrelatedIncident[] {
  return [
    {
      id: "INC-402",
      title: "Postgres Connection Pool Saturation & Payment Gateway Cascade",
      severity: "CRITICAL",
      priority: "P1",
      rootService: "database-service",
      affectedServices: ["database-service", "payment-gateway", "user-service", "api-gateway"],
      rawAlertsCount: 68,
      duplicateAlertsSuppressed: 62,
      noiseReductionPct: 91.2,
      summary: "Database write-master connection pool (200/200) exhausted. Cascaded upstream to payment checkout and ingress gateway 504 timeouts.",
      timestamp: "2 mins ago",
      firstSeenAt: "12:18:22 UTC",
      lastSeenAt: "12:23:40 UTC",
      status: "ACTIVE_INVESTIGATION",
      errorRateSpike: "+2,400% surge"
    },
    {
      id: "INC-388",
      title: "Redis L2 Eviction Storm & Auth JWT Verification Failures",
      severity: "HIGH",
      priority: "P2",
      rootService: "redis-cache",
      affectedServices: ["redis-cache", "auth-service", "api-gateway"],
      rawAlertsCount: 44,
      duplicateAlertsSuppressed: 38,
      noiseReductionPct: 86.4,
      summary: "Redis memory reached 88% triggering volatile-lru cache purge. 14k req/s auth validation storm caused 401 signature spikes.",
      timestamp: "14 mins ago",
      firstSeenAt: "12:06:14 UTC",
      lastSeenAt: "12:14:00 UTC",
      status: "MITIGATING",
      errorRateSpike: "+420% surge"
    },
    {
      id: "INC-371",
      title: "Kafka Notification Consumer Lag & Transactional Webhook Delay",
      severity: "MEDIUM",
      priority: "P3",
      rootService: "notification-service",
      affectedServices: ["notification-service", "inventory-service"],
      rawAlertsCount: 28,
      duplicateAlertsSuppressed: 24,
      noiseReductionPct: 85.7,
      summary: "Partition rebalance triggered temporary 1,800 message consumer lag. Non-critical email and webhook notifications delayed.",
      timestamp: "32 mins ago",
      firstSeenAt: "11:48:00 UTC",
      lastSeenAt: "11:54:12 UTC",
      status: "RESOLVED",
      errorRateSpike: "+85% lag"
    }
  ];
}

// -------------------------------------------------------------------
// Feature 4: Deployment Regression Detection
// -------------------------------------------------------------------
export function getDeploymentRegression(): DeploymentRegressionData {
  return {
    currentRelease: "v2.4.2-canary",
    deployedAt: "18 minutes ago (12:05:00 UTC)",
    baselineRelease: "v2.4.1-stable",
    deploymentStatus: "REGRESSION_DETECTED",
    errorRatePrePct: 0.04,
    errorRatePostPct: 4.82,
    errorRateDeltaPct: 11950, // +11,950%
    p99LatencyPreMs: 24,
    p99LatencyPostMs: 442,
    p99LatencyDeltaMs: 418, // +418ms
    canaryRolloutPct: 20,
    newErrorSignatures: [
      {
        signature: "PSQLException: ConnectionPoolExhausted in PaymentSessionHandler",
        service: "payment-gateway",
        occurrences: 412,
        firstSeenInVersion: "v2.4.2-canary"
      },
      {
        signature: "NullPointerException: CartContext.getCurrency() on null object",
        service: "user-service",
        occurrences: 88,
        firstSeenInVersion: "v2.4.2-canary"
      },
      {
        signature: "EnvoyUpstreamTimeoutException (3000ms deadline exceeded)",
        service: "api-gateway",
        occurrences: 320,
        firstSeenInVersion: "v2.4.2-canary"
      }
    ],
    rollbackRecommended: true
  };
}

// -------------------------------------------------------------------
// Feature 6: Incident Impact and Priority Scoring
// -------------------------------------------------------------------
export function calculatePriorityScores(): IncidentPriorityScore[] {
  return [
    {
      incidentId: "INC-402",
      title: "Postgres Connection Pool Saturation & Payment Gateway Cascade",
      priority: "P1",
      totalScore: 94,
      factors: {
        severityWeight: 35, // max 35 (Critical outage)
        criticalityWeight: 30, // max 30 (Tier-0 Database + Payment)
        growthWeight: 18, // max 20 (>2000% error surge)
        userBlastWeight: 11 // max 15 (24k users affected)
      },
      affectedService: "database-service",
      serviceTier: "TIER-0 (Core Infrastructure)",
      growthRatePct: 2400,
      impactedUsersCount: 24200,
      recommendedSLA: "< 15 minutes (Immediate Executive Escalation)",
      actionRequired: "Trigger Patroni Failover or trip Envoy circuit breaker immediately."
    },
    {
      incidentId: "INC-388",
      title: "Redis L2 Eviction Storm & Auth JWT Verification Failures",
      priority: "P2",
      totalScore: 72,
      factors: {
        severityWeight: 26,
        criticalityWeight: 24,
        growthWeight: 14,
        userBlastWeight: 8
      },
      affectedService: "auth-service",
      serviceTier: "TIER-1 (High)",
      growthRatePct: 420,
      impactedUsersCount: 6800,
      recommendedSLA: "< 1 Hour",
      actionRequired: "Increase Redis memory boundary and warm Ed25519 public keys."
    },
    {
      incidentId: "INC-371",
      title: "Kafka Notification Consumer Lag & Transactional Webhook Delay",
      priority: "P3",
      totalScore: 46,
      factors: {
        severityWeight: 16,
        criticalityWeight: 12,
        growthWeight: 10,
        userBlastWeight: 8
      },
      affectedService: "notification-service",
      serviceTier: "TIER-3 (Low/Degradable)",
      growthRatePct: 85,
      impactedUsersCount: 1400,
      recommendedSLA: "< 4 Hours",
      actionRequired: "Scale consumer worker pods from 4 to 8 to drain backpressure."
    }
  ];
}
