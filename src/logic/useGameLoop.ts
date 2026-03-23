import { useState, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { AudioManager } from '../utils/AudioManager';
import { calculatePlayerDamage, calculateBotDamage, applyDamage } from './damageCalculation';
import { Card, CardFactory } from '../types/Card';
import { GameState, Difficulty, DIFFICULTY_CONFIGS } from '../constants/gameConfig';
import { RANK_VALUES, JOKER_DRAW_PROBABILITY } from '../constants/cards';
import { TRANSLATIONS } from '../constants/translations';
import { playCoreDeathFX } from '../utils/fxUtils';
import { hasSeenGuide, CHAPTER_INTROS, SYSTEM_GUIDES, CONDITION_GUIDES, getGimmickGuide, GuidePopupData } from '../constants/guideData';
import { CHAPTERS } from '../constants/stages';

export interface DamageTextData {
    id: number;
    x: number;
    y: number;
    text: string;
    color: string;
}

export const useGameLoop = () => {
    const store = useGameStore();
    const {
        gameState, setGameState,
        player, setPlayerHp,
        bot, setBotHp,
        playerHand, setPlayerHand,
        deck, setDeck,
        drawCards, swapCards,
        message, setMessage,
        stageNum, initGame,
        addPlayerCondition,
        setBotAnimState, setPlayerAnimState,
        triggerTransition,
        isTutorial, tutorialStep, setTutorialStep, gamePhase,
        language
    } = store;

    const t = TRANSLATIONS[language];

    const [damageTexts, setDamageTexts] = useState<DamageTextData[]>([]);
    const [screenEffect, setScreenEffect] = useState<string>('');

    // v2.5.0: Game Speed Helpers
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms / store.gameSpeed));
    const scaledTimeout = (callback: () => void, ms: number) => setTimeout(callback, ms / store.gameSpeed);

    // v2.0.0.12: Auto-clear generic messages after 2.5s
    useEffect(() => {
        const exempt = [t.COMBAT.VICTORY, t.COMBAT.DEFEAT, t.COMBAT.PARALYZED];
        if (message && !exempt.includes(message)) {
            const timer = scaledTimeout(() => setMessage(""), 2500);
            return () => clearTimeout(timer);
        }
    }, [message, setMessage, store.gameSpeed]);

    // Helper to add damage text
    const showDamageText = (target: 'PLAYER' | 'BOT' | 'BOSS_LEFT', text: string, color: string) => {
        const id = Date.now() + Math.random();
        let x = 800; // 1600 * 0.5
        let y = 300;
        if (target === 'BOT') { x = 800; y = 280; } // Rollback: Floating damage should be on boss chest area
        else if (target === 'PLAYER') { x = 400; y = 550; }
        else if (target === 'BOSS_LEFT') { x = 400; y = 200; }

        setDamageTexts(prev => [...prev, { id, x, y, text, color }]);
    };

    const onDamageTextComplete = (id: number) => {
        setDamageTexts(prev => prev.filter(dt => dt.id !== id));
    };

    const triggerScreenEffect = (effect: string) => {
        setScreenEffect(effect);
        scaledTimeout(() => setScreenEffect(''), 500);
    };

    // 4B-2: Node Interference Helper (Generic Special Attack Reflection)
    const applyNodeInterference = (incomingDmg: number): number => {
        const store = useGameStore.getState();
        if (store.equippedAltarSkills.includes('4B-2')) {
            const reflected = Math.floor(incomingDmg * 0.5);
            const remaining = incomingDmg - reflected;
            setBotHp(Math.max(0, useGameStore.getState().bot.hp - reflected));
            showDamageText('BOT', `-${reflected}`, '#f39c12');
            setMessage(language === 'KR' ? '노드간섭!' : "NODE INTERFERENCE!");
            AudioManager.playSFX('/assets/audio/conditions/데미지 반사(Damage reflection).mp3');
            return remaining;
        }
        return incomingDmg;
    };

    const playConditionSound = (condition: string) => {
        let file = '';
        switch (condition) {
            case 'Awakening': file = 'Awakening.mp3'; break;
            case 'Burn': file = '화상(burn).mp3'; break;
            case 'Decay': file = '부패(decay).mp3'; break;
            case 'Reflection': file = '데미지 반사(Damage reflection).mp3'; break;
            case 'Bleeding': file = 'Bleeding.mp3'; break;
            case 'Heavy Bleeding': file = 'Heavy Bleeding.mp3'; break;
            case 'Poisoning': file = 'poisoning.mp3'; break;
            case 'Regenerating': file = 'Regenerating.mp3'; break;
            case 'Paralyzing': file = 'paralyzing.mp3'; break;
            case 'Debilitating': file = 'Debilitating.mp3'; break;
            case 'Avoiding': file = 'avoiding.mp3'; break;
            case 'Damage recoiling': file = '데미지 반동(Damage recoiling).mp3'; break;
            case 'Berserker': file = '버서커(Berserker).mp3'; break;
            case 'Revival': file = '부활(Revival).mp3'; break;
            case 'Invincible spirit': file = '불굴의 의지(Invincible Spirit).mp3'; break;
            case 'Adrenaline secretion': file = '아드레날린 분비(Adrenaline secretion).mp3'; break;
            case 'Neurotoxicity': file = '신경성 맹독(Neurotoxicity).mp3'; break;
            case 'Dehydration': file = '탈수(Dehydration).mp3'; break;
            case 'Decreasing accuracy': file = '명중률 저하(Decreasing accuracy).mp3'; break;
            case 'Triple Attack':
                AudioManager.playSFX('/assets/audio/combat/chapter 2a desert/06_desert vultures_2.mp3');
                return;
            default: return;
        }
        AudioManager.playSFX(`/assets/audio/conditions/${file}`);
    };

    const getBossAttackSFX = (chapter: string, stage: number) => {
        if (chapter === '2A') {
            const sfxMap: Record<number, string> = {
                1: '01_mummy.mp3',
                2: '02_sand snake.mp3',
                3: '03_chimera snake human.mp3',
                4: '04_sand niddle lizard.mp3',
                5: '05_sand scorpion.mp3',
                7: '07_sand golem.mp3',
                8: '08_sand wyvern.mp3',
                9: '09_sand deathworm.mp3',
                11: '2A_SAND DRAGON.mp3'
            };
            const filename = sfxMap[stage];
            if (stage === 11) return `/assets/audio/combat/chapter 2a desert/${filename}`;
            if (filename) return `/assets/audio/combat/chapter 2a desert/${filename}`;
            return '';
        }

        if (chapter === '2B') {
            const sfxMap: Record<number, string> = {
                1: '01_orc.mp3',
                2: '02_orc savage.mp3',
                3: '03_half orc.mp3',
                4: '04_orc warrior.mp3',
                5: '05_orc chieftain.mp3',
                6: '06_high orc.mp3',
                7: '07_high orc warrior.mp3',
                8: '08_high orc assassin.mp3',
                9: '09_high orc chieftain.mp3',
                10: '10_high orc lord.mp3',
                11: '2B_HIGH ORC SHAMAN.mp3'
            };
            if (stage === 11) return `/assets/audio/combat/chapter 2b deep forest/${sfxMap[stage]}`;
            return sfxMap[stage] ? `/assets/audio/stages/chapter 2B/${sfxMap[stage]}` : null;
        }

        if (chapter === '3A') {
            // 임시로 공용 타격음 적용 (이후 개별 에셋 추가 시 수정)
            return `/assets/audio/combat/chapter 1 goblin/04_sword hit_heavy.mp3`;
        }

        if (chapter !== '1') return '';

        const map: Record<number, string> = {
            1: '01_sword hit_light.mp3',
            2: '02_arrow_hit.mp3',
            3: '03_spear_thrust.mp3',
            4: '04_sword hit_heavy.mp3',
            5: '05_magica.mp3',
            6: '06_swing_ weapon.mp3',
            7: '07_sword hit_heavy.mp3',
            8: '08_blunt_light.mp3',
            9: '09_blunt_hit_heavy.mp3',
            10: '10_cruel_swing.mp3'
        };
        const file = map[stage] || '01_sword hit_light.mp3';
        return `/assets/audio/combat/chapter 1 goblin/${file}`;
    };

    const applyBotStageMechanics = () => {
        const store = useGameStore.getState();

        // v2.3.9: Chapter 2B Special Stage (Stage 11) - 100% Status Application
        if (store.chapterNum === '2B') {
            const currentBot = store.bot;
            if (stageNum === 11 && !currentBot.conditions.has('Awakening')) {
                const freshP = useGameStore.getState().player;
                if (!freshP.conditions.has('Bleeding')) {
                    store.addPlayerCondition('Bleeding', 4);
                    playConditionSound('Bleeding');
                    setMessage(t.CONDITIONS.BLEEDING.NAME + "!");
                    showConditionGuideIfNew('Bleeding');
                } else {
                    // Randomly apply Poisoning or Debilitating
                    const effect = Math.random() < 0.5 ? 'Poisoning' : 'Debilitating';
                    store.addPlayerCondition(effect, 4);
                    playConditionSound(effect);
                    const condKey = effect.toUpperCase();
                    const condName = (t.CONDITIONS as any)[condKey]?.NAME || effect;
                    setMessage(condName + "!");
                    showConditionGuideIfNew(effect);
                }
                triggerScreenEffect('flash-red');
                return;
            }
        }

        if (store.chapterNum !== '1') return; // Skip other Chapter 2 stages for now

        const config = DIFFICULTY_CONFIGS[store.difficulty];
        const rand = Math.random();
        let conditionApplied = '';

        // Difficulty-based probabilities for status effects (Skip in tutorial)
        if (!store.isTutorial) {
            if ([1, 2, 3, 4].includes(stageNum) && rand < config.bleedProbStage1to4) {
                conditionApplied = 'Bleeding';
            } else if (stageNum === 5 && rand < config.poisonProbStage5) {
                conditionApplied = 'Poisoning';
            } else if (stageNum === 8 && rand < config.paralyzeProbStage8) {
                conditionApplied = 'Paralyzing';
            }
        }

        if (conditionApplied) {
            let duration = 3;
            if (conditionApplied === 'Bleeding') duration = 4;
            if (conditionApplied === 'Poisoning') duration = 4;
            if (conditionApplied === 'Paralyzing') duration = 2;

            addPlayerCondition(conditionApplied, duration);
            playConditionSound(conditionApplied);
            const condKey = conditionApplied.toUpperCase().replace(/\s+/g, '_');
            const condName = (t.CONDITIONS as any)[condKey]?.NAME || conditionApplied.toUpperCase();
            setMessage(`${condName}!`);
            triggerScreenEffect('flash-red');
            showConditionGuideIfNew(conditionApplied);
        }

        // v2.0.0.19: Tutorial Forced Bleed (Step 9: Explanation -> Attack triggered)
        if (store.isTutorial && store.tutorialStep === 9) {
            addPlayerCondition('Bleeding', 3); // Guaranteed 3 turns
            playConditionSound('Bleeding');
            setMessage(t.COMBAT.BOSS_BLEEDING);
            triggerScreenEffect('flash-red');
        }
    };

    // v2.0.0.8: Sequential card draw
    const refillHandSequentially = async (totalDuration: number = 1500) => {
        const store = useGameStore.getState();
        const targetCount = 8;

        // Draw one by one until we have 8 non-null cards
        for (let i = 0; i < targetCount; i++) {
            const currentHand = useGameStore.getState().playerHand;
            const nullIdx = currentHand.indexOf(null);

            if (nullIdx !== -1) {
                // Case 1: Fill exist null slot (after attack)
                const [newCard] = store.deck.draw(1, currentHand);
                if (newCard) {
                    const updatedHand = [...useGameStore.getState().playerHand];
                    updatedHand[nullIdx] = newCard;
                    setPlayerHand(updatedHand);
                    await new Promise(r => setTimeout(r, totalDuration / targetCount));
                }
            } else if (currentHand.length < targetCount) {
                // Case 2: Append new card (initial draw or after some logic?)
                const [newCard] = store.deck.draw(1, currentHand);
                if (newCard) {
                    const updatedHand = [...useGameStore.getState().playerHand];
                    setPlayerHand([...updatedHand, newCard]);
                    await new Promise(r => setTimeout(r, totalDuration / targetCount));
                }
            } else {
                // Hand is full and no nulls
                break;
            }
        }

    };
    const runCombatSequence = async (selectedIndices: number[]) => {
        if (useGameStore.getState().isProcessing) return;
        const { setIsProcessing } = useGameStore.getState();
        setIsProcessing(true);
        try {
            await executePlayerAttack(selectedIndices);
        } finally {
            useGameStore.getState().setIsProcessing(false);
        }
    };


    const executePlayerAttack = async (selectedIndices: number[]) => {
        const store = useGameStore.getState();
        if (store.gameState !== GameState.BATTLE && store.gameState !== GameState.TUTORIAL) return;

        // Critical Fix: Prevent UI spamming during animations
        if (useGameStore.getState().gamePhase !== 'IDLE') return;
        store.setGamePhase('PLAYER_ATTACK');

        // 1. 마비 체크 (Paralyzing)
        if (player.conditions.has('Paralyzing')) {
            setMessage(t.COMBAT.PARALYZED);
            playConditionSound('Paralyzing');
            triggerScreenEffect('flash-red');
            store.setGamePhase('BOT_TURN');
            await wait(1200);
            await executeBotTurn();
            return;
        }

        const currentPlayerHand = store.playerHand;

        // MUDDED Check (Prevent Attack)
        const selectedCardsForStatusCheck = selectedIndices.map(idx => currentPlayerHand[idx]).filter(Boolean) as Card[];
        if (selectedCardsForStatusCheck.some(c => c.isMudded)) {
            setMessage("진흙 카드가 포함되어 있습니다!");
            triggerScreenEffect('shake-small');
            store.setGamePhase('IDLE');
            return;
        }

        // PETRIFIED Check (Prevent Attack)
        if (selectedCardsForStatusCheck.some(c => c.isPetrified)) {
            setMessage("석화된 카드가 포함되어 있습니다!");
            triggerScreenEffect('shake-small');
            store.setGamePhase('IDLE');
            return;
        }

        if (selectedIndices.length === 0) {
            setMessage(t.COMBAT.SELECT_CARDS);
            triggerScreenEffect('shake-small');
            store.setGamePhase('IDLE');
            return;
        }

        // v2.3.6: Map BANNED state to card objects before calculation (allows selection but sets score to 0)
        const selectedCards = selectedIndices.map(idx => {
            const card = currentPlayerHand[idx];
            if (!card) return null;
            const isBannedIndex = store.bannedIndices.includes(idx);
            const isBannedRank = card.rank && store.bannedRanks.includes(card.rank);
            const isBannedSuit = card.suit && card.suit === store.bannedSuit;
            return {
                ...card,
                isBanned: !!(isBannedIndex || isBannedRank || isBannedSuit)
            };
        }).filter(Boolean) as Card[];

        // v2.3.0: Accuracy Check (Decreasing Accuracy / Neurotoxicity)
        const accCond = player.conditions.get('Decreasing accuracy');
        const neuroCond = player.conditions.get('Neurotoxicity');
        const missChance = (accCond ? ((accCond.data as any)?.percent || 20) / 100 : 0) + (neuroCond ? 0.3 : 0);

        if (missChance > 0 && Math.random() < missChance) {
            setMessage(t.COMBAT.ACCURACY_MISSED); // 명중률 저하 메시지 활용
            triggerScreenEffect('shake-small');
            // 6A-1: Adaptive Calculation - Reset stacks on miss
            if (store.equippedAltarSkills.includes('6A-1')) {
                store.setAltarSkillUse('6A-1_stacks', 0);
            }
            await wait(1000);
            store.setGamePhase('IDLE');
            await executeBotTurn();
            return;
        }

        // Damage Calculation
        const { baseDamage, isCritical, finalDamage: rawDamage, handType } = calculatePlayerDamage(
            selectedCards,
            player.conditions.has('Debilitating'),
            store.bannedHand,
            store.bannedRanks,
            store.bannedSuit,
            store.difficulty,
            store.equippedAltarSkills.includes('4A-1') && store.isDyschromatopsiaActive && store.dyschromatopsiaUses < 2
        );

        // 4A-1: Dyschromatopsia - If active, consume a use
        if (store.equippedAltarSkills.includes('4A-1') && store.isDyschromatopsiaActive && store.dyschromatopsiaUses < 2) {
            store.incrementDyschromatopsiaUses();
            // If uses reach 2, auto-deactivate
            if (store.dyschromatopsiaUses + 1 >= 2) {
                store.setDyschromatopsiaActive(false);
            }
        }

        // Apply Damage Multipliers (Reduction, Adrenaline)
        const drCond = bot.conditions.get('Damage Reducing');
        const adCond = bot.conditions.get('Adrenaline secretion');
        let finalDamage = rawDamage; // Start with raw damage from calculatePlayerDamage

        // Damage Reduction
        if (drCond) {
            const percent = (drCond.data as any)?.percent || 0;
            finalDamage = Math.floor(finalDamage * (1 - percent / 100));
        }

        // Adrenaline Secretion (Permanent threshold-based nullification for High Orc)
        let isAdrenalineNull = false;
        if (adCond) {
            const threshold = (adCond.data as any)?.limit || 60;
            // v2.4.1: Check rawDamage (before reduction) to match player expectation
            if (rawDamage > 0 && rawDamage <= threshold) {
                finalDamage = 0;
                isAdrenalineNull = true;
            }
        }

        if (baseDamage === 0 && handType !== 'High Card') {
            setMessage(`${t.COMBAT.BANNED_HAND}${handType}`);
            triggerScreenEffect('shake');
            store.setGamePhase('IDLE');
            return;
        }

        // Sphinx Puzzle Check (v2.3.3)
        let isPuzzleCorrect = false;
        if (store.chapterNum === '2A' && stageNum === 10 && store.puzzleTarget > 0) {
            const sumOfSelected = selectedCards.reduce((acc, c) => {
                if (c.isJoker) return acc + 14;
                if (c.rank === 'A') return acc + 1;
                return acc + (RANK_VALUES[c.rank!] || 0);
            }, 0);
            if (sumOfSelected === store.puzzleTarget && selectedCards.length === 5) {
                isPuzzleCorrect = true;
                if (!player.conditions.has('Immune')) {
                    store.addPlayerCondition('Immune', 3);
                    showConditionGuideIfNew('Immune');
                }
            }
        }

        let damage = 0;
        let recoilTaken = 0;
        let lifesteal = 0;
        let displayMessage = "";
        let isCrit = isPuzzleCorrect ? false : isCritical;
        const hasWild = selectedCards.some(c => c.isJoker);

        if (isAdrenalineNull) {
            damage = 0;
            displayMessage = t.CONDITIONS.ADRENALINE_SECRETION.NAME + "!";
            playConditionSound('Adrenaline secretion');
        } else if (isPuzzleCorrect) {
            const handBonuses: Record<string, number> = {
                'One Pair': 10, 'Two Pair': 20, 'Three of a Kind': 50,
                'Straight': 75, 'Flush': 100, 'Full House': 125, 'Four of a Kind': 150,
                'Straight Flush': 175, 'Royal Flush': 300
            };
            const pokerBonus = handBonuses[handType] || 0;
            damage = (store.puzzleTarget * 2) + pokerBonus;
            displayMessage = t.COMBAT.PUZZLE_SUCCESS.replace('{bonus}', pokerBonus.toString());
        } else {
            damage = Math.floor(finalDamage);

            // v2.3.2: 2A Hand Nullification Rules
            if (store.chapterNum === '2A') {
                const nullifiedHands: Record<number, string> = {
                    1: 'Straight Flush', 2: 'One Pair', 3: 'Two Pair', 6: 'Three of a Kind',
                    7: 'Full House', 8: 'Straight', 9: 'Flush'
                };
                const nullifiedHand = nullifiedHands[stageNum];
                if (nullifiedHand && handType === nullifiedHand) {
                    const handBonuses: Record<string, number> = {
                        'One Pair': 10, 'Two Pair': 20, 'Three of a Kind': 50,
                        'Straight': 75, 'Flush': 100, 'Full House': 125, 'Straight Flush': 150
                    };
                    const bonus = handBonuses[handType] || 0;
                    damage = Math.max(0, Math.floor((baseDamage - bonus) * (finalDamage / rawDamage)));
                }
            }

            // 3A-5: GHOST (유체화 - 족보 데미지만 적용)
            if (store.chapterNum === '3A' && stageNum === 5) {
                const handBonusesAll: Record<string, number> = {
                    'One Pair': 10, 'Two Pair': 20, 'Three of a Kind': 50,
                    'Straight': 75, 'Flush': 100, 'Full House': 125, 'Four of a Kind': 150,
                    'Straight Flush': 175, 'Royal Flush': 300
                };
                const pokerBonusOnly = Math.floor((handBonusesAll[handType] || 0) * (finalDamage / rawDamage));
                damage = pokerBonusOnly;
                displayMessage = "유체화: 기본/카드 피해 적용 면역!";
            }

            // 3A-6/7: HONEY YUMMY/BRITTLE (+8 bonus condition)
            if (store.chapterNum === '3A') {
                if (stageNum === 6) {
                    // 단군신화: 3 또는 7 포함 시 +8
                    if (selectedCards.some(c => c.rank === '3' || c.rank === '7')) {
                         damage += 8;
                    }
                } else if (stageNum === 7) {
                    // 취성: 다이아몬드 포함 시 +8
                    if (selectedCards.some(c => c.suit === '♦')) {
                         damage += 8;
                    }
                }
            }

            // ── 3B 챕터: 플레이어 공격 기믹 처리 ──────────────────────────
            if (store.chapterNum === '3B') {
                // 3B-1: HARDNESS(단단함) - 투페어 이상 족보만 피해 적용
                if (stageNum === 1) {
                    const lowHands = ['High Card', 'One Pair'];
                    if (lowHands.includes(handType)) {
                        damage = 0;
                        displayMessage = "단단함: 투페어 이상 족보만 피해를 줄 수 있습니다!";
                    }
                }

                // 3B-4: AUTOTOMY(자절) - 매 2턴(2, 4, 6...)마다 플레이어 공격 피해 30% 감소
                if (stageNum === 4 && (store.currentTurn + 1) % 2 === 0) {
                    damage = Math.floor(damage * 0.7);
                    displayMessage = "자절: 플레이어 공격 피해 30% 감소!";
                }

                // 3B-5: CAMOUFLAGE(위장) - 매 2턴 종료 후 1턴간(3, 6, 9...) 보스 무적
                if (stageNum === 5 && (store.currentTurn + 1) % 3 === 0) {
                    damage = 0;
                    displayMessage = "위장: 보스가 투명 상태여서 공격이 통하지 않습니다!";
                }

                // 3B-7: HOLD BREATH(숨참기) - 보스 공격 2회 성공 시 다음 턴 무적 (v2.4.0)
                if (stageNum === 7 && store.holdBreathTurn3B === store.currentTurn) {
                    damage = 0;
                    displayMessage = "숨참기: 보스가 무적 상태여서 피해를 줄 수 없습니다!";
                }

                // 3B-10: STEM CELL 해제 조건 - 스트레이트 계열 족보 공격 성공 시
                if (stageNum === 10 && damage > 0) {
                    const straightHands = ['Straight', 'Straight Flush', 'Royal Flush'];
                    if (straightHands.includes(handType)) {
                        const freshBot10 = useGameStore.getState().bot;
                        if (freshBot10.conditions.has('Stem Cell')) {
                            const newConds10 = new Map(freshBot10.conditions);
                            newConds10.delete('Stem Cell');
                            useGameStore.getState().setBot({ ...freshBot10, conditions: newConds10 });
                            setMessage("줄기세포 파괴! (스트레이트 계열 공격 성공)");
                            triggerScreenEffect('flash-red');
                        }
                    }
                }
            }

            // v2.3.2: 2A-4 No damage under 30
            if (store.chapterNum === '2A' && stageNum === 4 && damage < 30) {
                damage = 0;
                displayMessage = t.COMBAT.NO_DMG_UNDER_30_MSG;
            }

            // 1B: Sharpen Cards (+25 fixed damage)
            if (store.equippedAltarSkills.includes('1B')) damage += 25;

            // 5A-1: Pattern Disruption (20% chance to use one tier higher hand bonus)
            if (store.equippedAltarSkills.includes('5A-1') && Math.random() < 0.20) {
                const handTiers = ['High Card', 'One Pair', 'Two Pair', 'Three of a Kind', 'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush', 'Royal Flush'];
                const handBonusesAll: Record<string, number> = {
                    'One Pair': 10, 'Two Pair': 20, 'Three of a Kind': 50,
                    'Straight': 75, 'Flush': 100, 'Full House': 125, 'Four of a Kind': 150,
                    'Straight Flush': 175, 'Royal Flush': 300
                };
                const currentIdx = handTiers.indexOf(handType);
                if (currentIdx >= 0 && currentIdx < handTiers.length - 1) {
                    const upgradeHand = handTiers[currentIdx + 1];
                    const currentBonus = handBonusesAll[handType] || 0;
                    const upgradeBonus = handBonusesAll[upgradeHand] || 0;
                    damage += (upgradeBonus - currentBonus);
                }
            }

            // 5A-2: Overloaded (same hand consecutively → +10% per stack, max 3)
            if (store.equippedAltarSkills.includes('5A-2')) {
                if (store.consecutiveHandType === handType) {
                    const newStacks = Math.min(3, store.consecutiveHandStacks + 1);
                    store.setConsecutiveHand(handType, newStacks);
                    damage = Math.floor(damage * (1 + newStacks * 0.10));
                } else {
                    store.setConsecutiveHand(handType, 0);
                }
            }

            // 5A-3: Instability Resonance (bonus damage when boss HP is low)
            if (store.equippedAltarSkills.includes('5A-3')) {
                const bossHpRatio = bot.hp / bot.maxHp;
                if (bossHpRatio <= 0.25) {
                    damage = Math.floor(damage * 1.10);
                } else if (bossHpRatio <= 0.50) {
                    damage = Math.floor(damage * 1.05);
                }
            }

            // 6A-1: Adaptive Calculation (+5% per successful attack, max 10 stacks)
            if (store.equippedAltarSkills.includes('6A-1') && damage > 0) {
                const currentStacks = store.altarSkillUses['6A-1_stacks'] || 0;
                if (currentStacks > 0) {
                    damage = Math.floor(damage * (1 + currentStacks * 0.05));
                }
                const newStacks = Math.min(10, currentStacks + 1);
                store.setAltarSkillUse('6A-1_stacks', newStacks);
            }

            // 6B-1: Core Resonance (+15% damage when boss HP <= 50%)
            if (store.equippedAltarSkills.includes('6B-1') && bot.hp <= bot.maxHp * 0.5) {
                damage = Math.floor(damage * 1.15);
            }

            // 5B-2: Node Collapse (Bonus fixed damage based on player HP percentage)
            if (store.equippedAltarSkills.includes('5B-2')) {
                const coreStability = (player.hp / player.maxHp) * 100;
                let nodeCollapseBonus = 0;
                if (coreStability <= 30) {
                    nodeCollapseBonus = 30;
                } else if (coreStability <= 50) {
                    nodeCollapseBonus = 20;
                } else if (coreStability <= 80) {
                    nodeCollapseBonus = 10;
                }
                damage += nodeCollapseBonus;
            }

            // 6A: Causality Rearrangement (8% chance for double attack)
            // handled after damage application below

            const recoilingCond = player.conditions.get('Damage recoiling');
            if (recoilingCond && Math.random() < 0.3) {
                damage += 20;
                recoilTaken = 10;
                setMessage(t.CONDITIONS.DAMAGE_RECOILING.NAME + "!");
            }

            const berserkerCond = player.conditions.get('Berserker');
            if (berserkerCond && player.hp <= player.maxHp * 0.3) {
                damage += (berserkerCond.data as any)?.atkBonus || 20;
                lifesteal = Math.max(1, Math.floor(damage * 0.1));
            }

            if (!displayMessage) {
                const wildSuffix = hasWild ? t.UI.WILD : '';
                displayMessage = isCrit ? `${t.COMBAT.CRITICAL_HIT} ${handType}${wildSuffix}` : `${handType}${wildSuffix}`;
            }
        }

        // --- PHASE 1: GATHERING ---
        store.setGamePhase('GATHERING');
        scaledTimeout(() => AudioManager.playSFX('/assets/audio/player/shuffling.mp3'), 200);
        const gatheringDurationRaw = (selectedCards.length * 200) + 500;
        await wait(gatheringDurationRaw);

        // --- PHASE 2: CHARGING (0.8s) ---
        store.setGamePhase('CHARGING');
        await wait(800);

        // --- PHASE 3: THRUSTING ---
        store.setGamePhase('THRUSTING');
        await wait(67);
        await wait(133);
        AudioManager.playSFX('/assets/audio/player/whipping.mp3');

        // Boss Shake & Hit
        await wait(100);
        triggerScreenEffect('shake');
        setBotAnimState('HIT');

        // Damage Popup & Message
        if (isPuzzleCorrect) {
            showDamageText('BOSS_LEFT', 'CORRECT DAMAGE!', '#2ecc71');
            showDamageText('BOT', `-${damage}`, '#2ecc71');
            AudioManager.playSFX('/assets/audio/player/shuffling.mp3');
        } else {
            showDamageText('BOT', `-${damage}`, isCrit ? '#c0392b' : '#ecf0f1');
        }
        setMessage(displayMessage);

        // --- HP REDUCTION & EFFECTS ---
        await wait(150);
        const currentBotPreDmg = useGameStore.getState().bot; // Use fresh state just before damage
        const newBotHp = Math.max(0, currentBotPreDmg.hp - damage);
        setBotHp(newBotHp);

        // Reflection
        const reflectionCond = bot.conditions.get('Reflection');
        if (reflectionCond && !isAdrenalineNull && !isPuzzleCorrect && damage > 0) {
            const chance = (reflectionCond.data as any)?.chance || 0.3;
            const percent = (reflectionCond.data as any)?.percent || 10;
            if (Math.random() < chance) {
                const rDmg = Math.floor(damage * (percent / 100));
                if (rDmg > 0) {
                    await wait(600);
                    const freshP = useGameStore.getState().player;
                    setPlayerHp(Math.max(0, freshP.hp - rDmg));
                    showDamageText('PLAYER', `-${rDmg}`, '#e74c3c');
                    setMessage("REFLECTION!");
                    playConditionSound('Reflection');
                    triggerScreenEffect('shake');
                    await wait(800);
                }
            }
        }

        if (lifesteal > 0) {
            const freshP = useGameStore.getState().player;
            setPlayerHp(Math.min(freshP.maxHp, freshP.hp + lifesteal));
            showDamageText('PLAYER', `+${lifesteal}`, '#2ecc71');
        }

        // 2A: Utilization (50% chance to inflict Bleed or Poison on boss)
        if (store.equippedAltarSkills.includes('2A') && damage > 0 && !isPuzzleCorrect) {
            if (Math.random() < 0.5) {
                // Critical Fix: Always use fresh state for HP and conditions to prevent rollbacks
                const freshBot = useGameStore.getState().bot; 
                const freshBotCondition = freshBot.conditions;
                const hasBleed = freshBotCondition.has('Bleeding') || freshBotCondition.has('Heavy Bleeding');
                const hasPoison = freshBotCondition.has('Poisoning');

                if (!hasBleed && !hasPoison) {
                    const effect = Math.random() < 0.5 ? 'Bleeding' : 'Poisoning';
                    store.addBotCondition(effect, 3);
                    showDamageText('BOT', effect === 'Bleeding' ? "BLEEDING!" : "POISON!", '#9b59b6');
                } else if (hasBleed && !hasPoison) {
                    store.addBotCondition('Poisoning', 3);
                    showDamageText('BOT', "POISON!", '#9b59b6');
                } else if (!hasBleed && hasPoison) {
                    store.addBotCondition('Bleeding', 3);
                    showDamageText('BOT', "BLEEDING!", '#9b59b6');
                }
            }
        }

        // 3A-10 티폰 전승 타격 기믹 (Flush 4문양 완성 시 즉사)
        if (store.chapterNum === '3A' && stageNum === 10 && handType.includes('Flush')) {
            const suit = selectedCards.find(c => !c.isJoker)?.suit;
            if (suit && !store.hydraFlushSuits.includes(suit)) {
                const newSuits = [...store.hydraFlushSuits, suit];
                store.setHydraFlushSuits(newSuits);
                setMessage(t.UI.HYDRA_FLUSH_COUNT.replace('{count}', newSuits.length.toString()));
                triggerScreenEffect('flash-red');
                if (newSuits.length >= 4) {
                    await wait(1000);
                    setMessage("티폰 전승: 거대 뱀의 심장을 찔렀습니다!");
                    setBotHp(0);
                    // 즉사이므로 부활 조건을 스킵/강제삭제
                    const killConds = new Map(useGameStore.getState().bot.conditions);
                    killConds.delete('Revival');
                    useGameStore.getState().setBot({ ...useGameStore.getState().bot, conditions: killConds });
                }
            }
        }

        // 4B-3: Symbiotic Relationship (re-implemented as health sync when boss heals)
        // Handled in bot hp update logic or via sub-effect

        // 7A: Causality Rearrangement (8% chance to apply attack twice)
        if (store.equippedAltarSkills.includes('7A') && damage > 0 && !isPuzzleCorrect && !isAdrenalineNull) {
            if (Math.random() < 0.08) {
                await wait(600);
                setMessage(language === 'KR' ? '인과재배열!' : 'CAUSALITY REARRANGEMENT!');
                triggerScreenEffect('shake');
                playConditionSound('Triple Attack'); // Use same impactful sound
                const freshBot7A = useGameStore.getState().bot;
                const newBotHpDouble = Math.max(0, freshBot7A.hp - damage);
                setBotHp(newBotHpDouble);
                showDamageText('BOT', `-${damage}`, '#f39c12');
                await wait(600);
                if (newBotHpDouble <= 0) {
                    await handleVictory();
                    return;
                }
            }
        }

        if (recoilTaken > 0) {
            const freshP = useGameStore.getState().player;
            const hpAfterRecoil = Math.max(0, freshP.hp - recoilTaken);
            setPlayerHp(hpAfterRecoil);
            showDamageText('PLAYER', `-${recoilTaken}`, '#e74c3c');
            if (hpAfterRecoil <= 0) await checkPlayerSurvival();
        }

        const freshBotTut = useGameStore.getState().bot;
        if (store.isTutorial && freshBotTut.hp < 300) {
            setBotHp(1000);
            store.setMessage(t.COMBAT.TUTORIAL_RESTORED);
        }

        // Awakening Logic
        const freshBotBeforeAwaken = useGameStore.getState().bot; // Critical: Get current state after all adjustments
        const finalBotHp = freshBotBeforeAwaken.hp;
        let awakeningTriggered = false;

        if (finalBotHp > 0 && finalBotHp <= freshBotBeforeAwaken.maxHp * 0.5 && !freshBotBeforeAwaken.conditions.has('Awakening')) {
            if ((store.chapterNum === '1' && stageNum === 10) || (store.chapterNum === '2A' && stageNum === 10) || (store.chapterNum === '2B' && stageNum === 10)) {
                awakeningTriggered = true;
                const atkBonus = store.chapterNum === '1' ? ({ [Difficulty.EASY]: 20, [Difficulty.NORMAL]: 30, [Difficulty.HARD]: 40, [Difficulty.HELL]: 50 }[store.difficulty] || 30) : (store.chapterNum === '2A' ? 20 : 25);
                const newAtk = freshBotBeforeAwaken.atk + atkBonus;
                const newConditions = new Map(freshBotBeforeAwaken.conditions);
                newConditions.delete('Damage Reducing');
                newConditions.delete('Regenerating');
                newConditions.delete('Reflection');
                import('../logic/conditions').then(({ applyCondition }) => {
                    applyCondition(newConditions, 'Awakening', 9999, t.CONDITIONS.AWAKENING.DESC, { atkBonus });
                    store.syncBot({ ...freshBotBeforeAwaken, hp: freshBotBeforeAwaken.maxHp, atk: newAtk, conditions: newConditions });
                });
                setMessage(t.COMBAT.AWAKENING);
                AudioManager.playSFX('/assets/audio/conditions/Awakening.mp3');
            }
        }

        const freshBotAfterRevive = useGameStore.getState().bot;
        if (freshBotAfterRevive.hp <= 0 && store.chapterNum === '2A' && stageNum === 1) {
            if (!freshBotAfterRevive.conditions.has('Revived') && Math.random() < 0.5) {
                const reviveHp = Math.floor(freshBotAfterRevive.maxHp * 0.5);
                setBotHp(reviveHp);
                store.addBotCondition('Revived', 9999);
                setMessage(`${t.CONDITIONS.REVIVED.NAME}!`);
                AudioManager.playSFX('/assets/audio/conditions/부활(Revival).mp3');
                await wait(1000);
            }
        }

        // --- PHASE 4: SCATTERED ---
        store.setGamePhase('SCATTERED');
        await wait(400);
        setBotAnimState('NONE');
        store.removePlayerCards(selectedIndices);

        // Regenerating Logic
        const stagesWithRegen = [6, 8, 10];
        const config = DIFFICULTY_CONFIGS[store.difficulty];
        if (config.stage9HasRegen) stagesWithRegen.push(9);
        const freshBotRegenCheck = useGameStore.getState().bot;
        const isBotAwakened = freshBotRegenCheck.conditions.has('Awakening');
        if (store.chapterNum === '1' && stagesWithRegen.includes(stageNum) && freshBotRegenCheck.hp < freshBotRegenCheck.maxHp && !freshBotRegenCheck.conditions.has('Regenerating') && !isBotAwakened) {
            if (stageNum !== 6 || freshBotRegenCheck.hp <= freshBotRegenCheck.maxHp * 0.5) {
                store.addBotCondition('Regenerating', 3, `At the end of each turn, restores ${Math.floor(config.regenPercent * 100)}% HP.`, { percent: config.regenPercent });
                playConditionSound('Regenerating');
            }
        }

        // 2B Specific Triggers
        const freshBot = useGameStore.getState().bot;
        const invincCond = freshBot.conditions.get('Invincible spirit');
        if (invincCond && freshBot.hp > 0 && freshBot.hp <= (invincCond.data as any)?.threshold) {
            const heal = (invincCond.data as any)?.heal || 100;
            const limit = (invincCond.data as any)?.limit || 1;
            if (limit > 0) {
                setBotHp(Math.min(freshBot.maxHp, freshBot.hp + heal));
                setMessage(t.CONDITIONS.INVINCIBLE_SPIRIT.NAME + "!");
                playConditionSound('Invincible spirit');
                showDamageText('BOT', `+${heal}`, '#2ecc71');
                const newConds = new Map(freshBot.conditions);
                const updated = { ...invincCond, data: { ...((invincCond.data as any) || {}), limit: limit - 1 } };
                if (updated.data.limit <= 0) newConds.delete('Invincible spirit');
                else newConds.set('Invincible spirit', updated);
                useGameStore.getState().setBot({ ...freshBot, conditions: newConds });
                await wait(1000);
            }
        }
        
        if (store.chapterNum === '2B') {
            const bThresholds: Record<number, number> = { 4: 0.2, 7: 0.3, 10: 0.3 };
            const bAtkBonuses: Record<number, number> = { 4: 15, 7: 20, 10: 25 };
            const bLifesteals: Record<number, number> = { 4: 10, 7: 10, 10: 15 };
            if (bThresholds[stageNum] && freshBot.hp > 0 && freshBot.hp < (freshBot.maxHp * bThresholds[stageNum])) {
                if (!freshBot.conditions.has('Berserker')) {
                    store.addBotCondition('Berserker', 9999, '', { atkBonus: bAtkBonuses[stageNum], lifesteal: bLifesteals[stageNum] });
                    setMessage(t.CONDITIONS.BERSERKER.NAME + "!");
                    playConditionSound('Berserker');
                    await wait(1000);
                }
            }
        }

        // ── 3B-9 각성(AWAKENING) 트리거 ──────────────────────────────
        const freshBot3B9 = useGameStore.getState().bot;
        if (store.chapterNum === '3B' && stageNum === 9) {
            if (freshBot3B9.hp > 0 && freshBot3B9.hp <= freshBot3B9.maxHp * 0.4 && !freshBot3B9.conditions.has('Awakening')) {
                setMessage("각성: 보스가 기운을 되찾고 모든 방해를 떨쳐내며 더욱 흉포해집니다!");
                playConditionSound('Awakening');
                triggerScreenEffect('flash-red');
                
                // v2.5.0: 사용자 요구사항 - 기존 버프(피해경감, 재생 등) 모두 제거
                const newBotConds = new Map<string, any>(); 
                // Awakening은 중복 발동 방지를 위해 새로 추가
                newBotConds.set('Awakening', { name: TRANSLATIONS.KR.CONDITIONS.AWAKENING.NAME, duration: 9999, elapsed: 0, data: {} });

                const awakenedBot = {
                    ...freshBot3B9,
                    hp: freshBot3B9.maxHp,
                    atk: freshBot3B9.atk + 20, // 사용자 요구사항: ATK +20
                    conditions: newBotConds
                };
                store.setBot(awakenedBot);
                
                await wait(1200);
                await proceedToEndTurn();
                return;
            }
        }

        const freshBotEndCheck = useGameStore.getState().bot;
        if (freshBotEndCheck.hp <= 0) {
            // 보스 부활 기믹 (3A-10 HYDRA 등)
            const revivalCond = freshBotEndCheck.conditions.get('Revival');
            if (revivalCond) {
                const limit = (revivalCond.data as any)?.limit || 1;
                if (limit > 0) {
                    const healPercent = (revivalCond.data as any)?.percent || 0.6;
                    const reviveHp = Math.floor(freshBotEndCheck.maxHp * healPercent);
                    setBotHp(reviveHp);
                    setMessage(t.CONDITIONS.REVIVAL.NAME + "!");
                    playConditionSound('Revival');
                    showDamageText('BOT', `+${reviveHp}`, '#2ecc71');
                    
                    const newConds = new Map(freshBotEndCheck.conditions);
                    const updated = { ...revivalCond, data: { ...((revivalCond.data as any) || {}), limit: limit - 1 } };
                    if (updated.data.limit <= 0) newConds.delete('Revival');
                    else newConds.set('Revival', updated);
                    
                    useGameStore.getState().setBot({ ...freshBotEndCheck, hp: reviveHp, conditions: newConds });
                    
                    await wait(1500);
                    
                    // "부활 직후 1턴 공격 불가"
                    setMessage("보스가 행동을 회복 중입니다...");
                    await wait(1000);
                    await proceedToEndTurn();
                    return; // 승리/봇턴 분기 스킵
                }
            }

            await handleVictory();
        } else {
            if (awakeningTriggered) {
                setMessage(t.COMBAT.ST_AWAKENING);
                await wait(1200);
                await proceedToEndTurn();
            } else {
                await executeBotTurn();
            }
        }
    };

    const executeBotTurn = async () => {
        const store = useGameStore.getState();
        store.setGamePhase('BOT_TURN');
        const currentBot = store.bot;
        const currentPlayer = store.player;

        // --- Special Boss Awakening Logic ---
        if (store.chapterNum === '2A' && stageNum === 11) {
            if (currentBot.hp <= currentBot.maxHp * 0.5 && !currentBot.conditions.has('Awakening')) {
                setMessage(t.COMBAT.AWAKENING || "BOSS AWAKENING!");
                playConditionSound('Awakening');
                // Remove DR and Regen as per plan
                const newBotConds = new Map(currentBot.conditions);
                newBotConds.delete('Damage Reducing');
                newBotConds.delete('Regenerating');
                newBotConds.delete('Triple Attack');
                store.setBot({
                    ...currentBot,
                    hp: currentBot.maxHp,
                    atk: currentBot.atk + 20,
                    conditions: newBotConds
                });
                store.addBotCondition('Awakening', 9999);

                await wait(1200);
                await proceedToEndTurn();
                return;
            }
        } else if (store.chapterNum === '2B' && stageNum === 11) {
            if (currentBot.hp <= currentBot.maxHp * 0.5 && !currentBot.conditions.has('Awakening')) {
                setMessage(t.COMBAT.AWAKENING || "BOSS AWAKENING!");
                playConditionSound('Awakening');
                // Remove DR and Reflection
                const newBotConds = new Map(currentBot.conditions);
                newBotConds.delete('Damage Reducing');
                newBotConds.delete('Reflection');
                store.setBot({
                    ...currentBot,
                    hp: currentBot.maxHp,
                    atk: currentBot.atk + 8,
                    conditions: newBotConds
                });
                store.addBotCondition('Awakening', 9999);

                await wait(1200);
                await proceedToEndTurn();
                return;
            }
        }

        let baseDmg = currentBot.atk;

        // v2.3.0: Boss Buffs (Berserker / Damage Recoiling)
        const bCond = currentBot.conditions.get('Berserker');
        if (bCond) {
            baseDmg += (bCond.data as any)?.atkBonus || 0;
        }

        const rCond = currentBot.conditions.get('Damage recoiling');
        if (rCond) {
            baseDmg += (rCond.data as any)?.bonus || 0;
        }

        const damage = calculateBotDamage(baseDmg);

        await new Promise(r => setTimeout(r, 1500));

        if (store.chapterNum === '1' && stageNum === 8 && store.currentTurn % 2 === 0) {
            setMessage(t.COMBAT.BOSS_SKIPPED);
            AudioManager.playSFX('/assets/audio/combat/chapter 1 goblin/06_swing_ weapon.mp3');
            await wait(1000);
            await proceedToEndTurn();
            return;
        }

        if (store.chapterNum === '3B' && stageNum === 7 && store.holdBreathInvulnerable3B) {
            setMessage("숨참기: 보스가 이번 턴에 공격하지 않습니다.");
            store.setHoldBreathInvulnerable3B(false); // 플래그 해제
            await wait(1000);
            await proceedToEndTurn();
            return;
        }

        // v2.3.2: 2A-7 Sand Golem (Every 2 turns)
        if (store.chapterNum === '2A' && stageNum === 7 && store.currentTurn % 2 === 0) {
            setMessage(t.COMBAT.BOSS_SKIPPED);
            await wait(1000);
            await proceedToEndTurn();
            return;
        }

        // 3A-6 Cave Bear: Honey Yummy 꿀섭취 (20% 스킵)
        if (store.chapterNum === '3A' && stageNum === 6 && Math.random() < 0.20) {
            setMessage("꿀 섭취 중! (공격 스킵 & 체력 회복)");
            setBotHp(Math.min(currentBot.maxHp, currentBot.hp + 20));
            showDamageText('BOT', `+20`, '#2ecc71');
            await wait(1000);
            await proceedToEndTurn();
            return;
        }

        // --- Special Boss Special Attacks ---
        if (store.chapterNum === '2A' && stageNum === 11) {
            const cycleTurn = (store.currentTurn % 3);
            if (cycleTurn === 1) {
                // Turn 2 of 3 (indices 1, 4, 7...): Skip/Setup
                setMessage("’특수 공격: 모래폭풍’을 준비 중입니다…");
                await wait(1200);
                await proceedToEndTurn();
                return;
            } else if (cycleTurn === 2) {
                // Turn 3 of 3 (indices 2, 5, 8...): Special Attack
                setMessage("모래 폭풍 피해를 받습니다!");
                setBotAnimState('ATTACK');
                AudioManager.playSFX('/assets/audio/combat/chapter 2a desert/2A_SAND DRAGON_SAND STORM.mp3');
                let dmg = 70;

                // 4B-2: Node Interference (Reduce 50% & Reflect)
                dmg = applyNodeInterference(dmg);

                setPlayerHp(Math.max(0, currentPlayer.hp - dmg));
                showDamageText('PLAYER', `-${dmg}`, '#e74c3c');
                if (Math.random() < 0.4) {
                    store.addPlayerCondition('Burn', 3);
                    playConditionSound('Burn');
                }
                await wait(1200);
                await proceedToEndTurn();
                return;
            }
            // Turn 1 of 3 (indices 0, 3, 6...): Proceed to Normal Attack
        } else if (store.chapterNum === '2B' && stageNum === 11) {
            const isAwakened = currentBot.conditions.has('Awakening');
            if (isAwakened) {
                const awakenCond = currentBot.conditions.get('Awakening');
                const awakenTurn = awakenCond?.elapsed || 0;
                const cycleTurn = (awakenTurn % 4);
                if (cycleTurn === 2) {
                    // Skip turn before special
                    setMessage("’특수 공격: 부패 폭발’을 준비 중입니다…");
                    await wait(1200);
                    await proceedToEndTurn();
                    return;
                } else if (cycleTurn === 3) {
                    // Special Attack
                    setMessage("부패 폭발 피해를 받습니다!");
                    setBotAnimState('ATTACK');
                    AudioManager.playSFX('/assets/audio/combat/chapter 2b deep forest/2B_HIGH ORC SHAMAN_DECAY EXPLOSION.mp3');
                    let dmg = 30;

                    // 4B-2: Node Interference (Reduce 50% & Reflect)
                    dmg = applyNodeInterference(dmg);

                    setPlayerHp(Math.max(0, currentPlayer.hp - dmg));
                    showDamageText('PLAYER', `-${dmg}`, '#e74c3c');
                    if (Math.random() < 0.8) {
                        store.addPlayerCondition('Decay', 4);
                        playConditionSound('Decay');
                    }
                    await wait(1200);
                    await proceedToEndTurn();
                    return;
                }
            }
        }

        // v2.1.2: Unified Evasion Check (Passive Skill)
        const config = DIFFICULTY_CONFIGS[store.difficulty];
        const avoidCond = currentPlayer.conditions.get('Avoiding');
        const has2B = store.equippedAltarSkills.includes('2B');
        const isBossStage = stageNum >= 10;



        // 3B-7: HOLD_BREATH(숨참기) - 보스 공격 2회 성공 후 다음 턴 100% 차단
        if (store.chapterNum === '3B' && stageNum === 7) {
            const holdBreathActive = store.holdBreathTurn3B === store.currentTurn;
            if (holdBreathActive) {
                setMessage("숨참기: 보스가 공격을 완전히 막고 행동을 회복 중입니다...");
                triggerScreenEffect('flash-red');
                await wait(1000);
                await proceedToEndTurn();
                return;
            }
        }

        // ────────── 잠김(Swamping) 회피 패널티 계산 ──────────────────────
        let swampAvoidPenalty = 0;
        if (store.chapterNum === '3B') {
            const swampCond = currentPlayer.conditions.get('Swamping');
            const swampAttackCount = (swampCond?.data as any)?.attackCount || 0;
            swampAvoidPenalty = swampAttackCount < 5 ? 0.05 : 0.20;
        }

        // 5B-1: Threat Prediction (100% evasion on first attack in boss stages 10/SP)
        const isFirstBossAttack = isBossStage && store.currentTurn === 0 && !store.stageSkillsTriggered.includes('5B-1');
        if (store.equippedAltarSkills.includes('5B-1') && isFirstBossAttack) {
            store.setStageSkillTriggered('5B-1');
            setMessage('THREAT PREDICTION!');
            playConditionSound('Avoiding');
            triggerScreenEffect('flash-red');
            await wait(1000);
            await proceedToEndTurn();
            return;
        }

        let finalAvoidChance = avoidCond ? ((avoidCond.data as any)?.chance ?? config.avoidChance) : config.avoidChance;
        if (has2B) finalAvoidChance += 0.05;

        // 3B: 잠김(Swamping) 회피 패널티 적용 (최저 0%)
        finalAvoidChance = Math.max(0, finalAvoidChance - swampAvoidPenalty);

        // v2.3.6: Chapter 2B Environmental Rule - Player Avoiding is DISABLED (unless 2B skill is equipped)
        const isAvoided = !isTutorial && (store.chapterNum !== '2B' || has2B) && finalAvoidChance > 0 && Math.random() < finalAvoidChance;

        if (isAvoided) {
            setMessage(t.COMBAT.ATTACK_AVOIDED);
            playConditionSound('Avoiding');
            triggerScreenEffect('flash-red');
            await wait(1000);
            await proceedToEndTurn();
            return;
        }

        // v2.3.7: Boss Accuracy Check
        const botAccuracy = currentBot.accuracy ?? 1.0;
        if (botAccuracy < 1.0 && Math.random() > botAccuracy) {
            setMessage(t.COMBAT.BOSS_MISSED);
            // Play swing sound for miss
            AudioManager.playSFX('/assets/audio/combat/chapter 1 goblin/06_swing_ weapon.mp3');
            await wait(1000);
            await proceedToEndTurn();
            return;
        }

        // Determine number of attacks
        let attackCount = 1;

        // v2.3.2: 2A-6 Triple Attack (Strict Condition Check)
        if (store.chapterNum === '2A' && currentBot.conditions.has('Triple Attack')) {
            if (Math.random() < 0.5) {
                attackCount = 2;
                if (Math.random() < 0.3) {
                    attackCount = 3;
                }
            }
        } else if (store.chapterNum === '2B' && stageNum === 3) {
            // Half Orc Double Attack (40% second)
            if (Math.random() < 0.4) {
                attackCount = 2;
            }
        }

        // 3A Echo (메아리 보스 패시브) 공격 횟수 추가 로직 적용
        const botEchoCond = currentBot.conditions.get('Echo');
        let hasEchoAdded = false;
        let echoDamage = 0;
        if (botEchoCond && Math.random() < ((botEchoCond.data as any)?.chance || 0.20)) {
            hasEchoAdded = true;
            attackCount += 1;
            echoDamage = Math.floor(damage * ((botEchoCond.data as any)?.damageScale || 0.70));
        }

        const sfx = getBossAttackSFX(store.chapterNum, stageNum);

        // Execute Attacks Loop
        for (let i = 0; i < attackCount; i++) {
            // Visual & Audio updates
            if (i === 0) {
                setMessage(t.COMBAT.BOSS_ATTACKS);
                setBotAnimState('ATTACK');
                if (sfx) scaledTimeout(() => AudioManager.playSFX(sfx), 200);
            } else {
                // For Triple Attack, show specific message and play sound again
                const msg = i === 1 ? t.CONDITIONS.TRIPLE_ATTACK.NAME + " x2!" : t.CONDITIONS.TRIPLE_ATTACK.NAME + " x3!";
                store.setMessage(msg);
                playConditionSound('Triple Attack'); // Sound for the skill activation visual
                if (sfx) AudioManager.playSFX(sfx); // Actual attack impact sound
                setBotAnimState('ATTACK'); // Re-trigger animation state if possible (might need reset)
            }

            // 2A-5 Force Swap Logic (Triggered on first attack)
            if (i === 0 && store.chapterNum === '2A' && stageNum === 5) {
                const hand = store.playerHand;
                const indices = hand.map((c, idx) => c !== null ? idx : -1).filter(idx => idx !== -1);
                if (indices.length > 0) {
                    const shuffleIndices = indices.sort(() => 0.5 - Math.random());
                    const targets = shuffleIndices.slice(0, 2); // 2 cards swapped without consuming
                    store.swapCards(targets, true);
                    setMessage("FORCE SWAP x2");
                    await wait(500);
                }
            }

            await wait(200);
            triggerScreenEffect('shake-heavy');
            setPlayerAnimState('HIT');

            // Apply Damage
            let finalDmg = (store.chapterNum === '2B' && stageNum === 8 && Math.random() < 0.25)
                ? Math.floor(damage * 1.5) // Critical Hit for 2B-8
                : damage;

            // 3B-1: Equipment Gear (Boss Attack Damage -30%)
            if (store.equippedAltarSkills.includes('3B-1')) {
                finalDmg = Math.floor(finalDmg * 0.7);
            }

            if (finalDmg > damage && !hasEchoAdded) {
                setMessage(t.COMBAT.CRITICAL_HIT);
                triggerScreenEffect('flash-red');
            }

            // Echo 특수타격 오버라이드 (추가된 마지막 타격일 경우)
            if (hasEchoAdded && i === attackCount - 1) {
                finalDmg = echoDamage;
                setMessage("메아리 추가 타격!");
                triggerScreenEffect('shake');
            }

            // 3A-9 Basilisk Petrify 기믹
            if (store.chapterNum === '3A' && stageNum === 9 && Math.random() < 0.40) {
                const pHand = store.playerHand;
                const petrifyTargets = pHand.map((c, idx) => c && !c.isPetrified ? idx : -1).filter(idx => idx !== -1);
                if (petrifyTargets.length > 0) {
                    const rndIdx = petrifyTargets[Math.floor(Math.random() * petrifyTargets.length)];
                    const newHand = [...pHand];
                    newHand[rndIdx] = { ...(newHand[rndIdx] as Card), isPetrified: true, petrifyDuration: 2 };
                    useGameStore.getState().setPlayerHand(newHand);
                    setMessage("카드가 석화되었습니다!");
                    playConditionSound('Paralyzing'); // 석화 효과음
                    showConditionGuideIfNew('Petrified');
                }
            }

            setPlayerHp(applyDamage(useGameStore.getState().player.hp, finalDmg));
            showDamageText('PLAYER', `-${finalDmg}`, '#e74c3c');

            // 3B-7: HOLD_BREATH(숨참기) - 보스 공격 성공 시 카운터 (2.4.0)
            if (store.chapterNum === '3B' && stageNum === 7 && finalDmg > 0) {
                const hbCount = store.holdBreathCount3B + 1;
                if (hbCount >= 2) {
                    store.setHoldBreathTurn3B(store.currentTurn + 1);
                    store.setHoldBreathInvulnerable3B(true);
                    store.setHoldBreathCount3B(0);
                    setMessage("숨참기: 보스가 공격을 멈추고 다음 턴 무적 상태가 됩니다!");
                } else {
                    store.setHoldBreathCount3B(hbCount);
                }
            }

            // v2.3.0: Boss Lifesteal / Recoil / Provocation
            const freshBotAfterHit = useGameStore.getState().bot;
            
            // 2B Orcs Berserker Lifesteal
            if (store.chapterNum === '2B') {
                const bCondHit = freshBotAfterHit.conditions.get('Berserker');
                if (bCondHit) {
                    const heal = Math.floor(finalDmg * ((bCondHit.data as any)?.lifesteal || 10) / 100);
                    if (heal > 0) {
                        setBotHp(Math.min(freshBotAfterHit.maxHp, freshBotAfterHit.hp + heal));
                        showDamageText('BOT', `+${heal}`, '#2ecc71');
                    }
                }
            }

            if (store.chapterNum === '2B' && stageNum === 2 && Math.random() < 0.4) {
                // Damage Recoiling logi: +10 dmg, 12 recoil
                // wait, user said "보스 공격 시... 발생 확률 40%". Does it mean it applies a status or just happens once?
                // "본인에게도 12데미지... 데미지 반동 상태이상 발생" 
                // I'll apply the status effect 'Damage recoiling' with data if not present, 
                // and maybe apply the immediate effect too.
                if (!freshBotAfterHit.conditions.has('Damage recoiling')) {
                    store.addBotCondition('Damage recoiling', 3, '', { bonus: 10, recoil: 12, chance: 100 });
                }
            }

            const pCond = freshBotAfterHit.conditions.get('Provocation');
            if (pCond && Math.random() < ((pCond.data as any)?.chance / 100 || 0.3)) {
                // Apply Decreasing Accuracy to Player
                // 2A-2: Hunter (Immune to accuracy reduction & paralysis)
                if (store.equippedAltarSkills.includes('2A-2')) {
                    setMessage("HUNTER IMMUNITY!");
                } else {
                    // 2B/3B-5: 20%, 2B/3B-9: 25%, default: 30%
                    const isAdvancedChapter = store.chapterNum === '2B' || store.chapterNum === '3B' || store.chapterNum === '3A';
                    const accPercent = (isAdvancedChapter && stageNum === 5) ? 20 : ((isAdvancedChapter && stageNum === 9) ? 25 : 30);
                    store.addPlayerCondition('Decreasing accuracy', 3, '', { percent: accPercent });
                    showConditionGuideIfNew('Decreasing accuracy');
                }
            }

            // Recoil Damage if Boss has 'Damage recoiling' status
            const recoCond = freshBotAfterHit.conditions.get('Damage recoiling');
            if (recoCond) {
                const recoil = (recoCond.data as any)?.recoil || 12;
                setBotHp(Math.max(0, freshBotAfterHit.hp - recoil));
                showDamageText('BOT', `-${recoil}`, '#e74c3c');
            }

            // 3A-2: HEMATOPHAGY (흡혈 30%)
            if (store.chapterNum === '3A' && stageNum === 2 && finalDmg > 0) {
                const heal = Math.floor(finalDmg * 0.3);
                if (heal > 0) {
                    setBotHp(Math.min(currentBot.maxHp, currentBot.hp + heal));
                    showDamageText('BOT', `+${heal}`, '#2ecc71');
                    AudioManager.playSFX('/assets/audio/conditions/Regenerating.mp3');
                }
            }
            // 3A-4: POISON SPIDER (공격 시 20% 확률로 신경성맹독 부여)
            if (store.chapterNum === '3A' && stageNum === 4 && finalDmg > 0 && Math.random() < 0.2) {
                store.addPlayerCondition('Neurotoxicity', 3);
                playConditionSound('Neurotoxicity');
                setMessage(t.CONDITIONS.NEUROTOXICITY.NAME + "!");
                showConditionGuideIfNew('Neurotoxicity');
            }
            // 3A-9: PETRIFY ATTACK (30% 확률로 카드 석화)
            if (store.chapterNum === '3A' && stageNum === 9 && Math.random() < 0.3) {
                setMessage("석화의 시선!");
                store.applyPetrifyStatus(1);
                AudioManager.playSFX('/assets/audio/common/UI_ERROR.mp3'); // Appropriate SFX for status
                showConditionGuideIfNew('Petrified');
            }

            await wait(i < attackCount - 1 ? 800 : 400); // Delay between multi-attacks

            // Reset anim for next hit
            setBotAnimState('NONE');
            setPlayerAnimState('NONE');
        }

        const freshPlayer = useGameStore.getState().player;
        if (freshPlayer.hp <= 0) {
            const survived = await checkPlayerSurvival();
            if (survived) {
                await wait(1000);
                await proceedToEndTurn();
                return;
            }
        }

        // --- Status Effects (v2.3.2: Chapter 2A Adjustments) ---
        if (store.chapterNum === '2A') {
            if ([1, 2, 3, 6, 8, 9, 10].includes(stageNum)) {
                if (Math.random() < config.poisonProbCh2A) {
                    store.addPlayerCondition('Poisoning', 3);
                    showConditionGuideIfNew('Poisoning');
                }
            }
            if ([1, 2, 3, 6, 8, 9, 10].includes(stageNum)) {
                if (Math.random() < 0.3) {
                    store.addPlayerCondition('Debilitating', 3);
                    showConditionGuideIfNew('Debilitating');
                }
            }
            if ([3, 4, 6, 9, 10].includes(stageNum)) {
                if (Math.random() < config.bleedProbCh2A) {
                    store.addPlayerCondition('Bleeding', 6);
                    showConditionGuideIfNew('Bleeding');
                }
            }
            if (stageNum === 5) {
                // Neurotoxicity: 3 turns (Applying Blind/Paralyze is handled via applyCondition side effects or here)
                if (Math.random() < 0.40) {
                    // Replaced neuroProbCh2A with explicit 40%
                    store.addPlayerCondition('Neurotoxicity', 3);
                    showConditionGuideIfNew('Neurotoxicity');
                }
            }
            if (stageNum === 7) {
                // Now 40% based on user request (down from 50%)
                if (Math.random() < 0.4) {
                    store.addPlayerCondition('Paralyzing', 2);
                    showConditionGuideIfNew('Paralyzing');
                }
            }
        } else if (store.chapterNum === '3A') {
            // 3A 고정 피해 및 상태이상 (Acid, Mucus, Shooting Web, Roll Boulder)
            const currentTurnMod = (store.currentTurn % 3);
            const currentTurnMod2 = (store.currentTurn % 2);

            // 3A-1: ACID ATTACK (매 3턴 15뎀 + 화상)
            if (stageNum === 1 && currentTurnMod === 2) {
                setMessage("산성 공격!");
                setPlayerHp(Math.max(0, store.player.hp - 15));
                showDamageText('PLAYER', `-15`, '#e74c3c');
                if (Math.random() < 0.2) {
                    store.addPlayerCondition('Burn', 3);
                    showConditionGuideIfNew('Burn');
                }
            }
            // 3A-3: MUCUS (매 2턴 20뎀 + 50% 중독 또는 명중저하)
            if (stageNum === 3 && currentTurnMod2 === 1) {
                setMessage("점액 분비!");
                setPlayerHp(Math.max(0, store.player.hp - 20));
                showDamageText('PLAYER', `-20`, '#e74c3c');
                if (Math.random() < 0.5) {
                    if (Math.random() < 0.5) {
                        store.addPlayerCondition('Poisoning', 3);
                        showConditionGuideIfNew('Poisoning');
                    }
                    else {
                        store.addPlayerCondition('Decreasing accuracy', 3, '', { percent: 30 });
                        showConditionGuideIfNew('Decreasing accuracy');
                    }
                }
            }
            // 3A-4: SHOOTING WEB (매 2턴 10뎀 + 거미줄)
            if (stageNum === 4 && currentTurnMod2 === 1) {
                setMessage("거미줄 투척!");
                setPlayerHp(Math.max(0, store.player.hp - 10));
                showDamageText('PLAYER', `-10`, '#e74c3c');
                // 회피 5% 깎는 디버프 처리 (별도 관리 어려우므로 명중률 저하로 대체)
                store.addPlayerCondition('Decreasing accuracy', 3, '', { percent: 5 });
                showConditionGuideIfNew('Decreasing accuracy');
            }
            // 3A-8: ROLL BOULDER (매 2턴 20뎀, 플레이어 40% 확률 회피)
            if (stageNum === 8 && currentTurnMod2 === 1) {
                setMessage("바위 굴리기!");
                triggerScreenEffect('shake-heavy');
                
                if (Math.random() < 0.4) {
                    setMessage(t.COMBAT.ATTACK_AVOIDED);
                    showDamageText('PLAYER', t.COMBAT.ATTACK_AVOIDED, '#f39c12');
                } else {
                    setPlayerHp(Math.max(0, store.player.hp - 20));
                    showDamageText('PLAYER', `-20`, '#e74c3c');
                }
            }
            // 3A-7: BRITTLE 스택 리셋 체크
            if (stageNum === 7) {
                const brittCond = currentBot.conditions.get('Brittle');
                if (brittCond) {
                    const st = (brittCond.data as any)?.stackCount || 0;
                    if (st >= 5) {
                        setMessage("취성 파괴! (경감 초기화)");
                        const freshBotC = new Map(currentBot.conditions);
                        // 피해경감 10%부터 재시작
                        const drCond = freshBotC.get('Damage Reducing');
                        if (drCond && drCond.data) {
                            freshBotC.set('Damage Reducing', { 
                                ...drCond, 
                                data: { ...(drCond.data as object), percent: 10 } 
                            } as any);
                        }
                        freshBotC.set('Brittle', { ...brittCond, data: { ...(brittCond.data as any), stackCount: 0 } });
                        store.setBot({ ...currentBot, conditions: freshBotC });
                    }
                }
            }

        } else if (store.chapterNum === '2B') {
            // v2.3.9: Chapter 2B Special Stage (Stage 11) - 100% Status Application
            if (stageNum === 11 && !currentBot.conditions.has('Awakening')) {
                const freshP = useGameStore.getState().player;
                if (!freshP.conditions.has('Bleeding')) {
                    store.addPlayerCondition('Bleeding', 4);
                    playConditionSound('Bleeding');
                    setMessage(t.CONDITIONS.BLEEDING.NAME + "!");
                    showConditionGuideIfNew('Bleeding');
                } else {
                    const effect = Math.random() < 0.5 ? 'Poisoning' : 'Debilitating';
                    store.addPlayerCondition(effect, 4);
                    playConditionSound(effect);
                    const condKey = effect.toUpperCase();
                    const condName = (t.CONDITIONS as any)[condKey]?.NAME || effect;
                    setMessage(condName + "!");
                    showConditionGuideIfNew(effect);
                }
                triggerScreenEffect('flash-red');
            } else {
                // Standard 2B Status Application logic
                const bleedMap: Record<number, number> = { 1: 0.10, 2: 0.12, 3: 0.15, 4: 0.12, 5: 0, 6: 0.12, 7: 0.15, 8: 0.17, 9: 0.20, 10: 0.15 };
                const bProb = bleedMap[stageNum] || 0.15;
                if (bProb > 0 && Math.random() < bProb) {
                    store.addPlayerCondition('Bleeding', 4);
                    showConditionGuideIfNew('Bleeding');
                }
                if (stageNum === 8 && Math.random() < 0.25) {
                    store.addPlayerCondition('Poisoning', 4);
                    showConditionGuideIfNew('Poisoning');
                }
            }
        } else if (store.chapterNum === '1') {
            // v2.3.7: Restore Chapter 1 Status Application Mechanics
            applyBotStageMechanics();
        } else if (store.chapterNum === '3B') {
            // ── 3B 보스 공격 후 상태이상 부여 ─────────────────────────────
            const freshP3B = useGameStore.getState().player;
            // 3B-1: 출혈 20%
            if (stageNum === 1 && Math.random() < 0.2) {
                store.addPlayerCondition('Bleeding', 4);
                playConditionSound('Bleeding');
                triggerScreenEffect('flash-red');
                showConditionGuideIfNew('Bleeding');
            }
            // 3B-2: 진흙 뿌리기 40% (1장) + 중독 20%
            if (stageNum === 2) {
                if (Math.random() < 0.4) {
                    store.applyMudStatus(1);
                    setMessage("진흙 뿌리기: 카드 1장이 진흙 상태가 됩니다!");
                    triggerScreenEffect('shake-small');
                    showConditionGuideIfNew('Mudded');
                }
                if (Math.random() < 0.2) { 
                    store.addPlayerCondition('Poisoning', 3); 
                    showConditionGuideIfNew('Poisoning');
                }
            }
            // 3B-3,4: 출혈 20% + 중독 10%
            if ((stageNum === 3 || stageNum === 4)) {
                if (Math.random() < 0.2) { 
                    store.addPlayerCondition('Bleeding', 4); 
                    playConditionSound('Bleeding'); 
                    showConditionGuideIfNew('Bleeding');
                }
                if (Math.random() < 0.1) { 
                    store.addPlayerCondition('Poisoning', 3); 
                    showConditionGuideIfNew('Poisoning');
                }
            }
            // 3B-5: 과출혈 30%
            if (stageNum === 5 && Math.random() < 0.3) {
                store.addPlayerCondition('Heavy Bleeding', 4);
                playConditionSound('Heavy Bleeding');
                triggerScreenEffect('flash-red');
                showConditionGuideIfNew('Heavy Bleeding');
            }
            // 3B-6: 쇠약 30% + 중독 30%
            if (stageNum === 6) {
                if (Math.random() < 0.3) { 
                    store.addPlayerCondition('Debilitating', 3); 
                    showConditionGuideIfNew('Debilitating');
                }
                if (Math.random() < 0.3) { 
                    store.addPlayerCondition('Poisoning', 3); 
                    showConditionGuideIfNew('Poisoning');
                }
            }
            // 3B-7: 과출혈 30%
            if (stageNum === 7 && Math.random() < 0.3) {
                store.addPlayerCondition('Heavy Bleeding', 4);
                playConditionSound('Heavy Bleeding');
                triggerScreenEffect('flash-red');
                showConditionGuideIfNew('Heavy Bleeding');
            }
            // 3B-8: 진흙 뿌리기 40% (랜덤 2장) + 출혈 20% + 쇠약 30%
            if (stageNum === 8) {
                if (Math.random() < 0.4) {
                    store.applyMudStatus(2);
                    setMessage(`진흙 뿌리기: 카드 2장이 진흙 상태가 됩니다!`);
                    triggerScreenEffect('shake-small');
                    showConditionGuideIfNew('Mudded');
                }
                if (Math.random() < 0.2) { 
                    store.addPlayerCondition('Bleeding', 4); 
                    playConditionSound('Bleeding'); 
                    showConditionGuideIfNew('Bleeding');
                }
                if (Math.random() < 0.3) { 
                    store.addPlayerCondition('Debilitating', 3); 
                    showConditionGuideIfNew('Debilitating');
                }
            }
            // 3B-9: 출혈 40% + 쇠약 40%
            if (stageNum === 9) {
                if (Math.random() < 0.4) { 
                    store.addPlayerCondition('Bleeding', 4); 
                    playConditionSound('Bleeding'); 
                    showConditionGuideIfNew('Bleeding');
                }
                if (Math.random() < 0.4) { 
                    store.addPlayerCondition('Debilitating', 3); 
                    showConditionGuideIfNew('Debilitating');
                }
            }
            // 3B-10: 과출혈 20% + 중독 20%
            if (stageNum === 10) {
                if (Math.random() < 0.2) { 
                    store.addPlayerCondition('Heavy Bleeding', 4); 
                    playConditionSound('Bleeding'); 
                    showConditionGuideIfNew('Heavy Bleeding');
                }
                if (Math.random() < 0.2) { 
                    store.addPlayerCondition('Poisoning', 3); 
                    showConditionGuideIfNew('Poisoning');
                }
            }

            // 잠김(Swamping) 공격 카운터 (보스 공격 시)
            const sCond = freshP3B.conditions.get('Swamping');
            if (sCond) {
                const prevCount = (sCond.data as any)?.attackCount || 0;
                store.addPlayerCondition('Swamping', 9999, '', { attackCount: prevCount + 1 });
            } else {
                store.addPlayerCondition('Swamping', 9999, '', { attackCount: 1 });
                showConditionGuideIfNew('Swamping');
            }
        }

        await wait(300);
        setBotAnimState('NONE');
        setPlayerAnimState('NONE');

        let updatedAtk = currentBot.atk;
        const maxAtkCap = 100;
        if (store.chapterNum === '1') {
            if (stageNum === 7) updatedAtk = Math.min(maxAtkCap, updatedAtk + 10);
            else if (stageNum === 9) updatedAtk = Math.min(maxAtkCap, updatedAtk * 2);
        }
        updatedAtk = Math.min(maxAtkCap, updatedAtk);
        if (updatedAtk !== currentBot.atk) store.syncBot({ ...currentBot, atk: updatedAtk });

        const finalPlayerHp = useGameStore.getState().player.hp;
        if (finalPlayerHp <= 0) {
            await handleDefeat();
        } else {
            if (isTutorial && tutorialStep === 9) {
                await wait(3000);
                setTutorialStep(10);
            }
            await proceedToEndTurn();
        }
    };

    const proceedToEndTurn = async () => {
        await resolveStatusEffects();
        const store = useGameStore.getState();
        if (store.player.hp <= 0) { await handleDefeat(); return; }
        if (store.bot.hp <= 0) { await handleVictory(); return; }

        const nextTurn = store.currentTurn + 1;
        store.setCurrentTurn(nextTurn);

        if (store.chapterNum === '3B') {
            if (stageNum === 6) {
                setMessage("초기의식: 핸드 초기화 및 패턴 붕괴!");
                triggerScreenEffect('flash-red');
                setPlayerHand(new Array(8).fill(null));
                const newDeck = store.deck;
                newDeck.jokerProbability = Math.max(0, newDeck.jokerProbability - 0.05);
                store.setDeck(newDeck);
                await refillHandSequentially(1200);
            }
            if (stageNum === 10 && store.bot.conditions.has('Stem Cell')) {
                const currentBot = store.bot;
                const healAmt = Math.floor(currentBot.maxHp * 0.20);
                const nextMaxHp = currentBot.maxHp + 10;
                const scCond = currentBot.conditions.get('Stem Cell');
                const prevAvoid = (scCond?.data as any)?.currentAvoid || 0;
                const nextAvoid = prevAvoid + 2;
                const updatedBot = { ...currentBot, maxHp: nextMaxHp, hp: Math.min(nextMaxHp, currentBot.hp + healAmt), atk: currentBot.atk + 2 };
                const newBotConds = new Map(currentBot.conditions);
                newBotConds.set('Stem Cell', { ...scCond!, data: { ...(scCond?.data as any), currentAvoid: nextAvoid } });
                newBotConds.set('Avoiding', { name: t.CONDITIONS.AVOIDING.NAME, duration: 9999, elapsed: 0, data: { chance: nextAvoid / 100 } } as any);
                store.setBot({ ...updatedBot, conditions: newBotConds });
                setMessage("줄기세포: 보스가 급격히 성장합니다!");
                showDamageText('BOT', `+${healAmt}`, '#2ecc71');
                await wait(1000);
            }
        }

        if (store.equippedAltarSkills.includes('8') && !store.stageSkillsTriggered.includes('8')) {
            if (Math.random() < 0.05) {
                store.setStageSkillTriggered('8');
                const currentHand = store.playerHand;
                const jokerHand = currentHand.map((c: any) => c ? { ...CardFactory.create(null, null, true), isJoker: true } : null);
                store.setPlayerHand(jokerHand);
                setMessage(store.language === 'KR' ? '시스템 과부하!' : 'SYSTEM OVERLOAD!');
                AudioManager.playSFX('/assets/audio/conditions/Awakening.mp3');
                await wait(1500);
            }
        }

        if (store.isTutorial) {
            if (store.tutorialStep === -1 || store.tutorialStep === 6) {
                if (nextTurn >= 5) {
                    const currentHand = store.playerHand;
                    const hasJoker = currentHand.some(c => c?.isJoker);
                    if (!hasJoker) {
                        const nullIdx = currentHand.indexOf(null);
                        const jokerCard = { ...CardFactory.create(null, null, true), isJoker: true };
                        if (nullIdx !== -1) { const updatedHand = [...currentHand]; updatedHand[nullIdx] = jokerCard; setPlayerHand(updatedHand); }
                        else { const updatedHand = [...currentHand]; updatedHand[updatedHand.length - 1] = jokerCard; setPlayerHand(updatedHand); }
                    }
                    store.setTutorialStep(7);
                } else if (nextTurn === 3) {
                    store.setTutorialStep(13);
                }
            } else if (store.tutorialStep === 7 || store.tutorialStep === -7) {
                store.setTutorialStep(8);
            } else if (store.tutorialStep === 11) {
                store.setTutorialStep(14);
            }
        }

        await refillHandSequentially();
        
        // v2.5.0: Final settling wait to ensure all UI animations (floating text, cards) are finished 
        // before releasing the isProcessing lock and switching to IDLE.
        await wait(500); 

        const finalStore = useGameStore.getState();
        finalStore.applyStageRules(finalStore.chapterNum, stageNum, nextTurn);
        finalStore.setGamePhase('IDLE');
    };

    const checkPlayerSurvival = async (): Promise<boolean> => {
        const store = useGameStore.getState();
        const p = store.player;
        const revivalCond = p.conditions.get('Revival');
        const revivalLimit = (revivalCond?.data as any)?.limit || 1;
        if (revivalCond && revivalLimit > 0) {
            const heal = Math.floor(p.maxHp * 0.5);
            setPlayerHp(heal);
            setMessage(t.CONDITIONS.REVIVAL.NAME + "!");
            playConditionSound('Revival');
            const newConds = new Map(p.conditions);
            const updated = { ...revivalCond, data: { ...((revivalCond.data as any) || {}), limit: revivalLimit - 1 } };
            if (updated.data.limit <= 0) newConds.delete('Revival');
            else newConds.set('Revival', updated);
            store.setPlayer({ ...p, conditions: newConds });
            await wait(1000);
            return true;
        }
        return false;
    };

    useEffect(() => {
        if (isTutorial && tutorialStep === 9 && gamePhase === 'IDLE') {
            executeBotTurn();
        }
    }, [isTutorial, tutorialStep, gamePhase, executeBotTurn]);



    const resolveStatusEffects = async () => {
        const store = useGameStore.getState();
        const playerConditions = new Map(store.player.conditions);
        const botConditions = new Map(store.bot.conditions);
        const toRemovePlayer: string[] = [];
        const toRemoveBot: string[] = [];

        // Debuffs that can be randomly removed (15% chance per turn)
        const removableDebuffs = ['Bleeding', 'Heavy Bleeding', 'Poisoning', 'Paralyzing', 'Debilitating', 'Burn', 'Decay'];

        // Player Phase
        for (const [condName, condData] of Array.from(playerConditions.entries())) {
            const cond = condName as string;
            const data = condData as any;
            const currentP = useGameStore.getState().player;

            // 15% chance to remove debuff early (Neurotoxicity explicitely bypasses this)
            if (removableDebuffs.includes(cond) && Math.random() < 0.15 && cond !== 'Neurotoxicity') {
                toRemovePlayer.push(cond);
                const condKey = cond.toUpperCase().replace(/\s+/g, '_');
                const condNameLine = (t.CONDITIONS as any)[condKey]?.NAME || cond;
                setMessage(t.COMBAT.PLAYER_CLEARED.replace('{cond}', condNameLine.toUpperCase()));
                continue;
            }

            if (cond === 'Dehydration') continue; // Handle Dehydration last

            // Neurotoxicity Damage (15) and secondary Paralyze check (20%)
            if (cond === 'Neurotoxicity') {
                setMessage("NEUROTOXICITY DMG!");
                playConditionSound('Neurotoxicity');
                const amount = 15;
                const freshHP = useGameStore.getState().player.hp;
                setPlayerHp(Math.max(0, freshHP - amount));
                showDamageText('PLAYER', `-${amount}`, '#e74c3c');

                // 3B-2: Acclimatization (Regen on status damage)
                if (store.equippedAltarSkills.includes('3B-2')) {
                    if (!playerConditions.has('Regenerating')) {
                        let healAmt = 5;
                        if (store.equippedAltarSkills.includes('3A-1')) healAmt = Math.floor(healAmt * 1.2);
                        store.addPlayerCondition('Regenerating', 3, '', { amount: healAmt });
                        setMessage("ACCLIMATIZATION!");
                        showConditionGuideIfNew('Regenerating');
                    }
                }

                await wait(800);

                if (Math.random() < 0.20 && !playerConditions.has('Paralyzing')) {
                    const { applyCondition: applyC } = await import('./conditions');
                    applyC(playerConditions, 'Paralyzing', 1);
                }
            }

            if (['Poisoning', 'Bleeding', 'Heavy Bleeding'].includes(cond)) {
                const toastMsg = cond === 'Poisoning' ? t.COMBAT.PLAYER_POISONING : (cond === 'Heavy Bleeding' ? t.COMBAT.PLAYER_HEAVY_BLEEDING : t.COMBAT.PLAYER_BLEEDING);
                setMessage(toastMsg);
                playConditionSound(cond);
                const amount = data.data?.amount || (cond === 'Heavy Bleeding' ? 20 : 10);
                const freshHP = useGameStore.getState().player.hp;
                setPlayerHp(Math.max(0, freshHP - amount));
                showDamageText('PLAYER', `-${amount}`, '#e74c3c');

                // 2B-2: Acclimatization (Regen on status damage)
                if (store.equippedAltarSkills.includes('2B-2')) {
                    if (!playerConditions.has('Regenerating')) {
                        let healAmt = 5;
                        if (store.equippedAltarSkills.includes('2A-1')) healAmt = Math.floor(healAmt * 1.2);
                        store.addPlayerCondition('Regenerating', 3, '', { amount: healAmt });
                        setMessage("ACCLIMATIZATION!");
                        showConditionGuideIfNew('Regenerating');
                    }
                }

                await wait(800);
            } else if (cond === 'Burn') {
                setMessage(t.COMBAT.PLAYER_BURN || "PLAYER BURNED!");
                playConditionSound('Burn');
                const amount = Math.floor(currentP.maxHp * 0.03);
                const freshHP = useGameStore.getState().player.hp;
                setPlayerHp(Math.max(0, freshHP - amount));
                showDamageText('PLAYER', `-${amount}`, '#e67e22');
                await wait(800);
            } else if (cond === 'Decay') {
                setMessage(t.COMBAT.PLAYER_DECAY || "PLAYER DECAYED!");
                playConditionSound('Decay');
                const rates = [0.03, 0.05, 0.08, 0.10];
                const rate = rates[data.elapsed] || 0.10;
                const amount = Math.floor(currentP.maxHp * rate);
                const freshHP = useGameStore.getState().player.hp;
                setPlayerHp(Math.max(0, freshHP - amount));
                showDamageText('PLAYER', `-${amount}`, '#8e44ad');
                await wait(800);
            } else if (cond === 'Regenerating') {
                setMessage(t.COMBAT.PLAYER_REGEN);
                playConditionSound('Regenerating');

                let heal = data.data?.amount || 10;
                // 3A-1: Biorhythm Acceleration (+20% Regen)
                if (store.equippedAltarSkills.includes('3A-1')) {
                    heal = Math.floor(heal * 1.2);
                }

                setPlayerHp(Math.min(currentP.maxHp, currentP.hp + heal));
                showDamageText('PLAYER', `+${heal}`, '#2ecc71');
                await wait(800);
            }

            // Increment elapsed
            data.elapsed += 1;
            if (data.duration < 999 && data.elapsed >= data.duration) {
                toRemovePlayer.push(cond);
            }
        }

        // v2.3.1: Handle Dehydration LAST in player phase
        if (playerConditions.has('Dehydration')) {
            const condData = playerConditions.get('Dehydration') as any;
            const dmg = condData.data?.amount || 2;
            if (useGameStore.getState().bot.hp > 0) {
                const freshP = useGameStore.getState().player;
                setPlayerHp(Math.max(0, freshP.hp - dmg));
                showDamageText('PLAYER', `-${dmg}`, '#e74c3c');
                setMessage(t.CONDITIONS.DEHYDRATION.NAME + "!");
                playConditionSound('Dehydration');

                // 2B-2: Acclimatization (Regen on status damage)
                if (store.equippedAltarSkills.includes('2B-2')) {
                    if (!playerConditions.has('Regenerating')) {
                        let healAmt = 5;
                        if (store.equippedAltarSkills.includes('2A-1')) healAmt = Math.floor(healAmt * 1.2);
                        store.addPlayerCondition('Regenerating', 3, '', { amount: healAmt });
                        setMessage("ACCLIMATIZATION!");
                        showConditionGuideIfNew('Regenerating');
                    }
                }

                await wait(1000);
            }
            condData.elapsed += 1;
            if (condData.duration < 999 && condData.elapsed >= condData.duration) {
                toRemovePlayer.push('Dehydration');
            }
        }
        // Remove expired player conditions
        toRemovePlayer.forEach(name => playerConditions.delete(name));
        const freshPAfter = useGameStore.getState().player;
        useGameStore.getState().setPlayer({ ...freshPAfter, conditions: playerConditions });

        // 0.5s pause between phases
        await wait(500);

        // Boss Phase
        for (const [condName, condData] of Array.from(botConditions.entries())) {
            const cond = condName as string;
            const data = condData as any;
            if (['Poisoning', 'Bleeding', 'Heavy Bleeding'].includes(cond)) {
                const toastMsg = cond === 'Poisoning' ? t.COMBAT.BOSS_POISONING : (cond === 'Heavy Bleeding' ? t.COMBAT.BOSS_HEAVY_BLEEDING : t.COMBAT.BOSS_BLEEDING);
                setMessage(toastMsg);
                playConditionSound(cond);
                const dmg = 10;
                setBotHp(Math.max(0, useGameStore.getState().bot.hp - dmg)); // Stale bot.hp -> 최신 상태 조회
                showDamageText('BOT', `-${dmg}`, '#c0392b');
                await wait(800);
            } else if (cond === 'Regenerating') {
                setMessage(t.COMBAT.BOSS_REGENERATING);
                playConditionSound('Regenerating');
                const latestBot = useGameStore.getState().bot;

                // v2.3.2: Support flat amount regeneration for Chapter 2A
                const regenData = data.data as any;
                let heal = 0;
                if (regenData?.amount) {
                    heal = regenData.amount;
                } else {
                    const regenPercent = regenData?.percent || 0.05;
                    heal = Math.floor(latestBot.maxHp * regenPercent);
                }

                setBotHp(Math.min(latestBot.maxHp, latestBot.hp + heal));
                showDamageText('BOT', `+${heal}`, '#2ecc71');

                // 4B-3: Symbiotic Relationship (Player also heals when boss regens)
                if (store.equippedAltarSkills.includes('4B-3') && heal > 0) {
                    const freshPSymbiotic = useGameStore.getState().player;
                    let playerHeal = heal;
                    if (store.equippedAltarSkills.includes('3A-1')) playerHeal = Math.floor(playerHeal * 1.2);
                    setPlayerHp(Math.min(freshPSymbiotic.maxHp, freshPSymbiotic.hp + playerHeal));
                    showDamageText('PLAYER', `+${playerHeal}`, '#2ecc71');
                    AudioManager.playSFX('/assets/audio/conditions/Regenerating.mp3');
                }

                await wait(800);
            }

            // Increment elapsed
            data.elapsed += 1;

            // Check for expiry
            if (data.duration < 999 && data.elapsed >= data.duration) {
                toRemoveBot.push(cond);
            }
        }

        // Infinite Boss Regen Renewal
        if (botConditions.has('Regenerating')) {
            const regenItem = botConditions.get('Regenerating') as any;
            const isBotAwakenedAfterResolution = botConditions.has('Awakening');

            if (regenItem.duration - regenItem.elapsed <= 1 && !isBotAwakenedAfterResolution) {
                if (store.chapterNum === '1' && [6, 8, 10].includes(stageNum)) {
                    store.addBotCondition('Regenerating', 3, 'At the end of each turn, restores a certain amount of HP.');
                }
            }
        }

        // 3A-7: BRITTLE 스택 매 턴 증가 (보스 페이즈 종료 시점)
        if (botConditions.has('Brittle')) {
            const brittCond = botConditions.get('Brittle') as any;
            const currentDR = botConditions.get('Damage Reducing') as any;
            
            const currentStack = brittCond.data?.stackCount || 0;
            const nextStack = currentStack + 1;
            
            // Damage Reducing 퍼센트 10 상승
            if (currentDR) {
                const currentPercent = currentDR.data?.percent || 10;
                botConditions.set('Damage Reducing', {
                    ...currentDR,
                    duration: 999,
                    data: { ...currentDR.data, percent: currentPercent + 10 }
                });
            }
            
            botConditions.set('Brittle', {
                ...brittCond,
                data: { ...brittCond.data, stackCount: nextStack }
            });
        }

        // Remove expired bot conditions
        toRemoveBot.forEach(name => botConditions.delete(name));
        const freshBot = useGameStore.getState().bot;
        useGameStore.getState().setBot({ ...freshBot, conditions: botConditions });

        // MUDDED/PETRIFIED Duration Decrement (End of turn)
        const handAfterTurn = [...useGameStore.getState().playerHand];
        let handChanged = false;
        handAfterTurn.forEach((card, idx) => {
            if (!card) return;

            // Handle Mudded
            if (card.isMudded) {
                const nextMudDuration = card.mudDuration - 1;
                if (nextMudDuration <= 0) {
                    handAfterTurn[idx] = { ...card, isMudded: false, mudDuration: 0 };
                } else {
                    handAfterTurn[idx] = { ...card, mudDuration: nextMudDuration };
                }
                handChanged = true;
            }

            // Handle Petrified
            if (card.isPetrified) {
                const nextPetrifyDuration = card.petrifyDuration - 1;
                if (nextPetrifyDuration <= 0) {
                    handAfterTurn[idx] = { ...card, isPetrified: false, petrifyDuration: 0 };
                } else {
                    handAfterTurn[idx] = { ...card, petrifyDuration: nextPetrifyDuration };
                }
                handChanged = true;
            }
        });
        if (handChanged) {
            useGameStore.getState().setPlayerHand(handAfterTurn);
        }
    };


    const executeCardSwap = async (selectedIndices: number[]) => {
        // Critical Fix: Prevent UI spamming during animations
        if (useGameStore.getState().gamePhase !== 'IDLE') return;
        useGameStore.getState().setGamePhase('SWAPPING');

        if (selectedIndices.length === 0) {
            setMessage(t.COMBAT.SELECT_CARDS);
            triggerScreenEffect('shake-small');
            useGameStore.getState().setGamePhase('IDLE');
            return;
        }
        if (selectedIndices.length > 2) {
            setMessage(t.COMBAT.MAX_SWAP);
            triggerScreenEffect('shake-small');
            useGameStore.getState().setGamePhase('IDLE');
            return;
        }

        const store = useGameStore.getState();

        // PETRIFIED Check (Prevent Swap)
        const selectedCardsForSwapCheck = selectedIndices.map(idx => store.playerHand[idx]).filter(Boolean) as Card[];
        if (selectedCardsForSwapCheck.some(c => c.isPetrified)) {
            setMessage("석화된 카드는 교체할 수 없습니다!");
            triggerScreenEffect('shake-small');
            store.setGamePhase('IDLE');
            return;
        }
        const p = store.player;

        // 5B-3: Fragments Recovery (+2 extra swaps when HP <= 25%, once per stage)
        let bonusDraws = 0;
        if (store.equippedAltarSkills.includes('5B-3') && p.hp <= p.maxHp * 0.25 && !store.stageSkillsTriggered.includes('5B-3')) {
            bonusDraws = 2;
            store.setStageSkillTriggered('5B-3');
            setMessage(store.language === 'KR' ? '파편회수!' : 'FRAGMENTS RECOVERY!');
            AudioManager.playSFX('/assets/audio/player/shuffling.mp3');
        }

        const totalDraws = (p.drawsRemaining ?? 0) + bonusDraws;

        if (totalDraws > 0) {
            swapCards(selectedIndices);
            const newDraws = Math.max(0, (p.drawsRemaining ?? 0) - 1);
            useGameStore.getState().setDrawsRemaining(newDraws);
            setMessage(t.COMBAT.CARDS_SWAPPED);

            // 3B-3: DEATHROLL(데스롤) - 플레이어 SWAP 시 즉시 보스 1회 공격
            if (store.chapterNum === '3B' && stageNum === 3) {
                setMessage("데스롤: SWAP에 반응하여 보스가 즉시 공격합니다!");
                triggerScreenEffect('shake');
                await wait(1000);
                // SWAP 단계 종료 후 보스 턴 실행
                await executeBotTurn();
                return; 
            }

            // 4A-3: Probability Distortion (25% chance for +1 extra swap)
            if (store.equippedAltarSkills.includes('4A-3') && Math.random() < 0.25) {
                useGameStore.getState().setDrawsRemaining(newDraws + 1);
                setMessage(store.language === 'KR' ? '확률왜곡 +1' : 'Probability Distortion +1');
            }
        } else {
            setMessage(t.COMBAT.NO_SWAPS);
            triggerScreenEffect('shake-small');
        }
        useGameStore.getState().setGamePhase('IDLE');
    };

    const handleVictory = async () => {
        const store = useGameStore.getState();
        const wasBattle = store.gameState === GameState.BATTLE || store.gameState === GameState.TUTORIAL;
        store.setGamePhase('BOSS_DEFEATED');

        // 3B-6: Reset Joker probability
        if (store.chapterNum === '3B' && store.stageNum === 6) {
            const d = store.deck;
            d.jokerProbability = JOKER_DRAW_PROBABILITY;
            store.setDeck(d);
        }
        const config = DIFFICULTY_CONFIGS[store.difficulty];

        // 0. Boss Death FX - Only play if boss is still visible
        if (store.bot.isBossVisible) {
            const monsterEl = document.querySelector('.boss-avatar-wrapper img') as HTMLElement;
            if (monsterEl) {
                await playCoreDeathFX(monsterEl);
                store.syncBot({ ...store.bot, isBossVisible: false });
            }
        }

        if (wasBattle) {
            // 1. 상태 정리 (Heal + Clear Conditions)
            store.clearPlayerConditions();
            if (store.chapterNum === '3A' && store.stageNum === 10) {
                store.resetHydraFlushSuits(); // 히드라용 전승 카운터 리셋
            }

            const currentHp = store.player.hp;
            let maxHp = store.player.maxHp;

            // v2.0.0.14/16: Stage 6 Reward (Chapter 1 Only: difficulty-based MAX HP bonus + FULL HEAL)
            if (store.chapterNum === '1' && stageNum === 6) {
                const bonus = Math.floor(maxHp * config.stage6MaxHpBonus);
                maxHp += bonus;
                store.setHasStage6Bonus(true);
                store.setPlayerMaxHp(maxHp);
                setPlayerHp(maxHp); // FULL HEAL per user request
            } else {
                // Standard Heal for other stages (difficulty-based)
                let healAmount = config.clearHpBonus;
                // v2.3.0: Halved recovery for Chapter 2
                if (store.chapterNum === '2A' || store.chapterNum === '2B') {
                    healAmount = Math.floor(healAmount / 2);
                }
                const newHp = Math.min(maxHp, currentHp + healAmount);
                setPlayerHp(newHp);
            }

            // Hidden Scenario: Perfect Clear Tracking
            const currentHpPercent = currentHp / maxHp;
            const isPerfect = currentHpPercent >= 0.5;

            if (store.chapterNum === '1') {
                if (stageNum >= 1 && stageNum <= 9) {
                    if (isPerfect) {
                        const nextCount = store.ch1PerfectCount + 1;
                        store.setHiddenState({ ch1PerfectCount: nextCount });
                        if (nextCount >= 9) {
                            store.setHiddenState({ specialQualify: true });
                        }
                    }
                }
            } else if ((store.chapterNum === '2A' || store.chapterNum === '2B') && store.specialQualify) {
                if (stageNum >= 1 && stageNum <= 5) {
                    if (isPerfect) {
                        const nextCount = store.ch2PerfectCount + 1;
                        store.setHiddenState({ ch2PerfectCount: nextCount });
                        if (nextCount >= 5) {
                            store.setHiddenState({ ch2SpecialQualify: true });
                        }
                    }
                }
            }

            // v2.3.7: Chapter Transition Reward (120 HP heal when moving from Ch1 to Ch2)
            if (store.chapterNum === '1' && stageNum === 10) {
                const freshPlayer = useGameStore.getState().player;
                const transitionHeal = 120;
                setPlayerHp(Math.min(freshPlayer.maxHp, freshPlayer.hp + transitionHeal));
                showDamageText('PLAYER', `+${transitionHeal}`, '#2ecc71');
                setMessage(t.COMBAT.VICTORY + " (+120 HP)");
            }

            // 2. Trophy Check — stage trophy in memory (NOT saved to localStorage yet)
            const trophyIdMap: Record<string, Record<number, string>> = {
                '1': { 4: 'TR_1_4', 5: 'TR_1_5', 10: 'TR_1_10' },
                '2A': { 5: 'TR_2A_5', 10: 'TR_2A_10', 11: 'TR_2A_SP' },
                '2B': { 5: 'TR_2B_5', 10: 'TR_2B_10', 11: 'TR_2B_SP' },
                '3A': { 7: 'TR_3A_07', 10: 'TR_3A_10' },
                '3B': { 6: 'TR_3B_06', 10: 'TR_3B_10' }
            };
            const potentialTrophyId = trophyIdMap[store.chapterNum]?.[stageNum];

            if (potentialTrophyId && store.difficulty !== Difficulty.EASY) {
                const { AltarManager } = await import('../utils/AltarManager');
                // Only stage if not already permanently owned and not already pending
                if (!AltarManager.hasTrophy(potentialTrophyId, store.difficulty)) {
                    const staged = AltarManager.stageTrophy(potentialTrophyId, store.difficulty);
                    AltarManager.commitPendingTrophies(); // v2.4.9: Commit immediately for better persistence
                    if (staged) {
                        // ─── Guide Popup: Loot & Altar System (first trophy only) ──
                        if (!hasSeenGuide(SYSTEM_GUIDES.LOOT_SYSTEM.key)) {
                            await showGuidePopup(SYSTEM_GUIDES.LOOT_SYSTEM);
                            await showGuidePopup(SYSTEM_GUIDES.ALTAR_SYSTEM);
                        }
                        const { TROPHIES } = await import('../constants/altarSystem');
                        store.setTrophyPopup(TROPHIES[potentialTrophyId]);
                        // Hold here while the popup is visible
                        while (useGameStore.getState().trophyPopup !== null) {
                            await wait(200);
                        }
                        await wait(500);
                    }
                }
            }
            
            setGameState(GameState.VICTORY);
        }

        // 3. Victory State & Sound
        const bonusPercent = Math.floor(config.stage6MaxHpBonus * 100);

        let victoryMsg = t.COMBAT.VICTORY;
        if (store.chapterNum === '1' && stageNum === 6) {
            victoryMsg = t.COMBAT.STAGE6_BONUS.replace('{percent}', bonusPercent.toString());
        } else if (stageNum === 10) {
            const isKR = store.language === 'KR';
            const areaNames: Record<string, string> = {
                '1': isKR ? '들판' : 'Field',
                '2A': isKR ? '사막' : 'Desert',
                '2B': isKR ? '깊은 숲' : 'Deep Forest'
            };
            const areaName = areaNames[store.chapterNum] || '';
            victoryMsg = t.COMBAT.AREA_CLEARED.replace('{area}', areaName);
        }

        setMessage(victoryMsg);
        store.setIsVictoryFanfareActive(true);
        AudioManager.playSFX('/assets/audio/stages/victory/victory.mp3');

        // 4. Wait for victory.mp3 (approx 5s)
        await new Promise(r => setTimeout(r, 5000));

        // v2.5.0: Clear fanfare state and temporary message after audio finishes
        store.setIsVictoryFanfareActive(false);
        setMessage("");

        // 5. Transition to next stage or unlock difficulty on final stage clear
        const nextStage = stageNum + 1;

        // Hidden Scenario Stage Redirection
        let targetStage = nextStage;
        if (stageNum === 9 && store.specialQualify && store.ch2SpecialQualify) {
            targetStage = 11; // Special Stage
        }

        // v2.3.8: Fix chapter transition for Chapter 1 (Standard nextStage is 11, which failed the !== 11 check)
        // v2.4.0: Simplified check to just stageNum >= 10. If player clears stage 10 or 11, the game ends.
        // v2.4.2: Revised Victory & Difficulty Unlock Logic with Popup
        if (stageNum >= 10) {
            if (store.chapterNum === '1') {
                if (store.difficulty === Difficulty.EASY) {
                    // EASY: Chapter 1 only → unlock NORMAL, show congratulations popup
                    store.unlockDifficulty(Difficulty.NORMAL);
                    store.setClearPopupDifficulty(Difficulty.EASY);
                } else {
                    // NORMAL+: Go to Chapter Select (Desert/Deep Forest)
                    setGameState(GameState.CHAPTER_SELECT);
                }
            } else if (store.chapterNum === '2A') {
                // Chapter 2A Clear: Go to Chapter 3A Cave
                store.setNextChapterId('3A');
                setGameState(GameState.CHAPTER_NEXT);
            } else if (store.chapterNum === '2B') {
                // Chapter 2B Clear: Go to Chapter 3B Swamp
                store.setNextChapterId('3B');
                setGameState(GameState.CHAPTER_NEXT);
            } else if (store.chapterNum === '3A' || store.chapterNum === '3B') {
                // Final Chapter 3 Clear: Unlock next Difficulty & Show Congratulations Popup
                // (EASY never reaches Chapter 3 — it ends at Chapter 1)
                if (store.difficulty === Difficulty.NORMAL) {
                    store.unlockDifficulty(Difficulty.HARD);
                    store.setClearPopupDifficulty(Difficulty.NORMAL);
                } else if (store.difficulty === Difficulty.HARD) {
                    store.unlockDifficulty(Difficulty.HELL);
                    store.setClearPopupDifficulty(Difficulty.HARD);
                } else {
                    // HELL Clear or fallback
                    store.setClearPopupDifficulty(Difficulty.HELL);
                }
            }
        } else {
            triggerTransition(() => {
                setMessage(""); // CLEAR MESSAGE FIRST to avoid overlap!
                initGame(store.chapterNum, targetStage);
                setGameState(GameState.BATTLE);
                startInitialDraw();
            });
        }
    };

    const startInitialDraw = async () => {
        const store = useGameStore.getState();
        // v2.3.4: If game was loaded, skip initial draw to keep saved hand
        if (store.isGameLoaded) {
            store.setIsGameLoaded(false);
            console.log("Skipping initial draw for loaded game.");

            // Fail-safe: If boss is already dead, re-trigger victory handling
            if (store.bot.hp <= 0 && store.gameState === GameState.BATTLE) {
                console.log("Boss already defeated, resuming victory sequence.");
                handleVictory();
            }
            return;
        }

        // v2.0.0.21: Skip for tutorial if hand is already pre-set to avoid overwriting guaranteed cards
        if (isTutorial && playerHand.some(c => c !== null)) return;

        // v2.0.0.10: Pre-fill with null to maintain slot positions, then refill.
        setPlayerHand(new Array(8).fill(null));
        await refillHandSequentially(1500);

        // ─── Guide Popup: Chapter Intro (Stage 1 only) ───────────────────
        const freshStore = useGameStore.getState();
        if (freshStore.stageNum === 1 && !freshStore.isTutorial) {
            const introData = CHAPTER_INTROS[freshStore.chapterNum];
            if (introData && !hasSeenGuide(introData.key)) {
                await showGuidePopup(introData);
            }
        }

        // ─── Guide Popup: Gimmick Guide ──────────────────────────────────
        if (!freshStore.isTutorial) {
            const stageConfig = CHAPTERS[freshStore.chapterNum]?.stages[freshStore.stageNum];
            if (stageConfig?.rule) {
                const gimmickGuide = getGimmickGuide(stageConfig.rule);
                if (gimmickGuide && !hasSeenGuide(gimmickGuide.key)) {
                    await showGuidePopup(gimmickGuide);
                }
            }
        }

        // v2.3.5: Regenerate Sphinx target after hand is full
        if (store.chapterNum === '2A' && store.stageNum === 10) {
            store.applyStageRules(store.chapterNum, store.stageNum, store.currentTurn);
        }
        // 8: System Overload (5% chance to convert all to Jokers at turn end, once per stage)
        if (store.equippedAltarSkills.includes('8') && !store.stageSkillsTriggered.includes('8')) {
            if (Math.random() < 0.05) {
                const fullHandIndices = store.playerHand.map((c, idx) => c !== null ? idx : -1).filter(idx => idx !== -1);
                if (fullHandIndices.length > 0) {
                    const jokerHand = [...store.playerHand];
                    fullHandIndices.forEach(idx => {
                        jokerHand[idx] = CardFactory.create(null, null, true);
                    });
                    useGameStore.setState({ playerHand: jokerHand });
                    store.setStageSkillTriggered('8');
                    setMessage("연산 오류 감지! 카드 패턴이 붕괴되었습니다!");
                    triggerScreenEffect('flash-red');
                    AudioManager.playSFX('/assets/audio/common/UI_ALTAR_UPGRADE.mp3');
                    await wait(1500);
                }
            }
        }

        store.setGamePhase('IDLE');
    };

    const handleDefeat = async () => {
        const store = useGameStore.getState();
        // 3B-6: Reset Joker probability
        if (store.chapterNum === '3B' && store.stageNum === 6) {
            const d = store.deck;
            d.jokerProbability = JOKER_DRAW_PROBABILITY;
            store.setDeck(d);
        }

        // 1. 상태 정리
        setGameState(GameState.GAMEOVER);
        setMessage(t.COMBAT.DEFEAT);
        AudioManager.playSFX('/assets/audio/stages/defeat/defeat.mp3');
        store.clearPlayerConditions();

        // 2. Wait for 5s (Allow user to see defeat message)
        await new Promise(r => setTimeout(r, 5000));

        // 3. Stage 6 Special: Restore HP and proceed to 7 (Chapter 1 Only)
        if (store.chapterNum === '1' && stageNum === 6) {
            const restoredHp = store.stage6EntryHp || 200;
            triggerTransition(() => {
                initGame(store.chapterNum, 7);
                setGameState(GameState.BATTLE);
                setPlayerHp(restoredHp);
                setMessage(t.COMBAT.PROCEED_STAGE7);
                startInitialDraw();
            });
        } else {
            // Standard Defeat
        }
    };

    // ─── Guide Popup Helper ──────────────────────────────────────────
    const showGuidePopup = async (data: GuidePopupData) => {
        const store = useGameStore.getState();
        store.setGuidePopup(data);
        // Wait for user to dismiss, with safety timeout (max ~30s)
        let waitCount = 0;
        const maxWait = 150; // 150 * 200ms = 30 seconds
        while (useGameStore.getState().guidePopup !== null && waitCount < maxWait) {
            await wait(200);
            waitCount++;
        }
        // Force-close if timed out
        if (useGameStore.getState().guidePopup !== null) {
            useGameStore.getState().setGuidePopup(null);
        }
        await wait(300);
    };

    // ─── Guide Popup: Condition Guide (on first status effect) ───────
    const showConditionGuideIfNew = async (conditionName: string) => {
        const guide = CONDITION_GUIDES[conditionName];
        if (guide && !hasSeenGuide(guide.key)) {
            await showGuidePopup(guide);
        }
    };

    return {
        message,
        damageTexts,
        screenEffect,
        onDamageTextComplete,
        runCombatSequence,
        executeBotTurn,
        executeCardSwap,
        startInitialDraw
    };
};
