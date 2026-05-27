import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { HPBar } from '../Common/HPBar';
import { ConditionIcon } from '../Common/ConditionIcon';
import { Difficulty, DIFFICULTY_CONFIGS } from '../../constants/gameConfig';
import { TRANSLATIONS } from '../../constants/translations';
import { CHAPTERS } from '../../constants/stages';
import { getBossImage, getBossAttackSpriteInfo, BossAttackSpriteInfo } from '../../utils/bossImageMapper';
import { getNode } from '../../constants/chapterRoutes';
import '../styles/BossWeakening.css';



export const BossDisplay: React.FC = () => {
    const { bot, chapterNum, stageNum, stage10RuleText, difficulty, isTutorial, tutorialStep, language, stageMapProgress } = useGameStore();
    const t = TRANSLATIONS[language];

    const getChapterDisplayName = () => {
        const isKR = language === 'KR';
        if (isKR) {
            const names: Record<string, string> = {
                '1': '챕터 1 들판 지대',
                '2A': '챕터 2 사막 지대',
                '2B': '챕터 2 깊은 숲 지대',
                '3A': '챕터 3 동굴 지대',
                '3B': '챕터 3 늪 지대'
            };
            return names[chapterNum] || `챕터 ${chapterNum}`;
        } else {
            const names: Record<string, string> = {
                '1': 'Chapter 1 Meadow Field',
                '2A': 'Chapter 2 Desert',
                '2B': 'Chapter 2 Deep Forest',
                '3A': 'Chapter 3 Cave',
                '3B': 'Chapter 3 Swamp'
            };
            return names[chapterNum] || `Chapter ${chapterNum}`;
        }
    };

    const currentNode = stageMapProgress?.currentNodeId
        ? getNode(chapterNum, stageMapProgress.currentNodeId)
        : undefined;

    const currentStageName = currentNode
        ? (language === 'KR' ? currentNode.label : currentNode.labelEN)
        : (stageNum > 10
            ? (language === 'KR' ? '스페셜 스테이지' : 'Special Stage')
            : (language === 'KR' ? `스테이지 ${stageNum}` : `Stage ${stageNum}`));

    const stageInfoText = isTutorial
        ? `TUTORIAL ${t.UI.STAGE_NUM}`
        : `${getChapterDisplayName()} - ${currentStageName}`;

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

    const hpPercent = Math.max(0, (bot.hp / bot.maxHp) * 100);
    const bossRatio = bot.hp / bot.maxHp;
    let bossWeakClass = '';
    if (bossRatio <= 0.20) bossWeakClass = 'boss-weak-4';
    else if (bossRatio <= 0.60) bossWeakClass = 'boss-weak-2';

    const bossImg = getBossImage(chapterNum, stageNum, isTutorial);
    const spriteInfo = getBossAttackSpriteInfo(chapterNum, stageNum);
    const isAttacking = bot.animState === 'ATTACK' && spriteInfo !== null;

    // 스프라이트 이미지 프리로드 — 첫 공격 시 이미지가 미캐시 상태여서
    // 애니메이션 재생 중 로드되어 투명하게 보이는 문제를 방지한다.
    useEffect(() => {
        if (spriteInfo) {
            const img = new Image();
            img.src = spriteInfo.path;
        }
    }, [spriteInfo?.path]);

    // 연속 공격(triple attack) 시에도 스프라이트를 재시작하기 위한 key
    const attackKeyRef = useRef(0);
    const prevAnimState = useRef<string | undefined>(undefined);
    if (bot.animState === 'ATTACK' && prevAnimState.current !== 'ATTACK') {
        attackKeyRef.current += 1;
    }
    prevAnimState.current = bot.animState;

    // 스테이지별 스프라이트 크기 보정 (이미지 자체 크기 차이가 있을 경우)
    // 02_goblin skirmisher 스프라이트는 다른 보스보다 크게 생성되어 scale 조정
    const spriteScaleOverride: React.CSSProperties =
        chapterNum === '1' && stageNum === 2
            ? { transform: 'scale(0.8)', transformOrigin: 'center center' }
            : chapterNum === '1' && stageNum === 10
            ? { transform: 'scale(1.2)', transformOrigin: 'center center' }
            : {};

    const mask80 = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9ImJsYWNrIiBkPSJNMCwwIGgxMDAgdjEwMCBoLTEwMCBaIE00Niw0NSBoNiB2NSBoLTYgWiBNMTAsMTggaDYgdjQgaC02IFogTTg0LDY2IGg2IHY0IGgtNiBaIi8+PC9zdmc+")';
    const mask60 = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9ImJsYWNrIiBkPSJNMCwwIGgxMDAgdjEwMCBoLTEwMCBaIE00Niw0NSBoNiB2NSBoLTYgWiBNNTQsNTggaDYgdjUgaC02IFogTTEwLDE4IGg2IHY0IGgtNiBaIE04NCw2NiBoNiB2NCBoLTYgWiIvPjwvc3ZnPg==")';
    const mask40 = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9ImJsYWNrIiBkPSJNMCwwIGgxMDAgdjEwMCBoLTEwMCBaIE00Niw0NSBoNiB2NSBoLTYgWiBNNTQsNTggaDYgdjUgaC02IFogTTQ4LDMwIGg2IHY1IGgtNiBaIE0xMCwxOCBoNiB2NCBoLTYgWiBNODQsNjYgaDYgdjQgaC02IFoiLz48L3N2Zz4=")';
    const mask20 = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9ImJsYWNrIiBkPSJNMCwwIGgxMDAgdjEwMCBoLTEwMCBaIE00Niw0NSBoNiB2NSBoLTYgWiBNNTQsNTggaDYgdjUgaC02IFogTTQ4LDMwIGg2IHY1IGgtNiBaIE0xMCwxOCBoNiB2NCBoLTYgWiBNODQsNjYgaDYgdjQgaC02IFogTTIyLDc4IGg3IHY1IGgtNyBaIE03OCwyMCBoNSB2NCBoLTUgWiIvPjwvc3ZnPg==")';

    const holeMask =
        bot.hp <= 0 ? 'none' :
            bossRatio <= 0.20 ? mask20 :
                bossRatio <= 0.40 ? mask40 :
                    bossRatio <= 0.60 ? mask60 :
                        bossRatio <= 0.80 ? mask80 : 'none';

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
            <div className={`boss-avatar-wrapper ${bot.animState === 'HIT' ? 'animate-hit-shake' : ''} ${bossWeakClass}`}
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

                        {/* ATTACK: 보스 공격 스프라이트 시트 — JS 프레임 스텝핑 */}
                        {isAttacking && spriteInfo && (
                            <BossAttackAnimation
                                key={attackKeyRef.current}
                                spriteInfo={spriteInfo}
                                scaleOverride={spriteScaleOverride}
                            />
                        )}

                        {/* 정지 이미지: ATTACK 중에는 숨김 */}
                        {!isAttacking && (
                            <img
                                src={bossImg}
                                alt={bot.name}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    WebkitMaskImage: holeMask,
                                    maskImage: holeMask,
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskSize: '100% 100%',
                                    maskSize: '100% 100%',
                                    WebkitMaskPosition: 'center',
                                    maskPosition: 'center'
                                }}
                            />
                        )}
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
                                    5: t.RULES.FORCE_SWAP_2_NEUROTOXIC,
                                    6: t.RULES.TRIPLE_DMG_0_TRIPLE_ATTACK,
                                    7: t.RULES.FULL_HOUSE_DMG_0_PARALYZE_40,
                                    8: t.RULES.STRAIGHT_DMG_0_BLIND_1_BAN_1,
                                    9: t.RULES.FLUSH_DMG_0_BLIND_2,
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

// =======================================================
//  BossAttackAnimation — 다양한 그리드(N×M)를 지원하는
//  JS 프레임 스텝핑 보스 공격 애니메이션 컴포넌트.
//  key 가 바뀔 때마다 리마운트되어 첫 프레임부터 재시작된다.
// =======================================================
const BossAttackAnimation: React.FC<{
    spriteInfo: BossAttackSpriteInfo;
    scaleOverride?: React.CSSProperties;
}> = ({ spriteInfo, scaleOverride }) => {
    const { cols, rows, path } = spriteInfo;
    const totalFrames = cols * rows;
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        // 전체 재생 시간 0.6s 를 프레임 수로 나눠 간격 결정
        const frameDuration = Math.max(30, Math.floor(600 / totalFrames));
        let current = 0;
        const id = setInterval(() => {
            current++;
            if (current >= totalFrames) {
                clearInterval(id);
                return;
            }
            setFrame(current);
        }, frameDuration);
        return () => clearInterval(id);
    }, []); // 마운트 시 1회 실행 (key 교체로 재마운트)

    // 현재 프레임 → background-position 계산
    // background-size: cols*100% rows*100% 기준
    const col = frame % cols;
    const row = Math.floor(frame / cols);
    const bgX = cols === 1 ? 0 : (col / (cols - 1)) * 100;
    const bgY = rows === 1 ? 0 : (row / (rows - 1)) * 100;

    return (
        <div
            className="boss-sprite-attack"
            style={{
                backgroundImage: `url('${path}')`,
                backgroundSize: `${cols * 100}% ${rows * 100}%`,
                backgroundPosition: `${bgX}% ${bgY}%`,
                ...scaleOverride,
            }}
        />
    );
};
