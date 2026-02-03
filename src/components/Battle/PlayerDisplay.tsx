import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { HPBar } from '../Common/HPBar';

export const PlayerDisplay: React.FC = () => {
    const { player } = useGameStore();

    return (
        <div className="player-display" style={{
            position: 'absolute',
            bottom: '0px', left: '0px',
            width: '400px',
            height: '100px',
            pointerEvents: 'none',
            zIndex: 100
        }}>
            <HPBar
                hp={player.hp}
                maxHp={player.maxHp}
                label="PLAYER"
                color="blue"
                align="left"
            />

            {/* Condition Icons (Above HP Bar) */}
            <div style={{ display: 'flex', gap: '8px', position: 'absolute', top: '-60px', left: '10px', zIndex: 100 }}>
                {Array.from(player.conditions.keys()).map((cond: any) => {
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
                                textShadow: '1px 1px 1px #000', marginTop: '2px',
                                fontFamily: "'Bebas Neue', sans-serif"
                            }}>{cond}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
