import React, { useState } from 'react';
import { Condition } from '../../types/Character';
import '../styles/ConditionIcon.css';

interface ConditionIconProps {
  name: string;
  condition: Condition;
  popupDirection: 'bottom-left' | 'top-right';
}

export const ConditionIcon: React.FC<ConditionIconProps> = ({ name, condition, popupDirection }) => {
  const [showPopup, setShowPopup] = useState(false);

  let filename = `${name}.png`;
  if (name === 'Avoiding') filename = '회피(Avoiding).png';
  if (name === 'Immune') filename = '면역(Immune).png';
  if (name === 'Damage Reducing') filename = '피해감소(Damage Reducing).png';
  if (name === 'Heavy Bleeding') filename = 'Heavy Bleeding.png';
  if (name === 'Frailty') filename = 'Debilitating.png';
  if (name === 'Poison') filename = 'Poisoning.png';

  const iconPath = `/assets/conditions/${filename}`;

  const popupStyle: React.CSSProperties = popupDirection === 'bottom-left'
    ? { right: '0px', top: '100%', marginTop: '5px' }
    : { left: '0px', bottom: '100%', marginBottom: '5px' };

  return (
    <div
      className="condition-icon-wrapper"
      style={{ position: 'relative', pointerEvents: 'auto' }}
      onClick={() => setShowPopup(!showPopup)}
    >
      <div className="condition-icon" style={{ cursor: 'pointer', position: 'relative' }}>
        <img
          src={iconPath}
          alt={name}
          style={{ width: '45px', height: '45px', objectFit: 'contain' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        {/* Indicator for clickability? Maybe a subtle glow or just the cursor change */}
      </div>

      {showPopup && (
        <div
          className="condition-popup"
          style={{
            position: 'absolute',
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            border: '2px solid #f1c40f',
            borderRadius: '8px',
            padding: '12px',
            width: '260px',
            color: '#fff',
            fontSize: '1rem',
            fontFamily: "'Bebas Neue', sans-serif",
            boxShadow: '0 0 20px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            ...popupStyle
          }}
        >
          <div style={{ color: '#f1c40f', fontSize: '1.2rem', marginBottom: '4px', borderBottom: '1px solid #f1c40f' }}>
            {name.toUpperCase()}
          </div>
          <div style={{ lineHeight: '1.4' }}>
            {condition.desc || 'No description available.'}
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#aaa', textAlign: 'right' }}>
            {condition.duration > 999 ? 'PERMANENT' : `${condition.duration - condition.elapsed} TURNS REMAINING`}
          </div>
        </div>
      )}
    </div>
  );
};
