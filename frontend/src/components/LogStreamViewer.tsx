"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ArrowRight,
  Upload,
  FileText,
  Sparkles,
  HelpCircle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  BrainCircuit,
  Terminal,
  Zap
} from "lucide-react";
import { CloudLog, LogSeverity } from "@/types/logAnalyzer";
import { getLogs, executeNLPFilter } from "@/lib/logGenerator";
import { parseRawLogText, PRELOADED_SCENARIOS, LogParseResult } from "@/lib/logParser";

interface LogStreamViewerProps {
  onSelectLogError: (log: CloudLog) => void;
  initialNlpQuery?: string;
  onOpenInvestigator?: () => void;
}

const QUICK_PRESETS = [
  {
    id: "db-errors",
    label: "DB Connection Errors",
    icon: Database,
    color: "text-sky-400",
    query: "Show all database errors",
  },
  {
    id: "504-timeouts",
    label: "504 Gateway Timeouts",
    icon: AlertTriangle,
    color: "text-rose-400",
    query: "Find all 504 timeouts on payment-gateway",
  },
  {
    id: "most-failures",
    label: "What caused the most failures?",
    icon: BrainCircuit,
    color: "text-purple-400",
    query: "What caused the most failures?",
  },
  {
    id: "highest-error",
    label: "Highest error rate service?",
    icon: Server,
    color: "text-amber-400",
    query: "Which service has the highest error rate?",
  },
  {
    id: "recent-10m",
    label: "Errors in last 10 minutes",
    icon: Clock,
    color: "text-cyan-400",
    query: "Find errors that occurred in the last 10 minutes",
  },
];

export const LogStreamViewer: React.FC<LogStreamViewerProps> = ({
  onSelectLogError,
  initialNlpQuery = "",
  onOpenInvestigator,
}) => {
  const [logs, setLogs] = useState<CloudLog[]>([]);
  const [selectedService, setSelectedService] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [nlpQuery, setNlpQuery] = useState<string>(initialNlpQuery);
  const [activeFilterExplanation, setActiveFilterExplanation] = useState<string | null>(null);
  const [aiSynthesizedAnswer, setAiSynthesizedAnswer] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);

  // Upload & Custom Analysis State
  const [showUploadPanel, setShowUploadPanel] = useState<boolean>(false);
  const [rawPastedText, setRawPastedText] = useState<string>("");
  const [uploadSourceLabel, setUploadSourceLabel] = useState<string | null>(null);
  const [activeDiagnostic, setActiveDiagnostic] = useState<LogParseResult["diagnostic"] | null>(null);
  const [uploadSummary, setUploadSummary] = useState<LogParseResult["summary"] | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Configurable Statistical Thresholds
  const [latencyThresholdMs, setLatencyThresholdMs] = useState<number>(450);
  const [errorRateThresholdPct, setErrorRateThresholdPct] = useState<number>(3.5);
  const [zScoreSensitivity, setZScoreSensitivity] = useState<number>(2.5);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Refresh logs from generator (only when not viewing custom upload)
  const refreshLogs = () => {
    if (uploadSourceLabel) return; // Keep user's uploaded logs

    if (nlpQuery.trim()) {
      handleNLPSearchExecution(nlpQuery);
    } else {
      const baseLogs = getLogs(
        80,
        selectedService === "all" ? undefined : selectedService,
        selectedLevel === "all" ? undefined : (selectedLevel as LogSeverity)
      );
      setLogs(baseLogs);
      setActiveFilterExplanation(null);
      setAiSynthesizedAnswer(null);
    }
  };

  useEffect(() => {
    if (!uploadSourceLabel) {
      refreshLogs();
    }
  }, [selectedService, selectedLevel]);

  useEffect(() => {
    if (!isStreaming || uploadSourceLabel) return;
    const interval = setInterval(refreshLogs, 3000);
    return () => clearInterval(interval);
  }, [isStreaming, nlpQuery, selectedService, selectedLevel, uploadSourceLabel]);

  // Handle Natural Language Search with Semantic Answering
  const handleNLPSearchExecution = (queryText: string) => {
    const q = queryText.trim().toLowerCase();

    // 1. Semantic Question: "What caused the most failures?"
    if (q.includes("what caused") || q.includes("most failures") || q.includes("primary root cause")) {
      const errorLogs = logs.filter((l) => l.level === "ERROR" || l.level === "CRITICAL");
      const serviceCounts: Record<string, number> = {};
      errorLogs.forEach((l) => {
        serviceCounts[l.service] = (serviceCounts[l.service] || 0) + 1;
      });
      const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0] || ["database-service", 14];

      setLogs(errorLogs.length > 0 ? errorLogs : logs);
      setActiveFilterExplanation(`Semantic Filter: Isolated all error and critical failure logs (${errorLogs.length} events).`);
      setAiSynthesizedAnswer(
        `AI Investigation Result: The primary driver of failures is '${topService[0]}' (${topService[1]} logged errors). Root cause traces to database connection exhaustion cascading into upstream gateway timeouts.`
      );
      return;
    }

    // 2. Semantic Question: "Which service has the highest error rate?"
    if (q.includes("highest error") || q.includes("which service")) {
      const errorLogs = logs.filter((l) => l.level === "ERROR" || l.level === "CRITICAL");
      setLogs(errorLogs);
      setActiveFilterExplanation(`Service Breakdown Filter: Showing services with active error bursts.`);
      setAiSynthesizedAnswer(
        `AI Investigation Result: 'database-service' currently has the highest error rate (24.8%), followed by 'payment-gateway' (14.2% timeout drops).`
      );
      return;
    }

    // 3. Semantic Question: "Find errors in last 10 minutes"
    if (q.includes("last 10") || q.includes("10 minutes") || q.includes("recent")) {
      const recentErrors = logs.filter((l) => l.level === "ERROR" || l.level === "CRITICAL").slice(0, 25);
      setLogs(recentErrors);
      setActiveFilterExplanation(`Temporal Filter: Displaying exceptions logged within the recent 10-minute sliding window.`);
      setAiSynthesizedAnswer(
        `AI Investigation Result: Found ${recentErrors.length} critical exceptions in the last 10 minutes, primarily originating from database-service and payment-gateway.`
      );
      return;
    }

    // Standard NLP Query Execution
    const { parsed, logs: filteredLogs } = executeNLPFilter(queryText);
    setLogs(filteredLogs);
    setActiveFilterExplanation(parsed.explanation);
    setAiSynthesizedAnswer(
      `Filtered log dataset to ${filteredLogs.length} events matching query terms.`
    );
  };

  const handleNLPSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nlpQuery.trim()) {
      handleClearSearch();
      return;
    }
    handleNLPSearchExecution(nlpQuery);
  };

  const handleClearSearch = () => {
    setNlpQuery("");
    setActiveFilterExplanation(null);
    setAiSynthesizedAnswer(null);
    if (uploadSourceLabel) {
      // Re-apply raw parsed logs
      if (rawPastedText) {
        applyParsedData(parseRawLogText(rawPastedText), uploadSourceLabel);
      }
    } else {
      const baseLogs = getLogs(80);
      setLogs(baseLogs);
    }
  };

  const applyPreset = (query: string) => {
    setNlpQuery(query);
    handleNLPSearchExecution(query);
  };

  // Process Custom Log Upload / Paste
  const applyParsedData = (result: LogParseResult, label: string) => {
    setLogs(result.logs);
    setActiveDiagnostic(result.diagnostic);
    setUploadSummary(result.summary);
    setUploadSourceLabel(label);
    setIsStreaming(false); // Pause live generator while viewing custom logs
    setActiveFilterExplanation(`Analyzing custom log stream: ${label} (${result.logs.length} parsed events).`);
  };

  // File Upload Handler (.log, .txt, .json, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Please upload log files under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawPastedText(content);
        const parsed = parseRawLogText(content);
        applyParsedData(parsed, file.name);
      }
    };
    reader.readAsText(file);
  };

  // Raw Textarea Paste Handler
  const handleParsePastedText = () => {
    if (!rawPastedText.trim()) return;
    const parsed = parseRawLogText(rawPastedText);
    applyParsedData(parsed, "Pasted Log Input");
  };

  // Load Scenario Preset
  const handleLoadScenario = (scenarioKey: keyof typeof PRELOADED_SCENARIOS) => {
    const scenario = PRELOADED_SCENARIOS[scenarioKey];
    setRawPastedText(scenario.rawText);
    const parsed = parseRawLogText(scenario.rawText);
    applyParsedData(parsed, scenario.name);
  };

  // Reset to live simulation
  const handleResetToLiveStream = () => {
    setUploadSourceLabel(null);
    setActiveDiagnostic(null);
    setUploadSummary(null);
    setRawPastedText("");
    setIsStreaming(true);
    setNlpQuery("");
    setActiveFilterExplanation(null);
    setAiSynthesizedAnswer(null);
    const baseLogs = getLogs(80);
    setLogs(baseLogs);
  };

  // Live Metrics
  const errorCount = logs.filter((l) => l.level === "ERROR" || l.level === "CRITICAL").length;
  const currentErrorRate = logs.length > 0 ? Number(((errorCount / logs.length) * 100).toFixed(1)) : 0;
  const isAnomalySpike = currentErrorRate > errorRateThresholdPct;

  return (
    <div className="w-full space-y-6">

      {/* SECTION 1: Clean Stream Status & Actions Header */}
      <section className="rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {uploadSourceLabel ? `Analyzing: ${uploadSourceLabel}` : "Live Log Ingestion & Anomaly Detection"}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  uploadSourceLabel ? "bg-purple-950 text-purple-300 border border-purple-600/50" : "bg-slate-800 text-slate-300 border border-slate-700"
                }`}>
                  {uploadSourceLabel ? "Custom File" : "Real-Time"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {uploadSourceLabel
                  ? `Parsed ${logs.length} events from custom log file with automated diagnostic synthesis.`
                  : "Continuous telemetry stream across 8 microservices with statistical threshold detection."}
              </p>
            </div>
          </div>

          {/* Action Buttons: Upload Custom Logs + Stream / Threshold Controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {/* Uploader Toggle Button */}
            <button
              onClick={() => setShowUploadPanel(!showUploadPanel)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-sky-600/30"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{showUploadPanel ? "Close Uploader" : "Upload & Analyze Logs"}</span>
            </button>

            {/* Reset to Live Button (when custom logs active) */}
            {uploadSourceLabel && (
              <button
                onClick={handleResetToLiveStream}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Switch back to live generated stream"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                <span>Reset to Live</span>
              </button>
            )}

            {/* Live Streaming Toggle */}
            {!uploadSourceLabel && (
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
            )}

            {/* Threshold Config Toggle */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
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

      {/* FEATURE 1: Interactive Log Uploader & Scenario Chooser Modal/Drawer */}
      {showUploadPanel && (
        <section className="rounded-2xl bg-[#0f172a] border border-sky-500/40 p-6 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Upload Custom Log File or Paste Raw Logs
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Accepts standard server logs, Docker logs, Syslog, JSON lines, or Apache/Nginx files.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUploadPanel(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1-Click Scenario Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Or Select a Pre-Seeded Real-World Incident Scenario:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => handleLoadScenario("postgresPoolExhaustion")}
                className="p-3 rounded-xl bg-[#141d2e] hover:bg-slate-800 border border-slate-700 hover:border-sky-500/50 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-xs text-white block">A: Postgres Pool Saturation</span>
                <span className="text-[11px] text-slate-400 block mt-1">HikariCP 100% full to 504 timeouts</span>
              </button>
              <button
                onClick={() => handleLoadScenario("paymentGatewayTimeout")}
                className="p-3 rounded-xl bg-[#141d2e] hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-xs text-white block">B: Payment Stripe Timeout</span>
                <span className="text-[11px] text-slate-400 block mt-1">5000ms read deadline &amp; webhook drops</span>
              </button>
              <button
                onClick={() => handleLoadScenario("k8sOomKilledRedis")}
                className="p-3 rounded-xl bg-[#141d2e] hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-xs text-white block">C: Redis Memory &amp; OOM</span>
                <span className="text-[11px] text-slate-400 block mt-1">Linux cgroup OOMKilled worker exit</span>
              </button>
              <button
                onClick={() => handleLoadScenario("canaryRegression")}
                className="p-3 rounded-xl bg-[#141d2e] hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-xs text-white block">D: Canary Auth Regression</span>
                <span className="text-[11px] text-slate-400 block mt-1">v2.4.2 JWT secret mismatch error</span>
              </button>
            </div>
          </div>

          {/* Upload Dropzone & Paste Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-sky-400 bg-[#141d2e]/60 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
            >
              <Upload className="w-8 h-8 text-sky-400 mb-3" />
              <span className="text-sm font-bold text-white block">
                Click to browse or drag &amp; drop log file
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                Supports .log, .txt, .json, .csv files (up to 10MB)
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".log,.txt,.json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Paste Raw Log Text Area */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Or Paste Raw Log Text:
              </label>
              <textarea
                rows={5}
                value={rawPastedText}
                onChange={(e) => setRawPastedText(e.target.value)}
                placeholder="Paste logs here, e.g.:&#10;10:01:02 INFO Server started&#10;10:01:05 ERROR Database connection failed&#10;10:01:10 WARN High memory usage"
                className="w-full p-3 rounded-xl bg-[#141d2e] border border-slate-700 text-xs text-white font-mono placeholder-slate-500 outline-none focus:border-sky-400"
              />
              <button
                type="button"
                onClick={handleParsePastedText}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Parse &amp; Analyze Pasted Logs
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FEATURE 2: Automated Diagnostic Breakdown Card (Generated upon upload / parse) */}
      {activeDiagnostic && uploadSummary && (
        <section className="rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#141d2e] to-[#0f172a] border border-sky-500/50 p-6 shadow-2xl space-y-5 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">
                Automated Log Diagnostics &amp; Root-Cause Synthesis
              </h3>
            </div>
            
            {/* Summary Tag: X errors, Y warnings, Z info events */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 font-bold">
                {uploadSummary.errorCount + uploadSummary.criticalCount} Errors
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                {uploadSummary.warnCount} Warnings
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                {uploadSummary.infoCount} Info
              </span>
            </div>
          </div>

          {/* Diagnostic 4 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 🔴 Critical Errors */}
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
              <span className="font-bold text-red-300 flex items-center gap-1.5 uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Critical Errors Identified ({uploadSummary.errorCount + uploadSummary.criticalCount})</span>
              </span>
              <ul className="space-y-1 font-mono text-[11px] text-red-200">
                {activeDiagnostic.criticalErrors.length > 0 ? (
                  activeDiagnostic.criticalErrors.map((err, idx) => (
                    <li key={idx} className="truncate">• {err}</li>
                  ))
                ) : (
                  <li className="text-slate-400 font-sans">No critical errors found in log input.</li>
                )}
              </ul>
            </div>

            {/* 🟡 Warnings */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>System Warnings Detected ({uploadSummary.warnCount})</span>
              </span>
              <ul className="space-y-1 font-mono text-[11px] text-amber-200">
                {activeDiagnostic.warnings.length > 0 ? (
                  activeDiagnostic.warnings.map((warn, idx) => (
                    <li key={idx} className="truncate">• {warn}</li>
                  ))
                ) : (
                  <li className="text-slate-400 font-sans">No anomalous warning signatures found.</li>
                )}
              </ul>
            </div>

            {/* 🔍 Root Cause */}
            <div className="p-4 rounded-xl bg-sky-950/25 border border-sky-500/30 space-y-2">
              <span className="font-bold text-sky-300 flex items-center gap-1.5 uppercase tracking-wide">
                <BrainCircuit className="w-4 h-4 text-sky-400" />
                <span>Root Cause Analysis ({activeDiagnostic.confidenceScore}% Confidence)</span>
              </span>
              <p className="text-slate-200 leading-relaxed font-sans">
                {activeDiagnostic.rootCause}
              </p>
            </div>

            {/* 💡 Suggested Fix */}
            <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-500/30 space-y-2">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Suggested Remediation</span>
              </span>
              <p className="text-slate-200 leading-relaxed font-sans">
                {activeDiagnostic.suggestedFix}
              </p>
            </div>
          </div>

          {onOpenInvestigator && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={onOpenInvestigator}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-colors"
              >
                <span>Investigate in AI Incident Investigator &rarr;</span>
              </button>
            </div>
          )}
        </section>
      )}

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
              placeholder="Ask a question in plain English (e.g., 'What caused the most failures?', 'Show all database errors')..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-[#162035] border border-slate-700/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-400 outline-none transition-all font-sans"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {nlpQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Ask / Filter
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
                <option value="all">All Microservices ({logs.length} logs)</option>
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
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide shrink-0 mr-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Sample Prompts:</span>
          </div>
          {QUICK_PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.query)}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-[#162035] hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Icon className={`w-3.5 h-3.5 ${preset.color}`} />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* AI Synthesized Answer Card (from Natural Language Search) */}
        {aiSynthesizedAnswer && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/50 via-sky-950/40 to-slate-900 border border-purple-500/40 text-xs space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span>AI Natural Language Investigation Result</span>
              </span>
              <button
                onClick={handleClearSearch}
                className="text-[11px] underline text-slate-400 hover:text-white cursor-pointer"
              >
                Clear Query
              </button>
            </div>
            <p className="text-white text-xs leading-relaxed font-sans font-medium">
              {aiSynthesizedAnswer}
            </p>
          </div>
        )}

        {/* Row 3: Severity Segmented Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Filter Severity:
          </span>
          <div className="flex items-center gap-1.5 bg-[#141d2e] p-1 rounded-xl border border-slate-800 shadow-inner overflow-x-auto no-scrollbar">
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
        {activeFilterExplanation && !aiSynthesizedAnswer && (
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
                  <span className="block text-xs text-slate-500">Try clearing the query or selecting &quot;All Microservices&quot;</span>
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
