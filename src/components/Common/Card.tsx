// components/Common/Card.tsx

import React from 'react';
import { Card as CardType, CardFactory } from '../../types/Card';
import '../styles/Card.css';

interface CardProps {
  card: CardType;
  selected?: boolean;
  banned?: boolean;
  blind?: boolean;
  onClick?: () => void;
  index?: number;
}

export const Card: React.FC<CardProps> = ({
  card,
  selected = false,
  banned = false,
  blind = false,
  onClick,
  index,
}) => {
  // Build image path for card
  let imagePath = '/assets/cards/';
  if (blind) {
    imagePath += 'BACK2.png';
  } else if (card.isJoker) {
    imagePath += 'JOKER.png';
  } else {
    // Format: SUIT_RANK.png (e.g., SPADES_A.png)
    const suit = (card.suit || 'SPADES').toUpperCase();
    const rank = (card.rank || '2').toUpperCase();
    // Handle HEARTS vs HEART naming
    const suitName = suit === 'HEARTS' ? 'HEARTS' : suit === 'HEART' ? 'HEARTS' : suit === 'DIAMONDS' ? 'DIAMONDS' : suit === 'CLUBS' ? 'CLUBS' : suit === 'SPADES' ? 'SPADES' : suit;
    imagePath += `${suitName}_${rank}.png`;
  }

  return (
    <div
      className={`card ${selected ? 'card-selected' : ''} ${banned ? 'card-banned' : ''} ${blind ? 'card-blind' : ''}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transform: selected ? 'translateY(-25px)' : 'translateY(0)',
      }}
    >
      <img src={imagePath} alt={blind ? 'Back' : `${card.suit} ${card.rank}`} className="card-image" />
      {banned && <div className="card-ban-overlay">✕</div>}
    </div>
  );
};
