import { useGameStore } from '../../state/gameStore';
import { HPBar } from '../Common/HPBar';
import { ConditionIcon } from '../Common/ConditionIcon';
import { Difficulty } from '../../constants/gameConfig';

export const BossDisplay: React.FC = () => {
    const { bot, chapterNum, stageNum, stage10RuleText, difficulty, isTutorial, tutorialStep } = useGameStore();

    // Map difficulty to display text
    const getDifficultyText = (diff: Difficulty) => {
        const map: Record<Difficulty, { text: string; color: string }> = {
            [Difficulty.EASY]: { text: 'EASY', color: '#27ae60' },
            [Difficulty.NORMAL]: { text: 'NORMAL', color: '#3498db' },
            [Difficulty.HARD]: { text: 'HARD', color: '#e67e22' },
            [Difficulty.HELL]: { text: 'HELL', color: '#c0392b' },
        };
        return map[diff];
    };

    const diffInfo = getDifficultyText(difficulty);

    // Simple HP Bar calculation
    const hpPercent = Math.max(0, (bot.hp / bot.maxHp) * 100);

    // Map stage number to filename
    const getBossImage = (stage: number) => {
        if (isTutorial) return '/assets/boss_goblin/tutorial_bot.png';
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
                fontFamily: "'Bebas Neue', sans-serif", color: '#fff',
                textShadow: '2px 2px 4px #000',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
            }}>
                <span style={{ fontSize: '2.5rem' }}>{isTutorial ? "TUTORIAL STAGE" : `CHAPTER ${chapterNum}_STAGE ${stageNum}`}</span>
                <span style={{ fontSize: '2.4rem', color: isTutorial ? '#f1c40f' : diffInfo.color, marginTop: '-5px' }}>
                    [{isTutorial ? "TUTORIAL" : diffInfo.text}]
                </span>
            </div>

            {/* Boss Image (Center Top) */}
            <div className={`boss-avatar-wrapper ${bot.animState === 'ATTACK' ? 'animate-thrust-down' : bot.animState === 'HIT' ? 'animate-hit-shake' : ''}`}
                style={{
                    position: 'absolute',
                    top: '0%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '220px',
                    height: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    zIndex: 50
                }}
            >
                <img
                    src={getBossImage(stageNum)}
                    alt={bot.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                {/* Boss Name - BELOW boss image */}
                <div style={{
                    fontSize: '1.8rem',
                    fontFamily: "'Bebas Neue', sans-serif",
                    color: '#f1c40f',
                    textShadow: '2px 2px 4px #000, 0 0 10px rgba(241, 196, 15, 0.5)',
                    marginTop: '-10px'
                }}>
                    {bot.name.toUpperCase()}
                </div>
            </div>

            {/* Right Side Stats/Rules */}
            <div style={{
                position: 'absolute', top: '100px', right: '30px',
                textAlign: 'right', color: '#fff', fontSize: '1.8rem', fontFamily: 'BebasNeue',
                textShadow: '2px 2px 2px #000'
            }}>
                <div>ATK: {bot.atk}</div>
                <div style={{ color: '#f1c40f' }}>
                    {isTutorial && [15, 16, 17, -15, -16, -17].includes(tutorialStep) ? (
                        "RULE: BLIND 2 CARDS"
                    ) : stageNum === 10 ? (
                        stage10RuleText
                    ) : (
                        `RULE: ${(() => {
                            const bannedHand = useGameStore.getState().bannedHand;
                            const ruleMap: Record<number, string> = {
                                1: 'NONE',
                                2: 'BANNED_2 CARDS',
                                3: 'BLIND_2 CARDS',
                                4: 'BANNED_SUIT',
                                5: 'POISON',
                                6: bannedHand ? `BANNED_${bannedHand.toUpperCase()}` : 'BANNED_HAND',
                                7: 'ATK +10/TURN',
                                8: 'REGEN+REDUCE 10%',
                                9: 'ATK x2/TURN+REDUCE 10%',
                            };
                            return ruleMap[stageNum] || 'NONE';
                        })()}`
                    )}
                </div>
            </div>

            {/* BOSS Conditions Icons (Below RULE text, right to left) */}
            <div style={{
                position: 'absolute',
                top: '200px', // Lowered to avoid overlap with multi-line rules
                right: '30px',
                display: 'flex',
                flexDirection: 'row-reverse', // Grow from right to left
                gap: '8px',
                justifyContent: 'flex-start',
                minHeight: '50px',
                zIndex: 100
            }}>
                {Array.from(bot.conditions.entries()).map(([name, condition]) => (
                    <ConditionIcon key={name} name={name} condition={condition} popupDirection="bottom-left" />
                ))}
            </div>
        </div>
    );
};
