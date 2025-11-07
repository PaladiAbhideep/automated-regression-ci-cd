const fs = require('fs');
const http = require('http');
const https = require('https');

function send(url, token, payload){
  const full = new URL(url + '/api/report');
  const data = JSON.stringify(payload);
  const isHttps = full.protocol === 'https:';
  const opts = {
    hostname: full.hostname,
    port: full.port || (isHttps ? 443 : 80),
    path: full.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      'Authorization': 'Bearer ' + token
    }
  };

  const req = (isHttps ? https : http).request(opts, res=>{
    let body = '';
    res.on('data', c=> body += c);
    res.on('end', ()=>{
      console.log('dashboard response', res.statusCode, body);
    });
  });
  req.on('error', e=>{ console.error('request error', e); process.exit(1); });
  req.write(data);
  req.end();
}

(async ()=>{
  const DASH_URL = process.env.DASHBOARD_URL;
  const DASH_TOKEN = process.env.DASHBOARD_TOKEN;
  if (!DASH_URL || !DASH_TOKEN){ console.error('DASHBOARD_URL or DASHBOARD_TOKEN not set'); process.exit(1); }

  let json = {};
  try{ json = JSON.parse(fs.readFileSync('jest-results.json','utf8')); }catch(e){}

  const payload = {
    repo: process.env.GITHUB_REPOSITORY,
    sha: process.env.GITHUB_SHA,
    testsTotal: json.numTotalTests || 0,
    testsPassed: json.numPassedTests || 0,
    coverage: (json.coverage || 0),
    lintScore: 0
  };

  console.log('sending payload to dashboard', payload);
  send(DASH_URL, DASH_TOKEN, payload);

})();
