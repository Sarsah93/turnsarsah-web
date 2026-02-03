import React from 'react';
import { useGameStore } from '../../state/gameStore';

export const BossDisplay: React.FC = () => {
    const { bot, stageNum } = useGameStore();

    // Simple HP Bar calculation
    const hpPercent = Math.max(0, (bot.hp / bot.maxHp) * 100);

    // Map stage number to filename
    const getBossImage = (stage: number) => {
        const mapping: Record<number, string> = {
            1: 're_Goblin_01.png',
            2: 're_Goblin Skirmisher_02.png',
            3: 're_Goblin Rider_03.png',
            4: 're_HobGoblin_04.png',
            5: 're_Goblin Shaman_05.png',
            6: 're_Golden Goblin_06.png',
            7: 're_Elite Goblin_07.png',
            8: 're_Troll_08.png',
            9: 're_Giant Goblin_09.png',
            10: 're_Goblin Lord_10.png'
        };
        const filename = mapping[stage] || 're_Goblin_01.png';
        return `/assets/boss_goblin/${filename}`;
    };

    return (
        <div className="boss-display" style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none' // Let clicks pass through to background if needed
        }}>
            {/* Top Right HP Bar (Custom Image Background) */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '40px',
                width: '500px', // Wider
                height: '120px', // Taller (3x approx)
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* Background Image Container */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: `url('/assets/etc images/HP BAR_RED_IMAGE.png')`,
                    backgroundSize: '100% 100%',
                    zIndex: 1
                }} />

                {/* HP Fill - Removed duplicate background bar if any, aligning with red bar image */}
                <div style={{
                    position: 'absolute',
                    top: '32px', left: '85px', // Adjusted for larger bar image
                    width: '385px', height: '45px',
                    background: 'transparent',
                    zIndex: 0,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${hpPercent}%`,
                        height: '100%',
                        backgroundColor: '#c0392b',
                        transition: 'width 0.3s ease-out'
                    }} />
                </div>

                {/* Text Overlay */}
                <div style={{ zIndex: 2, fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', textShadow: '2px 2px 4px #000', marginTop: '-5px', fontFamily: 'BebasNeue' }}>
                    HP: {bot.hp}/{bot.maxHp}
                </div>
            </div>

            {/* Stage Info (Top Left) */}
            <div style={{
                position: 'absolute', top: '30px', left: '40px',
                fontSize: '2.5rem', fontFamily: 'BebasNeue', color: '#000'
            }}>
                STAGE {stageNum}
            </div>

            {/* Boss Name - Centered slightly ABOVE boss */}
            <div style={{
                position: 'absolute',
                top: '12%', left: '50%', transform: 'translateX(-50%)',
                fontSize: '3rem', fontFamily: 'BebasNeue', color: '#000',
                textShadow: '1px 1px 1px rgba(255,255,255,0.5)'
            }}>
                {bot.name.toUpperCase()}
            </div>

            {/* Boss Image (Center - Moved Up) */}
            <div style={{
                position: 'absolute',
                top: '18%', left: '50%', transform: 'translateX(-50%)',
                width: '450px', height: '450px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <img
                    src={getBossImage(stageNum)}
                    alt={bot.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
            </div>

            {/* Right Side Stats/Rules */}
            <div style={{
                position: 'absolute', top: '150px', right: '50px',
                textAlign: 'right', color: '#fff', fontSize: '1.8rem', fontFamily: 'BebasNeue',
                textShadow: '2px 2px 2px #000'
            }}>
                <div>ATK: {bot.atk}</div>
                <div style={{ color: '#f1c40f' }}>RULE: {stageNum === 2 ? 'BLIND 2 CARDS' : 'NONE'}</div>
            </div>

            {/* BOSS Conditions Icons (Below HP Bar - Top Right area) */}
            <div style={{
                position: 'absolute',
                top: '145px', right: '50px',
                display: 'flex', gap: '8px', justifyContent: 'flex-end',
                minHeight: '50px'
            }}>
                {Array.from(bot.conditions.keys()).map(cond => {
                    let filename = `${cond}.png`;
                    if (cond === 'Avoiding') filename = '회피(Avoiding).png';
                    if (cond === 'Immune') filename = '면역(Immune).png';
                    if (cond === 'Damage Reducing') filename = '피해감소(Damage Reducing).png';
                    // Heavy Bleeding check
                    if (cond === 'Heavy Bleeding') filename = 'Heavy Bleeding.png';

                    return (
                        <div key={cond} style={{ position: 'relative' }}>
                            <img
                                src={`/assets/conditions/${filename}`}
                                alt={cond}
                                style={{ width: '40px', height: '40px' }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span style={{
                                position: 'absolute', bottom: -15, left: '50%', transform: 'translateX(-50%)',
                                fontSize: '0.8rem', color: '#fff', textShadow: '1px 1px 0 #000', whiteSpace: 'nowrap'
                            }}>
                                {cond}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
