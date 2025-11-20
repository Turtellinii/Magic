import React, { useState, useEffect } from 'react';
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

  // Life and mana trackers
  const [playerLife, setPlayerLife] = useState(20);
  const [opponentLife, setOpponentLife] = useState(20);
  const [playerMana, setPlayerMana] = useState(0);
  const [opponentMana, setOpponentMana] = useState(0);

  // UI state
  const [showPlayerGraveyard, setShowPlayerGraveyard] = useState(false);
  const [showOpponentGraveyard, setShowOpponentGraveyard] = useState(false);
  const [showPlayerExile, setShowPlayerExile] = useState(false);
  const [showOpponentExile, setShowOpponentExile] = useState(false);
  const [showCardFinder, setShowCardFinder] = useState(false);

  // Combat state
  const [showCombatModal, setShowCombatModal] = useState(false);
  const [attackingCard, setAttackingCard] = useState(null);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(true);

  // Draw initial hands (7 cards each) when game starts
  useEffect(() => {
    // Draw 7 cards for player
    const playerInitialHand = playerDeck.slice(0, 7).map((card, i) => ({
      ...card,
      instanceId: Date.now() + i
    }));
    setPlayerHand(playerInitialHand);
    setPlayerDeck(playerDeck.slice(7));

    // Draw 7 cards for opponent
    const opponentInitialHand = opponentDeck.slice(0, 7).map((card, i) => ({
      ...card,
      instanceId: Date.now() + 100 + i
    }));
    setOpponentHand(opponentInitialHand);
    setOpponentDeck(opponentDeck.slice(7));
  }, []); // Empty dependency array means this runs once on mount

  // Card movement functions
  const moveCardToPlayerHand = (card) => {
    setPlayerHand([...playerHand, { ...card, instanceId: Date.now() }]);
  };

  const moveCardToOpponentHand = (card) => {
    setOpponentHand([...opponentHand, { ...card, instanceId: Date.now() }]);
  };

  const playCardFromPlayerHand = (cardIndex) => {
    const card = playerHand[cardIndex];
    const manaCost = card.cost || 0;

    // Check if player has enough mana
    if (manaCost > playerMana) {
      alert(`Not enough mana! This card costs ${manaCost} mana, but you only have ${playerMana}.`);
      return;
    }

    // Deduct mana cost
    setPlayerMana(playerMana - manaCost);

    // Play the card
    setPlayerBattlefield([...playerBattlefield, { ...card, tapped: false }]);
    setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
  };

  const playCardFromOpponentHand = (cardIndex) => {
    const card = opponentHand[cardIndex];
    const manaCost = card.cost || 0;

    // Check if opponent has enough mana
    if (manaCost > opponentMana) {
      alert(`Not enough mana! This card costs ${manaCost} mana, but opponent only has ${opponentMana}.`);
      return;
    }

    // Deduct mana cost
    setOpponentMana(opponentMana - manaCost);

    // Play the card
    setOpponentBattlefield([...opponentBattlefield, { ...card, tapped: false }]);
    setOpponentHand(opponentHand.filter((_, i) => i !== cardIndex));
  };

  // Check if a card is a land
  const isLandCard = (card) => {
    const type = card.type || '';
    return type.includes('Land');
  };

  // Check if a card is a creature
  const isCreatureCard = (card) => {
    const type = card.type || '';
    return type.includes('Creature');
  };

  // Tap/untap card functions
  const tapPlayerCard = (cardInstanceId) => {
    const card = playerBattlefield.find(c => c.instanceId === cardInstanceId);
    if (!card || card.tapped) return;

    // If it's a creature, show combat modal
    if (isCreatureCard(card)) {
      setAttackingCard(card);
      setIsPlayerAttacking(true);
      setShowCombatModal(true);
      return;
    }

    // For non-creatures, just tap
    setPlayerBattlefield(playerBattlefield.map(c => {
      if (c.instanceId === cardInstanceId) {
        if (isLandCard(c)) {
          setPlayerMana(playerMana + 1);
        }
        return { ...c, tapped: true };
      }
      return c;
    }));
  };

  const tapOpponentCard = (cardInstanceId) => {
    const card = opponentBattlefield.find(c => c.instanceId === cardInstanceId);
    if (!card || card.tapped) return;

    // If it's a creature, show combat modal
    if (isCreatureCard(card)) {
      setAttackingCard(card);
      setIsPlayerAttacking(false);
      setShowCombatModal(true);
      return;
    }

    // For non-creatures, just tap
    setOpponentBattlefield(opponentBattlefield.map(c => {
      if (c.instanceId === cardInstanceId) {
        if (isLandCard(c)) {
          setOpponentMana(opponentMana + 1);
        }
        return { ...c, tapped: true };
      }
      return c;
    }));
  };

  // Combat resolution functions
  const resolveCombat = (defenderCard) => {
    if (!attackingCard) return;

    const attackerPower = attackingCard.power || 0;
    const defenderPower = defenderCard.power || 0;

    // Tap the attacking creature
    if (isPlayerAttacking) {
      // Player is attacking opponent's creature
      setPlayerBattlefield(playerBattlefield.map(c => {
        if (c.instanceId === attackingCard.instanceId) {
          return { ...c, tapped: true };
        }
        return c;
      }));

      // Apply damage to both creatures
      setOpponentBattlefield(prev => {
        const updated = prev.map(c => {
          if (c.instanceId === defenderCard.instanceId) {
            const currentToughness = c.currentToughness !== undefined ? c.currentToughness : c.toughness;
            const newToughness = currentToughness - attackerPower;
            return { ...c, currentToughness: newToughness };
          }
          return c;
        });
        // Remove dead creatures
        const dead = updated.filter(c => c.currentToughness !== undefined && c.currentToughness <= 0);
        dead.forEach(c => setOpponentGraveyard(prev => [...prev, c]));
        return updated.filter(c => c.currentToughness === undefined || c.currentToughness > 0);
      });

      setPlayerBattlefield(prev => {
        const updated = prev.map(c => {
          if (c.instanceId === attackingCard.instanceId) {
            const currentToughness = c.currentToughness !== undefined ? c.currentToughness : c.toughness;
            const newToughness = currentToughness - defenderPower;
            return { ...c, currentToughness: newToughness, tapped: true };
          }
          return c;
        });
        // Remove dead creatures
        const dead = updated.filter(c => c.currentToughness !== undefined && c.currentToughness <= 0);
        dead.forEach(c => setPlayerGraveyard(prev => [...prev, c]));
        return updated.filter(c => c.currentToughness === undefined || c.currentToughness > 0);
      });
    } else {
      // Opponent is attacking player's creature
      setOpponentBattlefield(opponentBattlefield.map(c => {
        if (c.instanceId === attackingCard.instanceId) {
          return { ...c, tapped: true };
        }
        return c;
      }));

      // Apply damage to both creatures
      setPlayerBattlefield(prev => {
        const updated = prev.map(c => {
          if (c.instanceId === defenderCard.instanceId) {
            const currentToughness = c.currentToughness !== undefined ? c.currentToughness : c.toughness;
            const newToughness = currentToughness - attackerPower;
            return { ...c, currentToughness: newToughness };
          }
          return c;
        });
        // Remove dead creatures
        const dead = updated.filter(c => c.currentToughness !== undefined && c.currentToughness <= 0);
        dead.forEach(c => setPlayerGraveyard(prev => [...prev, c]));
        return updated.filter(c => c.currentToughness === undefined || c.currentToughness > 0);
      });

      setOpponentBattlefield(prev => {
        const updated = prev.map(c => {
          if (c.instanceId === attackingCard.instanceId) {
            const currentToughness = c.currentToughness !== undefined ? c.currentToughness : c.toughness;
            const newToughness = currentToughness - defenderPower;
            return { ...c, currentToughness: newToughness, tapped: true };
          }
          return c;
        });
        // Remove dead creatures
        const dead = updated.filter(c => c.currentToughness !== undefined && c.currentToughness <= 0);
        dead.forEach(c => setOpponentGraveyard(prev => [...prev, c]));
        return updated.filter(c => c.currentToughness === undefined || c.currentToughness > 0);
      });
    }

    // Close modal
    setShowCombatModal(false);
    setAttackingCard(null);
  };

  const attackOpponentDirectly = () => {
    if (!attackingCard) return;

    const attackerPower = attackingCard.power || 0;

    // Tap the attacking creature
    if (isPlayerAttacking) {
      setPlayerBattlefield(playerBattlefield.map(c => {
        if (c.instanceId === attackingCard.instanceId) {
          return { ...c, tapped: true };
        }
        return c;
      }));
      // Deal damage to opponent's life
      setOpponentLife(opponentLife - attackerPower);
    } else {
      setOpponentBattlefield(opponentBattlefield.map(c => {
        if (c.instanceId === attackingCard.instanceId) {
          return { ...c, tapped: true };
        }
        return c;
      }));
      // Deal damage to player's life
      setPlayerLife(playerLife - attackerPower);
    }

    // Close modal
    setShowCombatModal(false);
    setAttackingCard(null);
  };

  const cancelCombat = () => {
    setShowCombatModal(false);
    setAttackingCard(null);
  };

  // End turn functions
  const endPlayerTurn = () => {
    // Untap all player cards and reset creature toughness
    setPlayerBattlefield(playerBattlefield.map(card => ({
      ...card,
      tapped: false,
      currentToughness: card.toughness // Reset to original toughness
    })));
    // Reset mana
    setPlayerMana(0);
    // Opponent draws a card at the beginning of their turn
    if (opponentDeck.length > 0) {
      const card = opponentDeck[0];
      setOpponentHand([...opponentHand, { ...card, instanceId: Date.now() }]);
      setOpponentDeck(opponentDeck.slice(1));
    }
  };

  const endOpponentTurn = () => {
    // Untap all opponent cards and reset creature toughness
    setOpponentBattlefield(opponentBattlefield.map(card => ({
      ...card,
      tapped: false,
      currentToughness: card.toughness // Reset to original toughness
    })));
    // Reset mana
    setOpponentMana(0);
    // Player draws a card at the beginning of their turn
    if (playerDeck.length > 0) {
      const card = playerDeck[0];
      setPlayerHand([...playerHand, { ...card, instanceId: Date.now() }]);
      setPlayerDeck(playerDeck.slice(1));
    }
  };

  // Effect click handler (taps the card for now, will be expanded later)
  const handlePlayerEffectClick = (cardInstanceId, effectIndex) => {
    // For now, just tap the card when an effect is clicked
    tapPlayerCard(cardInstanceId);
  };

  const handleOpponentEffectClick = (cardInstanceId, effectIndex) => {
    // For now, just tap the card when an effect is clicked
    tapOpponentCard(cardInstanceId);
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
          <button className="end-turn-btn" onClick={endOpponentTurn}>
            End Turn
          </button>
          <button onClick={() => setShowOpponentGraveyard(!showOpponentGraveyard)}>
            Graveyard ({opponentGraveyard.length})
          </button>
          <button onClick={() => setShowOpponentExile(!showOpponentExile)}>
            Exile ({opponentExile.length})
          </button>
          <div className="deck-info">Deck: {opponentDeck.length}</div>

          <div className="tracker-group">
            <div className="tracker">
              <span className="tracker-label">Life:</span>
              <button className="tracker-btn" onClick={() => setOpponentLife(opponentLife - 1)}>-</button>
              <span className="tracker-value">{opponentLife}</span>
              <button className="tracker-btn" onClick={() => setOpponentLife(opponentLife + 1)}>+</button>
            </div>
            <div className="tracker">
              <span className="tracker-label">Mana:</span>
              <button className="tracker-btn" onClick={() => setOpponentMana(Math.max(0, opponentMana - 1))}>-</button>
              <span className="tracker-value">{opponentMana}</span>
              <button className="tracker-btn" onClick={() => setOpponentMana(opponentMana + 1)}>+</button>
            </div>
          </div>
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
                isTapped={card.tapped}
                onBattlefield={true}
                onClick={() => tapOpponentCard(card.instanceId)}
                onEffectClick={(effectIndex) => handleOpponentEffectClick(card.instanceId, effectIndex)}
                onRightClick={(e) => {
                  e.preventDefault();
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
                isTapped={card.tapped}
                onBattlefield={true}
                onClick={() => tapPlayerCard(card.instanceId)}
                onEffectClick={(effectIndex) => handlePlayerEffectClick(card.instanceId, effectIndex)}
                onRightClick={(e) => {
                  e.preventDefault();
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
          <button className="end-turn-btn" onClick={endPlayerTurn}>
            End Turn
          </button>
          <button onClick={() => setShowPlayerGraveyard(!showPlayerGraveyard)}>
            Graveyard ({playerGraveyard.length})
          </button>
          <button onClick={() => setShowPlayerExile(!showPlayerExile)}>
            Exile ({playerExile.length})
          </button>
          <div className="deck-info">Deck: {playerDeck.length}</div>

          <div className="tracker-group">
            <div className="tracker">
              <span className="tracker-label">Life:</span>
              <button className="tracker-btn" onClick={() => setPlayerLife(playerLife - 1)}>-</button>
              <span className="tracker-value">{playerLife}</span>
              <button className="tracker-btn" onClick={() => setPlayerLife(playerLife + 1)}>+</button>
            </div>
            <div className="tracker">
              <span className="tracker-label">Mana:</span>
              <button className="tracker-btn" onClick={() => setPlayerMana(Math.max(0, playerMana - 1))}>-</button>
              <span className="tracker-value">{playerMana}</span>
              <button className="tracker-btn" onClick={() => setPlayerMana(playerMana + 1)}>+</button>
            </div>
          </div>
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

      {/* Combat Modal */}
      {showCombatModal && attackingCard && (
        <div className="modal-overlay" onClick={cancelCombat}>
          <div className="modal-content combat-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Combat - Select Target</h3>

            <div className="combat-attacker">
              <h4>Attacking with:</h4>
              <Card card={attackingCard} isSmall />
            </div>

            <div className="combat-targets">
              <h4>Select target:</h4>

              {/* Opponent's creatures (if player attacking) or Player's creatures (if opponent attacking) */}
              <div className="combat-creatures">
                {(isPlayerAttacking ? opponentBattlefield : playerBattlefield)
                  .filter(card => isCreatureCard(card))
                  .map((card, index) => (
                    <div key={index} className="combat-target-card" onClick={() => resolveCombat(card)}>
                      <Card card={card} isSmall />
                    </div>
                  ))
                }
              </div>

              {/* Attack opponent/player directly */}
              <button
                className="attack-directly-btn"
                onClick={attackOpponentDirectly}
              >
                Attack {isPlayerAttacking ? 'Opponent' : 'Player'} Directly ({attackingCard.power} damage)
              </button>
            </div>

            <button className="cancel-combat-btn" onClick={cancelCombat}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
