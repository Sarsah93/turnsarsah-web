// components/Battle/BattleField.tsx

import React, { useEffect, useState } from 'react';
import { HPBar, ConditionIcon, DamagePopup } from '../Common';
import { Character } from '../../types/Character';
import '../styles/BattleField.css';

interface BattleFieldProps {
  player: Character;
  bot: Character;
  popups?: DamagePopupState[];
  onRemovePopup?: (id: string) => void;
  onMeasure?: (positions: { player: { x: number; y: number; w: number; h: number } | null; bot: { x: number; y: number; w: number; h: number } | null; scale: number }) => void;
}

interface DamagePopupState {
  id: string;
  x: number;
  y: number;
  amount: number;
  isCritical: boolean;
  isHeal: boolean;
}

const BattleField: React.FC<BattleFieldProps> = ({ player, bot, popups = [], onRemovePopup, onMeasure }) => {
  // Refs to measure element positions for popup placement
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const bossRef = React.useRef<HTMLDivElement | null>(null);
  const playerRef = React.useRef<HTMLDivElement | null>(null);

  // Map boss names to image filenames
  const getBossImagePath = (bossName: string): string => {
    const nameMap: Record<string, string> = {
      'Goblin': 're_Goblin_01.png',
      'Goblin Skirmisher': 're_Goblin Skirmisher_02.png',
      'Goblin Rider': 're_Goblin Rider_03.png',
      'Hobgoblin': 're_HobGoblin_04.png',
      'Goblin Shaman': 're_Goblin Shaman_05.png',
      'Golden Goblin': 're_Golden Goblin_06.png',
      'Elite Goblin': 're_Elite Goblin_07.png',
      'Troll': 're_Troll_08.png',
      'Giant Goblin': 're_Giant Goblin_09.png',
      'Goblin Lord': 're_Goblin Lord_10.png',
    };
    return `/assets/boss_goblin/${nameMap[bossName] || 're_Goblin_01.png'}`;
  };

  // Measure positions and report to parent (relative to container)
  const measure = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    const botRect = bossRef.current?.getBoundingClientRect() ?? null;
    const playerRect = playerRef.current?.getBoundingClientRect() ?? null;

    const scale = window.devicePixelRatio || 1;

    const bot = botRect
      ? { x: botRect.left - cRect.left + botRect.width / 2, y: botRect.top - cRect.top + botRect.height / 2, w: botRect.width, h: botRect.height }
      : null;
    const playerPos = playerRect
      ? { x: playerRect.left - cRect.left + playerRect.width / 2, y: playerRect.top - cRect.top + playerRect.height / 2, w: playerRect.width, h: playerRect.height }
      : null;

    onMeasure?.({ player: playerPos, bot, scale });
  }, [onMeasure]);

  React.useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  return (
    <div className="battlefield">
      {/* Boss Section */}
      <div className="boss-section" ref={containerRef}>
        <div className="boss-name">{bot.name}</div>
        <div className="boss-portrait" ref={bossRef}>
          <img src={getBossImagePath(bot.name)} alt={bot.name} className="boss-image" />
        </div>
        <HPBar
          hp={bot.hp}
          maxHp={bot.maxHp}
          label="BOSS"
          color="red"
          width={400}
          height={40}
        />
        <div className="boss-conditions">
          {Array.from(bot.conditions.entries()).map(([name, condition]) => (
            <ConditionIcon key={name} name={name} condition={condition} />
          ))}
        </div>
      </div>

      {/* Damage Popups */}
      <div className="popups-container">
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

      {/* Player Section */}
      <div className="player-section" ref={playerRef}>
        <HPBar
          hp={player.hp}
          maxHp={player.maxHp}
          label="PLAYER"
          color="blue"
          width={400}
          height={40}
        />
        <div className="player-conditions">
          {Array.from(player.conditions.entries()).map(([name, condition]) => (
            <ConditionIcon key={name} name={name} condition={condition} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattleField;
