import React from 'react';
import { Card as CardType } from '../../types/Card';
import { CARD_WIDTH, CARD_HEIGHT } from '../../constants/cards';
import { AudioManager } from '../../utils/AudioManager';

interface CardProps {
    card: CardType;
    selected: boolean;
    onClick: () => void;
}

export const Card: React.FC<CardProps> = ({ card, selected, onClick }) => {
    // Map suit/rank to filename format: "SUIT_RANK.png"
    // Assets are like: CLUBS_2.png, CLUBS_10.png, CLUBS_A.png
    // Suit names in CardType are usually uppercase e.g. 'CLUBS'
    // Rank logic: '2'...'9', '10', 'J', 'Q', 'K', 'A'

    const getCardImageSrc = (card: CardType) => {
        if (card.isJoker) return '/assets/cards/JOKER.png';
        if (card.isBlind) return '/assets/cards/BACK2.png'; // Assuming BACK2 is card back

        let rankStr = card.rank;
        // Verify assumes strict match with filename conventions
        // Filenames: CLUBS_2.png, ... 

        return `/assets/cards/${card.suit}_${rankStr}.png`;
    };

    return (
        <div
            onClick={() => {
                onClick();
            }}
            onMouseEnter={() => {
                // AudioManager.playSFX('/assets/audio/gui/hover.mp3'); 
            }}
            style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                position: 'relative',
                margin: '0 5px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                transform: selected ? 'translateY(-20px)' : 'none',
                filter: selected ? 'drop-shadow(0 0 10px #f1c40f)' : 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
            }}
        >
            {/* Main Card Image */}
            <img
                src={getCardImageSrc(card)}
                alt={`${card.rank} of ${card.suit}`}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px', // Match card border radius if needed
                }}
                onError={(e) => {
                    // Fallback to text if image missing
                    e.currentTarget.style.display = 'none';
                    // We could render the old text UI here if needed, but let's assume assets exist.
                }}
            />

            {/* Banned Overlay */}
            {card.isBanned && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#e74c3c', fontWeight: 'bold', fontSize: '1.2rem',
                    textShadow: '1px 1px 0 #000'
                }}>
                    BANNED
                </div>
            )}

            {/* Blind/Back Overlay checked via isBlind prop, handled by src or explicit overlay */}
            {card.isBlind && !card.isJoker && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: `url('/assets/cards/BACK2.png')`,
                    backgroundSize: 'cover',
                    borderRadius: '8px'
                }} />
            )}
        </div>
    );
};
