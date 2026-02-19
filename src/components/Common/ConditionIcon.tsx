import React, { useState } from 'react';
import { Condition } from '../../types/Character';
import { useGameStore } from '../../state/gameStore';
import { TRANSLATIONS } from '../../constants/translations';
import '../styles/ConditionIcon.css';

interface ConditionIconProps {
  name: string;
  condition: Condition;
  popupDirection: 'bottom-left' | 'top-right';
}

export const ConditionIcon: React.FC<ConditionIconProps> = ({ name, condition, popupDirection }) => {
  const [showPopup, setShowPopup] = useState(false);
  const { language } = useGameStore();
  const t = TRANSLATIONS[language];

  // Map functional names to translation keys (Upper Snake Case)
  const translationKey = name.toUpperCase().replace(/\s+/g, '_');
  const conditionInfo = (t.CONDITIONS as any)[translationKey] || { NAME: name, DESC: condition.desc };

  let filename = `${name}.png`;
  if (name === 'Avoiding') filename = '회피(Avoiding).png';
  if (name === 'Immune') filename = '면역(Immune).png';
  if (name === 'Damage Reducing') filename = '피해감소(Damage Reducing).png';
  if (name === 'Heavy Bleeding') filename = 'Heavy Bleeding.png';
  if (name === 'Frailty') filename = 'Debilitating.png';
  if (name === 'Poison') filename = 'Poisoning.png';
  if (name === 'Awakening') filename = 'Awakening.png';

  const iconPath = `/assets/conditions/${filename}`;

  const popupStyle: React.CSSProperties = popupDirection === 'bottom-left'
    ? { right: '0px', top: '100%', marginTop: '5px' }
    : { left: '0px', bottom: '100%', marginBottom: '5px' };

  // Resolve description with dynamic data if applicable
  let resolvedDesc = conditionInfo.DESC;
  if (name === 'Damage Reducing' && condition.data) {
    const percent = (condition.data as any).percent || 0;
    resolvedDesc = resolvedDesc.replace('{percent}', percent.toString());
  } else if (name === 'Avoiding' && condition.data) {
    const chance = Math.floor(((condition.data as any).chance || 0) * 100);
    resolvedDesc = resolvedDesc.replace('{percent}', chance.toString());
  }

  const durationText = condition.duration > 999
    ? t.UI.PERMANENT
    : `${condition.duration - condition.elapsed} ${t.UI.TURNS_REMAINING}`;

  return (
    <div
      className="condition-icon-wrapper"
      style={{ position: 'relative', pointerEvents: 'auto' }}
      onClick={() => setShowPopup(!showPopup)}
    >
      <div className="condition-icon" style={{
        cursor: 'pointer',
        position: 'relative',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: '50%',
        border: '1px solid rgba(241, 196, 15, 0.3)',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img
          src={iconPath}
          alt={name}
          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
          onError={(e) => {
            console.warn(`Condition icon failed to load: ${iconPath}`);
            e.currentTarget.style.display = 'none';
          }}
        />
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
            {conditionInfo.NAME.toUpperCase()}
          </div>
          <div style={{ lineHeight: '1.4' }}>
            {resolvedDesc}
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#aaa', textAlign: 'right' }}>
            {durationText}
          </div>
        </div>
      )}
    </div>
  );
};
