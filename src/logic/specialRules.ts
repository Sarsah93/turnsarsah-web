import { UseBoundStore, StoreApi } from 'zustand';

export const applyChapterSpecialRules = (
    chapterNum: string,
    stageNum: number,
    handType: string,
    damage: number,
    finalDamage: number,
    rawDamage: number,
    baseDamage: number,
    displayMessage: string,
    selectedCards: any[],
    currentTurn: number,
    holdBreathTurn3B: number
) => {
    let newDamage = damage;
    let newDisplayMessage = displayMessage;

    // 2A: Hand Nullification Rules
    if (chapterNum === '2A') {
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
            newDamage = Math.max(0, Math.floor((baseDamage - bonus) * (finalDamage / rawDamage)));
        }
    }

    // 3A-5: GHOST
    if (chapterNum === '3A' && stageNum === 5) {
        const handBonusesAll: Record<string, number> = {
            'One Pair': 10, 'Two Pair': 20, 'Three of a Kind': 50,
            'Straight': 75, 'Flush': 100, 'Full House': 125, 'Four of a Kind': 150,
            'Straight Flush': 175, 'Royal Flush': 300
        };
        const pokerBonusOnly = Math.floor((handBonusesAll[handType] || 0) * (finalDamage / rawDamage));
        newDamage = pokerBonusOnly;
        newDisplayMessage = "유체화: 기본/카드 피해 적용 면역!";
    }

    // 3A-6/7: HONEY YUMMY/BRITTLE
    if (chapterNum === '3A') {
        if (stageNum === 6) {
            const mysticCount = selectedCards.filter(c => c.rank === '3' || c.rank === '7').length;
            if (mysticCount > 0) newDamage += mysticCount * 8;
        } else if (stageNum === 7) {
            const diamondCount = selectedCards.filter(c => c.suit === 'DIAMONDS').length;
            if (diamondCount > 0) newDamage += diamondCount * 8;
        }
    }

    // 3B Chapter Rules
    if (chapterNum === '3B') {
        if (stageNum === 1) {
            const lowHands = ['High Card', 'One Pair'];
            if (lowHands.includes(handType)) {
                newDamage = 0;
                newDisplayMessage = "단단함: 투페어 이상 족보만 피해를 줄 수 있습니다!";
            }
        }
        if (stageNum === 4 && (currentTurn + 1) % 2 === 0) {
            newDamage = Math.floor(newDamage * 0.7);
            newDisplayMessage = "자절: 플레이어 공격 피해 30% 감소!";
        }
        if (stageNum === 5 && (currentTurn + 1) % 3 === 0) {
            newDamage = 0;
            newDisplayMessage = "위장: 보스가 투명 상태여서 공격이 통하지 않습니다!";
        }
        if (stageNum === 7 && holdBreathTurn3B === currentTurn) {
            newDamage = 0;
            newDisplayMessage = "숨참기: 보스가 무적 상태여서 피해를 줄 수 없습니다!";
        }
    }

    // 2A-4 No damage under 30
    if (chapterNum === '2A' && stageNum === 4 && newDamage < 30) {
        newDamage = 0;
        newDisplayMessage = "단단한 껍질: 30 미만의 피해는 무시합니다!";
    }

    return { damage: newDamage, displayMessage: newDisplayMessage };
};
