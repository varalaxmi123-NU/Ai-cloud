"use client";

import React from "react";

interface LogoProps {
  size?: number;
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export const EnterpriseLogo: React.FC<LogoProps> = ({
  size = 32,
  showText = true,
  showSubtitle = false,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Isometric Infrastructure Prism */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-b from-[#131d31] to-[#0c1322] p-1.5 border border-sky-500/25 shadow-sm shadow-sky-500/10 hover:border-sky-400/40 transition-colors"
        style={{ width: size + 6, height: size + 6 }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow"
        >
          <defs>
            {/* Top Plane: Electric Sky */}
            <linearGradient id="facet-top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Left Plane: Deep Sapphire */}
            <linearGradient id="facet-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>

            {/* Right Plane: Dark Indigo Carbon */}
            <linearGradient id="facet-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Isometric Cube Geometry */}
          <path
            d="M18 3L32 11L18 19L4 11Z"
            fill="url(#facet-top)"
            stroke="#38bdf8"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          <path
            d="M4 11L18 19V33L4 25Z"
            fill="url(#facet-left)"
            stroke="#1d4ed8"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          <path
            d="M18 19L32 11V25L18 33Z"
            fill="url(#facet-right)"
            stroke="#334155"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* Center Core Node */}
          <path
            d="M18 9L26 13.5L18 18L10 13.5Z"
            fill="#ffffff"
            fillOpacity="0.28"
          />
          <circle cx="18" cy="19" r="2.2" fill="#38bdf8" />
          <circle cx="18" cy="19" r="1" fill="#ffffff" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-extrabold text-white text-base sm:text-lg tracking-tight leading-none">
              Cloud<span className="text-sky-400">Log</span>
            </span>
            <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono font-bold tracking-wider text-sky-300 bg-sky-950/70 border border-sky-500/30 rounded-md">
              ENTERPRISE
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[9px] sm:text-[10px] text-slate-400 tracking-wider font-semibold uppercase mt-0.5">
              Observability &amp; Resilience
            </span>
          )}
        </div>
      )}
    </div>
  );
};
