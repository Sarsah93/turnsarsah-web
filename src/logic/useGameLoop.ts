import { useState, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { AudioManager } from '../utils/AudioManager';
import { calculatePlayerDamage, calculateBotDamage } from './damageCalculation';
import { Card } from '../types/Card';
import { GameState } from '../constants/gameConfig';

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
        triggerTransition
    } = useGameStore();

    const [damageTexts, setDamageTexts] = useState<DamageTextData[]>([]);
    const [screenEffect, setScreenEffect] = useState<string>('');

    // v2.0.0.12: Auto-clear generic messages after 2.5s
    useEffect(() => {
        if (message && message !== 'VICTORY!' && message !== 'DEFEAT...') {
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
            default: return;
        }
        // Debilitating doesn't have .mp3 in one request but has in another. User said 'Debilitating' for 4.4. 
        // I will assume it follows the pattern unless specified otherwise.
        const path = condition === 'Debilitating' ? `/assets/audio/conditions/Debilitating.mp3` : `/assets/audio/conditions/${file}`;
        AudioManager.playSFX(path);
    };

    const getBossAttackSFX = (stage: number) => {
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
        return `/assets/audio/combat/${file}`;
    };

    const applyBotStageMechanics = () => {
        const rand = Math.random();
        let conditionApplied = '';

        // v2.0.0.14: Standardized Bleeding (30%, 4 turns) for stages 1-4, 7
        if ([1, 2, 3, 4, 7].includes(stageNum) && rand < 0.3) {
            conditionApplied = 'Bleeding';
        }
        else if (stageNum === 5 && rand < 0.4) {
            conditionApplied = 'Poisoning';
        }
        else if (stageNum === 8 && rand < 0.2) {
            conditionApplied = 'Paralyzing';
        }

        if (conditionApplied) {
            let duration = 3;
            if (conditionApplied === 'Bleeding') duration = 4;
            if (conditionApplied === 'Poisoning') duration = 4;
            if (conditionApplied === 'Paralyzing') duration = 2;

            addPlayerCondition(conditionApplied, duration);
            playConditionSound(conditionApplied);
            setMessage(`${conditionApplied.toUpperCase()}!`);
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
                const [newCard] = store.deck.draw(1);
                if (newCard) {
                    const updatedHand = [...useGameStore.getState().playerHand];
                    updatedHand[nullIdx] = newCard;
                    setPlayerHand(updatedHand);
                    await new Promise(r => setTimeout(r, totalDuration / targetCount));
                }
            } else if (currentHand.length < targetCount) {
                // Case 2: Append new card (initial draw or after some logic?)
                const [newCard] = store.deck.draw(1);
                if (newCard) {
                    setPlayerHand([...useGameStore.getState().playerHand, newCard]);
                    await new Promise(r => setTimeout(r, totalDuration / targetCount));
                }
            } else {
                // Hand is full and no nulls
                break;
            }
        }
    };

    const executePlayerAttack = async (selectedIndices: number[]) => {
        if (gameState !== GameState.BATTLE) return;

        // 1. 마비 체크 (Paralyzing)
        if (player.conditions.has('Paralyzing')) {
            setMessage("PARALYZED! CANNOT ATTACK!");
            playConditionSound('Paralyzing');
            triggerScreenEffect('flash-red');
            await new Promise(r => setTimeout(r, 1000));
            await executeBotTurn();
            return;
        }

        const store = useGameStore.getState();
        const currentPlayerHand = store.playerHand;

        if (selectedIndices.length === 0) {
            setMessage("SELECT CARDS!");
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
            setMessage(`BANNED HAND: ${result.handType}`);
            triggerScreenEffect('shake');
            return;
        }

        // v2.0.0.14: Damage Reduction
        let finalReduction = 0;
        if (stageNum === 8 || stageNum === 9) finalReduction = 10;
        else if (stageNum === 10) finalReduction = 15;

        let damage = Math.floor(result.finalDamage);
        if (finalReduction > 0) damage = Math.floor(damage * (1 - finalReduction / 100));

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
        const wildSuffix = hasWild ? ' (WILD)' : '';
        setMessage(isCrit ? `CRITICAL HIT! ${result.handType}${wildSuffix}` : `${result.handType}${wildSuffix}`);

        // HP Reduction (0.1s after Popup/Shake)
        await new Promise(r => setTimeout(r, 100));
        const newBotHp = Math.max(0, bot.hp - damage);
        setBotHp(newBotHp);

        // --- PHASE 5: SCATTERED (0.4s) ---
        store.setGamePhase('SCATTERED');
        await new Promise(r => setTimeout(r, 400));

        setBotAnimState('NONE');
        store.setGamePhase('IDLE');

        // v2.0.0.16: Remove cards only AFTER animation ends
        store.removePlayerCards(selectedIndices);

        // Regen logic
        if ((stageNum === 8 || stageNum === 10) && newBotHp < bot.maxHp && !bot.conditions.has('Regenerating')) {
            store.addBotCondition('Regenerating', 3, 'BOSS CONSTANT REGEN');
            playConditionSound('Regenerating');
        }
        if (stageNum === 6 && newBotHp <= bot.maxHp * 0.5 && !bot.conditions.has('Regenerating')) {
            store.addBotCondition('Regenerating', 3, 'GOLDEN REGEN');
            playConditionSound('Regenerating');
        }

        if (newBotHp <= 0) {
            await handleVictory();
        } else {
            await executeBotTurn();
        }
    };

    const executeBotTurn = async () => {
        const store = useGameStore.getState();
        const damage = calculateBotDamage(bot.atk);

        await new Promise(r => setTimeout(r, 1500));

        if (stageNum === 8 && store.currentTurn % 2 === 0) {
            setMessage("BOSS SKIPPED ATTACKING");
            AudioManager.playSFX('/assets/audio/combat/06_swing_ weapon.mp3');
            await new Promise(r => setTimeout(r, 1000));
            await proceedToEndTurn();
            return;
        }

        // Dodge Check (5%)
        if (Math.random() < 0.05) {
            setMessage("ATTACK AVOIDED!");
            playConditionSound('Avoiding');
            triggerScreenEffect('flash-red');
            await new Promise(r => setTimeout(r, 1000));
            await proceedToEndTurn();
            return;
        }

        setMessage(`${bot.name} ATTACKS!`);
        setBotAnimState('ATTACK');
        setTimeout(() => AudioManager.playSFX(getBossAttackSFX(stageNum)), 200);

        await new Promise(r => setTimeout(r, 200));
        triggerScreenEffect('shake-heavy');
        setPlayerAnimState('HIT');

        const newPlayerHp = Math.max(0, player.hp - damage);
        showDamageText('PLAYER', `-${damage}`, '#e74c3c');
        applyBotStageMechanics();

        await new Promise(r => setTimeout(r, 300));
        setPlayerHp(newPlayerHp);
        setBotAnimState('NONE');
        setPlayerAnimState('NONE');

        if (newPlayerHp <= 0) {
            await handleDefeat();
        } else {
            await proceedToEndTurn();
        }
    };

    const proceedToEndTurn = async () => {
        await resolveStatusEffects();
        const store = useGameStore.getState();
        const nextTurn = store.currentTurn + 1;
        store.setCurrentTurn(nextTurn);
        store.applyStageRules(stageNum, nextTurn);
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
        for (const [cond, data] of Array.from(playerConditions.entries())) {
            // 15% chance to remove debuff early
            if (removableDebuffs.includes(cond) && Math.random() < 0.15) {
                toRemovePlayer.push(cond);
                setMessage(`${cond.toUpperCase()} CLEARED!`);
                continue;
            }

            if (['Poisoning', 'Bleeding', 'Heavy Bleeding'].includes(cond)) {
                playConditionSound(cond);
                const dmg = cond === 'Heavy Bleeding' ? 15 : 5;
                setPlayerHp(Math.max(0, player.hp - dmg));
                showDamageText('PLAYER', `-${dmg}`, '#e74c3c');
                await new Promise(r => setTimeout(r, 800));
            }

            // Increment elapsed
            data.elapsed += 1;

            // Check for expiry (duration < 999 means not permanent)
            if (data.duration < 999 && data.elapsed >= data.duration) {
                toRemovePlayer.push(cond);
            }
        }

        if (playerConditions.has('Regenerating')) {
            playConditionSound('Regenerating');
            const heal = 10;
            setPlayerHp(Math.min(player.maxHp, player.hp + heal));
            showDamageText('PLAYER', `+${heal}`, '#2ecc71');
            await new Promise(r => setTimeout(r, 800));
        }

        // Remove expired player conditions
        toRemovePlayer.forEach(name => playerConditions.delete(name));
        store.setPlayer({ ...store.player, conditions: playerConditions });

        // 0.5s pause between phases
        await new Promise(r => setTimeout(r, 500));

        // Boss Phase
        for (const [cond, data] of Array.from(botConditions.entries())) {
            if (['Poisoning', 'Bleeding', 'Heavy Bleeding'].includes(cond)) {
                playConditionSound(cond);
                const dmg = 10;
                setBotHp(Math.max(0, bot.hp - dmg));
                showDamageText('BOT', `-${dmg}`, '#c0392b');
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
            const cond = botConditions.get('Regenerating')!;
            if (cond.duration - cond.elapsed <= 1) {
                if ([6, 8, 10].includes(stageNum)) {
                    store.addBotCondition('Regenerating', 3, 'INFINITE REGEN');
                }
            }
        }

        // Remove expired bot conditions
        toRemoveBot.forEach(name => botConditions.delete(name));
        store.setBot({ ...store.bot, conditions: botConditions });
    };

    const executeCardSwap = (selectedIndices: number[]) => {
        const p = useGameStore.getState().player;
        if ((p.drawsRemaining ?? 0) > 0) {
            swapCards(selectedIndices);
            useGameStore.getState().setDrawsRemaining((p.drawsRemaining ?? 0) - 1);
            setMessage("CARDS SWAPPED!");
        } else {
            setMessage("NO SWAPS REMAINING!");
            triggerScreenEffect('shake-small');
        }
    };

    const handleVictory = async () => {
        const store = useGameStore.getState();

        // 1. 상태 정리 (Heal + Clear Conditions)
        store.clearPlayerConditions();

        const currentHp = store.player.hp;
        let maxHp = store.player.maxHp;

        // v2.0.0.14/16: Stage 6 Reward (+20% MAX HP + FULL HEAL)
        if (stageNum === 6) {
            const bonus = Math.floor(maxHp * 0.2);
            maxHp += bonus;
            store.setHasStage6Bonus(true);
            store.setPlayerMaxHp(maxHp);
            setPlayerHp(maxHp); // FULL HEAL per user request
        } else {
            // Standard Heal for other stages
            const newHp = Math.min(maxHp, currentHp + 50);
            setPlayerHp(newHp);
        }

        // 2. Victory State & Sound
        setGameState(GameState.VICTORY);
        const victoryMsg = stageNum === 6 ? "VICTORY! MAX HP +20% BONUS!" : "VICTORY!";
        setMessage(victoryMsg);
        AudioManager.playSFX('/assets/audio/stages/victory/victory.mp3');

        // 3. Wait for victory.mp3 (approx 5s)
        await new Promise(r => setTimeout(r, 5000));

        // 4. Transition to next stage
        const nextStage = stageNum + 1;
        if (nextStage > 10) {
            alert("ALL CLEAR! YOU ARE THE MASTER OF TURN SARSAH!");
            setGameState(GameState.MENU);
        } else {
            triggerTransition(() => {
                setMessage(""); // CLEAR MESSAGE FIRST to avoid overlap!
                initGame(nextStage);
                setGameState(GameState.BATTLE);
                useGameStore.getState().applyStageRules(nextStage, 0);
                startInitialDraw();
            });
        }
    };

    const startInitialDraw = async () => {
        // v2.0.0.10: Pre-fill with null to maintain slot positions, then refill.
        setPlayerHand(new Array(8).fill(null));
        await refillHandSequentially(1500);
    };

    const handleDefeat = async () => {
        const store = useGameStore.getState();

        // 1. 상태 정리
        setGameState(GameState.GAMEOVER);
        setMessage("DEFEAT...");
        AudioManager.playSFX('/assets/audio/stages/defeat/defeat.mp3');
        store.clearPlayerConditions();

        // 2. Wait for 5s (Allow user to see defeat message)
        await new Promise(r => setTimeout(r, 5000));

        // 3. Stage 6 Special: Restore HP and proceed to 7
        if (stageNum === 6) {
            const restoredHp = store.stage6EntryHp || 200;
            triggerTransition(() => {
                initGame(7);
                setGameState(GameState.BATTLE);
                setPlayerHp(restoredHp);
                setMessage("PROCEEDING TO STAGE 7...");
                startInitialDraw();
            });
        } else {
            // Standard Defeat: Back to Menu or let BattleScreen handle it?
            // User's Game.tsx showed buttons. I'll add buttons to BattleScreen.tsx.
            // For now, let's keep it in GAMEOVER state.
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
