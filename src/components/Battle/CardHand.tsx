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

    // Show base damage (without critical) in preview
    const damageLabel = hasBlind ? '???' : Math.floor(result.baseDamage);
    const handTypeLabel = result.handType;
    const wildSuffix = hasJoker ? ' (WILD)' : '';

    return `Damage: ${damageLabel} ("${handTypeLabel}")${wildSuffix}`;
  }, [selectedIndices, cards, player.conditions]);

  type AnimPhase = 'IDLE' | 'GATHERING' | 'BUNCHING' | 'CHARGING' | 'THRUSTING' | 'SCATTERING';
  const [phase, setPhase] = useState<AnimPhase>('IDLE');

  const handleCardClick = (index: number) => {
    if (phase !== 'IDLE') return;
    if (onSelectCard) onSelectCard(index);

    // v2.0.0.5: Remove Card Selection SFX
    setSelectedIndices(prev => {
      const alreadySelected = prev.includes(index);
      if (alreadySelected) {
        return prev.filter(i => i !== index);
      } else {
        if (prev.length >= 8) return prev; // Up to 8 cards can be selected now? 
        // Actually, user said 8 cards hand, combo logic usually 5 max. 
        // I'll keep 5 max for combo but allow 8 cards in hand.
        if (prev.length >= 5) return prev;
        return [...prev, index];
      }
    });
  };

  const handleAttack = async () => {
    if (phase !== 'IDLE') return;

    if (selectedIndices.length === 0) {
      useGameStore.getState().setMessage("SELECT CARDS AT LEAST ONE");
      return;
    }

    // v2.0.0.7: Enhanced Animation Sequence
    // IDLE -> GATHERING (Center) -> CHARGING -> THRUSTING (To Boss) -> IMPACT (Crash) -> SCATTERING (Shatter)
    setPhase('GATHERING');
    AudioManager.playSFX('/assets/audio/player/shuffling.mp3');

    setTimeout(() => {
      setPhase('CHARGING');
    }, 600);

    setTimeout(() => {
      setPhase('THRUSTING');
    }, 900);

    setTimeout(() => {
      setPhase('SCATTERING'); // Trigger shatter/fade effect

      if (onAttack) {
        onAttack();
      } else {
        executePlayerAttack(selectedIndices);
      }

      // Keep cards in "Shattered" state (invisible but taking space) for a moment
      setTimeout(() => {
        // Now reset phase and Clear cards
        setPhase('IDLE');
        setSelectedIndices([]);
      }, 800);
    }, 1200);
  };

  const handleSwap = () => {
    if (phase !== 'IDLE') return;

    if (selectedIndices.length === 0) {
      useGameStore.getState().setMessage("SELECT CARDS AT LEAST ONE");
      return;
    }

    if ((player.drawsRemaining ?? 0) <= 0) return;

    // v2.0.0.5: Draw/Swap logic remains similar but could be revised per stage rules
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

      {/* Action Buttons - Normalized size v2.0.0.5 */}
      <div className="action-buttons">
        <div className="attack-button-wrapper">
          <BlockButton
            text="ATTACK"
            onClick={handleAttack}
            width="180px"
            disabled={phase !== 'IDLE'}
          />
        </div>
        <div className="draw-button-wrapper">
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
              className={`${phaseClass} card-appear`}
              style={{
                margin: '0 5px',
                transition: 'all 0.3s ease',
                animationDelay: `${idx * 0.05}s`,
                // v2.0.0.6 Fix: Hide cards if they are selected and we are in scattering phase or done
                // But wait, if we clear selectedIndices, 'isSelected' becomes false.
                // So we need to NOT clear selectedIndices until props change?
                // The issue: onAttack -> executePlayerAttack -> store.removePlayerCards
                // The store update might take a tick.
                // If we clear selectedIndices immediately, they pop back.
                // REVERT clearing selectedIndices immediately. Let them stay selected.
                // And rely on them being removed from 'cards' prop.
                height: '150px' // explicit height for layout
              }}>
              <Card
                card={card}
                selected={isSelected && phase === 'IDLE'}
                onClick={() => handleCardClick(idx)}
              />
            </div>
          );
        })}
      </div>

      {/* Deck Stack - Align with cards horizontally v2.0.0.5 */}
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
                top: `${-i * 2}px`, // Reduced stack height overlap
                right: `${i * 1}px`,
                width: '80px', // Slightly smaller to match card visually if needed
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
