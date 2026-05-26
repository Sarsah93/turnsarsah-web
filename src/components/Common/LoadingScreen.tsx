// src/components/Common/LoadingScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../../state/gameStore';
import { getRandomTip } from '../../constants/loadingTips';
import './LoadingScreen.css';

interface LoadingScreenProps {
  progress: number; // 0~1
  phase: 'INITIAL' | 'GAME_ENTRY' | 'CHAPTER_TRANSITION';
}

const TIP_ROTATE_INTERVAL = 6500; // 6.5s

const LOADING_BG_IMAGES = [
  '/assets/backgrounds/loading/loading_cave.png',
  '/assets/backgrounds/loading/loading_deep forest.png',
  '/assets/backgrounds/loading/loading_desert.png',
  '/assets/backgrounds/loading/loading_meadow.png',
  '/assets/backgrounds/loading/loading_swamp.png',
];

function pickRandomBg(): string {
  return LOADING_BG_IMAGES[Math.floor(Math.random() * LOADING_BG_IMAGES.length)];
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, phase }) => {
  const percent = Math.floor(progress * 100);
  const language = useGameStore((s) => s.language);

  // 로딩 화면이 마운트될 때 배경을 한 번만 고정
  const [bgImage] = useState<string>(() => pickRandomBg());

  const [currentTip, setCurrentTip] = useState<string>(() =>
    phase !== 'INITIAL' ? getRandomTip(language) : ''
  );
  const [tipFading, setTipFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === 'INITIAL') return;

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
    <div
      className="loading-screen"
      style={{ backgroundImage: `url("${bgImage}")` }}
    >
      {/* 배경 위 어두운 오버레이 */}
      <div className="loading-bg-overlay" />

      <div className="loading-content-wrap">

        {/* 바 영역 */}
        <div className="loading-bar-wrapper">
          <div className="loading-bar-header">
            <span className="loading-phase-label">
              {phase === 'INITIAL' 
                ? 'LOADING...' 
                : phase === 'CHAPTER_TRANSITION' 
                  ? (language === 'KR' ? '챕터 이동 중...' : 'TRANSITIONING CHAPTER...') 
                  : 'PREPARING BATTLE...'}
            </span>
            <span className="loading-percent">({percent}%/100%)</span>
          </div>
          <div className="loading-bar-track">
            <div
              className="loading-bar-fill"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* 팁 */}
        {phase !== 'INITIAL' && currentTip && (
          <div className={`loading-tip ${tipFading ? 'tip-fading' : 'tip-visible'}`}>
            {currentTip}
          </div>
        )}

      </div>
    </div>
  );
};