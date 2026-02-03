// components/Common/HPBar.tsx

import React from 'react';
import '../styles/HPBar.css';

interface HPBarProps {
  hp: number;
  maxHp: number;
  label: string;
  color?: 'red' | 'blue';
  width?: number;
  height?: number;
}

export const HPBar: React.FC<HPBarProps> = ({
  hp,
  maxHp,
  label,
  color = 'red',
  width = 320,
  height = 300,
}) => {
  const ratio = Math.max(0, Math.min(1, hp / maxHp));
  const displayHp = Math.max(0, Math.ceil(hp));

  return (
    <div className={`hp-bar hp-bar-${color}`} style={{ width, height }}>
      <div className="hp-bar-background" />
      <div
        className="hp-bar-fill"
        style={{
          width: `${ratio * 100}%`,
          height: '100%',
        }}
      />
      <div className="hp-bar-text">
        {label}: {displayHp}/{maxHp}
      </div>
    </div>
  );
};
