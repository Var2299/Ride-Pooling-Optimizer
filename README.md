# Ride Pooling Optimizer

Advanced ride-sharing optimization service using Minimum Cost Maximum Flow (MCMF) algorithms to minimize total travel time while respecting driver capacities and passenger time windows.

## Quick Start

### Backend (Port 3001)
```bash
cd backend
npm install
npm start
```

### Frontend (Port 3000)  
```bash
cd frontend
npm install
npm start
```

### Full Setup
```bash
npm install  # Install concurrently
npm run install:all  # Install all dependencies
npm run dev  # Start both services
```

## API Example

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
```

**Expected Response:**
```json
{
  "assignments": [
    {"driverId":"d1","requestId":"r1","addedTime":4.2},
    {"driverId":"d2","requestId":"r2","addedTime":3.8}
  ],
  "totalAddedTime": 8.0,
  "baselineAddedTime": 9.1,
  "unassigned": [],
  "processingTimeMs": 12
}
```

## Demo Script

1. **Start services:** `npm run dev`
2. **Run tests:** `npm test`  
3. **Open frontend:** http://localhost:3000
4. **Try sample data:** Click "Generate Random Scenario" → "Compute Match"
5. **Check API health:** `curl http://localhost:3001/health`

## Interview Cheat Sheet

**Implementation:** MCMF with Dijkstra+potentials, bipartite graph (drivers→requests), capacity constraints  
**Complexity:** O(V²E) per flow unit; sub-second for 100s of drivers/requests in practice  
**Why MCMF:** Globally optimal vs greedy heuristics, handles complex multi-constraints naturally  
**Scale:** Current: in-memory demos. Production: Redis/PostgreSQL, microservices, spatial indexing  
**Algorithm:** Build flow network, feasibility filtering, min-cost max-flow with reduced costs  
**Edge cases:** Insufficient capacity, time windows, infeasible routes handled gracefully with partial assignments

## Architecture

- **Backend:** Node.js + Express, MCMF algorithm, in-memory state
- **Frontend:** React + Vite + TailwindCSS, real-time visualization  
- **Testing:** Unit tests for algorithm correctness and performance
- **API:** RESTful endpoints with JSON, health monitoring, error handling