import React, { useState } from 'react';
import Controls from './components/Controls';
import Results from './components/Results';

const SAMPLE_DATA = {
  drivers: [
    { id: 'd1', lat: 28.7, lng: 77.1, etaMin: 5, capacity: 2 },
    { id: 'd2', lat: 28.75, lng: 77.15, etaMin: 3, capacity: 1 },
    { id: 'd3', lat: 28.68, lng: 77.08, etaMin: 8, capacity: 3 }
  ],
  requests: [
    { id: 'r1', src: { lat: 28.705, lng: 77.11 }, dst: { lat: 28.72, lng: 77.12 }, earliest: 0, latest: 30 },
    { id: 'r2', src: { lat: 28.76, lng: 77.16 }, dst: { lat: 28.78, lng: 77.18 }, earliest: 5, latest: 45 },
    { id: 'r3', src: { lat: 28.71, lng: 77.13 }, dst: { lat: 28.73, lng: 77.14 }, earliest: 0, latest: 25 },
    { id: 'r4', src: { lat: 28.69, lng: 77.09 }, dst: { lat: 28.74, lng: 77.17 }, earliest: 10, latest: 50 },
    { id: 'r5', src: { lat: 28.72, lng: 77.14 }, dst: { lat: 28.77, lng: 77.19 }, earliest: 0, latest: 35 }
  ]
};

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMatch = async (drivers, requests, mode) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('https://ride-pooling-optimizer.vercel.app/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drivers,
          requests,
          mode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
      console.error('Match request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary-500 text-white p-3 rounded-full mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Ride Pooling Optimizer</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced ride-sharing optimization using Minimum Cost Maximum Flow algorithms. 
            Compare MCMF vs greedy strategies to minimize total travel time while respecting capacity constraints.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="xl:col-span-1">
            <Controls 
              onMatch={handleMatch}
              loading={loading}
              sampleData={SAMPLE_DATA}
            />
          </div>

          {/* Results Panel */}
          <div className="xl:col-span-2">
            {loading && (
              <div className="card text-center">
                <div className="animate-spin mx-auto mb-4 h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                <p className="text-gray-600">Computing optimal assignments...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-red-500 mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {result && <Results result={result} />}

            {!result && !loading && !error && (
              <div className="card text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">Ready to optimize</h3>
                <p className="text-gray-500">
                  Configure your drivers and passenger requests, then click "Compute Match" to see the optimal assignments.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Built with MCMF algorithms • Dijkstra + potentials • Real-time optimization
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
