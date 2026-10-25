"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { EnterpriseLogo } from "@/components/EnterpriseLogo";

interface LandingWelcomeProps {
  onGetStarted: () => void;
}

export const LandingWelcome: React.FC<LandingWelcomeProps> = ({ onGetStarted }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#080d19] text-white flex flex-col justify-between overflow-hidden selection:bg-sky-500/30">
      {/* Ambient Radial Lights */}
      <div className="absolute inset-0 bg-ambient-mesh pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-gradient-to-tr from-sky-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <EnterpriseLogo size={36} />

        <button
          onClick={onGetStarted}
          className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-[#111827] hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer shadow-sm"
        >
          Sign In
        </button>
      </header>

      {/* Hero: "Welcome to CloudLog" + "Get Started" (Minimalist, High Impact) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto py-16">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111827]/90 border border-slate-700/80 text-slate-200 text-xs font-semibold mb-8 shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span>Cloud Systems Observability &amp; Log Intelligence</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-tight">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">
            CloudLog
          </span>
        </h1>

        {/* Minimal Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-xl leading-relaxed font-normal">
          High-performance distributed log streaming, statistical anomaly surge detection, and autonomous incident diagnosis.
        </p>

        {/* "Get Started" Call to Action */}
        <div className="mt-10">
          <button
            onClick={onGetStarted}
            className="group relative px-9 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-base tracking-wide shadow-2xl shadow-sky-500/30 transition-all hover:scale-[1.03] hover:shadow-sky-500/50 cursor-pointer flex items-center gap-3"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </main>

      {/* Minimal Bottom Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
        <span>&copy; 2026 CloudLog Systems, Inc.</span>
        <span className="font-mono">v2.4 Enterprise Production</span>
      </footer>
    </div>
  );
};
