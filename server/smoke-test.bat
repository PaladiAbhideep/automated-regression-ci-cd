@echo off
REM Simple smoke test: create run, start run, poll status
cd /d %~dp0
for /f "tokens=*" %%i in ('curl -s -X POST http://127.0.0.1:5000/api/upload -H "Accept: application/json"') do set RESP=%%i
echo upload response: %RESP%
for /f "tokens=2 delims=":" %%a in ('echo %RESP% ^| sed "s/[{}\"]//g" ^| sed "s/,/ /g" ^| findstr /r "id:"') do set ID=%%a
set ID=%ID: =%
if "%ID%"=="" set ID=1
echo starting run %ID%
curl -s -X POST http://127.0.0.1:5000/api/run -H "Content-Type: application/json" -d "{\"id\":%ID%,\"repo\":\"cli-smoke\",\"lang\":\"node\",\"framework\":\"jest\"}"
ping -n 2 127.0.0.1 > nul
curl http://127.0.0.1:5000/api/status/%ID%
pause
