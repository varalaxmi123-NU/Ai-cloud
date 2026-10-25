# ApexSRE: Autonomous Microservice Chaos & Cascade Predictor

An AI-driven observability and resilience engineering platform that models microservice dependency graphs, predicts multi-hop cascading service failures before they manifest, detects anomalies using machine learning, and executes automated self-healing playbooks.

---

## 📌 Overview

In modern distributed microservice architectures, an isolated failure in a single downstream dependency (such as database connection exhaustion or cache evictions) often triggers catastrophic cascade outages across callers. 

**ApexSRE** combines **directed graph theory (NetworkX)** and **unsupervised machine learning (Scikit-Learn IsolationForest)** with an interactive **Next.js Observability Command Center** to:
1. **Visualize Real-Time Dependencies:** Interactive topology map showing service call volumes, latency, error rates, and traffic flows.
2. **Simulate Chaos Scenarios:** Inject targeted failure signatures (thread pool saturation, cache-stampedes, database timeouts) into specific microservice nodes.
3. **Predict Cascading Failure Paths:** Pre-compute multi-hop degradation timelines (`T+0s`, `T+3s`, `T+7s`, `T+14s`), fleet blast radius percentages, and business impact.
4. **Execute Autonomous Remediation:** Execute automated SRE runbooks (read-replica promotion, Envoy circuit breakers, adaptive traffic shedding) with live terminal execution logging.

---

## 🏗️ System Architecture

### 1. Backend AI & Simulation Engine (`/backend`)
- **FastAPI (Python 3.14):** High-throughput asynchronous REST API providing real-time telemetry streaming and chaos orchestration.
- **NetworkX Graph Traversal:** Models 8 microservices as a directed acyclic graph (DAG). Uses reverse graph traversal and centrality metrics to compute downstream failure paths and probability scores.
- **Scikit-Learn IsolationForest:** Multi-dimensional anomaly detection evaluating latency, 5xx error distribution, CPU utilization, and memory pressure against baseline envelopes.
- **Pydantic v2:** Type-safe request and response schemas for all endpoints.

### 2. Frontend Observability Command Center (`/frontend`)
- **Next.js 16 (App Router) + TypeScript + Tailwind CSS:** Fast, responsive enterprise dark-mode UI with glassmorphism panels.
- **Interactive SVG Topology Mesh:** Renders node cards, health rings, and animated particle data flows along Bezier connector wires.
- **Telemetry Drawer:** Time-series SVG sparklines for latency, CPU/memory pressure, and 5xx error spikes alongside live container logs.
- **Chaos Console:** Scenario selector, cascade risk visualizer, and autonomous playbook executor.
- **Self-Healing Terminal Modal:** Step-by-step terminal execution log stream with remediation verification.

---

## 🌐 Microservice Fleet Model

The default environment models 8 critical enterprise microservices:

| Service | Tier | Technology | Criticality |
| :--- | :--- | :--- | :--- |
| **API Gateway** | Edge Ingress | Envoy / Go Proxy | Tier-0 (Catastrophic) |
| **Auth & Identity** | Core | Rust / Axum (OAuth2) | Tier-1 (High) |
| **User Profile Service** | Core | Node.js / Express | Tier-2 (Medium) |
| **Payment & Checkout Core** | Business | Java 21 / Spring Boot | Tier-0 (Catastrophic) |
| **Inventory & Stock Engine** | Business | Go 1.22 | Tier-2 (Medium) |
| **PostgreSQL Primary Cluster** | Persistence | PostgreSQL 16 HA Cluster | Tier-0 (Core Infrastructure) |
| **Redis Distributed Cache** | Persistence | Redis 7.2 Cluster | Tier-1 (High) |
| **Kafka & Notification Engine** | Async | Apache Kafka + Python Worker | Tier-3 (Low/Degradable) |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+ (FastAPI, NetworkX, Scikit-learn)
- Node.js 18+ and npm

### 1. Launch Using Script (Windows)
Double-click `start.bat` in the project root to start both backend and frontend automatically.

### 2. Manual Startup

#### Step A: Start the FastAPI Backend
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- API Health: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

#### Step B: Start the Next.js Frontend
```bash
cd frontend
npm run dev -- -p 3000
```
- Dashboard: `http://localhost:3000`

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/topology` | Returns current cluster status, all nodes, dependency edges, and graph centrality metrics. |
| `POST` | `/api/simulate-failure` | Accepts `service_id` and `scenario_type`; computes NetworkX cascade paths, blast radius, and AI recovery playbooks. |
| `POST` | `/api/heal` | Accepts `service_id` and `action_id`; executes automated remediation runbook steps and restores cluster health. |
| `GET` | `/api/telemetry/{service_id}` | Returns real-time time-series telemetry and simulated container log stream. |
| `POST` | `/api/reset` | Resets all cluster nodes to normal baseline operation. |
| `GET` | `/api/incidents` | Returns incident audit log and historical remediation records. |

---

## 🛡️ License

MIT License. Open-source site reliability engineering and microservices chaos prediction toolkit.
