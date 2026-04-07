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
    attackOrderIndices,
    gameSpeed
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
  // Absolute-coordinate waypoints with multi-axis 3D tumbling
  const onePairDanceStyles = useMemo(() => {
    if (!isSpecialGathering) return '';

    const canvasCenterX = 800;
    const canvasCenterY = 450;
    const bossX = bossCenterX - canvasCenterX;  // ~0
    const bossY = bossCenterY - canvasCenterY;  // ~-165

    const FLIGHT_DUR = 0.85; // seconds

    // Non-linear timing: points 0-10 over 82%, pause at 92%, thrust at 100%
    const pointTimes: number[] = [
      0, 8.2, 16.4, 24.6, 32.8, 41.0, 49.2, 57.4, 65.6, 73.8, 82.0,
      92.0,  // approach: brief pause here
      100.0  // thrust: rapid final strike
    ];

    type DancePoint = { x: number; y: number; z: number; rx: number; ry: number; rz: number; scale: number; };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const lerpPoint = (a: DancePoint, b: DancePoint, t: number): DancePoint => ({
      x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t),
      rx: lerp(a.rx, b.rx, t), ry: lerp(a.ry, b.ry, t), rz: lerp(a.rz, b.rz, t),
      scale: lerp(a.scale, b.scale, t),
    });
    const interpolate = (a: DancePoint, b: DancePoint, steps: number): DancePoint[] => {
      const pts: DancePoint[] = [];
      for (let i = 0; i <= steps; i++) pts.push(lerpPoint(a, b, i / steps));
      return pts;
    };

    // Waypoints in ABSOLUTE canvas-center coordinates.
    // First point (index 0) and last 2 points (11,12) are set dynamically per card.
    // Intermediate points (1-10) describe the artistic trajectory shape.
    // For mirrored cards (5-8), only intermediate X and rotateY/Z are negated.
    type AbsWP = { x: number; y: number; z: number; rx: number; ry: number; rz: number; scale: number; };

    // Path 1 (Ref image 1): Right sweep arc
    // Card rises up-left, crosses boss going right, sweeps far right, loops back to hit
    const path1Mid: AbsWP[] = [
      { x: -350, y:  -50, z: -40,  rx:  75, ry:  130, rz: -25, scale: 1.00 },
      { x: -200, y: -180, z: -90,  rx: 180, ry:  310, rz: -40, scale: 0.75 },
      { x:    0, y: -220, z:-150,  rx: 290, ry:  480, rz: -20, scale: 0.62 },
      { x:  200, y: -250, z:-200,  rx: 400, ry:  670, rz:  15, scale: 0.50 },
      { x:  380, y: -200, z:-220,  rx: 520, ry:  850, rz:  35, scale: 0.45 },
      { x:  400, y: -140, z:-180,  rx: 640, ry: 1020, rz:  20, scale: 0.50 },
      { x:  320, y: -100, z:-140,  rx: 760, ry: 1190, rz: -10, scale: 0.58 },
      { x:  220, y: -130, z:-100,  rx: 870, ry: 1350, rz: -25, scale: 0.68 },
      { x:  120, y: -170, z: -60,  rx: 960, ry: 1470, rz: -15, scale: 0.78 },
      { x:   60, y: -180, z: -30,  rx:1040, ry: 1560, rz:  -5, scale: 0.88 },
    ];

    // Path 2 (Ref image 2): Zigzag right
    // Card rises through boss diagonally, zigzags right, comes back
    const path2Mid: AbsWP[] = [
      { x: -200, y:  -80, z: -30,  rx:  60, ry:  110, rz:  25, scale: 1.02 },
      { x:  -50, y: -190, z: -70,  rx: 150, ry:  280, rz:  40, scale: 0.78 },
      { x:  100, y: -250, z:-130,  rx: 280, ry:  450, rz:  18, scale: 0.65 },
      { x:  300, y: -220, z:-180,  rx: 380, ry:  620, rz: -12, scale: 0.52 },
      { x:  380, y: -140, z:-200,  rx: 480, ry:  790, rz: -30, scale: 0.48 },
      { x:  330, y:  -80, z:-170,  rx: 600, ry:  940, rz: -18, scale: 0.52 },
      { x:  240, y: -120, z:-130,  rx: 720, ry: 1100, rz:  10, scale: 0.60 },
      { x:  150, y: -180, z: -90,  rx: 830, ry: 1260, rz:  20, scale: 0.70 },
      { x:   80, y: -210, z: -55,  rx: 930, ry: 1400, rz:   8, scale: 0.80 },
      { x:   30, y: -190, z: -25,  rx:1010, ry: 1510, rz:  -5, scale: 0.90 },
    ];

    // Path 3 (Ref image 3): Vertical spiral / pentagonal loop
    // Card shoots up, spirals around boss area in a star pattern, hits from front
    const path3Mid: AbsWP[] = [
      { x:  -80, y: -100, z: -30,  rx:  85, ry:  145, rz: -22, scale: 1.00 },
      { x: -150, y: -230, z: -80,  rx: 190, ry:  330, rz: -38, scale: 0.75 },
      { x: -100, y: -320, z:-150,  rx: 310, ry:  510, rz: -50, scale: 0.60 },
      { x:   30, y: -310, z:-200,  rx: 430, ry:  700, rz: -30, scale: 0.48 },
      { x:  150, y: -250, z:-200,  rx: 540, ry:  870, rz:  -8, scale: 0.48 },
      { x:  130, y: -150, z:-160,  rx: 660, ry: 1040, rz:  20, scale: 0.55 },
      { x:   30, y: -100, z:-120,  rx: 780, ry: 1200, rz:  30, scale: 0.62 },
      { x:  -80, y: -160, z: -80,  rx: 890, ry: 1350, rz:  15, scale: 0.72 },
      { x:  -40, y: -220, z: -45,  rx: 980, ry: 1480, rz:   0, scale: 0.82 },
      { x:   10, y: -190, z: -20,  rx:1050, ry: 1580, rz:  -5, scale: 0.90 },
    ];

    // Path 4 (Ref image 4): Left grand arc
    // Card sweeps far left in a large loop/arc, then flies back across to hit
    const path4Mid: AbsWP[] = [
      { x: -150, y:    0, z: -30,  rx:  70, ry:  160, rz:  28, scale: 1.02 },
      { x: -280, y:  -60, z: -80,  rx: 170, ry:  350, rz:  42, scale: 0.78 },
      { x: -380, y: -150, z:-150,  rx: 290, ry:  530, rz:  30, scale: 0.62 },
      { x: -400, y: -260, z:-200,  rx: 410, ry:  720, rz:  12, scale: 0.50 },
      { x: -340, y: -320, z:-210,  rx: 530, ry:  890, rz:  -8, scale: 0.48 },
      { x: -220, y: -330, z:-170,  rx: 650, ry: 1060, rz: -20, scale: 0.52 },
      { x: -100, y: -300, z:-130,  rx: 770, ry: 1220, rz: -10, scale: 0.60 },
      { x:    0, y: -260, z: -80,  rx: 870, ry: 1380, rz:   8, scale: 0.72 },
      { x:   60, y: -220, z: -40,  rx: 960, ry: 1510, rz:  12, scale: 0.82 },
      { x:   30, y: -190, z: -15,  rx:1030, ry: 1600, rz:   3, scale: 0.90 },
    ];

    const allMids = [path1Mid, path2Mid, path3Mid, path4Mid];
    const container = document.querySelector('.battle-screen') as HTMLElement | null;

    return selectedCards.map((idx) => {
      // Compute card start position (offset from canvas center)
      let startX = (idx - 3.5) * 150;
      let startY = 130;
      if (container && slotRefs.current[idx]) {
        const cRect = container.getBoundingClientRect();
        const sRect = slotRefs.current[idx]!.getBoundingClientRect();
        const currentScale = cRect.width / 1600;
        const centerX = (sRect.left - cRect.left) + (sRect.width / 2);
        const centerY = (sRect.top - cRect.top) + (sRect.height / 2);
        startX = (centerX / currentScale) - canvasCenterX;
        startY = (centerY / currentScale) - canvasCenterY;
      }

      // Pattern: card 0→path1, 1→path2, 2→path3, 3→path4, 4→path4(mir), 5→path3(mir), 6→path2(mir), 7→path1(mir)
      const pattern = idx <= 3 ? idx : 7 - idx;
      const isMirrored = idx >= 4;
      const midWaypoints = allMids[pattern];

      // Build 13 absolute DancePoints: [start, 10 mid waypoints, approach, hit]
      const startPt: DancePoint = { x: startX, y: startY, z: 0, rx: 0, ry: 0, rz: 0, scale: 1.2 };
      const approachPt: DancePoint = {
        x: lerp(midWaypoints[9].x, bossX, 0.7),
        y: lerp(midWaypoints[9].y, bossY, 0.7),
        z: -8, rx: 1100, ry: 1660, rz: 0, scale: 0.96
      };
      const hitPt: DancePoint = { x: bossX, y: bossY, z: 0, rx: 1140, ry: 1720, rz: 0, scale: 0.85 };

      let points: DancePoint[] = [
        startPt,
        ...midWaypoints.map(wp => ({ ...wp })),
        approachPt,
        hitPt,
      ];

      // Mirror for cards 5-8: negate X of intermediate waypoints, keep start/end correct
      if (isMirrored) {
        points = points.map((p, i) => {
          if (i === 0) return p; // start is already at this card's actual position
          if (i >= 12) return p; // approach & hit go to boss (same position)
          // Mirror approach point too
          if (i === 11) return { ...p, x: lerp(-midWaypoints[9].x, bossX, 0.7), ry: -p.ry, rz: -p.rz };
          // Mirror intermediate waypoints around screen center
          return { ...p, x: -p.x, ry: -p.ry, rz: -p.rz };
        });
      }

      // Generate smooth keyframes
      const keyframes: string[] = [];
      const stepsPerSegment = 20;
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
            ` transform: translate(calc(-50% + ${p.x.toFixed(1)}px), calc(-50% + ${p.y.toFixed(1)}px))` +
            ` translateZ(${p.z.toFixed(1)}px) rotateX(${p.rx.toFixed(1)}deg) rotateY(${p.ry.toFixed(1)}deg) rotateZ(${p.rz.toFixed(1)}deg)` +
            ` scale(${p.scale.toFixed(3)}); opacity: 1; }`
          );
        }
      }

      // Scatter keyframes (after hit)
      const orderIndex = attackOrderIndices.length > 0 ? attackOrderIndices.indexOf(idx) : selectedCards.indexOf(idx);
      const safeOrderIndex = orderIndex >= 0 ? orderIndex : 0;
      const shatterAngle = (safeOrderIndex * 72) - 90;
      const shatterDist = 140 + (safeOrderIndex * 25);
      const shatterX = Math.cos(shatterAngle * Math.PI / 180) * shatterDist;
      const shatterY = Math.sin(shatterAngle * Math.PI / 180) * shatterDist;
      const lastPt = points[points.length - 1];
      const scatterKeyframes = `
        0% {
          transform: translate(calc(-50% + ${lastPt.x.toFixed(1)}px), calc(-50% + ${lastPt.y.toFixed(1)}px))
            translateZ(${lastPt.z.toFixed(1)}px)
            rotateX(${lastPt.rx.toFixed(1)}deg) rotateY(${lastPt.ry.toFixed(1)}deg) rotateZ(${lastPt.rz.toFixed(1)}deg)
            scale(${lastPt.scale.toFixed(3)});
          opacity: 1;
        }
        100% {
          transform: translate(calc(-50% + ${(lastPt.x + shatterX).toFixed(1)}px), calc(-50% + ${(lastPt.y + shatterY).toFixed(1)}px))
            translateZ(${(lastPt.z + 200).toFixed(1)}px)
            rotateX(${(lastPt.rx + 120).toFixed(1)}deg) rotateY(${lastPt.ry.toFixed(1)}deg) rotateZ(${(shatterAngle * 1.5).toFixed(1)}deg)
            scale(0.15);
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
              const specialDelay = safeOrderIndex * (0.4 / gameSpeed);
              // Progressive speed: each card 8% faster than previous
              const baseDur = 0.85;
              const cardDur = (baseDur / (1 + safeOrderIndex * 0.08)) / gameSpeed;
              const scatterDelay = specialDelay + cardDur;
              portalStyle = {
                ...baseStyle,
                left: '800px',
                top: '450px',
                bottom: 'auto',
                animation: `onepair-dance-${idx} ${cardDur.toFixed(3)}s cubic-bezier(0.22, 0.61, 0.36, 1) ${specialDelay.toFixed(3)}s both, onepair-scatter-${idx} ${(0.35 / gameSpeed).toFixed(3)}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${scatterDelay.toFixed(3)}s forwards`,
                filter: 'drop-shadow(0 0 6px rgba(255, 200, 60, 0.7)) drop-shadow(0 0 14px rgba(255, 140, 20, 0.4))',
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
