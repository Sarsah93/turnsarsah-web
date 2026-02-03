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

  let titleText = '';
  if (duration >= 999) {
    if (name === 'Regenerating') {
      titleText = `${name}: Until Stage Clear`;
    } else if (name === 'Avoiding') {
      titleText = `${name}: Passive`;
    } else if (name === 'Damage Reducing') {
      titleText = `${name}: Stage Passive`;
    } else {
      titleText = `${name}: Permanent`;
    }
  } else {
    titleText = `${name}: ${turnsLeft} turns left`;
  }

  let displayDesc = desc;
  if (name === 'Damage Reducing' && data) {
    displayDesc = `Reduces damage by ${data}%.`;
  }

  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="tooltip-content">
          <div className="tooltip-title">{titleText}</div>
          <div className="tooltip-desc">{displayDesc}</div>
        </div>
      )}
    </div>
  );
};
