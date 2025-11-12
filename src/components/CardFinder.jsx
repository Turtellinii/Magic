import React, { useState } from 'react';
import Card from './Card';
import './CardFinder.css';

const CardFinder = ({ deck, onAddToPlayerHand, onAddToOpponentHand }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  const filteredCards = deck.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique cards for display
  const uniqueCards = [];
  const seenNames = new Set();

  for (const card of filteredCards) {
    if (!seenNames.has(card.name)) {
      uniqueCards.push(card);
      seenNames.add(card.name);
    }
  }

  return (
    <div className="card-finder">
      <h3>Card Finder</h3>
      <input
        type="text"
        placeholder="Search cards..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <div className="finder-content">
        <div className="card-list">
          {uniqueCards.map((card, index) => (
            <div
              key={index}
              className={`card-list-item ${selectedCard?.id === card.id ? 'selected' : ''}`}
              onClick={() => setSelectedCard(card)}
            >
              <strong>{card.name}</strong>
              <div className="card-type-small">{card.type}</div>
            </div>
          ))}
        </div>

        <div className="card-preview">
          {selectedCard ? (
            <>
              <Card card={selectedCard} />
              <div className="action-buttons">
                <button
                  className="add-btn player-btn"
                  onClick={() => {
                    onAddToPlayerHand(selectedCard);
                    setSelectedCard(null);
                  }}
                >
                  Add to Player Hand
                </button>
                <button
                  className="add-btn opponent-btn"
                  onClick={() => {
                    onAddToOpponentHand(selectedCard);
                    setSelectedCard(null);
                  }}
                >
                  Add to Opponent Hand
                </button>
              </div>
            </>
          ) : (
            <div className="preview-placeholder">
              Select a card to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardFinder;
