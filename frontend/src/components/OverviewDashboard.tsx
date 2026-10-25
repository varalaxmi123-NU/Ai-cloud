"use client";

import React, { useState, useMemo } from "react";
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
  Flame,
  Search,
  Copy,
  Check,
  Bookmark,
  FolderClock,
  Terminal,
  Filter
} from "lucide-react";
import { TopologyResponse, ServiceNode } from "@/types/sre";

interface OverviewDashboardProps {
  topology: TopologyResponse | null;
  onNavigateTab: (tabId: string) => void;
  onSelectService?: (serviceId: string) => void;
  onInjectChaos?: (serviceId: string, scenario?: string) => void;
  onReset?: () => void;
  isLandingPreview?: boolean;
}

interface TimePoint {
  time: string;
  requests: number;
  errorRate: number;
  p99: number;
  label: string;
}

interface FrequentErrorItem {
  rank: number;
  name: string;
  service: string;
  count: number;
  pct: number;
  trend: string;
  isUp: boolean;
  severity: "CRITICAL" | "WARN";
}

interface WindowData {
  title: string;
  description: string;
  totalLogs: string;
  logTrend: string;
  ingestionRps: string;
  criticalErrors: number;
  warningsDetected: number;
  activeIncidentsCount: number;
  affectedServicesCount: number;
  errorRatePct: number;
  p99LatencyMs: number;
  latencyNote: string;
  noiseSuppressionPct: number;
  noiseRatioText: string;
  peakIncidentWindow: string;
  points: TimePoint[];
  severityDist: { critical: number; error: number; warn: number; info: number };
  frequentErrors: FrequentErrorItem[];
}

const TIME_WINDOW_PROFILES: Record<"15m" | "1h" | "6h" | "24h", WindowData> = {
  "15m": {
    title: "Last 15 Minutes — Active Incident Horizon",
    description: "High-resolution telemetry during the PostgreSQL pool exhaustion event",
    totalLogs: "38,420",
    logTrend: "+34.8%",
    ingestionRps: "94,100 req/s",
    criticalErrors: 38,
    warningsDetected: 14,
    activeIncidentsCount: 1,
    affectedServicesCount: 3,
    errorRatePct: 5.6,
    p99LatencyMs: 512.0,
    latencyNote: "Peak Outage: 512ms",
    noiseSuppressionPct: 94.2,
    noiseRatioText: "82 alerts → 2 groups",
    peakIncidentWindow: "Active Peak: 10:01 - 10:04 UTC",
    severityDist: { critical: 38, error: 42, warn: 14, info: 6 },
    points: [
      { time: "10:00", requests: 88100, errorRate: 1.2, p99: 185.0, label: "Slow queries on orders table" },
      { time: "10:02", requests: 91400, errorRate: 3.9, p99: 410.0, label: "DB connection pool saturation" },
      { time: "10:04", requests: 94100, errorRate: 5.8, p99: 512.0, label: "Payment 504 gateway timeouts" },
      { time: "10:06", requests: 89300, errorRate: 5.4, p99: 490.0, label: "Cascading HTTP 500 errors" },
      { time: "10:08", requests: 84200, errorRate: 4.1, p99: 380.0, label: "Envoy circuit breaker active" },
      { time: "10:10", requests: 81000, errorRate: 3.0, p99: 210.0, label: "PgBouncer pool recycle" },
      { time: "10:12", requests: 77500, errorRate: 1.8, p99: 95.0, label: "Recovery in progress" },
      { time: "10:15", requests: 76000, errorRate: 0.9, p99: 42.0, label: "Stabilizing towards baseline" },
    ],
    frequentErrors: [
      { rank: 1, name: "FATAL: remaining connection slots are reserved", service: "database-service", count: 88, pct: 54, trend: "+45%", isUp: true, severity: "CRITICAL" },
      { rank: 2, name: "Connection timeout (504) -> stripe.api.internal", service: "payment-gateway", count: 52, pct: 32, trend: "+36%", isUp: true, severity: "CRITICAL" },
      { rank: 3, name: "ClientConnectionTimeoutException: socket timeout", service: "api-gateway", count: 18, pct: 11, trend: "+12%", isUp: true, severity: "WARN" },
      { rank: 4, name: "High memory pressure (Eviction risk)", service: "redis-cache", count: 6, pct: 3, trend: "+2%", isUp: true, severity: "WARN" },
    ],
  },

  "1h": {
    title: "Last 1 Hour — Outage Surge & Auto-Mitigation",
    description: "Full operational cycle showing baseline, surge escalation, and stabilization",
    totalLogs: "148,920",
    logTrend: "+14.2%",
    ingestionRps: "88,650 req/s",
    criticalErrors: 42,
    warningsDetected: 28,
    activeIncidentsCount: 1,
    affectedServicesCount: 3,
    errorRatePct: 4.8,
    p99LatencyMs: 18.4,
    latencyNote: "DB spike: 410ms",
    noiseSuppressionPct: 91.2,
    noiseRatioText: "142 alerts → 3 groups",
    peakIncidentWindow: "Incident Window: 10:01 - 10:03 UTC",
    severityDist: { critical: 42, error: 56, warn: 28, info: 16 },
    points: [
      { time: "09:45", requests: 74000, errorRate: 0.2, p99: 14.1, label: "Nominal baseline traffic" },
      { time: "09:50", requests: 78500, errorRate: 0.3, p99: 14.8, label: "Traffic ascending" },
      { time: "09:55", requests: 84200, errorRate: 0.4, p99: 15.2, label: "Peak user login load" },
      { time: "10:00", requests: 88100, errorRate: 1.2, p99: 185.0, label: "Slow queries on orders table" },
      { time: "10:01", requests: 91400, errorRate: 3.8, p99: 410.0, label: "DB connections exhausted (84% -> 99%)" },
      { time: "10:02", requests: 86300, errorRate: 5.6, p99: 512.0, label: "Payment gateway 504 timeouts" },
      { time: "10:03", requests: 82100, errorRate: 4.9, p99: 480.0, label: "Website HTTP 500 error cascade" },
      { time: "10:04", requests: 79500, errorRate: 3.2, p99: 210.0, label: "Circuit breaker opened (Envoy)" },
      { time: "10:05", requests: 76000, errorRate: 1.1, p99: 45.0, label: "PgBouncer pool recycle started" },
      { time: "10:06", requests: 75400, errorRate: 0.4, p99: 16.2, label: "Cluster recovering to baseline" },
    ],
    frequentErrors: [
      { rank: 1, name: "FATAL: remaining connection slots are reserved", service: "database-service", count: 142, pct: 44, trend: "+28%", isUp: true, severity: "CRITICAL" },
      { rank: 2, name: "Connection timeout (504) -> stripe.api.internal", service: "payment-gateway", count: 98, pct: 31, trend: "+19%", isUp: true, severity: "CRITICAL" },
      { rank: 3, name: "High memory usage (Eviction policy activated)", service: "redis-cache", count: 52, pct: 16, trend: "-4%", isUp: false, severity: "WARN" },
      { rank: 4, name: "ClientConnectionTimeoutException: acquire socket timeout", service: "api-gateway", count: 29, pct: 9, trend: "+6%", isUp: true, severity: "WARN" },
    ],
  },

  "6h": {
    title: "Last 6 Hours — Multi-Cluster Operational Shift",
    description: "Aggregated performance across 2 minor blips and 1 critical surge",
    totalLogs: "892,400",
    logTrend: "+6.8%",
    ingestionRps: "82,400 req/s",
    criticalErrors: 64,
    warningsDetected: 48,
    activeIncidentsCount: 3,
    affectedServicesCount: 4,
    errorRatePct: 1.6,
    p99LatencyMs: 28.2,
    latencyNote: "Avg cluster SLA: 28ms",
    noiseSuppressionPct: 89.4,
    noiseRatioText: "410 alerts → 8 groups",
    peakIncidentWindow: "2 Resolved Blips & 1 Active Surge",
    severityDist: { critical: 64, error: 92, warn: 48, info: 38 },
    points: [
      { time: "05:00", requests: 62000, errorRate: 0.2, p99: 14.0, label: "Off-peak baseline" },
      { time: "06:00", requests: 68000, errorRate: 0.3, p99: 14.5, label: "Early shift log volume" },
      { time: "07:00", requests: 74000, errorRate: 1.8, p99: 95.0, label: "Redis memory eviction blip (Resolved)" },
      { time: "08:00", requests: 79000, errorRate: 0.4, p99: 15.0, label: "Cache stabilized" },
      { time: "09:00", requests: 83000, errorRate: 0.3, p99: 15.4, label: "Morning peak traffic" },
      { time: "10:00", requests: 91400, errorRate: 4.8, p99: 410.0, label: "DB Connection Pool Saturation" },
      { time: "10:30", requests: 80000, errorRate: 1.2, p99: 38.0, label: "Post-incident mitigation" },
      { time: "11:00", requests: 78000, errorRate: 0.3, p99: 16.0, label: "Nominal SLA restored" },
    ],
    frequentErrors: [
      { rank: 1, name: "FATAL: remaining connection slots are reserved", service: "database-service", count: 184, pct: 38, trend: "+12%", isUp: true, severity: "CRITICAL" },
      { rank: 2, name: "Connection timeout (504) -> stripe.api.internal", service: "payment-gateway", count: 135, pct: 28, trend: "+8%", isUp: true, severity: "CRITICAL" },
      { rank: 3, name: "High memory usage: Redis OOM threshold 85%", service: "redis-cache", count: 104, pct: 22, trend: "-15%", isUp: false, severity: "WARN" },
      { rank: 4, name: "ClientConnectionTimeoutException", service: "api-gateway", count: 56, pct: 12, trend: "+2%", isUp: true, severity: "WARN" },
    ],
  },

  "24h": {
    title: "Last 24 Hours — Full Diurnal Production Cycle",
    description: "Enterprise-wide SLA telemetry across 3.5M ingested logs",
    totalLogs: "3,540,800",
    logTrend: "+1.9%",
    ingestionRps: "76,800 req/s",
    criticalErrors: 112,
    warningsDetected: 84,
    activeIncidentsCount: 3,
    affectedServicesCount: 5,
    errorRatePct: 0.7,
    p99LatencyMs: 16.4,
    latencyNote: "99.93% SLA Uptime",
    noiseSuppressionPct: 93.1,
    noiseRatioText: "1,240 alerts → 14 groups",
    peakIncidentWindow: "99.93% SLA Availability Achieved",
    severityDist: { critical: 112, error: 180, warn: 84, info: 110 },
    points: [
      { time: "12:00", requests: 78000, errorRate: 0.4, p99: 16.0, label: "Midday peak traffic" },
      { time: "15:00", requests: 82000, errorRate: 0.3, p99: 15.2, label: "Enterprise API requests" },
      { time: "18:00", requests: 75000, errorRate: 0.2, p99: 14.8, label: "Evening transaction window" },
      { time: "21:00", requests: 66000, errorRate: 0.2, p99: 14.0, label: "APAC crossover load" },
      { time: "00:00", requests: 54000, errorRate: 0.1, p99: 13.5, label: "Midnight maintenance window" },
      { time: "03:00", requests: 48000, errorRate: 0.1, p99: 13.2, label: "Lowest cluster diurnal load" },
      { time: "06:00", requests: 62000, errorRate: 0.3, p99: 14.2, label: "European market opening" },
      { time: "09:00", requests: 85000, errorRate: 0.5, p99: 17.0, label: "US East peak ramp-up" },
      { time: "10:00", requests: 91400, errorRate: 4.8, p99: 410.0, label: "DB Connection Pool Saturation" },
      { time: "11:00", requests: 79000, errorRate: 0.3, p99: 15.8, label: "Baseline restored" },
    ],
    frequentErrors: [
      { rank: 1, name: "FATAL: remaining connection slots are reserved", service: "database-service", count: 245, pct: 36, trend: "+4%", isUp: true, severity: "CRITICAL" },
      { rank: 2, name: "Connection timeout (504) -> stripe.api.internal", service: "payment-gateway", count: 182, pct: 27, trend: "+1%", isUp: true, severity: "CRITICAL" },
      { rank: 3, name: "High memory usage: Redis OOM threshold", service: "redis-cache", count: 148, pct: 22, trend: "-8%", isUp: false, severity: "WARN" },
      { rank: 4, name: "ClientConnectionTimeoutException", service: "api-gateway", count: 102, pct: 15, trend: "-2%", isUp: false, severity: "WARN" },
    ],
  },
};

const SAMPLE_LOG_FEED = [
  { time: "10:02:10 UTC", service: "api-gateway", level: "CRITICAL", msg: "HTTP 500 rate surged to 24.8% on /v2/checkout (downstream: payment-gateway)", code: 500 },
  { time: "10:01:55 UTC", service: "api-gateway", level: "ERROR", msg: "504 Gateway Timeout: payment-gateway failed to return headers within 3000ms", code: 504 },
  { time: "10:01:40 UTC", service: "payment-gateway", level: "ERROR", msg: "Connection timeout (504) -> database-service:5432 after 3500ms; rolled back charge", code: 504 },
  { time: "10:01:25 UTC", service: "database-service", level: "ERROR", msg: "FATAL: remaining connection slots are reserved for non-replication superusers", code: 503 },
  { time: "10:01:05 UTC", service: "database-service", level: "WARN", msg: "HikariCP pool saturation at 89% (178/200 active client handles)", code: 200 },
  { time: "10:00:48 UTC", service: "database-service", level: "WARN", msg: "Slow query: SELECT * FROM user_accounts WHERE org_id = 'org_9381' [duration=620ms]", code: 200 },
  { time: "10:00:15 UTC", service: "redis-cache", level: "INFO", msg: "HGET user_session:8819 hit=true [duration=8ms]", code: 200 },
];

const FALLBACK_SERVICES: Array<Partial<ServiceNode>> = [
  { id: "api-gateway", name: "API Gateway", tier: "edge", status: "healthy", latency_ms: 24, error_rate: 0.02, cpu_pct: 32, memory_pct: 48, rps: 88650 },
  { id: "database-service", name: "Database Service (PostgreSQL)", tier: "persistence", status: "warning", latency_ms: 410, error_rate: 4.8, cpu_pct: 88, memory_pct: 92, rps: 34100 },
  { id: "payment-gateway", name: "Payment Gateway", tier: "business", status: "critical", latency_ms: 512, error_rate: 6.2, cpu_pct: 74, memory_pct: 65, rps: 12400 },
  { id: "redis-cache", name: "Redis Cache Cluster", tier: "persistence", status: "healthy", latency_ms: 4, error_rate: 0.01, cpu_pct: 41, memory_pct: 78, rps: 65000 },
  { id: "auth-service", name: "Auth Service (OAuth2)", tier: "core", status: "healthy", latency_ms: 16, error_rate: 0.00, cpu_pct: 22, memory_pct: 39, rps: 42000 },
  { id: "billing-worker", name: "Billing Queue Worker", tier: "async", status: "healthy", latency_ms: 85, error_rate: 0.15, cpu_pct: 46, memory_pct: 54, rps: 8200 },
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
  const [hoveredPoint, setHoveredPoint] = useState<TimePoint | null>(null);
  const [incidentResolved, setIncidentResolved] = useState<boolean>(false);
  const [logFilterQuery, setLogFilterQuery] = useState<string>("");
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>("ALL");
  const [copiedActionCmd, setCopiedActionCmd] = useState<boolean>(false);

  // Active Profile based on selected time window
  const activeProfile = TIME_WINDOW_PROFILES[timeWindow];

  // Active microservices list
  const services = topology?.nodes && topology.nodes.length > 0 ? topology.nodes : (FALLBACK_SERVICES as ServiceNode[]);

  // Count healthy, warning, critical
  const criticalCount = services.filter((s) => s.status === "critical").length;
  const warningCount = services.filter((s) => s.status === "warning").length;
  const healthyCount = services.filter((s) => s.status === "healthy").length;

  // Filtered log feed for the bottom section
  const filteredLogs = useMemo(() => {
    return SAMPLE_LOG_FEED.filter((log) => {
      const matchQuery =
        !logFilterQuery ||
        log.msg.toLowerCase().includes(logFilterQuery.toLowerCase()) ||
        log.service.toLowerCase().includes(logFilterQuery.toLowerCase());
      const matchLevel =
        selectedSeverityFilter === "ALL" || log.level === selectedSeverityFilter;
      return matchQuery && matchLevel;
    });
  }, [logFilterQuery, selectedSeverityFilter]);

  // Dynamically compute SVG path coordinates based on activeProfile points
  const { reqPath, reqArea, errPath, errArea, pointCoords } = useMemo(() => {
    const pts = activeProfile.points;
    const width = 600;
    const height = 180;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const count = pts.length;

    const maxReq = Math.max(...pts.map((p) => p.requests), 100000);
    const maxErr = 6.5;

    const coords = pts.map((p, i) => {
      const cx = padding + (i / (count - 1)) * chartWidth;
      const cyErr = height - 20 - (p.errorRate / maxErr) * 130;
      const cyReq = height - 15 - (p.requests / maxReq) * 45;
      return { cx, cyErr, cyReq, point: p };
    });

    const rPath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.cx.toFixed(1)} ${c.cyReq.toFixed(1)}`).join(" ");
    const rArea = `${rPath} L ${coords[coords.length - 1].cx.toFixed(1)} ${height - 10} L ${coords[0].cx.toFixed(1)} ${height - 10} Z`;

    const ePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.cx.toFixed(1)} ${c.cyErr.toFixed(1)}`).join(" ");
    const eArea = `${ePath} L ${coords[coords.length - 1].cx.toFixed(1)} ${height - 10} L ${coords[0].cx.toFixed(1)} ${height - 10} Z`;

    return { reqPath: rPath, reqArea: rArea, errPath: ePath, errArea: eArea, pointCoords: coords };
  }, [activeProfile]);

  return (
    <div className="w-full space-y-6">
      
      {/* SECTION 1: TOP SECTION (Metadata, Data Source Transparency & 4 KPI Cards) */}
      <div className="space-y-4">
        
        {/* Data Source Transparency Banner (Clearly distinguishing sample data vs uploaded data) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#0f172a] border border-slate-800 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                Data Source:
              </span>
              <span className="font-semibold text-white">
                HikariCP Connection Pool Saturation Scenario (Demo Data)
              </span>
              <span className="text-[11px] text-slate-400 hidden lg:inline">
                • Clearly labeled sample telemetry for demonstration
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab("detective")}
              className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Failure Chain Detective</span>
            </button>
            <button
              onClick={() => onNavigateTab("logs")}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/20"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Logs</span>
            </button>
          </div>
        </div>

        {/* Dashboard Sub-Header Toolbar with Time Selector */}
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
                  <span>SYNCHRONIZED METRICS</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                <span className="text-slate-200 font-semibold">{activeProfile.title}</span> • {activeProfile.description}
              </p>
            </div>
          </div>

          {/* Time Window Selector Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#141d2e] p-1 rounded-xl border border-slate-800 text-xs font-mono">
              {(["15m", "1h", "6h", "24h"] as const).map((win) => {
                const isSelected = timeWindow === win;
                return (
                  <button
                    key={win}
                    onClick={() => {
                      setTimeWindow(win);
                      setHoveredPoint(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                      isSelected
                        ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 scale-105"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    {win}
                  </button>
                );
              })}
            </div>

            {onInjectChaos && (
              <button
                onClick={() => onInjectChaos("database-service", "database_connection_pool_exhaustion")}
                className="px-3 py-1.5 rounded-xl bg-[#141d2e] hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Simulate Outage</span>
              </button>
            )}

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

        {/* 4 Required Top Section KPI Cards (Exact User Requirements) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Logs Analyzed */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl transition-all hover:border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Total Logs Analyzed</span>
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">{activeProfile.totalLogs}</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center font-mono">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {activeProfile.logTrend}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Throughput Velocity</span>
              <span className="text-sky-300 font-semibold">{activeProfile.ingestionRps}</span>
            </div>
            <div className="mt-2 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full w-[82%]" />
            </div>
          </div>

          {/* Card 2: Errors Detected */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-rose-500/40 shadow-xl shadow-rose-950/20 transition-all hover:border-rose-500/60">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Errors Detected</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <AlertOctagon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-400 font-mono">{activeProfile.criticalErrors}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                activeProfile.errorRatePct >= 3.5
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}>
                {activeProfile.errorRatePct}% Surge
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Warnings Detected</span>
              <span className="text-amber-400 font-bold">{activeProfile.warningsDetected} warnings</span>
            </div>
            <div className="mt-2 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(activeProfile.errorRatePct * 15, 100)}%` }}
              />
            </div>
          </div>

          {/* Card 3: Active Incidents */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-amber-500/30 shadow-xl transition-all hover:border-amber-500/50">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Active Incidents</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-300 font-mono">{activeProfile.activeIncidentsCount}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white font-mono font-bold animate-pulse">
                P1 Critical
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Incident ID</span>
              <span className="text-slate-200 font-bold">#INC-8921 (HikariCP)</span>
            </div>
            <div className="mt-2 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-[65%]" />
            </div>
          </div>

          {/* Card 4: Affected Services */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl transition-all hover:border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Affected Services</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Server className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-300 font-mono">{activeProfile.affectedServicesCount}</span>
              <span className="text-xs text-slate-400 font-mono">of 8 services</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono truncate">
              <span>Impacted</span>
              <span className="text-sky-300 font-semibold truncate ml-2">db, payment, gateway</span>
            </div>
            <div className="mt-2 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full w-[38%]" />
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 2: MIDDLE SECTION (Error Frequency Chart, Severity Distribution, Service Health Grid) */}
      <div className="space-y-6">
        
        {/* Error Frequency Chart + Error Severity Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Error Frequency Chart (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0f172a] border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Error Frequency &amp; Request Volume ({timeWindow})
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculated from active telemetry timestamps showing error surge progression
                </p>
              </div>
              
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
                className="w-full h-full overflow-visible transition-all duration-300"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="20" y1="35" x2="580" y2="35" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="20" y1="80" x2="580" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="20" y1="125" x2="580" y2="125" stroke="#1e293b" strokeDasharray="3 3" />

                <line x1="20" y1="90" x2="580" y2="90" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                <text x="575" y="85" fill="#f43f5e" fontSize="9" textAnchor="end" fontFamily="monospace">
                  SRE Threshold (3.5%)
                </text>

                <path d={reqArea} fill="url(#reqGradient)" />
                <path d={reqPath} fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.75" />

                <path d={errArea} fill="url(#errorGradient)" />
                <path d={errPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" />

                {pointCoords.map((c, idx) => {
                  const isSpike = c.point.errorRate >= 3.5;
                  const isHovered = hoveredPoint?.time === c.point.time;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredPoint(c.point)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <circle
                        cx={c.cx}
                        cy={c.cyErr}
                        r={isHovered ? 6.5 : isSpike ? 5 : 3.5}
                        fill={isSpike ? "#f43f5e" : "#0ea5e9"}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="transition-all"
                      />
                      {isSpike && (
                        <circle
                          cx={c.cx}
                          cy={c.cyErr}
                          r="9"
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                          opacity="0.5"
                          className="animate-ping"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2 px-4">
                {activeProfile.points.map((pt, i) => (
                  <span key={i} className={i % 2 === 0 ? "block font-semibold" : "hidden sm:block"}>
                    {pt.time}
                  </span>
                ))}
              </div>

              {hoveredPoint && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 p-3 rounded-xl bg-[#0b101b] border border-slate-700 shadow-2xl text-xs font-mono space-y-1 pointer-events-none z-20">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sky-400 font-bold">{hoveredPoint.time} UTC</span>
                    <span className={`font-bold ${hoveredPoint.errorRate >= 3.5 ? "text-rose-400" : "text-emerald-400"}`}>
                      {hoveredPoint.errorRate}% Error Rate
                    </span>
                  </div>
                  <div className="text-slate-300">{hoveredPoint.label}</div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between gap-4">
                    <span>Throughput: {hoveredPoint.requests.toLocaleString()} req/s</span>
                    <span>p99: {hoveredPoint.p99}ms</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Peak Horizon: <b className="text-rose-400">{activeProfile.peakIncidentWindow}</b></span>
              <button
                onClick={() => onNavigateTab("detective")}
                className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Open Failure Chain</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Error Severity Distribution (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0f172a] border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Error Severity Distribution
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Categorized log volume in the selected {timeWindow} window
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#141d2e] border border-slate-800 text-[11px] font-mono text-slate-300">
                  4 Tiers
                </span>
              </div>

              {/* Severity Breakdown Progress Bars */}
              <div className="space-y-3.5">
                {/* Critical */}
                <div className="p-3 rounded-xl bg-[#141d2e] border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-slate-200 font-bold">CRITICAL</span>
                    </span>
                    <span className="text-rose-400 font-bold">{activeProfile.severityDist.critical} events</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-[45%]" />
                  </div>
                </div>

                {/* Error */}
                <div className="p-3 rounded-xl bg-[#141d2e] border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-slate-200 font-bold">ERROR</span>
                    </span>
                    <span className="text-orange-400 font-bold">{activeProfile.severityDist.error} events</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full w-[55%]" />
                  </div>
                </div>

                {/* Warning */}
                <div className="p-3 rounded-xl bg-[#141d2e] border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-slate-200 font-bold">WARN</span>
                    </span>
                    <span className="text-amber-400 font-bold">{activeProfile.severityDist.warn} events</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[28%]" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 rounded-xl bg-[#141d2e] border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      <span className="text-slate-200 font-bold">INFO</span>
                    </span>
                    <span className="text-sky-400 font-bold">{activeProfile.severityDist.info} events</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full w-[16%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Total Anomalies: {activeProfile.criticalErrors + activeProfile.warningsDetected}</span>
              <button
                onClick={() => onNavigateTab("logs")}
                className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Filter Logs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Service Health Overview (6 Microservice Cards) */}
        <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Service Health Overview
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time operational latency SLAs, error rates, and resource utilization across services
              </p>
            </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc) => {
              const isCrit = svc.status === "critical";
              const isWarn = svc.status === "warning";

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

      </div>

      {/* SECTION 3: BOTTOM SECTION (Searchable Log Table, Incident Timeline & Root-Cause Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Searchable Log Table (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Searchable Log Stream
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filtered entries from current active buffer
                </p>
              </div>

              {/* Severity Quick Filter Pills */}
              <div className="flex items-center gap-1 bg-[#141d2e] p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
                {(["ALL", "CRITICAL", "ERROR", "WARN"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedSeverityFilter(lvl)}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      selectedSeverityFilter === lvl
                        ? "bg-sky-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search Input Box */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logFilterQuery}
                onChange={(e) => setLogFilterQuery(e.target.value)}
                placeholder="Search logs by message, endpoint, error keyword..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141d2e] border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* Log Rows Table */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredLogs.map((log, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-[#141d2e] border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start gap-2.5 text-xs font-mono"
                >
                  <span className="text-slate-500 text-[10px] shrink-0 mt-0.5">{log.time}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 text-[9px] shrink-0 font-bold">
                    {log.service}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                      log.level === "CRITICAL"
                        ? "bg-rose-600 text-white"
                        : log.level === "ERROR"
                        ? "bg-orange-600 text-white"
                        : log.level === "WARN"
                        ? "bg-amber-600 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-slate-200 text-[11px] break-all flex-1">
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Showing {filteredLogs.length} matching traces</span>
            <button
              onClick={() => onNavigateTab("logs")}
              className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Open Full Terminal Log Viewer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Incident Timeline & Root-Cause Panel (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Incident Timeline &amp; Root Cause
              </h3>
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-bold animate-pulse">
                P1 OUTAGE
              </span>
            </div>

            {/* Chronological Incident Timeline Steps */}
            <div className="space-y-2.5">
              {[
                { time: "10:00:05 UTC", title: "Database latency increased (620ms)", service: "database-service", status: "WARN" },
                { time: "10:01:08 UTC", title: "HikariCP connection pool exhausted (100%)", service: "database-service", status: "ERROR" },
                { time: "10:01:40 UTC", title: "Payment API 504 timeouts begin", service: "payment-gateway", status: "ERROR" },
                { time: "10:02:10 UTC", title: "HTTP 500 error surge on /v2/checkout", service: "api-gateway", status: "CRITICAL" },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#141d2e] border border-slate-800 flex items-start gap-2.5 text-xs font-mono"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{step.time}</span>
                      <span className="text-[10px] text-sky-400 font-bold">{step.service}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 mt-0.5">{step.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Root-Cause Synthesis Card */}
            <div className="mt-4 p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Probable Root Cause</span>
              </div>
              <p className="text-xs text-white font-semibold">
                PostgreSQL HikariCP Connection Pool Exhaustion
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                Slow queries holding open handles starved worker threads, causing downstream payment timeouts.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab("detective")}
              className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Failure Chain Detective</span>
            </button>
            <button
              onClick={() => onNavigateTab("replay")}
              className="py-2 px-3 rounded-xl bg-[#141d2e] hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
