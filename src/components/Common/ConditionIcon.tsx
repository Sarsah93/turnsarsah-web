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
  if (name === 'Damage recoiling') filename = '데미지 반동(Damage Recoiling).png';
  if (name === 'Berserker') filename = '버서커(Berserker).png';
  if (name === 'Revival') filename = '부활(Revival).png';
  if (name === 'Invincible spirit') filename = '불굴의 의지(Invincible Spirit).png';
  if (name === 'Adrenaline secretion') filename = '아드레날린 분비(Adrenaline Secretion).png';
  if (name === 'Neurotoxicity') filename = '신경성 맹독(Neurotoxicity).png';
  if (name === 'Dehydration') filename = '탈수(Dehydration).png';

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
  } else if (name === 'Damage recoiling') {
    resolvedDesc = resolvedDesc.replace('{chance}', '30').replace('{bonus}', '20').replace('{recoil}', '10');
  } else if (name === 'Berserker') {
    resolvedDesc = resolvedDesc.replace('{threshold}', '30').replace('{atkBonus}', '15');
  } else if (name === 'Revival' && condition.data) {
    resolvedDesc = resolvedDesc.replace('{count}', ((condition.data as any).limit || 0).toString());
  } else if (name === 'Invincible spirit' && condition.data) {
    resolvedDesc = resolvedDesc.replace('{threshold}', '20').replace('{heal}', '50').replace('{count}', ((condition.data as any).limit || 0).toString());
  } else if (name === 'Adrenaline secretion') {
    resolvedDesc = resolvedDesc.replace('{limit}', '10');
  } else if (name === 'Neurotoxicity') {
    resolvedDesc = resolvedDesc.replace('{percent}', '20').replace('{dmg}', '15');
  } else if (name === 'Dehydration' && condition.data) {
    resolvedDesc = resolvedDesc.replace('{dmg}', ((condition.data as any).amount || 0).toString());
  }

  const countConds = ['Revival', 'Invincible spirit'];
  const isCountBased = countConds.includes(name);

  const durationText = condition.duration > 999
    ? (isCountBased
      ? `${(condition.data as any)?.limit || 0} ${(t.UI as any).USES_REMAINING}`
      : t.UI.PERMANENT)
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
