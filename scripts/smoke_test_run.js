const fetch = require('node-fetch');

const base = 'http://localhost:5000';

async function main(){
  console.log('Creating run (upload-less)');
  const uRes = await fetch(base + '/api/upload', { method: 'POST' });
  const u = await uRes.json();
  console.log('Created run id', u.id);

  const rRes = await fetch(base + '/api/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id }) });
  const r = await rRes.json();
  console.log('Run started', r);

  const id = u.id;
  const start = Date.now();
  while (true){
    const sRes = await fetch(base + '/api/status/' + id);
    const status = await sRes.json();
    console.log('Status:', status.status, 'logs:', status.logs && status.logs.slice(-3));
    if (status.results) { console.log('Results:', status.results); break; }
    if (Date.now() - start > 20000){ console.log('Timeout'); break; }
    await new Promise(r=>setTimeout(r,1500));
  }
}

main().catch(err=>{ console.error(err); process.exit(1); });
