// src/components/Common/LoadingScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../../state/gameStore';
import { getRandomTip } from '../../constants/loadingTips';
import './LoadingScreen.css';

interface LoadingScreenProps {
  progress: number; // 0~1
  phase: 'INITIAL' | 'GAME_ENTRY';
}

const TIP_ROTATE_INTERVAL = 6500; // 6.5s

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, phase }) => {
  const percent = Math.floor(progress * 100);
  const language = useGameStore((s) => s.language);

  const [currentTip, setCurrentTip] = useState<string>(() =>
    phase === 'GAME_ENTRY' ? getRandomTip(language) : ''
  );
  const [tipFading, setTipFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== 'GAME_ENTRY') return;

    setCurrentTip(getRandomTip(language));

    intervalRef.current = setInterval(() => {
      setTipFading(true);
      setTimeout(() => {
        setCurrentTip(getRandomTip(language));
        setTipFading(false);
      }, 400);
    }, TIP_ROTATE_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, language]);

  return (
    <div className="loading-screen">
      <div className="loading-content-wrap">
        <div className="loading-phase-label">
          {phase === 'INITIAL' ? 'LOADING...' : 'PREPARING BATTLE...'}
        </div>

        <div className="loading-bar-track">
          <div
            className="loading-bar-fill"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="loading-percent">{percent}%</div>

        {phase === 'GAME_ENTRY' && currentTip && (
          <div className={`loading-tip ${tipFading ? 'tip-fading' : 'tip-visible'}`}>
            {currentTip}
          </div>
        )}
      </div>
    </div>
  );
};