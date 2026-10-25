"use client";

import React, { useState, useEffect, useRef } from "react";
import { LandingWelcome } from "@/components/LandingWelcome";
import { SignInPage } from "@/components/SignInPage";
import { Navbar } from "@/components/Navbar";
import { WelcomeHeader } from "@/components/WelcomeHeader";
import { LogStreamViewer } from "@/components/LogStreamViewer";
import { AIIncidentInvestigator } from "@/components/AIIncidentInvestigator";
import { FailureReplayEngine } from "@/components/FailureReplayEngine";
import { IncidentManagerView } from "@/components/IncidentManagerView";
import { AIRootCauseModal } from "@/components/AIRootCauseModal";
import { AlertCorrelationView } from "@/components/AlertCorrelationView";
import { DeploymentRegressionView } from "@/components/DeploymentRegressionView";
import { IncidentPriorityMatrix } from "@/components/IncidentPriorityMatrix";
import { TopologyMap } from "@/components/TopologyMap";
import { TelemetryDrawer } from "@/components/TelemetryDrawer";
import { ChaosConsole } from "@/components/ChaosConsole";
import { SelfHealingModal } from "@/components/SelfHealingModal";
import { OverviewDashboard } from "@/components/OverviewDashboard";
import { FailureChainDetective } from "@/components/FailureChainDetective";
import { fetchTopology, injectChaos, healService, resetCluster } from "@/lib/api";
import { TopologyResponse, CascadeResult, ServiceNode } from "@/types/sre";
import { CloudLog } from "@/types/logAnalyzer";

export default function CloudLogObservabilityApp() {
  // Navigation Flow: 'welcome' -> 'signin' -> 'dashboard'
  const [currentView, setCurrentView] = useState<"welcome" | "signin" | "dashboard">("welcome");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [topology, setTopology] = useState<TopologyResponse | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("database-service");
  const [cascadeResult, setCascadeResult] = useState<CascadeResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Default view starts on Welcome landing page as requested
  // Session storage tracks auth state for the current session
  useEffect(() => {
    // Keep initial view as 'welcome' so user experiences the clean landing flow
  }, []);

  const handleSignInSuccess = () => {
    try {
      sessionStorage.setItem("cloudlog_authenticated", "true");
    } catch {
      // ignore
    }
    setCurrentView("dashboard");
  };

  const handleSignOut = () => {
    try {
      sessionStorage.removeItem("cloudlog_authenticated");
    } catch {
      // ignore
    }
    setCurrentView("welcome");
  };

  // AI Root Cause Inspector state
  const [selectedErrorLog, setSelectedErrorLog] = useState<CloudLog | null>(null);

  // Self-Healing terminal modal state
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

  // Web Audio sound effects
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
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
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
    try {
      const data = await fetchTopology();
      setTopology(data);
      if (data.active_chaos?.cascade_result) {
        setCascadeResult(data.active_chaos.cascade_result);
      } else if (!data.active_chaos) {
        setCascadeResult(null);
      }
    } catch {
      // Offline fallback handling
    }
  };

  useEffect(() => {
    if (currentView !== "dashboard") return;
    refreshTopology();
    const interval = setInterval(refreshTopology, 3500);
    return () => clearInterval(interval);
  }, [currentView]);

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

  // VIEW 1: Minimalist Beautiful AI Welcome Landing
  if (currentView === "welcome") {
    return (
      <LandingWelcome
        onGetStarted={(targetTab) => {
          if (targetTab) setActiveTab(targetTab);
          setCurrentView("signin");
        }}
      />
    );
  }

  // VIEW 2: Enterprise Sign In Page
  if (currentView === "signin") {
    return (
      <SignInPage
        onSuccess={handleSignInSuccess}
        onBackToWelcome={() => setCurrentView("welcome")}
      />
    );
  }

  // VIEW 3: Full High-Contrast Main SRE Dashboard
  return (
    <div className="min-h-screen bg-[#0b0f19] bg-ambient-mesh text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Header Navbar */}
      <Navbar
        topology={topology}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onReset={handleReset}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        onSignOut={handleSignOut}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Tab 0: Overview Observability Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fadeIn">
            <OverviewDashboard
              topology={topology}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectService={(id) => setSelectedServiceId(id)}
              onInjectChaos={handleInjectChaos}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Tab 0.5: Failure Chain Detective (Evidence-Linked Root Cause Cascade) */}
        {activeTab === "detective" && (
          <div className="space-y-6 animate-fadeIn">
            <FailureChainDetective
              onOpenFailureReplay={() => setActiveTab("replay")}
              onOpenIncidentManager={() => setActiveTab("incidents")}
            />
          </div>
        )}

        {/* Executive KPI Stat Strip for specific feature tabs */}
        {activeTab !== "dashboard" && (
          <WelcomeHeader
            noiseReductionPct={91.2}
          />
        )}

        {/* Tab 1: Real-Time Log Monitoring, File Uploader & Statistical Anomaly Stream */}
        {activeTab === "logs" && (
          <div className="space-y-6 animate-fadeIn">
            <LogStreamViewer
              onSelectLogError={(log) => setSelectedErrorLog(log)}
              onOpenInvestigator={() => setActiveTab("investigator")}
            />
          </div>
        )}

        {/* Tab 2: AI Incident Investigator (Causal Reasoning & Evidence Timeline) */}
        {activeTab === "investigator" && (
          <div className="space-y-6 animate-fadeIn">
            <AIIncidentInvestigator
              onOpenFailureReplay={() => setActiveTab("replay")}
            />
          </div>
        )}

        {/* Tab 3: Failure Replay & Prevention Engine (Step-by-Step Timeline Player) */}
        {activeTab === "replay" && (
          <div className="space-y-6 animate-fadeIn">
            <FailureReplayEngine />
          </div>
        )}

        {/* Tab 4: Incident Management & Tracking System */}
        {activeTab === "incidents" && (
          <div className="space-y-6 animate-fadeIn">
            <IncidentManagerView
              onInvestigateIncident={() => setActiveTab("investigator")}
              onReplayIncident={() => setActiveTab("replay")}
            />
          </div>
        )}

        {/* Tab 5: Deployment Regression Detection & Canary Rollback */}
        {activeTab === "regression" && (
          <div className="space-y-6 animate-fadeIn">
            <DeploymentRegressionView />
          </div>
        )}

        {/* Microservice Topology Mesh & Chaos Predictor View */}
        {activeTab === "topology" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Panel: Interactive Dependency Canvas (7 cols) */}
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

            {/* Bottom Panel: Chaos Injection & Autonomous Runbooks */}
            <div className="w-full">
              <ChaosConsole
                onInjectChaos={handleInjectChaos}
                onExecuteHeal={handleExecuteHeal}
                cascadeResult={cascadeResult}
                loading={loading}
              />
            </div>
          </div>
        )}
      </main>

      {/* Feature 2: AI Root Cause Assistant Modal */}
      <AIRootCauseModal
        log={selectedErrorLog}
        onClose={() => setSelectedErrorLog(null)}
      />

      {/* Autonomous Self-Healing Terminal Modal */}
      <SelfHealingModal
        isOpen={healModalData.isOpen}
        onClose={() => setHealModalData({ ...healModalData, isOpen: false })}
        serviceId={healModalData.serviceId}
        actionId={healModalData.actionId}
        terminalLogs={healModalData.terminalLogs}
        executionTimeMs={healModalData.executionTimeMs}
      />

      {/* Global Footer */}
      <footer className="border-t border-slate-800 bg-[#080d1a] py-4 px-6 text-center text-xs text-slate-400 font-mono flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-200 font-semibold">CloudLog Enterprise — Systems Observability</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Logged in as: <b className="text-cyan-300">company@gmail.com</b></span>
          <span>•</span>
          <button
            onClick={handleSignOut}
            className="hover:text-white underline cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </footer>
    </div>
  );
}
