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
  const timerRef = React.useRef<any>(null);

  const { duration, elapsed, desc, data } = condition;
  const turnsLeft = Math.max(0, duration - elapsed);

  let displayDesc = desc;
  if (name === 'Damage Reducing' && data) {
    displayDesc = `Reduces damage by ${data}%.`;
  }

  const displayTitle = name.toUpperCase();

  const toggleVisible = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(!visible);
  };

  // Close when clicking outside
  React.useEffect(() => {
    if (!visible) return;
    const handleClickOutside = () => setVisible(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [visible]);

  return (
    <div
      className="tooltip-container"
      onClick={toggleVisible}
      style={{ position: 'relative', display: 'inline-block', cursor: 'pointer', pointerEvents: 'auto' }}
    >
      {children}
      {visible && (
        <>

          <div
            className="tooltip-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              backgroundColor: 'rgba(20, 20, 20, 0.98)',
              border: '2px solid #f1c40f',
              padding: '12px 18px',
              borderRadius: '2px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.9)',
              minWidth: '280px',
              zIndex: 30000,
              color: '#fff',
              textAlign: 'left',
              position: 'absolute',
              bottom: '125%', // Adjacent to icon top
              left: '0%', // Left-aligned like the screenshot
              transform: 'none',
              pointerEvents: 'auto'
            }}
          >
            <div style={{ color: '#f1c40f', fontSize: '1.8rem', marginBottom: '8px', borderBottom: '1px solid #444', paddingBottom: '4px' }}>
              {displayTitle}: {turnsLeft} TURNS LEFT
            </div>
            <div style={{ fontSize: '1.3rem', color: '#fff', textTransform: 'uppercase', lineHeight: '1.4' }}>{displayDesc}</div>
          </div>
        </>
      )}
    </div>
  );
};
