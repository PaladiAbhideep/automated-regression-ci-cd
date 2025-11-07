@echo off
REM Start server in this folder (detached new window)
start "CI/CD Backend" cmd /k "cd /d %~dp0 && node index.js"
