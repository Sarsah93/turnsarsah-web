import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../state/gameStore';
import { Card } from './Card';
import { useGameLoop } from '../../logic/useGameLoop';
import { calculatePlayerDamage } from '../../logic/damageCalculation';
import { BlockButton } from '../BlockButton';
import { AudioManager } from '../../utils/AudioManager';
import '../styles/CardHand.css';

interface CardHandProps {
  cards?: any[];
  selectedCards?: number[];
  onSelectCard?: (index: number) => void;
  onAttack?: () => void;
  isProcessing?: boolean;
  disabled?: boolean;
  bannedIndices?: number[];
  blindIndices?: number[];
}

export const CardHand: React.FC<CardHandProps> = ({
  cards: propCards,
  selectedCards: propSelectedCards,
  onSelectCard,
  onAttack,
  isProcessing = false,
  disabled = false,
  bannedIndices = [],
  blindIndices = []
}) => {
  const { player, playerHand, setDrawsRemaining } = useGameStore();
  const { executeCardSwap, executePlayerAttack } = useGameLoop();

  const cards = propCards || playerHand;

  // Internal selection logic if needed, but we should use props
  // For now, let's bridge internal state with props to keep my new animation logic working
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  // Sync props to internal state if they change? Or just use props directly.
  // The user wants my new animation logic, so I'll use internal state for local control during anim.

  // Combo / Score Preview
  const comboPreview = useMemo(() => {
    if (selectedIndices.length === 0) return null;
    const selectedCards = selectedIndices.map(idx => cards[idx]);
    const hasBlind = selectedCards.some(c => c.isBlind);
    const hasJoker = selectedCards.some(c => c.isJoker);

    const result = calculatePlayerDamage(selectedCards, player.conditions.has('Debilitating'));

    const damageLabel = hasBlind ? '???' : Math.floor(result.finalDamage);
    const handTypeLabel = result.handType;
    const wildSuffix = hasJoker ? ' (WILD)' : '';

    return `Damage: ${damageLabel} ("${handTypeLabel}")${wildSuffix}`;
  }, [selectedIndices, cards, player.conditions]);

  type AnimPhase = 'IDLE' | 'GATHERING' | 'BUNCHING' | 'CHARGING' | 'THRUSTING' | 'SCATTERING';
  const [phase, setPhase] = useState<AnimPhase>('IDLE');

  const handleCardClick = (index: number) => {
    if (phase !== 'IDLE') return;
    if (onSelectCard) onSelectCard(index);

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

  const handleAttack = async () => {
    if (phase !== 'IDLE') return;

    // User Guide: If no cards selected, show message in screen center
    if (selectedIndices.length === 0) {
      useGameStore.getState().setMessage("SELECT CARDS AT LEAST ONE");
      return;
    }

    // 1. GATHERING - Centralize
    setPhase('GATHERING');

    // 2. BUNCHING (after 0.4s) - Fast merge
    setTimeout(() => {
      setPhase('BUNCHING');
      AudioManager.playSFX('/assets/audio/player/shuffling.mp3');
    }, 400);

    // 3. CHARGING (after 0.7s) - Move slightly down
    setTimeout(() => {
      setPhase('CHARGING');
    }, 700);

    // 4. THRUSTING (after 0.9s) - Fast up move
    setTimeout(() => {
      setPhase('THRUSTING');
      AudioManager.playSFX('/assets/audio/player/whipping.mp3');
    }, 900);

    // 5. SCATTERING & IMPACT (after 1.1s)
    setTimeout(() => {
      setPhase('SCATTERING');

      if (onAttack) {
        onAttack();
      } else {
        executePlayerAttack(selectedIndices);
      }

      // Wait for scattering and boss shake to finish
      setTimeout(() => {
        setSelectedIndices([]);
        setPhase('IDLE');
      }, 500);
    }, 1100);
  };

  const handleSwap = () => {
    if (phase !== 'IDLE') return;

    // User Guide: If no cards selected, show message
    if (selectedIndices.length === 0) {
      useGameStore.getState().setMessage("SELECT CARDS AT LEAST ONE");
      return;
    }

    if ((player.drawsRemaining ?? 0) <= 0) return;
    if (selectedIndices.length > 2) {
      useGameStore.getState().setMessage("SELECT MAX 2 CARDS");
      return;
    }

    executeCardSwap(selectedIndices);
    setDrawsRemaining((player.drawsRemaining ?? 0) - 1);
    setSelectedIndices([]);
  };

  return (
    <div className="card-hand-container">
      {/* Combo Preview */}
      {comboPreview && phase === 'IDLE' && (
        <div className="combo-preview">
          {comboPreview}
        </div>
      )}

      {/* Action Buttons - Moved to bottom */}
      <div className="action-buttons">
        <div className="attack-button-wrapper">
          <BlockButton
            text="ATTACK"
            onClick={handleAttack}
            width="150px"
            disabled={phase !== 'IDLE'}
          />
        </div>
        <div className="draw-button-wrapper" style={{ right: '40px' }}>
          <BlockButton
            text={`DRAW (${player.drawsRemaining ?? 2})`}
            onClick={handleSwap}
            width="180px"
            disabled={phase !== 'IDLE'}
          />
        </div>
      </div>

      {/* Cards Area - Positioned above buttons */}
      <div className="cards-area" style={{ marginBottom: '80px' }}>
        {cards.map((card: any, idx: number) => {
          const isSelected = selectedIndices.includes(idx);
          let phaseClass = '';
          if (isSelected) {
            if (phase === 'GATHERING') phaseClass = 'gathering';
            else if (phase === 'BUNCHING') phaseClass = 'bunching';
            else if (phase === 'CHARGING') phaseClass = 'charging';
            else if (phase === 'THRUSTING') phaseClass = 'thrusting';
            else if (phase === 'SCATTERING') phaseClass = 'scattering';
          }

          return (
            <div key={`${card.suit}-${card.rank}-${idx}`}
              className={phaseClass}
              style={{ margin: '0 5px', transition: 'all 0.3s ease' }}>
              <Card
                card={card}
                selected={isSelected && phase === 'IDLE'}
                onClick={() => handleCardClick(idx)}
              />
            </div>
          );
        })}
      </div>

      {/* Deck Stack - Moved higher */}
      <div className="card-deck-section" style={{ position: 'absolute', bottom: '100px', right: '40px', width: '90px', height: '120px' }}>
        <div className="card-deck-stack" style={{ position: 'relative', width: '100%', height: '100%' }}>
          {[0, 1, 2, 3].map(i => (
            <img
              key={i}
              src="/assets/cards/BACK2.png"
              alt="Deck"
              className="deck-card-image"
              style={{
                position: 'absolute',
                top: `${-i * 3}px`,
                right: `${i * 2}px`,
                width: '85px',
                height: '115px',
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
