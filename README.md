# CI/CD Dashboard (local)

This project is a demo CI/CD dashboard with a React frontend and an Express backend that simulates pipeline runs.

What it does

- Frontend: React + Tailwind UI, pages to run a pipeline, watch status, and view reports.
- Backend: Express + Socket.IO that accepts uploads, starts simulated runs, emits live logs and results, and persists run history to `server/runs.json`.

Quick start (Windows)

1. Start the backend (recommended in a cmd.exe window):

```powershell
cd /d D:\CICD_Project\cicd-dashboard\server
npm install
npm start
```

2. Start the frontend (in a separate cmd.exe window):

```powershell
cd /d D:\CICD_Project\cicd-dashboard
npm install
npm start
```

3. Open the frontend at http://localhost:3000. Use the Run Pipeline page to submit a repo URL or upload a ZIP and press "Run Pipeline". You'll be navigated to the Run Status page where logs appear live and results show when the simulation finishes.

Notes

- Runs are persisted to `server/runs.json` so history survives restarts.
- Socket.IO streams logs and results to the frontend in real time.
- This is a simulation: actual test execution is not performed.

Next steps you can take

- Add authentication and repo cloning support.
- Replace simulated pipeline with actual test execution in a sandbox/container.
- Add charts for long-term trends and history.

GitHub Actions integration

This repository includes a simple workflow `.github/workflows/ci-report.yml` that runs tests and posts results to your dashboard using the helper script `.github/scripts/send-results.js`.

To enable it:

1. Add two repository secrets in GitHub:
	- `DASHBOARD_URL` — the base URL of your dashboard, e.g. `http://your-server:5000` or `http://dashboard.example.com`
	- `DASHBOARD_TOKEN` — a secret token to secure the `/api/report` endpoint (set `DASHBOARD_API_TOKEN` on the server to the same value)

2. Commit the workflow; GitHub Actions will run on push and PRs and the workflow will POST test results to your dashboard.

Security note: the example workflow sends a bearer token in the Authorization header. Keep your tokens secret and rotate them periodically.
