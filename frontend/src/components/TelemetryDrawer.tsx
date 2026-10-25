"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Cpu,
  HardDrive,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Terminal,
  ShieldAlert,
  BrainCircuit,
  Server,
  Layers,
  ArrowUpRight,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { ServiceNode, TelemetryResponse } from "@/types/sre";
import { fetchTelemetry } from "@/lib/api";

interface TelemetryDrawerProps {
  selectedNode: ServiceNode | undefined;
  onClose?: () => void;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({ selectedNode }) => {
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"metrics" | "logs" | "ai">("metrics");

  useEffect(() => {
    if (!selectedNode) return;
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      const data = await fetchTelemetry(selectedNode.id);
      if (isMounted) {
        setTelemetry(data);
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedNode?.id, selectedNode?.status, selectedNode?.latency_ms]);

  if (!selectedNode) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-800 bg-[#070b14]/90 text-center text-slate-500">
        <Server className="w-12 h-12 text-slate-700 mb-3" />
        <h3 className="text-sm font-semibold text-slate-400">No Microservice Selected</h3>
        <p className="text-xs text-slate-500 mt-1">
          Click any node on the topology map to inspect real-time CPU, memory, error rates, and ML anomaly predictions.
        </p>
      </div>
    );
  }

  const isCritical = selectedNode.status === "critical";
  const isWarning = selectedNode.status === "warning";
  const mlAnomaly = telemetry?.ml_anomaly || selectedNode.ml_anomaly;
  const history = telemetry?.history || [];

  // Helper to render SVG mini chart
  const renderLineChart = (
    data: number[],
    color: string,
    fillColor: string,
    minVal: number,
    maxVal: number
  ) => {
    if (data.length < 2) return null;
    const w = 320;
    const h = 70;
    const range = Math.max(1, maxVal - minVal);
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - minVal) / range) * (h - 10) - 5;
      return `${x},${y}`;
    });
    const linePath = `M ${pts.join(" L ")}`;
    const areaPath = `${linePath} L ${w},${h} L 0comma${h} Z`.replace("0comma", "0,");

    return (
      <svg className="w-full h-18 overflow-visible" viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#grad-${color})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  };

  const latencies = history.map((p) => p.latency);
  const maxLat = Math.max(...latencies, 50);
  const cpuValues = history.map((p) => p.cpu);
  const memValues = history.map((p) => p.memory);
  const errorValues = history.map((p) => p.error_rate);
  const maxErr = Math.max(...errorValues, 1.0);

  return (
    <div className="w-full h-[640px] flex flex-col rounded-2xl border border-slate-800/80 bg-[#070b14]/95 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Drawer Top Header */}
      <div className="p-4 border-b border-slate-800/80 bg-[#080d1a]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase tracking-wider">
                {selectedNode.tier}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  isCritical
                    ? "bg-red-950 text-red-300 border border-red-700/60 animate-pulse"
                    : isWarning
                    ? "bg-amber-950 text-amber-300 border border-amber-700/60"
                    : "bg-emerald-950 text-emerald-300 border border-emerald-700/60"
                }`}
              >
                {selectedNode.status.toUpperCase()}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-1">{selectedNode.name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {selectedNode.technology} • {selectedNode.replicas} Pods Active
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono block">HEALTH SCORE</span>
            <span
              className={`text-xl font-mono font-black ${
                selectedNode.health_score < 50
                  ? "text-red-400"
                  : selectedNode.health_score < 85
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {Math.round(selectedNode.health_score)}%
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-800/70 text-xs">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "metrics"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry Charts</span>
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "ai"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
            <span>ML Isolation Forest</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "logs"
                ? "bg-slate-800 text-slate-200 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Live Logs ({telemetry?.logs?.length || 3})</span>
          </button>
        </div>
      </div>

      {/* Drawer Body Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "metrics" && (
          <div className="space-y-4">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">CURRENT LATENCY</span>
                <span
                  className={`text-lg font-bold ${
                    selectedNode.latency_ms > 100 ? "text-red-400" : "text-cyan-400"
                  }`}
                >
                  {selectedNode.latency_ms > 1000
                    ? `${(selectedNode.latency_ms / 1000).toFixed(2)}s`
                    : `${selectedNode.latency_ms.toFixed(1)}ms`}
                </span>
                <span className="text-[9px] text-slate-500 block">
                  Baseline: {selectedNode.baseline_latency}ms
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">ERROR RATE</span>
                <span
                  className={`text-lg font-bold ${
                    selectedNode.error_rate > 5 ? "text-red-400" : "text-slate-200"
                  }`}
                >
                  {selectedNode.error_rate.toFixed(2)}%
                </span>
                <span className="text-[9px] text-slate-500 block">
                  Baseline: {selectedNode.baseline_error_rate}%
                </span>
              </div>
            </div>

            {/* Latency Time Series Chart */}
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Latency Response Curve (last 40s)</span>
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  {selectedNode.latency_ms.toFixed(0)} ms
                </span>
              </div>
              <div className="mt-1">
                {renderLineChart(
                  latencies.length ? latencies : [selectedNode.latency_ms],
                  selectedNode.latency_ms > 100 ? "#ef4444" : "#38bdf8",
                  selectedNode.latency_ms > 100 ? "#ef4444" : "#38bdf8",
                  0,
                  maxLat
                )}
              </div>
            </div>

            {/* CPU & Memory Footprint Chart */}
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Resource Utilization</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  CPU: <b className="text-indigo-300">{Math.round(selectedNode.cpu_pct)}%</b> | RAM:{" "}
                  <b className="text-purple-300">{Math.round(selectedNode.memory_pct)}%</b>
                </span>
              </div>
              <div className="space-y-2 mt-3">
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>CPU Core Pressure</span>
                    <span className="font-bold text-slate-200">{selectedNode.cpu_pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        selectedNode.cpu_pct > 85 ? "bg-red-500" : "bg-indigo-500"
                      }`}
                      style={{ width: `${selectedNode.cpu_pct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>RAM Heap Allocation</span>
                    <span className="font-bold text-slate-200">{selectedNode.memory_pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        selectedNode.memory_pct > 85 ? "bg-red-500" : "bg-purple-500"
                      }`}
                      style={{ width: `${selectedNode.memory_pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Rate Spike Chart */}
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>5xx Error Rate Anomaly</span>
                </span>
                <span className="font-mono text-red-400 font-bold">
                  {selectedNode.error_rate.toFixed(2)} %
                </span>
              </div>
              <div className="mt-1">
                {renderLineChart(
                  errorValues.length ? errorValues : [selectedNode.error_rate],
                  "#f43f5e",
                  "#f43f5e",
                  0,
                  maxErr
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI & Isolation Forest Tab */}
        {activeTab === "ai" && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/40">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-200">
                  Scikit-Learn IsolationForest Anomaly Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Autonomous ensemble model trained on 400 normal operational telemetry signatures across
                latency, 5xx error distribution, CPU saturation, and queue backlog.
              </p>

              <div className="mt-3 p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-400">ANOMALY CONFIDENCE</span>
                  <span
                    className={`font-bold ${
                      (mlAnomaly?.anomaly_confidence || 0) > 70
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {mlAnomaly?.anomaly_confidence ?? 2.4}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (mlAnomaly?.anomaly_confidence || 0) > 70
                        ? "bg-red-500"
                        : (mlAnomaly?.anomaly_confidence || 0) > 40
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, mlAnomaly?.anomaly_confidence || 5)}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">DETECTION SEVERITY</span>
                  <span
                    className={`font-bold ${
                      mlAnomaly?.severity === "CRITICAL"
                        ? "text-red-400"
                        : mlAnomaly?.severity === "ELEVATED_RISK"
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {mlAnomaly?.severity || "NORMAL"}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">MODEL TYPE</span>
                  <span className="text-slate-200 font-bold">Unsupervised Tree</span>
                </div>
              </div>
            </div>

            {/* AI Diagnostics Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <span className="text-slate-400 text-[10px] font-mono block mb-1">
                AGENTIC DIAGNOSTIC HYPOTHESIS
              </span>
              <p className="text-slate-200 leading-relaxed">
                {isCritical
                  ? `[HIGH CONFIDENCE] Primary thread starvation observed on ${selectedNode.name}. Connection backpressure is cascading upstream to callers. Blast radius exceeds threshold.`
                  : isWarning
                  ? `[DEGRADATION DETECTED] Response latency has risen 4.2x above baseline. Early indicators suggest upstream database or cache throttling.`
                  : `Operating strictly within nominal statistical distribution (p99 latency < 35ms, 0 anomalous deviation from baseline).`}
              </p>
            </div>
          </div>
        )}

        {/* Live Logs Tab */}
        {activeTab === "logs" && (
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-2 max-h-[460px] overflow-y-auto">
              {(telemetry?.logs || []).map((log, i) => (
                <div
                  key={i}
                  className={`p-2 rounded border ${
                    log.level === "CRITICAL"
                      ? "bg-red-950/40 border-red-800/60 text-red-300"
                      : log.level === "ERROR"
                      ? "bg-red-950/20 border-red-900/40 text-red-400"
                      : log.level === "WARN"
                      ? "bg-amber-950/30 border-amber-900/40 text-amber-300"
                      : "bg-slate-900/60 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span className="font-bold text-slate-300">{log.level}</span>
                    <span>{log.time}</span>
                  </div>
                  <p className="break-all">{log.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
