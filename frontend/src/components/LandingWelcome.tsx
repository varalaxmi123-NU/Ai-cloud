"use client";

import React from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  Cpu,
  Layers,
  Terminal,
  Zap
} from "lucide-react";

interface LandingWelcomeProps {
  onGetStarted: () => void;
}

export const LandingWelcome: React.FC<LandingWelcomeProps> = ({ onGetStarted }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#0b0f19] text-white flex flex-col justify-between overflow-hidden selection:bg-cyan-500/30">
      {/* Background Ambient Lighting & Cyber Mesh */}
      <div className="absolute inset-0 bg-ambient-mesh pointer-events-none" />
      <div className="absolute inset-0 bg-grid-cyber pointer-events-none opacity-40" />

      {/* Glowing Orb Blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cyan-500/15 via-indigo-500/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Minimal Top Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 text-white">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            CloudLog <span className="text-cyan-400">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGetStarted}
            className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700/60 transition-all cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Hero Showcase */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto py-12">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e293b]/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-8 shadow-md backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: "8s" }} />
          <span>Next-Generation Autonomous Observability Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
            CloudLog AI
          </span>
        </h1>

        {/* Single Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
          AI-driven microservice log intelligence. Detect anomalies in real time, predict cascading failures, and self-heal production systems before outages happen.
        </p>

        {/* Hero Call to Action Button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onGetStarted}
            className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-base tracking-wide shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.03] hover:shadow-cyan-500/40 cursor-pointer flex items-center gap-3"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Minimal Feature Highlights Bar */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl pt-8 border-t border-slate-800/80 text-left">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs mb-2">
              01
            </span>
            <h3 className="text-sm font-bold text-white">Live NLP Log Stream</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Search distributed logs in plain English with statistical anomaly detection.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs mb-2">
              02
            </span>
            <h3 className="text-sm font-bold text-white">Alert Correlation</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Reduce alert fatigue by 91% by clustering related cascading exceptions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs mb-2">
              03
            </span>
            <h3 className="text-sm font-bold text-white">Autonomous Healing</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              One-click SRE runbook remediation with instant canary rollback verification.
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 font-mono">
        <span>CloudLog AI • Enterprise Cloud Reliability Engineering</span>
      </footer>
    </div>
  );
};
