import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RunPipeline(){
  const [repo, setRepo] = useState('');
  const [lang, setLang] = useState('node');
  const [framework, setFramework] = useState('jest');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [runId, setRunId] = useState(null);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const handleRun = async ()=>{
    setLoading(true);
    setError(null);
    try{
      let newRunId = null;
      if (file){
        const form = new FormData();
        form.append('file', file);
        const up = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: form });
        if (!up.ok) throw new Error('Upload failed');
        const uj = await up.json();
        newRunId = uj.id;
      } else {
        // create a run entry with repo URL by calling upload without file
        const up = await fetch('http://localhost:5000/api/upload', { method: 'POST' });
        if (!up.ok) throw new Error('Failed to create run');
        const uj = await up.json();
        newRunId = uj.id;
      }

      // start the run and include metadata
      const runRes = await fetch('http://localhost:5000/api/run', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ id: newRunId, repo, lang, framework }) });
      if (!runRes.ok) throw new Error('Failed to start run');
      setRunId(newRunId);
      nav(`/run/${newRunId}`);
    }catch(e){
      console.error(e);
      setError(e.message || 'Unknown error');
    }finally{ setLoading(false); }
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Run Pipeline</h1>

      <div className="bg-white p-4 rounded shadow">
        {runId && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded">
            <div className="text-sm text-emerald-700">Run started — ID <strong>{runId}</strong></div>
            <div className="mt-2">
              <a className="text-sm text-slate-700 underline" href={`/run/${runId}`}>Open Run Status</a>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">Error: {error}</div>
        )}

        <label className="block text-sm font-medium text-gray-700">GitHub Repo URL</label>
        <input value={repo} onChange={e=>setRepo(e.target.value)} className="mt-1 block w-full border rounded p-2" placeholder="https://github.com/user/repo" />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Language</label>
            <select value={lang} onChange={e=>setLang(e.target.value)} className="mt-1 block w-full border rounded p-2">
              <option value="node">Node.js</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Test Framework</label>
            <select value={framework} onChange={e=>setFramework(e.target.value)} className="mt-1 block w-full border rounded p-2">
              <option value="jest">Jest</option>
              <option value="pytest">PyTest</option>
              <option value="junit">JUnit</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Or upload ZIP</label>
          <input type="file" onChange={e=>setFile(e.target.files[0])} className="mt-1" />
        </div>

        <div className="mt-4 flex justify-end">
          <button disabled={loading} onClick={handleRun} className="bg-slate-800 text-white px-4 py-2 rounded hover:opacity-90">{loading? 'Starting...':'Run Pipeline'}</button>
        </div>
      </div>
    </main>
  );
}
