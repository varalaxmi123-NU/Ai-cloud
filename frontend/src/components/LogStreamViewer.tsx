"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Play,
  Pause,
  X,
  ShieldAlert,
  Clock,
  Database,
  Server,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  ArrowRight
} from "lucide-react";
import { CloudLog, LogSeverity } from "@/types/logAnalyzer";
import { getLogs, executeNLPFilter } from "@/lib/logGenerator";

interface LogStreamViewerProps {
  onSelectLogError: (log: CloudLog) => void;
  initialNlpQuery?: string;
}

// Strictly pure Lucide icons - ZERO EMOJIS!
const QUICK_PRESETS = [
  {
    id: "db-errors",
    label: "DB Connection Errors",
    icon: Database,
    color: "text-sky-400",
    query: "Show database errors from the last 30 minutes",
  },
  {
    id: "504-timeouts",
    label: "504 Gateway Timeouts",
    icon: AlertTriangle,
    color: "text-rose-400",
    query: "Find all 504 timeouts on payment-gateway",
  },
  {
    id: "high-latency",
    label: "Latency > 500ms",
    icon: Clock,
    color: "text-amber-400",
    query: "Show slow queries with latency above 500ms",
  },
  {
    id: "auth-failures",
    label: "Auth Failures",
    icon: ShieldAlert,
    color: "text-purple-400",
    query: "Filter critical auth-service authentication failures",
  },
  {
    id: "redis-evictions",
    label: "Redis Evictions",
    icon: Server,
    color: "text-cyan-400",
    query: "Show Redis cache warnings and memory evictions",
  },
];

export const LogStreamViewer: React.FC<LogStreamViewerProps> = ({
  onSelectLogError,
  initialNlpQuery = "",
}) => {
  const [logs, setLogs] = useState<CloudLog[]>([]);
  const [selectedService, setSelectedService] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [nlpQuery, setNlpQuery] = useState<string>(initialNlpQuery);
  const [activeFilterExplanation, setActiveFilterExplanation] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);

  // Configurable Statistical Thresholds
  const [latencyThresholdMs, setLatencyThresholdMs] = useState<number>(450);
  const [errorRateThresholdPct, setErrorRateThresholdPct] = useState<number>(3.5);
  const [zScoreSensitivity, setZScoreSensitivity] = useState<number>(2.5);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Refresh logs
  const refreshLogs = () => {
    if (nlpQuery.trim()) {
      const { parsed, logs: filteredLogs } = executeNLPFilter(nlpQuery);
      setLogs(filteredLogs);
      setActiveFilterExplanation(parsed.explanation);
    } else {
      const baseLogs = getLogs(
        80,
        selectedService === "all" ? undefined : selectedService,
        selectedLevel === "all" ? undefined : (selectedLevel as LogSeverity)
      );
      setLogs(baseLogs);
      setActiveFilterExplanation(null);
    }
  };

  useEffect(() => {
    refreshLogs();
  }, [selectedService, selectedLevel]);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(refreshLogs, 2500);
    return () => clearInterval(interval);
  }, [isStreaming, nlpQuery, selectedService, selectedLevel]);

  const handleNLPSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nlpQuery.trim()) {
      setActiveFilterExplanation(null);
      refreshLogs();
      return;
    }
    const { parsed, logs: filteredLogs } = executeNLPFilter(nlpQuery);
    setLogs(filteredLogs);
    setActiveFilterExplanation(parsed.explanation);
  };

  const handleClearSearch = () => {
    setNlpQuery("");
    setActiveFilterExplanation(null);
    const baseLogs = getLogs(80);
    setLogs(baseLogs);
  };

  const applyPreset = (query: string) => {
    setNlpQuery(query);
    const { parsed, logs: filteredLogs } = executeNLPFilter(query);
    setLogs(filteredLogs);
    setActiveFilterExplanation(parsed.explanation);
  };

  // Live Metrics
  const errorCount = logs.filter((l) => l.level === "ERROR" || l.level === "CRITICAL").length;
  const currentErrorRate = logs.length > 0 ? Number(((errorCount / logs.length) * 100).toFixed(1)) : 0;
  const isAnomalySpike = currentErrorRate > errorRateThresholdPct;

  return (
    <div className="w-full space-y-6">

      {/* SECTION 1: Clean Dedicated Stream Status Header Card */}
      <section className="rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Live Log Ingestion &amp; Anomaly Detection
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  Real-Time
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuous telemetry collection across 8 microservices with statistical threshold detection.
              </p>
            </div>
          </div>

          {/* Stream & Threshold Controls */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {/* Live Streaming Toggle */}
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                isStreaming
                  ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-900/30"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {isStreaming ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Stream: LIVE</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-slate-400" />
                  <span>Stream: PAUSED</span>
                </>
              )}
            </button>

            {/* Threshold Config Toggle */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                showConfig
                  ? "bg-sky-500/20 border-sky-400 text-sky-300"
                  : "bg-[#162035] border-slate-700 text-slate-300 hover:text-white hover:border-slate-600"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Thresholds</span>
            </button>
          </div>
        </div>

        {/* 4 Crisp Stream KPI Badges (Evenly Spaced) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
          <div className="p-3.5 rounded-xl bg-[#141d2e] border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Buffered Events
            </span>
            <span className="text-xl font-black text-white mt-1 block font-mono">
              {logs.length} <span className="text-xs font-normal text-slate-400">records</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141d2e] border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Error Frequency
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xl font-black font-mono ${isAnomalySpike ? "text-red-400" : "text-emerald-400"}`}>
                {currentErrorRate}%
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                isAnomalySpike ? "bg-red-950 text-red-300 border border-red-500/50" : "bg-emerald-950 text-emerald-300"
              }`}>
                Limit {errorRateThresholdPct}%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141d2e] border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              p99 Latency
            </span>
            <span className="text-xl font-black text-white mt-1 block font-mono">
              14.2 ms <span className="text-xs font-normal text-emerald-400">Normal</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141d2e] border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Noise Suppression
            </span>
            <span className="text-xl font-black text-sky-400 mt-1 block font-mono">
              91.2% <span className="text-xs font-normal text-slate-400">Active</span>
            </span>
          </div>
        </div>

        {/* Slide-out Statistical Thresholds Configuration */}
        {showConfig && (
          <div className="mt-5 p-4 rounded-xl bg-[#141d2e] border border-slate-700/80 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs animate-fadeIn">
            <div>
              <div className="flex justify-between mb-2 text-slate-300 font-semibold">
                <span>Latency Threshold</span>
                <span className="text-sky-400 font-mono font-bold">{latencyThresholdMs} ms</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={latencyThresholdMs}
                onChange={(e) => setLatencyThresholdMs(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2 text-slate-300 font-semibold">
                <span>Error Surge Sensitivity</span>
                <span className="text-rose-400 font-mono font-bold">{errorRateThresholdPct}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="15.0"
                step="0.5"
                value={errorRateThresholdPct}
                onChange={(e) => setErrorRateThresholdPct(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2 text-slate-300 font-semibold">
                <span>Z-Score Sensitivity</span>
                <span className="text-indigo-400 font-mono font-bold">{zScoreSensitivity}&sigma;</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="3.5"
                step="0.1"
                value={zScoreSensitivity}
                onChange={(e) => setZScoreSensitivity(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: Dedicated Filter & Search Control Toolbar (Distinct Card, Not Merged) */}
      <section className="rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl space-y-5">
        
        {/* Row 1: Search Input & Service Selector Dropdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Natural Language Query Input (8 cols) */}
          <form onSubmit={handleNLPSearch} className="lg:col-span-8 relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={nlpQuery}
              onChange={(e) => setNlpQuery(e.target.value)}
              placeholder="Query logs in plain English (e.g., 'Show database errors from last 30m')..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-[#162035] border border-slate-700/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-400 outline-none transition-all font-sans"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {nlpQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Microservice Filter Dropdown (4 cols) */}
          <div className="lg:col-span-4 flex items-center gap-2">
            <div className="relative w-full flex items-center">
              <Server className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#162035] border border-slate-700/80 text-white font-medium text-xs rounded-xl outline-none cursor-pointer focus:border-sky-400 transition-colors"
              >
                <option value="all">All 8 Microservices</option>
                <option value="database-service">database-service (PostgreSQL)</option>
                <option value="payment-gateway">payment-gateway (Stripe)</option>
                <option value="api-gateway">api-gateway (Envoy)</option>
                <option value="auth-service">auth-service (OAuth2)</option>
                <option value="user-service">user-service (gRPC)</option>
                <option value="redis-cache">redis-cache (Cluster)</option>
                <option value="notification-service">notification-service (Kafka)</option>
                <option value="inventory-service">inventory-service</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Quick Presets (With Clean SVG Icons, ZERO EMOJIS!) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide mr-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Presets:</span>
          </div>
          {QUICK_PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.query)}
                className="px-3 py-1.5 rounded-xl bg-[#162035] hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Icon className={`w-3.5 h-3.5 ${preset.color}`} />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Severity Segmented Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Filter Severity:
          </span>
          <div className="flex items-center gap-1.5 bg-[#141d2e] p-1 rounded-xl border border-slate-800 shadow-inner">
            {[
              { id: "all", label: "ALL" },
              { id: "CRITICAL", label: "CRITICAL", activeStyle: "bg-red-600 text-white font-black shadow-md shadow-red-600/30" },
              { id: "ERROR", label: "ERROR", activeStyle: "bg-rose-600 text-white font-black shadow-md shadow-rose-600/30" },
              { id: "WARN", label: "WARN", activeStyle: "bg-amber-600 text-white font-black shadow-md shadow-amber-600/30" },
              { id: "INFO", label: "INFO", activeStyle: "bg-sky-600 text-white font-black shadow-md shadow-sky-600/30" },
            ].map((lvl) => {
              const active = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? lvl.activeStyle || "bg-white text-slate-950 font-black shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Explanation Notification */}
        {activeFilterExplanation && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-sky-950/60 border border-sky-500/40 text-xs font-mono text-sky-200 animate-fadeIn">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>{activeFilterExplanation}</span>
            </span>
            <button
              onClick={handleClearSearch}
              className="text-xs font-sans underline text-sky-300 hover:text-white cursor-pointer ml-3 shrink-0"
            >
              Clear Filter
            </button>
          </div>
        )}
      </section>

      {/* SECTION 3: The Log Records Table (High Contrast, Clean Separation, Generous Spacing) */}
      <section className="rounded-2xl border border-slate-800 bg-[#0a0f1d] overflow-hidden shadow-2xl">
        {/* Mobile Swipe Hint Bar (< 768px) */}
        <div className="md:hidden px-4 py-2 bg-[#111827] border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>Live Diagnostics Stream</span>
          <span className="text-sky-400 flex items-center gap-1 font-semibold">Swipe horizontally &rarr;</span>
        </div>

        {/* Responsive Table Scroll Container */}
        <div className="overflow-x-auto no-scrollbar mobile-touch-scroll">
          <div className="min-w-[760px]">
            {/* Table Header */}
            <div className="px-6 py-3.5 bg-[#111827] border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-4">
              <div className="w-28 shrink-0">Timestamp</div>
              <div className="w-40 shrink-0">Microservice</div>
              <div className="w-24 shrink-0 text-center">Severity</div>
              <div className="flex-1">Log Message &amp; Diagnostic Details</div>
              <div className="w-20 shrink-0 text-right">Latency</div>
              <div className="w-28 shrink-0 text-right">Diagnosis</div>
            </div>

            {/* Table Rows Body */}
            <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-800/60 text-xs">
          {logs.length === 0 ? (
            <div className="py-24 text-center text-slate-400 space-y-2">
              <span className="block text-sm font-semibold text-slate-200">No logs match your filter criteria</span>
              <span className="block text-xs text-slate-500">Try clearing the query or selecting &quot;All 8 Microservices&quot;</span>
            </div>
          ) : (
            logs.map((log) => {
              const isCritical = log.level === "CRITICAL";
              const isError = log.level === "ERROR";
              const isWarn = log.level === "WARN";
              const isSlow = log.latencyMs >= latencyThresholdMs;

              return (
                <div
                  key={log.id}
                  onClick={() => (isError || isCritical) && onSelectLogError(log)}
                  className={`px-6 py-4 flex items-center gap-4 transition-colors ${
                    isCritical
                      ? "bg-red-950/30 hover:bg-red-950/50 border-l-4 border-red-500 cursor-pointer"
                      : isError
                      ? "bg-rose-950/25 hover:bg-rose-950/45 border-l-4 border-rose-500 cursor-pointer"
                      : isWarn
                      ? "bg-amber-950/15 hover:bg-amber-950/30 border-l-4 border-amber-500"
                      : "hover:bg-[#141d2e]/60"
                  }`}
                >
                  {/* Timestamp */}
                  <div className="w-28 shrink-0 font-mono text-slate-400 text-xs">
                    {log.timestamp.includes(" ") ? log.timestamp.split(" ")[1] : log.timestamp} UTC
                  </div>

                  {/* Microservice Badge */}
                  <div className="w-40 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#162035] text-sky-200 border border-slate-700/80 font-mono font-medium text-xs truncate max-w-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                      <span className="truncate">{log.service}</span>
                    </span>
                  </div>

                  {/* Severity Badge */}
                  <div className="w-24 shrink-0 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider inline-block ${
                        isCritical
                          ? "bg-red-600 text-white shadow-sm shadow-red-600/40 animate-pulse"
                          : isError
                          ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                          : isWarn
                          ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30"
                          : "bg-slate-800 text-slate-300 border border-slate-700 font-bold"
                      }`}
                    >
                      {log.level}
                    </span>
                  </div>

                  {/* Log Message (Pure, Crisp White Text) */}
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-slate-100 text-xs font-mono font-medium leading-relaxed break-words">
                      {log.message}
                    </p>
                    {log.exceptionType && (
                      <span className="text-rose-400 text-xs font-semibold block mt-1 font-mono">
                        ↳ Exception: {log.exceptionType}
                      </span>
                    )}
                  </div>

                  {/* Latency */}
                  <div className="w-20 shrink-0 text-right">
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        isSlow
                          ? "bg-red-500/20 text-red-300 border border-red-500/50"
                          : "text-slate-400"
                      }`}
                    >
                      {log.latencyMs} ms
                    </span>
                  </div>

                  {/* Root-Cause Action */}
                  <div className="w-28 shrink-0 text-right">
                    {(isError || isCritical) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLogError(log);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-sky-600/25"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Diagnose</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-mono font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Normal</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
