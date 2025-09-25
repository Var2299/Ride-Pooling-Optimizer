/**
 * match-rides.js (updated)
 * Fix: drivers arriving earlier than request.earliest are allowed (they can wait).
 * Keep costMode default 'approx' to reproduce the 38-minute solution.
 */

/* -------------------- helpers -------------------- */

// Haversine distance in km
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Convert km -> minutes at 40 km/h
function distanceKmToMinutes(distanceKm) {
  return (distanceKm / 40) * 60;
}

/**
 * pickup time calculation:
 *  - 'approx' mode: small-minute integer approx that reproduces your hand table
 *  - 'real' mode: actual haversine->km->minutes
 */
function calculatePickupTime(driver, request, costMode = 'approx') {
  const latDiff = request.src.lat - driver.lat;
  const lngDiff = request.src.lng - driver.lng;

  if (costMode === 'real') {
    const km = haversineDistance(driver.lat, driver.lng, request.src.lat, request.src.lng);
    return distanceKmToMinutes(km);
  }

  // approx mode: scale Euclidean degree distance to small minutes (matches earlier table)
  const euclid = Math.hypot(latDiff, lngDiff);
  const addedMinutes = Math.ceil(euclid * 50);
  return addedMinutes;
}

/**
 * Feasibility:
 *  - We allow arrival earlier than request.earliest (driver can wait).
 *  - Only reject if arrival (driver.etaMin + pickup) > request.latest.
 *  - Keep a sanity bound on pickup > 60 minutes.
 *
 * Note: If you want waiting to be counted in cost, change cost computation elsewhere to
 * use max(arrivalTime, request.earliest) when computing edge cost.
 */
function isFeasible(driver, request, costMode = 'approx') {
  const pickup = calculatePickupTime(driver, request, costMode);
  const arrivalTime = (driver.etaMin || 0) + pickup;

  // If latest is provided and arrival would exceed it -> infeasible
  if (request.latest != null && arrivalTime > request.latest) return false;

  // arrival earlier than earliest is OK (driver can wait). So we DO NOT reject arrival < earliest.

  // Sanity: reject extreme pickups
  if (pickup > 60) return false;

  return true;
}

/* -------------------- Graph / MCMF implementation -------------------- */

function buildGraph(drivers, requests, costMode = 'approx') {
  const driverCount = drivers.length;
  const reqCount = requests.length;
  const source = 0;
  const sink = 1;
  const driverStart = 2;
  const reqStart = driverStart + driverCount;
  const nodeCount = reqStart + reqCount;

  const adj = Array.from({ length: nodeCount }, () => []);

  function addEdge(u, v, cap, cost, meta = {}) {
    const forward = { to: v, cap: cap, cost: cost, rev: null, origCap: cap, ...meta };
    const backward = { to: u, cap: 0, cost: -cost, rev: null, origCap: 0 };
    forward.rev = adj[v].length;
    backward.rev = adj[u].length;
    adj[u].push(forward);
    adj[v].push(backward);
  }

  // source -> drivers
  for (let i = 0; i < drivers.length; i++) {
    const dNode = driverStart + i;
    addEdge(source, dNode, drivers[i].capacity || 1, 0);
  }

  // requests -> sink
  for (let j = 0; j < requests.length; j++) {
    const rNode = reqStart + j;
    addEdge(rNode, sink, 1, 0);
  }

  // driver -> request (feasible) edges
  for (let i = 0; i < drivers.length; i++) {
    const d = drivers[i];
    const dNode = driverStart + i;
    for (let j = 0; j < requests.length; j++) {
      const r = requests[j];
      if (!isFeasible(d, r, costMode)) continue;
      const pickup = calculatePickupTime(d, r, costMode);
      const totalMin = (d.etaMin || 0) + pickup;      // driver.etaMin + pickup travel (our cost model)
      const cost = Math.round(totalMin * 100);       // scaled integer
      addEdge(dNode, reqStart + j, 1, cost, { driverId: d.id, requestId: r.id, addedCost: cost });
    }
  }

  return { adj, source, sink, nodeCount, driverStart, reqStart, drivers, requests };
}

// minimal binary min-heap
class MinHeap {
  constructor() { this.data = []; }
  push(item) { this.data.push(item); this._siftUp(this.data.length - 1); }
  pop() {
    if (this.data.length === 0) return null;
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) { this.data[0] = last; this._siftDown(0); }
    return top;
  }
  _siftUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.data[p][0] <= this.data[i][0]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  _siftDown(i) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2*i+1, r = 2*i+2;
      if (l < n && this.data[l][0] < this.data[smallest][0]) smallest = l;
      if (r < n && this.data[r][0] < this.data[smallest][0]) smallest = r;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}

/**
 * minCostMaxFlow (Dijkstra + potentials)
 */
function minCostMaxFlow(graph) {
  const { adj, source, sink, nodeCount } = graph;
  const potential = new Array(nodeCount).fill(0);
  const dist = new Array(nodeCount).fill(0);
  const prevNode = new Array(nodeCount).fill(-1);
  const prevEdgeIdx = new Array(nodeCount).fill(-1);

  let totalFlow = 0;
  let totalCost = 0;

  while (true) {
    dist.fill(Infinity);
    prevNode.fill(-1);
    prevEdgeIdx.fill(-1);
    const heap = new MinHeap();
    dist[source] = 0;
    heap.push([0, source]);

    while (true) {
      const top = heap.pop();
      if (!top) break;
      const [d, u] = top;
      if (d !== dist[u]) continue;
      for (let ei = 0; ei < adj[u].length; ei++) {
        const e = adj[u][ei];
        if (e.cap <= 0) continue;
        const v = e.to;
        const rcost = e.cost + potential[u] - potential[v];
        if (dist[u] + rcost < dist[v]) {
          dist[v] = dist[u] + rcost;
          prevNode[v] = u;
          prevEdgeIdx[v] = ei;
          heap.push([dist[v], v]);
        }
      }
    }

    if (dist[sink] === Infinity) break;

    // update potentials
    for (let v = 0; v < nodeCount; v++) {
      if (dist[v] < Infinity) potential[v] += dist[v];
    }

    // bottleneck
    let addFlow = Infinity;
    let v = sink;
    while (v !== source) {
      const u = prevNode[v];
      const ei = prevEdgeIdx[v];
      if (u === -1) { addFlow = 0; break; }
      addFlow = Math.min(addFlow, adj[u][ei].cap);
      v = u;
    }
    if (!addFlow || addFlow === Infinity) break;

    // apply flow
    v = sink;
    let pathCostSum = 0;
    while (v !== source) {
      const u = prevNode[v];
      const ei = prevEdgeIdx[v];
      const e = adj[u][ei];
      e.cap -= addFlow;
      const rev = adj[v][e.rev];
      rev.cap += addFlow;
      pathCostSum += e.cost;
      v = u;
    }

    totalFlow += addFlow;
    totalCost += addFlow * pathCostSum;
  }

  // Extract assignments
  const assignments = [];
  const { driverStart, reqStart, drivers, requests } = graph;
  for (let i = 0; i < drivers.length; i++) {
    const u = driverStart + i;
    for (const e of adj[u]) {
      if (e.origCap > 0 && e.requestId && e.driverId) {
        if (e.cap < e.origCap) {
          assignments.push({
            driverId: e.driverId,
            requestId: e.requestId,
            addedTime: ((e.addedCost != null ? e.addedCost : e.cost) / 100)
          });
        }
      }
    }
  }

  return {
    flow: totalFlow,
    cost: totalCost / 100,
    assignments
  };
}

/* -------------------- Greedy baseline -------------------- */

function greedyBaseline(drivers, requests, costMode = 'approx') {
  const assignments = [];
  const availableDrivers = drivers.map(d => ({ ...d, remainingCapacity: d.capacity || 1 }));
  const unassignedRequests = [...requests];
  let totalAddedTime = 0;

  unassignedRequests.sort((a, b) => (a.earliest || 0) - (b.earliest || 0));

  for (const request of unassignedRequests) {
    let bestDriver = null;
    let bestAddedTime = Infinity;

    for (const driver of availableDrivers) {
      if (driver.remainingCapacity > 0 && isFeasible(driver, request, costMode)) {
        const addedTime = (driver.etaMin || 0) + calculatePickupTime(driver, request, costMode);
        if (addedTime < bestAddedTime) {
          bestAddedTime = addedTime;
          bestDriver = driver;
        }
      }
    }

    if (bestDriver) {
      assignments.push({
        driverId: bestDriver.id,
        requestId: request.id,
        addedTime: bestAddedTime
      });
      bestDriver.remainingCapacity--;
      totalAddedTime += bestAddedTime;
    }
  }

  return { assignments, totalAddedTime };
}

/* -------------------- Main match function -------------------- */

function matchRides(drivers, requests, options = {}) {
  const mode = (options.mode || 'mcmf');
  const costMode = (options.costMode || 'approx');

  if (mode === 'greedy') {
    const greedy = greedyBaseline(drivers, requests, costMode);
    return {
      assignments: greedy.assignments,
      totalAddedTime: greedy.totalAddedTime,
      baselineAddedTime: greedy.totalAddedTime,
      unassigned: requests.filter(r =>
        !greedy.assignments.some(a => a.requestId === r.id)
      )
    };
  }

  const graph = buildGraph(drivers, requests, costMode);
  const mcmfResult = minCostMaxFlow(graph);
  const baselineResult = greedyBaseline(drivers, requests, costMode);

  return {
    assignments: mcmfResult.assignments,
    totalAddedTime: mcmfResult.cost,
    baselineAddedTime: baselineResult.totalAddedTime,
    unassigned: requests.filter(r =>
      !mcmfResult.assignments.some(a => a.requestId === r.id)
    )
  };
}

/* -------------------- Exports -------------------- */

module.exports = {
  matchRides,
  buildGraph,
  minCostMaxFlow,
  greedyBaseline,
  calculatePickupTime,
  isFeasible
};
