"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { TopologyMap } from "@/components/TopologyMap";
import { TelemetryDrawer } from "@/components/TelemetryDrawer";
import { ChaosConsole } from "@/components/ChaosConsole";
import { SelfHealingModal } from "@/components/SelfHealingModal";
import { PresentationGuide } from "@/components/PresentationGuide";
import { fetchTopology, injectChaos, healService, resetCluster } from "@/lib/api";
import { TopologyResponse, CascadeResult, ServiceNode } from "@/types/sre";

export default function SREDashboard() {
  const [topology, setTopology] = useState<TopologyResponse | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("database-service");
  const [cascadeResult, setCascadeResult] = useState<CascadeResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isPitchGuideOpen, setIsPitchGuideOpen] = useState<boolean>(false);
  const [healModalData, setHealModalData] = useState<{
    isOpen: boolean;
    serviceId: string;
    actionId: string;
    terminalLogs: string[];
    executionTimeMs: number;
  }>({
    isOpen: false,
    serviceId: "",
    actionId: "",
    terminalLogs: [],
    executionTimeMs: 1240,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play synthetic web audio sounds
  const playAlertSound = (type: "alarm" | "heal") => {
    if (!audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "alarm") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else {
        // High-tech victory chime
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {
      // Audio autoplay policy catch
    }
  };

  // Initial and periodic topology polling
  const refreshTopology = async () => {
    const data = await fetchTopology();
    setTopology(data);
    if (data.active_chaos?.cascade_result) {
      setCascadeResult(data.active_chaos.cascade_result);
    } else if (!data.active_chaos) {
      setCascadeResult(null);
    }
  };

  useEffect(() => {
    refreshTopology();
    const interval = setInterval(refreshTopology, 3500);
    return () => clearInterval(interval);
  }, []);

  // Handle Chaos Injection
  const handleInjectChaos = async (serviceId: string, scenario?: string) => {
    setLoading(true);
    setSelectedServiceId(serviceId);
    playAlertSound("alarm");
    try {
      const result = await injectChaos(
        serviceId,
        scenario || "database_connection_pool_exhaustion"
      );
      setCascadeResult(result);
      await refreshTopology();
    } finally {
      setLoading(false);
    }
  };

  // Handle Autonomous Healing Execution
  const handleExecuteHeal = async (serviceId: string, actionId: string) => {
    setLoading(true);
    try {
      const healRes = await healService(serviceId, actionId);
      playAlertSound("heal");
      setHealModalData({
        isOpen: true,
        serviceId,
        actionId,
        terminalLogs: healRes.terminal_logs || [],
        executionTimeMs: healRes.execution_time_ms || 1240,
      });
      setCascadeResult(null);
      await refreshTopology();
    } finally {
      setLoading(false);
    }
  };

  // Handle Baseline Reset
  const handleReset = async () => {
    await resetCluster();
    setCascadeResult(null);
    await refreshTopology();
  };

  const selectedNode: ServiceNode | undefined = topology?.nodes.find(
    (n) => n.id === selectedServiceId
  );

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Navigation Bar */}
      <Navbar
        topology={topology}
        onReset={handleReset}
        onOpenPresentationGuide={() => setIsPitchGuideOpen(true)}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
      />

      {/* Main Command Center Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Workspace: Left (Topology Map) + Right (Live Telemetry Drawer) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Interactive Service Dependency Topology Map (7 cols) */}
          <div className="lg:col-span-7 w-full">
            <TopologyMap
              nodes={topology?.nodes || []}
              edges={topology?.edges || []}
              selectedServiceId={selectedServiceId}
              onSelectService={(id) => setSelectedServiceId(id)}
              onInjectChaos={(id) => handleInjectChaos(id)}
              activeChaos={topology?.active_chaos || null}
            />
          </div>

          {/* Right Panel: Live Telemetry Drawer (5 cols) */}
          <div className="lg:col-span-5 w-full">
            <TelemetryDrawer selectedNode={selectedNode} />
          </div>
        </div>

        {/* Bottom Workspace: Chaos Injection, NetworkX Cascade Predictor & AI Playbooks */}
        <div className="w-full">
          <ChaosConsole
            onInjectChaos={handleInjectChaos}
            onExecuteHeal={handleExecuteHeal}
            cascadeResult={cascadeResult}
            loading={loading}
          />
        </div>
      </main>

      {/* Autonomous Self-Healing Terminal Modal */}
      <SelfHealingModal
        isOpen={healModalData.isOpen}
        onClose={() => setHealModalData({ ...healModalData, isOpen: false })}
        serviceId={healModalData.serviceId}
        actionId={healModalData.actionId}
        terminalLogs={healModalData.terminalLogs}
        executionTimeMs={healModalData.executionTimeMs}
      />

      {/* Competition Presentation Pitch Deck Modal */}
      <PresentationGuide
        isOpen={isPitchGuideOpen}
        onClose={() => setIsPitchGuideOpen(false)}
      />

      {/* Subtle Footer */}
      <footer className="border-t border-slate-900 bg-[#04060a] py-3 px-6 text-center text-xs text-slate-500 font-mono">
        <span>ApexSRE Autonomous Microservice Chaos & Cascade Predictor</span>
        <span className="mx-2">•</span>
        <span className="text-cyan-400">FastAPI + NetworkX + Scikit-Learn + Next.js</span>
      </footer>
    </div>
  );
}
