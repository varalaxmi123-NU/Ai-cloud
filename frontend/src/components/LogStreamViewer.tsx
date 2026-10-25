"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Search,
  Filter,
  Sliders,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Terminal,
  Play,
  Pause,
  X,
  Cpu
} from "lucide-react";
import { CloudLog, LogSeverity } from "@/types/logAnalyzer";
import { getLogs, executeNLPFilter } from "@/lib/logGenerator";

interface LogStreamViewerProps {
  onSelectLogError: (log: CloudLog) => void;
  initialNlpQuery?: string;
}

const SAMPLE_NLP_QUERIES = [
  "Show database errors from the last 30 minutes",
  "Find all 504 timeouts on payment-gateway",
  "Show slow queries with latency above 500ms",
  "Filter critical auth-service authentication failures",
  "Show Redis cache warnings and memory evictions"
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

  // Configurable Statistical Anomaly Thresholds (Feature 1)
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

  // Handle Natural Language Search Submission
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

  // Clear NLP Search
  const handleClearSearch = () => {
    setNlpQuery("");
    setActiveFilterExplanation(null);
    const baseLogs = getLogs(80);
    setLogs(baseLogs);
  };

  // Statistical calculations
  const errorCount = logs.filter((l) => l.level === "ERROR" || l.level === "CRITICAL").length;
  const currentErrorRate = logs.length > 0 ? Number(((errorCount / logs.length) * 100).toFixed(1)) : 0;
  const isAnomalySpike = currentErrorRate > errorRateThresholdPct;

  return (
    <div className="w-full space-y-4 rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl">
      {/* Top Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Real-Time Log Ingestion &amp; Anomaly Detection
                </h2>
                {isAnomalySpike && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono text-xs font-bold animate-pulse shadow-md shadow-red-900/50">
                    ANOMALY SURGE DETECTED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Ingesting live events • Current Error Rate:{" "}
                <b className={`font-bold ${isAnomalySpike ? "text-red-400" : "text-emerald-400"}`}>
                  {currentErrorRate}%
                </b>{" "}
                (Threshold: {errorRateThresholdPct}%) • p99 Threshold: {latencyThresholdMs}ms
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                isStreaming
                  ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/60 shadow-sm"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {isStreaming ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Stream: LIVE</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Stream: PAUSED</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                showConfig
                  ? "bg-cyan-500/20 border-cyan-500 text-cyan-200"
                  : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Statistical Thresholds</span>
            </button>
          </div>
        </div>

        {/* Feature 5: Natural Language Search Form */}
        <form onSubmit={handleNLPSearch} className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-cyan-400 pointer-events-none" />
            <input
              type="text"
              value={nlpQuery}
              onChange={(e) => setNlpQuery(e.target.value)}
              placeholder="Search logs in plain English (e.g., 'Show database errors from the last 30 minutes' or 'Find 504 timeouts on payment')"
              className="w-full pl-12 pr-32 py-3 rounded-xl bg-[#1e293b] border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner font-medium"
            />
            <div className="absolute right-2.5 flex items-center gap-2">
              {nlpQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
              >
                Search NLP
              </button>
            </div>
          </div>
        </form>

        {/* Active Filter Badge */}
        {activeFilterExplanation && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/70 border border-indigo-500/50 text-xs font-mono text-indigo-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold">{activeFilterExplanation}</span>
            </div>
            <button
              onClick={handleClearSearch}
              className="text-[11px] text-indigo-300 hover:text-white underline cursor-pointer"
            >
              Reset to Full Stream ({logs.length} matched)
            </button>
          </div>
        )}

        {/* Prompt Suggestions */}
        {!nlpQuery && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-400">Sample NLP Prompts:</span>
            {SAMPLE_NLP_QUERIES.map((query, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setNlpQuery(query);
                  const { parsed, logs: filteredLogs } = executeNLPFilter(query);
                  setLogs(filteredLogs);
                  setActiveFilterExplanation(parsed.explanation);
                }}
                className="px-3 py-1 rounded-lg bg-[#1e293b] border border-slate-700 hover:border-cyan-400 text-xs text-slate-200 hover:text-cyan-300 transition-all cursor-pointer font-medium"
              >
                &ldquo;{query}&rdquo;
              </button>
            ))}
          </div>
        )}

        {/* Configurable Statistical Thresholds Drawer (Feature 1) */}
        {showConfig && (
          <div className="p-5 rounded-xl bg-[#1e293b] border border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs animate-fadeIn">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-slate-200">Response Latency Threshold</span>
                <span className="font-bold text-cyan-400 text-sm font-mono">{latencyThresholdMs} ms</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={latencyThresholdMs}
                onChange={(e) => setLatencyThresholdMs(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 mt-1.5 block">
                Queries exceeding {latencyThresholdMs}ms are flagged as latency anomalies.
              </span>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-slate-200">Error Surge Sensitivity</span>
                <span className="font-bold text-red-400 text-sm font-mono">{errorRateThresholdPct}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="15.0"
                step="0.5"
                value={errorRateThresholdPct}
                onChange={(e) => setErrorRateThresholdPct(Number(e.target.value))}
                className="w-full accent-red-400 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 mt-1.5 block">
                Triggers alarms when error proportion exceeds {errorRateThresholdPct}%.
              </span>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-slate-200">Gaussian Z-Score Envelope</span>
                <span className="font-bold text-indigo-400 text-sm font-mono">{zScoreSensitivity}&sigma;</span>
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
              <span className="text-[11px] text-slate-400 mt-1.5 block">
                Statistical standard deviations above mean before flagging an incident.
              </span>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Filter Service:</span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-[#1e293b] border border-slate-700 text-white font-semibold text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer focus:border-cyan-400"
            >
              <option value="all">All 8 Microservices</option>
              <option value="database-service">database-service (PostgreSQL)</option>
              <option value="payment-gateway">payment-gateway (Stripe)</option>
              <option value="api-gateway">api-gateway (Envoy)</option>
              <option value="auth-service">auth-service (OAuth2)</option>
              <option value="user-service">user-service</option>
              <option value="redis-cache">redis-cache</option>
              <option value="notification-service">notification-service</option>
              <option value="inventory-service">inventory-service</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide mr-1">Severity:</span>
            {["all", "CRITICAL", "ERROR", "WARN", "INFO"].map((lvl) => {
              const isActive = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? lvl === "CRITICAL"
                        ? "bg-red-600 text-white shadow-md shadow-red-600/40"
                        : lvl === "ERROR"
                        ? "bg-rose-600 text-white shadow-md shadow-rose-600/40"
                        : lvl === "WARN"
                        ? "bg-amber-600 text-white shadow-md shadow-amber-600/40"
                        : "bg-cyan-600 text-white shadow-md shadow-cyan-600/40"
                      : "bg-[#1e293b] text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700"
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* High-Contrast, Legible Log Stream Table */}
      <div className="rounded-xl border border-slate-700 bg-[#0b0f19] overflow-hidden shadow-lg">
        {/* Table Header */}
        <div className="px-5 py-3 bg-[#1e293b] border-b border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-4">
          <div className="w-28 shrink-0">Timestamp</div>
          <div className="w-40 shrink-0">Service</div>
          <div className="w-24 shrink-0 text-center">Severity</div>
          <div className="flex-1">Log Message &amp; Diagnostic Details</div>
          <div className="w-24 shrink-0 text-right">Latency</div>
          <div className="w-32 shrink-0 text-right">Root-Cause</div>
        </div>

        {/* Scrollable Rows */}
        <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-800 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-sans">
              No matching log records found for current query.
            </div>
          ) : (
            logs.map((log, idx) => {
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
                      ? "bg-red-950/40 hover:bg-red-950/60 border-l-4 border-red-500 cursor-pointer"
                      : isError
                      ? "bg-rose-950/30 hover:bg-rose-950/50 border-l-4 border-rose-500 cursor-pointer"
                      : isWarn
                      ? "bg-amber-950/20 hover:bg-amber-950/40 border-l-4 border-amber-500"
                      : idx % 2 === 0
                      ? "bg-[#0b0f19] hover:bg-[#131d33]"
                      : "bg-[#0f172a] hover:bg-[#131d33]"
                  }`}
                >
                  {/* Timestamp */}
                  <div className="w-28 shrink-0 text-slate-400 font-mono text-xs">
                    {log.timestamp.split(" ")[1] || log.timestamp} UTC
                  </div>

                  {/* Service Badge */}
                  <div className="w-40 shrink-0">
                    <span className="px-2.5 py-1 rounded-md bg-[#1e293b] text-cyan-200 border border-slate-700 font-semibold text-xs truncate block max-w-full">
                      {log.service}
                    </span>
                  </div>

                  {/* Severity Badge */}
                  <div className="w-24 shrink-0 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-black inline-block ${
                        isCritical
                          ? "bg-red-600 text-white animate-pulse"
                          : isError
                          ? "bg-rose-600 text-white"
                          : isWarn
                          ? "bg-amber-500 text-slate-950"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      }`}
                    >
                      {log.level}
                    </span>
                  </div>

                  {/* Message & Exception Details (Crisp White Text!) */}
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-white text-xs leading-relaxed font-mono font-medium break-words">
                      {log.message}
                    </p>
                    {log.exceptionType && (
                      <span className="text-rose-400 text-xs font-bold block mt-1 font-mono">
                        ↳ Exception: {log.exceptionType}
                      </span>
                    )}
                  </div>

                  {/* Latency */}
                  <div className="w-24 shrink-0 text-right">
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

                  {/* Action Button */}
                  <div className="w-32 shrink-0 text-right">
                    {(isError || isCritical) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLogError(log);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center justify-end gap-1.5 ml-auto shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>AI Diagnose</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold font-mono">
                        OK
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
