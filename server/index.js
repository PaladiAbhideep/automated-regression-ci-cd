const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

// storage folders
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DATA_FILE = path.join(__dirname, 'runs.json');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// multer with size limits
const upload = multer({ dest: UPLOAD_DIR, limits: { fileSize: 50 * 1024 * 1024 } });

// Load persisted runs if available
const runs = {};
let runId = 1;
if (fs.existsSync(DATA_FILE)) {
  try{
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    for (const r of parsed) {
      runs[r.id] = r;
      runId = Math.max(runId, Number(r.id) + 1);
    }
    console.log(`Loaded ${Object.keys(runs).length} runs from disk`);
  }catch(e){ console.warn('Failed to load runs.json', e.message); }
}

function persistRuns(){
  try{
    fs.writeFileSync(DATA_FILE, JSON.stringify(Object.values(runs), null, 2));
  }catch(e){ console.warn('Failed to persist runs', e.message); }
}

// ensure there's a runs file present (even if empty)
try{ if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([])); }catch(e){ console.warn('Could not create runs.json', e.message); }

// Global process handlers to avoid silent exits
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

// create HTTP + socket.io server
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', socket => {
  // client may join a room for a run id
  socket.on('join', room => { socket.join(`run:${room}`); });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  const id = runId++;
  runs[id] = { id, status: 'uploaded', file: req.file ? req.file.filename : null, createdAt: Date.now() };
  persistRuns();
  res.json({ id });
});

function emitLog(id, msg){
  if (!runs[id]) return;
  runs[id].logs = runs[id].logs || [];
  runs[id].logs.push(msg);
  io.to(`run:${id}`).emit('log', { id, msg });
  persistRuns();
}

function emitResults(id){
  io.to(`run:${id}`).emit('results', { id, results: runs[id].results });
  persistRuns();
}

app.post('/api/run', (req, res) => {
  const { id } = req.body;
  if (!runs[id]) return res.status(404).json({ error: 'run not found' });

  runs[id].status = 'running';
  runs[id].logs = runs[id].logs || [];
  // store metadata if provided
  const { repo, lang, framework } = req.body;
  if (repo) runs[id].repo = repo;
  if (lang) runs[id].lang = lang;
  if (framework) runs[id].framework = framework;
  emitLog(id, `Starting pipeline for ${repo || runs[id].file || 'uploaded artifact'}`);
  runs[id].results = null;

  console.log(`Run ${id} started (repo=${runs[id].repo || 'N/A'}, file=${runs[id].file || 'N/A'})`);

  setTimeout(() => { emitLog(id, 'Installing dependencies...'); console.log(`Run ${id}: Installing dependencies`); }, 600);
  setTimeout(() => { emitLog(id, 'Building project...'); console.log(`Run ${id}: Building`); }, 1400);
  setTimeout(() => { emitLog(id, 'Running unit tests...'); console.log(`Run ${id}: Running unit tests`); }, 2200);
  setTimeout(() => { emitLog(id, 'Unit tests completed'); console.log(`Run ${id}: Unit tests completed`); }, 3200);
  setTimeout(() => { emitLog(id, 'Linting code...'); console.log(`Run ${id}: Linting`); }, 3800);

  setTimeout(() => {
    const testsTotal = Math.floor(Math.random() * 20) + 1;
    const testsPassed = Math.floor(testsTotal * (0.6 + Math.random() * 0.4));
    const coverage = Math.floor(50 + Math.random() * 50); // 50-100
    const lintScore = Math.floor(60 + Math.random() * 40); // 60-100
    const success = testsPassed === testsTotal;

    runs[id].results = { testsPassed, testsTotal, coverage, lintScore };
    runs[id].status = success ? 'success' : 'failed';
    emitLog(id, `Tests: ${testsPassed}/${testsTotal}`);
    emitLog(id, `Coverage: ${coverage}%`);
    emitLog(id, `Lint score: ${lintScore}%`);
    emitLog(id, `Pipeline finished: ${runs[id].status}`);
    emitResults(id);
    console.log(`Run ${id} finished: ${runs[id].status}`);
  }, 5200);

  persistRuns();
  res.json({ id, status: 'running' });
});

app.get('/api/status/:id', (req, res) => {
  const id = req.params.id;
  if (!runs[id]) return res.status(404).json({ error: 'run not found' });
  res.json(runs[id]);
});

app.get('/api/history', (req, res) => {
  const list = Object.values(runs).sort((a,b)=>b.createdAt-a.createdAt);
  res.json(list);
});

// simple health endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Accept external CI reports (example integration point for GitHub Actions)
// Optional: protect with an API token via `DASHBOARD_API_TOKEN` env var
app.post('/api/report', (req, res) => {
  const token = process.env.DASHBOARD_API_TOKEN;
  if (token) {
    const auth = req.headers['authorization'] || '';
    if (!auth.startsWith('Bearer ') || auth.slice(7) !== token) {
      return res.status(401).json({ error: 'unauthorized' });
    }
  }
  const payload = req.body || {};
  // payload can include repo, sha, status, testsPassed, testsTotal, coverage, lintScore
  const id = runId++;
  runs[id] = {
    id,
    status: payload.status || 'reported',
    repo: payload.repo || null,
    sha: payload.sha || null,
    results: payload.results || { testsPassed: payload.testsPassed || 0, testsTotal: payload.testsTotal || 0, coverage: payload.coverage || 0, lintScore: payload.lintScore || 0 },
    logs: payload.logs || [ 'Report received' ],
    createdAt: Date.now()
  };
  emitResults(id);
  persistRuns();
  res.json({ id });
});

// Placeholder deploy endpoint (secure with DASHBOARD_API_TOKEN if set)
app.post('/api/deploy', (req, res) => {
  const token = process.env.DASHBOARD_API_TOKEN;
  if (token) {
    const auth = req.headers['authorization'] || '';
    if (!auth.startsWith('Bearer ') || auth.slice(7) !== token) {
      return res.status(401).json({ error: 'unauthorized' });
    }
  }
  const { id, target } = req.body || {};
  // This is a placeholder — implement deployment orchestration here.
  if (id && runs[id]) {
    emitLog(id, `Deployment to ${target || 'unknown'} requested`);
    // Simulate deploy step
    setTimeout(()=>{ emitLog(id, `Deployment to ${target || 'unknown'} completed`); persistRuns(); }, 1500);
    return res.json({ ok: true, id });
  }
  return res.status(400).json({ error: 'missing id or run not found' });
});

// Basic error handler for express
app.use((err, req, res, next) => {
  console.error('Express error:', err && err.stack ? err.stack : err);
  res.status(500).json({ error: err && err.message ? err.message : 'internal error' });
});

const port = process.env.PORT || 5000;
server.listen(port, ()=> console.log(`CI/CD backend (with socket.io) listening on ${port}`));
