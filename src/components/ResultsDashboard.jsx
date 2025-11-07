import React from 'react';

function Bar({ percent, label }){
  return (
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="w-full bg-slate-200 rounded h-4 mt-1 overflow-hidden">
        <div className="bg-emerald-500 h-4" style={{ width: `${percent}%` }} />
      </div>
      <div className="text-sm mt-1">{percent}%</div>
    </div>
  );
}

export default function ResultsDashboard({ run }){
  if (!run) return null;
  const r = run.results;
  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h3 className="text-lg font-semibold">Results</h3>
      {r ? (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="p-3 border rounded">
            <div className="text-sm text-gray-500">Tests</div>
            <div className="text-2xl font-bold">{r.testsPassed}/{r.testsTotal}</div>
          </div>
          <div className="p-3 border rounded">
            <Bar percent={r.coverage} label="Coverage" />
          </div>
          <div className="p-3 border rounded">
            <Bar percent={r.lintScore} label="Lint Score" />
          </div>
        </div>
      ) : <div className="text-gray-500 mt-2">Results pending...</div>}
    </div>
  );
}
