#!/bin/bash

# Navigate to the script's directory
cd "$(dirname "$0")"

echo "Starting Country Card Game..."
echo "The game will open in your browser automatically."
echo ""
echo "Press Ctrl+C to stop the game server when you're done playing."
echo ""

# Start the development server
npm run dev -- --open
