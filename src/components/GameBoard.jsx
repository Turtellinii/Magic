import React, { useState } from 'react';
import Card from './Card';
import CardFinder from './CardFinder';
import './GameBoard.css';

const GameBoard = ({ deck }) => {
  // Shuffle function using Fisher-Yates algorithm
  const shuffleDeck = (deckToShuffle) => {
    const shuffled = [...deckToShuffle];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Sort cards by type
  const sortCardsByType = (cards) => {
    const typeOrder = {
      'Land': 1,
      'Creature': 2,
      'Artifact': 3,
      'Enchantment': 4,
      'Instant': 5,
      'Sorcery': 6,
      'Curse': 6,
      'Planeswalker': 7
    };

    return [...cards].sort((a, b) => {
      // Extract main type (skip "Legendary" if present)
      const getMainType = (card) => {
        const type = card.type || '';
        const beforeDash = type.split(/[—]/)[0].trim();
        const words = beforeDash.split(' ');

        // Skip "Legendary" and other modifiers to get the actual type
        for (let word of words) {
          if (typeOrder[word] !== undefined) {
            return word;
          }
        }

        // If no match found, return the first word
        return words[0];
      };

      const typeA = getMainType(a);
      const typeB = getMainType(b);

      const orderA = typeOrder[typeA] || 99;
      const orderB = typeOrder[typeB] || 99;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // Within same type, sort legendary last, then by name
      const isLegendaryA = (a.type || '').includes('Legendary');
      const isLegendaryB = (b.type || '').includes('Legendary');

      if (isLegendaryA !== isLegendaryB) {
        return isLegendaryA ? 1 : -1; // Non-legendary first
      }

      // If both same legendary status, sort by name
      return (a.name || '').localeCompare(b.name || '');
    });
  };

  // Game state
  const [playerHand, setPlayerHand] = useState([]);
  const [opponentHand, setOpponentHand] = useState([]);
  const [playerBattlefield, setPlayerBattlefield] = useState([]);
  const [opponentBattlefield, setOpponentBattlefield] = useState([]);
  const [playerGraveyard, setPlayerGraveyard] = useState([]);
  const [opponentGraveyard, setOpponentGraveyard] = useState([]);
  const [playerExile, setPlayerExile] = useState([]);
  const [opponentExile, setOpponentExile] = useState([]);
  const [playerDeck, setPlayerDeck] = useState(shuffleDeck(deck));
  const [opponentDeck, setOpponentDeck] = useState(shuffleDeck(deck));

  // UI state
  const [showPlayerGraveyard, setShowPlayerGraveyard] = useState(false);
  const [showOpponentGraveyard, setShowOpponentGraveyard] = useState(false);
  const [showPlayerExile, setShowPlayerExile] = useState(false);
  const [showOpponentExile, setShowOpponentExile] = useState(false);
  const [showCardFinder, setShowCardFinder] = useState(false);

  // Card movement functions
  const moveCardToPlayerHand = (card) => {
    setPlayerHand([...playerHand, { ...card, instanceId: Date.now() }]);
  };

  const moveCardToOpponentHand = (card) => {
    setOpponentHand([...opponentHand, { ...card, instanceId: Date.now() }]);
  };

  const playCardFromPlayerHand = (cardIndex) => {
    const card = playerHand[cardIndex];
    setPlayerBattlefield([...playerBattlefield, card]);
    setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
  };

  const playCardFromOpponentHand = (cardIndex) => {
    const card = opponentHand[cardIndex];
    setOpponentBattlefield([...opponentBattlefield, card]);
    setOpponentHand(opponentHand.filter((_, i) => i !== cardIndex));
  };

  const movePlayerCardToGraveyard = (cardIndex, fromZone) => {
    let card;
    if (fromZone === 'battlefield') {
      card = playerBattlefield[cardIndex];
      setPlayerBattlefield(playerBattlefield.filter((_, i) => i !== cardIndex));
    } else if (fromZone === 'hand') {
      card = playerHand[cardIndex];
      setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
    }
    if (card) {
      setPlayerGraveyard([...playerGraveyard, card]);
    }
  };

  const moveOpponentCardToGraveyard = (cardIndex, fromZone) => {
    let card;
    if (fromZone === 'battlefield') {
      card = opponentBattlefield[cardIndex];
      setOpponentBattlefield(opponentBattlefield.filter((_, i) => i !== cardIndex));
    } else if (fromZone === 'hand') {
      card = opponentHand[cardIndex];
      setOpponentHand(opponentHand.filter((_, i) => i !== cardIndex));
    }
    if (card) {
      setOpponentGraveyard([...opponentGraveyard, card]);
    }
  };

  const movePlayerCardToExile = (cardIndex, fromZone) => {
    let card;
    if (fromZone === 'battlefield') {
      card = playerBattlefield[cardIndex];
      setPlayerBattlefield(playerBattlefield.filter((_, i) => i !== cardIndex));
    } else if (fromZone === 'hand') {
      card = playerHand[cardIndex];
      setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
    } else if (fromZone === 'graveyard') {
      card = playerGraveyard[cardIndex];
      setPlayerGraveyard(playerGraveyard.filter((_, i) => i !== cardIndex));
    }
    if (card) {
      setPlayerExile([...playerExile, card]);
    }
  };

  const moveOpponentCardToExile = (cardIndex, fromZone) => {
    let card;
    if (fromZone === 'battlefield') {
      card = opponentBattlefield[cardIndex];
      setOpponentBattlefield(opponentBattlefield.filter((_, i) => i !== cardIndex));
    } else if (fromZone === 'hand') {
      card = opponentHand[cardIndex];
      setOpponentHand(opponentHand.filter((_, i) => i !== cardIndex));
    } else if (fromZone === 'graveyard') {
      card = opponentGraveyard[cardIndex];
      setOpponentGraveyard(opponentGraveyard.filter((_, i) => i !== cardIndex));
    }
    if (card) {
      setOpponentExile([...opponentExile, card]);
    }
  };

  const drawPlayerCard = () => {
    if (playerDeck.length === 0) {
      alert('No cards left in deck!');
      return;
    }
    const card = playerDeck[0];
    setPlayerHand([...playerHand, { ...card, instanceId: Date.now() }]);
    setPlayerDeck(playerDeck.slice(1));
  };

  const drawOpponentCard = () => {
    if (opponentDeck.length === 0) {
      alert('No cards left in opponent deck!');
      return;
    }
    const card = opponentDeck[0];
    setOpponentHand([...opponentHand, { ...card, instanceId: Date.now() }]);
    setOpponentDeck(opponentDeck.slice(1));
  };

  return (
    <div className="game-board">
      <div className="game-header">
        <h1>Country Card Game - India Deck</h1>
        <button
          className="card-finder-btn"
          onClick={() => setShowCardFinder(!showCardFinder)}
        >
          {showCardFinder ? 'Close Card Finder' : 'Open Card Finder'}
        </button>
      </div>

      {showCardFinder && (
        <CardFinder
          deck={deck}
          onAddToPlayerHand={moveCardToPlayerHand}
          onAddToOpponentHand={moveCardToOpponentHand}
        />
      )}

      {/* Opponent Section */}
      <div className="player-section opponent-section">
        <h2>Opponent</h2>

        <div className="zone-controls">
          <button className="draw-btn" onClick={drawOpponentCard}>
            Draw Card
          </button>
          <button onClick={() => setShowOpponentGraveyard(!showOpponentGraveyard)}>
            Graveyard ({opponentGraveyard.length})
          </button>
          <button onClick={() => setShowOpponentExile(!showOpponentExile)}>
            Exile ({opponentExile.length})
          </button>
          <div className="deck-info">Deck: {opponentDeck.length}</div>
        </div>

        {showOpponentGraveyard && (
          <div className="modal-overlay" onClick={() => setShowOpponentGraveyard(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Opponent Graveyard</h3>
              <div className="card-grid">
                {opponentGraveyard.map((card, index) => (
                  <Card key={index} card={card} isSmall />
                ))}
              </div>
              <button onClick={() => setShowOpponentGraveyard(false)}>Close</button>
            </div>
          </div>
        )}

        {showOpponentExile && (
          <div className="modal-overlay" onClick={() => setShowOpponentExile(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Opponent Exile</h3>
              <div className="card-grid">
                {opponentExile.map((card, index) => (
                  <Card key={index} card={card} isSmall />
                ))}
              </div>
              <button onClick={() => setShowOpponentExile(false)}>Close</button>
            </div>
          </div>
        )}

        <div className="zone hand">
          <h3>Hand ({opponentHand.length})</h3>
          <div className="card-container">
            {sortCardsByType(opponentHand).map((card, index) => (
              <Card
                key={index}
                card={card}
                onClick={() => {
                  const originalIndex = opponentHand.findIndex(c => c.instanceId === card.instanceId);
                  playCardFromOpponentHand(originalIndex);
                }}
              />
            ))}
          </div>
        </div>

        <div className="zone battlefield">
          <h3>Battlefield</h3>
          <div className="card-container">
            {sortCardsByType(opponentBattlefield).map((card, index) => (
              <Card
                key={index}
                card={card}
                onClick={() => {
                  if (window.confirm('Move to graveyard?')) {
                    const originalIndex = opponentBattlefield.findIndex(c => c.instanceId === card.instanceId);
                    moveOpponentCardToGraveyard(originalIndex, 'battlefield');
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Player Section */}
      <div className="player-section player-section-main">
        <h2>Player</h2>

        <div className="zone battlefield">
          <h3>Battlefield</h3>
          <div className="card-container">
            {sortCardsByType(playerBattlefield).map((card, index) => (
              <Card
                key={index}
                card={card}
                onClick={() => {
                  if (window.confirm('Move to graveyard?')) {
                    const originalIndex = playerBattlefield.findIndex(c => c.instanceId === card.instanceId);
                    movePlayerCardToGraveyard(originalIndex, 'battlefield');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className="zone hand">
          <h3>Hand ({playerHand.length})</h3>
          <div className="card-container">
            {sortCardsByType(playerHand).map((card, index) => (
              <Card
                key={index}
                card={card}
                onClick={() => {
                  const originalIndex = playerHand.findIndex(c => c.instanceId === card.instanceId);
                  playCardFromPlayerHand(originalIndex);
                }}
              />
            ))}
          </div>
        </div>

        <div className="zone-controls">
          <button className="draw-btn" onClick={drawPlayerCard}>
            Draw Card
          </button>
          <button onClick={() => setShowPlayerGraveyard(!showPlayerGraveyard)}>
            Graveyard ({playerGraveyard.length})
          </button>
          <button onClick={() => setShowPlayerExile(!showPlayerExile)}>
            Exile ({playerExile.length})
          </button>
          <div className="deck-info">Deck: {playerDeck.length}</div>
        </div>

        {showPlayerGraveyard && (
          <div className="modal-overlay" onClick={() => setShowPlayerGraveyard(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Player Graveyard</h3>
              <div className="card-grid">
                {playerGraveyard.map((card, index) => (
                  <Card key={index} card={card} isSmall />
                ))}
              </div>
              <button onClick={() => setShowPlayerGraveyard(false)}>Close</button>
            </div>
          </div>
        )}

        {showPlayerExile && (
          <div className="modal-overlay" onClick={() => setShowPlayerExile(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Player Exile</h3>
              <div className="card-grid">
                {playerExile.map((card, index) => (
                  <Card key={index} card={card} isSmall />
                ))}
              </div>
              <button onClick={() => setShowPlayerExile(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
