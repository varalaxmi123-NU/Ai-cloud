# ApexSRE: Autonomous Microservice Chaos & Cascade Predictor

> **The Pitch:** An AI-driven observability dashboard that predicts cascading service failures before they happen, visualizes service dependencies in real-time, and provides one-click automated self-healing scripts.

---

## 🏆 Presentation & Live Stage Pitch Walkthrough

### 1. The Opening Hook
> *"Judges, when one microservice crashes at 2 AM, it usually takes down the whole platform before engineers even wake up. Today, modern microservice architectures have dozens of hidden cyclic dependencies. Meet **ApexSRE** — the autonomous microservice chaos & cascade predictor."*

### 2. The 4-Step Killer Feature Demo
1. **Show Baseline Topology:** Point to the 8 connected microservices arranged in logical tiers (Edge Ingress, Core Identity, Business Payment, and Data Persistence) with live traffic particle flows and Scikit-learn anomaly scores at normal (2.4%).
2. **Inject Chaos:** Under the bottom Chaos Studio, select *Database Connection Pool Outage* and click **"⚡ INJECT CHAOS / KILL NODE"**. Watch the dependency graph turn glowing crimson and edge traffic transform into high-frequency warning pulses.
3. **Show NetworkX Cascade Propagation:** Show how NetworkX calculated the multi-hop failure propagation in 0.12 seconds:
   - **T+0s:** Database Connection Pool Exhaustion (Direct Outage, 99.8% risk)
   - **T+3s:** Payment & User Profile connection starvation (88.5% risk)
   - **T+7s:** Ingress API Gateway 504 Gateway Timeouts (94.2% risk)
   - **Blast Radius:** $13,700/min estimated revenue loss, 24,200 req/s affected.
4. **Trigger Autonomous Self-Healing:** In the AI Playbooks tab, click **"⚡ EXECUTE AUTONOMOUS SELF-HEALING"**. A live terminal execution modal streams Kubernetes and Istio failover commands, isolates the failing node, promotes the replica, displays confetti, and restores all 8 services to pristine green in 1.2s!

---

## 🛠️ Complete Tech Stack Architecture

### Frontend (`/frontend`)
- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Design System:** Deep charcoal/cyber dark mode, glassmorphism panels, glowing neon accents, and smooth micro-animations
- **Interactive Topology Canvas:** Dynamic SVG DAG with curved Bezier dependencies, flowing traffic particles, and live status rings
- **Telemetry Charts:** Real-time SVG sparkline time-series curves for latency, CPU, memory, and 5xx error spikes
- **UI Components & Icons:** Lucide React icons, Web Audio API sound alerts, and Canvas Confetti celebration

### Backend (`/backend`)
- **API Framework:** FastAPI (Python 3.14) + Uvicorn
- **AI & Anomaly Engine:** Scikit-learn `IsolationForest` ensemble model trained on multi-dimensional telemetry signatures
- **Network Simulation Engine:** NetworkX directed graph analysis for multi-hop failure propagation and bottleneck centrality
- **Data Schemas:** Pydantic v2 validation models

---

## 🚀 Quick Start Guide

### Option 1: Double-Click Launcher
Run `start.bat` in the project root to automatically launch both the backend and frontend.

### Option 2: Manual Terminal Execution

#### 1. Start the FastAPI Backend
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- API Documentation: `http://localhost:8000/docs`
- Topology Endpoint: `http://localhost:8000/api/topology`

#### 2. Start the Next.js Frontend
```bash
cd frontend
npm run dev -- -p 3000
```
- Dashboard URL: `http://localhost:3000`

---

## 📡 API Reference

- `GET /api/topology`: Returns all 8 microservices, dependency edges, live health scores, and centrality metrics.
- `POST /api/simulate-failure`: Accepts target service ID and scenario type; calculates NetworkX cascade paths, blast radius, and AI recovery playbooks.
- `POST /api/heal`: Accepts target service and playbook ID; executes simulated automated remediation runbooks and restores cluster health.
- `GET /api/telemetry/{service_id}`: Returns real-time CPU, memory, latency, and simulated raw container logs.
- `POST /api/reset`: Resets all nodes to clean green baseline.
