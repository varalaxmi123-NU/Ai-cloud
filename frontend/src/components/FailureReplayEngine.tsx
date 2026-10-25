"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  Server,
  Layers,
  Cpu,
  FileCode,
  Sliders,
  History,
  Copy
} from "lucide-react";

interface FailureStep {
  stepNumber: number;
  time: string;
  service: string;
  status: "NORMAL" | "WARNING" | "SATURATED" | "CRITICAL";
  title: string;
  description: string;
  metrics: {
    latency: string;
    throughput: string;
    activePool: string;
    errorRate: string;
  };
  nodeStates: Record<string, "healthy" | "warning" | "failing" | "critical">;
}

const FAILURE_REPLAY_STEPS: FailureStep[] = [
  {
    stepNumber: 1,
    time: "10:00:15 UTC",
    service: "database-service",
    status: "NORMAL",
    title: "Initial Latency Surge on User Accounts Query",
    description: "An unindexed analytical query on table 'user_accounts' began acquiring exclusive locks, causing latency on primary Postgres node to rise from 15ms to 620ms.",
    metrics: {
      latency: "620 ms",
      throughput: "88,200 req/s",
      activePool: "62% (124/200)",
      errorRate: "0.2%",
    },
    nodeStates: {
      "database-service": "warning",
      "payment-gateway": "healthy",
      "api-gateway": "healthy",
      "frontend-checkout": "healthy",
    },
  },
  {
    stepNumber: 2,
    time: "10:01:05 UTC",
    service: "database-service",
    status: "SATURATED",
    title: "Connection Pool Reaches 100% Saturation",
    description: "Concurrent client threads continued opening PostgreSQL handles. HikariCP connection pool hit 200/200 max connections, causing all subsequent checkout worker threads to block.",
    metrics: {
      latency: "1,850 ms",
      throughput: "74,100 req/s",
      activePool: "100% (200/200) FULL",
      errorRate: "3.8%",
    },
    nodeStates: {
      "database-service": "failing",
      "payment-gateway": "warning",
      "api-gateway": "healthy",
      "frontend-checkout": "healthy",
    },
  },
  {
    stepNumber: 3,
    time: "10:01:40 UTC",
    service: "payment-gateway",
    status: "CRITICAL",
    title: "Downstream Payment Gateway Read Timeout",
    description: "Payment gateway waited 3500ms to record Stripe charge authorization in database-service. Deadline exceeded; worker threw SocketTimeoutException and aborted transaction.",
    metrics: {
      latency: "3,500 ms (Timeout)",
      throughput: "42,300 req/s",
      activePool: "100% EXHAUSTED",
      errorRate: "14.2%",
    },
    nodeStates: {
      "database-service": "critical",
      "payment-gateway": "critical",
      "api-gateway": "warning",
      "frontend-checkout": "warning",
    },
  },
  {
    stepNumber: 4,
    time: "10:02:10 UTC",
    service: "api-gateway",
    status: "CRITICAL",
    title: "Envoy API Gateway 504 Gateway Timeout",
    description: "Envoy ingress proxy failed to receive response headers from payment-gateway within deadline. Began issuing HTTP 504 Gateway Timeout responses to web and mobile clients.",
    metrics: {
      latency: "5,000 ms",
      throughput: "18,400 req/s",
      activePool: "100% EXHAUSTED",
      errorRate: "24.8%",
    },
    nodeStates: {
      "database-service": "critical",
      "payment-gateway": "critical",
      "api-gateway": "critical",
      "frontend-checkout": "critical",
    },
  },
  {
    stepNumber: 5,
    time: "10:02:45 UTC",
    service: "frontend-checkout",
    status: "CRITICAL",
    title: "Full User Checkout Outage (HTTP 500 Spike)",
    description: "End users attempting to complete purchases received generic error modals. 4,200 active customer checkout attempts dropped over a 3-minute window.",
    metrics: {
      latency: "5,200 ms",
      throughput: "9,100 req/s",
      activePool: "FATAL SLOTS RESERVED",
      errorRate: "38.5%",
    },
    nodeStates: {
      "database-service": "critical",
      "payment-gateway": "critical",
      "api-gateway": "critical",
      "frontend-checkout": "critical",
    },
  },
];

export const FailureReplayEngine: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const step = FAILURE_REPLAY_STEPS[currentStepIdx];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = 3000 / playbackSpeed;
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev >= FAILURE_REPLAY_STEPS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <section className="rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <History className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Failure Replay &amp; Prevention Engine
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-600/50">
                  Proprietary SRE Replay
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Step-by-step reconstruction of incident progression showing exact root triggers, cascade paths, and architectural safeguards.
              </p>
            </div>
          </div>

          {/* Speed & Reset Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setCurrentStepIdx(0)}
              className="p-2 rounded-xl bg-[#162035] border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Reset Replay"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="flex items-center bg-[#141d2e] p-1 rounded-xl border border-slate-800 text-xs font-mono">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    playbackSpeed === speed
                      ? "bg-rose-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Interactive Player Controls */}
        <div className="mt-6 p-4 rounded-xl bg-[#141d2e] border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-rose-600/30 cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Replay</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Play Failure Replay</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentStepIdx === 0}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
                title="Previous step"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentStepIdx((prev) => Math.min(FAILURE_REPLAY_STEPS.length - 1, prev + 1))}
                disabled={currentStepIdx === FAILURE_REPLAY_STEPS.length - 1}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
                title="Next step"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono text-slate-300">
                Step <b className="text-rose-400">{currentStepIdx + 1}</b> of {FAILURE_REPLAY_STEPS.length}
              </span>
            </div>

            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Simulated Timestamp: <b className="text-white">{step.time}</b></span>
            </div>
          </div>

          {/* Timeline Step Scrubber */}
          <div className="grid grid-cols-5 gap-2 pt-2">
            {FAILURE_REPLAY_STEPS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStepIdx(idx);
                  setIsPlaying(false);
                }}
                className={`p-2 rounded-lg text-left transition-all cursor-pointer border ${
                  idx === currentStepIdx
                    ? "bg-rose-950/70 border-rose-500 shadow-md shadow-rose-900/30"
                    : idx < currentStepIdx
                    ? "bg-[#101726] border-slate-700/60 opacity-80"
                    : "bg-[#0b101c] border-slate-800 opacity-50 hover:opacity-80"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold text-slate-300">#{idx + 1}</span>
                  <span className="text-slate-500">{s.time.split(" ")[0]}</span>
                </div>
                <span className="text-xs font-semibold text-white truncate block mt-0.5">
                  {s.service}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Visual Cascade Graph */}
      <section className="rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Service Dependency Cascade Mesh (Step #{currentStepIdx + 1} State)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Real-Time Propagation Visualizer
          </span>
        </div>

        {/* 4-Node Cascade Chain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          
          {/* Node 1: Database Service (Root Trigger) */}
          <div className={`p-4 rounded-xl border transition-all ${
            step.nodeStates["database-service"] === "critical"
              ? "bg-red-950/80 border-red-500 shadow-lg shadow-red-900/40 animate-pulse"
              : step.nodeStates["database-service"] === "failing"
              ? "bg-orange-950/70 border-orange-500 shadow-md"
              : step.nodeStates["database-service"] === "warning"
              ? "bg-amber-950/60 border-amber-500"
              : "bg-[#141d2e] border-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tier 1 Primary</span>
              <Database className="w-4 h-4 text-sky-400" />
            </div>
            <h4 className="text-sm font-bold text-white">database-service</h4>
            <span className="text-xs font-mono text-slate-400 block mt-0.5">HikariCP Pool: {step.metrics.activePool}</span>
            <span className={`text-[10px] font-mono font-bold mt-2 inline-block px-2 py-0.5 rounded ${
              step.nodeStates["database-service"] === "critical"
                ? "bg-red-600 text-white"
                : step.nodeStates["database-service"] === "failing"
                ? "bg-orange-600 text-white"
                : "bg-amber-600 text-white"
            }`}>
              {step.nodeStates["database-service"].toUpperCase()}
            </span>
          </div>

          {/* Node 2: Payment Gateway */}
          <div className={`p-4 rounded-xl border transition-all ${
            step.nodeStates["payment-gateway"] === "critical"
              ? "bg-red-950/80 border-red-500 shadow-lg shadow-red-900/40 animate-pulse"
              : step.nodeStates["payment-gateway"] === "warning"
              ? "bg-amber-950/60 border-amber-500"
              : "bg-[#141d2e] border-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tier 2 Service</span>
              <Server className="w-4 h-4 text-purple-400" />
            </div>
            <h4 className="text-sm font-bold text-white">payment-gateway</h4>
            <span className="text-xs font-mono text-slate-400 block mt-0.5">Latency: {step.metrics.latency}</span>
            <span className={`text-[10px] font-mono font-bold mt-2 inline-block px-2 py-0.5 rounded ${
              step.nodeStates["payment-gateway"] === "critical"
                ? "bg-red-600 text-white"
                : step.nodeStates["payment-gateway"] === "warning"
                ? "bg-amber-600 text-white"
                : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
            }`}>
              {step.nodeStates["payment-gateway"].toUpperCase()}
            </span>
          </div>

          {/* Node 3: API Gateway */}
          <div className={`p-4 rounded-xl border transition-all ${
            step.nodeStates["api-gateway"] === "critical"
              ? "bg-red-950/80 border-red-500 shadow-lg shadow-red-900/40 animate-pulse"
              : step.nodeStates["api-gateway"] === "warning"
              ? "bg-amber-950/60 border-amber-500"
              : "bg-[#141d2e] border-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tier 0 Ingress</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <h4 className="text-sm font-bold text-white">api-gateway (Envoy)</h4>
            <span className="text-xs font-mono text-slate-400 block mt-0.5">Error Rate: {step.metrics.errorRate}</span>
            <span className={`text-[10px] font-mono font-bold mt-2 inline-block px-2 py-0.5 rounded ${
              step.nodeStates["api-gateway"] === "critical"
                ? "bg-red-600 text-white"
                : step.nodeStates["api-gateway"] === "warning"
                ? "bg-amber-600 text-white"
                : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
            }`}>
              {step.nodeStates["api-gateway"].toUpperCase()}
            </span>
          </div>

          {/* Node 4: End User / Checkout Experience */}
          <div className={`p-4 rounded-xl border transition-all ${
            step.nodeStates["frontend-checkout"] === "critical"
              ? "bg-red-950/80 border-red-500 shadow-lg shadow-red-900/40 animate-pulse"
              : step.nodeStates["frontend-checkout"] === "warning"
              ? "bg-amber-950/60 border-amber-500"
              : "bg-[#141d2e] border-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Customer Impact</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Checkout Experience</h4>
            <span className="text-xs font-mono text-slate-400 block mt-0.5">Throughput: {step.metrics.throughput}</span>
            <span className={`text-[10px] font-mono font-bold mt-2 inline-block px-2 py-0.5 rounded ${
              step.nodeStates["frontend-checkout"] === "critical"
                ? "bg-red-600 text-white"
                : step.nodeStates["frontend-checkout"] === "warning"
                ? "bg-amber-600 text-white"
                : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
            }`}>
              {step.nodeStates["frontend-checkout"].toUpperCase()}
            </span>
          </div>

        </div>

        {/* Step Details Breakdown */}
        <div className="p-5 rounded-xl bg-[#141d2e] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">
              Step #{step.stepNumber}: {step.title}
            </span>
            <span className="text-xs font-mono text-slate-400">{step.time}</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            {step.description}
          </p>
        </div>
      </section>

      {/* Prevention Playbook: How Developers Can Stop Recurrence */}
      <section className="rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Architectural Prevention Playbook (How to Eliminate This Failure)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            SRE Defense in Depth
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Safeguard 1: Envoy Circuit Breaker */}
          <div className="p-4 rounded-xl bg-[#141d2e] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs flex items-center justify-center">1</span>
                <span>Envoy Upstream Circuit Breaker</span>
              </h4>
              <button
                onClick={() => handleCopy("circuit_breakers:\n  thresholds:\n    - priority: DEFAULT\n      max_connections: 150\n      max_pending_requests: 50\n      max_requests: 1000", "cb")}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Copy config"
              >
                {copiedCode === "cb" ? <span className="text-[10px] text-emerald-400 font-bold">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Prevents cascade starvation by immediately shedding excess requests when upstream database latency crosses 500ms.
            </p>
            <pre className="p-2.5 rounded-lg bg-[#0a0e1a] border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto">
{`circuit_breakers:
  thresholds:
    - priority: DEFAULT
      max_connections: 150
      max_pending_requests: 50`}
            </pre>
          </div>

          {/* Safeguard 2: PgBouncer Transaction Pooling */}
          <div className="p-4 rounded-xl bg-[#141d2e] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs flex items-center justify-center">2</span>
                <span>PgBouncer Connection Pooling</span>
              </h4>
              <button
                onClick={() => handleCopy("pool_mode = transaction\nmax_client_conn = 10000\ndefault_pool_size = 80", "pgb")}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Copy config"
              >
                {copiedCode === "pgb" ? <span className="text-[10px] text-emerald-400 font-bold">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Multiplexes 10,000 application client connections over 80 persistent database socket handles in transaction pooling mode.
            </p>
            <pre className="p-2.5 rounded-lg bg-[#0a0e1a] border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto">
{`pool_mode = transaction
max_client_conn = 10000
default_pool_size = 80`}
            </pre>
          </div>

          {/* Safeguard 3: Client Socket Timeout Hardening */}
          <div className="p-4 rounded-xl bg-[#141d2e] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs flex items-center justify-center">3</span>
                <span>Socket Read Timeout Hardening</span>
              </h4>
              <button
                onClick={() => handleCopy("client.setTimeout(800);\nclient.setConnectTimeout(300);", "to")}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Copy code"
              >
                {copiedCode === "to" ? <span className="text-[10px] text-emerald-400 font-bold">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Reduce payment client socket read timeout from 3500ms down to 800ms to prevent worker thread exhaustion during upstream slowness.
            </p>
            <pre className="p-2.5 rounded-lg bg-[#0a0e1a] border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto">
{`client.setTimeout(800); // Fail fast
client.setConnectTimeout(300);`}
            </pre>
          </div>

          {/* Safeguard 4: Rate Limiting & Graceful Degradation */}
          <div className="p-4 rounded-xl bg-[#141d2e] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs flex items-center justify-center">4</span>
                <span>Token Bucket Rate Limiting</span>
              </h4>
              <button
                onClick={() => handleCopy("rate_limit_service:\n  rate_limits:\n    - actions:\n      - request_headers:\n          header_name: ':path'\n          descriptor_key: 'checkout_rpm'\n          rate_limit: 1200", "rl")}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Copy config"
              >
                {copiedCode === "rl" ? <span className="text-[10px] text-emerald-400 font-bold">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enforce a maximum of 1,200 checkout authorizations per minute per client IP to stop retry storms from compounding database load.
            </p>
            <pre className="p-2.5 rounded-lg bg-[#0a0e1a] border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto">
{`rate_limits:
  - descriptor_key: checkout_rpm
    rate_limit: 1200 / minute`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};
