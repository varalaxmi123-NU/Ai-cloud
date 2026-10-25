"use client";

import React, { useState } from "react";
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  Copy,
  Terminal,
  Server,
  Database,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { CloudLog } from "@/types/logAnalyzer";

interface AIIncidentInvestigatorProps {
  logs?: CloudLog[];
  onInvestigateLog?: (log: CloudLog) => void;
  onOpenFailureReplay?: () => void;
}

interface InvestigationCase {
  id: string;
  title: string;
  confidence: number;
  rootCause: string;
  impactSummary: string;
  timeline: {
    time: string;
    event: string;
    service: string;
    severity: "CRITICAL" | "ERROR" | "WARN" | "INFO";
    detail: string;
  }[];
  evidenceLogs: {
    timestamp: string;
    service: string;
    level: string;
    snippet: string;
  }[];
  recommendedActions: {
    title: string;
    description: string;
    command?: string;
  }[];
}

const PRESET_INVESTIGATIONS: Record<string, InvestigationCase> = {
  dbPoolExhaustion: {
    id: "INV-8912",
    title: "Cascade Outage: Database Connection Pool Saturation to HTTP 500 Spike",
    confidence: 96,
    rootCause: "PostgreSQL Connection Pool Exhaustion in HikariCP",
    impactSummary: "Checkout and payment transactions failed (HTTP 500/504) for approximately 4,200 active users because worker threads hung waiting for PostgreSQL client handles.",
    timeline: [
      {
        time: "10:00:15 UTC",
        event: "Database query latency increased",
        service: "database-service",
        severity: "WARN",
        detail: "Unindexed query on user_accounts generated row locks on pg_catalog, boosting p99 latency to 620ms.",
      },
      {
        time: "10:01:05 UTC",
        event: "Connection pool utilization surged to 89%",
        service: "database-service",
        severity: "WARN",
        detail: "Active connection count reached 178 of 200 available slots.",
      },
      {
        time: "10:01:22 UTC",
        event: "HikariCP pool handles exhausted (100% full)",
        service: "database-service",
        severity: "ERROR",
        detail: "Fatal remaining connection slots reserved. Incoming checkout threads entered blocking queue.",
      },
      {
        time: "10:01:40 UTC",
        event: "Payment gateway read timeouts began",
        service: "payment-gateway",
        severity: "ERROR",
        detail: "Stripe webhook worker timed out after 3500ms waiting for database write handle; rolled back transaction.",
      },
      {
        time: "10:02:10 UTC",
        event: "API Gateway HTTP 504 & 500 Outage",
        service: "api-gateway",
        severity: "CRITICAL",
        detail: "Envoy gateway timeout breached; returned HTTP 500 errors to mobile and web clients on /v2/checkout.",
      },
    ],
    evidenceLogs: [
      {
        timestamp: "10:01:22 UTC",
        service: "database-service",
        level: "ERROR",
        snippet: "ConnectionPoolExhausted: No connection handles available in HikariCP pool within deadline of 3000ms",
      },
      {
        timestamp: "10:01:25 UTC",
        service: "database-service",
        level: "ERROR",
        snippet: "FATAL: remaining connection slots are reserved for non-replication superuser connections (max_connections=200)",
      },
      {
        timestamp: "10:01:40 UTC",
        service: "payment-gateway",
        level: "ERROR",
        snippet: "Connection timeout (504) -> database-service:5432 after 3500ms; rolled back charge authorization",
      },
      {
        timestamp: "10:02:10 UTC",
        service: "api-gateway",
        level: "CRITICAL",
        snippet: "HTTP 500 Internal Server Error rate surged to 24.8% on endpoint /v2/checkout [downstream failure: payment-gateway]",
      },
    ],
    recommendedActions: [
      {
        title: "Scale Connection Pool & Configure PgBouncer",
        description: "Deploy PgBouncer in transaction pooling mode between microservices and PostgreSQL primary to safely support up to 5,000 pooled client connections.",
        command: "kubectl scale deployment/pgbouncer --replicas=3 -n database",
      },
      {
        title: "Terminate Hung Idle-in-Transaction Connections",
        description: "Kill hanging transactions that have been holding table locks for longer than 60 seconds.",
        command: "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND state_change < now() - INTERVAL '60s';",
      },
      {
        title: "Enforce Circuit Breaker in Envoy Gateway",
        description: "Configure Envoy upstream circuit breaking with a maximum connection queue depth of 50 requests before failing fast.",
        command: "kubectl apply -f k8s/envoy-circuit-breaker.yaml",
      },
    ],
  },

  paymentTimeout: {
    id: "INV-8913",
    title: "External Provider Degradation: Stripe API Latency Spikes to 504 Drops",
    confidence: 93,
    rootCause: "Downstream Egress Socket Timeout to Third-Party Payment Provider",
    impactSummary: "Customers attempting credit card checkout encountered hanging spinners and failed authorizations due to 5,000ms socket timeouts.",
    timeline: [
      {
        time: "10:14:20 UTC",
        event: "Stripe API latency increased to 980ms",
        service: "payment-gateway",
        severity: "WARN",
        detail: "Normal p99 latency was 45ms. External network hop to api.stripe.com began degrading.",
      },
      {
        time: "10:14:45 UTC",
        event: "Webhook acknowledge deadline exceeded",
        service: "payment-gateway",
        severity: "ERROR",
        detail: "Worker socket exceeded 5000ms read deadline waiting for charge verification payload.",
      },
      {
        time: "10:15:18 UTC",
        event: "Downstream notification delivery dropped",
        service: "notification-service",
        severity: "ERROR",
        detail: "Kafka order-created message lacked completed payment transaction confirmation.",
      },
    ],
    evidenceLogs: [
      {
        timestamp: "10:14:45 UTC",
        service: "payment-gateway",
        level: "ERROR",
        snippet: "StripeWebhookTimeout: Upstream webhook acknowledge timed out after 5000ms",
      },
      {
        timestamp: "10:15:02 UTC",
        service: "payment-gateway",
        level: "ERROR",
        snippet: "java.net.SocketTimeoutException: Read timed out to api.stripe.com:443 [duration=5012ms]",
      },
    ],
    recommendedActions: [
      {
        title: "Enable Asynchronous Egress Queue",
        description: "Buffer payment authorization attempts in Kafka topic with exponential backoff retries rather than holding blocking HTTP threads.",
        command: "kubectl set env deployment/payment-gateway PAYMENT_MODE=async_buffered",
      },
      {
        title: "Trip Circuit Breaker to Backup Payment Provider",
        description: "Route 50% of traffic to redundant backup payment gateway cluster.",
        command: "curl -X POST http://api-gateway:8080/admin/route-traffic -d '{\"provider\": \"adyen\", \"weight\": 50}'",
      },
    ],
  },
};

export const AIIncidentInvestigator: React.FC<AIIncidentInvestigatorProps> = ({
  logs = [],
  onOpenFailureReplay,
}) => {
  const [selectedCaseKey, setSelectedCaseKey] = useState<string>("dbPoolExhaustion");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const activeCase = PRESET_INVESTIGATIONS[selectedCaseKey] || PRESET_INVESTIGATIONS.dbPoolExhaustion;

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <section className="rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  AI Incident Investigator
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-600/50">
                  Causal Reasoning Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Investigates chronological error sequences, isolates the true root cause, and provides evidence-backed remediation.
              </p>
            </div>
          </div>

          {/* Investigation Case Switcher */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setSelectedCaseKey("dbPoolExhaustion")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCaseKey === "dbPoolExhaustion"
                  ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30"
                  : "bg-[#162035] text-slate-300 hover:text-white border border-slate-700"
              }`}
            >
              Case #1: DB Pool Cascade
            </button>
            <button
              onClick={() => setSelectedCaseKey("paymentTimeout")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCaseKey === "paymentTimeout"
                  ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30"
                  : "bg-[#162035] text-slate-300 hover:text-white border border-slate-700"
              }`}
            >
              Case #2: 504 Gateway Timeout
            </button>
          </div>
        </div>

        {/* Incident Summary Card */}
        <div className="mt-5 p-5 rounded-xl bg-[#141d2e] border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-purple-900/60 text-purple-200 font-mono font-bold text-xs border border-purple-500/40">
                {activeCase.id}
              </span>
              <h3 className="text-base font-bold text-white">{activeCase.title}</h3>
            </div>
            
            {/* Confidence Score Pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeCase.confidence}% Root-Cause Confidence</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                Probable Root Cause
              </span>
              <p className="text-sm font-semibold text-white leading-relaxed">
                {activeCase.rootCause}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                Blast Radius &amp; Business Impact
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeCase.impactSummary}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chronological Event Investigation Timeline */}
      <section className="rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Chronological Incident Cascade Sequence
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {activeCase.timeline.length} sequenced progression points
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {activeCase.timeline.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#141d2e] border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex items-start md:items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">{step.time}</span>
                    <span className="text-slate-600">•</span>
                    <span className="px-2 py-0.5 rounded bg-[#1c273e] text-sky-300 font-mono text-xs font-semibold">
                      {step.service}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        step.severity === "CRITICAL"
                          ? "bg-red-600 text-white"
                          : step.severity === "ERROR"
                          ? "bg-rose-600 text-white"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      {step.severity}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{step.event}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{step.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Supporting Evidence Logs */}
      <section className="rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Supporting Evidence Ingested from Log Stream
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            Verified by pattern heuristics
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0a0e1a] p-3 space-y-2 font-mono text-xs">
          {activeCase.evidenceLogs.map((log, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-[#141d2e] border border-slate-800/80 flex items-start gap-3">
              <span className="text-slate-500 shrink-0">{log.timestamp}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 text-[10px] shrink-0 font-bold">
                {log.service}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  log.level === "CRITICAL"
                    ? "bg-red-600 text-white"
                    : "bg-rose-600 text-white"
                }`}
              >
                {log.level}
              </span>
              <span className="text-slate-100 break-all">{log.snippet}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Actionable SRE Remediation Runbook */}
      <section className="rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recommended SRE Remediation Actions
            </h3>
          </div>
          {onOpenFailureReplay && (
            <button
              onClick={onOpenFailureReplay}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View Failure Replay Engine &rarr;</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 pt-1">
          {activeCase.recommendedActions.map((action, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#141d2e] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{action.title}</span>
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{action.description}</p>
              {action.command && (
                <div className="mt-2 p-2.5 rounded-lg bg-[#0a0e1a] border border-slate-800 flex items-center justify-between text-xs font-mono text-sky-300">
                  <span className="truncate pr-3">{action.command}</span>
                  <button
                    onClick={() => handleCopy(action.command!, idx)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Copy command"
                  >
                    {copiedIndex === idx ? (
                      <span className="text-[10px] text-emerald-400 font-sans font-bold">Copied!</span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
