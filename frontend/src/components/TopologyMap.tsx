"use client";

import React, { useState } from "react";
import {
  Globe,
  Key,
  Users,
  CreditCard,
  Package,
  Database,
  Zap,
  Bell,
  AlertOctagon,
  Flame,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles
} from "lucide-react";
import { ServiceNode, DependencyEdge, CascadeResult } from "@/types/sre";

interface TopologyMapProps {
  nodes: ServiceNode[];
  edges: DependencyEdge[];
  selectedServiceId: string;
  onSelectService: (serviceId: string) => void;
  onInjectChaos: (serviceId: string) => void;
  activeChaos: {
    target_service_id: string;
    scenario: string;
    cascade_result: CascadeResult;
  } | null;
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  "api-gateway": <Globe className="w-5 h-5 text-cyan-400" />,
  "auth-service": <Key className="w-5 h-5 text-indigo-400" />,
  "user-service": <Users className="w-5 h-5 text-blue-400" />,
  "payment-gateway": <CreditCard className="w-5 h-5 text-emerald-400" />,
  "inventory-service": <Package className="w-5 h-5 text-amber-400" />,
  "database-service": <Database className="w-5 h-5 text-purple-400" />,
  "redis-cache": <Zap className="w-5 h-5 text-yellow-400" />,
  "notification-service": <Bell className="w-5 h-5 text-pink-400" />,
};

export const TopologyMap: React.FC<TopologyMapProps> = ({
  nodes,
  edges,
  selectedServiceId,
  onSelectService,
  onInjectChaos,
  activeChaos,
}) => {
  const [filterMode, setFilterMode] = useState<"all" | "blast-radius">("all");
  const [showParticles, setShowParticles] = useState<boolean>(true);

  // Map nodes by id for quick lookup
  const nodeMap = new Map<string, ServiceNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // Identify nodes in the cascade path
  const cascadeImpactMap = new Map<string, any>();
  if (activeChaos?.cascade_result?.impacted_services) {
    activeChaos.cascade_result.impacted_services.forEach((imp) => {
      cascadeImpactMap.set(imp.service_id, imp);
    });
  }

  // Filter nodes if blast-radius mode
  const visibleNodes = filterMode === "blast-radius" && activeChaos
    ? nodes.filter((n) => cascadeImpactMap.has(n.id))
    : nodes;

  return (
    <div className="relative w-full h-[640px] rounded-2xl border border-slate-800/80 bg-[#070b14]/90 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-grid-cyber pointer-events-none opacity-60" />
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
      <div className="scanline-overlay" />

      {/* Top Map Header & Controls */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-800/70 bg-[#080d19]/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Interactive Service Dependency Mesh
          </span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-950/70 text-cyan-300 font-mono border border-cyan-800/50">
            Directed Acyclic Graph (NetworkX)
          </span>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800 font-medium">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterMode === "all"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Full Mesh (8 Nodes)
            </button>
            <button
              onClick={() => setFilterMode("blast-radius")}
              disabled={!activeChaos}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                filterMode === "blast-radius"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : activeChaos
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 cursor-not-allowed"
              }`}
            >
              {activeChaos && <Flame className="w-3 h-3 text-red-400" />}
              <span>Blast Radius Only</span>
            </button>
          </div>

          <button
            onClick={() => setShowParticles(!showParticles)}
            className={`px-2.5 py-1 rounded-lg border text-xs transition-colors font-medium flex items-center gap-1.5 ${
              showParticles
                ? "bg-slate-900/80 border-cyan-500/40 text-cyan-300"
                : "bg-slate-900/40 border-slate-800 text-slate-500"
            }`}
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Traffic Particles: {showParticles ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas for Edges & Particle Flows */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 1000 520"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Arrow Marker for Healthy Edges */}
            <marker
              id="arrow-healthy"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" fillOpacity="0.8" />
            </marker>

            {/* Arrow Marker for Failing Cascade Edges */}
            <marker
              id="arrow-critical"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0.5 L 10 5 L 0 9.5 z" fill="#ef4444" />
            </marker>

            {/* Linear Gradient for Failing Beams */}
            <linearGradient id="edge-crit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Render All Dependency Edges */}
          {edges.map((edge, idx) => {
            const src = nodeMap.get(edge.source);
            const tgt = nodeMap.get(edge.target);
            if (!src || !tgt) return null;

            // Offset to card centers (card is approx 200px wide, 80px tall)
            const sx = src.x;
            const sy = src.y + 35;
            const tx = tgt.x;
            const ty = tgt.y + 35;

            // Curvature control point
            const dx = tx - sx;
            const dy = ty - sy;
            const cx1 = sx + dx * 0.3;
            const cy1 = sy + dy * 0.1;
            const cx2 = sx + dx * 0.7;
            const cy2 = ty - dy * 0.1;

            const pathData = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;

            // Check if this edge is in the active cascade path
            const isFailing =
              (src.status === "critical" || tgt.status === "critical") ||
              (cascadeImpactMap.has(src.id) && cascadeImpactMap.has(tgt.id));

            return (
              <g key={`edge-${idx}`}>
                {/* Background path shadow / glow */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isFailing ? "rgba(239, 68, 68, 0.45)" : "rgba(56, 189, 248, 0.12)"}
                  strokeWidth={isFailing ? 4 : 2}
                  strokeLinecap="round"
                />

                {/* Main animated wire */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isFailing ? "url(#edge-crit-gradient)" : "rgba(56, 189, 248, 0.6)"}
                  strokeWidth={isFailing ? 2.5 : 1.5}
                  markerEnd={isFailing ? "url(#arrow-critical)" : "url(#arrow-healthy)"}
                  className={isFailing ? "edge-flow-failing" : "edge-flow-healthy"}
                />

                {/* Animated Flow Particles */}
                {showParticles && (
                  <circle r={isFailing ? 3.5 : 2.5} fill={isFailing ? "#ff2a55" : "#38bdf8"}>
                    <animateMotion
                      path={pathData}
                      dur={isFailing ? "1.1s" : "2.4s"}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Interactive Microservice Node Cards */}
        <div className="absolute inset-0 pointer-events-auto z-20">
          {visibleNodes.map((node) => {
            const isSelected = selectedServiceId === node.id;
            const isTarget = activeChaos?.target_service_id === node.id;
            const cascadeInfo = cascadeImpactMap.get(node.id);
            const isFailing = node.status === "critical";
            const isWarning = node.status === "warning";

            // Card position scaling to SVG coordinate space
            const leftPct = (node.x / 1000) * 100;
            const topPct = (node.y / 520) * 100;

            return (
              <div
                key={node.id}
                onClick={() => onSelectService(node.id)}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className={`absolute w-56 cursor-pointer select-none rounded-xl p-3 transition-all duration-300 ${
                  isTarget
                    ? "glass-panel-critical glow-crimson ring-2 ring-red-500 scale-105 z-30"
                    : isFailing
                    ? "glass-panel-critical border-red-500/60 shadow-lg shadow-red-950/60 scale-102 z-25"
                    : isWarning
                    ? "glass-panel-warning border-amber-500/50 shadow-lg shadow-amber-950/40 z-20"
                    : isSelected
                    ? "glass-panel border-cyan-400 glow-cyan ring-1 ring-cyan-400/80 scale-102 z-20"
                    : "glass-panel hover:border-cyan-500/50 hover:shadow-cyan-900/30 hover:scale-[1.01] z-10"
                }`}
              >
                {/* Cascade Stage Flag (T+0s, T+3s, T+7s) */}
                {cascadeInfo && (
                  <div className={`absolute -top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider shadow-md ${
                    cascadeInfo.stage.includes("T+0s")
                      ? "bg-red-600 text-white animate-bounce"
                      : "bg-amber-600 text-amber-100"
                  }`}>
                    {cascadeInfo.stage.split(" ")[0]} • {cascadeInfo.cascade_probability}% RISK
                  </div>
                )}

                {/* Card Top: Icon, Name & Status Dot */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60">
                      {SERVICE_ICONS[node.id] || <Cpu className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 tracking-wide leading-tight">
                        {node.name.split(" ")[0]}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">
                        {node.tier}
                      </span>
                    </div>
                  </div>

                  {/* Pulsing Status Orb */}
                  <div className="flex items-center">
                    <span className="relative flex h-3 w-3">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          isFailing ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-3 w-3 ${
                          isFailing ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-400"
                        }`}
                      />
                    </span>
                  </div>
                </div>

                {/* Metrics Mini-Grid */}
                <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 block">LATENCY</span>
                    <span
                      className={`font-semibold ${
                        node.latency_ms > 100
                          ? "text-red-400 font-bold"
                          : node.latency_ms > 40
                          ? "text-amber-300"
                          : "text-slate-200"
                      }`}
                    >
                      {node.latency_ms > 1000
                        ? `${(node.latency_ms / 1000).toFixed(1)}s`
                        : `${Math.round(node.latency_ms)}ms`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 block">ERROR</span>
                    <span
                      className={`font-semibold ${
                        node.error_rate > 10
                          ? "text-red-400 font-bold"
                          : node.error_rate > 1
                          ? "text-amber-300"
                          : "text-slate-200"
                      }`}
                    >
                      {node.error_rate.toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 block">HEALTH</span>
                    <span
                      className={`font-semibold ${
                        node.health_score < 50
                          ? "text-red-400 font-bold"
                          : node.health_score < 85
                          ? "text-amber-300"
                          : "text-emerald-400"
                      }`}
                    >
                      {Math.round(node.health_score)}%
                    </span>
                  </div>
                </div>

                {/* ML Anomaly Flag */}
                {node.ml_anomaly?.is_anomaly && (
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono bg-red-950/60 border border-red-500/40 rounded px-1.5 py-0.5 text-red-300">
                    <span className="flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3 text-red-400" />
                      <span>ML Anomaly</span>
                    </span>
                    <span className="font-bold">{node.ml_anomaly.anomaly_confidence}%</span>
                  </div>
                )}

                {/* Quick Chaos Button on Hover/Select */}
                {isSelected && !isFailing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInjectChaos(node.id);
                    }}
                    className="mt-2 w-full text-[11px] font-bold py-1 px-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-300 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Flame className="w-3 h-3 text-red-400" />
                    <span>Simulate Chaos Here</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="relative z-20 px-5 py-2.5 border-t border-slate-800/80 bg-[#070b16]/90 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span>Normal (&lt;50ms)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            <span>Elevated Backpressure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-pulse" />
            <span>Cascading Collapse (Blast Path)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
          <span>Click any microservice node to inspect live telemetry</span>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
        </div>
      </div>
    </div>
  );
};
