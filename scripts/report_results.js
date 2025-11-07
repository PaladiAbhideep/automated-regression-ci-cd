const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Config
const POSSIBLE_PATHS = [
  path.join(__dirname, '..', 'reports', 'junit-jest.xml'),
  path.join(__dirname, '..', 'junit.xml'),
  path.join(__dirname, '..', 'junit-jest.xml'),
  path.join(__dirname, '..', 'junit.xml')
];

function findReport(){
  for(const p of POSSIBLE_PATHS){ if(fs.existsSync(p)) return p; }
  // try wildcard: look for any xml in reports/
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (fs.existsSync(reportsDir)){
    const files = fs.readdirSync(reportsDir).filter(f=>f.endsWith('.xml'));
    if(files.length) return path.join(reportsDir, files[0]);
  }
  return null;
}
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://127.0.0.1:5000/api/report';
const DASHBOARD_TOKEN = process.env.DASHBOARD_API_TOKEN || '';

function parseJUnit(xml) {
  // Very small parser for the common junit xml summary attributes.
  // Tries to read tests and failures/errors from either <testsuites> or <testsuite> root.
  const testsuitesMatch = xml.match(/<testsuites[^>]*tests="(\d+)"[^>]*failures="(\d+)"[^>]*errors="(\d+)"/);
  if (testsuitesMatch) {
    const tests = Number(testsuitesMatch[1]);
    const failures = Number(testsuitesMatch[2]);
    const errors = Number(testsuitesMatch[3]);
    return { tests, failures, errors };
  }
  const testsuiteMatch = xml.match(/<testsuite[^>]*tests="(\d+)"[^>]*failures="(\d+)"[^>]*errors="(\d+)"/);
  if (testsuiteMatch) {
    const tests = Number(testsuiteMatch[1]);
    const failures = Number(testsuiteMatch[2]);
    const errors = Number(testsuiteMatch[3]);
    return { tests, failures, errors };
  }
  // fallback: search for tests and failures attributes anywhere
  const anyMatch = xml.match(/tests="(\d+)"/);
  const failMatch = xml.match(/failures="(\d+)"/);
  const errMatch = xml.match(/errors="(\d+)"/);
  return {
    tests: anyMatch ? Number(anyMatch[1]) : 0,
    failures: failMatch ? Number(failMatch[1]) : 0,
    errors: errMatch ? Number(errMatch[1]) : 0
  };
}

async function main(){
  const REPORT_PATH = findReport();
  if (!REPORT_PATH){
    console.error('Report file not found. Tried locations:', POSSIBLE_PATHS);
    process.exit(2);
  }
  const xml = fs.readFileSync(REPORT_PATH, 'utf8');
  console.log('Using report file:', REPORT_PATH);
  const { tests, failures, errors } = parseJUnit(xml);
  const testsTotal = tests || 0;
  const testsFailed = (failures || 0) + (errors || 0);
  const testsPassed = Math.max(0, testsTotal - testsFailed);

  // small heuristic for coverage / lint (not available here)
  const coverage = null;
  const lintScore = null;

  const payload = {
    repo: process.env.GIT_URL || null,
    sha: process.env.GIT_COMMIT || null,
    status: testsFailed === 0 ? 'success' : 'failed',
    results: { testsPassed, testsTotal, coverage, lintScore },
    logs: [`Parsed junit: total=${testsTotal}, passed=${testsPassed}, failed=${testsFailed}`]
  };

  console.log('Reporting summary to dashboard:', DASHBOARD_URL);
  try{
    const res = await fetch(DASHBOARD_URL, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, DASHBOARD_TOKEN ? { Authorization: `Bearer ${DASHBOARD_TOKEN}` } : {}),
      body: JSON.stringify(payload)
    });
    const body = await res.text();
    console.log('Dashboard response:', res.status, body);
    process.exit(res.ok ? 0 : 3);
  }catch(e){
    console.error('Failed to POST report:', e && e.message ? e.message : e);
    process.exit(4);
  }
}

main();
