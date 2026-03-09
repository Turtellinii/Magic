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

  // Turn tracking
  const [currentTurn, setCurrentTurn] = useState('player'); // 'player' or 'opponent'

  // Card effect state
  const [playerCreatureDiedThisTurn, setPlayerCreatureDiedThisTurn] = useState(false);
  const [opponentCreatureDiedThisTurn, setOpponentCreatureDiedThisTurn] = useState(false);
  const [playerNextCreatureHasHaste, setPlayerNextCreatureHasHaste] = useState(false);
  const [opponentNextCreatureHasHaste, setOpponentNextCreatureHasHaste] = useState(false);
  const [playerEffectsUsed, setPlayerEffectsUsed] = useState({}); // Track once-per-game effects by card instanceId
  const [opponentEffectsUsed, setOpponentEffectsUsed] = useState({});
  const [playerDelayedEffects, setPlayerDelayedEffects] = useState([]); // [{card, turnsRemaining, action}]
  const [opponentDelayedEffects, setOpponentDelayedEffects] = useState([]);

  // Effect activation modals
  const [showEffectModal, setShowEffectModal] = useState(false);
  const [effectModalType, setEffectModalType] = useState(''); // 'varanasi-exile', 'himalayas-sacrifice', 'rameswaram-exile'
  const [effectSourceCard, setEffectSourceCard] = useState(null);
  const [effectIsPlayer, setEffectIsPlayer] = useState(true);

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

    // Check for Rameswaram Bridge ETB effect
    if (card.name === 'Rameswaram Bridge (a.k.a. Ram Setu)') {
      setPlayerNextCreatureHasHaste(true);
    }

    // Play the card - add summoning sickness to creatures without Haste
    const isCreature = isCreatureCard(card);
    const hasHasteAbility = hasHaste(card) || (isCreature && playerNextCreatureHasHaste);
    const cardWithState = {
      ...card,
      tapped: false,
      summoningSickness: isCreature && !hasHasteAbility
    };

    // If creature was given haste from Rameswaram Bridge, reset the flag
    if (isCreature && playerNextCreatureHasHaste) {
      setPlayerNextCreatureHasHaste(false);
    }

    setPlayerBattlefield([...playerBattlefield, cardWithState]);
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

    // Check for Rameswaram Bridge ETB effect
    if (card.name === 'Rameswaram Bridge (a.k.a. Ram Setu)') {
      setOpponentNextCreatureHasHaste(true);
    }

    // Play the card - add summoning sickness to creatures without Haste
    const isCreature = isCreatureCard(card);
    const hasHasteAbility = hasHaste(card) || (isCreature && opponentNextCreatureHasHaste);
    const cardWithState = {
      ...card,
      tapped: false,
      summoningSickness: isCreature && !hasHasteAbility
    };

    // If creature was given haste from Rameswaram Bridge, reset the flag
    if (isCreature && opponentNextCreatureHasHaste) {
      setOpponentNextCreatureHasHaste(false);
    }

    setOpponentBattlefield([...opponentBattlefield, cardWithState]);
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

  // Check if a card has Haste
  const hasHaste = (card) => {
    const effects = [card.effect1, card.effect2, card.effect3, card.effect4, card.effect5];
    return effects.some(effect => effect && effect.toLowerCase().includes('haste'));
  };

  // Tap/untap card functions
  const tapPlayerCard = (cardInstanceId) => {
    const card = playerBattlefield.find(c => c.instanceId === cardInstanceId);
    if (!card || card.tapped) return;

    // Check for summoning sickness
    if (card.summoningSickness) {
      alert('This creature has summoning sickness and cannot be used this turn!');
      return;
    }

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
          // Varanasi, Eternal City: If a creature died this turn, add 2 mana instead of 1
          if (c.name === 'Varanasi, Eternal City' && playerCreatureDiedThisTurn) {
            setPlayerMana(playerMana + 2);
          } else {
            setPlayerMana(playerMana + 1);
          }
        }
        return { ...c, tapped: true };
      }
      return c;
    }));
  };

  const tapOpponentCard = (cardInstanceId) => {
    const card = opponentBattlefield.find(c => c.instanceId === cardInstanceId);
    if (!card || card.tapped) return;

    // Check for summoning sickness
    if (card.summoningSickness) {
      alert('This creature has summoning sickness and cannot be used this turn!');
      return;
    }

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
          // Varanasi, Eternal City: If a creature died this turn, add 2 mana instead of 1
          if (c.name === 'Varanasi, Eternal City' && opponentCreatureDiedThisTurn) {
            setOpponentMana(opponentMana + 2);
          } else {
            setOpponentMana(opponentMana + 1);
          }
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
    let playerCreatureDied = false;
    let opponentCreatureDied = false;
    let playerVaranasiBonusGiven = false;

    if (isPlayerAttacking) {
      // Player is attacking opponent's creature
      let deadDefenders = [];
      let deadAttackers = [];

      // Apply damage to defender
      setOpponentBattlefield(prev => {
        const updated = prev.map(c => {
          if (c.instanceId === defenderCard.instanceId) {
            const currentToughness = c.currentToughness !== undefined ? c.currentToughness : c.toughness;
            const newToughness = currentToughness - attackerPower;
            return { ...c, currentToughness: newToughness };
          }
          return c;
        });
        // Collect dead creatures
        deadDefenders = updated.filter(c => c.currentToughness !== undefined && c.currentToughness <= 0);
        if (deadDefenders.length > 0) {
          setOpponentGraveyard(prevGrave => [...prevGrave, ...deadDefenders]);
          opponentCreatureDied = true;
          setOpponentCreatureDiedThisTurn(true);
        }
        return updated.filter(c => c.currentToughness === undefined || c.currentToughness > 0);
      });

      // Apply damage to attacker
      setPlayerBattlefield(prev => {
        const updated = prev.map(c => {
          if (c.instanceId === attackingCard.instanceId) {
            const currentToughness = c.currentToughness !== undefined ? c.currentToughness : c.toughness;
            const newToughness = currentToughness - defenderPower;
            return { ...c, currentToughness: newToughness, tapped: true };
          }
          return c;
        });
        // Collect dead creatures
        deadAttackers = updated.filter(c => c.currentToughness !== undefined && c.currentToughness <= 0);
        if (deadAttackers.length > 0) {
          setPlayerGraveyard(prevGrave => [...prevGrave, ...deadAttackers]);
          playerCreatureDied = true;
          setPlayerCreatureDiedThisTurn(true);
          // If player creature died and Varanasi is already tapped, give 1 mana (only once per combat)
          if (!playerVaranasiBonusGiven) {
            const varanasi = playerBattlefield.find(c => c.name === 'Varanasi, Eternal City' && c.tapped);
            if (varanasi) {
              setPlayerMana(prevMana => prevMana + 1);
              playerVaranasiBonusGiven = true;
            }
          }
        }
        return updated.filter(c => c.currentToughness === undefined || c.currentToughness > 0);
      });
    } else {
      // Opponent is attacking player's creature
      let deadDefenders = [];
      let deadAttackers = [];

      // Apply damage to defender
      setPlayerBattlefield(prev => {
        const updated = prev.map(c => {
          if (c.instanceId === defenderCard.instanceId) {
            const currentToughness = c.currentToughness !== undefined ? c.currentToughness : c.toughness;
            const newToughness = currentToughness - attackerPower;
            return { ...c, currentToughness: newToughness };
          }
          return c;
        });
        // Collect dead creatures
        deadDefenders = updated.filter(c => c.currentToughness !== undefined && c.currentToughness <= 0);
        if (deadDefenders.length > 0) {
          setPlayerGraveyard(prevGrave => [...prevGrave, ...deadDefenders]);
          playerCreatureDied = true;
          setPlayerCreatureDiedThisTurn(true);
          // If player creature died and Varanasi is already tapped, give 1 mana (only once per combat)
          if (!playerVaranasiBonusGiven) {
            const varanasi = playerBattlefield.find(c => c.name === 'Varanasi, Eternal City' && c.tapped);
            if (varanasi) {
              setPlayerMana(prevMana => prevMana + 1);
              playerVaranasiBonusGiven = true;
            }
          }
        }
        return updated.filter(c => c.currentToughness === undefined || c.currentToughness > 0);
      });

      // Apply damage to attacker
      setOpponentBattlefield(prev => {
        const updated = prev.map(c => {
          if (c.instanceId === attackingCard.instanceId) {
            const currentToughness = c.currentToughness !== undefined ? c.currentToughness : c.toughness;
            const newToughness = currentToughness - defenderPower;
            return { ...c, currentToughness: newToughness, tapped: true };
          }
          return c;
        });
        // Collect dead creatures
        deadAttackers = updated.filter(c => c.currentToughness !== undefined && c.currentToughness <= 0);
        if (deadAttackers.length > 0) {
          setOpponentGraveyard(prevGrave => [...prevGrave, ...deadAttackers]);
          opponentCreatureDied = true;
          setOpponentCreatureDiedThisTurn(true);
          // If opponent creature died and Varanasi is already tapped, give 1 mana
          const varanasi = opponentBattlefield.find(c => c.name === 'Varanasi, Eternal City' && c.tapped);
          if (varanasi) {
            setOpponentMana(prevMana => prevMana + 1);
          }
        }
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
    // Untap all player cards, reset creature toughness, and remove summoning sickness
    setPlayerBattlefield(playerBattlefield.map(card => ({
      ...card,
      tapped: false,
      currentToughness: card.toughness, // Reset to original toughness
      summoningSickness: false // Remove summoning sickness
    })));
    // Reset mana
    setPlayerMana(0);
    // Reset creature died flag
    setPlayerCreatureDiedThisTurn(false);
    // Process delayed effects
    const updatedEffects = playerDelayedEffects.map(effect => ({
      ...effect,
      turnsRemaining: effect.turnsRemaining - 1
    }));
    const effectsToTrigger = updatedEffects.filter(effect => effect.turnsRemaining === 0);

    // Update delayed effects list (remove triggered effects)
    setPlayerDelayedEffects(updatedEffects.filter(effect => effect.turnsRemaining > 0));

    // Execute triggered effects
    effectsToTrigger.forEach(effect => {
      if (effect.action === 'return-to-battlefield') {
        setPlayerBattlefield(prevBf => [...prevBf, { ...effect.card, instanceId: Date.now() }]);
        setPlayerExile(prevExile => prevExile.filter(c => c.instanceId !== effect.card.instanceId));
      }
    });
    // Opponent draws a card at the beginning of their turn
    if (opponentDeck.length > 0) {
      const card = opponentDeck[0];
      setOpponentHand([...opponentHand, { ...card, instanceId: Date.now() }]);
      setOpponentDeck(opponentDeck.slice(1));
    }
    // Switch to opponent's turn
    setCurrentTurn('opponent');
  };

  const endOpponentTurn = () => {
    // Untap all opponent cards, reset creature toughness, and remove summoning sickness
    setOpponentBattlefield(opponentBattlefield.map(card => ({
      ...card,
      tapped: false,
      currentToughness: card.toughness, // Reset to original toughness
      summoningSickness: false // Remove summoning sickness
    })));
    // Reset mana
    setOpponentMana(0);
    // Reset creature died flag
    setOpponentCreatureDiedThisTurn(false);
    // Process delayed effects
    const updatedEffects = opponentDelayedEffects.map(effect => ({
      ...effect,
      turnsRemaining: effect.turnsRemaining - 1
    }));
    const effectsToTrigger = updatedEffects.filter(effect => effect.turnsRemaining === 0);

    // Update delayed effects list (remove triggered effects)
    setOpponentDelayedEffects(updatedEffects.filter(effect => effect.turnsRemaining > 0));

    // Execute triggered effects
    effectsToTrigger.forEach(effect => {
      if (effect.action === 'return-to-battlefield') {
        setOpponentBattlefield(prevBf => [...prevBf, { ...effect.card, instanceId: Date.now() }]);
        setOpponentExile(prevExile => prevExile.filter(c => c.instanceId !== effect.card.instanceId));
      }
    });
    // Player draws a card at the beginning of their turn
    if (playerDeck.length > 0) {
      const card = playerDeck[0];
      setPlayerHand([...playerHand, { ...card, instanceId: Date.now() }]);
      setPlayerDeck(playerDeck.slice(1));
    }
    // Switch to player's turn
    setCurrentTurn('player');
  };

  // Card-specific effect handlers
  const handleVaranasiExile = (card, isPlayer) => {
    // Check if effect has been used
    const effectsUsed = isPlayer ? playerEffectsUsed : opponentEffectsUsed;
    const effectKey = `${card.instanceId}_varanasi_exile`;

    if (effectsUsed[effectKey]) {
      alert('Effect already used!');
      return;
    }

    // Open modal to select graveyard card
    setEffectSourceCard(card);
    setEffectIsPlayer(isPlayer);
    setEffectModalType('varanasi-exile');
    setShowEffectModal(true);
  };

  const handleHimalayasSacrifice = (card, isPlayer) => {
    // Open modal to select creature to sacrifice
    setEffectSourceCard(card);
    setEffectIsPlayer(isPlayer);
    setEffectModalType('himalayas-sacrifice');
    setShowEffectModal(true);
  };

  const handleRameswaramExile = (card, isPlayer) => {
    // Open modal to select opponent's artifact or creature
    setEffectSourceCard(card);
    setEffectIsPlayer(isPlayer);
    setEffectModalType('rameswaram-exile');
    setShowEffectModal(true);
  };

  // Effect click handler
  const handlePlayerEffectClick = (cardInstanceId, effectIndex) => {
    const card = playerBattlefield.find(c => c.instanceId === cardInstanceId);
    if (!card) return;

    // Route to specific card effect handler
    if (card.name === 'Varanasi, Eternal City' && effectIndex === 3) {
      handleVaranasiExile(card, true);
    } else if (card.name === 'Himalayas, Throne of the Gods' && effectIndex === 2) {
      handleHimalayasSacrifice(card, true);
    } else if (card.name === 'Rameswaram Bridge (a.k.a. Ram Setu)' && effectIndex === 3) {
      handleRameswaramExile(card, true);
    } else {
      // Default: just tap the card
      tapPlayerCard(cardInstanceId);
    }
  };

  const handleOpponentEffectClick = (cardInstanceId, effectIndex) => {
    const card = opponentBattlefield.find(c => c.instanceId === cardInstanceId);
    if (!card) return;

    // Route to specific card effect handler
    if (card.name === 'Varanasi, Eternal City' && effectIndex === 3) {
      handleVaranasiExile(card, false);
    } else if (card.name === 'Himalayas, Throne of the Gods' && effectIndex === 2) {
      handleHimalayasSacrifice(card, false);
    } else if (card.name === 'Rameswaram Bridge (a.k.a. Ram Setu)' && effectIndex === 3) {
      handleRameswaramExile(card, false);
    } else {
      // Default: just tap the card
      tapOpponentCard(cardInstanceId);
    }
  };

  // Effect completion handlers
  const completeVaranasiExile = (selectedCard) => {
    if (!effectSourceCard) return;

    const isPlayer = effectIsPlayer;
    const graveyard = isPlayer ? playerGraveyard : opponentGraveyard;
    const setGraveyard = isPlayer ? setPlayerGraveyard : setOpponentGraveyard;
    const setExile = isPlayer ? setPlayerExile : setOpponentExile;
    const setHand = isPlayer ? setPlayerHand : setOpponentHand;
    const hand = isPlayer ? playerHand : opponentHand;
    const setLife = isPlayer ? setPlayerLife : setOpponentLife;
    const life = isPlayer ? playerLife : opponentLife;
    const deck = isPlayer ? playerDeck : opponentDeck;
    const setDeck = isPlayer ? setPlayerDeck : setOpponentDeck;
    const setEffectsUsed = isPlayer ? setPlayerEffectsUsed : setOpponentEffectsUsed;
    const battlefield = isPlayer ? playerBattlefield : opponentBattlefield;
    const setBattlefield = isPlayer ? setPlayerBattlefield : setOpponentBattlefield;

    // Move card from graveyard to exile
    setGraveyard(graveyard.filter(c => c.instanceId !== selectedCard.instanceId));
    setExile(prev => [...prev, selectedCard]);

    // Draw a card
    if (deck.length > 0) {
      const newCard = deck[0];
      setHand([...hand, { ...newCard, instanceId: Date.now() }]);
      setDeck(deck.slice(1));
    }

    // Gain 3 life
    setLife(life + 3);

    // Mark effect as used
    const effectKey = `${effectSourceCard.instanceId}_varanasi_exile`;
    setEffectsUsed(prev => ({ ...prev, [effectKey]: true }));

    // Tap the card
    setBattlefield(battlefield.map(c =>
      c.instanceId === effectSourceCard.instanceId ? { ...c, tapped: true } : c
    ));

    // Close modal
    setShowEffectModal(false);
    setEffectSourceCard(null);
  };

  const completeHimalayasSacrifice = (selectedCreature) => {
    if (!effectSourceCard) return;

    const isPlayer = effectIsPlayer;
    const battlefield = isPlayer ? playerBattlefield : opponentBattlefield;
    const setBattlefield = isPlayer ? setPlayerBattlefield : setOpponentBattlefield;
    const setGraveyard = isPlayer ? setPlayerGraveyard : setOpponentGraveyard;
    const graveyard = isPlayer ? playerGraveyard : opponentGraveyard;
    const deck = isPlayer ? playerDeck : opponentDeck;
    const setDeck = isPlayer ? setPlayerDeck : setOpponentDeck;
    const setHand = isPlayer ? setPlayerHand : setOpponentHand;
    const hand = isPlayer ? playerHand : opponentHand;

    // Move creature to graveyard
    setBattlefield(battlefield.filter(c => c.instanceId !== selectedCreature.instanceId));
    setGraveyard([...graveyard, selectedCreature]);

    // Search deck for Spirit or God creature
    const spiritOrGod = deck.find(c => {
      const type = (c.type || '').toLowerCase();
      return (type.includes('creature') && (type.includes('spirit') || type.includes('god')));
    });

    if (spiritOrGod) {
      // Add to hand
      setHand([...hand, { ...spiritOrGod, instanceId: Date.now() }]);
      // Remove from deck
      setDeck(deck.filter(c => c.id !== spiritOrGod.id));
    } else {
      alert('No Spirit or God creature found in deck!');
    }

    // Tap and sacrifice Himalayas
    setBattlefield(prev => prev.filter(c => c.instanceId !== effectSourceCard.instanceId));
    setGraveyard(prev => [...prev, effectSourceCard]);

    // Close modal
    setShowEffectModal(false);
    setEffectSourceCard(null);
  };

  const completeRameswaramExile = (selectedCard) => {
    if (!effectSourceCard) return;

    const isPlayer = effectIsPlayer;
    const opponentBf = isPlayer ? opponentBattlefield : playerBattlefield;
    const setOpponentBf = isPlayer ? setOpponentBattlefield : setPlayerBattlefield;
    const battlefield = isPlayer ? playerBattlefield : opponentBattlefield;
    const setBattlefield = isPlayer ? setPlayerBattlefield : setOpponentBattlefield;
    const setGraveyard = isPlayer ? setPlayerGraveyard : setOpponentGraveyard;
    const graveyard = isPlayer ? playerGraveyard : opponentGraveyard;
    const setExile = isPlayer ? setPlayerExile : setOpponentExile;
    const setDelayedEffects = isPlayer ? setPlayerDelayedEffects : setOpponentDelayedEffects;

    // Remove target from opponent's battlefield and exile it
    setOpponentBf(opponentBf.filter(c => c.instanceId !== selectedCard.instanceId));
    setExile(prev => [...prev, selectedCard]);

    // Sacrifice Rameswaram Bridge
    setBattlefield(battlefield.filter(c => c.instanceId !== effectSourceCard.instanceId));
    setGraveyard([...graveyard, effectSourceCard]);

    // Add delayed effect to return card after 2 turns
    setDelayedEffects(prev => [...prev, {
      card: selectedCard,
      turnsRemaining: 2,
      action: 'return-to-battlefield'
    }]);

    // Close modal
    setShowEffectModal(false);
    setEffectSourceCard(null);
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
          <button
            className="end-turn-btn"
            onClick={endOpponentTurn}
            disabled={currentTurn !== 'opponent'}
          >
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
                onKill={() => {
                  const originalIndex = opponentBattlefield.findIndex(c => c.instanceId === card.instanceId);
                  moveOpponentCardToGraveyard(originalIndex, 'battlefield');
                }}
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
                onKill={() => {
                  const originalIndex = playerBattlefield.findIndex(c => c.instanceId === card.instanceId);
                  movePlayerCardToGraveyard(originalIndex, 'battlefield');
                }}
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
          <button
            className="end-turn-btn"
            onClick={endPlayerTurn}
            disabled={currentTurn !== 'player'}
          >
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

      {/* Effect Modals */}
      {showEffectModal && (
        <div className="modal-overlay" onClick={() => setShowEffectModal(false)}>
          <div className="modal-content effect-modal" onClick={(e) => e.stopPropagation()}>
            {effectModalType === 'varanasi-exile' && (
              <>
                <h3>Varanasi, Eternal City - Exile Card from Graveyard</h3>
                <p>Select a card from your graveyard to exile. You will draw a card and gain 3 life.</p>
                <div className="card-grid">
                  {(effectIsPlayer ? playerGraveyard : opponentGraveyard).map((card, index) => (
                    <div key={index} className="selectable-card" onClick={() => completeVaranasiExile(card)}>
                      <Card card={card} isSmall />
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowEffectModal(false)}>Cancel</button>
              </>
            )}

            {effectModalType === 'himalayas-sacrifice' && (
              <>
                <h3>Himalayas, Throne of the Gods - Sacrifice Creature</h3>
                <p>Select a creature to sacrifice. You will search your deck for a Spirit or God creature.</p>
                <div className="card-grid">
                  {(effectIsPlayer ? playerBattlefield : opponentBattlefield)
                    .filter(card => isCreatureCard(card))
                    .map((card, index) => (
                      <div key={index} className="selectable-card" onClick={() => completeHimalayasSacrifice(card)}>
                        <Card card={card} isSmall />
                      </div>
                    ))
                  }
                </div>
                <button onClick={() => setShowEffectModal(false)}>Cancel</button>
              </>
            )}

            {effectModalType === 'rameswaram-exile' && (
              <>
                <h3>Rameswaram Bridge - Exile Target</h3>
                <p>Select an opponent's artifact or creature to exile. It will return to your battlefield after 2 turns.</p>
                <div className="card-grid">
                  {(effectIsPlayer ? opponentBattlefield : playerBattlefield)
                    .filter(card => {
                      const type = (card.type || '').toLowerCase();
                      return type.includes('artifact') || type.includes('creature');
                    })
                    .map((card, index) => (
                      <div key={index} className="selectable-card" onClick={() => completeRameswaramExile(card)}>
                        <Card card={card} isSmall />
                      </div>
                    ))
                  }
                </div>
                <button onClick={() => setShowEffectModal(false)}>Cancel</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
