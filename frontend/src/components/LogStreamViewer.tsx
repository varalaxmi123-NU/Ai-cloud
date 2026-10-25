"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Play,
  Pause,
  X,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { CloudLog, LogSeverity } from "@/types/logAnalyzer";
import { getLogs, executeNLPFilter } from "@/lib/logGenerator";

interface LogStreamViewerProps {
  onSelectLogError: (log: CloudLog) => void;
  initialNlpQuery?: string;
}

const QUICK_FILTERS = [
  { label: "⚡ DB Connection Errors", query: "Show database errors from the last 30 minutes" },
  { label: "🚨 504 Gateway Timeouts", query: "Find all 504 timeouts on payment-gateway" },
  { label: "⏱ Latency > 500ms", query: "Show slow queries with latency above 500ms" },
  { label: "🔒 Auth Failures", query: "Filter critical auth-service authentication failures" },
  { label: "⚠️ Redis Evictions", query: "Show Redis cache warnings and memory evictions" },
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

  const applyQuickFilter = (query: string) => {
    setNlpQuery(query);
    const { parsed, logs: filteredLogs } = executeNLPFilter(query);
    setLogs(filteredLogs);
    setActiveFilterExplanation(parsed.explanation);
  };

  // Metrics
  const errorCount = logs.filter((l) => l.level === "ERROR" || l.level === "CRITICAL").length;
  const currentErrorRate = logs.length > 0 ? Number(((errorCount / logs.length) * 100).toFixed(1)) : 0;
  const isAnomalySpike = currentErrorRate > errorRateThresholdPct;

  return (
    <div className="w-full space-y-4">
      {/* Sleek Sub-Header Control Bar */}
      <div className="rounded-2xl bg-[#0f172a] border border-slate-800/90 p-4 shadow-xl space-y-3.5">
        
        {/* Row 1: Spotlight Natural Language Search & Primary Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Natural Language Query Input */}
          <form onSubmit={handleNLPSearch} className="flex-1 relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-sky-400 pointer-events-none" />
            <input
              type="text"
              value={nlpQuery}
              onChange={(e) => setNlpQuery(e.target.value)}
              placeholder="Query logs in plain English (e.g. 'Show database errors from last 30m' or '504 timeouts')..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-[#172033] border border-slate-700/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-400 outline-none transition-all font-sans"
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

          {/* Controls: Stream Toggle & Thresholds Config */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live Stream Toggle */}
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                isStreaming
                  ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-900/30"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
            >
              {isStreaming ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Stream: LIVE</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-slate-400" />
                  <span>Stream: PAUSED</span>
                </>
              )}
            </button>

            {/* Threshold Config Button */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showConfig
                  ? "bg-sky-500/20 border-sky-400 text-sky-300"
                  : "bg-[#172033] border-slate-700 text-slate-300 hover:text-white hover:border-slate-600"
              }`}
              title="Configure Statistical Thresholds"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Thresholds</span>
            </button>
          </div>
        </div>

        {/* Row 2: Compact Quick-Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Quick Queries:
          </span>
          {QUICK_FILTERS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => applyQuickFilter(item.query)}
              className="px-2.5 py-1 rounded-lg bg-[#141d2e] hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-sky-300 text-xs font-medium transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Active Filter Explanation Banner */}
        {activeFilterExplanation && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-sky-950/50 border border-sky-500/40 text-xs font-mono text-sky-200 animate-fadeIn">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>{activeFilterExplanation}</span>
            </span>
            <button
              onClick={handleClearSearch}
              className="text-[11px] underline text-sky-300 hover:text-white cursor-pointer ml-3 shrink-0"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Statistical Thresholds Configuration Drawer */}
        {showConfig && (
          <div className="p-4 rounded-xl bg-[#141d2e] border border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fadeIn">
            <div>
              <div className="flex justify-between mb-1.5 text-slate-300 font-semibold">
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
              <div className="flex justify-between mb-1.5 text-slate-300 font-semibold">
                <span>Error Spike Threshold</span>
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
              <div className="flex justify-between mb-1.5 text-slate-300 font-semibold">
                <span>Z-Score Anomaly Sensitivity</span>
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

        {/* Row 3: Service Selector & Severity Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          {/* Microservice Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Service:
            </span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-[#172033] border border-slate-700 text-white font-medium text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer focus:border-sky-400"
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

          {/* Severity Segmented Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-1">
              Severity:
            </span>
            {[
              { id: "all", label: "ALL" },
              { id: "CRITICAL", label: "CRITICAL", color: "bg-red-600 text-white" },
              { id: "ERROR", label: "ERROR", color: "bg-rose-600 text-white" },
              { id: "WARN", label: "WARN", color: "bg-amber-600 text-white" },
              { id: "INFO", label: "INFO", color: "bg-sky-600 text-white" },
            ].map((lvl) => {
              const active = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? lvl.color || "bg-white text-slate-950 font-black shadow-md"
                      : "bg-[#172033] text-slate-300 hover:text-white border border-slate-700/80"
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main High-Legibility Log Stream Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0a0e1a] overflow-hidden shadow-2xl">
        {/* Table Header Bar */}
        <div className="px-5 py-3 bg-[#111827] border-b border-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-4">
          <div className="w-28 shrink-0">Timestamp</div>
          <div className="w-36 shrink-0">Service</div>
          <div className="w-24 shrink-0 text-center">Severity</div>
          <div className="flex-1">Log Message &amp; Diagnostic Details</div>
          <div className="w-20 shrink-0 text-right">Latency</div>
          <div className="w-28 shrink-0 text-right">Root-Cause</div>
        </div>

        {/* Log Entries Stream */}
        <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-800/80 text-xs">
          {logs.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <span className="block text-sm font-semibold text-slate-300">No logs match your filter criteria</span>
              <span className="block text-xs text-slate-500 mt-1">Try resetting the query or selecting &quot;All 8 Microservices&quot;</span>
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
                  className={`px-5 py-3.5 flex items-center gap-4 transition-colors ${
                    isCritical
                      ? "bg-red-950/30 hover:bg-red-950/50 border-l-4 border-red-500 cursor-pointer"
                      : isError
                      ? "bg-rose-950/25 hover:bg-rose-950/45 border-l-4 border-rose-500 cursor-pointer"
                      : isWarn
                      ? "bg-amber-950/15 hover:bg-amber-950/30 border-l-4 border-amber-500"
                      : "hover:bg-[#111827]/70"
                  }`}
                >
                  {/* Timestamp */}
                  <div className="w-28 shrink-0 font-mono text-slate-400 text-xs tracking-tight">
                    {log.timestamp.includes(" ") ? log.timestamp.split(" ")[1] : log.timestamp} UTC
                  </div>

                  {/* Microservice Tag */}
                  <div className="w-36 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#172033] text-sky-200 border border-slate-700/80 font-mono font-medium text-xs truncate max-w-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                      <span className="truncate">{log.service}</span>
                    </span>
                  </div>

                  {/* Severity Pill */}
                  <div className="w-24 shrink-0 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider inline-block ${
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

                  {/* Crisp Log Message */}
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-white text-xs font-mono font-medium leading-relaxed break-words">
                      {log.message}
                    </p>
                    {log.exceptionType && (
                      <span className="text-rose-400 text-xs font-semibold block mt-0.5 font-mono">
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
                          : "text-slate-300"
                      }`}
                    >
                      {log.latencyMs} ms
                    </span>
                  </div>

                  {/* Action / Root-Cause Diagnosis */}
                  <div className="w-28 shrink-0 text-right">
                    {(isError || isCritical) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLogError(log);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-sky-600/30"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-white" />
                        <span>Diagnose</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>OK</span>
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
  );
};
