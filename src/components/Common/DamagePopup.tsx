// components/Common/DamagePopup.tsx

import React, { useEffect } from 'react';
import '../styles/DamagePopup.css';

interface DamagePopupProps {
  x: number;
  y: number;
  amount: number;
  isCritical?: boolean;
  isHeal?: boolean;
  label?: string;
  onComplete?: () => void;
}

export const DamagePopup: React.FC<DamagePopupProps> = ({
  x,
  y,
  amount,
  isCritical = false,
  isHeal = false,
  label = '',
  onComplete,
}) => {
  useEffect(() => {
    const duration = 800; // ms - should match CSS animation
    const t = setTimeout(() => {
      onComplete?.();
    }, duration);
    return () => clearTimeout(t);
  }, [onComplete]);

  const displayText = amount === 0 && !isHeal ? 'Miss' : `${label ? label + ' ' : ''}${isHeal ? '+' : '-'}${amount}`;

  return (
    <div
      className={`damage-popup ${isCritical ? 'critical' : ''} ${isHeal ? 'heal' : ''}`}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
    >
      {isCritical && <div className="damage-popup-critical">CRITICAL!</div>}
      <div className="damage-popup-text">{displayText}</div>
    </div>
  );
};