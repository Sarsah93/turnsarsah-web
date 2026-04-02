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
    lizardStemCellDestroyed,
    specialAttackMode,
    attackOrderIndices
  } = useGameStore();

  const t = TRANSLATIONS[language];
  const [afterimages, setAfterimages] = useState<{ id: number; x: number; y: number; card: Card }[]>([]);

  // Track if gathering animation has started (for two-phase animation)
  const [gatheringStarted, setGatheringStarted] = useState(false);
  const prevGamePhase = useRef(gamePhase);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isSpecialGathering = gamePhase === 'GATHERING_SPECIAL' && specialAttackMode === 'ONE_PAIR_DANCE';

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
    if ((gamePhase === 'GATHERING' || gamePhase === 'GATHERING_SPECIAL') && prevGamePhase.current !== gamePhase) {
      // Reset and start gathering animation
      setGatheringStarted(false);
      // Use requestAnimationFrame to ensure DOM has rendered at initial position
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setGatheringStarted(true);
        });
      });
    } else if (gamePhase !== 'GATHERING' && gamePhase !== 'GATHERING_SPECIAL') {
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

  // ?? Dynamic Keyframes for True 3D Leaf-Flutter ??
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
      const startY = 136; // Accurate math offset from canvasCenterY (580) to bottom(.cards-area) 
      const startZ = -80 + (selectedIdxInQueue * 15);
      
      // Determine rotation direction and flips
      const flips = 3 + (cardSeed % 3); // 3 to 5 full flips -> much faster spin for blurring
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
              translate(-50%, calc(-50% - 20px))
              translateZ(220px)
              rotateX(${endRotX}deg) rotateY(${endRotY}deg) rotateZ(${endRotZ}deg)
              scale(1);
          }
        }
      `;
    }).join('\n');
  }, [gamePhase, selectedCards, cards]);

  // One Pair Dance: Special Gathering Path (1.13s total)
  const onePairDanceStyles = useMemo(() => {
    if (!isSpecialGathering) return '';

    const canvasCenterX = 800;
    const canvasCenterY = 450;
    const bossOffsetX = bossCenterX - canvasCenterX;
    const bossOffsetY = bossCenterY - canvasCenterY;

    const pointTimes = [
      0.00, 0.17, 0.34, 0.45, 0.56, 0.6625, 0.765, 0.8675, 0.97, 1.01, 1.05, 1.09, 1.13
    ].map(t => (t / 1.13) * 100);

    type DancePoint = { x: number; y: number; z: number; rx: number; ry: number; rz: number; scale: number; };
    type KeyPoint = { dx: number; dy: number; rx: number; rz: number; face: 'F' | 'B'; spin: number; };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const lerpPoint = (a: DancePoint, b: DancePoint, t: number): DancePoint => ({
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      z: lerp(a.z, b.z, t),
      rx: lerp(a.rx, b.rx, t),
      ry: lerp(a.ry, b.ry, t),
      rz: lerp(a.rz, b.rz, t),
      scale: lerp(a.scale, b.scale, t),
    });

    const interpolate = (a: DancePoint, b: DancePoint, steps: number): DancePoint[] => {
      const points: DancePoint[] = [];
      for (let i = 0; i <= steps; i++) {
        points.push(lerpPoint(a, b, i / steps));
      }
      return points;
    };

    const depthForIndex = (i: number) => {
      if (i <= 4) {
        return { z: 40 * i, scale: 1 - (i * 0.02) };
      }
      if (i <= 9) {
        const t = (i - 5) / 4;
        return { z: 220 + (t * 200), scale: 0.72 - (t * 0.18) };
      }
      {
        const t = (i - 10) / 3;
        return { z: 520 + (t * 260), scale: 0.45 - (t * 0.18) };
      }
    };

    const toPoint = (startX: number, startY: number, kp: KeyPoint, i: number): DancePoint => {
      const base = kp.face === 'F' ? 0 : 180;
      const ry = base + (kp.spin * 360);
      const depth = depthForIndex(i);
      return {
        x: startX + kp.dx,
        y: startY + kp.dy,
        z: depth.z,
        rx: kp.rx,
        ry,
        rz: kp.rz,
        scale: depth.scale,
      };
    };

    // Paths from approved v4 sketch (relative to each card center).
    // Points are approximated and scaled to logical 1600x900 space; right side is mirrored.
    const path1: KeyPoint[] = [
      { dx: 0, dy: 0, rx: 8, rz: -10, face: 'F', spin: 0 },
      { dx: 20, dy: -120, rx: 16, rz: -16, face: 'F', spin: 0 },
      { dx: 110, dy: -180, rx: 22, rz: -22, face: 'F', spin: 0 },
      { dx: 240, dy: -220, rx: 18, rz: -28, face: 'B', spin: 1 },
      { dx: 330, dy: -280, rx: 10, rz: -18, face: 'F', spin: 1 },
      { dx: 290, dy: -340, rx: 6, rz: -8, face: 'B', spin: 1 },
      { dx: 200, dy: -380, rx: 14, rz: 10, face: 'F', spin: 2 },
      { dx: 180, dy: -480, rx: 18, rz: 20, face: 'F', spin: 2 },
      { dx: 380, dy: -480, rx: 8, rz: 8, face: 'F', spin: 2 },
      { dx: 510, dy: -440, rx: -6, rz: 16, face: 'B', spin: 3 },
      { dx: 610, dy: -380, rx: 0, rz: 10, face: 'B', spin: 3 },
      { dx: 720, dy: -410, rx: 6, rz: -8, face: 'B', spin: 3 },
      { dx: 560, dy: -490, rx: 0, rz: 0, face: 'F', spin: 4 },
    ];

    const path2: KeyPoint[] = [
      { dx: 0, dy: 0, rx: 8, rz: 10, face: 'F', spin: 0 },
      { dx: 20, dy: -130, rx: 18, rz: 18, face: 'F', spin: 0 },
      { dx: 80, dy: -220, rx: 22, rz: 26, face: 'F', spin: 0 },
      { dx: 260, dy: -280, rx: 12, rz: 12, face: 'B', spin: 1 },
      { dx: 480, dy: -280, rx: 6, rz: -6, face: 'F', spin: 1 },
      { dx: 610, dy: -220, rx: -6, rz: -16, face: 'F', spin: 1 },
      { dx: 680, dy: -120, rx: 12, rz: -24, face: 'B', spin: 2 },
      { dx: 550, dy: -60, rx: 18, rz: -6, face: 'B', spin: 2 },
      { dx: 430, dy: -140, rx: 8, rz: 10, face: 'B', spin: 2 },
      { dx: 600, dy: -360, rx: 6, rz: 0, face: 'F', spin: 3 },
      { dx: 520, dy: -360, rx: 0, rz: 10, face: 'B', spin: 3 },
      { dx: 440, dy: -360, rx: -6, rz: -4, face: 'B', spin: 3 },
      { dx: 360, dy: -360, rx: 0, rz: 0, face: 'B', spin: 4 },
    ];

    const path3: KeyPoint[] = [
      { dx: 0, dy: 0, rx: 6, rz: -8, face: 'F', spin: 0 },
      { dx: -80, dy: -120, rx: 16, rz: -18, face: 'F', spin: 0 },
      { dx: -180, dy: -180, rx: 22, rz: -26, face: 'F', spin: 0 },
      { dx: -340, dy: -220, rx: 10, rz: -30, face: 'B', spin: 1 },
      { dx: -420, dy: -280, rx: 6, rz: -36, face: 'B', spin: 1 },
      { dx: -400, dy: -380, rx: 12, rz: -18, face: 'B', spin: 1 },
      { dx: -260, dy: -420, rx: 16, rz: 6, face: 'F', spin: 2 },
      { dx: -120, dy: -440, rx: 14, rz: 18, face: 'F', spin: 2 },
      { dx: 0, dy: -430, rx: 10, rz: 20, face: 'F', spin: 2 },
      { dx: 120, dy: -420, rx: -8, rz: 12, face: 'F', spin: 3 },
      { dx: 180, dy: -370, rx: -4, rz: -6, face: 'B', spin: 3 },
      { dx: 160, dy: -340, rx: 4, rz: -8, face: 'B', spin: 3 },
      { dx: 420, dy: -420, rx: 0, rz: 0, face: 'B', spin: 4 },
    ];

    const path4: KeyPoint[] = [
      { dx: 0, dy: 0, rx: 8, rz: 12, face: 'F', spin: 0 },
      { dx: -40, dy: -140, rx: 18, rz: 22, face: 'F', spin: 0 },
      { dx: -100, dy: -220, rx: 24, rz: 30, face: 'F', spin: 0 },
      { dx: -180, dy: -280, rx: 10, rz: 38, face: 'B', spin: 1 },
      { dx: -280, dy: -320, rx: 6, rz: 20, face: 'B', spin: 1 },
      { dx: -340, dy: -370, rx: 12, rz: 10, face: 'F', spin: 1 },
      { dx: -280, dy: -420, rx: 18, rz: 0, face: 'F', spin: 2 },
      { dx: -160, dy: -440, rx: 10, rz: -10, face: 'F', spin: 2 },
      { dx: -40, dy: -450, rx: 6, rz: 10, face: 'B', spin: 2 },
      { dx: 100, dy: -470, rx: -6, rz: 16, face: 'B', spin: 3 },
      { dx: 240, dy: -500, rx: 0, rz: -8, face: 'F', spin: 3 },
      { dx: 380, dy: -520, rx: 4, rz: -10, face: 'F', spin: 3 },
      { dx: 520, dy: -540, rx: 0, rz: 0, face: 'F', spin: 4 },
    ];

    const paths: Record<number, KeyPoint[]> = {
      0: path1,
      1: path2,
      2: path3,
      3: path4,
    };

    const container = document.querySelector('.battle-screen') as HTMLElement | null;

    return selectedCards.map((idx) => {
      let startX = -Math.abs((idx - 3.5) * 150);
      let startY = 280;
      if (container && slotRefs.current[idx]) {
        const cRect = container.getBoundingClientRect();
        const sRect = slotRefs.current[idx]!.getBoundingClientRect();
        const currentScale = cRect.width / 1600;
        const centerX = (sRect.left - cRect.left) + (sRect.width / 2);
        const centerY = (sRect.top - cRect.top) + (sRect.height / 2);
        const logicalX = centerX / currentScale;
        const logicalY = centerY / currentScale;
        startX = logicalX - canvasCenterX;
        startY = logicalY - canvasCenterY;
      }

      const pattern = idx <= 3 ? idx : 7 - idx;
      const isMirrored = idx >= 4;
      const base = paths[pattern];
      const points13 = base.map((kp, i) => toPoint(startX, startY, kp, i));
      let points = points13;

      if (isMirrored) {
        points = points.map(p => ({
          ...p,
          x: -p.x,
          ry: -p.ry,
          rz: -p.rz
        }));
      }

      const keyframes: string[] = [];
      const stepsPerSegment = 30;
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        const t0 = pointTimes[i];
        const t1 = pointTimes[i + 1];
        const seg = interpolate(a, b, stepsPerSegment);
        for (let s = 0; s < seg.length; s++) {
          if (i > 0 && s === 0) continue;
          const pct = t0 + ((t1 - t0) * (s / stepsPerSegment));
          const p = seg[s];
          keyframes.push(
            `${pct.toFixed(2)}% {` +
            ` transform: translate(calc(-50% + ${p.x.toFixed(2)}px), calc(-50% + ${p.y.toFixed(2)}px))` +
            ` translateZ(${p.z.toFixed(2)}px) rotateX(${p.rx.toFixed(2)}deg) rotateY(${p.ry.toFixed(2)}deg) rotateZ(${p.rz.toFixed(2)}deg)` +
            ` scale(${p.scale.toFixed(3)}); opacity: 1; }`
          );
        }
      }

      const orderIndex = attackOrderIndices.length > 0 ? attackOrderIndices.indexOf(idx) : selectedCards.indexOf(idx);
      const safeOrderIndex = orderIndex >= 0 ? orderIndex : 0;
      const shatterAngle = (safeOrderIndex * 60) - 90;
      const shatterDistance = 150 + (safeOrderIndex * 30);
      const shatterX = Math.cos(shatterAngle * Math.PI / 180) * shatterDistance;
      const shatterY = Math.sin(shatterAngle * Math.PI / 180) * shatterDistance;
      const scatterRotX = 10 + safeOrderIndex * 8;
      const scatterRotZ = shatterAngle * 1.5;
      const lastPoint = points[points.length - 1];
      const scatterKeyframes = `
        0% {
          transform: translate(calc(-50% + ${lastPoint.x.toFixed(2)}px), calc(-50% + ${lastPoint.y.toFixed(2)}px))
            translateZ(${(lastPoint.z + 40).toFixed(2)}px)
            rotateX(${lastPoint.rx.toFixed(2)}deg) rotateY(${lastPoint.ry.toFixed(2)}deg) rotateZ(${lastPoint.rz.toFixed(2)}deg)
            scale(${lastPoint.scale.toFixed(3)});
          opacity: 1;
        }
        100% {
          transform: translate(calc(-50% + ${(lastPoint.x + shatterX).toFixed(2)}px), calc(-50% + ${(lastPoint.y + shatterY).toFixed(2)}px))
            translateZ(${(lastPoint.z + 200).toFixed(2)}px)
            rotateX(${scatterRotX.toFixed(2)}deg) rotateY(${lastPoint.ry.toFixed(2)}deg) rotateZ(${scatterRotZ.toFixed(2)}deg)
            scale(0.2);
          opacity: 0;
        }
      `;

      return `@keyframes onepair-dance-${idx} {\n${keyframes.join('\n')}\n}\n@keyframes onepair-scatter-${idx} {\n${scatterKeyframes}\n}`;
    }).join('\n');
  }, [isSpecialGathering, selectedCards, bossCenterX, bossCenterY, attackOrderIndices]);

  return (
    <div className="card-hand-container card-hand-3d">
      <style>{flutterStyles}{onePairDanceStyles}</style>
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
          const isAttacking = ['GATHERING', 'GATHERING_SPECIAL', 'CHARGING', 'THRUSTING', 'SCATTERED'].includes(gamePhase);
          const shouldRenderInPortal = isSelected && isAttacking;
          const cardSeed = (Number(card?.id ?? idx)) % 7;
          const idleRotX = 12;
          const idleRotY = (idx - 3.5) * 1.2;
          const idleRotZ = (idx - 3.5) * 0.6;

          // ?? Leaf-flutter parameters (per-card unique trajectory) ??
          const flutterDir = (selectedIdxInQueue % 2 === 0 ? 1 : -1);
          const flutterAmp = 50 + (cardSeed * 12);
          const flutterRotX = 28 + (cardSeed * 5);
          const flutterRotZ = 18 + ((selectedIdxInQueue * 7) % 20);
          const attackOrderIndex = attackOrderIndices.length > 0 ? attackOrderIndices.indexOf(idx) : selectedIdxInQueue;
          const safeOrderIndex = attackOrderIndex >= 0 ? attackOrderIndex : selectedIdxInQueue;
          const flutterDur = 0.4 + (safeOrderIndex * 0.04);
          const flutterDelay = safeOrderIndex * 0.05;
          const cardSlotOffset = (idx - 3.5) * 150;
          const flutterStartX = cardSlotOffset;
          const flutterStartY = 136;
          const flutterStartZ = -80 + (selectedIdxInQueue * 15);

          // Deal logic
          const slotX = (idx - 3.5) * 150;
          const deckX = 750;
          const offsetX = deckX - slotX;

          // Calculate canvas center (1600/2, 900/2) adjusted lower
          const canvasCenterX = 800;
          const canvasCenterY = 580;

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
              zIndex: 4000 + selectedIdxInQueue,
              left: `${canvasCenterX}px`,
              top: `${canvasCenterY}px`,
              transform: 'translate(-50%, -50%) translateZ(0px)',
              pointerEvents: 'none',
              transformStyle: 'preserve-3d'
            };

            if (gamePhase === 'GATHERING') {
              // Leaf-flutter: Use dynamic per-card injected keyframes
              // 'both' prevents the card from warping to the destination point before its delay begins!
              portalStyle = {
                ...baseStyle,
                bottom: 'auto',
                animation: `leaf-flutter-${idx} ${flutterDur}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${flutterDelay}s both`,
              };
            } else if (gamePhase === 'GATHERING_SPECIAL') {
              const specialDelay = safeOrderIndex * 0.12;
              const scatterDelay = specialDelay + 1.13;
              portalStyle = {
                ...baseStyle,
                left: '800px',
                top: '450px',
                bottom: 'auto',
                animation: `onepair-dance-${idx} 1.13s cubic-bezier(0.22, 0.61, 0.36, 1) ${specialDelay}s both, onepair-scatter-${idx} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${scatterDelay}s forwards`,
              };
            } else if (gamePhase === 'CHARGING') {
              portalStyle = {
                ...baseStyle,
                bottom: 'auto',
                transform: `translate(-50%, calc(-50% - 20px)) translateZ(220px) rotateX(${endXRot}deg) rotateY(${endYRot}deg) rotateZ(${endZRot}deg)`,
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
              if (specialAttackMode === 'ONE_PAIR_DANCE') {
                portalStyle = {
                  ...baseStyle,
                  bottom: 'auto',
                };
              } else {
                const shatterAngle = (safeOrderIndex * 60) - 90;
                const shatterDistance = 150 + (safeOrderIndex * 30);
                const shatterX = Math.cos(shatterAngle * Math.PI / 180) * shatterDistance;
                const shatterY = Math.sin(shatterAngle * Math.PI / 180) * shatterDistance;
                const scatterRotX = 10 + safeOrderIndex * 8;
                const scatterRotZ = shatterAngle * 1.5;

                portalStyle = {
                  ...baseStyle,
                  left: `${bossCenterX}px`,
                  top: `${bossCenterY}px`,
                  bottom: 'auto',
                  transform: `translate(calc(-50% + ${shatterX}px), calc(-50% + ${shatterY}px)) scale(0.2) translateZ(400px) rotateX(${scatterRotX}deg) rotateZ(${scatterRotZ}deg)`,
                  opacity: 0,
                  filter: 'brightness(2) contrast(150%)',
                  transition: `all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${safeOrderIndex * 0.12}s`,
                  clipPath: 'polygon(0% 0%, 25% 10%, 50% 0%, 75% 15%, 100% 0%, 90% 25%, 100% 50%, 85% 75%, 100% 100%, 70% 90%, 50% 100%, 30% 85%, 0% 100%, 15% 70%, 0% 50%, 10% 25%)',
                };
              }
            }
          }

          // Render attacking cards into the root portal (v2.4.3)
          if (shouldRenderInPortal && card) {
            const portalRoot = document.getElementById('battle-portal-root');
            if (portalRoot) {
              
              const renderPortalCard = (styleOverride: React.CSSProperties, keySuffix: string) => (
                <div key={`portal-${idx}-${keySuffix}`} style={{...portalStyle, ...styleOverride}} className={gamePhase === 'GATHERING' ? 'card-leaf-flutter' : ''}>
                  <div className={`portal-spin ${gamePhase === 'CHARGING' ? 'active' : ''}`}>
                    <div className="card-3d-flipbox">
                      {/* Front face ??actual card */}
                      <div className="card-3d-face card-3d-front">
                        <CardComponent
                          card={{ ...card, isBlind, isBanned }}
                          selected={false}
                          onClick={() => { }}
                        />
                      </div>
                      {/* Back face ??brown Turnsarsah logo */}
                      <div className="card-3d-face card-3d-back">
                        <img src="/assets/cards/BACK2.png" alt="Card Back" />
                      </div>
                    </div>
                  </div>
                </div>
              );

              // 1. Ghost Trail 2 (delayed more) - lowest opacity
              const ghost2Style = gamePhase === 'GATHERING' ? { 
                 opacity: 0.15, 
                 animationDelay: `${flutterDelay + 0.05}s`,
                 filter: 'blur(2px) contrast(150%)',
                 zIndex: 3800 + selectedIdxInQueue
              } : { display: 'none' };
              
              // 2. Ghost Trail 1 (delayed slightly)
              const ghost1Style = gamePhase === 'GATHERING' ? { 
                 opacity: 0.35, 
                 animationDelay: `${flutterDelay + 0.025}s`,
                 filter: 'blur(1px) contrast(130%)',
                 zIndex: 3900 + selectedIdxInQueue
              } : { display: 'none' };

              return (
                <React.Fragment key={`slot-${idx}`}>
                  <div className="card-slot" style={{ width: '120px', height: '168px', margin: '0 10px', position: 'relative' }} />
                  {createPortal(
                    <>
                      {gamePhase === 'GATHERING' && renderPortalCard(ghost2Style, 'g2')}
                      {gamePhase === 'GATHERING' && renderPortalCard(ghost1Style, 'g1')}
                      {renderPortalCard({}, 'main')}
                    </>,
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
