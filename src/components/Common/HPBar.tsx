// components/Common/HPBar.tsx

import React from 'react';
import '../styles/HPBar.css';

interface HPBarProps {
  hp: number;
  maxHp: number;
  label: string;
  color?: 'red' | 'blue';
  align?: 'left' | 'right';
}

export const HPBar: React.FC<HPBarProps> = ({
  hp,
  maxHp,
  label,
  color = 'red',
  align = 'left',
}) => {
  const percentage = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const displayHp = Math.max(0, Math.ceil(hp));

  // Determine which specific PNG image to use
  const imgPath = color === 'red'
    ? '/assets/etc images/HP BAR_RED_IMAGE.png'
    : '/assets/etc images/HP BAR_BLUE_IMAGE.png';

  // For Boss (right aligned), we might want to clip from the left or right 
  // depending on design. Usually HP bars drain towards the empty side.
  // The user didn't specify drain direction, so standard left-to-right fill:
  // inset(0% (100-percentage)% 0% 0%)
  const clipPath = align === 'left'
    ? `inset(0% ${100 - percentage}% 0% 0%)`
    : `inset(0% 0% 0% ${100 - percentage}%)`; // Opposed for boss if requested, or same.
  // Let's assume boss drains from right to left (fill is on the right).
  // Actually, usually Bars fill from 'full' side.

  return (
    <div className={`hp-bar-container hp-bar-align-${align}`}>
      <div className={`hp-bar hp-bar-${color}`}>
        {/* The Base/Full image showing the 'frame' or background if any. 
            If the image is just the 'liquid', we need a rack. 
            The user said "ONLY use the image, no extra shapes". 
            So I'll use the image as the fill, perhaps with a dimmed version behind it?
            Actually, let's just use the image with clip-path. 
        */}
        <div className="hp-bar-track">
          {/* Dimmed background version of the same bar */}
          <img src={imgPath} alt="HP Bar Track" className="hp-bar-image hp-bar-image-bg" />
          {/* Clipped foreground version */}
          <img
            src={imgPath}
            alt="HP Bar Fill"
            className="hp-bar-image hp-bar-image-fill"
            style={{ clipPath }}
          />
        </div>

        <div className="hp-bar-text">
          {label}: {displayHp}/{maxHp}
        </div>
      </div>
    </div>
  );
};
