// components/Common/ConditionIcon.tsx

import React from 'react';
import { Condition } from '../../types/Character';
import { Tooltip } from './Tooltip';
import '../styles/ConditionIcon.css';

interface ConditionIconProps {
  name: string;
  condition: Condition;
}

export const ConditionIcon: React.FC<ConditionIconProps> = ({ name, condition }) => {
  let filename = `${name}.png`;
  if (name === 'Avoiding') filename = '회피(Avoiding).png';
  if (name === 'Immune') filename = '면역(Immune).png';
  if (name === 'Damage Reducing') filename = '피해감소(Damage Reducing).png';
  if (name === 'Heavy Bleeding') filename = 'Heavy Bleeding.png';
  if (name === 'Frailty') filename = 'Debilitating.png'; // Map Frailty to Debilitating icon
  if (name === 'Poison') filename = 'Poisoning.png'; // Handle potential naming mismatch

  const iconPath = `/assets/conditions/${filename}`;

  return (
    <Tooltip name={name} condition={condition}>
      <div className="condition-icon" style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
        <img
          src={iconPath}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
    </Tooltip>
  );
};
