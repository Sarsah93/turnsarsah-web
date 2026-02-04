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
    const duration = 700; // ms - should match CSS animation
    const t = setTimeout(() => {
      onComplete?.();
    }, duration);
    return () => clearTimeout(t);
  }, [onComplete]);

  const displayText = amount === 0 && !isHeal
    ? 'Miss'
    : isCritical
      ? `Critical - ${amount}`
      : `${label ? label + ' ' : ''}${isHeal ? '+' : '-'}${amount}`;

  const textColor = isHeal
    ? '#2ecc71'
    : isCritical
      ? '#f1c40f'
      : '#e74c3c';

  const fontSize = isCritical ? '3.2rem' : '3rem';
  const fontWeight = isCritical ? 'bold' : 'normal';

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        fontFamily: 'BebasNeue',
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: textColor,
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
        pointerEvents: 'none',
        zIndex: 10000,
        animation: 'floatUp 1.5s ease-out forwards',
        opacity: 1,
      }}
    >
      {displayText}
    </div>
  );
};