"use client";

import React, { useState } from "react";
import {
  GitBranch,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileCode,
  ShieldAlert,
  ArrowRight,
  Flame,
  Terminal,
  Layers
} from "lucide-react";
import { DeploymentRegressionData } from "@/types/logAnalyzer";
import { getDeploymentRegression } from "@/lib/logGenerator";

export const DeploymentRegressionView: React.FC = () => {
  const [data, setData] = useState<DeploymentRegressionData>(getDeploymentRegression());
  const [rollingBack, setRollingBack] = useState<boolean>(false);
  const [rolledBack, setRolledBack] = useState<boolean>(false);

  const handleRollback = () => {
    setRollingBack(true);
    setTimeout(() => {
      setRollingBack(false);
      setRolledBack(true);
      setData((prev) => ({
        ...prev,
        currentRelease: "v2.4.1-stable (Rolled Back)",
        deploymentStatus: "HEALTHY_STABLE",
        errorRatePostPct: 0.04,
        errorRateDeltaPct: 0,
        p99LatencyPostMs: 24,
        p99LatencyDeltaMs: 0,
        rollbackRecommended: false,
        newErrorSignatures: []
      }));
    }, 1800);
  };

  const isRegression = data.deploymentStatus === "REGRESSION_DETECTED";

  return (
    <div className="w-full space-y-4 rounded-2xl border border-slate-800/80 bg-[#070b14]/95 backdrop-blur-xl p-5 shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${
            isRegression
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
          }`}>
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Deployment Regression Detection Engine</span>
              {isRegression ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-600/60 text-[10px] font-mono animate-pulse font-bold">
                  REGRESSION DETECTED IN RELEASE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/50 text-[10px] font-mono font-bold">
                  STABLE BASELINE ACTIVE
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Autonomous canary delta analysis comparing telemetry signatures pre- and post-release.
            </p>
          </div>
        </div>

        {/* Release Tags */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">BASELINE</span>
            <span className="font-bold text-slate-300">{data.baselineRelease}</span>
          </div>

          <div className="text-slate-600">&rarr;</div>

          <div className={`px-3 py-1.5 rounded-xl border font-bold ${
            isRegression
              ? "bg-rose-950/60 border-rose-500/60 text-rose-300 animate-pulse"
              : "bg-emerald-950/60 border-emerald-500/60 text-emerald-300"
          }`}>
            <span className="text-[10px] text-slate-400 block">CANARY RELEASE</span>
            <span>{data.currentRelease}</span>
          </div>
        </div>
      </div>

      {/* Regression Metrics Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        {/* Error Rate Delta */}
        <div className={`p-4 rounded-xl border ${
          isRegression
            ? "bg-slate-900/80 border-rose-500/40 shadow-lg shadow-rose-950/30"
            : "bg-slate-900/60 border-slate-800"
        }`}>
          <div className="flex justify-between text-[11px] text-slate-400 mb-2">
            <span>5XX ERROR RATE DELTA</span>
            <span className="font-bold text-rose-400">
              {isRegression ? `+${data.errorRateDeltaPct.toLocaleString()}%` : "0%"}
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div>
              <span className="text-[10px] text-slate-500 block">PRE-DEPLOY</span>
              <span className="text-sm font-bold text-slate-300">{data.errorRatePrePct}%</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">POST-DEPLOY</span>
              <span className={`text-lg font-bold ${isRegression ? "text-rose-400" : "text-emerald-400"}`}>
                {data.errorRatePostPct}%
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full rounded-full ${isRegression ? "bg-rose-500" : "bg-emerald-500"}`}
              style={{ width: `${Math.min(100, data.errorRatePostPct * 15)}%` }}
            />
          </div>
        </div>

        {/* p99 Latency Delta */}
        <div className={`p-4 rounded-xl border ${
          isRegression
            ? "bg-slate-900/80 border-amber-500/40 shadow-lg shadow-amber-950/30"
            : "bg-slate-900/60 border-slate-800"
        }`}>
          <div className="flex justify-between text-[11px] text-slate-400 mb-2">
            <span>P99 RESPONSE LATENCY DELTA</span>
            <span className="font-bold text-amber-400">
              {isRegression ? `+${data.p99LatencyDeltaMs}ms` : "0ms"}
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div>
              <span className="text-[10px] text-slate-500 block">PRE-DEPLOY</span>
              <span className="text-sm font-bold text-slate-300">{data.p99LatencyPreMs}ms</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">POST-DEPLOY</span>
              <span className={`text-lg font-bold ${isRegression ? "text-amber-400" : "text-emerald-400"}`}>
                {data.p99LatencyPostMs}ms
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full rounded-full ${isRegression ? "bg-amber-400" : "bg-emerald-500"}`}
              style={{ width: `${Math.min(100, (data.p99LatencyPostMs / 500) * 100)}%` }}
            />
          </div>
        </div>

        {/* Canary Blast Radius */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-2">
              <span>CANARY TRAFFIC ALLOCATION</span>
              <span className="font-bold text-cyan-400">{data.canaryRolloutPct}% Ingress</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              {isRegression
                ? "Canary pod cohort quarantined to prevent broader platform exposure."
                : "Canary healthy. Ready for 100% production promotion."}
            </p>
          </div>

          {isRegression ? (
            <button
              onClick={handleRollback}
              disabled={rollingBack}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-900/40"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${rollingBack ? "animate-spin" : ""}`} />
              <span>{rollingBack ? "Rolling Back Canary Release..." : "Trigger Instant Canary Rollback"}</span>
            </button>
          ) : (
            <div className="mt-3 py-1.5 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cluster Restored to Stable Baseline</span>
            </div>
          )}
        </div>
      </div>

      {/* New Error Signatures Introduced in this Version */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wider block font-bold">
            New Error Signatures Introduced in {data.currentRelease}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Detected via AST diffing across application logs
          </span>
        </div>

        {data.newErrorSignatures.length === 0 ? (
          <div className="py-6 text-center text-slate-500 font-mono text-xs">
            Zero new error signatures detected in current running cluster.
          </div>
        ) : (
          <div className="space-y-2">
            {data.newErrorSignatures.map((sig, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-red-950/20 border border-red-900/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-rose-300 font-bold">{sig.signature}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>Service: <b className="text-slate-200">{sig.service}</b></span>
                  <span>Occurrences: <b className="text-red-400">{sig.occurrences}</b></span>
                  <span className="px-2 py-0.5 rounded bg-black/50 text-slate-400">
                    {sig.firstSeenInVersion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
