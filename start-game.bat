@echo off
echo =======================================
echo   Starting Country Card Game...
echo =======================================
echo.

REM Check if node_modules exists, if not, install dependencies
if not exist "node_modules\" (
    echo First time setup - Installing dependencies...
    echo This may take a minute...
    echo.
    call npm install
    echo.
    echo Installation complete!
    echo.
)

echo Starting the game server...
echo If your browser doesn't open automatically,
echo look for the 'Local:' URL below and open it manually.
echo.
echo Press Ctrl+C when you're done playing to stop the server.
echo.
echo =======================================
echo.

npm run dev
