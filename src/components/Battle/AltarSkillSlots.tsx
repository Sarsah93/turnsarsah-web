import React, { useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { ALTAR_SKILLS } from '../../constants/altarSystem';
import { TRANSLATIONS } from '../../constants/translations';

export const AltarSkillSlots: React.FC = () => {
    const { equippedAltarSkills, language } = useGameStore();
    const t = TRANSLATIONS[language];
    const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

    const SLOTS_COUNT = 5;
    const slots = new Array(SLOTS_COUNT).fill(null);

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
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '12px',
                                background: isLocked
                                    ? 'rgba(0, 0, 0, 0.5)'
                                    : skill ? 'rgba(41, 128, 185, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                                border: `2px solid ${isLocked ? '#444' : skill ? '#3498db' : 'rgba(255,255,255,0.2)'}`,
                                boxShadow: skill ? '0 0 15px rgba(52, 152, 219, 0.6)' : 'none',
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
                                <img
                                    src={`/assets/altar skills/${skill.image}`}
                                    alt={skill.name[language]}
                                    style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                                />
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
                                    <div style={{ color: '#3498db', fontWeight: 'bold', marginBottom: '10px', fontSize: '1.3rem' }}>
                                        {skill.name[language]}
                                    </div>
                                    <div style={{ fontSize: '1.15rem', opacity: 0.95, lineHeight: '1.6', wordBreak: 'keep-all' }}>
                                        {skill.desc[language]}
                                    </div>
                                    <div style={{ marginTop: '12px', fontSize: '1rem', color: '#f1c40f', fontWeight: 'bold' }}>
                                        [{skill.duration[language]}]
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
