// components/Common/HPBar.tsx

import React from 'react';
import '../styles/HPBar.css';
import { HpBarMasked } from './HpBarMasked';

interface HPBarProps {
  hp: number;
  maxHp: number;
  label: string;
  color?: 'red' | 'blue';
  align?: 'left' | 'right';
  fontSize?: string;
}

export const HPBar: React.FC<HPBarProps> = ({
  hp,
  maxHp,
  label,
  color = 'red',
  align = 'left',
  fontSize = '2.2rem'
}) => {
  const percentage = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const displayHp = Math.max(0, Math.ceil(hp));

  const imgPath = color === 'red'
    ? '/assets/etc images/HP BAR_RED_IMAGE.png'
    : '/assets/etc images/HP BAR_BLUE_IMAGE.png';

  return (
    <div className={`hp-bar-container hp-bar-align-${align}`}>
      <div className="hp-bar" style={{ position: 'relative', width: '500px', height: '125px' }}>
        <div className="hp-bar-track" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
          <HpBarMasked
            src={imgPath}
            variant={color === 'red' ? 'boss' : 'player'}
            hp01={percentage / 100}
          />
        </div>

        <div className="hp-bar-text" style={{
          position: 'relative',
          zIndex: 3,
          fontSize: fontSize,
          fontFamily: "'Bebas Neue', sans-serif",
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          paddingLeft: '5%', // Slight bias to the right to match CYL center
          pointerEvents: 'none'
        }}>
          {label}: {displayHp}/{maxHp}
        </div>
      </div>
    </div>
  );
};
