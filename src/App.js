import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RunPipeline from './pages/RunPipeline';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import RunStatus from './pages/RunStatus';
import './App.css';

export default function App(){
  return (
    <Router>
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/run" element={<RunPipeline/>} />
          <Route path="/run/:id" element={<RunStatus/>} />
          <Route path="/reports" element={<Reports/>} />
          <Route path="/settings" element={<Settings/>} />
        </Routes>
      </div>
    </Router>
  );
}
