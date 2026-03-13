import { useGameStore } from '../../state/gameStore';
import { HPBar } from '../Common/HPBar';
import { ConditionIcon } from '../Common/ConditionIcon';
import { Difficulty, DIFFICULTY_CONFIGS } from '../../constants/gameConfig';
import { TRANSLATIONS } from '../../constants/translations';
import { CHAPTERS } from '../../constants/stages';

export const BossDisplay: React.FC = () => {
    const { bot, chapterNum, stageNum, stage10RuleText, difficulty, isTutorial, tutorialStep, language } = useGameStore();
    const t = TRANSLATIONS[language];

    // Get max stages for the current chapter (v2.4.3)
    const chapterConfig = CHAPTERS[chapterNum];
    const maxStages = chapterConfig ? Object.keys(chapterConfig.stages).length : 10;
    const isSpecialStage = stageNum > 10;
    const stageInfoText = isTutorial
        ? `TUTORIAL ${t.UI.STAGE_NUM}`
        : isSpecialStage
            ? `${t.UI.CHAPTER_NUM} ${chapterNum} (SPECIAL)`
            : `${t.UI.CHAPTER_NUM} ${chapterNum} (${stageNum}/${maxStages})`;

    // Map difficulty to display text
    const getDifficultyText = (diff: Difficulty) => {
        const map: Record<Difficulty, { text: string; color: string }> = {
            [Difficulty.EASY]: { text: t.UI.DIFFICULTY_EASY, color: '#27ae60' },
            [Difficulty.NORMAL]: { text: t.UI.DIFFICULTY_NORMAL, color: '#3498db' },
            [Difficulty.HARD]: { text: t.UI.DIFFICULTY_HARD, color: '#e67e22' },
            [Difficulty.HELL]: { text: t.UI.DIFFICULTY_HELL, color: '#c0392b' },
        };
        return map[diff];
    };

    const diffInfo = getDifficultyText(difficulty);

    // Simple HP Bar calculation
    const hpPercent = Math.max(0, (bot.hp / bot.maxHp) * 100);

    // Map stage number to filename
    const getBossImage = (chapter: string, stage: number) => {
        if (isTutorial) return '/assets/boss_goblin/tutorial_bot.png';
        if (chapter === '1') {
            const mapping: Record<number, string> = {
                1: '01_goblin.png',
                2: '02_goblin skirmisher.png',
                3: '03_goblin rider.png',
                4: '04_hobgoblin.png',
                5: '05_goblin shaman.png',
                6: '06_golden goblin.png',
                7: '07_elite goblin.png',
                8: '08_troll.png',
                9: '09_giant goblin.png',
                10: '10_goblin lord.png'
            };
            const filename = mapping[stage] || '01_goblin.png';
            return `/assets/boss_goblin/${filename}`;
        }
        if (chapter === '2A') {
            const mapping: Record<number, string> = {
                1: '01_mummy.png',
                2: '02_sand snake.png',
                3: '03_chimera snake human.png',
                4: '04_sand niddle lizard.png',
                5: '05_sand scorpion.png',
                6: '06_desert vultures.png',
                7: '07_sand golem.png',
                8: '08_wyvern.png',
                9: '09_sand deathworm.png',
                10: '10_sphinx.png',
                11: '2A_sand dragon.png'
            };
            const filename = mapping[stage] || '01_mummy.png';
            return `/assets/boss_desert/${filename}`;
        }
        if (chapter === '2B') {
            const mapping: Record<number, string> = {
                1: '01_orc.png',
                2: '02_orc savage.png',
                3: '03_half orc.png',
                4: '04_orc warrior.png',
                5: '05_orc chieftain.png',
                6: '06_high orc.png',
                7: '07_high orc warrior.png',
                8: '08_high orc assassin.png',
                9: '09_high orc chieftain.png',
                10: '10_high orc lord.png',
                11: '2B_high orc shaman.png'
            };
            const filename = mapping[stage] || '01_orc.png';
            return `/assets/boss_orc/${filename}`;
        }
        if (chapter === '3A') {
            const mapping: Record<number, string> = {
                1: '01_SLIME.png',
                2: '02_VAMPIRE BAT.png',
                3: '03_CAVE WORM.png',
                4: '04_POISON SPIDER.png',
                5: '05_WRAITH.png',
                6: '06_CAVE BEAR.png',
                7: '07_CRYSTAL GOLEM.png',
                8: '08_DRAKE.png',
                9: '09_BASILISK.png',
                10: '10_HYDRA.png'
            };
            const filename = mapping[stage] || '01_SLIME.png';
            return `/assets/boss_cave/${filename}`;
        }
        return '/assets/boss_goblin/01_goblin.png';
    };

    return (
        <div className="boss-display" style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none' // Let clicks pass through to background if needed
        }}>
            {/* Top Right HP Bar */}
            <div className="boss-hp-wrapper" style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                width: '500px',
                height: '125px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100
            }}>
                <HPBar
                    hp={bot.hp}
                    maxHp={bot.maxHp}
                    label={t.UI.BOSS}
                    color="red"
                    align="right"
                />
            </div>

            {/* Stage Info (Top Left) */}
            <div className="boss-stage-info" style={{
                position: 'absolute', top: '10px', left: '20px',
                fontFamily: "'Bebas Neue', sans-serif", color: '#fff',
                textShadow: '2px 2px 4px #000',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
            }}>
                <span style={{ fontSize: '2.8rem' }}>{stageInfoText}</span>
                <span style={{ fontSize: '2.6rem', color: isTutorial ? '#f1c40f' : diffInfo.color, marginTop: '-5px' }}>
                    [{isTutorial ? "TUTORIAL" : diffInfo.text}]
                </span>
            </div>

            {/* Boss Image (Center Top) */}
            <div className={`boss-avatar-wrapper ${bot.animState === 'ATTACK' ? 'animate-thrust-down' : bot.animState === 'HIT' ? 'animate-hit-shake' : ''}`}
                style={{
                    position: 'absolute',
                    top: '60px', // Even higher to maximize combat area
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '450px',
                    height: '450px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    zIndex: 50
                }}
            >
                {bot.isBossVisible !== false && (
                    <>
                        {/* Boss Name - NOW ABOVE boss image, centered at top */}
                        <div className="boss-name-label" style={{
                            position: 'absolute',
                            top: '-55px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '4.0rem',
                            fontFamily: "'Bebas Neue', sans-serif",
                            color: '#f1c40f',
                            textShadow: '0 0 10px rgba(0,0,0,1), 2px 2px 4px #000, 0 0 20px rgba(241, 196, 15, 0.4)',
                            zIndex: 110,
                            whiteSpace: 'nowrap'
                        }}>
                            {bot.name.toUpperCase()}
                        </div>
                        <img
                            src={getBossImage(chapterNum, stageNum)}
                            alt={bot.name}
                            style={{ width: '100%', height: 'auto', maxHeight: '100%', objectFit: 'contain' }}
                        />
                    </>
                )}
            </div>

            {/* Right Side Stats/Rules */}
            <div style={{
                position: 'absolute', top: '140px', right: '30px',
                textAlign: 'right', color: '#fff', fontSize: '2.45rem', fontFamily: 'BebasNeue',
                textShadow: '2px 2px 2px #000',
                whiteSpace: 'pre-line',
                maxWidth: '400px',
                lineHeight: '1.0'
            }}>
                <div>{t.UI.ATK}: {bot.atk}</div>
                <div style={{ color: '#f1c40f' }}>
                    {chapterNum === '2A' ? (
                        stageNum >= 10 ? (
                            stage10RuleText.includes(t.RULES.RULE_HINT) ? stage10RuleText : `${t.RULES.RULE_HINT}${stage10RuleText}`
                        ) : (
                            `${t.RULES.RULE_HINT}${(() => {
                                const ruleMap: Record<number, string> = {
                                    1: t.RULES.REVIVE_50,
                                    2: t.RULES.ONE_PAIR_DMG_0,
                                    3: t.RULES.TWO_PAIR_DMG_0,
                                    4: t.RULES.UNDER_30_POINTS_NO_DMG,
                                    5: t.RULES.FORCE_SWAP,
                                    6: t.RULES.TRIPLE_DMG_0_TRIPLE_ATTACK,
                                    7: t.RULES.FULL_HOUSE_DMG_0_PARALYZE_40,
                                    8: t.RULES.STRAIGHT_DMG_0_BLIND_1_BAN_1,
                                    9: t.RULES.FLUSH_DMG_0_BLIND_3,
                                };
                                return (ruleMap[stageNum] || t.RULES.NONE).replace(t.RULES.RULE_HINT, '');
                            })()}`
                        )
                    ) : (stageNum >= 10 ? (
                        stage10RuleText.startsWith(t.RULES.RULE_HINT) ? stage10RuleText : `${t.RULES.RULE_HINT}${stage10RuleText}`
                    ) : (
                        stage10RuleText.startsWith(t.RULES.RULE_HINT) ? stage10RuleText : `${t.RULES.RULE_HINT}${stage10RuleText.replace(t.RULES.RULE_HINT, '')}`
                    ))}
                </div>
            </div>

            {/* BOSS Conditions Icons (Below RULE text, right to left) */}
            <div className="boss-conditions-row" style={{
                position: 'absolute',
                top: '250px', // Lowered further for larger HP bar and rules
                right: '30px',
                display: 'flex',
                flexDirection: 'row-reverse', // Grow from right to left
                gap: '8px',
                justifyContent: 'flex-start',
                minHeight: '50px',
                zIndex: 100
            }}>
                {Array.from(bot.conditions.entries())
                    .filter(([name]) => name !== 'Brittle')
                    .map(([name, condition]) => (
                        <ConditionIcon key={name} name={name} condition={condition} popupDirection="bottom-left" />
                    ))}
            </div>
        </div>
    );
};
