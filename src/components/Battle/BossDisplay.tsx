import { useGameStore } from '../../state/gameStore';
import { HPBar } from '../Common/HPBar';

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
            {/* Top Right HP Bar */}
            <div style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                width: '400px',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100
            }}>
                <HPBar
                    hp={bot.hp}
                    maxHp={bot.maxHp}
                    label="BOSS"
                    color="red"
                    align="right"
                />
            </div>

            {/* Stage Info (Top Left) */}
            <div style={{
                position: 'absolute', top: '10px', left: '10px',
                fontSize: '2.5rem', fontFamily: "'Bebas Neue', sans-serif", color: '#fff',
                textShadow: '2px 2px 4px #000'
            }}>
                STAGE {stageNum}
            </div>

            {/* Boss Image (Center) */}
            <div style={{
                position: 'absolute',
                top: '15%', left: '50%', transform: 'translateX(-50%)',
                width: '450px', height: '450px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <img
                    src={getBossImage(stageNum)}
                    alt={bot.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
            </div>

            {/* Boss Name - BELOW boss image */}
            <div style={{
                position: 'absolute',
                top: '65%', left: '50%', transform: 'translateX(-50%)',
                fontSize: '4rem', fontFamily: "'Bebas Neue', sans-serif", color: '#f1c40f', // Use gold name
                textShadow: '2px 2px 4px #000, 0 0 10px rgba(241, 196, 15, 0.5)'
            }}>
                {bot.name.toUpperCase()}
            </div>

            {/* Right Side Stats/Rules */}
            <div style={{
                position: 'absolute', top: '100px', right: '30px',
                textAlign: 'right', color: '#fff', fontSize: '1.8rem', fontFamily: 'BebasNeue',
                textShadow: '2px 2px 2px #000'
            }}>
                <div>ATK: {bot.atk}</div>
                <div style={{ color: '#f1c40f' }}>RULE: {bot.activeRules && bot.activeRules.length > 0 ? bot.activeRules[0][0] : 'NONE'}</div>
            </div>

            {/* BOSS Conditions Icons (Below HP Bar - Top Right area) */}
            <div style={{
                position: 'absolute',
                top: '110px', right: '10px',
                display: 'flex', gap: '8px', justifyContent: 'flex-end',
                minHeight: '50px',
                zIndex: 100
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
