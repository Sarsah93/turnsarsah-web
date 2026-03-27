import { DIFFICULTY_CONFIGS } from '../constants/gameConfig';
import { useGameStore } from '../state/gameStore';

export interface BotMechanicsContext {
    store: any;
    stageNum: number;
    t: any;
    setMessage: (msg: string) => void;
    setPlayerHp: (hp: number) => void;
    showDamageText: (target: 'PLAYER' | 'BOT' | 'BOSS_LEFT', text: string, color: string) => void;
    showConditionGuideIfNew: (cond: string) => void;
    playConditionSound: (cond: string) => void;
    triggerScreenEffect: (effect: string) => void;
    applyBotStageMechanics: () => void;
}

export const applyBotStatusEffects = (ctx: BotMechanicsContext) => {
    const {
        store, stageNum, t, setMessage, setPlayerHp, showDamageText,
        showConditionGuideIfNew, playConditionSound, triggerScreenEffect,
        applyBotStageMechanics
    } = ctx;
    const config = DIFFICULTY_CONFIGS[store.difficulty as keyof typeof DIFFICULTY_CONFIGS];

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
            if (Math.random() < 0.40) {
                store.addPlayerCondition('Neurotoxicity', 3);
                showConditionGuideIfNew('Neurotoxicity');
            }
        }
        if (stageNum === 7) {
            if (Math.random() < 0.4) {
                store.addPlayerCondition('Paralyzing', 2);
                showConditionGuideIfNew('Paralyzing');
            }
        }
    } else if (store.chapterNum === '3A') {
        const currentTurnMod = (store.currentTurn % 3);
        const currentTurnMod2 = (store.currentTurn % 2);

        if (stageNum === 1 && currentTurnMod === 2) {
            setMessage("산성 공격!");
            setPlayerHp(Math.max(0, store.player.hp - 15));
            showDamageText('PLAYER', `-15`, '#e74c3c');
            if (Math.random() < 0.2) {
                store.addPlayerCondition('Burn', 3);
                showConditionGuideIfNew('Burn');
            }
        }
        if (stageNum === 3 && currentTurnMod2 === 1) {
            setMessage("점액 분비!");
            setPlayerHp(Math.max(0, store.player.hp - 20));
            showDamageText('PLAYER', `-20`, '#e74c3c');
            if (Math.random() < 0.5) {
                if (Math.random() < 0.5) {
                    store.addPlayerCondition('Poisoning', 3);
                    showConditionGuideIfNew('Poisoning');
                } else {
                    store.addPlayerCondition('Decreasing accuracy', 3, '', { percent: 30 });
                    showConditionGuideIfNew('Decreasing accuracy');
                }
            }
        }
        if (stageNum === 4 && currentTurnMod2 === 1) {
            setMessage("거미줄 투척!");
            setPlayerHp(Math.max(0, store.player.hp - 10));
            showDamageText('PLAYER', `-10`, '#e74c3c');
            store.addPlayerCondition('Decreasing accuracy', 3, '', { percent: 5 });
            showConditionGuideIfNew('Decreasing accuracy');
        }
        if (stageNum === 7) {
            const currentBot = useGameStore.getState().bot;
            const brittCond = currentBot.conditions.get('Brittle');
            if (brittCond) {
                const st = (brittCond.data as any)?.stackCount || 0;
                if (st >= 5) {
                    setMessage("취성 파괴! (경감 초기화)");
                    const freshBotC = new Map(currentBot.conditions);
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
        const currentBot = useGameStore.getState().bot;
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
        applyBotStageMechanics();
    } else if (store.chapterNum === '3B') {
        const freshP3B = useGameStore.getState().player;
        if (stageNum === 1 && Math.random() < 0.2) {
            store.addPlayerCondition('Bleeding', 4);
            playConditionSound('Bleeding');
            triggerScreenEffect('flash-red');
            showConditionGuideIfNew('Bleeding');
        }
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
        if (stageNum === 5 && Math.random() < 0.3) {
            store.addPlayerCondition('Heavy Bleeding', 4);
            playConditionSound('Heavy Bleeding');
            triggerScreenEffect('flash-red');
            showConditionGuideIfNew('Heavy Bleeding');
        }
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
        if (stageNum === 7 && Math.random() < 0.3) {
            store.addPlayerCondition('Heavy Bleeding', 4);
            playConditionSound('Heavy Bleeding');
            triggerScreenEffect('flash-red');
            showConditionGuideIfNew('Heavy Bleeding');
        }
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

        const sCond = freshP3B.conditions.get('Swamping');
        if (sCond) {
            const prevCount = (sCond.data as any)?.attackCount || 0;
            store.addPlayerCondition('Swamping', 9999, '', { attackCount: prevCount + 1 });
        } else {
            store.addPlayerCondition('Swamping', 9999, '', { attackCount: 1 });
            showConditionGuideIfNew('Swamping');
        }
    }
};
