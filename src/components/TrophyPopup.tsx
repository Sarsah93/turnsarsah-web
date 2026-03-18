import React, { useEffect, useState } from 'react';
import { useGameStore } from '../state/gameStore';
import { TrophyDef } from '../constants/altarSystem';
import { BlockButton } from './BlockButton';

export const TrophyPopup: React.FC = () => {
    const { trophyPopup, setTrophyPopup, language } = useGameStore();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (trophyPopup) {
            setTimeout(() => setIsVisible(true), 50);
        } else {
            setIsVisible(false);
        }
    }, [trophyPopup]);

    if (!trophyPopup) return null;

    const t_acquired = language === 'KR' ? '전리품 획득!' : 'Trophy Acquired!';
    const t_confirm = language === 'KR' ? '확인' : 'CONFIRM';

    const handleConfirm = () => {
        setIsVisible(false);
        setTimeout(() => setTrophyPopup(null), 300);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.85)',
            transition: 'opacity 0.3s',
            opacity: isVisible ? 1 : 0,
        }}>
            <div style={{
                backgroundColor: '#1a1a2e',
                border: '2px solid #f1c40f',
                padding: '30px 40px',
                borderRadius: '12px',
                boxShadow: '0 0 40px rgba(241,196,15,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                maxWidth: '420px', width: '90%',
                transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
                transition: 'transform 0.4s ease-out',
                fontFamily: "'Bebas Neue', 'Noto Sans KR', sans-serif",
            }}>
                {/* Title */}
                <h2 style={{
                    color: '#f1c40f', fontSize: '2rem', fontWeight: 'bold',
                    marginBottom: '20px', textAlign: 'center',
                    textShadow: '0 0 10px rgba(241,196,15,0.5)',
                }}>
                    {t_acquired}
                </h2>

                {/* Trophy Image */}
                <div style={{
                    position: 'relative', width: '140px', height: '140px',
                    marginBottom: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: '#f1c40f', borderRadius: '50%',
                        filter: 'blur(25px)', opacity: 0.2,
                    }} />
                    <img
                        src={`/assets/trophy/${trophyPopup.image}`}
                        alt={trophyPopup.name[language]}
                        style={{
                            width: '100%', height: '100%', objectFit: 'contain',
                            position: 'relative', zIndex: 2,
                            filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.3))',
                        }}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                    />
                </div>

                {/* Chapter & Name & Description */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <p style={{ color: '#95a5a6', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
                        {trophyPopup.chapterInfo}
                    </p>
                    <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px', wordBreak: 'keep-all' }}>
                        {trophyPopup.name[language]}
                    </h3>
                    <p style={{ color: '#bdc3c7', fontSize: '0.95rem', fontStyle: 'italic' }}>
                        {trophyPopup.desc[language]}
                    </p>
                </div>

                {/* Confirm Button */}
                <div style={{ width: '100%', maxWidth: '200px' }}>
                    <BlockButton onClick={handleConfirm} text={t_confirm} />
                </div>
            </div>
        </div>
    );
};
