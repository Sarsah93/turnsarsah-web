// src/components/Common/LoadingScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../../state/gameStore';
import { getRandomTip } from '../../constants/loadingTips';
import './LoadingScreen.css';

interface LoadingScreenProps {
  progress: number;         // 0~1
  phase: 'INITIAL' | 'GAME_ENTRY';
}

const TIP_ROTATE_INTERVAL = 5000; // 5초마다 팁 교체

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, phase }) => {
  const percent = Math.floor(progress * 100);
  const language = useGameStore((s) => s.language);

  // 팁 상태: GAME_ENTRY 단계에서만 표시
  const [currentTip, setCurrentTip] = useState<string>(() =>
    phase === 'GAME_ENTRY' ? getRandomTip(language) : ''
  );
  const [tipFading, setTipFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== 'GAME_ENTRY') return;

    // 첫 팁 설정
    setCurrentTip(getRandomTip(language));

    // 5초 주기로 팁 교체 (페이드 아웃 → 교체 → 페이드 인)
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
      {/* 로고 (Phase 2: GAME_ENTRY에서만) */}
      {phase === 'GAME_ENTRY' && (
        <img
          src="/assets/etc images/turnsarsah_logo_image.png"
          alt="Turn Sarsah"
          className="loading-logo"
        />
      )}

      {/* Phase 텍스트 */}
      <div className="loading-phase-label">
        {phase === 'INITIAL' ? 'LOADING...' : 'PREPARING BATTLE...'}
      </div>

      {/* 프로그레스 바 */}
      <div className="loading-bar-track">
        <div
          className="loading-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="loading-percent">{percent}%</div>

      {/* 팁 문구 (GAME_ENTRY에서만) */}
      {phase === 'GAME_ENTRY' && currentTip && (
        <div className={`loading-tip ${tipFading ? 'tip-fading' : 'tip-visible'}`}>
          {currentTip}
        </div>
      )}
    </div>
  );
};
