import React, { useState, useMemo, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '../../state/gameStore';
import { Card as CardComponent } from './Card';
import { Card } from '../../types/Card';
import { calculatePlayerDamage } from '../../logic/damageCalculation';
import { BlockButton } from '../BlockButton';
import { TRANSLATIONS } from '../../constants/translations';
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
    blindIndices,
    bannedIndices,
    tutorialStep,
    tutorialHighlights,
    language
  } = useGameStore();

  const t = TRANSLATIONS[language];

  // Track if gathering animation has started (for two-phase animation)
  const [gatheringStarted, setGatheringStarted] = useState(false);
  const prevGamePhase = useRef(gamePhase);

  // Trigger gathering animation after a frame to allow initial position render
  useEffect(() => {
    if (gamePhase === 'GATHERING' && prevGamePhase.current !== 'GATHERING') {
      // Reset and start gathering animation
      setGatheringStarted(false);
      // Use requestAnimationFrame to ensure DOM has rendered at initial position
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setGatheringStarted(true);
        });
      });
    } else if (gamePhase !== 'GATHERING') {
      setGatheringStarted(false);
    }
    prevGamePhase.current = gamePhase;
  }, [gamePhase]);

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
      return t.UI.WILD;
    }

    const result = calculatePlayerDamage(
      cardsToCalculate.map((c, i) => {
        const originalIdx = selectedCards[i];
        const isBannedIndex = bannedIndices && bannedIndices.includes(originalIdx);
        const isBannedRank = c.rank && bannedRanks.includes(c.rank);
        const isBannedSuit = c.suit && bannedSuit === c.suit;
        return {
          ...c,
          isBanned: !!(isBannedIndex || isBannedRank || isBannedSuit)
        };
      }),
      player.conditions.has('Debilitating'),
      bannedHand,
      bannedRanks,
      bannedSuit
    );

    const damageLabel = hasBlind ? '???' : Math.floor(result.baseDamage);
    const handTypeLabel = result.handType;
    const isBanned = result.baseDamage === 0 && handTypeLabel !== 'High Card';
    const wildSuffix = hasWild ? t.UI.WILD : '';

    if (isBanned && !bannedHand) {
      // If it's BANNED because of cards, show 0 damage with hand name
      return `${t.COMBAT.DAMAGE}: ${damageLabel} ("${handTypeLabel}")${wildSuffix}`;
    }

    if (isBanned) {
      return `${t.COMBAT.BANNED}: ${handTypeLabel}${wildSuffix}`;
    }

    return `${t.COMBAT.DAMAGE}: ${damageLabel} ("${handTypeLabel}")${wildSuffix}`;
  }, [selectedCards, cards, player.conditions, bannedRanks, bannedSuit, bannedHand, bannedIndices, blindIndices, t]);

  const handleCardClick = (index: number) => {
    if (!isInteracting || disabled || !cards[index] || isProcessing) return;
    // Banned check removed in v2.3.6: Player wants to be able to select and attack with banned cards (for 0 score)
    // if (bannedIndices && bannedIndices.includes(index)) return; 
    onSelectCard(index);
  };

  const handleAttack = async () => {
    if (!isInteracting || disabled) return;

    if (selectedCards.length === 0) {
      useGameStore.getState().setMessage(t.COMBAT.SELECT_CARDS);
      return;
    }

    if (onAttack) {
      onAttack(selectedCards);
    }
  };

  const handleSwap = () => {
    if (!isInteracting || disabled) return;

    if (selectedCards.length === 0) {
      useGameStore.getState().setMessage(t.COMBAT.SELECT_SWAP_CARDS);
      return;
    }

    const p = useGameStore.getState().player;
    if ((p.drawsRemaining ?? 0) <= 0) {
      useGameStore.getState().setMessage(t.COMBAT.NO_SWAPS);
      return;
    }

    if (selectedCards.length > 2) {
      useGameStore.getState().setMessage(t.COMBAT.MAX_SWAP);
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
            text={t.UI.ATTACK}
            onClick={handleAttack}
            width="180px"
            disabled={!isInteracting}
          />
        </div>
        <div className="draw-button-wrapper">
          <BlockButton
            text={`${t.UI.SWAP} (${player.drawsRemaining ?? 0})`}
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
          const isBannedItem = !!(bannedIndices && bannedIndices.includes(idx));
          const isBanned = isBannedRank || isBannedSuit || isBannedItem;

          const selectedIdxInQueue = selectedCards.indexOf(idx);
          const isAttacking = ['GATHERING', 'CHARGING', 'THRUSTING', 'SCATTERED'].includes(gamePhase);
          const shouldRenderInPortal = isSelected && isAttacking;

          // Deal logic
          const showDealAnim = !isAttacking;
          const slotX = (idx - 3.5) * 95;
          const deckX = 480;
          const offsetX = deckX - slotX;

          // Calculate viewport center for Portal-rendered cards
          const viewportCenterX = typeof window !== 'undefined' ? window.innerWidth / 2 : 640;
          const viewportCenterY = typeof window !== 'undefined' ? window.innerHeight / 2 : 360;

          // Determine phase-specific styles for Portal cards
          let portalStyle: React.CSSProperties = {};
          if (shouldRenderInPortal) {
            const baseStyle: React.CSSProperties = {
              position: 'fixed',
              width: '80px',
              height: '110px',
              zIndex: 1000 + selectedIdxInQueue,
              left: `${viewportCenterX}px`,
              transform: 'translateX(-50%)',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transitionDelay: `${selectedIdxInQueue * 0.2}s`, // Changed to 0.2s interval
            };

            if (gamePhase === 'GATHERING') {
              // Calculate original card position (where the card slot is)
              // Cards are centered horizontally, each slot is 80px + 10px margin = 90px apart
              // With 8 cards total, center offset calculation
              const cardSlotOffset = (idx - 3.5) * 90; // Distance from center for this card slot
              const originalX = viewportCenterX + cardSlotOffset;
              const originalBottom = 120 + 110; // cards-area bottom (120px from bottom) + approx card height offset

              if (!gatheringStarted) {
                // Phase 1: Render at original position (no transition initially)
                portalStyle = {
                  ...baseStyle,
                  left: `${originalX}px`,
                  bottom: `${originalBottom}px`,
                  top: 'auto',
                  transform: 'translateX(-50%) rotate(0deg)',
                  transition: 'none', // No transition for initial position
                };
              } else {
                // Phase 2: Animate to center with staggered delay
                portalStyle = {
                  ...baseStyle,
                  left: `${viewportCenterX}px`,
                  bottom: '30%',
                  top: 'auto',
                  transform: 'translateX(-50%) rotate(720deg)', // Rotation during flight
                  transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transitionDelay: `${selectedIdxInQueue * 0.2}s`, // 0.2s staggered delay per card
                };
              }
            } else if (gamePhase === 'CHARGING') {
              portalStyle = {
                ...baseStyle,
                top: '65%',
                bottom: 'auto',
                transform: 'translate(-50%, -50%) scale(1.1) rotate(-5deg)',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: '0s', // No delay for charging - all cards move together
                filter: 'brightness(1.4) drop-shadow(0 0 15px #f1c40f)',
              };
            } else if (gamePhase === 'THRUSTING') {
              portalStyle = {
                ...baseStyle,
                top: '15%',
                bottom: 'auto',
                transform: 'translate(-50%, -50%) scale(0.8) rotate(10deg)',
                transition: 'all 0.067s cubic-bezier(0.32, 0, 0.67, 0)', // 1.5x faster (0.1s -> 0.067s)
                transitionDelay: '0s',
              };
            } else if (gamePhase === 'SCATTERED') {
              // Shatter effect: random explosion direction per card
              const shatterAngle = (selectedIdxInQueue * 60) - 90; // Different angle per card
              const shatterDistance = 150 + (selectedIdxInQueue * 30);
              const shatterX = Math.cos(shatterAngle * Math.PI / 180) * shatterDistance;
              const shatterY = Math.sin(shatterAngle * Math.PI / 180) * shatterDistance;

              portalStyle = {
                ...baseStyle,
                top: '15%',
                bottom: 'auto',
                transform: `translate(calc(-50% + ${shatterX}px), calc(-50% + ${shatterY}px)) scale(0.3) rotate(${shatterAngle * 2}deg)`,
                opacity: 0,
                filter: 'brightness(2) contrast(150%)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transitionDelay: `${selectedIdxInQueue * 0.05}s`, // Slight stagger for explosion
                clipPath: 'polygon(0% 0%, 25% 10%, 50% 0%, 75% 15%, 100% 0%, 90% 25%, 100% 50%, 85% 75%, 100% 100%, 70% 90%, 50% 100%, 30% 85%, 0% 100%, 15% 70%, 0% 50%, 10% 25%)', // Jagged edges
              };
            }
          }

          // Render attacking cards via Portal to document.body
          if (shouldRenderInPortal && card) {
            return (
              <React.Fragment key={`slot-${idx}`}>
                {/* Empty slot placeholder */}
                <div className="card-slot" style={{
                  width: '80px',
                  height: '110px',
                  margin: '0 5px',
                  position: 'relative'
                }} />
                {/* Card rendered via Portal */}
                {createPortal(
                  <div style={portalStyle}>
                    <CardComponent
                      card={{ ...card, isBlind, isBanned }}
                      selected={false}
                      onClick={() => { }}
                    />
                  </div>,
                  document.body
                )}
              </React.Fragment>
            );
          }

          // Normal card rendering (not attacking)
          return (
            <div key={`slot-${idx}`} className="card-slot" style={{
              width: '80px',
              height: '110px',
              margin: '0 5px',
              position: 'relative'
            }}>
              {card && (
                <div key={card.id}
                  className={showDealAnim ? 'card-deal' : ''}
                  style={{
                    width: '100%',
                    height: '100%',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'none',
                    ['--deal-offset-x' as any]: `${offsetX}px`,
                    ['--deal-offset-y' as any]: '100px'
                  }}>
                  <CardComponent
                    card={{ ...card, isBlind, isBanned }}
                    selected={isSelected && isInteracting}
                    onClick={() => handleCardClick(idx)}
                  />

                  {/* v2.0.0.21: Tutorial Highlight Markers */}
                  {isInteracting && tutorialHighlights && tutorialHighlights.includes(idx) && (
                    <div className="tutorial-cue-container">
                      <div className="tutorial-text">
                        {Math.abs(tutorialStep) === 7 ? t.UI.JOKER_CUE : [15, 16, 17].includes(Math.abs(tutorialStep)) ? t.UI.BLINDED_CUE : t.UI.CLICK_CUE}
                      </div>
                      <div className="tutorial-arrow" />
                    </div>
                  )}
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

// Memoized CardHand for performance
export default memo(CardHand);
