import React, { useState } from 'react';
import Card from './Card';
import CardFinder from './CardFinder';
import './GameBoard.css';

const GameBoard = ({ deck }) => {
  // Game state
  const [playerHand, setPlayerHand] = useState([]);
  const [opponentHand, setOpponentHand] = useState([]);
  const [playerBattlefield, setPlayerBattlefield] = useState([]);
  const [opponentBattlefield, setOpponentBattlefield] = useState([]);
  const [playerGraveyard, setPlayerGraveyard] = useState([]);
  const [opponentGraveyard, setOpponentGraveyard] = useState([]);
  const [playerExile, setPlayerExile] = useState([]);
  const [opponentExile, setOpponentExile] = useState([]);
  const [playerDeck, setPlayerDeck] = useState([...deck]);
  const [opponentDeck, setOpponentDeck] = useState([...deck]);

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
            {opponentHand.map((card, index) => (
              <Card
                key={index}
                card={card}
                onClick={() => playCardFromOpponentHand(index)}
              />
            ))}
          </div>
        </div>

        <div className="zone battlefield">
          <h3>Battlefield</h3>
          <div className="card-container">
            {opponentBattlefield.map((card, index) => (
              <Card
                key={index}
                card={card}
                onClick={() => {
                  if (window.confirm('Move to graveyard?')) {
                    moveOpponentCardToGraveyard(index, 'battlefield');
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
            {playerBattlefield.map((card, index) => (
              <Card
                key={index}
                card={card}
                onClick={() => {
                  if (window.confirm('Move to graveyard?')) {
                    movePlayerCardToGraveyard(index, 'battlefield');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className="zone hand">
          <h3>Hand ({playerHand.length})</h3>
          <div className="card-container">
            {playerHand.map((card, index) => (
              <Card
                key={index}
                card={card}
                onClick={() => playCardFromPlayerHand(index)}
              />
            ))}
          </div>
        </div>

        <div className="zone-controls">
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
