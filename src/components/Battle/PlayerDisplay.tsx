import React from 'react';
import { useGameStore } from '../../state/gameStore';

export const PlayerDisplay: React.FC = () => {
    const { player } = useGameStore();

    // Simple HP Bar calculation
    const hpPercent = Math.max(0, (player.hp / player.maxHp) * 100);

    return (
        <div className="player-display" style={{
            position: 'absolute',
            bottom: '20px', left: '40px',
            width: '450px', height: '100px',
            pointerEvents: 'none'
        }}>
            {/* Player HP Bar Container leveraging Image */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: `url('/assets/etc images/HP BAR_BLUE_IMAGE.png')`,
                backgroundSize: '100% 100%',
                zIndex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{ zIndex: 2, fontSize: '1.8rem', fontFamily: 'BebasNeue', color: '#fff', textShadow: '2px 2px 4px #000', marginTop: '-5px' }}>
                    PLAYER: {player.hp}/{player.maxHp}
                </div>
            </div>

            {/* Fill Content */}
            <div style={{
                position: 'absolute',
                top: '28px', left: '30px', // Adjusted for larger bar image
                width: '390px', height: '40px',
                background: 'transparent',
                zIndex: 0,
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${hpPercent}%`,
                    height: '100%',
                    backgroundColor: '#3498db',
                    transition: 'width 0.3s ease-out'
                }} />
            </div>

            {/* Condition Icons (Above HP Bar) */}
            <div style={{ display: 'flex', gap: '8px', position: 'absolute', top: '-60px', left: '10px' }}>
                {Array.from(player.conditions.keys()).map(cond => {
                    let filename = `${cond}.png`;
                    if (cond === 'Avoiding') filename = '회피(Avoiding).png';
                    if (cond === 'Immune') filename = '면역(Immune).png';
                    if (cond === 'Damage Reducing') filename = '피해감소(Damage Reducing).png';

                    return (
                        <div key={cond} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                            <img
                                src={`/assets/conditions/${filename}`}
                                alt={cond}
                                style={{ width: '45px', height: '45px', objectFit: 'contain' }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span style={{
                                fontSize: '0.7rem', color: '#fff', fontWeight: 'bold',
                                textShadow: '1px 1px 1px #000', marginTop: '2px'
                            }}>{cond}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
