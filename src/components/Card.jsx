import React from 'react';
import './Card.css';

const Card = ({ card, onClick, onRightClick, onEffectClick, onKill, isSmall, isTapped, onBattlefield }) => {
  if (!card) return null;

  const handleEffectClick = (e, effectIndex) => {
    if (onBattlefield && onEffectClick) {
      e.stopPropagation();
      onEffectClick(effectIndex);
    }
  };

  const handleKill = (e) => {
    e.stopPropagation();
    if (onKill) {
      onKill();
    }
  };

  // Cards with longer text that need smaller font
  const cardsWithSmallText = [
    'Gurukul Weapons Master',
    'Rani Lakshmibai',
    'Akbar the philosopher king',
    'Tipu Sultan',
    'Mahatma Gandhi'
  ];
  const hasSmallText = cardsWithSmallText.includes(card.name);

  return (
    <div
      className={`card ${isSmall ? 'card-small' : ''} ${isTapped ? 'card-tapped' : ''} ${hasSmallText ? 'card-small-text' : ''} ${card.summoningSickness ? 'card-summoning-sickness' : ''}`}
      onClick={onClick}
      onContextMenu={onRightClick}
    >
      <div className="card-header">
        <div className="card-name">{card.name}</div>
        {card.cost > 0 && <div className="card-cost">{card.cost}</div>}
      </div>

      <div className="card-type">{card.type}</div>

      <div className="card-effects">
        {card.effect1 && (
          <div
            className={`card-effect ${onBattlefield ? 'card-effect-clickable' : ''}`}
            onClick={(e) => handleEffectClick(e, 1)}
          >
            {card.effect1}
          </div>
        )}
        {card.effect2 && (
          <div
            className={`card-effect ${onBattlefield ? 'card-effect-clickable' : ''}`}
            onClick={(e) => handleEffectClick(e, 2)}
          >
            {card.effect2}
          </div>
        )}
        {card.effect3 && (
          <div
            className={`card-effect ${onBattlefield ? 'card-effect-clickable' : ''}`}
            onClick={(e) => handleEffectClick(e, 3)}
          >
            {card.effect3}
          </div>
        )}
        {card.effect4 && (
          <div
            className={`card-effect ${onBattlefield ? 'card-effect-clickable' : ''}`}
            onClick={(e) => handleEffectClick(e, 4)}
          >
            {card.effect4}
          </div>
        )}
        {card.effect5 && (
          <div
            className={`card-effect ${onBattlefield ? 'card-effect-clickable' : ''}`}
            onClick={(e) => handleEffectClick(e, 5)}
          >
            {card.effect5}
          </div>
        )}
      </div>

      {card.flavor && (
        <div className="card-flavor">{card.flavor}</div>
      )}

      {(card.power !== undefined || card.toughness !== undefined) && (
        <div className={`card-stats ${card.currentToughness !== undefined && card.currentToughness < card.toughness ? 'card-stats-damaged' : ''}`}>
          {card.power}/{card.currentToughness !== undefined ? card.currentToughness : card.toughness}
        </div>
      )}

      {onBattlefield && onKill && (
        <button className="card-kill-btn" onClick={handleKill} title="Send to graveyard">
          ✕
        </button>
      )}
    </div>
  );
};

export default Card;
