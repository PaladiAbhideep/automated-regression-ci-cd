import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-bold">CI/CD Dashboard</div>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/run" className="hover:underline">Run Pipeline</Link>
          <Link to="/reports" className="hover:underline">Reports</Link>
          <Link to="/settings" className="hover:underline">Settings</Link>
        </div>
      </div>
    </nav>
  );
}
