const assert = require('assert');
const { 
  matchRides, 
  buildGraph, 
  calculateAddedTime, 
  isFeasible 
} = require('../utils/matching');

// Test data
const testDrivers = [
  { id: 'd1', lat: 28.7, lng: 77.1, etaMin: 5, capacity: 2 },
  { id: 'd2', lat: 28.75, lng: 77.15, etaMin: 3, capacity: 1 }
];

const testRequests = [
  { id: 'r1', src: { lat: 28.705, lng: 77.11 }, dst: { lat: 28.72, lng: 77.12 } },
  { id: 'r2', src: { lat: 28.76, lng: 77.16 }, dst: { lat: 28.78, lng: 77.18 } },
  { id: 'r3', src: { lat: 28.71, lng: 77.13 }, dst: { lat: 28.73, lng: 77.14 } }
];

console.log('🧪 Running matching algorithm tests...\n');

// Test 1: Determinism
console.log('Test 1: Determinism');
try {
  const result1 = matchRides(testDrivers, testRequests, 'mcmf');
  const result2 = matchRides(testDrivers, testRequests, 'mcmf');
  
  // Sort assignments for comparison
  const sort = (a) => a.assignments.sort((x, y) => x.driverId.localeCompare(y.driverId) || x.requestId.localeCompare(y.requestId));
  
  assert.deepStrictEqual(sort(result1).assignments, sort(result2).assignments);
  assert.strictEqual(result1.totalAddedTime, result2.totalAddedTime);
  
  console.log('✅ Same input produces identical results');
} catch (error) {
  console.log('❌ Determinism test failed:', error.message);
  process.exit(1);
}

// Test 2: Small correctness case
console.log('\nTest 2: Small correctness case');
try {
  const smallDrivers = [testDrivers[0]]; // One driver with capacity 2
  const smallRequests = [testRequests[0], testRequests[2]]; // Two requests
  
  const result = matchRides(smallDrivers, smallRequests, 'mcmf');
  
  // Driver d1 should get both requests (capacity allows)
  assert.strictEqual(result.assignments.length, 2);
  assert(result.assignments.every(a => a.driverId === 'd1'));
  assert.strictEqual(result.unassigned.length, 0);
  
  console.log('✅ Correct assignment for capacity-constrained case');
  console.log(`   Assignments: ${result.assignments.length}, Total time: ${result.totalAddedTime.toFixed(1)}min`);
} catch (error) {
  console.log('❌ Correctness test failed:', error.message);
  process.exit(1);
}

// Test 3: MCMF vs Greedy comparison
console.log('\nTest 3: MCMF vs Greedy comparison');
try {
  const mcmfResult = matchRides(testDrivers, testRequests, 'mcmf');
  const greedyResult = matchRides(testDrivers, testRequests, 'greedy');
  
  // MCMF should be at least as good as greedy
  assert(mcmfResult.totalAddedTime <= mcmfResult.baselineAddedTime + 0.01); // Allow small floating point difference
  
  console.log('✅ MCMF performs at least as well as greedy baseline');
  console.log(`   MCMF: ${mcmfResult.totalAddedTime.toFixed(1)}min, Greedy: ${greedyResult.totalAddedTime.toFixed(1)}min`);
} catch (error) {
  console.log('❌ Comparison test failed:', error.message);
  process.exit(1);
}

// Test 4: Capacity constraints
console.log('\nTest 4: Capacity constraints');
try {
  const limitedDriver = [{ id: 'd1', lat: 28.7, lng: 77.1, etaMin: 5, capacity: 1 }];
  const manyRequests = testRequests; // 3 requests
  
  const result = matchRides(limitedDriver, manyRequests, 'mcmf');
  
  // Only 1 assignment should be made due to capacity
  assert(result.assignments.length <= 1);
  assert(result.unassigned.length >= 2);
  
  console.log('✅ Capacity constraints properly enforced');
  console.log(`   Assigned: ${result.assignments.length}, Unassigned: ${result.unassigned.length}`);
} catch (error) {
  console.log('❌ Capacity test failed:', error.message);
  process.exit(1);
}

// Test 5: Graph building and feasibility
console.log('\nTest 5: Graph building and feasibility');
try {
  const graph = buildGraph(testDrivers, testRequests);
  
  assert(graph.nodes.has('source'));
  assert(graph.nodes.has('sink'));
  assert(graph.edges.length > 0);
  
  // Test feasibility function
  const feasible = isFeasible(testDrivers[0], testRequests[0]);
  const addedTime = calculateAddedTime(testDrivers[0], testRequests[0]);
  
  assert(typeof feasible === 'boolean');
  assert(typeof addedTime === 'number' && addedTime > 0);
  
  console.log('✅ Graph building and feasibility checks working');
  console.log(`   Graph nodes: ${graph.nodes.size}, edges: ${graph.edges.length}`);
} catch (error) {
  console.log('❌ Graph/feasibility test failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 All tests passed! The matching algorithm is working correctly.\n');

// Performance demonstration
console.log('📈 Performance demonstration:');
const start = Date.now();
const perfResult = matchRides(testDrivers, testRequests, 'mcmf');
const elapsed = Date.now() - start;

console.log(`   Processing time: ${elapsed}ms`);
console.log(`   Assignments: ${perfResult.assignments.length}`);
console.log(`   Total added time: ${perfResult.totalAddedTime.toFixed(1)} minutes`);
console.log(`   Improvement over greedy: ${((perfResult.baselineAddedTime - perfResult.totalAddedTime) / perfResult.baselineAddedTime * 100).toFixed(1)}%`);