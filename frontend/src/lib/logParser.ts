import { CloudLog, LogSeverity, AIRootCauseAnalysis } from "@/types/logAnalyzer";

export interface LogParseResult {
  logs: CloudLog[];
  summary: {
    totalLogs: number;
    errorCount: number;
    warnCount: number;
    infoCount: number;
    criticalCount: number;
    uniqueServices: string[];
    topErrors: { signature: string; count: number }[];
  };
  diagnostic: {
    criticalErrors: string[];
    warnings: string[];
    rootCause: string;
    suggestedFix: string;
    affectedServices: string[];
    confidenceScore: number;
  };
}

// 4 Realistic Pre-Seeded Scenarios
export const PRELOADED_SCENARIOS = {
  postgresPoolExhaustion: {
    name: "Scenario A: Database Connection Pool Exhaustion & Cascade",
    description: "Database connection pool reaches 100% saturation, causing API timeouts and HTTP 500 checkout crashes.",
    rawText: `10:00:15 INFO [database-service] Connection pool HikariCP-Postgres utilization at 62% (max=200)
10:00:48 WARN [database-service] Slow query detected: SELECT * FROM user_accounts WHERE organization_id = 'org_9381' [duration=620ms]
10:01:05 WARN [database-service] High connection pool saturation at 89% (178/200 active connections)
10:01:22 ERROR [database-service] ConnectionPoolExhausted: No connection handles available in HikariCP pool within deadline of 3000ms
10:01:25 ERROR [database-service] FATAL: remaining connection slots are reserved for non-replication superuser connections
10:01:40 ERROR [payment-gateway] Connection timeout (504) -> database-service:5432 after 3500ms; rolled back charge authorization
10:01:55 ERROR [api-gateway] 504 Gateway Timeout downstream cluster 'payment-gateway' failed to return headers within deadline
10:02:10 CRITICAL [api-gateway] HTTP 500 Internal Server Error rate surged to 24.8% on endpoint /v2/checkout
10:02:15 WARN [redis-cache] High memory usage warning: 84% cache capacity reached during retry storm`,
  },

  paymentGatewayTimeout: {
    name: "Scenario B: Payment Gateway 504 Timeout & Stripe Webhook Failure",
    description: "External payment provider degradation causes thread starvation and webhook dropped retries.",
    rawText: `10:14:02 INFO [api-gateway] POST /v2/charges/stripe 200 OK [duration=48ms]
10:14:20 WARN [payment-gateway] Stripe API latency increased to 980ms for customer_id=cust_8821
10:14:45 ERROR [payment-gateway] StripeWebhookTimeout: Upstream webhook acknowledge timed out after 5000ms
10:15:02 ERROR [payment-gateway] java.net.SocketTimeoutException: Read timed out to api.stripe.com:443
10:15:18 ERROR [notification-service] Failed to deliver order confirmation SMS; downstream payment verification missing
10:15:30 WARN [payment-gateway] Circuit breaker tripped to HALF-OPEN state for cluster stripe-egress`,
  },

  k8sOomKilledRedis: {
    name: "Scenario C: Kubernetes Memory Saturation & Redis Eviction Spike",
    description: "Cache memory leaks trigger OS page faults, leading to Redis worker OOMKilled events.",
    rawText: `10:20:00 INFO [redis-cache] Cache cluster operational with 1,420,000 keys stored
10:20:30 WARN [redis-cache] Memory fragmentation ratio 1.84 exceeds threshold of 1.5
10:21:05 WARN [redis-cache] Eviction surge: 4,200 volatile keys evicted per second under allkeys-lru policy
10:21:28 ERROR [redis-cache] OOM command not allowed when used memory > 'maxmemory'
10:21:45 CRITICAL [user-service] Pod user-service-worker-7 killed with exit code 137 (OOMKilled by Linux cgroup)
10:22:00 ERROR [auth-service] User session validation failed; redis session store unreachable`,
  },

  canaryRegression: {
    name: "Scenario D: Canary v2.4.2 Auth Token Secret Mismatch Regression",
    description: "New canary deployment introduces misconfigured JWT key, failing 100% of canary authentication requests.",
    rawText: `10:30:00 INFO [deployment-controller] Canary release v2.4.2 deployed to 20% traffic partition
10:30:15 INFO [auth-service] Starting OAuth2 provider v2.4.2 on pods auth-canary-1, auth-canary-2
10:30:35 ERROR [auth-service] JWTVerificationException: Invalid signature; public key mismatch on token issuer 'auth.cloudlog.internal'
10:30:48 ERROR [api-gateway] 401 Unauthorized for client_id=mobile_app_ios on endpoint /v1/user/me
10:31:05 CRITICAL [auth-service] Authentication failure rate surged to 20.4% (matching canary traffic weight)
10:31:20 WARN [deployment-controller] Regression detected in canary v2.4.2: Error rate elevated +4.8% above baseline`,
  },
};

/**
 * Universal Log Parsing Engine
 * Intelligently parses raw text or files into structured CloudLog[] items.
 */
export function parseRawLogText(rawText: string): LogParseResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const logs: CloudLog[] = [];
  const serviceSet = new Set<string>();
  const errorSignaturesMap: Record<string, number> = {};
  const criticalErrors: string[] = [];
  const warnings: string[] = [];

  let errorCount = 0;
  let warnCount = 0;
  let infoCount = 0;
  let criticalCount = 0;

  lines.forEach((line, index) => {
    // 1. Try parsing JSON format
    if (line.startsWith("{") && line.endsWith("}")) {
      try {
        const json = JSON.parse(line);
        const level: LogSeverity = normalizeSeverity(json.level || json.severity || "INFO");
        const service = json.service || json.app || json.component || "app-service";
        const message = json.message || json.msg || line;
        const timestamp = json.timestamp || json.time || new Date().toISOString();

        tallyLog(level, message);
        serviceSet.add(service);

        logs.push({
          id: `log-${Date.now()}-${index}`,
          timestamp: typeof timestamp === "string" ? timestamp : new Date().toLocaleTimeString(),
          timestampMs: Date.now() - (lines.length - index) * 1000,
          service,
          level,
          message,
          latencyMs: json.latency || json.duration || Math.floor(Math.random() * 40 + 10),
          statusCode: json.statusCode || json.status || (level === "ERROR" ? 500 : 200),
          traceId: json.traceId || `tr-${Math.random().toString(36).substring(2, 9)}`,
          environment: "production",
          exceptionType: json.exception || (level === "ERROR" ? "ApplicationException" : undefined),
        });
        return;
      } catch {
        // Fall back to line regex parsing
      }
    }

    // 2. Line regex matching for standard log formats:
    // Examples:
    // "10:01:05 ERROR Database connection failed"
    // "10:01:05 ERROR [database-service] Database connection failed"
    // "[2026-10-25 10:01:05] [database-service] [ERROR] ..."
    const timeMatch = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:AM|PM|UTC))?|\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})/i);
    const timestampStr = timeMatch ? timeMatch[1] : `10:${String(Math.floor(index / 10)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")} UTC`;

    // Extract Severity
    const levelMatch = line.match(/\b(CRITICAL|FATAL|SEVERE|ERROR|ERR|WARN|WARNING|INFO|DEBUG|HEAL|TRACE)\b/i);
    const level: LogSeverity = levelMatch ? normalizeSeverity(levelMatch[1]) : detectSeverityFromKeywords(line);

    // Extract Service if bracketed e.g. [database-service]
    const serviceMatch = line.match(/\[([a-z0-9-_]+)\]/i) || line.match(/\b(database-service|payment-gateway|api-gateway|auth-service|user-service|redis-cache|notification-service|inventory-service|postgres|redis|nginx|stripe)\b/i);
    const service = serviceMatch ? serviceMatch[1].toLowerCase() : guessServiceFromMessage(line);

    // Clean up message text
    let message = line;
    if (timeMatch) message = message.replace(timeMatch[0], "").trim();
    if (levelMatch) message = message.replace(levelMatch[0], "").trim();
    if (serviceMatch) message = message.replace(`[${serviceMatch[1]}]`, "").trim();
    message = message.replace(/^[:\-\s]+/, "").trim();
    if (!message) message = line;

    // Detect Latency in message (e.g., duration=48ms or latency=512ms)
    const latMatch = line.match(/(?:duration|latency|time|ms)[=:]\s*(\d+)/i) || line.match(/(\d+)\s*ms\b/i);
    const latencyMs = latMatch ? parseInt(latMatch[1], 10) : level === "ERROR" ? Math.floor(Math.random() * 400 + 150) : Math.floor(Math.random() * 30 + 8);

    // Detect Status Code
    const statusMatch = line.match(/\b(200|201|400|401|403|404|500|502|503|504)\b/);
    const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : level === "ERROR" || level === "CRITICAL" ? 500 : 200;

    // Detect Exception Type
    const exceptionMatch = line.match(/([a-zA-Z0-9._]+(?:Exception|Error|Contention|Timeout|Exhausted))/);
    const exceptionType = exceptionMatch ? exceptionMatch[1] : undefined;

    tallyLog(level, message);
    serviceSet.add(service);

    logs.push({
      id: `parsed-${Date.now()}-${index}`,
      timestamp: timestampStr,
      timestampMs: Date.now() - (lines.length - index) * 1000,
      service,
      level,
      message,
      latencyMs,
      statusCode,
      traceId: `tr-${Math.random().toString(36).substring(2, 9)}`,
      environment: "production",
      exceptionType,
    });
  });

  function tallyLog(lvl: LogSeverity, msg: string) {
    if (lvl === "CRITICAL") {
      criticalCount++;
      criticalErrors.push(msg);
      incrementErrorSignature(msg);
    } else if (lvl === "ERROR") {
      errorCount++;
      criticalErrors.push(msg);
      incrementErrorSignature(msg);
    } else if (lvl === "WARN") {
      warnCount++;
      warnings.push(msg);
    } else {
      infoCount++;
    }
  }

  function incrementErrorSignature(msg: string) {
    // Simplify error message into signature
    const signature = msg.replace(/\d+/g, "X").replace(/'[^']*'/g, "'val'").substring(0, 60);
    errorSignaturesMap[signature] = (errorSignaturesMap[signature] || 0) + 1;
  }

  // Deduce Root Cause and Suggested Fix based on parsed logs
  const topErrors = Object.entries(errorSignaturesMap)
    .map(([signature, count]) => ({ signature, count }))
    .sort((a, b) => b.count - a.count);

  const diagnostic = synthesizeDiagnostic(logs, criticalErrors, warnings, Array.from(serviceSet));

  return {
    logs,
    summary: {
      totalLogs: logs.length,
      errorCount,
      warnCount,
      infoCount,
      criticalCount,
      uniqueServices: Array.from(serviceSet),
      topErrors,
    },
    diagnostic,
  };
}

function normalizeSeverity(raw: string): LogSeverity {
  const upper = raw.toUpperCase();
  if (upper.includes("CRIT") || upper.includes("FATAL") || upper.includes("SEVERE")) return "CRITICAL";
  if (upper.includes("ERR")) return "ERROR";
  if (upper.includes("WARN")) return "WARN";
  return "INFO";
}

function detectSeverityFromKeywords(line: string): LogSeverity {
  const upper = line.toUpperCase();
  if (upper.includes("FATAL") || upper.includes("CRITICAL") || upper.includes("OOMKILLED") || upper.includes("OUTAGE")) return "CRITICAL";
  if (upper.includes("ERROR") || upper.includes("FAILED") || upper.includes("EXCEPTION") || upper.includes("504") || upper.includes("500") || upper.includes("TIMEOUT")) return "ERROR";
  if (upper.includes("WARN") || upper.includes("SLOW") || upper.includes("SATURATION") || upper.includes("HIGH MEMORY")) return "WARN";
  return "INFO";
}

function guessServiceFromMessage(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("postgres") || lower.includes("database") || lower.includes("sql") || lower.includes("hikaricp") || lower.includes("connection pool")) return "database-service";
  if (lower.includes("stripe") || lower.includes("charge") || lower.includes("payment") || lower.includes("checkout")) return "payment-gateway";
  if (lower.includes("envoy") || lower.includes("gateway") || lower.includes("proxy") || lower.includes("ingress")) return "api-gateway";
  if (lower.includes("jwt") || lower.includes("oauth") || lower.includes("auth") || lower.includes("token") || lower.includes("unauthorized")) return "auth-service";
  if (lower.includes("redis") || lower.includes("cache") || lower.includes("eviction") || lower.includes("hget")) return "redis-cache";
  if (lower.includes("sms") || lower.includes("email") || lower.includes("kafka") || lower.includes("notification")) return "notification-service";
  return "application-service";
}

function synthesizeDiagnostic(
  logs: CloudLog[],
  criticalErrors: string[],
  warnings: string[],
  services: string[]
): {
  criticalErrors: string[];
  warnings: string[];
  rootCause: string;
  suggestedFix: string;
  affectedServices: string[];
  confidenceScore: number;
} {
  const allText = logs.map((l) => l.message).join(" ");
  const lower = allText.toLowerCase();

  // Pattern A: Database Connection Pool Exhaustion
  if (lower.includes("connection") && (lower.includes("pool") || lower.includes("exhausted") || lower.includes("slots"))) {
    return {
      criticalErrors: criticalErrors.slice(0, 3),
      warnings: warnings.slice(0, 3),
      rootCause: "Database connection pool exhaustion in HikariCP. Incoming worker threads saturated max_connections limit, cascading timeouts into downstream API and payment gateways.",
      suggestedFix: "Increase HikariCP maximumPoolSize or PostgreSQL max_connections setting. Verify slow unindexed queries and introduce PgBouncer transaction pooling.",
      affectedServices: ["database-service", "payment-gateway", "api-gateway"],
      confidenceScore: 96,
    };
  }

  // Pattern B: Payment & 504 Timeout
  if (lower.includes("504") || lower.includes("timeout") || lower.includes("stripe")) {
    return {
      criticalErrors: criticalErrors.slice(0, 3),
      warnings: warnings.slice(0, 3),
      rootCause: "Upstream socket timeout communicating with payment provider. Gateway threads exhausted awaiting HTTP read response, leading to 504 Gateway Timeout cascade.",
      suggestedFix: "Implement circuit breaker policy in Envoy with 800ms fallback timeout. Enable asynchronous webhook retry queue via Kafka/SQS.",
      affectedServices: ["payment-gateway", "api-gateway", "notification-service"],
      confidenceScore: 93,
    };
  }

  // Pattern C: Redis OOM & Memory
  if (lower.includes("oom") || lower.includes("memory") || lower.includes("eviction")) {
    return {
      criticalErrors: criticalErrors.slice(0, 3),
      warnings: warnings.slice(0, 3),
      rootCause: "Memory exhaustion in caching layer triggered Linux cgroup OOMKilled terminating worker pods.",
      suggestedFix: "Increase Redis pod memory limits or configure 'maxmemory-policy allkeys-lru'. Audit TTL expiration on cached user sessions.",
      affectedServices: ["redis-cache", "user-service", "auth-service"],
      confidenceScore: 95,
    };
  }

  // Pattern D: Canary Regression / Auth
  if (lower.includes("canary") || lower.includes("signature") || lower.includes("jwt") || lower.includes("unauthorized")) {
    return {
      criticalErrors: criticalErrors.slice(0, 3),
      warnings: warnings.slice(0, 3),
      rootCause: "Canary release v2.4.2 public key mismatch. JWT verification failing for tokens issued by baseline authentication provider.",
      suggestedFix: "Execute immediate canary rollback to v2.4.1. Synchronize JWT verification secrets across canary and production cluster nodes.",
      affectedServices: ["auth-service", "api-gateway"],
      confidenceScore: 98,
    };
  }

  // Generic Diagnostic Fallback
  const topErr = criticalErrors[0] || "Unknown application exception";
  return {
    criticalErrors: criticalErrors.slice(0, 3),
    warnings: warnings.slice(0, 3),
    rootCause: `Primary failure driven by: ${topErr}. Detected multiple cascading exceptions across ${services.length} services.`,
    suggestedFix: "Inspect application stack traces for thread blocks, verify network connectivity to dependent services, and inspect recent deployment changes.",
    affectedServices: services.length > 0 ? services : ["application-service"],
    confidenceScore: 88,
  };
}
