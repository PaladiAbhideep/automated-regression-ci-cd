import React from 'react';
import PipelineCard from '../components/PipelineCard';
import QualityCard from '../components/QualityCard';

export default function Dashboard(){
  return (
    <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <PipelineCard title="Build #123" status="success" lastRun="5 minutes ago" />
      <PipelineCard title="E2E Tests" status="running" lastRun="1 minute ago" />
      <QualityCard metric="Code Coverage" value="91%" />
    </main>
  );
}
