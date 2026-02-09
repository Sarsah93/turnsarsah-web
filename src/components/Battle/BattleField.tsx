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

export const BattleField: React.FC<BattleFieldProps> = ({ player, bot, stageNum = 1, popups = [], onRemovePopup, onMeasure }) => {
  // Refs to measure element positions for popup placement
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const bossRef = React.useRef<HTMLDivElement | null>(null);
  const playerRef = React.useRef<HTMLDivElement | null>(null);

  // Map boss names to image filenames per v2.0.0.5 requirements
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
      'Tutorial Bot': 'tutorial_bot.png',
    };
    const pathPrefix = '/assets/boss_goblin/';
    return `${pathPrefix}${nameMap[bossName] || 're_Goblin_01.png'}`;
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
      ? { x: botRect.left - cRect.left + botRect.width / 2, y: botRect.top - cRect.top + botRect.height / 2 + 50, w: botRect.width, h: botRect.height }
      : null;
    const playerPos = playerRect
      ? { x: playerRect.left - cRect.left + playerRect.width / 2, y: playerRect.top - cRect.top - 20, w: playerRect.width, h: playerRect.height }
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
      {/* Boss HP Bar & Conditions (New grouping for better alignment) */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '5px',
        zIndex: 60
      }}>
        <HPBar
          hp={bot.hp}
          maxHp={bot.maxHp}
          label="BOSS"
          color="red"
          align="right"
          fontSize="2.2rem"
        />
        <div className="boss-conditions" style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', paddingRight: '10px', zIndex: 2000, position: 'relative', pointerEvents: 'auto' }}>
          {Array.from(bot.conditions.entries()).map(([name, condition]) => (
            <ConditionIcon key={name} name={name} condition={condition} popupDirection="bottom-left" />
          ))}
        </div>
      </div>

      {/* Boss Stats Overlay - Just Stats/Rules now */}
      <div className="boss-stats-overlay" style={{
        position: 'absolute',
        top: '120px', // Shifted down slightly to avoid conditions
        right: '25px',
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '5px',
        zIndex: 50
      }}>
        <div style={{
          color: '#fff',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '2.2rem',
          textShadow: '2px 2px 2px #000',
          textAlign: 'right'
        }}>
          <div style={{ color: '#fff' }}>ATK: {bot.atk}</div>
          <div style={{ color: '#f1c40f' }}>
            RULE: {bot.activeRules && bot.activeRules.length > 0 ? (bot.activeRules[0] as any).desc || (bot.activeRules[0] as any)[0] : 'NONE'}
          </div>
        </div>
      </div>

      {/* Stage Number - Top Left */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: '#fff',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '2.5rem',
        textShadow: '2px 2px 4px #000',
        zIndex: 100
      }}>
        STAGE {stageNum}
      </div>

      {/* Boss Portrait - Centered but higher and smaller (v2.0.0.5) */}
      <div style={{
        position: 'absolute',
        top: '2%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <div className={`boss-portrait ${bot.animState === 'ATTACK' ? 'animate-thrust-down' : bot.animState === 'HIT' ? 'animate-hit-shake' : ''}`} ref={bossRef} style={{ width: '260px', height: '260px', margin: 0 }}>
          <img src={getBossImagePath(bot.name)} alt={bot.name} className="boss-image" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div className="boss-name" style={{ fontSize: '2.2rem', color: '#f1c40f', marginTop: '0px', fontFamily: "'Bebas Neue', sans-serif" }}>
          {bot.name.toUpperCase()}
        </div>
      </div>

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

      {/* Player Section - Bottom Left */}
      <div className={`player-section ${player.animState === 'HIT' ? 'animate-hit-shake' : ''}`} ref={playerRef} style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        width: '420px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        <div className="player-conditions" style={{
          paddingLeft: '10px',
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-start',
          marginBottom: '5px',
          minHeight: '40px', // Ensure space for icons
          zIndex: 200,
          position: 'relative'
        }}>
          {Array.from(player.conditions.entries()).map(([name, condition]) => (
            <ConditionIcon key={name} name={name} condition={condition} popupDirection="top-right" />
          ))}
        </div>
        <HPBar
          hp={player.hp}
          maxHp={player.maxHp}
          label="PLAYER"
          color="blue"
          align="left"
          fontSize="2.2rem"
        />
      </div>
    </div>
  );
};

export default BattleField;
