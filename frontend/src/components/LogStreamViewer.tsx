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
  RefreshCw,
  Zap,
  Play,
  Pause
} from "lucide-react";
import { CloudLog, LogSeverity, NLPQueryParsed } from "@/types/logAnalyzer";
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

  // Load and periodically refresh logs
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

  // Calculate current statistical error rate
  const errorCount = logs.filter((l) => l.level === "ERROR" || l.level === "CRITICAL").length;
  const currentErrorRate = logs.length > 0 ? Number(((errorCount / logs.length) * 100).toFixed(1)) : 0;
  const isAnomalySpike = currentErrorRate > errorRateThresholdPct;

  return (
    <div className="w-full space-y-4 rounded-2xl border border-slate-800/80 bg-[#070b14]/95 backdrop-blur-xl p-5 shadow-2xl">
      {/* Top Header & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Real-Time Log Ingestion & Anomaly Stream</span>
                {isAnomalySpike && (
                  <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-600/60 text-[10px] font-mono animate-pulse">
                    STATISTICAL ANOMALY SURGE
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Ingesting {logs.length} telemetry events • Error rate: <b className={isAnomalySpike ? "text-red-400" : "text-emerald-400"}>{currentErrorRate}%</b> (Threshold: {errorRateThresholdPct}%)
              </p>
            </div>
          </div>

          {/* Controls: Stream Toggle & Threshold Config */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors font-semibold ${
                isStreaming
                  ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                  : "bg-slate-900 border-slate-800 text-slate-400"
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? "Stream: LIVE" : "Stream: PAUSED"}</span>
            </button>

            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors font-semibold ${
                showConfig
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Statistical Thresholds</span>
            </button>
          </div>
        </div>

        {/* Feature 5: Natural Language Search Form */}
        <form onSubmit={handleNLPSearch} className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-cyan-400 pointer-events-none" />
            <input
              type="text"
              value={nlpQuery}
              onChange={(e) => setNlpQuery(e.target.value)}
              placeholder="Natural Language Search (e.g. 'Show database errors from the last 30 minutes' or 'Find 504 timeouts on payment')"
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all font-mono"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {nlpQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-2 py-1 rounded text-[10px] text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-sm"
              >
                Search NLP
              </button>
            </div>
          </div>
        </form>

        {/* Active NLP Validated Filter Badge */}
        {activeFilterExplanation && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-xs font-mono">
            <div className="flex items-center gap-2 text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>{activeFilterExplanation}</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {logs.length} logs matched
            </span>
          </div>
        )}

        {/* Prompt Suggestions */}
        {!nlpQuery && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <span className="text-slate-500 text-[10px]">Try Prompts:</span>
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
                className="px-2 py-0.5 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 transition-colors"
              >
                &ldquo;{query}&rdquo;
              </button>
            ))}
          </div>
        )}

        {/* Configurable Statistical Thresholds Drawer (Feature 1) */}
        {showConfig && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono animate-fadeIn">
            <div>
              <div className="flex justify-between mb-1.5 text-slate-400">
                <span>Latency Threshold</span>
                <span className="font-bold text-cyan-400">{latencyThresholdMs} ms</span>
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
              <span className="text-[10px] text-slate-500 mt-1 block">
                Flags queries above {latencyThresholdMs}ms as response time anomalies.
              </span>
            </div>

            <div>
              <div className="flex justify-between mb-1.5 text-slate-400">
                <span>Error Surge Threshold</span>
                <span className="font-bold text-red-400">{errorRateThresholdPct}%</span>
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
              <span className="text-[10px] text-slate-500 mt-1 block">
                Triggers incident alarms when error rate exceeds {errorRateThresholdPct}%.
              </span>
            </div>

            <div>
              <div className="flex justify-between mb-1.5 text-slate-400">
                <span>Z-Score Sensitivity</span>
                <span className="font-bold text-indigo-400">{zScoreSensitivity}&sigma;</span>
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
              <span className="text-[10px] text-slate-500 mt-1 block">
                Statistical standard deviations from baseline before marking anomaly.
              </span>
            </div>
          </div>
        )}

        {/* Traditional Quick Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px] font-mono">Service:</span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 outline-none font-mono"
            >
              <option value="all">All Services (8)</option>
              <option value="database-service">database-service</option>
              <option value="payment-gateway">payment-gateway</option>
              <option value="api-gateway">api-gateway</option>
              <option value="auth-service">auth-service</option>
              <option value="user-service">user-service</option>
              <option value="redis-cache">redis-cache</option>
              <option value="notification-service">notification-service</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {["all", "CRITICAL", "ERROR", "WARN", "INFO"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg border transition-colors ${
                  selectedLevel === lvl
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {lvl.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Log Records Stream */}
      <div className="rounded-xl bg-[#03060c] border border-slate-800/90 overflow-hidden font-mono text-xs">
        <div className="px-4 py-2 bg-[#080d1a] border-b border-slate-800 text-slate-400 text-[11px] grid grid-cols-12 gap-2">
          <span className="col-span-2">TIMESTAMP</span>
          <span className="col-span-2">SERVICE</span>
          <span className="col-span-1">LEVEL</span>
          <span className="col-span-5">LOG MESSAGE &amp; STACK TRACE</span>
          <span className="col-span-1 text-right">LATENCY</span>
          <span className="col-span-1 text-right">ACTION</span>
        </div>

        <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-900/80">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No logs matched your natural language query or filters.
            </div>
          ) : (
            logs.map((log) => {
              const isError = log.level === "ERROR" || log.level === "CRITICAL";
              const isSlow = log.latencyMs >= latencyThresholdMs;

              return (
                <div
                  key={log.id}
                  onClick={() => isError && onSelectLogError(log)}
                  className={`px-4 py-2.5 grid grid-cols-12 gap-2 items-start transition-colors ${
                    isError
                      ? "bg-red-950/20 hover:bg-red-950/40 cursor-pointer border-l-2 border-red-500"
                      : isSlow
                      ? "bg-amber-950/15 hover:bg-amber-950/30 border-l-2 border-amber-500"
                      : "hover:bg-slate-900/40"
                  }`}
                >
                  <span className="col-span-2 text-slate-500 text-[11px] truncate">
                    {log.timestamp.split(" ")[1] || log.timestamp}
                  </span>

                  <span className="col-span-2 text-slate-300 font-semibold truncate">
                    {log.service}
                  </span>

                  <span className="col-span-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.level === "CRITICAL"
                          ? "bg-red-600 text-white animate-pulse"
                          : log.level === "ERROR"
                          ? "bg-red-950 text-red-400 border border-red-800/60"
                          : log.level === "WARN"
                          ? "bg-amber-950 text-amber-400 border border-amber-800/60"
                          : "bg-cyan-950 text-cyan-400 border border-cyan-800/60"
                      }`}
                    >
                      {log.level}
                    </span>
                  </span>

                  <div className="col-span-5 text-slate-200 break-all leading-relaxed">
                    <p>{log.message}</p>
                    {log.exceptionType && (
                      <span className="text-red-400 text-[10px] block mt-0.5">
                        ↳ {log.exceptionType}
                      </span>
                    )}
                  </div>

                  <span
                    className={`col-span-1 text-right font-mono ${
                      isSlow ? "text-red-400 font-bold" : "text-slate-400"
                    }`}
                  >
                    {log.latencyMs}ms
                  </span>

                  <div className="col-span-1 text-right">
                    {isError ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLogError(log);
                        }}
                        className="px-2 py-0.5 rounded bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/50 text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                        <span>AI Root-Cause</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-mono">OK</span>
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
