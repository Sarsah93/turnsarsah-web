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

    const getCardImageSrc = (card: CardType & { isBlind?: boolean }) => {
        if (card.isBlind) return '/assets/cards/BACK2.png';
        if (card.isJoker) return '/assets/cards/JOKER.png';

        let rankStr = card.rank;
        return `/assets/cards/${card.suit}_${rankStr}.png`;
    };

    return (
        <div
            onClick={onClick}
            style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                transform: selected ? 'translateY(-20px)' : 'none',
                filter: selected ? 'drop-shadow(0 0 10px #f1c40f)' : 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
            }}
        >
            {/* Main Card Image */}
            <img
                src={getCardImageSrc(card as any)}
                alt={card.isBlind ? 'Blinded Card' : `${card.rank} of ${card.suit}`}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px',
                    filter: card.isPetrified 
                        ? 'grayscale(1) contrast(1.2) brightness(0.7)' 
                        : 'none',
                    opacity: card.isPetrified ? 0.8 : 1,
                }}
            />

            {/* Petrified Texture & Inset Shadow Overlay */}
            {card.isPetrified && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '8px',
                    pointerEvents: 'none',
                    background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
                    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.6)',
                    zIndex: 2,
                }} />
            )}

            {/* Petrified Text */}
            {card.isPetrified && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#ff3b3b',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    textShadow: '1px 1px 0 #000',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 3,
                    letterSpacing: '1px',
                }}>
                    PETRIFIED
                </div>
            )}

            {/* Banned Overlay */}
            {card.isBanned && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#e74c3c', fontWeight: 'bold', fontSize: '1.5rem',
                    textShadow: '1px 1px 0 #000',
                    zIndex: 4,
                }}>
                    BANNED
                </div>
            )}

            {/* Mudded Overlay */}
            {card.isMudded && (
                <img
                    src="/assets/cards/MUD.png"
                    alt="Mudded"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none',
                        zIndex: 2,
                    }}
                />
            )}
        </div>
    );
};

// Memoized export for better rendering performance
export default React.memo(Card);
