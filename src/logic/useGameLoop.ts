import { useState, useEffect, useRef } from 'react';
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
        addPlayerCondition
    } = useGameStore();

    const [damageTexts, setDamageTexts] = useState<DamageTextData[]>([]);
    const [screenEffect, setScreenEffect] = useState<string>('');

    // Helper to add damage text
    const showDamageText = (target: 'PLAYER' | 'BOT', text: string, color: string) => {
        const id = Date.now() + Math.random();
        // Positions based on 1280x720 layout
        const x = target === 'BOT' ? 640 : 200; // Bot Center, Player Left
        const y = target === 'BOT' ? 200 : 500;

        setDamageTexts(prev => [...prev, { id, x, y, text, color }]);
    };

    const onDamageTextComplete = (id: number) => {
        setDamageTexts(prev => prev.filter(dt => dt.id !== id));
    };

    const triggerScreenEffect = (effect: string) => {
        setScreenEffect(effect);
        setTimeout(() => setScreenEffect(''), 500); // Reset after animation
    };

    const executePlayerAttack = (selectedIndices: number[]) => {
        if (gameState !== GameState.BATTLE) return;

        if (selectedIndices.length === 0) {
            setMessage("SELECT CARDS!");
            triggerScreenEffect('shake-small');
            return;
        }

        const selectedCards = selectedIndices.map(idx => playerHand[idx]);
        const result = calculatePlayerDamage(selectedCards, player.conditions.has('Debilitating'));

        const damage = Math.floor(result.finalDamage);
        const isCrit = result.isCritical;

        // Visual Feedback
        if (isCrit) {
            setMessage(`CRITICAL HIT! ${result.handType}`);
            AudioManager.playSFX('/assets/audio/combat/10_cruel_swing.mp3');
            triggerScreenEffect('flash-red');
        } else {
            setMessage(`${result.handType}`);
            AudioManager.playSFX('/assets/audio/combat/04_sword hit_heavy.mp3');
            triggerScreenEffect('shake');
        }

        // Apply Damage to Bot
        let newBotHp = Math.max(0, bot.hp - damage);

        // Use timeout to delay damage slightly for animation sync
        setTimeout(() => {
            setBotHp(newBotHp);
            showDamageText('BOT', `-${damage}`, isCrit ? '#c0392b' : '#ecf0f1');

            // Draw new cards to replace used ones
            // Remove used cards -> Draw new ones
            // State logic likely handles "remove indices, draw N"
            // For now, let's assume drawCards handles refilling hand
            // We need to remove specific indices first? 
            // The store's 'drawCards' typically draws N cards. 
            // We need a 'replaceCards(indices)' action or similar.
            // Let's use swapCards logic but with drawing from deck.

            // Actually, we should Discard selected -> Draw to fill
            // Store likely needs 'discardAndDraw(indices)'
            // Let's manually do it via available actions if possible, 
            // or just swap them which effectively is discard & draw.
            swapCards(selectedIndices);

            // Check Win
            if (newBotHp <= 0) {
                handleVictory();
            } else {
                // Bot Turn Trigger
                setTimeout(executeBotTurn, 1500);
            }
        }, 500); // 0.5s delay for 'Impact'
    };


    // ... (helper functions)

    const playConditionSound = (condition: string) => {
        let file = '';
        switch (condition) {
            case 'Bleeding': file = 'Bleeding.mp3'; break;
            case 'Heavy Bleeding': file = 'Heavy Bleeding.mp3'; break;
            case 'Poisoning': file = 'poisoning.mp3'; break;
            case 'Regenerating': file = 'Regenerating.mp3'; break;
            case 'Paralyzing': file = 'paralyzing.mp3'; break;
            case 'Debilitating': file = 'Debilitating.mp3'; break;
            case 'Avoiding': file = 'avoiding.mp3'; break;
            default: return;
        }
        AudioManager.playSFX(`/assets/audio/conditions/${file}`);
    };

    const getBossAttackSFX = (stage: number) => {
        // ... (existing mapping)
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

        if (stageNum === 1 && rand < 0.6) conditionApplied = 'Bleeding';
        else if (stageNum === 2 && rand < 0.35) conditionApplied = 'Bleeding';
        else if (stageNum === 3 && rand < 0.35) conditionApplied = 'Bleeding';
        else if (stageNum === 4 && rand < 0.35) conditionApplied = 'Bleeding';
        else if (stageNum === 5 && rand < 0.4) conditionApplied = 'Poisoning';
        else if (stageNum === 7) {
            if (rand < 0.25) conditionApplied = 'Paralyzing';
            else if (rand < 0.6) conditionApplied = 'Bleeding'; // 25% Para, 35% Bleed -> 0.25~0.6 range approx
        }
        else if (stageNum === 8 && rand < 0.35) conditionApplied = 'Bleeding';
        else if (stageNum === 9 && rand < 0.35) conditionApplied = 'Bleeding';

        if (conditionApplied) {
            // Duration map based on GameConfig (Bleed=6, Poison=3, etc)
            let duration = 3;
            if (conditionApplied === 'Bleeding') duration = 6;
            if (conditionApplied === 'Poisoning') duration = 3;
            if (conditionApplied === 'Paralyzing') duration = 2;

            addPlayerCondition(conditionApplied, duration, conditionApplied);
            playConditionSound(conditionApplied);
            setMessage(`${conditionApplied.toUpperCase()}!`);
            triggerScreenEffect('flash-red');
        }
    };

    const executeBotTurn = () => {
        const damage = calculateBotDamage(bot.atk);

        setMessage(`${bot.name} ATTACKS!`);

        const attackSfx = getBossAttackSFX(stageNum);
        AudioManager.playSFX(attackSfx);

        setTimeout(() => {
            const newPlayerHp = Math.max(0, player.hp - damage);
            setPlayerHp(newPlayerHp);
            showDamageText('PLAYER', `-${damage}`, '#e74c3c');
            triggerScreenEffect('shake-heavy');

            // Apply Stage Mechanics (Conditions)
            applyBotStageMechanics();

            if (newPlayerHp <= 0) {
                handleDefeat();
            }
        }, 800);
    };

    const executeCardSwap = (selectedIndices: number[]) => {
        if ((player.drawsRemaining ?? 0) > 0) {
            swapCards(selectedIndices);
            AudioManager.playSFX('/assets/audio/player/shuffling.mp3');
            setMessage("SWAPPED!");
        } else {
            setMessage("NO DRAWS LEFT!");
            triggerScreenEffect('shake-small');
        }
    };

    const handleVictory = () => {
        setGameState(GameState.VICTORY);
        // Play Victory Sound
        AudioManager.playSFX('/assets/audio/stages/victory/victory.mp3');
        setMessage("VICTORY!");

        setTimeout(() => {
            // Next Stage Logic
            const nextStage = stageNum + 1;
            if (nextStage > 10) {
                alert("ALL CLEAR! YOU ARE THE TURNSARSAH MASTER!");
                setGameState(GameState.MENU);
            } else {
                initGame(nextStage); // Re-init next stage
                setGameState(GameState.BATTLE);
            }
        }, 4000);
    };

    const handleDefeat = () => {
        setGameState(GameState.GAMEOVER);
        setMessage("DEFEAT...");
    };

    return {
        message,
        damageTexts,
        screenEffect,
        onDamageTextComplete,
        executePlayerAttack,
        executeBotTurn,
        executeCardSwap
    };
};
