# Country Card Game

A Magic: the Gathering inspired card game with country-themed decks. Currently featuring the India deck.

## Quick Start

### Easy Launch (Double-Click)

**Mac:**
- Double-click `start-game.command` to launch the game

**Linux:**
- Double-click `start-game.desktop` to launch the game
- If prompted, select "Trust and Launch" or "Execute"

**Windows:**
- Double-click `start-game.bat` to launch the game

The launcher will automatically install dependencies on first run and then open the game in your browser!

### Manual Launch (Command Line)

If the double-click method doesn't work, you can start the game manually:

```bash
npm install    # Only needed the first time
npm run dev
```

Then open your browser to the URL shown in the terminal (usually http://localhost:5173)

## How to Play

1. **Open Card Finder**: Click the "Open Card Finder" button at the top
2. **Search Cards**: Type to search by card name or type
3. **Add Cards to Hand**: Select a card and click "Add to Player Hand" or "Add to Opponent Hand"
4. **Play Cards**: Click cards in your hand to move them to the battlefield
5. **Move to Graveyard**: Click battlefield cards to move them to the graveyard
6. **View Zones**: Click "Graveyard" or "Exile" buttons to view those zones

## Current Features

- Player and Opponent hands and battlefields
- Graveyard and Exile zones (viewable via buttons)
- Card Finder to search and add cards to either hand
- 10 India deck cards (all land cards)
- Interactive card movement between zones

## Tech Stack

- React 19
- Vite 7
- CSS3 for styling
