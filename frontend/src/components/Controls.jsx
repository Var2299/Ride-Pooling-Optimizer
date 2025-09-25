import React, { useState } from 'react';

const Controls = ({ onMatch, loading, sampleData }) => {
  const [driversJson, setDriversJson] = useState(JSON.stringify(sampleData.drivers, null, 2));
  const [requestsJson, setRequestsJson] = useState(JSON.stringify(sampleData.requests, null, 2));
  const [mode, setMode] = useState('mcmf');
  const [jsonError, setJsonError] = useState(null);

  const validateJson = (jsonString, type) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        throw new Error(`${type} must be an array`);
      }
      return parsed;
    } catch (error) {
      throw new Error(`Invalid ${type} JSON: ${error.message}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setJsonError(null);

    try {
      const drivers = validateJson(driversJson, 'drivers');
      const requests = validateJson(requestsJson, 'requests');
      onMatch(drivers, requests, mode);
    } catch (error) {
      setJsonError(error.message);
    }
  };

  const generateRandomScenario = () => {
    const cities = [
      { name: 'Delhi', lat: 28.7, lng: 77.1 },
      { name: 'Mumbai', lat: 19.0, lng: 72.8 },
      { name: 'Bangalore', lat: 12.9, lng: 77.6 },
    ];
    
    const city = cities[Math.floor(Math.random() * cities.length)];
    const drivers = [];
    const requests = [];
    
    // Generate 3-5 random drivers
    const numDrivers = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numDrivers; i++) {
      drivers.push({
        id: `d${i + 1}`,
        lat: city.lat + (Math.random() - 0.5) * 0.1,
        lng: city.lng + (Math.random() - 0.5) * 0.1,
        etaMin: Math.floor(Math.random() * 10) + 2,
        capacity: Math.floor(Math.random() * 3) + 1
      });
    }
    
    // Generate 4-8 random requests
    const numRequests = 4 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numRequests; i++) {
      const srcLat = city.lat + (Math.random() - 0.5) * 0.15;
      const srcLng = city.lng + (Math.random() - 0.5) * 0.15;
      requests.push({
        id: `r${i + 1}`,
        src: { lat: srcLat, lng: srcLng },
        dst: { 
          lat: srcLat + (Math.random() - 0.5) * 0.1,
          lng: srcLng + (Math.random() - 0.5) * 0.1
        },
        earliest: Math.floor(Math.random() * 10),
        latest: 30 + Math.floor(Math.random() * 30)
      });
    }
    
    setDriversJson(JSON.stringify(drivers, null, 2));
    setRequestsJson(JSON.stringify(requests, null, 2));
    setJsonError(null);
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <svg className="w-6 h-6 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
        Configuration
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Algorithm Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Algorithm Mode
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="mcmf"
                checked={mode === 'mcmf'}
                onChange={(e) => setMode(e.target.value)}
                className="text-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                MCMF <span className="text-gray-500">(optimal)</span>
              </span>
            </label>
          </div>
        </div>

        {/* Drivers Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Drivers JSON
            <span className="text-gray-500 text-xs ml-1">
              (id, lat, lng, etaMin, capacity)
            </span>
          </label>
          <textarea
            value={driversJson}
            onChange={(e) => setDriversJson(e.target.value)}
            rows={6}
            className="input font-mono text-sm"
            placeholder='[{"id":"d1","lat":28.7,"lng":77.1,"etaMin":5,"capacity":2}]'
          />
        </div>

        {/* Requests Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requests JSON
            <span className="text-gray-500 text-xs ml-1">
              (id, src, dst, earliest?, latest?)
            </span>
          </label>
          <textarea
            value={requestsJson}
            onChange={(e) => setRequestsJson(e.target.value)}
            rows={8}
            className="input font-mono text-sm"
            placeholder='[{"id":"r1","src":{"lat":28.705,"lng":77.11},"dst":{"lat":28.72,"lng":77.12}}]'
          />
        </div>

        {/* Error Display */}
        {jsonError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{jsonError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Computing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Compute Match
              </span>
            )}
          </button>
          
          <button
            type="button"
            onClick={generateRandomScenario}
            className="btn btn-secondary w-full"
            disabled={loading}
          >
            <span className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Generate Random Scenario
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Controls;