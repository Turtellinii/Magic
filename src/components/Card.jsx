import React from 'react';
import './Card.css';

const Card = ({ card, onClick, isSmall }) => {
  if (!card) return null;

  return (
    <div
      className={`card ${isSmall ? 'card-small' : ''}`}
      onClick={onClick}
    >
      <div className="card-header">
        <div className="card-name">{card.name}</div>
        {card.cost > 0 && <div className="card-cost">{card.cost}</div>}
      </div>

      <div className="card-type">{card.type}</div>

      <div className="card-effects">
        {card.effect1 && <div className="card-effect">{card.effect1}</div>}
        {card.effect2 && <div className="card-effect">{card.effect2}</div>}
        {card.effect3 && <div className="card-effect">{card.effect3}</div>}
      </div>

      {card.flavor && (
        <div className="card-flavor">{card.flavor}</div>
      )}
    </div>
  );
};

export default Card;
