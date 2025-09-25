# Ride Pooling Backend Service

A high-performance ride pooling optimization service using Minimum Cost Maximum Flow (MCMF) algorithms to minimize total travel time while respecting driver capacities and passenger constraints.

## Quick Start

```bash
npm install
npm start
```

Server runs on `http://localhost:3001`

## API Usage

### Match rides (main endpoint)
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
      {"id":"r2","src":{"lat":28.76,"lng":77.16},"dst":{"lat":28.78,"lng":77.18}},
      {"id":"r3","src":{"lat":28.71,"lng":77.13},"dst":{"lat":28.73,"lng":77.14}}
    ],
    "mode": "mcmf"
  }'
```

Expected response:
```json
{
  "assignments": [
    {"driverId":"d1","requestId":"r1","addedTime":4.2},
    {"driverId":"d1","requestId":"r3","addedTime":6.1},
    {"driverId":"d2","requestId":"r2","addedTime":3.8}
  ],
  "totalAddedTime": 14.1,
  "baselineAddedTime": 18.7,
  "unassigned": [],
  "processingTimeMs": 12
}
```

## Demo Script
```bash
# 1. Start server
npm start

# 2. Run tests
npm test

# 3. Test with sample data
curl -X POST http://localhost:3001/match \
  -H "Content-Type: application/json" \
  -d @sample_data.json

# 4. Check health
curl http://localhost:3001/health
```

## Interview Cheat Sheet

**What:** MCMF-based ride pooling with Dijkstra+potentials, capacity constraints, time windows  
**Complexity:** O(V²E) per flow unit, typically sub-second for 100s of drivers/requests  
**Why MCMF:** Globally optimal assignments vs greedy heuristics, handles complex constraints  
**Scale:** Current: in-memory for demos. Production: Redis/DB, microservices, spatial indexing  
**Algorithm:** Build bipartite graph (drivers→requests), min-cost max-flow with feasibility checks  
**Edge cases:** Insufficient capacity, infeasible assignments, time window violations handled gracefully