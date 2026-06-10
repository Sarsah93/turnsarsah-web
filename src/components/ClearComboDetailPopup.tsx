import React from 'react';
import './styles/Modal.css';

interface ClearComboDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'KR' | 'EN';
  multiplier: number;
  isBroken: boolean;
}

export const ClearComboDetailPopup: React.FC<ClearComboDetailPopupProps> = ({
  isOpen,
  onClose,
  language,
  multiplier,
  isBroken,
}) => {
  if (!isOpen) return null;

  const title = language === 'KR' ? '클리어 콤보 상세 정보' : 'Clear Combo Details';
  const closeText = language === 'KR' ? '닫기' : 'CLOSE';

  // Determine current active multiplier
  const currentMultiplier = (isBroken || multiplier <= 1.0) ? 1.0 : multiplier;

  const getDetailContent = () => {
    if (language === 'KR') {
      return [
        {
          mult: 1.0,
          label: '클리어 콤보 1.0배 (비활성화)',
          desc: '클리어 콤보가 비활성화 상태입니다. +0%.',
          cond: '5턴 내 해당 스테이지 클리어 시, 다음 스테이지부터 플레이어의 추가 데미지 +20%',
        },
        {
          mult: 1.2,
          label: '클리어 콤보 1.2배',
          desc: '플레이어 추가 데미지 +20%.',
          cond: '4턴 내 해당 스테이지 클리어 시, 다음 스테이지부터 플레이어의 추가 데미지 +40%',
        },
        {
          mult: 1.4,
          label: '클리어 콤보 1.4배',
          desc: '플레이어 추가 데미지 +40%.',
          cond: '3턴 내 해당 스테이지 클리어 시, 다음 스테이지부터 플레이어의 추가 데미지 +60%',
        },
        {
          mult: 1.6,
          label: '클리어 콤보 1.6배',
          desc: '플레이어 추가 데미지 +60%.',
          cond: '2턴 내 해당 스테이지 클리어 시, 다음 스테이지부터 플레이어의 추가 데미지 +80%',
        },
        {
          mult: 1.8,
          label: '클리어 콤보 1.8배',
          desc: '플레이어 추가 데미지 +80%.',
          cond: '2턴 내 해당 스테이지 클리어 시, 다음 스테이지부터 플레이어의 추가 데미지 +80% 유지, 2턴 내 클리어 실패 시, 비활성화 상태(+0%)로 초기화',
        },
      ];
    } else {
      return [
        {
          mult: 1.0,
          label: 'Clear Combo 1.0x (Deactivated)',
          desc: 'Clear Combo is deactivated. +0%.',
          cond: 'Clear the stage within 5 turns to gain +20% Player Extra Damage from the next stage',
        },
        {
          mult: 1.2,
          label: 'Clear Combo 1.2x',
          desc: 'Player Extra Damage +20%.',
          cond: 'Clear the stage within 4 turns to gain +40% Player Extra Damage from the next stage',
        },
        {
          mult: 1.4,
          label: 'Clear Combo 1.4x',
          desc: 'Player Extra Damage +40%.',
          cond: 'Clear the stage within 3 turns to gain +60% Player Extra Damage from the next stage',
        },
        {
          mult: 1.6,
          label: 'Clear Combo 1.6x',
          desc: 'Player Extra Damage +60%.',
          cond: 'Clear the stage within 2 turns to gain +80% Player Extra Damage from the next stage',
        },
        {
          mult: 1.8,
          label: 'Clear Combo 1.8x',
          desc: 'Player Extra Damage +80%.',
          cond: 'Clear the stage within 2 turns to maintain +80% Player Extra Damage from the next stage, fail to clear within 2 turns resets to deactivated state (+0%)',
        },
      ];
    }
  };

  const details = getDetailContent();

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ width: '460px', borderColor: '#f1c40f', background: '#111116' }}>
        <div className="modal-header" style={{ borderBottom: '1.5px solid rgba(241,196,15,0.4)', background: '#181822' }}>
          <h2 className="modal-title" style={{ color: '#f1c40f', fontSize: '22px' }}>{title}</h2>
          <button className="modal-close-btn" onClick={onClose} style={{ borderColor: 'rgba(255,255,255,0.2)' }}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: '20px', fontSize: '14px', lineHeight: '1.6' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {details.map((item) => {
              const isActive = Math.abs(currentMultiplier - item.mult) < 0.05;
              return (
                <div
                  key={item.mult}
                  style={{
                    border: isActive ? '1.5px solid #f1c40f' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '12px',
                    background: isActive ? 'rgba(241, 196, 15, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    boxShadow: isActive ? '0 0 10px rgba(241, 196, 15, 0.15)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 'bold',
                      color: isActive ? '#f1c40f' : '#ccc',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '15px',
                    }}
                  >
                    <span>{isActive ? '▶' : '•'}</span>
                    <span>{item.label}</span>
                    {isActive && (
                      <span
                        style={{
                          fontSize: '11px',
                          background: '#f1c40f',
                          color: '#000',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          marginLeft: 'auto',
                        }}
                      >
                        {language === 'KR' ? '적용 중' : 'ACTIVE'}
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: '6px', color: isActive ? '#fff' : '#aaa' }}>
                    {item.desc}
                  </div>
                  <div style={{ fontSize: '12px', color: isActive ? '#ffd700' : '#888', marginTop: '4px' }}>
                    [{item.cond}]
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
