import { useState, useEffect, useCallback } from 'react';
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
import { playConditionSound, getBossAttackSFX } from '../utils/audioMapper';
import { applyChapterSpecialRules } from './specialRules';
import { applyBotStatusEffects } from './botMechanics';
import { evaluateHand } from './mechanics';
import { TitleManager } from '../utils/TitleManager';
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
    const [fxClass, setFxClass] = useState<string>('');

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

    // v2.5.1: Attack FX Level Triggers
    const triggerHitFx = useCallback((handType: string, damage: number) => {
        let priorityLevel = '';
        if (damage >= 151 || ['Royal Flush', 'Straight Flush', 'Five of a Kind'].includes(handType)) {
             priorityLevel = 'critical';
        } else if (damage >= 81 || ['Straight', 'Flush', 'Full House', 'Four of a Kind'].includes(handType)) {
             priorityLevel = 'strong';
        } else if (damage >= 31 || ['Two Pair', 'Three of a Kind'].includes(handType)) {
             priorityLevel = 'medium';
        } else if (handType === 'One Pair' || damage > 0) {
             priorityLevel = 'light';
        }
        
        if (priorityLevel) {
            setFxClass(`hit-${priorityLevel}`);
            scaledTimeout(() => setFxClass(''), 300);
        }
    }, [setFxClass]);

    const triggerPlayerHitFx = useCallback((damage: number) => {
        let level = '';
        if (damage >= 50) level = 'critical';
        else if (damage >= 25) level = 'strong';
        else if (damage > 0) level = 'light';
        
        if (level) {
            setFxClass(`player-hit-${level}`);
            scaledTimeout(() => setFxClass(''), 700);
        }
    }, [setFxClass]);

    // 4B-2: Node Interference Helper (Generic Special Attack Reflection)
    const applyNodeInterference = (incomingDmg: number): number => {
        const store = useGameStore.getState();
        if (store.equippedAltarSkills.includes('4B-2')) {
            const reflected = Math.floor(incomingDmg * 0.5);
            const remaining = incomingDmg - reflected;
            setBotHp(Math.max(0, useGameStore.getState().bot.hp - reflected));
            showDamageText('BOT', `-${reflected}`, '#f39c12');
            setMessage(language === 'KR' ? '?몃뱶媛꾩꽠!' : "NODE INTERFERENCE!");
            AudioManager.playSFX('/assets/audio/conditions/?곕?吏 諛섏궗(Damage reflection).mp3');
            return remaining;
        }
        return incomingDmg;
    };

    // Extracted playConditionSound and getBossAttackSFX to audioMapper.ts

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

        // 1. 留덈퉬 泥댄겕 (Paralyzing)
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
            setMessage("吏꾪쓾 移대뱶媛 ?ы븿?섏뼱 ?덉뒿?덈떎!");
            triggerScreenEffect('shake-small');
            store.setGamePhase('IDLE');
            return;
        }

        // PETRIFIED Check (Prevent Attack)
        if (selectedCardsForStatusCheck.some(c => c.isPetrified)) {
            setMessage("?앺솕??移대뱶媛 ?ы븿?섏뼱 ?덉뒿?덈떎!");
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
            setMessage(t.COMBAT.ACCURACY_MISSED); // 紐낆쨷瑜????硫붿떆吏 ?쒖슜
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
            store.equippedAltarSkills.includes('4A-1') && store.isDyschromatopsiaActive && store.dyschromatopsiaUses < 1
        );

        // Title Progress: One Pair Dance (local only for now)
        let hasOnePairDance = store.hasOnePairDanceTitle || store.forceOnePairDance;
        if (handType === 'One Pair' && baseDamage > 0) {
            const res = TitleManager.incrementOnePairCount();
            if (res.unlocked && !hasOnePairDance) {
                store.setHasOnePairDanceTitle(true);
                hasOnePairDance = true;
            }
        }

        // 4A-1: Dyschromatopsia - If active, consume a use ONLY when a flux-type is formed AND it is better than natural hand
        if (store.equippedAltarSkills.includes('4A-1') && store.isDyschromatopsiaActive && store.dyschromatopsiaUses < 1) {
            if (handType.includes('Flush')) {
                const naturalEval = evaluateHand(selectedCards, false);
                const handRanks = [
                    'Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House', 
                    'Flush', 'Straight', 'Three of a Kind', 'Two Pair', 'One Pair', 'High Card'
                ];
                const getRank = (type: string) => {
                    const idx = handRanks.indexOf(type);
                    return idx === -1 ? 999 : idx;
                };

                // Consume only if effective hand is rank-wise better than natural hand
                if (getRank(handType) < getRank(naturalEval.type)) {
                    store.incrementDyschromatopsiaUses();
                    // If uses reach 1, auto-deactivate
                    if (store.dyschromatopsiaUses + 1 >= 1) {
                        store.setDyschromatopsiaActive(false);
                    }
                }
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

            const ruleRes = applyChapterSpecialRules(
                store.chapterNum, stageNum, handType, damage, finalDamage, rawDamage, baseDamage, displayMessage, selectedCards, store.currentTurn, store.holdBreathTurn3B
            );
            damage = ruleRes.damage;
            displayMessage = ruleRes.displayMessage;

            if (store.chapterNum === '3B') {
                // 3B-10: STEM CELL ?뚭눼 濡쒖쭅 - 3???곗냽 ?ㅽ듃?덉씠??怨꾩뿴 怨듦꺽 ?깃났 ??
                if (stageNum === 10 && !store.lizardStemCellDestroyed && damage > 0) {
                    const straightHands = ['Straight', 'Straight Flush', 'Royal Flush'];
                    if (straightHands.includes(handType)) {
                        const newCount = store.lizardKingStraightCount + 1;
                        store.setLizardKingStraightCount(newCount);
                        
                        if (newCount >= 3) {
                            store.setLizardStemCellDestroyed(true);
                            const freshBot10 = useGameStore.getState().bot;
                            
                            // 蹂댁뒪 珥덇린 ?ㅽ꺈 濡ㅻ갚 (珥덇린 諛곗쑉 ?곸슜??Base MaxHP 諛?ATK)
                            const diffConfig = DIFFICULTY_CONFIGS[store.difficulty];
                            const chapterConf = CHAPTERS['3B'];
                            const bossOverride = diffConfig.bossOverrides['3B']?.[10] || {};
                            const b_stageConfig = chapterConf?.stages[10];
                            
                            let initHp = freshBot10.maxHp;
                            let initAtk = freshBot10.atk;
                            
                            if (b_stageConfig) {
                                initHp = bossOverride.hp ?? Math.floor(b_stageConfig.hp * diffConfig.hpScale);
                                initAtk = bossOverride.atk ?? Math.floor(b_stageConfig.atk * diffConfig.atkScale);
                            }
                            
                            const newConds10 = new Map(freshBot10.conditions);
                            newConds10.delete('Stem Cell'); // ??젣 ???꾩쟻???뚰뵾??currentAvoid)???④퍡 ?좎븘媛?
                            
                            const cappedHp = Math.min(freshBot10.hp, initHp);
                            useGameStore.getState().setBot({
                                ...freshBot10,
                                maxHp: initHp,
                                hp: cappedHp,
                                atk: initAtk,
                                conditions: newConds10
                            });
                            
                            setMessage("?붾줈誘몄뼱 ?⑥젅! 以꾧린?명룷 ?④낵 ?곴뎄???쒓굅!");
                        } else {
                            setMessage("?붾줈誘몄뼱 媛??怨듦꺽!");
                        }
                        triggerScreenEffect('flash-red');
                    } else {
                        // ?ㅽ듃?덉씠????怨듦꺽 ?깃났 ???곗냽 ?ㅽ깮 珥덇린??
                        store.setLizardKingStraightCount(0);
                    }
                }
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
                    displayMessage = t.COMBAT.PATTERN_DISRUPTION_MSG;
                }
            }

            // 5A-2: Overloaded (same hand consecutively ??+10% per stack, max 3)
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

        // --- PHASE 1: GATHERING (leaf-flutter / one-pair dance / two-pair taeguek) ---
        const isOnePairDance = hasOnePairDance && handType === 'One Pair';

        // Two Pair Taeguek: classify pair groups
        const isTwoPairTaeguek = (store.forceTwoPairTaeguek || false) && handType === 'Two Pair';
        let twoPairGroups = { pair1: [] as number[], pair2: [] as number[], solo: [] as number[] };
        if (isTwoPairTaeguek) {
            // Find pairs by rank
            const rankMap: Record<string, number[]> = {};
            selectedCards.forEach((card, i) => {
                const rank = card.rank || (card.isJoker ? 'JOKER' : 'X');
                if (!rankMap[rank]) rankMap[rank] = [];
                rankMap[rank].push(selectedIndices[i]);
            });
            const pairs = Object.entries(rankMap)
                .filter(([, indices]) => indices.length >= 2)
                .map(([, indices]) => indices.slice(0, 2));
            // Shuffle and assign
            const shuffled = pairs.sort(() => Math.random() - 0.5);
            twoPairGroups.pair1 = shuffled[0] || [];
            twoPairGroups.pair2 = shuffled[1] || [];
            // Solo cards (not in any pair)
            const pairIndices = new Set([...twoPairGroups.pair1, ...twoPairGroups.pair2]);
            twoPairGroups.solo = selectedIndices.filter(i => !pairIndices.has(i));
            store.setTwoPairGroups(twoPairGroups);
        }

        if (isOnePairDance) {
            const order = [...selectedIndices].sort(() => Math.random() - 0.5);
            store.setAttackOrderIndices(order);
            store.setSpecialAttackMode('ONE_PAIR_DANCE');
            store.setGamePhase('GATHERING_SPECIAL');
        } else if (isTwoPairTaeguek) {
            store.setAttackOrderIndices(selectedIndices);
            store.setSpecialAttackMode('TWO_PAIR_TAEGUEK');
            store.setGamePhase('GATHERING_SPECIAL');
        } else {
            store.setSpecialAttackMode('NONE');
            store.setAttackOrderIndices([]);
            store.setGamePhase('GATHERING');
        }
        scaledTimeout(() => AudioManager.playSFX('/assets/audio/player/shuffling.mp3'), 100);
        const specialDelayMs = 120;
        if (!isOnePairDance && !isTwoPairTaeguek) {
            const gatheringDurationRaw = (selectedCards.length * 100) + 500;
            await wait(gatheringDurationRaw);

            // --- PHASE 2: CHARGING (Y-axis 180° spin) ---
            store.setGamePhase('CHARGING');
            await wait(500);

            // --- PHASE 3: THRUSTING ---
            store.setGamePhase('THRUSTING');
            await wait(67);
            await wait(133);
            AudioManager.playSFX('/assets/audio/player/whipping.mp3');

            // Boss Shake & Hit
            await wait(100);
            setBotAnimState('HIT');
            triggerHitFx(handType, damage);
        } else if (isTwoPairTaeguek) {
            // === TWO PAIR TAEGUEK: 6-Phase Animation Sequence ===

            // Phase 1: Gathering — cards fly to upper/lower gathering points (~1.0s, bumped for visibility)
            await wait(1000);

            // Phase 2: Taeguek Orbit — S-curve yin-yang motion (~1.0s)
            // CSS handles the animation; JS just waits
            await wait(1000);

            // Phase 3: Convergence — both orbs rush to center (~0.4s)
            AudioManager.playSFX('/assets/audio/player/whipping.mp3');
            await wait(400);

            // Phase 4: Spark Impact — radial spark at boss center
            setBotAnimState('HIT');
            setFxClass(`hit-medium-taeguek${Date.now()}`);
            AudioManager.playSFX('/assets/audio/player/whipping.mp3');
            await wait(300);

            // Phase 5: Big Bang Explosion — massive VFX + damage
            setFxClass(`hit-critical-taeguek${Date.now()}`);
            triggerScreenEffect('shake');
            await wait(800);

            // Phase 6: Fade-out
            await wait(400);
        } else {
            // One Pair Dance: Overlapping flights, progressive impacts
            const cardCount = selectedCards.length;

            // Wait for first card to reach boss (0.85s flight time)
            await wait(850);

            // Sequential hit impacts with progressive intervals
            for (let hitIdx = 0; hitIdx < cardCount; hitIdx++) {
                AudioManager.playSFX('/assets/audio/player/whipping.mp3');
                setBotAnimState('HIT');

                if (hitIdx === cardCount - 1) {
                    // ★ Final card: Heavy impact particles + screen shake
                    setFxClass(`hit-strong-dance${Date.now()}`);
                    triggerScreenEffect('shake');
                } else {
                    // Intermediate cards: Light impact particles per hit
                    setFxClass(`hit-light-dance${Date.now()}`);
                    // Progressive interval: 400ms shrinking by 30ms per card
                    const interval = Math.max(280, 400 - hitIdx * 30);
                    await wait(interval * 0.4);
                    setBotAnimState('NONE');
                    await wait(interval * 0.6);
                }
            }
        }

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

        // 3A-10 ?고룿 ?꾩듅 ?寃?湲곕? (Flush 4臾몄뼇 ?꾩꽦 ??利됱궗)
        if (store.chapterNum === '3A' && stageNum === 10 && handType.includes('Flush')) {
            const suit = selectedCards.find(c => !c.isJoker)?.suit;
            if (suit && !store.hydraFlushSuits.includes(suit)) {
                const newSuits = [...store.hydraFlushSuits, suit];
                store.setHydraFlushSuits(newSuits);
                setMessage(t.UI.HYDRA_FLUSH_COUNT.replace('{count}', newSuits.length.toString()));
                triggerScreenEffect('flash-red');
                if (newSuits.length >= 4) {
                    await wait(1000);
                    setMessage("?고룿 ?꾩듅: 嫄곕? 諭???ъ옣??李붾??듬땲??");
                    setBotHp(0);
                    // 利됱궗?대?濡?遺??議곌굔???ㅽ궢/媛뺤젣??젣
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
                setMessage(language === 'KR' ? '?멸낵?щ같??' : 'CAUSALITY REARRANGEMENT!');
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
                newConditions.set('Awakening', { duration: 9999, elapsed: 0, desc: t.CONDITIONS.AWAKENING.DESC, data: { atkBonus }, type: 'AWAKENING' as any });
                store.syncBot({ ...freshBotBeforeAwaken, hp: freshBotBeforeAwaken.maxHp, atk: newAtk, conditions: newConditions });
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
                AudioManager.playSFX('/assets/audio/conditions/遺??Revival).mp3');
                await wait(1000);
            }
        }

        // --- PHASE 4: SCATTERED ---
        if (isOnePairDance) {
            // Sequential hit loop already consumed all animation time
            await wait(200);
        }
        store.setGamePhase('SCATTERED');
        await wait(400);
        setBotAnimState('NONE');
        store.removePlayerCards(selectedIndices);
        store.setSpecialAttackMode('NONE');
        store.setAttackOrderIndices([]);

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

        // ?? 3B-9 媛곸꽦(AWAKENING) ?몃━嫄???????????????????????????????
        const freshBot3B9 = useGameStore.getState().bot;
        if (store.chapterNum === '3B' && stageNum === 9) {
            if (freshBot3B9.hp > 0 && freshBot3B9.hp <= freshBot3B9.maxHp * 0.4 && !freshBot3B9.conditions.has('Awakening')) {
                setMessage("媛곸꽦: 蹂댁뒪媛 湲곗슫???섏갼怨?紐⑤뱺 諛⑺빐瑜??⑥퀜?대ŉ ?붿슧 ?됲룷?댁쭛?덈떎!");
                playConditionSound('Awakening');
                triggerScreenEffect('flash-red');
                
                // v2.5.0: ?ъ슜???붽뎄?ы빆 - 湲곗〈 踰꾪봽(?쇳빐寃쎄컧, ?ъ깮 ?? 紐⑤몢 ?쒓굅
                const newBotConds = new Map<string, any>(); 
                // Awakening? 以묐났 諛쒕룞 諛⑹?瑜??꾪빐 ?덈줈 異붽?
                newBotConds.set('Awakening', { name: TRANSLATIONS.KR.CONDITIONS.AWAKENING.NAME, duration: 9999, elapsed: 0, data: {} });

                const awakenedBot = {
                    ...freshBot3B9,
                    hp: freshBot3B9.maxHp,
                    atk: freshBot3B9.atk + 20, // ?ъ슜???붽뎄?ы빆: ATK +20
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
            // 蹂댁뒪 遺??湲곕? (3A-10 HYDRA ??
            const revivalCond = freshBotEndCheck.conditions.get('Revival');
            if (revivalCond) {
                const limit = (revivalCond.data as any)?.limit ?? (revivalCond.data as any)?.count ?? 1;
                if (limit > 0) {
                    const rawPercent = (revivalCond.data as any)?.percent ?? 60;
                    const healPercent = rawPercent > 1 ? rawPercent / 100 : rawPercent;
                    const reviveHp = Math.floor(freshBotEndCheck.maxHp * healPercent);
                    setBotHp(reviveHp);
                    setMessage(t.CONDITIONS.REVIVAL.NAME + "!");
                    playConditionSound('Revival');
                    showDamageText('BOT', `+${reviveHp}`, '#2ecc71');
                    
                    const newConds = new Map(freshBotEndCheck.conditions);
                    const newCount = limit - 1;
                    const updated = { ...revivalCond, data: { ...((revivalCond.data as any) || {}), limit: newCount, count: newCount } };
                    if (newCount <= 0) newConds.delete('Revival');
                    else newConds.set('Revival', updated);
                    // Update HUD counter
                    useGameStore.getState().setHydraReviveRemaining(newCount);
                    
                    useGameStore.getState().setBot({ ...freshBotEndCheck, hp: reviveHp, conditions: newConds });
                    
                    await wait(1500);
                    
                    // "遺??吏곹썑 1??怨듦꺽 遺덇?"
                    setMessage("蹂댁뒪媛 ?됰룞???뚮났 以묒엯?덈떎...");
                    await wait(1000);
                    await proceedToEndTurn();
                    return; // ?밸━/遊뉙꽩 遺꾧린 ?ㅽ궢
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
            setMessage("?⑥갭湲? 蹂댁뒪媛 ?대쾲 ?댁뿉 怨듦꺽?섏? ?딆뒿?덈떎.");
            store.setHoldBreathInvulnerable3B(false); // ?뚮옒洹??댁젣
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

        // 3A-6 Cave Bear: Honey Yummy 轅??랬 (20% ?ㅽ궢)
        if (store.chapterNum === '3A' && stageNum === 6 && Math.random() < 0.20) {
            setMessage("轅 ??랬 以? (怨듦꺽 ?ㅽ궢 & 泥대젰 ?뚮났)");
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
                setMessage("특수 공격: 모래 폭풍을 준비중입니다!");
                await wait(1200);
                await proceedToEndTurn();
                return;
            } else if (cycleTurn === 2) {
                // Turn 3 of 3 (indices 2, 5, 8...): Special Attack
                setMessage("紐⑤옒 ??뭾 ?쇳빐瑜?諛쏆뒿?덈떎!");
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
                    setMessage("특수 공격: 부패 폭발을 준비중입니다!");
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



        // 3B-7: HOLD_BREATH(?⑥갭湲? - 蹂댁뒪 怨듦꺽 2???깃났 ???ㅼ쓬 ??100% 李⑤떒
        if (store.chapterNum === '3B' && stageNum === 7) {
            const holdBreathActive = store.holdBreathTurn3B === store.currentTurn;
            if (holdBreathActive) {
                setMessage("?⑥갭湲? 蹂댁뒪媛 怨듦꺽???꾩쟾??留됯퀬 ?됰룞???뚮났 以묒엯?덈떎...");
                triggerScreenEffect('flash-red');
                await wait(1000);
                await proceedToEndTurn();
                return;
            }
        }

        // ?????????? ?좉?(Swamping) ?뚰뵾 ?⑤꼸??怨꾩궛 ??????????????????????
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

        // 3B: ?좉?(Swamping) ?뚰뵾 ?⑤꼸???곸슜 (理쒖? 0%)
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

        // 3A Echo (硫붿븘由?蹂댁뒪 ?⑥떆釉? 怨듦꺽 ?잛닔 異붽? 濡쒖쭅 ?곸슜
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
                if (!(store.chapterNum === '2A' && stageNum === 6) && sfx) {
                    AudioManager.playSFX(sfx); // Actual attack impact sound
                }
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

            // Echo ?뱀닔?寃??ㅻ쾭?쇱씠??(異붽???留덉?留??寃⑹씪 寃쎌슦)
            if (hasEchoAdded && i === attackCount - 1) {
                finalDmg = echoDamage;
                setMessage("硫붿븘由?異붽? ?寃?");
                triggerScreenEffect('shake');
            }

            // 3A-9 Basilisk Petrify 湲곕?
            if (store.chapterNum === '3A' && stageNum === 9 && Math.random() < 0.40) {
                const pHand = store.playerHand;
                const petrifyTargets = pHand.map((c, idx) => c && !c.isPetrified ? idx : -1).filter(idx => idx !== -1);
                if (petrifyTargets.length > 0) {
                    const rndIdx = petrifyTargets[Math.floor(Math.random() * petrifyTargets.length)];
                    const newHand = [...pHand];
                    newHand[rndIdx] = { ...(newHand[rndIdx] as Card), isPetrified: true, petrifyDuration: 2 };
                    useGameStore.getState().setPlayerHand(newHand);
                    setMessage("移대뱶媛 ?앺솕?섏뿀?듬땲??");
                    playConditionSound('Paralyzing'); // ?앺솕 ?④낵??
                    showConditionGuideIfNew('Petrified');
                }
            }

            setPlayerHp(applyDamage(useGameStore.getState().player.hp, finalDmg));
            showDamageText('PLAYER', `-${finalDmg}`, '#e74c3c');
            triggerPlayerHitFx(finalDmg);

            // 3A-1: Biorhythm Acceleration (Gain Regeneration on boss damage)
            if (store.equippedAltarSkills.includes('3A-1') && finalDmg > 0) {
                if (!useGameStore.getState().player.conditions.has('Regenerating')) {
                    store.addPlayerCondition('Regenerating', 3, '', { amount: 10 });
                    setMessage("BIORHYTHM ACCELERATION!");
                    showConditionGuideIfNew('Regenerating');
                }
            }

            // 3B-7: HOLD_BREATH(?⑥갭湲? - 蹂댁뒪 怨듦꺽 ?깃났 ??移댁슫??(2.4.0)
            if (store.chapterNum === '3B' && stageNum === 7 && finalDmg > 0) {
                const hbCount = store.holdBreathCount3B + 1;
                if (hbCount >= 2) {
                    store.setHoldBreathTurn3B(store.currentTurn + 1);
                    store.setHoldBreathInvulnerable3B(true);
                    store.setHoldBreathCount3B(0);
                    setMessage("?⑥갭湲? 蹂댁뒪媛 怨듦꺽??硫덉텛怨??ㅼ쓬 ??臾댁쟻 ?곹깭媛 ?⑸땲??");
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
                // wait, user said "蹂댁뒪 怨듦꺽 ??.. 諛쒖깮 ?뺣쪧 40%". Does it mean it applies a status or just happens once?
                // "蹂몄씤?먭쾶??12?곕?吏... ?곕?吏 諛섎룞 ?곹깭?댁긽 諛쒖깮" 
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

            // 3A-2: HEMATOPHAGY (?≫삁 30%)
            if (store.chapterNum === '3A' && stageNum === 2 && finalDmg > 0) {
                const heal = Math.floor(finalDmg * 0.3);
                if (heal > 0) {
                    setBotHp(Math.min(currentBot.maxHp, currentBot.hp + heal));
                    showDamageText('BOT', `+${heal}`, '#2ecc71');
                    AudioManager.playSFX('/assets/audio/conditions/Regenerating.mp3');
                }
            }
            // 3A-4: POISON SPIDER (怨듦꺽 ??40% ?뺣쪧濡??좉꼍?깅㏏??遺??
            if (store.chapterNum === '3A' && stageNum === 4 && finalDmg > 0 && Math.random() < 0.4) {
                store.addPlayerCondition('Neurotoxicity', 3);
                playConditionSound('Neurotoxicity');
                setMessage(t.CONDITIONS.NEUROTOXICITY.NAME + "!");
                showConditionGuideIfNew('Neurotoxicity');
            }
            // 3A-9: 以묐났 ?앺솕 濡쒖쭅 ??젣 (怨듦꺽 ?곸쨷 ??利됱떆 40% 諛쒕룞???щ컮瑜??ъ뼇 ??Line 1273)
            // (湲곗〈 30% 異붽? 諛쒕룞 肄붾뱶 ?쒓굅??

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

        // 3A-8: ROLL BOULDER ???쇰컲 怨듦꺽 ?? 2?대쭏???뱀닔 怨듦꺽 (20 怨좎젙?쇳빐, 40% ?뚰뵾)
        if (store.chapterNum === '3A' && stageNum === 8 && (store.currentTurn % 2) === 1) {
            await wait(600);
            setMessage("諛붿쐞 援대━湲?");
            triggerScreenEffect('shake-heavy');
            await wait(400);
            
            if (Math.random() < 0.4) {
                setMessage(t.COMBAT.ATTACK_AVOIDED);
                showDamageText('PLAYER', t.COMBAT.ATTACK_AVOIDED, '#f39c12');
            } else {
                const freshPl = useGameStore.getState().player;
                setPlayerHp(Math.max(0, freshPl.hp - 20));
                showDamageText('PLAYER', `-20`, '#e74c3c');
                
                // Check player survival after boulder
                const freshPl2 = useGameStore.getState().player;
                if (freshPl2.hp <= 0) {
                    const survived = await checkPlayerSurvival();
                    if (survived) {
                        await wait(1000);
                        await proceedToEndTurn();
                        return;
                    }
                }
            }
            await wait(600);
        }

        // --- Status Effects (v2.3.2: Chapter 2A, 3A, 2B, 3B Adjustments) ---
        applyBotStatusEffects({
            store, stageNum, t, setMessage, setPlayerHp, showDamageText,
            showConditionGuideIfNew, playConditionSound, triggerScreenEffect,
            applyBotStageMechanics
        });

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
                setMessage("珥덇린?섏떇: ?몃뱶 珥덇린??諛??⑦꽩 遺뺢눼!");
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
                setMessage("以꾧린?명룷: 蹂댁뒪媛 湲됯꺽???깆옣?⑸땲??");
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
                setMessage(store.language === 'KR' ? '?쒖뒪??怨쇰???' : 'SYSTEM OVERLOAD!');
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
                        let healAmt = Math.floor(currentP.maxHp * 0.05);
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

                // 3B-2: Acclimatization (Regen on status damage)
                if (store.equippedAltarSkills.includes('3B-2')) {
                    if (!playerConditions.has('Regenerating')) {
                        let healAmt = Math.floor(currentP.maxHp * 0.05);
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

                // 3B-2: Acclimatization (Regen on status damage)
                if (store.equippedAltarSkills.includes('3B-2')) {
                    if (!playerConditions.has('Regenerating')) {
                        let healAmt = Math.floor(freshP.maxHp * 0.05);
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
                setBotHp(Math.max(0, useGameStore.getState().bot.hp - dmg)); // Stale bot.hp -> 理쒖떊 ?곹깭 議고쉶
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
                    let playerHeal = Math.floor(heal * 0.8);
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

        // 3A-7: BRITTLE ?ㅽ깮 留???利앷? (蹂댁뒪 ?섏씠利?醫낅즺 ?쒖젏)
        if (botConditions.has('Brittle')) {
            const brittCond = botConditions.get('Brittle') as any;
            const currentDR = botConditions.get('Damage Reducing') as any;
            
            const currentStack = brittCond.data?.stackCount || 0;
            const nextStack = currentStack + 1;
            
            // Damage Reducing ?쇱꽱??10 ?곸듅 (理쒕? 50% ?곹븳)
            if (currentDR) {
                const currentPercent = currentDR.data?.percent || 10;
                const newPercent = Math.min(currentPercent + 10, 50); // 50% cap
                botConditions.set('Damage Reducing', {
                    ...currentDR,
                    duration: 999,
                    data: { ...currentDR.data, percent: newPercent }
                });
            }
            
            // 5???꾩쟻 ??寃쎄컧 10%濡?珥덇린??+ ?ㅽ깮 由ъ뀑
            if (nextStack >= 5) {
                if (currentDR) {
                    botConditions.set('Damage Reducing', {
                        ...currentDR,
                        duration: 999,
                        data: { ...currentDR.data, percent: 10 }
                    });
                }
                botConditions.set('Brittle', {
                    ...brittCond,
                    data: { ...brittCond.data, stackCount: 0 }
                });
                setMessage("痍⑥꽦 ?뚭눼! (寃쎄컧 珥덇린??");
            } else {
                botConditions.set('Brittle', {
                    ...brittCond,
                    data: { ...brittCond.data, stackCount: nextStack }
                });
            }
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
            setMessage("?앺솕??移대뱶??援먯껜?????놁뒿?덈떎!");
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
            setMessage(store.language === 'KR' ? '?뚰렪?뚯닔!' : 'FRAGMENTS RECOVERY!');
            AudioManager.playSFX('/assets/audio/player/shuffling.mp3');
        }

        const totalDraws = (p.drawsRemaining ?? 0) + bonusDraws;

        if (totalDraws > 0) {
            swapCards(selectedIndices);
            const newDraws = Math.max(0, (p.drawsRemaining ?? 0) - 1);
            useGameStore.getState().setDrawsRemaining(newDraws);
            setMessage(t.COMBAT.CARDS_SWAPPED);

            // 3B-3: DEATHROLL(?곗뒪濡? - ?뚮젅?댁뼱 SWAP ??利됱떆 蹂댁뒪 1??怨듦꺽
            if (store.chapterNum === '3B' && stageNum === 3) {
                setMessage("?곗뒪濡? SWAP??諛섏쓳?섏뿬 蹂댁뒪媛 利됱떆 怨듦꺽?⑸땲??");
                triggerScreenEffect('shake');
                await wait(1000);
                // SWAP ?④퀎 醫낅즺 ??蹂댁뒪 ???ㅽ뻾
                await executeBotTurn();
                return; 
            }

            // 4A-3: Probability Distortion (25% chance for +1 extra swap)
            if (store.equippedAltarSkills.includes('4A-3') && Math.random() < 0.25) {
                useGameStore.getState().setDrawsRemaining(newDraws + 1);
                setMessage(store.language === 'KR' ? '?뺣쪧?쒓끝 +1' : 'Probability Distortion +1');
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
            // 1. ?곹깭 ?뺣━ (Heal + Clear Conditions)
            store.clearPlayerConditions();
            if (store.chapterNum === '3A' && store.stageNum === 10) {
                store.resetHydraFlushSuits(); // ?덈뱶?쇱슜 ?꾩듅 移댁슫??由ъ뀑
            }

            const currentHp = store.player.hp;
            let maxHp = store.player.maxHp;
            const isFinalBoss = stageNum === 10 || stageNum === 11;

            // v2.0.0.14/16: Stage 6 Reward (Chapter 1 Only: difficulty-based MAX HP bonus + FULL HEAL)
            if (store.chapterNum === '1' && stageNum === 6) {
                const bonus = Math.floor(maxHp * config.stage6MaxHpBonus);
                maxHp += bonus;
                store.setHasStage6Bonus(true);
                store.setPlayerMaxHp(maxHp);
                setPlayerHp(maxHp); // FULL HEAL per user request
            } else if (!isFinalBoss) {
                // Stage Clear Heal: 梨뺥꽣蹂?湲곕낯 ?뚮났??(NORMAL 湲곗?)
                // Ch1=40, Ch2=30, Ch3=20 (EASY 횞1.5, HARD/HELL 횞0.8)
                const chapterHealBase: Record<string, number> = {
                    '1': 40, '2A': 30, '2B': 30, '3A': 20, '3B': 20
                };
                const diffMultiplier = store.difficulty === Difficulty.EASY ? 1.5
                    : (store.difficulty === Difficulty.HARD || store.difficulty === Difficulty.HELL) ? 0.8
                    : 1.0;
                const baseHeal = chapterHealBase[store.chapterNum] ?? 30;
                const healAmount = Math.floor(baseHeal * diffMultiplier);
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

            // 梨뺥꽣 留덉?留?蹂댁뒪 ?대━??蹂댁긽: +200 HP (紐⑤뱺 梨뺥꽣 怨듯넻, ?ㅼ쓬 梨뺥꽣 ?곕룞)
            if (isFinalBoss) {
                const freshPlayer = useGameStore.getState().player;
                const transitionHeal = 200;
                setPlayerHp(Math.min(freshPlayer.maxHp, freshPlayer.hp + transitionHeal));
                showDamageText('PLAYER', `+${transitionHeal}`, '#2ecc71');
                setMessage(t.COMBAT.VICTORY + ` (+${transitionHeal} HP)`);
            }

            // 2. Trophy Check ??stage trophy in memory (NOT saved to localStorage yet)
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
                        // ??? Guide Popup: Loot & Altar System (first trophy only) ??
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
                '2B': isKR ? '깊은 숲' : 'Deep Forest',
                '3A': isKR ? '동굴' : 'Cave',
                '3B': isKR ? '늪지대' : 'Swamp'
            };
            const areaName = areaNames[store.chapterNum] || '';
            victoryMsg = t.COMBAT.AREA_CLEARED.replace('{area}', areaName);
        } else if (stageNum > 10) {
            victoryMsg = t.COMBAT.NODE_CLEARED;
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
        if ((store.chapterNum === '2A' || store.chapterNum === '2B') && stageNum === 9 && store.specialQualify && store.ch2SpecialQualify) {
            let hasSpecialTrophy = false;
            try {
                const { AltarManager } = await import('../utils/AltarManager');
                const trophyId = store.chapterNum === '2A' ? 'TR_2A_SP' : 'TR_2B_SP';
                hasSpecialTrophy = AltarManager.hasTrophy(trophyId, store.difficulty);
            } catch (e) {
                console.error("Failed to check special trophy", e);
            }

            if (!hasSpecialTrophy) {
                targetStage = 11; // Special Stage
            }
        }

        // v2.3.8: Fix chapter transition for Chapter 1 (Standard nextStage is 11, which failed the !== 11 check)
        // v2.4.0: Simplified check to just stageNum >= 10. If player clears stage 10 or 11, the game ends.
        // v2.4.2: Revised Victory & Difficulty Unlock Logic with Popup
        if (stageNum >= 10) {
            if (store.chapterNum === '1') {
                if (store.difficulty === Difficulty.EASY) {
                    // EASY: Chapter 1 only ??unlock NORMAL, show congratulations popup
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
                // (EASY never reaches Chapter 3 ??it ends at Chapter 1)
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

        // ??? Guide Popup: Chapter Intro (Stage 1 only) ???????????????????
        const freshStore = useGameStore.getState();
        if (freshStore.stageNum === 1 && !freshStore.isTutorial) {
            const introData = CHAPTER_INTROS[freshStore.chapterNum];
            if (introData && !hasSeenGuide(introData.key)) {
                await showGuidePopup(introData);
            }
        }

        // ??? Guide Popup: Gimmick Guide ??????????????????????????????????
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
                    setMessage("?곗궛 ?ㅻ쪟 媛먯?! 移대뱶 ?⑦꽩??遺뺢눼?섏뿀?듬땲??");
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

        // 1. ?곹깭 ?뺣━
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

    // ??? Guide Popup Helper ??????????????????????????????????????????
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

    // ??? Guide Popup: Condition Guide (on first status effect) ???????
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
        fxClass,
        onDamageTextComplete,
        runCombatSequence,
        executeBotTurn,
        executeCardSwap,
        startInitialDraw
    };
};
