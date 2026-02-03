// components/Common/Tooltip.tsx

import React, { useState } from 'react';
import { Condition } from '../../types/Character';
import '../styles/Tooltip.css';

interface TooltipProps {
  name: string;
  condition: Condition;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ name, condition, children }) => {
  const [visible, setVisible] = useState(false);
  const { duration, elapsed, desc, data } = condition;
  const turnsLeft = Math.max(0, duration - elapsed);

  let displayDesc = desc;
  if (name === 'Damage Reducing' && data) {
    displayDesc = `Reduces damage by ${data}%.`;
  }

  // Stage name mapping for title consistency
  const displayTitle = name.toUpperCase();

  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="tooltip-content" style={{
          fontFamily: "'Bebas Neue', sans-serif",
          backgroundColor: 'rgba(0,0,0,0.95)',
          border: '2px solid #f1c40f',
          padding: '12px 18px',
          borderRadius: '2px',
          boxShadow: '0 0 15px rgba(0,0,0,0.8)',
          minWidth: '240px',
          zIndex: 2000,
          color: '#fff',
          textAlign: 'left',
          position: 'absolute',
          bottom: '130%',
          left: '0',
          transform: 'translateX(0)',
          pointerEvents: 'none'
        }}>
          <div style={{ color: '#f1c40f', fontSize: '1.8rem', marginBottom: '8px', borderBottom: '1px solid #444', paddingBottom: '4px' }}>
            {displayTitle}: {turnsLeft} TURNS LEFT
          </div>
          <div style={{ fontSize: '1.2rem', color: '#fff', textTransform: 'uppercase' }}>{displayDesc}</div>
        </div>
      )}
    </div>
  );
};
