import React, { useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { ALTAR_SKILLS } from '../../constants/altarSystem';
import { TRANSLATIONS } from '../../constants/translations';
import { AudioManager } from '../../utils/AudioManager';

export const AltarSkillSlots: React.FC = () => {
    const { equippedAltarSkills, language, isDyschromatopsiaActive, setDyschromatopsiaActive, dyschromatopsiaUses } = useGameStore();

    const t = TRANSLATIONS[language];
    const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

    const SLOTS_COUNT = 5;
    const slots = new Array(SLOTS_COUNT).fill(null);

    const handleSkillClick = (skillId: string) => {
        if (skillId === '4A-1') {
            if (dyschromatopsiaUses >= 1) return;
            setDyschromatopsiaActive(!isDyschromatopsiaActive);
            AudioManager.playSFX('/assets/audio/player/shuffling.mp3');
        }
    };

    return (
        <div className="altar-skill-slots-container" style={{
            position: 'absolute',
            left: '12px',
            top: '180px',
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 100,
            pointerEvents: 'auto',
            backdropFilter: 'blur(8px)'
        }}>
            <div className="altar-skill-slots" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}>
                {slots.map((_, idx) => {
                    const skillId = equippedAltarSkills[idx];
                    const skill = skillId ? ALTAR_SKILLS[skillId] : null;
                    const isLocked = idx === 4;

                    return (
                        <div
                            key={idx}
                            onClick={() => skill && handleSkillClick(skillId)}
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '12px',
                                background: isLocked
                                    ? 'rgba(0, 0, 0, 0.5)'
                                    : skill ? (skillId === '4A-1' && isDyschromatopsiaActive ? 'rgba(231, 76, 60, 0.4)' : 'rgba(41, 128, 185, 0.4)') : 'rgba(255, 255, 255, 0.1)',
                                border: `2px solid ${isLocked ? '#444' : (skillId === '4A-1' && isDyschromatopsiaActive ? '#e74c3c' : (skill ? '#3498db' : 'rgba(255,255,255,0.2)'))}`,
                                boxShadow: (skillId === '4A-1' && isDyschromatopsiaActive) ? '0 0 20px rgba(231, 76, 60, 0.8)' : (skill ? '0 0 15px rgba(52, 152, 219, 0.6)' : 'none'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                cursor: skill ? 'pointer' : 'default',
                            }}
                            onMouseEnter={() => skill && setHoveredSkill(skillId)}
                            onMouseLeave={() => setHoveredSkill(null)}
                        >
                            {isLocked ? (
                                <span style={{ fontSize: '0.8rem', color: '#888', fontFamily: 'BebasNeue', fontWeight: 'bold' }}>LOCKED</span>
                            ) : skill ? (
                                <>
                                    <img
                                        src={`/assets/altar skills/${skill.image}`}
                                        alt={skill.name[language]}
                                        style={{ 
                                            width: '48px', 
                                            height: '48px', 
                                            objectFit: 'contain',
                                            opacity: (skillId === '4A-1' && dyschromatopsiaUses >= 1) ? 0.5 : 1,
                                            filter: (skillId === '4A-1' && dyschromatopsiaUses >= 1) ? 'grayscale(100%)' : 'none'
                                        }}
                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                                    />
                                    {skillId === '4A-1' && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-5px',
                                            right: '-5px',
                                            backgroundColor: '#e74c3c',
                                            color: '#fff',
                                            fontSize: '0.7rem',
                                            padding: '2px 4px',
                                            borderRadius: '4px',
                                            border: '1px solid #fff',
                                            opacity: dyschromatopsiaUses >= 1 ? 0.5 : 1
                                        }}>
                                            {dyschromatopsiaUses}/1
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ width: '28px', height: '28px', border: '1px dashed rgba(255,255,255,0.3)', borderRadius: '4px' }} />
                            )}

                            {/* Tooltip */}
                            {hoveredSkill === skillId && skill && (
                                <div style={{
                                    position: 'absolute',
                                    left: '80px',
                                    top: '-10px',
                                    width: '350px', // Increased width
                                    background: 'rgba(0, 0, 0, 0.95)',
                                    border: '2px solid #3498db',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    color: '#fff',
                                    zIndex: 1000,
                                    pointerEvents: 'none',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                                    animation: 'fadeIn 0.2s ease',
                                    backdropFilter: 'blur(10px)',
                                    fontFamily: "'Noto Sans KR', sans-serif"
                                }}>
                                    <div style={{ color: '#3498db', fontWeight: 'bold', marginBottom: '8px', fontSize: '1.4rem', borderBottom: '1px solid rgba(52,152,219,0.3)', paddingBottom: '6px' }}>
                                        {skill.name[language]}
                                    </div>
                                    <div style={{ fontSize: '1.1rem', opacity: 0.85, lineHeight: '1.5', wordBreak: 'keep-all', color: '#bdc3c7', fontStyle: 'italic', marginBottom: '12px' }}>
                                        {skill.desc[language]}
                                    </div>
                                    <div style={{
                                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #2ecc71',
                                        marginBottom: '10px'
                                    }}>
                                        <div style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>
                                            {language === 'KR' ? '■ 효과 (EFFECT)' : '■ EFFECT'}
                                        </div>
                                        <div style={{ fontSize: '1.2rem', lineHeight: '1.5', color: '#fff' }}>
                                            {skill.effect[language]}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        fontSize: '1rem', 
                                        color: (skillId === '4A-1' && dyschromatopsiaUses >= 1) ? '#e74c3c' : '#f1c40f', 
                                        fontWeight: 'bold', 
                                        textAlign: 'right' 
                                    }}>
                                        {skillId === '4A-1' && dyschromatopsiaUses >= 1 
                                            ? (language === 'KR' ? '[이미 사용함 (1/1)]' : '[Already Used (1/1)]')
                                            : `[${skill.duration[language]}]`
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(-5px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};
