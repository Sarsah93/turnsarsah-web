// components/Battle/BattleField.tsx

import React, { useEffect, useState } from 'react';
import { HPBar, ConditionIcon, DamagePopup } from '../Common';
import { Character } from '../../types/Character';
import '../styles/BattleField.css';

interface BattleFieldProps {
  player: Character;
  bot: Character;
  stageNum?: number;
  popups?: DamagePopupState[];
  onRemovePopup?: (id: string) => void;
  onMeasure?: (positions: { player: { x: number; y: number; w: number; h: number } | null; bot: { x: number; y: number; w: number; h: number } | null; scale: number }) => void;
  onMeasureBoss?: (data: { centerX: number; centerY: number; bottom: number }) => void;
  screenShake?: boolean;
}

interface DamagePopupState {
  id: string;
  x: number;
  y: number;
  amount: number;
  isCritical: boolean;
  isHeal: boolean;
}

export const BattleField: React.FC<BattleFieldProps> = ({ player, bot, stageNum = 1, popups = [], onRemovePopup, onMeasure, onMeasureBoss }) => {
  // Refs to measure element positions for popup placement
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const bossRef = React.useRef<HTMLDivElement | null>(null);
  const bossAvatarRef = React.useRef<HTMLDivElement | null>(null);
  const playerRef = React.useRef<HTMLDivElement | null>(null);
  const lastBossData = React.useRef({ centerX: 0, centerY: 0, bottom: 0 });
  const lastMeasureData = React.useRef<string>('');

  // Map boss names to image filenames per v2.0.0.5 requirements
  const getBossImagePath = (bossName: string): string => {
    const nameMap: Record<string, string> = {
      'Goblin': '01_goblin.png',
      'Goblin Skirmisher': '02_goblin skirmisher.png',
      'Goblin Rider': '03_goblin rider.png',
      'Hobgoblin': '04_hobgoblin.png',
      'Goblin Shaman': '05_goblin shaman.png',
      'Golden Goblin': '06_golden goblin.png',
      'Elite Goblin': '07_elite goblin.png',
      'Troll': '08_troll.png',
      'Giant Goblin': '09_giant goblin.png',
      'Goblin Lord': '10_goblin lord.png',
      'Tutorial Bot': 'tutorial_bot.png',
    };
    const pathPrefix = '/assets/boss_goblin/';
    return `${pathPrefix}${nameMap[bossName] || '01_goblin.png'}`;
  };

  // Measure positions and report to parent (relative to container)
  const measure = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const currentScale = cRect.width / 1600; // v2.4.7: Scale normalization

    const botRect = bossRef.current?.getBoundingClientRect() ?? null;
    const playerRect = playerRef.current?.getBoundingClientRect() ?? null;

    const bot = botRect
      ? {
        x: (botRect.left - cRect.left + botRect.width / 2) / currentScale,
        y: (botRect.top - cRect.top + botRect.height / 2 + 50) / currentScale,
        w: botRect.width / currentScale,
        h: botRect.height / currentScale
      }
      : null;
    const playerPos = playerRect
      ? {
        x: (playerRect.left - cRect.left + playerRect.width / 2) / currentScale,
        y: (playerRect.top - cRect.top - 20) / currentScale,
        w: playerRect.width / currentScale,
        h: playerRect.height / currentScale
      }
      : null;

    const stringified = JSON.stringify({ playerPos, bot, scale: currentScale });
    if (stringified !== lastMeasureData.current) {
      lastMeasureData.current = stringified;
      onMeasure?.({ player: playerPos, bot, scale: currentScale });
    }

    // Precise Boss Center Y reporting (v2.4.3) - Converted to logical pixels (v2.4.7)
    const bossAvatar = bossAvatarRef.current;
    if (bossAvatar && container) {
      const bRect = bossAvatar.getBoundingClientRect();
      const centerX = ((bRect.left - cRect.left) + (bRect.width / 2)) / currentScale;
      const centerY = ((bRect.top - cRect.top) + (bRect.height / 2)) / currentScale;
      const bottom = (bRect.bottom - cRect.top) / currentScale;

      if (Math.abs(lastBossData.current.centerX - centerX) > 0.1 ||
        Math.abs(lastBossData.current.centerY - centerY) > 0.1 ||
        Math.abs(lastBossData.current.bottom - bottom) > 0.1) {
        lastBossData.current = { centerX, centerY, bottom };
        onMeasureBoss?.({ centerX, centerY, bottom });
      }
    }
  }, [onMeasure, onMeasureBoss, stageNum]);

  React.useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  return (
    <div className="battlefield">
      {/* Damage Popups Area */}
      <div className="popups-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {popups.map((popup) => (
          <DamagePopup
            key={popup.id}
            x={popup.x}
            y={popup.y}
            amount={popup.amount}
            isCritical={popup.isCritical}
            isHeal={popup.isHeal}
            onComplete={() => onRemovePopup?.(popup.id)}
          />
        ))}
      </div>

      {/* Invisible anchors for Damage Popups (referenced by onMeasure) */}
      <div
        ref={bossRef}
        style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          width: '1px',
          height: '1px',
          pointerEvents: 'none'
        }}
      />

      {/* Actual Boss Visual Target Ref */}
      <div
        ref={bossAvatarRef}
        style={{
          position: 'absolute',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '450px',
          height: '450px',
          pointerEvents: 'none'
        }}
      />

      <div
        ref={playerRef}
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '25%',
          width: '1px',
          height: '1px',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default BattleField;
