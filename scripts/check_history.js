const fetch = require('node-fetch');
(async ()=>{
  try{
    const res = await fetch('http://localhost:5000/api/history');
    const data = await res.json();
    console.log('History length:', data.length);
    console.log(JSON.stringify(data.slice(0,5), null, 2));
  }catch(e){ console.error('Error:', e.message); process.exit(1); }
})();
