import { useState, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { AudioManager } from '../utils/AudioManager';
import { calculatePlayerDamage, calculateBotDamage, applyDamage } from './damageCalculation';
import { Card, CardFactory } from '../types/Card';
import { GameState, Difficulty, DIFFICULTY_CONFIGS } from '../constants/gameConfig';
import { RANK_VALUES } from '../constants/cards';
import { TRANSLATIONS } from '../constants/translations';

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

    // v2.0.0.12: Auto-clear generic messages after 2.5s
    useEffect(() => {
        const exempt = [t.COMBAT.VICTORY, t.COMBAT.DEFEAT, t.COMBAT.PARALYZED];
        if (message && !exempt.includes(message)) {
            const timer = setTimeout(() => setMessage(""), 2500);
            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    // Helper to add damage text
    const showDamageText = (target: 'PLAYER' | 'BOT' | 'BOSS_LEFT', text: string, color: string) => {
        const id = Date.now() + Math.random();
        let x = window.innerWidth * 0.5;
        let y = 300;
        if (target === 'BOT') { x = window.innerWidth * 0.75; y = 120; }
        else if (target === 'PLAYER') { x = window.innerWidth * 0.25; y = 550; }
        else if (target === 'BOSS_LEFT') { x = window.innerWidth * 0.25; y = 200; }

        setDamageTexts(prev => [...prev, { id, x, y, text, color }]);
    };

    const onDamageTextComplete = (id: number) => {
        setDamageTexts(prev => prev.filter(dt => dt.id !== id));
    };

    const triggerScreenEffect = (effect: string) => {
        setScreenEffect(effect);
        setTimeout(() => setScreenEffect(''), 500);
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
                9: '09_sand deathwarm.mp3',
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
                } else {
                    // Randomly apply Poisoning or Debilitating
                    const effect = Math.random() < 0.5 ? 'Poisoning' : 'Debilitating';
                    store.addPlayerCondition(effect, 4);
                    playConditionSound(effect);
                    const condKey = effect.toUpperCase();
                    const condName = (t.CONDITIONS as any)[condKey]?.NAME || effect;
                    setMessage(condName + "!");
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
            await new Promise(r => setTimeout(r, 1200));
            await executeBotTurn();
            return;
        }

        const currentPlayerHand = store.playerHand;

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
            await new Promise(r => setTimeout(r, 1000));
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
            store.bannedSuit
        );

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
            if (finalDamage > 0 && finalDamage <= threshold) {
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
                // v2.3.6: Sphinx Balancing - Give Immune on CORRECT answer if not already immune
                if (!player.conditions.has('Immune')) {
                    store.addPlayerCondition('Immune', 3);
                }
            }
        }

        // v2.3.2: Neurotoxicity Accuracy Penalty (30% Miss check)
        // This was moved to the top as a pre-check. The old `isMissed` variable is no longer needed here.

        let damage = 0;
        let recoilTaken = 0;
        let lifesteal = 0;

        if (isAdrenalineNull) {
            damage = 0;
            setMessage(t.CONDITIONS.ADRENALINE_SECRETION.NAME + "!");
            playConditionSound('Adrenaline secretion');
            setBotAnimState('HIT'); // Still show hit animation even if damage is 0
        } else if (isPuzzleCorrect) {
            // v2.3.4: Sphinx Riddle Fixed Damage (Target * 2 + Poker Bonus)
            const handBonuses: Record<string, number> = {
                'One Pair': 10, 'Two Pair': 20, 'Three of a Kind': 50,
                'Straight': 75, 'Flush': 100, 'Full House': 125, 'Four of a Kind': 150,
                'Straight Flush': 175, 'Royal Flush': 300
            };
            const pokerBonus = handBonuses[handType] || 0;
            damage = (store.puzzleTarget * 2) + pokerBonus;

            setMessage(t.COMBAT.PUZZLE_SUCCESS.replace('{bonus}', pokerBonus.toString()));
            showDamageText('BOSS_LEFT', 'CORRECT DAMAGE!', '#2ecc71');
            AudioManager.playSFX('/assets/audio/player/shuffling.mp3');
            // Puzzle damage is fixed, skips reductions/debilitating/critical
        } else {
            // Normal Damage Calculation
            damage = Math.floor(finalDamage); // Use finalDamage after modifiers

            // v2.3.2: 2A Hand Nullification Rules (족보 보너스만 0, 카드 숫자 합산은 유지)
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
                    damage = Math.max(0, Math.floor((baseDamage - bonus) * (finalDamage / rawDamage))); // Re-calculate based on baseDamage and original multiplier
                }
            }

            // v2.3.2: 2A-4 No damage under 30
            if (store.chapterNum === '2A' && stageNum === 4 && damage < 30) {
                damage = 0;
                setMessage(t.COMBAT.NO_DMG_UNDER_30_MSG);
            }

            // Altar Skill 1B: +25 Fixed Damage
            if (store.equippedAltarSkills.includes('1B')) {
                damage += 25;
            }

            // Damage Reduction (already applied via finalDamage)
            // const reductionCond = bot.conditions.get('Damage Reducing');
            // if (reductionCond) {
            //     const percent = (reductionCond.data as any)?.percent || 0;
            //     damage = Math.floor(damage * (1 - percent / 100));
            // }

            // v2.3.0: Damage Recoiling (Player attacking)
            const recoilingCond = player.conditions.get('Damage recoiling');
            if (recoilingCond && Math.random() < 0.3) {
                damage += 20;
                recoilTaken = 10;
                setMessage(t.CONDITIONS.DAMAGE_RECOILING.NAME + "!");
            }

            // v2.3.0: Berserker (Player attacking)
            const berserkerCond = player.conditions.get('Berserker');
            if (berserkerCond && player.hp <= player.maxHp * 0.3) {
                damage += (berserkerCond.data as any)?.atkBonus || 20;
                lifesteal = Math.max(1, Math.floor(damage * 0.1));
            }

            const isCrit = isPuzzleCorrect ? false : isCritical;
            const hasWild = selectedCards.some(c => c.isJoker);

            // --- PHASE 1: GATHERING ---
            // Dynamic duration based on number of cards (0.2s per card + 0.5s base animation)
            store.setGamePhase('GATHERING');
            AudioManager.playSFX('/assets/audio/combat/gathering.mp3');

            // Shuffling SFX (Gathering start + 0.2s) - as Gathering sound effect
            setTimeout(() => AudioManager.playSFX('/assets/audio/player/shuffling.mp3'), 200);

            // Wait for all cards to gather: 0.2s delay per card + 0.5s for animation
            const gatheringDuration = (selectedCards.length * 200) + 500;
            await new Promise(r => setTimeout(r, gatheringDuration));

            // --- PHASE 2: CHARGING (0.8s) ---
            store.setGamePhase('CHARGING');
            await new Promise(r => setTimeout(r, 800));

            // --- PHASE 3: THRUSTING ---
            store.setGamePhase('THRUSTING');
            await new Promise(r => setTimeout(r, 67));

            // Whipping SFX (Thrust End + 0.13s)
            await new Promise(r => setTimeout(r, 133));
            AudioManager.playSFX('/assets/audio/player/whipping.mp3');

            // Boss Shake (Impact + 0.2s)
            await new Promise(r => setTimeout(r, 100));
            triggerScreenEffect('shake');
            setBotAnimState('HIT');

            // Damage Popup
            showDamageText('BOT', `-${damage}`, isCrit ? '#c0392b' : '#ecf0f1');
            const wildSuffix = hasWild ? t.UI.WILD : '';
            if (!isPuzzleCorrect && !isAdrenalineNull) {
                setMessage(isCrit ? `${t.COMBAT.CRITICAL_HIT} ${handType}${wildSuffix}` : `${handType}${wildSuffix}`);
            }

            // v2.3.9: Boss HP reduction
            await new Promise(r => setTimeout(r, 150));
            let newBotHp = Math.max(0, bot.hp - damage);
            setBotHp(newBotHp);

            // v2.3.9: Boss Reflection check (Moved after boss HP reduction)
            const reflectionCond = bot.conditions.get('Reflection');
            if (reflectionCond && !isAdrenalineNull && !isPuzzleCorrect && damage > 0) {
                const chance = (reflectionCond.data as any)?.chance || 0.3;
                const percent = (reflectionCond.data as any)?.percent || 10;
                if (Math.random() < chance) {
                    const rDmg = Math.floor(damage * (percent / 100));
                    if (rDmg > 0) {
                        await new Promise(r => setTimeout(r, 600)); // Delay for reflection effect
                        const freshP = useGameStore.getState().player;
                        setPlayerHp(Math.max(0, freshP.hp - rDmg));
                        showDamageText('PLAYER', `-${rDmg}`, '#e74c3c');
                        setMessage("REFLECTION!");
                        playConditionSound('Reflection');
                        triggerScreenEffect('shake');
                        await new Promise(r => setTimeout(r, 800)); // Wait for reflection feedback
                    }
                }
            }

            // v2.3.0: Berserker Lifesteal
            if (lifesteal > 0) {
                const freshP = useGameStore.getState().player;
                setPlayerHp(Math.min(freshP.maxHp, freshP.hp + lifesteal));
                showDamageText('PLAYER', `+${lifesteal}`, '#2ecc71');
            }

            // Altar Skill 2A-1 (Utilization): 50% chance to apply Bleed or Poison
            if (store.equippedAltarSkills.includes('2A-1') && damage > 0 && !isPuzzleCorrect) {
                if (Math.random() < 0.5) {
                    const freshBotCondition = useGameStore.getState().bot.conditions;
                    if (!freshBotCondition.has('Bleeding') && !freshBotCondition.has('Poisoning')) {
                        const effect = Math.random() < 0.5 ? 'Bleeding' : 'Poisoning';
                        store.addBotCondition(effect, 3);
                        const effectName = Math.random() < 0.5 ? "BLEEDING!" : "POISON!";
                        showDamageText('BOT', effectName, '#9b59b6');
                    }
                }
            }

            // v2.3.0: Recoil Damage
            if (recoilTaken > 0) {
                const freshP = useGameStore.getState().player;
                const hpAfterRecoil = Math.max(0, freshP.hp - recoilTaken);
                setPlayerHp(hpAfterRecoil);
                showDamageText('PLAYER', `-${recoilTaken}`, '#e74c3c');
                if (hpAfterRecoil <= 0) {
                    await checkPlayerSurvival();
                }
            }

            // v2.0.0.21: Tutorial safety - restore HP if below 300
            if (store.isTutorial && newBotHp < 300) {
                newBotHp = 1000;
                store.setMessage(t.COMBAT.TUTORIAL_RESTORED);
            }

            // v2.1.0: Stage 10 Boss Phase 2 - Awakening (Chapter 1 Only)
            const currentBotState = useGameStore.getState().bot;
            let awakeningTriggered = false;

            if (store.chapterNum === '1' && stageNum === 10 && newBotHp > 0 && newBotHp <= bot.maxHp * 0.5 && !currentBotState.conditions.has('Awakening')) {
                newBotHp = bot.maxHp; // FULL RESTORE
                awakeningTriggered = true;

                const atkBonus = {
                    [Difficulty.EASY]: 20,
                    [Difficulty.NORMAL]: 30,
                    [Difficulty.HARD]: 40,
                    [Difficulty.HELL]: 50
                }[store.difficulty] || 30;

                const maxAtkCap = 100;
                const newAtk = Math.min(maxAtkCap, bot.atk + atkBonus);

                const newConditions = new Map(currentBotState.conditions);

                // v2.2.0: Balancing - Remove 'Damage Reducing' and 'Regenerating' upon Awakening
                newConditions.delete('Damage Reducing');
                newConditions.delete('Regenerating');

                import('../logic/conditions').then(({ applyCondition }) => {
                    applyCondition(newConditions, 'Awakening', 9999, t.CONDITIONS.AWAKENING.DESC, { atkBonus });
                    store.syncBot({ ...bot, hp: newBotHp, atk: newAtk, conditions: newConditions });
                });

                store.setMessage(t.COMBAT.AWAKENING);
                AudioManager.playSFX('/assets/audio/conditions/Awakening.mp3');
            } else if (store.chapterNum === '2A' && stageNum === 10 && newBotHp > 0 && newBotHp <= bot.maxHp * 0.5 && !currentBotState.conditions.has('Awakening')) {
                // SPHINX Awakening (Copy logic from Chapter 1)
                newBotHp = bot.maxHp;
                awakeningTriggered = true;
                const atkBonus = 20;
                const newAtk = bot.atk + atkBonus;
                const newConditions = new Map(currentBotState.conditions);
                newConditions.delete('Damage Reducing');
                newConditions.delete('Regenerating');

                import('../logic/conditions').then(({ applyCondition }) => {
                    applyCondition(newConditions, 'Awakening', 9999, t.CONDITIONS.AWAKENING.DESC, { atkBonus });
                    store.syncBot({ ...bot, hp: newBotHp, atk: newAtk, conditions: newConditions });
                });
                setMessage(t.COMBAT.AWAKENING);
                AudioManager.playSFX('/assets/audio/conditions/Awakening.mp3');
            } else if (store.chapterNum === '2B' && stageNum === 10 && newBotHp > 0 && newBotHp <= bot.maxHp * 0.5 && !currentBotState.conditions.has('Awakening')) {
                // HIGH ORC LORD Awakening
                newBotHp = bot.maxHp;
                awakeningTriggered = true;
                const atkBonus = 25;
                const newAtk = bot.atk + atkBonus;
                const newConditions = new Map(currentBotState.conditions);
                newConditions.delete('Damage Reducing');
                newConditions.delete('Reflection');

                import('../logic/conditions').then(({ applyCondition }) => {
                    applyCondition(newConditions, 'Awakening', 9999, t.CONDITIONS.AWAKENING.DESC, { atkBonus });
                    store.syncBot({ ...bot, hp: newBotHp, atk: newAtk, conditions: newConditions });
                });
                setMessage(t.COMBAT.AWAKENING);
                AudioManager.playSFX('/assets/audio/conditions/Awakening.mp3');
            } else {
                setBotHp(newBotHp);
            }

            // v2.3.2: 2A-1 Mummy Revive
            if (newBotHp <= 0 && store.chapterNum === '2A' && stageNum === 1) {
                // Apply a Revival condition if not already applied, or process it inline. 
                // The instructions specify a 50% chance to revive once. Wait, we want it to not trigger stage clear.
                const revivedBefore = bot.conditions.has('Revived');
                if (!revivedBefore && Math.random() < 0.5) {
                    newBotHp = Math.floor(bot.maxHp * 0.5);
                    setBotHp(newBotHp);
                    store.addBotCondition('Revived', 9999); // Mark as revived
                    const condName = t.CONDITIONS.REVIVED.NAME;
                    setMessage(`${condName}!`);
                    AudioManager.playSFX('/assets/audio/conditions/부활(Revival).mp3');
                    await new Promise(r => setTimeout(r, 1000));
                }
            }


            // --- PHASE 5: SCATTERED (0.4s) ---
            store.setGamePhase('SCATTERED');
            await new Promise(r => setTimeout(r, 400));

            setBotAnimState('NONE');
            // store.setGamePhase('IDLE'); // Removed to keep UI locked until Boss Turn ends

            // v2.0.0.16: Remove cards only AFTER animation ends
            store.removePlayerCards(selectedIndices);

            // Regen logic - Difficulty-aware
            const config = DIFFICULTY_CONFIGS[store.difficulty];
            const stagesWithRegen = [6, 8, 10];
            if (config.stage9HasRegen) stagesWithRegen.push(9);

            // v2.2.0: Balancing - Boss cannot regenerate if Awakened
            const isBotAwakened = useGameStore.getState().bot.conditions.has('Awakening');

            if (store.chapterNum === '1' && stagesWithRegen.includes(stageNum) && newBotHp < bot.maxHp && !bot.conditions.has('Regenerating') && !isBotAwakened) {
                // Stage 6 has HP threshold
                if (stageNum === 6 && newBotHp <= bot.maxHp * 0.5) {
                    store.addBotCondition('Regenerating', 3, `At the end of each turn, restores ${Math.floor(config.regenPercent * 100)}% HP.`, { percent: config.regenPercent });
                    playConditionSound('Regenerating');
                } else if (stageNum !== 6) {
                    store.addBotCondition('Regenerating', 3, `At the end of each turn, restores ${Math.floor(config.regenPercent * 100)}% HP.`, { percent: config.regenPercent });
                    playConditionSound('Regenerating');
                }
            }

            // v2.3.0: Chapter 2B Boss Triggers (Invincible Spirit / Berserker)
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

                    await new Promise(r => setTimeout(r, 1000));
                }
            }

            // Berserker Check (HP threshold)
            if (store.chapterNum === '2B') {
                const bThresholds: Record<number, number> = { 4: 0.2, 7: 0.3, 10: 0.3 };
                const bAtkBonuses: Record<number, number> = { 4: 15, 7: 20, 10: 25 };
                const bLifesteals: Record<number, number> = { 4: 10, 7: 10, 10: 15 };

                if (bThresholds[stageNum] && freshBot.hp > 0 && freshBot.hp < (freshBot.maxHp * bThresholds[stageNum])) {
                    if (!freshBot.conditions.has('Berserker')) {
                        store.addBotCondition('Berserker', 9999, '', { atkBonus: bAtkBonuses[stageNum], lifesteal: bLifesteals[stageNum] });
                        setMessage(t.CONDITIONS.BERSERKER.NAME + "!");
                        playConditionSound('Berserker');
                        await new Promise(r => setTimeout(r, 1000));
                    }
                }
            }

            if (newBotHp <= 0) {
                await handleVictory();
            } else {
                // v2.1.0: If awakening triggered, boss skips its turn
                if (awakeningTriggered) {
                    setMessage(t.COMBAT.ST_AWAKENING);
                    await new Promise(r => setTimeout(r, 1200));
                    await proceedToEndTurn();
                } else {
                    await executeBotTurn();
                }
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

                await new Promise(r => setTimeout(r, 1200));
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

                await new Promise(r => setTimeout(r, 1200));
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
            await new Promise(r => setTimeout(r, 1000));
            await proceedToEndTurn();
            return;
        }

        // v2.3.2: 2A-7 Sand Golem (Every 2 turns)
        if (store.chapterNum === '2A' && stageNum === 7 && store.currentTurn % 2 === 0) {
            setMessage(t.COMBAT.BOSS_SKIPPED);
            await new Promise(r => setTimeout(r, 1000));
            await proceedToEndTurn();
            return;
        }

        // --- Special Boss Special Attacks ---
        if (store.chapterNum === '2A' && stageNum === 11) {
            const cycleTurn = (store.currentTurn % 3);
            if (cycleTurn === 1) {
                // Turn 2 of 3 (indices 1, 4, 7...): Skip/Setup
                setMessage("’특수 공격: 모래폭풍’을 준비 중입니다…");
                await new Promise(r => setTimeout(r, 1200));
                await proceedToEndTurn();
                return;
            } else if (cycleTurn === 2) {
                // Turn 3 of 3 (indices 2, 5, 8...): Special Attack
                setMessage("모래 폭풍 피해를 받습니다!");
                setBotAnimState('ATTACK');
                AudioManager.playSFX('/assets/audio/combat/chapter 2a desert/2A_SAND DRAGON_SAND STORM.mp3');
                const dmgString = "70";
                const dmg = 70;
                setPlayerHp(Math.max(0, currentPlayer.hp - dmg));
                showDamageText('PLAYER', `-${dmgString}`, '#e74c3c');
                if (Math.random() < 0.4) {
                    store.addPlayerCondition('Burn', 3);
                    playConditionSound('Burn');
                }
                await new Promise(r => setTimeout(r, 1200));
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
                    await new Promise(r => setTimeout(r, 1200));
                    await proceedToEndTurn();
                    return;
                } else if (cycleTurn === 3) {
                    // Special Attack
                    setMessage("부패 폭발 피해를 받습니다!");
                    setBotAnimState('ATTACK');
                    AudioManager.playSFX('/assets/audio/combat/chapter 2b deep forest/2B_HIGH ORC SHAMAN_DECAY EXPLOSION.mp3');
                    const dmgString = "30";
                    const dmg = 30;
                    setPlayerHp(Math.max(0, currentPlayer.hp - dmg));
                    showDamageText('PLAYER', `-${dmgString}`, '#e74c3c');
                    if (Math.random() < 0.8) {
                        store.addPlayerCondition('Decay', 4);
                        playConditionSound('Decay');
                    }
                    await new Promise(r => setTimeout(r, 1200));
                    await proceedToEndTurn();
                    return;
                }
            }
        }

        // v2.1.2: Unified Evasion Check (Passive Skill)
        const config = DIFFICULTY_CONFIGS[store.difficulty];
        const avoidCond = currentPlayer.conditions.get('Avoiding');
        const has2B = store.equippedAltarSkills.includes('2B');

        let finalAvoidChance = avoidCond ? ((avoidCond.data as any)?.chance ?? config.avoidChance) : config.avoidChance;
        if (has2B) finalAvoidChance += 0.05;

        // v2.3.6: Chapter 2B Environmental Rule - Player Avoiding is DISABLED (unless 2B skill is equipped)
        const isAvoided = !isTutorial && (store.chapterNum !== '2B' || has2B) && finalAvoidChance > 0 && Math.random() < finalAvoidChance;

        if (isAvoided) {
            setMessage(t.COMBAT.ATTACK_AVOIDED);
            playConditionSound('Avoiding');
            triggerScreenEffect('flash-red');
            await new Promise(r => setTimeout(r, 1000));
            await proceedToEndTurn();
            return;
        }

        // v2.3.7: Boss Accuracy Check
        const botAccuracy = currentBot.accuracy ?? 1.0;
        if (botAccuracy < 1.0 && Math.random() > botAccuracy) {
            setMessage(t.COMBAT.BOSS_MISSED);
            // Play swing sound for miss
            AudioManager.playSFX('/assets/audio/combat/chapter 1 goblin/06_swing_ weapon.mp3');
            await new Promise(r => setTimeout(r, 1000));
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

        const sfx = getBossAttackSFX(store.chapterNum, stageNum);

        // Execute Attacks Loop
        for (let i = 0; i < attackCount; i++) {
            // Visual & Audio updates
            if (i === 0) {
                setMessage(t.COMBAT.BOSS_ATTACKS);
                setBotAnimState('ATTACK');
                if (sfx) setTimeout(() => AudioManager.playSFX(sfx), 200);
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
                    store.swapCards(targets);
                    setMessage("FORCE SWAP x2");
                    await new Promise(r => setTimeout(r, 500));
                }
            }

            await new Promise(r => setTimeout(r, 200));
            triggerScreenEffect('shake-heavy');
            setPlayerAnimState('HIT');

            // Apply Damage
            let finalDmg = (store.chapterNum === '2B' && stageNum === 8 && Math.random() < 0.25)
                ? Math.floor(damage * 1.5) // Critical Hit for 2B-8
                : damage;

            // Altar Skill 2B-2: Boss Attack Damage -30%
            if (store.equippedAltarSkills.includes('2B-2')) {
                finalDmg = Math.floor(finalDmg * 0.7);
            }

            if (finalDmg > damage) {
                setMessage(t.COMBAT.CRITICAL_HIT);
                triggerScreenEffect('flash-red');
            }

            setPlayerHp(applyDamage(useGameStore.getState().player.hp, finalDmg));
            showDamageText('PLAYER', `-${finalDmg}`, '#e74c3c');

            // v2.3.0: Boss Lifesteal / Recoil / Provocation
            const freshBotAfterHit = useGameStore.getState().bot;
            const bCondHit = freshBotAfterHit.conditions.get('Berserker');
            if (bCondHit) {
                const heal = Math.floor(finalDmg * ((bCondHit.data as any)?.lifesteal || 10) / 100);
                if (heal > 0) {
                    setBotHp(Math.min(freshBotAfterHit.maxHp, freshBotAfterHit.hp + heal));
                    showDamageText('BOT', `+${heal}`, '#2ecc71');
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
                // Altar Skill 2B-1 (Hunter): Immune to accuracy reduction
                if (store.equippedAltarSkills.includes('2B-1')) {
                    setMessage("HUNTER IMMUNITY!");
                } else {
                    // 2B-5: 20%, 2B-9: 25%, 2B-10: 30%
                    const accPercent = stageNum === 5 ? 20 : (stageNum === 9 ? 25 : 30);
                    store.addPlayerCondition('Decreasing accuracy', 3, '', { percent: accPercent });
                }
            }

            // Recoil Damage if Boss has 'Damage recoiling' status
            const recoCond = freshBotAfterHit.conditions.get('Damage recoiling');
            if (recoCond) {
                const recoil = (recoCond.data as any)?.recoil || 12;
                setBotHp(Math.max(0, freshBotAfterHit.hp - recoil));
                showDamageText('BOT', `-${recoil}`, '#e74c3c');
            }

            await new Promise(r => setTimeout(r, i < attackCount - 1 ? 800 : 400)); // Delay between multi-attacks

            // Reset anim for next hit
            setBotAnimState('NONE');
            setPlayerAnimState('NONE');
        }

        const freshPlayer = useGameStore.getState().player;
        if (freshPlayer.hp <= 0) {
            const survived = await checkPlayerSurvival();
            if (survived) {
                await new Promise(r => setTimeout(r, 1000));
                await proceedToEndTurn();
                return;
            }
        }

        // --- Status Effects (v2.3.2: Chapter 2A Adjustments) ---
        if (store.chapterNum === '2A') {
            if ([1, 2, 3, 6, 8, 9, 10].includes(stageNum)) {
                if (Math.random() < config.poisonProbCh2A) {
                    store.addPlayerCondition('Poisoning', 3);
                }
            }
            if ([1, 2, 3, 6, 8, 9, 10].includes(stageNum)) {
                if (Math.random() < 0.3) {
                    store.addPlayerCondition('Debilitating', 3);
                }
            }
            if ([3, 4, 6, 9, 10].includes(stageNum)) {
                if (Math.random() < config.bleedProbCh2A) {
                    store.addPlayerCondition('Bleeding', 6);
                }
            }
            if (stageNum === 5) {
                // Neurotoxicity: 3 turns (Applying Blind/Paralyze is handled via applyCondition side effects or here)
                if (Math.random() < 0.40) {
                    // Replaced neuroProbCh2A with explicit 40%
                    store.addPlayerCondition('Neurotoxicity', 3);
                }
            }
            if (stageNum === 7) {
                // Now 40% based on user request (down from 50%)
                if (Math.random() < 0.4) {
                    store.addPlayerCondition('Paralyzing', 2);
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
                } else {
                    const effect = Math.random() < 0.5 ? 'Poisoning' : 'Debilitating';
                    store.addPlayerCondition(effect, 4);
                    playConditionSound(effect);
                    const condKey = effect.toUpperCase();
                    const condName = (t.CONDITIONS as any)[condKey]?.NAME || effect;
                    setMessage(condName + "!");
                }
                triggerScreenEffect('flash-red');
            } else {
                // Standard 2B Status Application logic
                const bleedMap: Record<number, number> = { 1: 0.10, 2: 0.12, 3: 0.15, 4: 0.12, 5: 0, 6: 0.12, 7: 0.15, 8: 0.17, 9: 0.20, 10: 0.15 };
                const bProb = bleedMap[stageNum] || 0.15;
                if (bProb > 0 && Math.random() < bProb) {
                    store.addPlayerCondition('Bleeding', 4);
                }
                if (stageNum === 8 && Math.random() < 0.25) {
                    store.addPlayerCondition('Poisoning', 4);
                }
            }
        } else if (store.chapterNum === '1') {
            // v2.3.7: Restore Chapter 1 Status Application Mechanics
            applyBotStageMechanics();
        }

        await new Promise(r => setTimeout(r, 300));
        setBotAnimState('NONE');
        setPlayerAnimState('NONE');

        // v2.0.0.21: Boss ATK Scaling only on successful hit (Chapter 1 Only)
        let updatedAtk = currentBot.atk;
        const maxAtkCap = 100;

        if (store.chapterNum === '1') {
            if (stageNum === 7) {
                updatedAtk = Math.min(maxAtkCap, updatedAtk + 10);
            } else if (stageNum === 9) {
                updatedAtk = Math.min(maxAtkCap, updatedAtk * 2);
            }
        }

        // Global ATK Cap
        updatedAtk = Math.min(maxAtkCap, updatedAtk);

        if (updatedAtk !== currentBot.atk) {
            store.syncBot({ ...currentBot, atk: updatedAtk });
        }

        // Check death using fresh state after both damage and status effects
        const finalPlayerHp = useGameStore.getState().player.hp;
        if (finalPlayerHp <= 0) {
            await handleDefeat();
        } else {
            if (isTutorial && tutorialStep === 9) {
                // v2.0.0.21: Wait 3 seconds so player can read the Step 9 explanation
                await new Promise(r => setTimeout(r, 3000));
                setTutorialStep(10);
            }
            await proceedToEndTurn();
        }
    };

    // v2.3.0: Survival Check Helper
    const checkPlayerSurvival = async (): Promise<boolean> => {
        const store = useGameStore.getState();
        const p = store.player;

        // 1. Revival
        const revivalCond = p.conditions.get('Revival');
        const revivalLimit = (revivalCond?.data as any)?.limit || 1;
        if (revivalCond && revivalLimit > 0) {
            const heal = Math.floor(p.maxHp * 0.5);
            setPlayerHp(heal);
            setMessage(t.CONDITIONS.REVIVAL.NAME + "!");
            playConditionSound('Revival');

            // Reduce charges
            const newConds = new Map(p.conditions);
            const updated = { ...revivalCond, data: { ...((revivalCond.data as any) || {}), limit: revivalLimit - 1 } };
            if (updated.data.limit <= 0) newConds.delete('Revival');
            else newConds.set('Revival', updated);
            useGameStore.getState().setPlayer({ ...p, conditions: newConds });

            return true;
        }

        return false;
    };

    // v2.0.0.19: Trigger Bot Turn on Tutorial Step 9
    useEffect(() => {
        if (isTutorial && tutorialStep === 9 && gamePhase === 'IDLE') {
            executeBotTurn();
        }
    }, [isTutorial, tutorialStep, gamePhase]);

    const proceedToEndTurn = async () => {
        await resolveStatusEffects();

        const store = useGameStore.getState();

        // v2.2.1: Check for death after status effect damage (Bleeding, Poison, etc.)
        if (store.player.hp <= 0) {
            await handleDefeat();
            return;
        }
        if (store.bot.hp <= 0) {
            await handleVictory();
            return;
        }

        const nextTurn = store.currentTurn + 1;
        store.setCurrentTurn(nextTurn);

        // v2.0.0.19: Tutorial Progression
        if (store.isTutorial) {
            if (store.tutorialStep === -1 || store.tutorialStep === 6) {
                // If freedom turns are active
                if (nextTurn >= 5) { // Turn 0: Trial, 1,2,3,4: Freedom. Now turn 5.
                    // Force a Joker card if not already in hand
                    const currentHand = store.playerHand;
                    const hasJoker = currentHand.some(c => c?.isJoker);
                    if (!hasJoker) {
                        const nullIdx = currentHand.indexOf(null);
                        const jokerCard = { ...CardFactory.create(null, null, true), isJoker: true };
                        if (nullIdx !== -1) {
                            const updatedHand = [...currentHand];
                            updatedHand[nullIdx] = jokerCard;
                            setPlayerHand(updatedHand);
                        } else {
                            // Replace the last card with a Joker if hand is full
                            const updatedHand = [...currentHand];
                            updatedHand[updatedHand.length - 1] = jokerCard;
                            setPlayerHand(updatedHand);
                        }
                    }
                    store.setTutorialStep(7); // Joker Explanation
                } else if (nextTurn === 3) {
                    // Turn 1,2 finished. Now it's the start of Turn 3.
                    store.setTutorialStep(13); // SWAP Guide
                }
            } else if (store.tutorialStep === 7 || store.tutorialStep === -7) {
                // After Joker attack turn ends
                store.setTutorialStep(8); // Status Effects Explanation
            } else if (store.tutorialStep === 11) {
                // v2.0.0.21: Delay Boss Rule explanation until all combat animations finish
                store.setTutorialStep(14);
            }
        }

        await refillHandSequentially();
        const finalStore = useGameStore.getState();
        finalStore.applyStageRules(finalStore.chapterNum, stageNum, nextTurn);
        finalStore.setGamePhase('IDLE'); // UI re-enabled only after all turn processing
    };

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

                // Altar Skill 2A (Acclimatization): Regen on status damage
                if (store.equippedAltarSkills.includes('2A')) {
                    if (!playerConditions.has('Regenerating')) {
                        store.addPlayerCondition('Regenerating', 3, '', { amount: 5 });
                        setMessage("ACCLIMATIZATION!");
                    }
                }

                await new Promise(r => setTimeout(r, 800));

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

                // Altar Skill 2A (Acclimatization): Regen on status damage
                if (store.equippedAltarSkills.includes('2A')) {
                    if (!playerConditions.has('Regenerating')) {
                        store.addPlayerCondition('Regenerating', 3, '', { amount: 5 });
                        setMessage("ACCLIMATIZATION!");
                    }
                }

                await new Promise(r => setTimeout(r, 800));
            } else if (cond === 'Burn') {
                setMessage(t.COMBAT.PLAYER_BURN || "PLAYER BURNED!");
                playConditionSound('Burn');
                const amount = Math.floor(currentP.maxHp * 0.03);
                const freshHP = useGameStore.getState().player.hp;
                setPlayerHp(Math.max(0, freshHP - amount));
                showDamageText('PLAYER', `-${amount}`, '#e67e22');
                await new Promise(r => setTimeout(r, 800));
            } else if (cond === 'Decay') {
                setMessage(t.COMBAT.PLAYER_DECAY || "PLAYER DECAYED!");
                playConditionSound('Decay');
                const rates = [0.03, 0.05, 0.08, 0.10];
                const rate = rates[data.elapsed] || 0.10;
                const amount = Math.floor(currentP.maxHp * rate);
                const freshHP = useGameStore.getState().player.hp;
                setPlayerHp(Math.max(0, freshHP - amount));
                showDamageText('PLAYER', `-${amount}`, '#8e44ad');
                await new Promise(r => setTimeout(r, 800));
            } else if (cond === 'Regenerating') {
                setMessage(t.COMBAT.PLAYER_REGEN);
                playConditionSound('Regenerating');

                let heal = data.data?.amount || 10;
                // Altar Skill 2A-2 (Biorhythm Acceleration): +20% Regen
                if (store.equippedAltarSkills.includes('2A-2')) {
                    heal = Math.floor(heal * 1.2);
                }

                setPlayerHp(Math.min(currentP.maxHp, currentP.hp + heal));
                showDamageText('PLAYER', `+${heal}`, '#2ecc71');
                await new Promise(r => setTimeout(r, 800));
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

                // Altar Skill 2A (Acclimatization): Regen on status damage
                if (store.equippedAltarSkills.includes('2A')) {
                    if (!playerConditions.has('Regenerating')) {
                        store.addPlayerCondition('Regenerating', 3, '', { amount: 5 });
                        setMessage("ACCLIMATIZATION!");
                    }
                }

                await new Promise(r => setTimeout(r, 1000));
            }
            condData.elapsed += 1;
        }
        // Remove expired player conditions
        toRemovePlayer.forEach(name => playerConditions.delete(name));
        const freshPAfter = useGameStore.getState().player;
        useGameStore.getState().setPlayer({ ...freshPAfter, conditions: playerConditions });

        // 0.5s pause between phases
        await new Promise(r => setTimeout(r, 500));

        // Boss Phase
        for (const [condName, condData] of Array.from(botConditions.entries())) {
            const cond = condName as string;
            const data = condData as any;
            if (['Poisoning', 'Bleeding', 'Heavy Bleeding'].includes(cond)) {
                const toastMsg = cond === 'Poisoning' ? t.COMBAT.BOSS_POISONING : (cond === 'Heavy Bleeding' ? t.COMBAT.BOSS_HEAVY_BLEEDING : t.COMBAT.BOSS_BLEEDING);
                setMessage(toastMsg);
                playConditionSound(cond);
                const dmg = 10;
                setBotHp(Math.max(0, bot.hp - dmg));
                showDamageText('BOT', `-${dmg}`, '#c0392b');
                await new Promise(r => setTimeout(r, 800));
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
                await new Promise(r => setTimeout(r, 800));
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

        // Remove expired bot conditions
        toRemoveBot.forEach(name => botConditions.delete(name));
        const freshBot = useGameStore.getState().bot;
        useGameStore.getState().setBot({ ...freshBot, conditions: botConditions });
    };


    const executeCardSwap = (selectedIndices: number[]) => {
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

        const p = useGameStore.getState().player;
        if ((p.drawsRemaining ?? 0) > 0) {
            swapCards(selectedIndices);
            useGameStore.getState().setDrawsRemaining((p.drawsRemaining ?? 0) - 1);
            setMessage(t.COMBAT.CARDS_SWAPPED);
        } else {
            setMessage(t.COMBAT.NO_SWAPS);
            triggerScreenEffect('shake-small');
        }
        useGameStore.getState().setGamePhase('IDLE');
    };

    const handleVictory = async () => {
        const store = useGameStore.getState();
        const config = DIFFICULTY_CONFIGS[store.difficulty];

        // 1. 상태 정리 (Heal + Clear Conditions)
        store.clearPlayerConditions();

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
            '2B': { 5: 'TR_2B_5', 10: 'TR_2B_10', 11: 'TR_2B_SP' }
        };
        const potentialTrophyId = trophyIdMap[store.chapterNum]?.[stageNum];

        if (potentialTrophyId && store.difficulty !== Difficulty.EASY) {
            const { AltarManager } = await import('../utils/AltarManager');
            // Only stage if not already permanently owned and not already pending
            if (!AltarManager.hasTrophy(potentialTrophyId, store.difficulty)) {
                const staged = AltarManager.stageTrophy(potentialTrophyId, store.difficulty);
                if (staged) {
                    const { TROPHIES } = await import('../constants/altarSystem');
                    store.setTrophyPopup(TROPHIES[potentialTrophyId]);
                    // Hold here while the popup is visible
                    while (useGameStore.getState().trophyPopup !== null) {
                        await new Promise(r => setTimeout(r, 200));
                    }
                    await new Promise(r => setTimeout(r, 500));
                }
            }
        }

        // 3. Victory State & Sound
        setGameState(GameState.VICTORY);
        const bonusPercent = Math.floor(config.stage6MaxHpBonus * 100);
        const victoryMsg = (store.chapterNum === '1' && stageNum === 6)
            ? t.COMBAT.STAGE6_BONUS.replace('{percent}', bonusPercent.toString())
            : t.COMBAT.VICTORY;
        setMessage(victoryMsg);
        AudioManager.playSFX('/assets/audio/stages/victory/victory.mp3');

        // 4. Wait for victory.mp3 (approx 5s)
        await new Promise(r => setTimeout(r, 5000));

        // 5. Transition to next stage or unlock difficulty on final stage clear
        const nextStage = stageNum + 1;

        // Hidden Scenario Stage Redirection
        let targetStage = nextStage;
        if (stageNum === 9 && store.specialQualify && store.ch2SpecialQualify) {
            targetStage = 11; // Special Stage
        }

        // v2.3.8: Fix chapter transition for Chapter 1 (Standard nextStage is 11, which failed the !== 11 check)
        if ((targetStage > 10 && targetStage !== 11) || (store.chapterNum === '1' && stageNum === 10)) {
            // Unlock next difficulty on game completion
            if (store.difficulty === Difficulty.NORMAL) {
                store.unlockDifficulty(Difficulty.HARD);
            } else if (store.difficulty === Difficulty.HARD) {
                store.unlockDifficulty(Difficulty.HELL);
            }

            if (store.chapterNum === '1') {
                // Chapter 1 Clear -> Selection Screen
                setMessage("");
                setGameState(GameState.CHAPTER_SELECT);
            } else {
                // Chapter 2 (or later) Clear -> Stay in VICTORY state for DIMMING & BACK TO MAIN button
                // The BattleScreen will handle showing the back to main button based on stageNum === 10 and gameState === VICTORY
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
            return;
        }

        // v2.0.0.21: Skip for tutorial if hand is already pre-set to avoid overwriting guaranteed cards
        if (isTutorial && playerHand.some(c => c !== null)) return;

        // v2.0.0.10: Pre-fill with null to maintain slot positions, then refill.
        setPlayerHand(new Array(8).fill(null));
        await refillHandSequentially(1500);

        // v2.3.5: Regenerate Sphinx target after hand is full
        if (store.chapterNum === '2A' && store.stageNum === 10) {
            store.applyStageRules(store.chapterNum, store.stageNum, store.currentTurn);
        }
        store.setGamePhase('IDLE');
    };

    const handleDefeat = async () => {
        const store = useGameStore.getState();

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

    return {
        message,
        damageTexts,
        screenEffect,
        onDamageTextComplete,
        executePlayerAttack,
        executeBotTurn,
        executeCardSwap,
        startInitialDraw
    };
};
