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
## 💻 API Usage: POST /match
The primary endpoint uses a JSON body to request assignments.

Example Request (curl)
```bash
curl -X POST http://localhost:3001/match \
  -H "Content-Type: application/json" \
  -d '{
    "drivers": [
      {"id":"d1","lat":28.7,"lng":77.1,"etaMin":5,"capacity":2},
      {"id":"d2","lat":28.75,"lng":77.15,"etaMin":3,"capacity":1}
    ],
    "requests": [
      {"id":"r1","src":{"lat":28.705,"lng":77.11},"dst":{"lat":28.72,"lng":77.12}},
      {"id":"r2","src":{"lat":28.76,"lng":77.16},"dst":{"lat":28.78,"lng":77.18}}
    ],
    "mode": "mcmf"
  }'

Expected Sample Response
```bash
{
  "assignments": [
    {"driverId":"d1","requestId":"r1","addedTime":4.2},
    {"driverId":"d2","requestId":"r2","addedTime":3.1}
  ],
  "totalAddedTime": 7.3,
  "baselineAddedTime": 9.5,
  "unassigned": [],
  "processingTimeMs": 18
}


## 💡Quick Demo Script
Start Services: Run npm run dev.

Access Frontend: Open your browser to http://localhost:3000.

Generate Data: Click the "Generate random scenario" button.

Compute Match: Select MCMF mode and click "Compute Match."

Interpret Results: Observe the totalAddedTime for MCMF, confirm it is less than or equal to the baselineAddedTime (Greedy), and verify the driver capacity was respected in the assignment list.

