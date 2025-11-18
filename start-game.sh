#!/bin/bash

# Navigate to the script's directory
cd "$(dirname "$0")"

echo "======================================="
echo "  Starting Country Card Game..."
echo "======================================="
echo ""
echo "The server will start in a moment."
echo "If your browser doesn't open automatically,"
echo "look for the 'Local:' URL below and open it manually."
echo ""
echo "Press Ctrl+C when you're done playing to stop the server."
echo ""
echo "======================================="
echo ""

# Start the development server
npm run dev
