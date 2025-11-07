import React from 'react';

export default function PipelineCard({ title = 'Pipeline', status = 'success', lastRun = 'just now' }){
  const statusColor = status === 'success' ? 'green' : status === 'running' ? 'yellow' : 'red';
  return (
    <div className="border rounded p-4 shadow-sm bg-white">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className={`text-${statusColor}-600 font-medium`}>{status}</span>
      </div>
      <div className="text-sm text-gray-500 mt-2">Last run: {lastRun}</div>
    </div>
  );
}
