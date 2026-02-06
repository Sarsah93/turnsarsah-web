import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../state/gameStore';
import { Card as CardComponent } from './Card';
import { Card } from '../../types/Card';
import { calculatePlayerDamage } from '../../logic/damageCalculation';
import { BlockButton } from '../BlockButton';
import '../styles/CardHand.css';

interface CardHandProps {
  cards: (Card | null)[];
  selectedCards: number[]; // Controlled
  onSelectCard: (index: number) => void; // Controlled
  onAttack?: (indices: number[]) => void;
  onSwap?: (indices: number[]) => void;
  gamePhase?: string;
  disabled?: boolean;
  isProcessing?: boolean;
  blindIndices?: number[];
}

export const CardHand: React.FC<CardHandProps> = ({
  cards,
  selectedCards,
  onSelectCard,
  onAttack,
  onSwap,
  gamePhase = '',
  disabled = false,
  isProcessing = false
}) => {
  const {
    player,
    bannedRanks,
    bannedSuit,
    bannedHand,
    blindIndices
  } = useGameStore();

  // Selection state is now controlled from parent

  // v2.0.0.8: Master phase comes from gamePhase prop
  const isInteracting = gamePhase === '' || gamePhase === 'NONE' || gamePhase === 'IDLE';

  // Combo / Score Preview (v2.0.0.13)
  const comboPreview = useMemo(() => {
    if (selectedCards.length === 0) return null;

    const cardsToCalculate = selectedCards
      .map(idx => cards[idx])
      .filter((c): c is Card => c !== null);

    if (cardsToCalculate.length === 0) return null;

    const hasBlind = selectedCards.some(idx => !!blindIndices.includes(idx));
    const hasWild = cardsToCalculate.some(card => card.isJoker);

    if (selectedCards.length === 1 && hasWild) {
      return `(WILD)`;
    }

    const result = calculatePlayerDamage(
      cardsToCalculate,
      player.conditions.has('Debilitating'),
      bannedHand,
      bannedRanks,
      bannedSuit
    );

    const damageLabel = hasBlind ? '???' : Math.floor(result.baseDamage);
    const handTypeLabel = result.handType;
    const isBanned = result.baseDamage === 0 && handTypeLabel !== 'High Card';

    if (isBanned) {
      return `BANNED: ${handTypeLabel}${hasWild ? ' (WILD)' : ''}`;
    }

    return `DAMAGE: ${damageLabel} ("${handTypeLabel}")${hasWild ? ' (WILD)' : ''}`;
  }, [selectedCards, cards, player.conditions, bannedRanks, bannedSuit, bannedHand, blindIndices]);

  const handleCardClick = (index: number) => {
    if (!isInteracting || disabled || !cards[index] || isProcessing) return;
    onSelectCard(index);
  };

  const handleAttack = async () => {
    if (!isInteracting || disabled) return;

    if (selectedCards.length === 0) {
      useGameStore.getState().setMessage("SELECT CARDS!");
      return;
    }

    if (onAttack) {
      onAttack(selectedCards);
    }
  };

  const handleSwap = () => {
    if (!isInteracting || disabled) return;

    if (selectedCards.length === 0) {
      useGameStore.getState().setMessage("SELECT CARDS TO SWAP!");
      return;
    }

    const p = useGameStore.getState().player;
    if ((p.drawsRemaining ?? 0) <= 0) {
      useGameStore.getState().setMessage("NO SWAPS REMAINING!");
      return;
    }

    if (selectedCards.length > 5) {
      useGameStore.getState().setMessage("MAX 5 CARDS CAN BE SWAPPED!");
      return;
    }

    if (onSwap) {
      onSwap(selectedCards);
    }
  };

  return (
    <div className="card-hand-container">
      {comboPreview && isInteracting && (
        <div className="combo-preview" style={{ color: comboPreview.startsWith('BANNED') ? '#e74c3c' : '#f1c40f' }}>
          {comboPreview}
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <div className="attack-button-wrapper">
          <BlockButton
            text="ATTACK"
            onClick={handleAttack}
            width="180px"
            disabled={!isInteracting}
          />
        </div>
        <div className="draw-button-wrapper">
          <BlockButton
            text={`SWAP (${player.drawsRemaining ?? 0})`}
            onClick={handleSwap}
            width="180px"
            disabled={!isInteracting || (player.drawsRemaining ?? 0) <= 0}
          />
        </div>
      </div>

      {/* Cards Area */}
      <div className="cards-area">
        {cards.map((card, idx) => {
          const isSelected = selectedCards.includes(idx);
          const isBlind = card ? !!blindIndices.includes(idx) : false;
          const isBannedRank = !!(card && card.rank && bannedRanks.includes(card.rank));
          const isBannedSuit = !!(card && card.suit && card.suit === bannedSuit);
          const isBanned = isBannedRank || isBannedSuit;

          const selectedIdxInQueue = selectedCards.indexOf(idx);

          let phaseClass = '';
          let phaseStyle: React.CSSProperties = {};
          const isAttacking = ['GATHERING', 'CHARGING', 'THRUSTING', 'SCATTERED'].includes(gamePhase);

          if (isSelected) {
            if (gamePhase === 'GATHERING') {
              phaseClass = 'gathering';
              // Staggered delay: 0.1s per card from left to right
              phaseStyle.transitionDelay = `${selectedIdxInQueue * 0.1}s`;
            }
            else if (gamePhase === 'CHARGING') phaseClass = 'charging';
            else if (gamePhase === 'THRUSTING') phaseClass = 'thrusting';
            else if (gamePhase === 'SCATTERED') phaseClass = 'scattering';
          }

          // Deal logic
          const showDealAnim = !isAttacking;
          const slotX = (idx - 3.5) * 95;
          const deckX = 480;
          const offsetX = deckX - slotX;

          return (
            <div key={`slot-${idx}`} className="card-slot" style={{
              width: '80px',
              height: '110px',
              margin: '0 5px',
              position: 'relative'
            }}>
              {card && (
                <div key={card.id}
                  className={`${phaseClass} ${showDealAnim ? 'card-deal' : ''}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    // Only apply inline transition when NOT attacking; CSS classes handle attack transitions
                    ...(isAttacking ? {} : { transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: 'none' }),
                    ...phaseStyle,
                    ['--deal-offset-x' as any]: `${offsetX}px`,
                    ['--deal-offset-y' as any]: '100px'
                  }}>
                  <CardComponent
                    card={{ ...card, isBlind, isBanned }}
                    selected={isSelected && isInteracting}
                    onClick={() => handleCardClick(idx)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Deck Stack */}
      <div className="card-deck-section" style={{ position: 'absolute', bottom: '120px', right: '40px', width: '90px', height: '120px', zIndex: 10 }}>
        <div className="card-deck-stack" style={{ position: 'relative', width: '100%', height: '100%' }}>
          {[0, 1, 2, 3].map(i => (
            <img
              key={i}
              src="/assets/cards/BACK2.png"
              alt="Deck"
              className="deck-card-image"
              style={{
                position: 'absolute',
                top: `${-i * 2}px`,
                right: `${i * 1}px`,
                width: '80px',
                height: '110px',
                zIndex: 10 - i,
                boxShadow: '-2px 2px 4px rgba(0,0,0,0.5)',
                borderRadius: '4px'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardHand;
