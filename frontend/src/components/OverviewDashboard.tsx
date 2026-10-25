"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Layers,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Database,
  Server,
  Cpu,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Upload,
  Play,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  BrainCircuit,
  History,
  ShieldCheck,
  Zap,
  BarChart3,
  SlidersHorizontal,
  Flame
} from "lucide-react";
import { TopologyResponse, ServiceNode } from "@/types/sre";
import { PRELOADED_SCENARIOS } from "@/lib/logParser";

interface OverviewDashboardProps {
  topology: TopologyResponse | null;
  onNavigateTab: (tabId: string) => void;
  onSelectService?: (serviceId: string) => void;
  onInjectChaos?: (serviceId: string, scenario?: string) => void;
  onReset?: () => void;
  isLandingPreview?: boolean;
}

// Sample Time-Series Data for Error Rate & Ingestion Over Time
const TIME_SERIES_DATA = [
  { time: "09:45", requests: 74000, errorRate: 0.2, p99: 14.1, label: "Nominal traffic" },
  { time: "09:50", requests: 78500, errorRate: 0.3, p99: 14.8, label: "Traffic rising" },
  { time: "09:55", requests: 84200, errorRate: 0.4, p99: 15.2, label: "Peak user login" },
  { time: "10:00", requests: 88100, errorRate: 1.2, p99: 185.0, label: "Slow queries on orders table" },
  { time: "10:01", requests: 91400, errorRate: 3.8, p99: 410.0, label: "DB connections exhausted (84% -> 99%)" },
  { time: "10:02", requests: 86300, errorRate: 5.6, p99: 512.0, label: "Payment gateway 504 timeouts" },
  { time: "10:03", requests: 82100, errorRate: 4.9, p99: 480.0, label: "Website HTTP 500 error cascade" },
  { time: "10:04", requests: 79500, errorRate: 3.2, p99: 210.0, label: "Circuit breaker opened (Envoy)" },
  { time: "10:05", requests: 76000, errorRate: 1.1, p99: 45.0, label: "PgBouncer pool recycle started" },
  { time: "10:06", requests: 75400, errorRate: 0.4, p99: 16.2, label: "Cluster recovering to baseline" },
];

const FREQUENT_ERRORS = [
  {
    rank: 1,
    name: "FATAL: remaining connection slots are reserved",
    service: "database-service",
    count: 142,
    pct: 44,
    trend: "+28%",
    isUp: true,
    severity: "CRITICAL",
  },
  {
    rank: 2,
    name: "Connection timeout (504) -> stripe.api.internal",
    service: "payment-gateway",
    count: 98,
    pct: 31,
    trend: "+19%",
    isUp: true,
    severity: "CRITICAL",
  },
  {
    rank: 3,
    name: "High memory usage (Eviction policy activated)",
    service: "redis-cache",
    count: 52,
    pct: 16,
    trend: "-4%",
    isUp: false,
    severity: "WARN",
  },
  {
    rank: 4,
    name: "ClientConnectionTimeoutException: acquire socket timeout",
    service: "api-gateway",
    count: 29,
    pct: 9,
    trend: "+6%",
    isUp: true,
    severity: "WARN",
  },
];

const FALLBACK_SERVICES: Array<Partial<ServiceNode>> = [
  {
    id: "api-gateway",
    name: "API Gateway",
    tier: "edge",
    status: "healthy",
    latency_ms: 24,
    error_rate: 0.02,
    cpu_pct: 32,
    memory_pct: 48,
    rps: 88650,
  },
  {
    id: "database-service",
    name: "Database Service (PostgreSQL)",
    tier: "persistence",
    status: "warning",
    latency_ms: 410,
    error_rate: 4.8,
    cpu_pct: 88,
    memory_pct: 92,
    rps: 34100,
  },
  {
    id: "payment-gateway",
    name: "Payment Gateway",
    tier: "business",
    status: "critical",
    latency_ms: 512,
    error_rate: 6.2,
    cpu_pct: 74,
    memory_pct: 65,
    rps: 12400,
  },
  {
    id: "redis-cache",
    name: "Redis Cache Cluster",
    tier: "persistence",
    status: "healthy",
    latency_ms: 4,
    error_rate: 0.01,
    cpu_pct: 41,
    memory_pct: 78,
    rps: 65000,
  },
  {
    id: "auth-service",
    name: "Auth Service (OAuth2)",
    tier: "core",
    status: "healthy",
    latency_ms: 16,
    error_rate: 0.00,
    cpu_pct: 22,
    memory_pct: 39,
    rps: 42000,
  },
  {
    id: "billing-worker",
    name: "Billing Queue Worker",
    tier: "async",
    status: "healthy",
    latency_ms: 85,
    error_rate: 0.15,
    cpu_pct: 46,
    memory_pct: 54,
    rps: 8200,
  },
];

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  topology,
  onNavigateTab,
  onSelectService,
  onInjectChaos,
  onReset,
  isLandingPreview = false,
}) => {
  const [timeWindow, setTimeWindow] = useState<"15m" | "1h" | "6h" | "24h">("1h");
  const [hoveredPoint, setHoveredPoint] = useState<typeof TIME_SERIES_DATA[0] | null>(null);
  const [incidentResolved, setIncidentResolved] = useState<boolean>(false);

  // Active microservices list
  const services = topology?.nodes && topology.nodes.length > 0 ? topology.nodes : (FALLBACK_SERVICES as ServiceNode[]);

  // Count healthy, warning, critical
  const criticalCount = services.filter((s) => s.status === "critical").length;
  const warningCount = services.filter((s) => s.status === "warning").length;
  const healthyCount = services.filter((s) => s.status === "healthy").length;

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Dashboard Sub-Header / Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Cluster Observability Command Center
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE TELEMETRY</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cluster: <span className="font-mono text-slate-200">prod-us-east-cluster</span> • 8 Active Microservices • Zero Ingestion Loss
            </p>
          </div>
        </div>

        {/* Right Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Window Selector */}
          <div className="flex items-center bg-[#141d2e] p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {(["15m", "1h", "6h", "24h"] as const).map((win) => (
              <button
                key={win}
                onClick={() => setTimeWindow(win)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  timeWindow === win
                    ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {win}
              </button>
            ))}
          </div>

          {/* Quick Action: Upload Logs */}
          <button
            onClick={() => onNavigateTab("logs")}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-md shadow-sky-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Logs</span>
          </button>

          {/* Quick Action: Simulate Scenario */}
          {onInjectChaos && (
            <button
              onClick={() => onInjectChaos("database-service", "database_connection_pool_exhaustion")}
              className="px-3 py-1.5 rounded-xl bg-[#141d2e] hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulate Outage</span>
            </button>
          )}

          {/* Quick Action: Reset */}
          {onReset && (
            <button
              onClick={onReset}
              title="Reset cluster baseline"
              className="p-1.5 rounded-xl bg-[#141d2e] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Executive Metric Cards (4 KPI Cards with Sparkline Visuals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Ingestion Velocity */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Logs Analyzed</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">148,920</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              +14.2%
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Ingestion Rate</span>
            <span className="text-sky-300 font-semibold">88,650 req/s</span>
          </div>
          {/* Visual Mini Progress Bar */}
          <div className="mt-2 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full w-[78%]" />
          </div>
        </div>

        {/* KPI 2: Error Surge Rate */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-rose-500/40 shadow-xl shadow-rose-950/20 transition-all hover:border-rose-500/60">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Critical Errors</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400 font-mono">42</span>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-bold">
              Surge &gt; 3.5%
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Error Rate</span>
            <span className="text-rose-400 font-bold">4.8% of traffic</span>
          </div>
          <div className="mt-2 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full w-[48%]" />
          </div>
        </div>

        {/* KPI 3: Latency SLA */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Cluster Latency p99</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">18.4</span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
            <span className="text-xs text-amber-400 font-semibold ml-auto flex items-center">
              DB spike: 410ms
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Target SLA</span>
            <span className="text-emerald-400 font-semibold">&lt; 50.0 ms</span>
          </div>
          <div className="mt-2 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full w-[36%]" />
          </div>
        </div>

        {/* KPI 4: Alert Noise Compression */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Noise Suppression</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-300 font-mono">91.2%</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" />
              Optimal
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Alert Compression</span>
            <span className="text-purple-300 font-semibold">142 alerts &rarr; 3 groups</span>
          </div>
          <div className="mt-2 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full w-[91%]" />
          </div>
        </div>

      </div>

      {/* 3. Primary Interactive Analytics Grid: Error Rate Over Time + Most Frequent Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Interactive Error Rate & Ingestion Over Time Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Error Rate &amp; Ingestion Over Time
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Timeline correlation showing sudden error surge at 10:01 AM during pool exhaustion
              </p>
            </div>
            
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-1.5 rounded-sm bg-sky-500/50" />
                <span>Requests</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <span className="w-3 h-1.5 rounded-sm bg-rose-500" />
                <span>Error Rate %</span>
              </span>
            </div>
          </div>

          {/* SVG Interactive Time Series Chart */}
          <div className="relative w-full h-56 pt-2 pb-6">
            <svg
              viewBox="0 0 600 180"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="600" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="600" y2="75" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Critical Error Threshold (3.5%) Reference Line */}
              <line x1="0" y1="65" x2="600" y2="65" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
              <text x="590" y="60" fill="#f43f5e" fontSize="9" textAnchor="end" fontFamily="monospace">
                SRE Threshold (3.5%)
              </text>

              {/* Request Volume Area Fill */}
              <path
                d="M 10 140 L 70 135 L 135 130 L 200 120 L 265 110 L 330 118 L 395 125 L 460 130 L 525 135 L 590 138 L 590 170 L 10 170 Z"
                fill="url(#reqGradient)"
              />
              <path
                d="M 10 140 L 70 135 L 135 130 L 200 120 L 265 110 L 330 118 L 395 125 L 460 130 L 525 135 L 590 138"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.7"
              />

              {/* Error Rate Line & Gradient Area */}
              <path
                d="M 10 160 L 70 158 L 135 155 L 200 135 L 265 55 L 330 25 L 395 40 L 460 75 L 525 135 L 590 155 L 590 170 L 10 170 Z"
                fill="url(#errorGradient)"
              />
              <path
                d="M 10 160 L 70 158 L 135 155 L 200 135 L 265 55 L 330 25 L 395 40 L 460 75 L 525 135 L 590 155"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
              />

              {/* Interactive Data Points on Error Line */}
              {TIME_SERIES_DATA.map((pt, idx) => {
                const cx = 10 + idx * 64.4;
                const cy = idx === 0 ? 160 : idx === 1 ? 158 : idx === 2 ? 155 : idx === 3 ? 135 : idx === 4 ? 55 : idx === 5 ? 25 : idx === 6 ? 40 : idx === 7 ? 75 : idx === 8 ? 135 : 155;
                const isSpike = pt.errorRate >= 3.5;

                return (
                  <g
                    key={idx}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSpike ? 5 : 3.5}
                      fill={isSpike ? "#f43f5e" : "#0ea5e9"}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className="transition-all hover:scale-150"
                    />
                    {isSpike && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="9"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="1.5"
                        opacity="0.4"
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Time labels below chart */}
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2 px-2">
              {TIME_SERIES_DATA.map((pt, i) => (
                <span key={i} className={i % 2 === 0 ? "block" : "hidden sm:block"}>
                  {pt.time}
                </span>
              ))}
            </div>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 p-3 rounded-xl bg-[#0b101b] border border-slate-700 shadow-2xl text-xs font-mono space-y-1 pointer-events-none z-20">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sky-400 font-bold">{hoveredPoint.time} UTC</span>
                  <span className={`font-bold ${hoveredPoint.errorRate >= 3.5 ? "text-rose-400" : "text-emerald-400"}`}>
                    {hoveredPoint.errorRate}% Error Rate
                  </span>
                </div>
                <div className="text-slate-300">{hoveredPoint.label}</div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Throughput: {hoveredPoint.requests.toLocaleString()} req/s</span>
                  <span>p99: {hoveredPoint.p99}ms</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Peak Incident Window: <b className="text-rose-400">10:01 - 10:03 UTC</b></span>
            <button
              onClick={() => onNavigateTab("replay")}
              className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Replay Incident Failure</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Most Frequent Errors Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Most Frequent Errors
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ranked by volume in the current evaluation window
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#141d2e] border border-slate-800 text-[11px] font-mono text-slate-300">
                4 Top Signatures
              </span>
            </div>

            <div className="space-y-3.5">
              {FREQUENT_ERRORS.map((err) => (
                <div
                  key={err.rank}
                  className="p-3 rounded-xl bg-[#141d2e] border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        #{err.rank}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-slate-100 block line-clamp-1">
                          {err.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          service: <b className="text-sky-300">{err.service}</b>
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono shrink-0 ${
                        err.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {err.severity}
                    </span>
                  </div>

                  {/* Horizontal Bar Visual */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{err.count} occurrences</span>
                      <span className="text-slate-300 font-bold">{err.pct}% of failures</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          err.rank === 1
                            ? "bg-rose-500"
                            : err.rank === 2
                            ? "bg-orange-500"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${err.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Aggregated from 321 error traces</span>
            <button
              onClick={() => onNavigateTab("logs")}
              className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect in Log Stream</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Cluster Service Health Indicators Grid */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Cluster Microservice Health Indicators
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status, latency SLAs, error rates, and resource utilization across services
            </p>
          </div>

          {/* Quick Filter Counts */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              {healthyCount} Healthy
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              {warningCount} Degraded
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
              {criticalCount} Outage
            </span>
          </div>
        </div>

        {/* 6 Microservice Health Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => {
            const isCrit = svc.status === "critical";
            const isWarn = svc.status === "warning";
            const isNominal = !isCrit && !isWarn;

            return (
              <div
                key={svc.id}
                onClick={() => {
                  if (onSelectService) onSelectService(svc.id);
                  onNavigateTab("topology");
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                  isCrit
                    ? "bg-rose-950/20 border-rose-500/40 hover:border-rose-500 shadow-lg shadow-rose-950/30"
                    : isWarn
                    ? "bg-amber-950/20 border-amber-500/40 hover:border-amber-500"
                    : "bg-[#141d2e] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                      {svc.name || svc.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5 uppercase">
                      Tier: {svc.tier}
                    </span>
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isCrit
                        ? "bg-rose-600 text-white animate-pulse"
                        : isWarn
                        ? "bg-amber-600 text-white"
                        : "bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {svc.status}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-[#0b101b] border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase">Latency</span>
                    <span className={`font-bold ${svc.latency_ms > 200 ? "text-amber-400" : "text-slate-200"}`}>
                      {svc.latency_ms} ms
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0b101b] border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase">Error Rate</span>
                    <span className={`font-bold ${svc.error_rate > 2 ? "text-rose-400" : "text-emerald-400"}`}>
                      {svc.error_rate}%
                    </span>
                  </div>
                </div>

                {/* Resource Gauges */}
                <div className="mt-2.5 space-y-1 text-[10px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>CPU: {svc.cpu_pct}%</span>
                    <span>MEM: {svc.memory_pct}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-slate-900 overflow-hidden flex">
                    <div
                      className={`h-full ${svc.cpu_pct > 80 ? "bg-rose-500" : "bg-sky-500"}`}
                      style={{ width: `${svc.cpu_pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Critical Active Incident Requiring Attention Banner */}
      <div className={`p-5 rounded-2xl border transition-all ${
        incidentResolved
          ? "bg-emerald-950/20 border-emerald-500/40"
          : "bg-gradient-to-r from-red-950/40 via-[#0f172a] to-amber-950/30 border-red-500/40 shadow-2xl shadow-red-950/30"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-xl shrink-0 mt-0.5 ${
              incidentResolved
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
            }`}>
              {incidentResolved ? <ShieldCheck className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">#INC-8921</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  incidentResolved
                    ? "bg-emerald-600 text-white"
                    : "bg-red-600 text-white animate-pulse"
                }`}>
                  {incidentResolved ? "RESOLVED" : "P1 CRITICAL"}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  First detected 14m ago • database-service &amp; payment-gateway
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mt-1">
                Database Connection Saturation Cascading to Payment Gateway 504 Timeouts
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                PostgreSQL active connections exhausted (100/100). Latency surged from 14ms to 410ms. Downstream payment-gateway timed out after 512ms, producing 504 Gateway Timeouts for end users.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab("investigator")}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Investigate with AI</span>
            </button>

            <button
              onClick={() => onNavigateTab("replay")}
              className="px-4 py-2 rounded-xl bg-[#141d2e] hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>Replay Cascade</span>
            </button>

            <button
              onClick={() => setIncidentResolved(!incidentResolved)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                incidentResolved
                  ? "bg-slate-800 border-slate-700 text-slate-300"
                  : "bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/40 text-emerald-300"
              }`}
            >
              {incidentResolved ? "Reopen Incident" : "Mark Resolved"}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
