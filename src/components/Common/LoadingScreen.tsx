// src/components/Common/LoadingScreen.tsx

import React from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  progress: number;         // 0~1
  phase: 'INITIAL' | 'GAME_ENTRY';
  tipText?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress, phase, tipText
}) => {
  const percent = Math.floor(progress * 100);

  return (
    <div className="loading-screen" style={{
      position: 'absolute', inset: 0, zIndex: 999998,
      background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Bebas Neue', sans-serif",
    }}>
      {/* 로고 (Phase 2에서만) */}
      {phase === 'GAME_ENTRY' && (
        <img src="/assets/etc images/turnsarsah_logo_image.png"
             alt="Logo" style={{ width: '400px', marginBottom: '40px' }} />
      )}

      {/* 프로그레스 바 */}
      <div style={{
        width: '500px', height: '12px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '6px', overflow: 'hidden',
        border: '1px solid rgba(241,196,15,0.3)',
      }}>
        <div style={{
          width: `${percent}%`, height: '100%',
          background: 'linear-gradient(90deg, #f39c12, #f1c40f)',
          transition: 'width 0.3s ease-out',
          borderRadius: '6px',
          boxShadow: '0 0 10px rgba(241,196,15,0.5)',
        }} />
      </div>

      <div style={{
        color: '#f1c40f', fontSize: '2.5rem',
        marginTop: '16px', letterSpacing: '2px'
      }}>
        {percent}%
      </div>

      {/* 팁 문구 */}
      {tipText && (
        <div style={{
          color: '#ecf0f1', fontSize: '1.4rem',
          marginTop: '30px', maxWidth: '600px',
          textAlign: 'center', lineHeight: 1.5,
          fontFamily: "'Noto Sans KR', sans-serif",
        }}>
          {tipText}
        </div>
      )}
    </div>
  );
};
