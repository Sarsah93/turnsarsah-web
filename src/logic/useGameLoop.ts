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
    } = useGameStore();

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
    const showDamageText = (target: 'PLAYER' | 'BOT', text: string, color: string) => {
        const id = Date.now() + Math.random();
        const x = target === 'BOT' ? window.innerWidth * 0.75 : window.innerWidth * 0.25;
        const y = target === 'BOT' ? 120 : 550;
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
            case 'Bleeding': file = 'Bleeding.mp3'; break;
            case 'Heavy Bleeding': file = 'Heavy Bleeding.mp3'; break;
            case 'Poisoning': file = 'poisoning.mp3'; break;
            case 'Regenerating': file = 'Regenerating.mp3'; break;
            case 'Paralyzing': file = 'paralyzing.mp3'; break;
            case 'Debilitating': file = 'Debilitating.mp3'; break; // Fixed name logic if needed
            case 'Avoiding': file = 'avoiding.mp3'; break;
            case 'Damage recoiling': file = '데미지 반동(Damage recoiling).mp3'; break;
            case 'Berserker': file = '버서커(Berserker).mp3'; break;
            case 'Revival': file = '부활(Revival).mp3'; break;
            case 'Invincible spirit': file = '불굴의 의지(Invincible Spirit).mp3'; break;
            case 'Adrenaline secretion': file = '아드레날린 분비(Adrenaline secretion).mp3'; break;
            case 'Neurotoxicity': file = '신경성 맹독(Neurotoxicity).mp3'; break;
            case 'Dehydration': file = '탈수(Dehydration).mp3'; break;
            case 'Triple Attack':
                AudioManager.playSFX('/assets/audio/combat/chapter 2a desert/06_desert vultures_2.mp3');
                return;
            default: return;
        }
        // Debilitating doesn't have .mp3 in one request but has in another. User said 'Debilitating' for 4.4. 
        // I will assume it follows the pattern unless specified otherwise.
        const path = condition === 'Debilitating' ? `/assets/audio/conditions/Debilitating.mp3` : `/assets/audio/conditions/${file}`;
        AudioManager.playSFX(path);
    };

    const getBossAttackSFX = (chapter: string, stage: number) => {
        if (chapter === '2A') {
            if (stage === 2) return '/assets/audio/combat/chapter 2a desert/02_sand snake.mp3';
            if (stage === 3) return '/assets/audio/combat/chapter 2a desert/03_chimera snake human.mp3';
            if (stage === 6) return '/assets/audio/combat/chapter 2a desert/06_desert vultures.wav';
            return ''; // Other stages might use default or no sound for now
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
        if (store.chapterNum !== '1') return; // Skip in Chapter 2 (Vanilla)

        const config = DIFFICULTY_CONFIGS[store.difficulty];
        const rand = Math.random();
        let conditionApplied = '';

        // Difficulty-based probabilities for status effects (Skip in tutorial)
        if (!store.isTutorial) {
            if ([1, 2, 3, 4].includes(stageNum) && rand < config.bleedProbStage1to4) {
                conditionApplied = 'Bleeding';
            } else if (stageNum === 5 && rand < config.poisonProbStage5) {
                conditionApplied = 'Poisoning';
            } else if (stageNum === 7 && rand < config.paralyzeProbStage7) {
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
        if (gameState !== GameState.BATTLE && gameState !== GameState.TUTORIAL) return;

        // 1. 마비 체크 (Paralyzing)
        if (player.conditions.has('Paralyzing')) {
            setMessage(t.COMBAT.PARALYZED);
            playConditionSound('Paralyzing');
            triggerScreenEffect('flash-red');
            // Wait a bit before bot turn starts
            await new Promise(r => setTimeout(r, 1200));
            await executeBotTurn();
            return;
        }

        const store = useGameStore.getState();
        const currentPlayerHand = store.playerHand;

        if (selectedIndices.length === 0) {
            setMessage(t.COMBAT.SELECT_CARDS);
            triggerScreenEffect('shake-small');
            return;
        }

        const selectedCards = selectedIndices.map(idx => currentPlayerHand[idx]).filter(Boolean) as Card[];

        // 2. 데미지 계산
        const result = calculatePlayerDamage(
            selectedCards,
            player.conditions.has('Debilitating'),
            store.bannedHand,
            store.bannedRanks,
            store.bannedSuit
        );

        if (result.baseDamage === 0 && result.handType !== 'High Card') {
            setMessage(`${t.COMBAT.BANNED_HAND}${result.handType}`);
            triggerScreenEffect('shake');
            return;
        }

        // v2.0.0.14: Damage Reduction - Unified via Conditions
        let damage = Math.floor(result.finalDamage);

        // v2.3.2: 2A Hand Nullification Rules (족보 보너스만 0, 카드 숫자 합산은 유지)
        if (store.chapterNum === '2A') {
            const nullifiedHands: Record<number, string> = {
                2: 'One Pair', 3: 'Two Pair', 6: 'Three of a Kind',
                7: 'Full House', 8: 'Straight', 9: 'Flush'
            };
            const nullifiedHand = nullifiedHands[stageNum];
            if (nullifiedHand && result.handType === nullifiedHand) {
                const handBonuses: Record<string, number> = {
                    'One Pair': 10, 'Two Pair': 20, 'Three of a Kind': 50,
                    'Straight': 75, 'Flush': 100, 'Full House': 125,
                };
                const bonus = handBonuses[result.handType] || 0;
                // baseDamage = handBonus + sumValues, so remove handBonus then apply multiplier
                damage = Math.max(0, Math.floor((result.baseDamage - bonus) * result.multiplier));
            }
        }

        // v2.3.2: Neurotoxicity Accuracy Penalty (30% Miss)
        if (player.conditions.has('Neurotoxicity') && Math.random() < 0.3) {
            damage = 0;
            setMessage(t.COMBAT.NEURO_MISSED);
        }

        // v2.3.2: 2A-4 No damage under 50
        if (store.chapterNum === '2A' && stageNum === 4 && damage < 50) {
            damage = 0;
            setMessage(t.COMBAT.NO_DMG_UNDER_50_MSG);
        }

        const reductionCond = bot.conditions.get('Damage Reducing');
        if (reductionCond) {
            const percent = (reductionCond.data as any)?.percent || 0;
            damage = Math.floor(damage * (1 - percent / 100));
        }

        // v2.3.0: Damage Recoiling (Player attacking)
        const recoilingCond = player.conditions.get('Damage recoiling');
        let recoilTaken = 0;
        if (recoilingCond && Math.random() < 0.3) { // 30% chance
            const bonusDmg = 20;
            const recoilDmg = 10;
            damage += bonusDmg;
            recoilTaken = recoilDmg;
            setMessage(t.CONDITIONS.DAMAGE_RECOILING.NAME + "!");
        }

        // v2.3.0: Berserker (Player attacking)
        const berserkerCond = player.conditions.get('Berserker');
        let lifesteal = 0;
        if (berserkerCond && player.hp <= player.maxHp * 0.3) {
            const atkBonus = (berserkerCond.data as any)?.atkBonus || 20;
            damage += atkBonus;
            lifesteal = Math.max(1, Math.floor(damage * 0.1));
        }

        // v2.3.2: Puzzle Bonus (Sphinx)
        if (store.chapterNum === '2A' && stageNum === 10 && store.puzzleTarget > 0) {
            const sumOfSelected = selectedCards.reduce((acc, c) => acc + (c.isJoker ? 14 : (RANK_VALUES[c.rank!] || 0)), 0);
            if (sumOfSelected === store.puzzleTarget) {
                damage = Math.floor(damage * 1.5);
                setMessage(t.COMBAT.PUZZLE_SUCCESS);
                AudioManager.playSFX('/assets/audio/player/shuffling.mp3'); // Temporary success sound
            }
        }

        const isCrit = result.isCritical;
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
        // Loop charge sound?
        await new Promise(r => setTimeout(r, 800));

        // --- PHASE 3: THRUSTING ---
        // Made 1.5x faster: reduced timing
        store.setGamePhase('THRUSTING');
        // Removed 03_spear_thrust.mp3 per user request - only whipping.mp3 should play
        await new Promise(r => setTimeout(r, 67)); // 1.5x faster (100ms -> 67ms)

        // Whipping SFX (Thrust End + 0.13s) - faster
        await new Promise(r => setTimeout(r, 133)); // 1.5x faster (200ms -> 133ms)
        AudioManager.playSFX('/assets/audio/player/whipping.mp3');

        // Boss Shake (Impact + 0.2s)
        await new Promise(r => setTimeout(r, 100));
        triggerScreenEffect('shake');
        setBotAnimState('HIT');

        // Damage Popup
        showDamageText('BOT', `-${damage}`, isCrit ? '#c0392b' : '#ecf0f1');
        const wildSuffix = hasWild ? t.UI.WILD : '';
        setMessage(isCrit ? `${t.COMBAT.CRITICAL_HIT} ${result.handType}${wildSuffix}` : `${result.handType}${wildSuffix}`);

        // HP Reduction (0.1s after Popup/Shake)
        await new Promise(r => setTimeout(r, 1000)); // slightly longer wait for effects
        let newBotHp = Math.max(0, bot.hp - damage);

        // v2.3.0: Berserker Lifesteal
        if (lifesteal > 0) {
            const freshP = useGameStore.getState().player;
            setPlayerHp(Math.min(freshP.maxHp, freshP.hp + lifesteal));
            showDamageText('PLAYER', `+${lifesteal}`, '#2ecc71');
        }

        // v2.3.0: Recoil Damage
        if (recoilTaken > 0) {
            const freshP = useGameStore.getState().player;
            const hpAfterRecoil = Math.max(0, freshP.hp - recoilTaken);
            setPlayerHp(hpAfterRecoil);
            showDamageText('PLAYER', `-${recoilTaken}`, '#e74c3c');
            if (hpAfterRecoil <= 0) {
                // Check for revival/invincible if recoil killed player
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
        } else {
            setBotHp(newBotHp);
        }

        // v2.3.2: 2A-1 Mummy Revive
        if (newBotHp <= 0 && store.chapterNum === '2A' && stageNum === 1) {
            if (Math.random() < 0.5) {
                newBotHp = Math.floor(bot.maxHp * 0.5);
                setBotHp(newBotHp);
                setMessage(t.COMBAT.REVIVE_MSG);
                AudioManager.playSFX('/assets/audio/conditions/부활(Revival).mp3');
                await new Promise(r => setTimeout(r, 1000));
            }
        }


        // --- PHASE 5: SCATTERED (0.4s) ---
        store.setGamePhase('SCATTERED');
        await new Promise(r => setTimeout(r, 400));

        setBotAnimState('NONE');
        store.setGamePhase('IDLE');

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
    };

    const executeBotTurn = async () => {
        const store = useGameStore.getState();
        const currentBot = store.bot;
        const currentPlayer = store.player;
        const damage = calculateBotDamage(currentBot.atk);

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

        // v2.1.2: Unified Evasion Check (Passive Skill)
        const config = DIFFICULTY_CONFIGS[store.difficulty];
        const avoidCond = currentPlayer.conditions.get('Avoiding');
        const finalAvoidChance = avoidCond ? ((avoidCond.data as any)?.chance ?? config.avoidChance) : config.avoidChance;

        const isAvoided = !isTutorial && finalAvoidChance > 0 && Math.random() < finalAvoidChance;

        if (isAvoided) {
            setMessage(t.COMBAT.ATTACK_AVOIDED);
            playConditionSound('Avoiding');
            triggerScreenEffect('flash-red');
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
        } else if (store.chapterNum === '2A' && stageNum === 6) {
            // Fallback logic
            if (Math.random() < 0.5) attackCount = Math.random() < 0.3 ? 3 : 2;
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
                    const targetIdx = indices[Math.floor(Math.random() * indices.length)];
                    store.swapCards([targetIdx]);
                    setMessage(t.COMBAT.FORCE_SWAP_MSG);
                    await new Promise(r => setTimeout(r, 500));
                }
            }

            await new Promise(r => setTimeout(r, 200));
            triggerScreenEffect('shake-heavy');
            setPlayerAnimState('HIT');

            // Apply Damage
            setPlayerHp(applyDamage(useGameStore.getState().player.hp, damage));
            showDamageText('PLAYER', `-${damage}`, '#e74c3c');

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
            if ([1, 2, 3, 5, 6, 8, 9, 10].includes(stageNum)) {
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
                if (Math.random() < config.neuroProbCh2A) {
                    store.addPlayerCondition('Neurotoxicity', 3);
                }
            }
            if (stageNum === 7) {
                // 50% fixed or config-based? User said 50%.
                if (Math.random() < 0.5) {
                    store.addPlayerCondition('Paralyzing', 2);
                }
            }
        } else if (store.chapterNum === '1') {
            // (existing Chapter 1 status logic would follow here)
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

        store.applyStageRules(store.chapterNum, stageNum, nextTurn);
        await refillHandSequentially();
    };

    const resolveStatusEffects = async () => {
        const store = useGameStore.getState();
        const playerConditions = new Map(store.player.conditions);
        const botConditions = new Map(store.bot.conditions);
        const toRemovePlayer: string[] = [];
        const toRemoveBot: string[] = [];

        // Debuffs that can be randomly removed (15% chance per turn)
        const removableDebuffs = ['Bleeding', 'Heavy Bleeding', 'Poisoning', 'Paralyzing', 'Debilitating'];

        // Player Phase
        for (const [condName, condData] of Array.from(playerConditions.entries())) {
            const cond = condName as string;
            const data = condData as any;
            const currentP = useGameStore.getState().player;

            // 15% chance to remove debuff early
            if (removableDebuffs.includes(cond) && Math.random() < 0.15) {
                toRemovePlayer.push(cond);
                const condKey = cond.toUpperCase().replace(/\s+/g, '_');
                const condNameLine = (t.CONDITIONS as any)[condKey]?.NAME || cond;
                setMessage(t.COMBAT.PLAYER_CLEARED.replace('{cond}', condNameLine.toUpperCase()));
                continue;
            }

            if (cond === 'Dehydration') continue; // Handle Dehydration last

            if (['Poisoning', 'Bleeding', 'Heavy Bleeding'].includes(cond)) {
                const toastMsg = cond === 'Poisoning' ? t.COMBAT.PLAYER_POISONING : (cond === 'Heavy Bleeding' ? t.COMBAT.PLAYER_HEAVY_BLEEDING : t.COMBAT.PLAYER_BLEEDING);
                setMessage(toastMsg);
                playConditionSound(cond);
                const amount = data.data?.amount || (cond === 'Heavy Bleeding' ? 20 : 10);
                const freshHP = useGameStore.getState().player.hp;
                setPlayerHp(Math.max(0, freshHP - amount));
                showDamageText('PLAYER', `-${amount}`, '#e74c3c');
                await new Promise(r => setTimeout(r, 800));
            } else if (cond === 'Regenerating') {
                setMessage(t.COMBAT.PLAYER_REGEN);
                playConditionSound('Regenerating');
                const heal = 10;
                setPlayerHp(Math.min(currentP.maxHp, currentP.hp + heal));
                showDamageText('PLAYER', `+${heal}`, '#2ecc71');
                await new Promise(r => setTimeout(r, 800));
            } else if (cond === 'Neurotoxicity') {
                const dmg = 15;
                const freshHP = useGameStore.getState().player.hp;
                setPlayerHp(Math.max(0, freshHP - dmg));
                showDamageText('PLAYER', `-${dmg}`, '#e74c3c');
                playConditionSound('Neurotoxicity');

                // v2.3.2: Once-per-duration 20% Paralysis Check
                if (!data.data?.paralyzeTriggered && Math.random() < 0.2) {
                    data.data = { ...data.data, paralyzeTriggered: true };
                    // Apply 1-turn paralyze
                    // Note: Paralyze is usually duration 2 (1 turn of effect + 1 turn of clearing). 
                    // To follow "immediate removal after 1 turn", we add it with duration 2.
                    useGameStore.getState().addPlayerCondition('Paralyzing', 2);
                    setMessage(t.COMBAT.PARALYZED);
                }

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
                const regenPercent = (data.data as any)?.percent || 0.05;
                const heal = Math.floor(latestBot.maxHp * regenPercent);
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
        if (selectedIndices.length === 0) {
            setMessage(t.COMBAT.SELECT_CARDS);
            triggerScreenEffect('shake-small');
            return;
        }
        if (selectedIndices.length > 2) {
            setMessage(t.COMBAT.MAX_SWAP);
            triggerScreenEffect('shake-small');
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

        // 2. Victory State & Sound
        setGameState(GameState.VICTORY);
        const bonusPercent = Math.floor(config.stage6MaxHpBonus * 100);
        const victoryMsg = (store.chapterNum === '1' && stageNum === 6)
            ? t.COMBAT.STAGE6_BONUS.replace('{percent}', bonusPercent.toString())
            : t.COMBAT.VICTORY;
        setMessage(victoryMsg);
        AudioManager.playSFX('/assets/audio/stages/victory/victory.mp3');

        // 3. Wait for victory.mp3 (approx 5s)
        await new Promise(r => setTimeout(r, 5000));

        // 4. Transition to next stage or unlock difficulty on final stage clear
        const nextStage = stageNum + 1;
        if (nextStage > 10) {
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
                initGame(store.chapterNum, nextStage);
                setGameState(GameState.BATTLE);
                startInitialDraw();
            });
        }
    };

    const startInitialDraw = async () => {
        // v2.0.0.21: Skip for tutorial if hand is already pre-set to avoid overwriting guaranteed cards
        if (isTutorial && playerHand.some(c => c !== null)) return;

        // v2.0.0.10: Pre-fill with null to maintain slot positions, then refill.
        setPlayerHand(new Array(8).fill(null));
        await refillHandSequentially(1500);
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
