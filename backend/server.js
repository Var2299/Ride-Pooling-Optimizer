const express = require('express');
const cors = require('cors');
const { matchRides } = require('./utils/matching');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory storage
let drivers = [];
let requests = [];
let stats = { matchCount: 0, totalAssignments: 0 };

// Validation helpers
function validateDriver(driver) {
  return driver && 
    typeof driver.id === 'string' &&
    typeof driver.lat === 'number' &&
    typeof driver.lng === 'number' &&
    typeof driver.etaMin === 'number' &&
    typeof driver.capacity === 'number' &&
    driver.capacity > 0;
}

function validateRequest(request) {
  return request &&
    typeof request.id === 'string' &&
    request.src && 
    typeof request.src.lat === 'number' &&
    typeof request.src.lng === 'number' &&
    request.dst &&
    typeof request.dst.lat === 'number' &&
    typeof request.dst.lng === 'number';
}

// Routes
app.post('/match', (req, res) => {
  try {
    const { drivers: reqDrivers, requests: reqRequests, mode = 'mcmf' } = req.body;
    
    if (!Array.isArray(reqDrivers) || !Array.isArray(reqRequests)) {
      return res.status(400).json({ error: 'drivers and requests must be arrays' });
    }
    
    // Validate drivers
    for (const driver of reqDrivers) {
      if (!validateDriver(driver)) {
        return res.status(400).json({ error: `Invalid driver: ${JSON.stringify(driver)}` });
      }
    }
    
    // Validate requests
    for (const request of reqRequests) {
      if (!validateRequest(request)) {
        return res.status(400).json({ error: `Invalid request: ${JSON.stringify(request)}` });
      }
    }
    
    if (!['mcmf', 'greedy'].includes(mode)) {
      return res.status(400).json({ error: 'mode must be "mcmf" or "greedy"' });
    }
    
    const startTime = Date.now();
    const result = matchRides(reqDrivers, reqRequests, mode);
    const processingTime = Date.now() - startTime;
    
    // Update stats
    stats.matchCount++;
    stats.totalAssignments += result.assignments.length;
    
    res.json({
      ...result,
      processingTimeMs: processingTime,
      mode
    });
    
  } catch (error) {
    console.error('Match error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/drivers', (req, res) => {
  try {
    const driver = req.body;
    
    if (!validateDriver(driver)) {
      return res.status(400).json({ error: 'Invalid driver data' });
    }
    
    // Check for duplicate ID
    if (drivers.some(d => d.id === driver.id)) {
      return res.status(400).json({ error: 'Driver ID already exists' });
    }
    
    drivers.push(driver);
    res.json({ message: 'Driver added successfully', driver });
    
  } catch (error) {
    console.error('Add driver error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/requests', (req, res) => {
  try {
    const request = req.body;
    
    if (!validateRequest(request)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    // Check for duplicate ID
    if (requests.some(r => r.id === request.id)) {
      return res.status(400).json({ error: 'Request ID already exists' });
    }
    
    requests.push(request);
    res.json({ message: 'Request added successfully', request });
    
  } catch (error) {
    console.error('Add request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    stats: {
      ...stats,
      driversInMemory: drivers.length,
      requestsInMemory: requests.length
    },
    uptime: process.uptime()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`🚗 Ride pooling service running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});