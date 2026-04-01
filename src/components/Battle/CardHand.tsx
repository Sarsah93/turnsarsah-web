import React, { useState, useMemo, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '../../state/gameStore';
import { Card as CardComponent } from './Card';
import { Card } from '../../types/Card';
import { calculatePlayerDamage } from '../../logic/damageCalculation';
import { BlockButton } from '../BlockButton';
import { TRANSLATIONS } from '../../constants/translations';
import { RANK_VALUES } from '../../constants/cards';
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
  bossCenterX?: number;
  bossCenterY?: number;
  scorePreviewPos?: { x: number; y: number };
  onMeasureCards?: (data: { topCenterX: number; topCenterY: number }) => void;
}

export const CardHand: React.FC<CardHandProps> = ({
  cards,
  selectedCards,
  onSelectCard,
  onAttack,
  onSwap,
  gamePhase = '',
  disabled = false,
  isProcessing = false,
  bossCenterX = 800,
  bossCenterY = 285,
  scorePreviewPos = { x: 800, y: 380 },
  onMeasureCards
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
    language,
    chapterNum,
    stageNum,
    puzzleTarget,
    hydraReviveRemaining,
    lizardKingStraightCount,
    lizardStemCellDestroyed
  } = useGameStore();

  const t = TRANSLATIONS[language];
  const [afterimages, setAfterimages] = useState<{ id: number; x: number; y: number; card: Card }[]>([]);

  // Track if gathering animation has started (for two-phase animation)
  const [gatheringStarted, setGatheringStarted] = useState(false);
  const prevGamePhase = useRef(gamePhase);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  // v2.4.7: Scale-Aware Measurement
  const lastMeasuredB = useRef({ topCenterX: 0, topCenterY: 0 });

  // v2.3.2: Sphinx Puzzle Logic
  const selectionSum = useMemo(() => {
    if (chapterNum !== '2A' || stageNum !== 10) return 0;
    return selectedCards.reduce((acc, idx) => {
      const card = cards[idx];
      if (!card) return acc;
      if (card.isJoker) return acc + 14;
      if (card.rank === 'A') return acc + 1;
      const rank = card.rank;
      return acc + (rank ? (RANK_VALUES[rank] || 0) : 0);
    }, 0);
  }, [selectedCards, cards, chapterNum, stageNum]);

  const isPuzzleCorrect = chapterNum === '2A' && stageNum === 10 && selectedCards.length === 5 && selectionSum === puzzleTarget;

  const measureCards = React.useCallback(() => {
    // ... existing measureCards logic
    if (!onMeasureCards) return;
    // ... (rest of the existing measureCards logic)

    // Indices 3 and 4 are 4th and 5th cards
    const slot4 = slotRefs.current[3];
    const slot5 = slotRefs.current[4];
    const container = document.querySelector('.battle-screen');

    if (slot4 && slot5 && container) {
      const cRect = container.getBoundingClientRect();
      const currentScale = cRect.width / 1600;
      const r4 = slot4.getBoundingClientRect();
      const r5 = slot5.getBoundingClientRect();

      // Viewport relative points
      const v4x = (r4.left - cRect.left) + (r4.width / 2);
      const v4y = (r4.top - cRect.top);
      const v5x = (r5.left - cRect.left) + (r5.width / 2);
      const v5y = (r5.top - cRect.top);

      // Logical Midpoint B
      const topCenterX = ((v4x + v5x) / 2) / currentScale;
      const topCenterY = ((v4y + v5y) / 2) / currentScale;

      // Only report if changed significantly (logical pixels)
      if (Math.abs(lastMeasuredB.current.topCenterX - topCenterX) > 0.1 ||
        Math.abs(lastMeasuredB.current.topCenterY - topCenterY) > 0.1) {
        lastMeasuredB.current = { topCenterX, topCenterY };
        onMeasureCards({ topCenterX, topCenterY });
      }
    }
  }, [onMeasureCards]);

  useEffect(() => {
    measureCards();
    window.addEventListener('resize', measureCards);
    return () => window.removeEventListener('resize', measureCards);
  }, [measureCards]);

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

  // v2.5.1: Card Ghost Trail effect
  useEffect(() => {
    if (gamePhase === 'THRUSTING') {
      const newGhosts: { id: number; x: number; y: number; card: Card }[] = [];
      const now = Date.now();
      const container = document.querySelector('.battle-screen');
      if (container) {
        const cRect = container.getBoundingClientRect();
        selectedCards.forEach((idx, i) => {
          const slotEl = slotRefs.current[idx];
          const cardData = cards[idx];
          if (slotEl && cardData) {
            const rect = slotEl.getBoundingClientRect();
            newGhosts.push({ 
              id: now + i, 
              x: rect.left - cRect.left, 
              y: rect.top - cRect.top, 
              card: cardData 
            });
          }
        });
        setAfterimages(newGhosts);
      }
      
      const timer = setTimeout(() => {
        setAfterimages([]);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, selectedCards, cards]);


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
    
    // v3.0: PETRIFIED check - Cannot select if petrified
    if (cards[index]?.isPetrified) return;

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

  // ── Dynamic Keyframes for True 3D Leaf-Flutter ──
  const flutterStyles = useMemo(() => {
    if (gamePhase !== 'GATHERING') return '';
    return selectedCards.map((idx, selectedIdxInQueue) => {
      const card = cards[idx];
      let cardSeed = idx % 7;
      if (card?.id) {
        const idStr = String(card.id);
        let hash = 0;
        for (let i = 0; i < idStr.length; i++) hash += idStr.charCodeAt(i);
        cardSeed = hash % 7;
      }
      
      const cardSlotOffset = (idx - 3.5) * 150;
      const startX = cardSlotOffset;
      const startY = 266; // Accurate math offset from canvasCenterY (450) to bottom(.cards-area) 
      const startZ = -80 + (selectedIdxInQueue * 15);
      
      // Determine rotation direction and flips
      const flips = 1 + (cardSeed % 2); // 1 to 2 full flips (360 or 720)
      const spinDirY = selectedIdxInQueue % 2 === 0 ? 1 : -1;
      const spinDirX = cardSeed % 2 === 0 ? 1 : -1;
      
      const startRotX = 12;
      const startRotY = (idx - 3.5) * 1.2;
      const startRotZ = (idx - 3.5) * 0.6;
      
      const endRotX = 6 + (360 * flips * spinDirX);
      const endRotY = 360 * flips * spinDirY;
      const endRotZ = (selectedIdxInQueue % 2 === 0 ? 12 : -12);
      
      // Midpoint calculations for arc:
      // Cards should fan outwards slightly in X, and rise up in Y before grouping perfectly in the center
      const midX = startX * 0.5 + (spinDirY * 80);
      const midY = startY * 0.2 - 150; // Pop upwards
      const midZ = startZ * 0.5 + 100;
      
      const midRotX = startRotX + (endRotX - startRotX) * 0.5;
      const midRotY = startRotY + (endRotY - startRotY) * 0.6; // slightly offset rotation timing
      const midRotZ = startRotZ + (endRotZ - startRotZ) * 0.5 + (spinDirY * 45); // whimsical Z tilt in mid-air
      
      return `
        @keyframes leaf-flutter-${idx} {
          0% {
            opacity: 1;
            transform:
              translate(calc(-50% + ${startX}px), calc(-50% + ${startY}px))
              translateZ(${startZ}px)
              rotateX(${startRotX}deg) rotateY(${startRotY}deg) rotateZ(${startRotZ}deg)
              scale(1);
          }
          50% {
            transform:
              translate(calc(-50% + ${midX}px), calc(-50% + ${midY}px))
              translateZ(${midZ}px)
              rotateX(${midRotX}deg) rotateY(${midRotY}deg) rotateZ(${midRotZ}deg)
              scale(1.1);
          }
          100% {
            transform:
              translate(-50%, calc(-50% - 40px))
              translateZ(220px)
              rotateX(${endRotX}deg) rotateY(${endRotY}deg) rotateZ(${endRotZ}deg)
              scale(1);
          }
        }
      `;
    }).join('\n');
  }, [gamePhase, selectedCards, cards]);

  return (
    <div className="card-hand-container card-hand-3d">
      <style>{flutterStyles}</style>
      {comboPreview && isInteracting && document.getElementById('battle-portal-root') && (
        createPortal(
          <div
            className="combo-preview"
            style={{
              position: 'absolute',
              top: `${scorePreviewPos.y}px`,
              left: `${scorePreviewPos.x}px`,
              transform: 'translate(-50%, -50%)',
              color: comboPreview.includes(t.COMBAT.BANNED) ? '#e74c3c' : '#f1c40f',
              zIndex: 3000 // Ensure it's above cards/boss
            }}
          >
            {comboPreview}
          </div>,
          document.getElementById('battle-portal-root')!
        )
      )}

      {/* Card Afterimages Layer */}
      {document.getElementById('battle-portal-root') && afterimages.map(img => (
        createPortal(
          <React.Fragment key={img.id}>
            <div className="card-afterimage ghost-1" style={{ left: img.x, top: img.y }}>
              <CardComponent card={img.card} selected={false} onClick={() => {}} />
            </div>
            <div className="card-afterimage ghost-2" style={{ left: img.x, top: img.y }}>
              <CardComponent card={img.card} selected={false} onClick={() => {}} />
            </div>
          </React.Fragment>,
          document.getElementById('battle-portal-root')!
        )
      ))}

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
          const cardSeed = (Number(card?.id ?? idx)) % 7;
          const idleRotX = 12;
          const idleRotY = (idx - 3.5) * 1.2;
          const idleRotZ = (idx - 3.5) * 0.6;

          // ── Leaf-flutter parameters (per-card unique trajectory) ──
          const flutterDir = (selectedIdxInQueue % 2 === 0 ? 1 : -1);
          const flutterAmp = 50 + (cardSeed * 12);
          const flutterRotX = 28 + (cardSeed * 5);
          const flutterRotZ = 18 + ((selectedIdxInQueue * 7) % 20);
          const flutterDur = 0.8 + (selectedIdxInQueue * 0.08);
          const flutterDelay = selectedIdxInQueue * 0.1;
          const cardSlotOffset = (idx - 3.5) * 150;
          const flutterStartX = cardSlotOffset;
          const flutterStartY = 280;
          const flutterStartZ = -80 + (selectedIdxInQueue * 15);

          // Deal logic
          const slotX = (idx - 3.5) * 150;
          const deckX = 750;
          const offsetX = deckX - slotX;

          // Calculate canvas center (1600/2, 900/2)
          const canvasCenterX = 800;
          const canvasCenterY = 450;

          // Determine phase-specific styles for attacking cards
          let portalStyle: React.CSSProperties = {};
          if (shouldRenderInPortal) {
          // Add computed exact parameters here so we can access them in styles
          let cdSeed = idx % 7;
          if (card?.id) {
            const sid = String(card.id);
            let h = 0; for(let i=0; i<sid.length; i++) h += sid.charCodeAt(i);
            cdSeed = h % 7;
          }
          const flp = 1 + (cdSeed % 2);
          const sdY = selectedIdxInQueue % 2 === 0 ? 1 : -1;
          const sdX = cdSeed % 2 === 0 ? 1 : -1;
          const endXRot = 6 + (360 * flp * sdX);
          const endYRot = 360 * flp * sdY;
          const endZRot = (selectedIdxInQueue % 2 === 0 ? 12 : -12);

            const baseStyle: React.CSSProperties = {
              position: 'absolute',
              width: '120px',
              height: '168px',
              zIndex: 1000 + selectedIdxInQueue,
              left: `${canvasCenterX}px`,
              top: `${canvasCenterY}px`,
              transform: 'translate(-50%, -50%) translateZ(0px)',
              pointerEvents: 'none',
              transformStyle: 'preserve-3d'
            };

            if (gamePhase === 'GATHERING') {
              // Leaf-flutter: Use dynamic per-card injected keyframes
              portalStyle = {
                ...baseStyle,
                bottom: 'auto',
                animation: `leaf-flutter-${idx} ${flutterDur}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${flutterDelay}s forwards`,
              };
            } else if (gamePhase === 'CHARGING') {
              portalStyle = {
                ...baseStyle,
                bottom: 'auto',
                transform: `translate(-50%, calc(-50% - 40px)) translateZ(220px) rotateX(${endXRot}deg) rotateY(${endYRot}deg) rotateZ(${endZRot}deg)`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0s',
                filter: 'brightness(1.3) drop-shadow(0 0 12px #f1c40f)',
              };
            } else if (gamePhase === 'THRUSTING') {
              // 3D perspective thrust: cards shrink + recede toward boss
              portalStyle = {
                ...baseStyle,
                left: `${bossCenterX}px`,
                top: `${bossCenterY}px`,
                bottom: 'auto',
                transform: `translate(-50%, -50%) scale(0.45) translateZ(600px) rotateX(25deg)`,
                transition: 'all 0.12s cubic-bezier(0.7, 0, 1, 0.5) 0s',
                filter: 'brightness(1.6)',
              };
            } else if (gamePhase === 'SCATTERED') {
              const shatterAngle = (selectedIdxInQueue * 60) - 90;
              const shatterDistance = 150 + (selectedIdxInQueue * 30);
              const shatterX = Math.cos(shatterAngle * Math.PI / 180) * shatterDistance;
              const shatterY = Math.sin(shatterAngle * Math.PI / 180) * shatterDistance;
              const scatterRotX = 10 + selectedIdxInQueue * 8;
              const scatterRotZ = shatterAngle * 1.5;

              portalStyle = {
                ...baseStyle,
                left: `${bossCenterX}px`,
                top: `${bossCenterY}px`,
                bottom: 'auto',
                transform: `translate(calc(-50% + ${shatterX}px), calc(-50% + ${shatterY}px)) scale(0.2) translateZ(400px) rotateX(${scatterRotX}deg) rotateZ(${scatterRotZ}deg)`,
                opacity: 0,
                filter: 'brightness(2) contrast(150%)',
                transition: `all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${selectedIdxInQueue * 0.05}s`,
                clipPath: 'polygon(0% 0%, 25% 10%, 50% 0%, 75% 15%, 100% 0%, 90% 25%, 100% 50%, 85% 75%, 100% 100%, 70% 90%, 50% 100%, 30% 85%, 0% 100%, 15% 70%, 0% 50%, 10% 25%)',
              };
            }
          }

          // Render attacking cards into the root portal (v2.4.3)
          if (shouldRenderInPortal && card) {
            const portalRoot = document.getElementById('battle-portal-root');
            if (portalRoot) {
              return (
                <React.Fragment key={`slot-${idx}`}>
                  <div className="card-slot" style={{ width: '120px', height: '168px', margin: '0 10px', position: 'relative' }} />
                  {createPortal(
                    <div style={portalStyle} className={gamePhase === 'GATHERING' ? 'card-leaf-flutter' : ''}>
                      <div className={`portal-spin ${gamePhase === 'CHARGING' ? 'active' : ''}`}>
                        <div className="card-3d-flipbox">
                          {/* Front face — actual card */}
                          <div className="card-3d-face card-3d-front">
                            <CardComponent
                              card={{ ...card, isBlind, isBanned }}
                              selected={false}
                              onClick={() => { }}
                            />
                          </div>
                          {/* Back face — brown Turnsarsah logo */}
                          <div className="card-3d-face card-3d-back">
                            <img src="/assets/cards/BACK2.png" alt="Card Back" />
                          </div>
                        </div>
                      </div>
                    </div>,
                    portalRoot
                  )}
                </React.Fragment>
              );
            }
          }

          return (
            <div key={`slot-${idx}`}
              ref={el => { slotRefs.current[idx] = el; }}
              className="card-slot"
              style={{
                width: '120px',
                height: '168px',
                margin: '0 10px',
                position: 'relative'
              }}>
              {/* v2.4.9: Sphinx Puzzle Target (Above 1st Card) */}
              {idx === 0 && chapterNum === '2A' && stageNum === 10 && puzzleTarget > 0 && (
                <div className="sphinx-puzzle-ui">
                  PUZZLE: {puzzleTarget}
                  {isPuzzleCorrect && <span className="puzzle-correct"> (CORRECT!)</span>}
                </div>
              )}
              {/* v3.0: Hydra REVIVE counter (Above 8th card) */}
              {idx === 7 && chapterNum === '3A' && stageNum === 10 && hydraReviveRemaining > 0 && (
                <div className="sphinx-puzzle-ui">
                  REVIVE: {hydraReviveRemaining}
                </div>
              )}
              {/* 3B-10: Lizard King TELOMERE HUD (Above 8th card) */}
              {idx === 7 && chapterNum === '3B' && stageNum === 10 && !lizardStemCellDestroyed && (
                <div className="sphinx-puzzle-ui">
                  TELOMERE: {lizardKingStraightCount}
                </div>
              )}
              {card && (
                <div key={card.id}
                  className="card-deal"
                  style={{
                    width: '100%',
                    height: '100%',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'none',
                    ['--deal-offset-x' as any]: `${offsetX}px`,
                    ['--deal-offset-y' as any]: '100px'
                  }}>
                  <div className="card-hitbox" onClick={() => handleCardClick(idx)}>
                    <div
                      className="card-visual"
                      style={{
                        ['--card-tilt-x' as any]: `${idleRotX}deg`,
                        ['--card-tilt-y' as any]: `${idleRotY}deg`,
                        ['--card-tilt-z' as any]: `${idleRotZ}deg`,
                        ['--card-tilt-zdepth' as any]: isSelected && isInteracting ? '26px' : '0px',
                      }}
                    >
                      <CardComponent
                        card={{ ...card, isBlind, isBanned }}
                        selected={isSelected && isInteracting}
                        onClick={() => { }}
                      />
                    </div>
                  </div>

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
