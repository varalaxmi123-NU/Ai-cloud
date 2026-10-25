# CloudLog Enterprise — AI Cloud Log Analyzer & SRE Resilience Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Deployment: Vercel Ready](https://img.shields.io/badge/Deployment-Vercel%20Ready-white?style=flat&logo=vercel)](https://vercel.com)

A high-performance cloud observability and resilience engineering platform designed to ingest multi-format application logs, isolate critical anomalies, explain root causes with verified evidence, and reconstruct cascading failures across distributed microservices.

Built for Site Reliability Engineers (SREs), DevOps practitioners, and platform teams.

---

## Key Capabilities & Core Modules

### 1. Failure Chain Detective (Highlighted Standout Feature)
Traces how isolated warnings develop into system-wide outages across distributed microservices.
- **Chronological Causal Flow**: Visualizes multi-stage failure cascades step-by-step:
  $$\text{Database Latency Surge} \longrightarrow \text{Connection Pool Exhaustion} \longrightarrow \text{Payment API 504s} \longrightarrow \text{Checkout Service Outage}$$
- **Clickable Log Evidence Proof**: Click any event in the failure chain to immediately view and highlight the supporting raw log entry, timestamp, microservice name, and diagnostic explanation.
- **Calculated Evidence-Weighted Confidence**: Evaluates sequence match count and timestamp delta proximity to calculate an evidence-based confidence metric (e.g. 84% High Confidence), replacing arbitrary demonstration figures.
- **Actionable Remediation Runbooks**: Provides immediate, copyable `kubectl` and `psql` operational commands for quick incident mitigation.

---

### 2. 3-Section Observability Dashboard
Structured operational dashboard built for rapid incident triage:
- **Top Section — Vital System KPIs**:
  - Total logs analyzed, critical errors detected, active incidents, and affected microservices.
  - Transparent sample data banner so users never mistake demonstration telemetry for live production monitoring.
- **Middle Section — Charts & Service Topology**:
  - **Dynamic SVG Error Frequency Time-Series Chart**: Interactive time window selector (`15m`, `1h`, `6h`, `24h`) dynamically updating coordinates, request volumes, and p99 latency spikes.
  - **Error Severity Breakdown**: Real-time distribution across `CRITICAL`, `ERROR`, `WARN`, and `INFO`.
  - **6-Microservice Health Grid**: Live status cards for `api-gateway`, `auth-service`, `payment-gateway`, `inventory-service`, `database-service`, and `notification-service`.
- **Bottom Section — Detailed Investigation & Log Table**:
  - Searchable log table with real-time text query and severity filters.
  - Incident timeline tracker and root-cause diagnostic summary panel.

---

### 3. Universal AI Log Analyzer
- **Multi-Format Ingestion**: Upload custom `.log`, `.txt`, `.json`, or `.csv` files or paste raw log text.
- **Automated Extraction**:
  - Identifies **Critical Errors**, **Warnings**, and **Info events**.
  - Derives probable **Root Causes** with verified log proof.
  - Suggests targeted **Remediation Steps** based on detected error patterns.
- **Built-in Incident Scenarios**: 1-click presets for Database Connection Pool Outages, Redis Cache Exhaustion, Kubernetes OOM Kills, and JWT Auth Storms.

---

### 4. AI Incident Investigator
- **Deep Root-Cause Synthesis**: Combines contextual LLM analysis with deterministic SRE pattern-matching rules.
- **Evidence Verification**: Correlates stack traces and error codes across dependent microservices to eliminate false positives.
- **Diagnostic Runbooks**: Generates copyable shell commands and troubleshooting checklists.

---

### 5. Failure Replay Engine
- **Interactive Outage Scrubber**: Step forward and backward through an outage timeline (`T+0s`, `T+5s`, `T+12s`, `T+25s`).
- **Cascade Progression**: Visualizes how an initial fault propagates across microservice boundaries until circuit breakers activate or fail.

---

### 6. Incident Management & SLA Tracking
- **Lifecycle Tracking**: Transition incidents between `OPEN`, `INVESTIGATING`, and `RESOLVED`.
- **Priority Matrix (P1 to P4)**: Algorithmic priority calculation based on blast radius, error velocity, and tier criticality.

---

### 7. Deployment Regression Comparison
- **Release-over-Release Comparison**: Compares error rates and latency between stable releases and new canary deployments (e.g. `v2.4.1` vs `v2.4.2`).
- **Signature Detection**: Automatically flags newly introduced error signatures and provides safe rollback recommendations.

---

### 8. Microservice Dependency Topology
- **Interactive Dependency DAG**: 8-node microservice mesh.
- **Chaos Injection Simulator**: Simulate connection saturation, network latency, and service timeouts to validate self-healing playbooks.

---

## Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & UI** | Tailwind CSS 4, Custom High-Contrast Glassmorphism, CSS Variables |
| **Icons & Visuals** | Lucide React (strictly SVG icons, no unicode emojis) |
| **Log Parsing Engine** | Universal Regex & JSON Client-Side Stream Parser (`src/lib/logParser.ts`) |
| **Backend & APIs** | Next.js Serverless Route Handlers (`/api/*`) + Optional FastAPI SRE Engine |
| **Deployment Target** | Vercel (Edge & Serverless), Docker compatible |

---

## Deployment to Vercel

This repository is pre-configured with `vercel.json` and standalone Next.js serverless route handlers.

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push or import your repository to your **GitHub** account.
2. Go to [https://vercel.com/new](https://vercel.com/new).
3. Under **Import Git Repository**, select your repository.
4. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: Select `frontend` (or leave as root if using the root `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Click **Deploy**. Vercel will build and deploy the application in under 2 minutes.

### Option 2: Deploy via Vercel CLI

```bash
cd frontend
npx vercel
```

---

## Local Development Setup

### Prerequisites
- Node.js 18.17+ or 20+
- npm, yarn, or pnpm

### Quick Start

```bash
# 1. Clone repository
git clone <your-repository-url>
cd <repository-folder>

# 2. Navigate to frontend
cd frontend

# 3. Install dependencies
npm install

# 4. Start Next.js development server
npm run dev -- -p 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials

To access the SRE Command Center from the landing page:
- **Email**: `company@gmail.com`
- **Password**: `1234`
*(An auto-fill button is provided on the sign-in screen for quick evaluation).*

---

## Project Structure

```
.
├── backend/                  # Optional Python FastAPI resilience engine
│   ├── main.py               # API endpoints & NetworkX topology model
│   └── requirements.txt
├── frontend/                 # Next.js 16 Web Application
│   ├── src/
│   │   ├── app/              # App router pages, layout, and globals.css
│   │   ├── components/       # Core UI modules:
│   │   │   ├── FailureChainDetective.tsx    # Causal failure chain & evidence
│   │   │   ├── OverviewDashboard.tsx        # 3-section observability dashboard
│   │   │   ├── LogStreamViewer.tsx          # Real log file uploader & analyzer
│   │   │   ├── AIIncidentInvestigator.tsx   # Root-cause analysis engine
│   │   │   ├── FailureReplayEngine.tsx      # Outage cascade timeline player
│   │   │   ├── IncidentManagerView.tsx      # Incident tracker & lifecycle
│   │   │   ├── DeploymentRegressionView.tsx # Canary comparison & rollback
│   │   │   ├── TopologyGraph.tsx            # Microservice DAG visualization
│   │   │   ├── LandingWelcome.tsx           # Enterprise landing overview
│   │   │   ├── SignInPage.tsx               # Centered authentication portal
│   │   │   └── Navbar.tsx                   # Responsive, compact navigation
│   │   ├── lib/              # Log parsing, synthetic telemetry & chaos engines
│   │   └── types/            # TypeScript interfaces for logs & topology
│   ├── next.config.ts        # Next.js production configuration
│   └── package.json
├── start.bat                 # 1-click Windows development launcher
├── vercel.json               # Vercel deployment configuration
└── README.md
```

---

## License

MIT License. Open-source Cloud Observability & Reliability Engineering System.
