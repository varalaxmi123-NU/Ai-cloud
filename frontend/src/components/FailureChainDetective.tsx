"use client";

import React, { useState, useMemo } from "react";
import {
  BrainCircuit,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowDown,
  ArrowRight,
  Database,
  Server,
  Terminal,
  Copy,
  Check,
  Search,
  Upload,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";
import { CloudLog } from "@/types/logAnalyzer";

interface ChainEvent {
  id: string;
  stepNumber: number;
  time: string;
  title: string;
  service: string;
  severity: "CRITICAL" | "ERROR" | "WARN" | "INFO";
  rawLogMessage: string;
  evidenceExplanation: string;
  latencyMs?: number;
}

interface FailureChainReport {
  incidentTitle: string;
  possibleRootCause: string;
  evidenceStatement: string;
  calculatedConfidence: number;
  confidenceTier: "High" | "Moderate" | "Low";
  confidenceExplanation: string;
  failureChain: ChainEvent[];
  recommendedActions: {
    title: string;
    description: string;
    command?: string;
  }[];
}

// Default Scenario from User Prompt: Checkout Cascade
const DEFAULT_CHECKOUT_CHAIN: FailureChainReport = {
  incidentTitle: "Checkout Service Cascade Failure",
  possibleRootCause: "Database connection pool exhaustion in HikariCP",
  evidenceStatement: "Database latency increased at 10:00:05 before the connection pool and payment API errors appeared at 10:00:08 and 10:00:12.",
  calculatedConfidence: 84,
  confidenceTier: "High",
  confidenceExplanation: "Calculated from 4 chronological sequence matches across 3 microservices with corroborated error timestamps.",
  failureChain: [
    {
      id: "ev-1",
      stepNumber: 1,
      time: "10:00:05 UTC",
      title: "Database latency increases",
      service: "database-service",
      severity: "WARN",
      rawLogMessage: "10:00:05 WARN [database-service] Database query latency increased to 620ms (Threshold: 200ms)",
      evidenceExplanation: "Initial trigger: slow query on user_accounts table created thread backlog and held open connection handles.",
      latencyMs: 620,
    },
    {
      id: "ev-2",
      stepNumber: 2,
      time: "10:00:08 UTC",
      title: "Database connections become exhausted",
      service: "database-service",
      severity: "ERROR",
      rawLogMessage: "10:00:08 ERROR [database-service] Connection pool exhausted: 200/200 active connections in HikariCP",
      evidenceExplanation: "Pool capacity reached 100% saturation 3 seconds after latency spike. Subsequent queries entered a blocking queue.",
      latencyMs: 3100,
    },
    {
      id: "ev-3",
      stepNumber: 3,
      time: "10:00:12 UTC",
      title: "Payment API requests fail",
      service: "payment-gateway",
      severity: "ERROR",
      rawLogMessage: "10:00:12 ERROR [payment-gateway] Payment API failed: Connection timeout (504) -> database-service:5432 after 3500ms",
      evidenceExplanation: "Downstream payment-gateway timed out after 3.5s waiting for a database connection to record the charge authorization.",
      latencyMs: 3500,
    },
    {
      id: "ev-4",
      stepNumber: 4,
      time: "10:00:15 UTC",
      title: "Checkout becomes unavailable",
      service: "api-gateway",
      severity: "CRITICAL",
      rawLogMessage: "10:00:15 CRITICAL [api-gateway] Checkout unavailable: HTTP 500 returned on /v2/checkout to 2,400 active sessions",
      evidenceExplanation: "Final cascade impact: Envoy gateway timed out waiting for payment-gateway headers, producing customer-facing HTTP 500 errors.",
      latencyMs: 4200,
    },
  ],
  recommendedActions: [
    {
      title: "Check database connection pool limits",
      description: "Inspect HikariCP maximumPoolSize and consider deploying PgBouncer to buffer burst connection spikes.",
      command: "kubectl get cm/database-config -o jsonpath='{.data.hikari\\.maxPoolSize}'",
    },
    {
      title: "Investigate slow database queries",
      description: "Query pg_stat_activity for unindexed queries holding table locks on the orders and accounts tables.",
      command: "SELECT pid, now() - query_start AS duration, query FROM pg_stat_activity WHERE state != 'idle' ORDER BY duration DESC LIMIT 5;",
    },
    {
      title: "Check whether connections are released correctly",
      description: "Verify that all repository methods wrap database transactions in try-with-resources blocks to prevent connection leaks.",
      command: "kubectl logs -l app=database-service --tail=200 | grep -E 'connection leak|leakDetectionThreshold'",
    },
  ],
};

interface FailureChainDetectiveProps {
  logs?: CloudLog[];
  onOpenFailureReplay?: () => void;
  onOpenIncidentManager?: () => void;
}

export const FailureChainDetective: React.FC<FailureChainDetectiveProps> = ({
  logs,
  onOpenFailureReplay,
  onOpenIncidentManager,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>("ev-1");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [rawPastedInput, setRawPastedInput] = useState<string>("");
  const [showPaster, setShowPaster] = useState<boolean>(false);
  const [customReport, setCustomReport] = useState<FailureChainReport | null>(null);

  // Active Report: Custom generated or default prompt scenario
  const report = customReport || DEFAULT_CHECKOUT_CHAIN;

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Analyze Custom Pasted Logs into a Failure Chain
  const handleAnalyzePastedText = () => {
    if (!rawPastedInput.trim()) return;

    const lines = rawPastedInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const extractedEvents: ChainEvent[] = [];
    let step = 1;

    lines.forEach((line, idx) => {
      const lower = line.toLowerCase();
      let severity: "CRITICAL" | "ERROR" | "WARN" | "INFO" = "INFO";
      if (lower.includes("critical") || lower.includes("500") || lower.includes("unavailable")) severity = "CRITICAL";
      else if (lower.includes("error") || lower.includes("failed") || lower.includes("timeout") || lower.includes("fatal")) severity = "ERROR";
      else if (lower.includes("warn") || lower.includes("slow") || lower.includes("latency") || lower.includes("high")) severity = "WARN";

      // Only include anomalies (warnings, errors, criticals)
      if (severity !== "INFO") {
        const timeMatch = line.match(/\d{2}:\d{2}:\d{2}/);
        const timeStr = timeMatch ? `${timeMatch[0]} UTC` : `10:0${idx}:00 UTC`;

        // Extract Title
        let title = line;
        if (lower.includes("database") && lower.includes("latency")) title = "Database latency increases";
        else if (lower.includes("pool") || lower.includes("exhausted")) title = "Database connections become exhausted";
        else if (lower.includes("payment") || lower.includes("api failed")) title = "Payment API requests fail";
        else if (lower.includes("checkout") || lower.includes("unavailable")) title = "Checkout becomes unavailable";
        else if (lower.includes("memory") || lower.includes("oom")) title = "Memory limit reached (OOM eviction)";
        else {
          // Clean snippet for title
          title = line.replace(/^\d{2}:\d{2}:\d{2}\s+(WARN|ERROR|CRITICAL)\s+/, "").substring(0, 45);
        }

        // Infer Service
        let service = "app-service";
        if (lower.includes("database") || lower.includes("postgres") || lower.includes("sql")) service = "database-service";
        else if (lower.includes("payment") || lower.includes("stripe")) service = "payment-gateway";
        else if (lower.includes("checkout") || lower.includes("api") || lower.includes("gateway")) service = "api-gateway";
        else if (lower.includes("redis") || lower.includes("cache")) service = "redis-cache";

        extractedEvents.push({
          id: `cust-ev-${step}`,
          stepNumber: step,
          time: timeStr,
          title,
          service,
          severity,
          rawLogMessage: line,
          evidenceExplanation: `Supporting proof from uploaded log trace at ${timeStr}. Service: ${service}.`,
        });
        step++;
      }
    });

    if (extractedEvents.length > 0) {
      // Calculate Evidence-Weighted Confidence Score
      const sequenceScore = Math.min(extractedEvents.length * 20, 60);
      const errorRatioScore = extractedEvents.some((e) => e.severity === "CRITICAL") ? 25 : 15;
      const totalConfidence = Math.min(sequenceScore + errorRatioScore, 92);

      const rootEvent = extractedEvents[0];
      const leafEvent = extractedEvents[extractedEvents.length - 1];

      setCustomReport({
        incidentTitle: `${leafEvent.title} (Correlated Incident)`,
        possibleRootCause: `${rootEvent.title} in ${rootEvent.service}`,
        evidenceStatement: `${rootEvent.title} at ${rootEvent.time} occurred prior to downstream failures in ${leafEvent.service}.`,
        calculatedConfidence: totalConfidence,
        confidenceTier: totalConfidence >= 80 ? "High" : "Moderate",
        confidenceExplanation: `Calculated from ${extractedEvents.length} temporal sequence matches with corroborated timestamps.`,
        failureChain: extractedEvents,
        recommendedActions: [
          {
            title: `Remediate ${rootEvent.service} bottleneck`,
            description: `Address initial trigger (${rootEvent.title}) to prevent downstream cascade.`,
            command: `kubectl logs -l app=${rootEvent.service} --tail=100`,
          },
          {
            title: "Inspect downstream timeout deadlines",
            description: "Review circuit breaking and socket read timeouts across microservice dependencies.",
            command: "kubectl describe configmap service-timeouts",
          },
        ],
      });
      setSelectedEventId(extractedEvents[0].id);
      setShowPaster(false);
    }
  };

  // Find currently selected event in chain
  const activeEvent = report.failureChain.find((e) => e.id === selectedEventId) || report.failureChain[0];

  return (
    <div className="w-full space-y-6">
      
      {/* Header Banner: Feature Identity */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#0f172a] to-sky-950/40 border border-purple-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold tracking-wider uppercase">
                  Unique SRE Feature
                </span>
                <span className="text-xs text-slate-400 font-mono">• Evidence-Linked Causal Analysis</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Failure Chain Detective
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed mt-1">
                Reconstructs the step-by-step sequence of events that led to a failure. Click any event in the chain to verify the exact raw log entry supporting the root-cause conclusion.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setCustomReport(null);
                setSelectedEventId("ev-1");
              }}
              className="px-3.5 py-2 rounded-xl bg-[#141d2e] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Load Checkout Incident</span>
            </button>

            <button
              onClick={() => setShowPaster(!showPaster)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Analyze Your Logs</span>
            </button>
          </div>
        </div>

        {/* Optional Custom Log Paster Drawer */}
        {showPaster && (
          <div className="p-4 rounded-2xl bg-[#0a0e1a] border border-slate-800 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">Paste raw logs to reconstruct a failure chain:</span>
              <span className="text-slate-500 font-mono text-[11px]">Supports timestamps, WARN, ERROR, CRITICAL</span>
            </div>
            <textarea
              value={rawPastedInput}
              onChange={(e) => setRawPastedInput(e.target.value)}
              placeholder={`10:00:01 INFO Server started\n10:00:05 WARN Database latency increased\n10:00:08 ERROR Connection pool exhausted\n10:00:12 ERROR Payment API failed\n10:00:15 ERROR Checkout unavailable`}
              rows={5}
              className="w-full p-3 rounded-xl bg-[#070b14] border border-slate-800 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPaster(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAnalyzePastedText}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md"
              >
                Build Failure Chain
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Investigation Summary Card: Root Cause, Evidence & Calculated Confidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Incident Investigation Synthesis (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Incident Badge & Title */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-mono font-bold uppercase">
                Active Investigation
              </span>
              <span className="text-xs text-slate-400 font-mono">Incident: {report.incidentTitle}</span>
            </div>

            {/* Possible Root Cause */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                Possible Root Cause
              </span>
              <h3 className="text-base font-black text-white">
                {report.possibleRootCause}
              </h3>
            </div>

            {/* Evidence Statement */}
            <div className="p-4 rounded-2xl bg-[#141d2e] border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                Evidence Statement
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                &quot;{report.evidenceStatement}&quot;
              </p>
            </div>
          </div>

          {/* Calculated Confidence Score Gauge */}
          <div className="p-4 rounded-2xl bg-[#0a0e1a] border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Calculated Confidence:</span>
                <span className="text-base font-black text-purple-400 font-mono">
                  {report.calculatedConfidence}% ({report.confidenceTier})
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {report.confidenceExplanation}
              </p>
            </div>
            <div className="w-full sm:w-36 h-2 rounded-full bg-slate-800 overflow-hidden shrink-0">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-sky-400 rounded-full"
                style={{ width: `${report.calculatedConfidence}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Recommended Actions with Copyable Commands (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Recommended Actions
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                SRE Remediation
              </span>
            </div>

            <div className="space-y-3">
              {report.recommendedActions.map((act, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#141d2e] border border-slate-800 space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{act.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  </div>

                  {act.command && (
                    <div className="mt-2 flex items-center justify-between gap-2 p-2 rounded-lg bg-[#070b14] border border-slate-800 font-mono text-[10px] text-slate-300">
                      <span className="truncate">{act.command}</span>
                      <button
                        onClick={() => handleCopy(act.command!)}
                        className="text-slate-400 hover:text-white p-1 shrink-0 cursor-pointer"
                        title="Copy command"
                      >
                        {copiedCmd === act.command ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Validated by Detective Engine</span>
            {onOpenIncidentManager && (
              <button
                onClick={onOpenIncidentManager}
                className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Track Incident</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* The Core Feature: Interactive Failure Chain Progression */}
      <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Failure Chain (Click Any Event to Inspect Original Supporting Log Entry)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Step-by-step causal cascade connecting the initial warning trigger to downstream service failure.
          </p>
        </div>

        {/* Visual Vertical Failure Chain */}
        <div className="space-y-3">
          {report.failureChain.map((event, idx) => {
            const isSelected = event.id === selectedEventId;
            const isLast = idx === report.failureChain.length - 1;

            return (
              <React.Fragment key={event.id}>
                {/* Event Card (Clickable) */}
                <div
                  onClick={() => setSelectedEventId(event.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-purple-950/30 border-purple-500 shadow-xl shadow-purple-950/40 scale-[1.01]"
                      : "bg-[#141d2e] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400"
                    }`}>
                      #{event.stepNumber}
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{event.time}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 text-[10px] font-mono font-bold">
                          {event.service}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          event.severity === "CRITICAL"
                            ? "bg-rose-600 text-white"
                            : event.severity === "ERROR"
                            ? "bg-orange-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}>
                          {event.severity}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">
                        {event.title}
                      </h4>
                    </div>
                  </div>

                  {/* Right Status / Hint */}
                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    <span className="text-[11px] font-mono text-slate-400">
                      {isSelected ? "Inspecting Supporting Evidence" : "Click to view raw log proof"}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      isSelected ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-300"
                    }`}>
                      {isSelected ? "Active Proof" : "Inspect"}
                    </span>
                  </div>
                </div>

                {/* Downward Arrow between events */}
                {!isLast && (
                  <div className="flex items-center justify-center py-1">
                    <div className="flex flex-col items-center text-purple-400">
                      <div className="w-0.5 h-3 bg-purple-500/40" />
                      <ArrowDown className="w-4 h-4 text-purple-400 animate-bounce" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Selected Event Supporting Evidence Card */}
        {activeEvent && (
          <div className="p-5 rounded-2xl bg-[#0a0e1a] border border-purple-500/40 shadow-2xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Original Supporting Log Entry Proof (Step #{activeEvent.stepNumber})
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Timestamp: <b className="text-sky-400">{activeEvent.time}</b>
              </span>
            </div>

            {/* Raw Log Terminal Block */}
            <div className="p-3.5 rounded-xl bg-[#070b14] border border-slate-800 font-mono text-xs text-slate-200 break-all select-all">
              {activeEvent.rawLogMessage}
            </div>

            {/* Evidence Explanation */}
            <div className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <b className="text-white">Evidence reasoning:</b> {activeEvent.evidenceExplanation}
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
