import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../state/gameStore';
import { Card } from './Card';
import { useGameLoop } from '../../logic/useGameLoop';
import { calculatePlayerDamage } from '../../logic/damageCalculation';
import { BlockButton } from '../BlockButton';
import { AudioManager } from '../../utils/AudioManager';

export const CardHand: React.FC = () => {
  const { playerHand, player } = useGameStore();
  const { executePlayerAttack, executeCardSwap } = useGameLoop();

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Combo / Score Preview
  const comboPreview = useMemo(() => {
    if (selectedIndices.length === 0) return null;
    const selectedCards = selectedIndices.map(idx => playerHand[idx]);
    const hasBlind = selectedCards.some(c => c.isBlind);

    const result = calculatePlayerDamage(selectedCards, player.conditions.has('Debilitating'));
    return {
      type: result.handType,
      score: hasBlind ? '???' : Math.floor(result.finalDamage)
    };
  }, [selectedIndices, playerHand, player.conditions]);

  const handleCardClick = (index: number) => {
    if (isAnimating) return;
    setSelectedIndices(prev => {
      const alreadySelected = prev.includes(index);
      if (alreadySelected) {
        return prev.filter(i => i !== index);
      } else {
        if (prev.length >= 5) return prev;
        return [...prev, index];
      }
    });
  };

  const handleAttack = () => {
    if (selectedIndices.length === 0 || isAnimating) return;

    setIsAnimating(true);

    // Animation Logic:
    // 1. Cards move to center (handled by isAnimating flag and CSS)

    // 2. 0.5s after animation start: shuffling.mp3
    setTimeout(() => {
      AudioManager.playSFX('/assets/audio/player/shuffling.mp3');
    }, 500);

    // 3. 1.0s after start: Thrust start (CSS keyframe)
    // 4. 1.25s after start: whipping.mp3
    setTimeout(() => {
      AudioManager.playSFX('/assets/audio/player/whipping.mp3');
    }, 1250);

    // 5. Final impact
    setTimeout(() => {
      executePlayerAttack(selectedIndices);
      setSelectedIndices([]);
      setIsAnimating(false);
    }, 1500);
  };

  const handleSwap = () => {
    if (isAnimating) return;
    executeCardSwap(selectedIndices);
    setSelectedIndices([]);
  };

  return (
    <div className="card-hand-container" style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      gap: '15px'
    }}>

      {/* Combo Preview */}
      {comboPreview && (
        <div style={{
          color: '#2ecc71', fontSize: '2.2rem', fontFamily: 'BebasNeue',
          textShadow: '2px 2px 2px #000', marginBottom: '5px'
        }}>
          {comboPreview.type}: {comboPreview.score}
        </div>
      )}

      {/* Action Buttons using BlockButton */}
      <div className="action-buttons" style={{ display: 'flex', gap: '30px', marginBottom: '10px' }}>
        <BlockButton
          text="ATTACK"
          onClick={handleAttack}
          width="220px"
          disabled={selectedIndices.length === 0 || isAnimating}
        />
        <BlockButton
          text="DRAW / SWAP"
          onClick={handleSwap}
          width="280px"
          disabled={isAnimating}
        />
      </div>

      {/* Cards Area */}
      <div style={{ display: 'flex', justifyContent: 'center', height: '180px', position: 'relative', minWidth: '800px' }}>
        {playerHand.map((card, idx) => {
          const isSelected = selectedIndices.includes(idx);

          // Animation styling
          const animationStyle: React.CSSProperties = (isAnimating && isSelected) ? {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(1.1)',
            zIndex: 1000,
            transition: 'all 0.5s ease-in-out'
          } : {
            position: 'relative',
            transition: 'all 0.3s ease'
          };

          return (
            <div key={`${card.suit}-${card.rank}-${idx}`}
              className={(isAnimating && isSelected) ? 'thrust-anim' : ''}
              style={{ ...animationStyle, margin: '0 5px' }}>
              <Card
                card={card}
                selected={isSelected && !isAnimating}
                onClick={() => handleCardClick(idx)}
              />
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes thrust {
            0% { transform: translate(-50%, -50%) scale(1.1); }
            70% { transform: translate(-50%, -50%) scale(1.2); }
            100% { transform: translate(-50%, -150%) scale(1.5); opacity: 0; }
        }
        .thrust-anim {
            animation: thrust 0.5s ease-in forwards;
            animation-delay: 1.0s;
        }
      `}</style>
    </div>
  );
};
