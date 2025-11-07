import React, { useEffect, useState } from 'react';

export default function Reports(){
  const [history, setHistory] = useState([]);

  useEffect(()=>{
    fetch('http://localhost:4000/api/history').then(r=>r.json()).then(setHistory).catch(()=>{});
  },[])

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="space-y-3">
        {history.map(h=> (
          <div key={h.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">Run #{h.id} — {h.status}</div>
              <div className="text-sm text-gray-500">{new Date(h.createdAt).toLocaleString()}</div>
            </div>
            <a className="text-sky-600 hover:underline" href={`/run/${h.id}`}>View</a>
          </div>
        ))}
        {!history.length && <div className="text-gray-500">No runs yet</div>}
      </div>
    </main>
  );
}
