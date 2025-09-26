# Ride Pooling Optimizer

> **Advanced ride-sharing optimization service using Minimum Cost Maximum Flow (MCMF) algorithms to minimize total added travel/time.**

---

## 🚀 Features & Core Technology

* **Core Algorithm:** **Minimum Cost Maximum Flow (MCMF)** implemented with Dijkstra's algorithm and potentials for global optimum.
* **Optimization Goal:** Minimizes **total added time** for all assigned passengers while respecting driver **capacity** constraints.
* **Tech Stack:** Compact **Node.js/Express** backend (for the heavy lifting) and a clean **React/Vite** frontend with **TailwindCSS** (for visualization).
* **Comparison:** Includes a **Greedy Baseline** for performance comparison against the globally optimal MCMF solution.
* **Scalable Design:** In-memory microservice designed to handle core business logic (optimization) before integrating with a dedicated DB.

---

## 🛠 Quick Start & Run Steps

This project runs two services concurrently.

### 1. Install Dependencies
```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Or install separately
npm install --prefix backend
npm install --prefix frontend

# Start both backend (on :3001) and frontend (on :3000) concurrently
npm run dev

# Or run separately
npm run dev:backend  # Starts on :3001
npm run dev:frontend # Starts on :3000

cd backend
npm test

```

## 💡Quick Demo Script
Start Services: Run npm run dev.

Access Frontend: Open your browser to http://localhost:3000.

Generate Data: Click the "Generate random scenario" button.

Compute Match: Select MCMF mode and click "Compute Match."

Interpret Results: Observe the totalAddedTime for MCMF, confirm it is less than or equal to the baselineAddedTime (Greedy), and verify the driver capacity was respected in the assignment list.

