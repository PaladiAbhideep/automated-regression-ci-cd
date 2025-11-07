import React from 'react';

export default function QualityCard({ metric = 'Code Coverage', value = '92%' }){
  return (
    <div className="border rounded p-4 shadow-sm bg-white">
      <h4 className="font-semibold">{metric}</h4>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}
