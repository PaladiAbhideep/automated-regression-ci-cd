import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import ResultsDashboard from '../components/ResultsDashboard';

export default function RunStatus(){
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [logs, setLogs] = useState([]);
  const socketRef = useRef(null);

  useEffect(()=>{
    let mounted = true;
    const fetchStatus = async ()=>{
      const res = await fetch(`http://localhost:5000/api/status/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (mounted) {
        setRun(data);
        setLogs(data.logs || []);
      }
    }
    fetchStatus();

    // setup socket for live logs
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('join', id);
    socketRef.current.on('log', ({ id: rid, msg })=>{
      if (rid.toString() !== id.toString()) return;
      setLogs(l => [...l, msg]);
    });
    socketRef.current.on('results', ({ id: rid, results })=>{
      if (rid.toString() !== id.toString()) return;
      setRun(r => ({ ...r, results }));
    });

    const iv = setInterval(fetchStatus, 3000);
    return ()=>{ mounted=false; clearInterval(iv); if (socketRef.current) socketRef.current.disconnect(); }
  },[id]);

  if (!run) return <div className="p-6">Loading...</div>;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Run #{id} - {run.status}</h1>
      <div className="mb-4 text-sm text-gray-600">{run.repo ? `Repo: ${run.repo}` : run.file ? `Uploaded: ${run.file}` : ''} {run.lang? ` • ${run.lang}`: ''} {run.framework? ` • ${run.framework}`: ''}</div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Logs (live)</h3>
        <div className="mt-2 bg-slate-100 p-3 rounded h-60 overflow-auto font-mono text-sm">
          {logs && logs.map((l,i)=>(<div key={i}>{l}</div>))}
        </div>
      </div>
      <ResultsDashboard run={run} />
    </main>
  );
}
