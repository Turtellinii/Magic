#!/bin/bash

# Navigate to the script's directory
cd "$(dirname "$0")"

echo "======================================="
echo "  Starting Country Card Game..."
echo "======================================="
echo ""

# Check if node_modules exists, if not, install dependencies
if [ ! -d "node_modules" ]; then
    echo "First time setup - Installing dependencies..."
    echo "This may take a minute..."
    echo ""
    npm install
    echo ""
    echo "Installation complete!"
    echo ""
fi

echo "Starting the game server..."
echo "If your browser doesn't open automatically,"
echo "look for the 'Local:' URL below and open it manually."
echo ""
echo "Press Ctrl+C when you're done playing to stop the server."
echo ""
echo "======================================="
echo ""

# Add node_modules/.bin to PATH for better compatibility
export PATH="$PWD/node_modules/.bin:$PATH"

# Start the development server using npx to ensure vite is found
npx vite
