import React from 'react';

const Results = ({ result }) => {
  const { assignments, totalAddedTime, baselineAddedTime, unassigned, processingTimeMs, mode } = result;
  
  const improvement = baselineAddedTime > 0 
    ? ((baselineAddedTime - totalAddedTime) / baselineAddedTime * 100) 
    : 0;

  const driverAssignments = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.driverId]) {
      acc[assignment.driverId] = [];
    }
    acc[assignment.driverId].push(assignment);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center">
            <div className="bg-green-500 text-white p-2 rounded-lg mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Assignments</p>
              <p className="text-2xl font-bold text-green-900">{assignments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center">
            <div className="bg-blue-500 text-white p-2 rounded-lg mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Total Time</p>
              <p className="text-2xl font-bold text-blue-900">{totalAddedTime.toFixed(1)}min</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center">
            <div className="bg-purple-500 text-white p-2 rounded-lg mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Improvement</p>
              <p className="text-2xl font-bold text-purple-900">
                {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-gray-500 text-white p-2 rounded-lg mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Processing</p>
              <p className="text-2xl font-bold text-gray-900">{processingTimeMs}ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm Comparison */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Algorithm Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border-2 ${mode === 'mcmf' ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">MCMF (Optimal)</span>
              {mode === 'mcmf' && (
                <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded">USED</span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalAddedTime.toFixed(1)} min</p>
          </div>
          
          <div className={`p-4 rounded-lg border-2 ${mode === 'greedy' ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Greedy (Baseline)</span>
              {mode === 'greedy' && (
                <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded">USED</span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{baselineAddedTime.toFixed(1)} min</p>
          </div>
        </div>
      </div>

      {/* Driver Assignments */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Driver Assignments
        </h3>
        
        {Object.keys(driverAssignments).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(driverAssignments).map(([driverId, assignments]) => (
              <div key={driverId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
                    Driver {driverId}
                  </h4>
                  <span className="text-sm text-gray-600">
                    {assignments.length} passenger{assignments.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="grid gap-3">
                  {assignments.map((assignment, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="font-medium text-gray-900">Request {assignment.requestId}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">Added time:</span>
                        <div className="font-semibold text-gray-900">
                          {assignment.addedTime.toFixed(1)} min
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>No assignments made</p>
          </div>
        )}
      </div>

      {/* Unassigned Requests */}
      {unassigned.length > 0 && (
        <div className="card border-orange-200 bg-orange-50">
          <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Unassigned Requests ({unassigned.length})
          </h3>
          
          <div className="grid gap-2">
            {unassigned.map((request) => (
              <div key={request.id} className="flex items-center bg-white rounded-lg p-3 border border-orange-200">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Request {request.id}</span>
                <span className="ml-auto text-sm text-orange-700">
                  No feasible assignment
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;