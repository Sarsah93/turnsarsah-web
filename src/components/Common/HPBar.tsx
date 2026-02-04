// components/Common/HPBar.tsx

import React from 'react';
import '../styles/HPBar.css';

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

  // Determine which specific PNG image to use
  const imgPath = color === 'red'
    ? '/assets/etc images/HP BAR_RED_IMAGE.png'
    : '/assets/etc images/HP BAR_BLUE_IMAGE.png';

  // v2.0.0.5: Drains from right to left for both player and boss
  // So we clip the right side as percentage decreases.
  const clipPath = `inset(0% ${100 - percentage}% 0% 0%)`;

  // v2.0.0.5: Normalize font size and shift HP text slightly right
  return (
    <div className={`hp-bar-container hp-bar-align-${align}`}>
      <div className={`hp-bar hp-bar-${color}`}>
        <div className="hp-bar-track">
          {/* Background 'Normal' version */}
          <img src={imgPath} alt="HP Bar Track" className="hp-bar-image hp-bar-image-bg" />

          {/* Foreground 'Fill' version */}
          <img
            src={imgPath}
            alt="HP Bar Fill"
            className="hp-bar-image hp-bar-image-fill"
            style={{ clipPath, transition: 'clip-path 0.5s ease-out' }}
          />
        </div>

        <div className="hp-bar-text" style={{
          fontSize: `calc(${fontSize} * 0.5)`, // Half the size
          fontFamily: "'Bebas Neue', sans-serif",
          paddingLeft: '40px' // Shifted right
        }}>
          {label}: {displayHp}/{maxHp}
        </div>
      </div>
    </div>
  );
};
