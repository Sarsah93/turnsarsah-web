import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { BlockButton } from '../BlockButton';

interface TutorialOverlayProps {
    step: number;
    onNext: () => void;
    onExit: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, onNext, onExit }) => {
    const isTutorial = useGameStore(state => state.isTutorial);
    const setTutorialStep = useGameStore(state => state.setTutorialStep);

    React.useEffect(() => {
        if (step === 6) {
            // "4턴 간 자유롭게..." 안내 후 1초 뒤 숨김 (Step -1)
            const timer = setTimeout(() => {
                setTutorialStep(-1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [step, setTutorialStep]);

    if (!isTutorial || step === -1) return null;

    const getTutorialContent = () => {
        switch (step) {
            case 0:
                return {
                    title: "WELCOME TO TURNSARSAH",
                    text: "'Turn Sarsah'는 스테이지 마다 다양한 패턴으로 구성된 보스들을 하나씩 1:1로 턴제 배틀을 통해, 무력화시키는 게임입니다.",
                    showNext: true
                };
            case 1:
                return {
                    title: "CARDS & ATTACK POINTS",
                    text: "스테이지에서는 주어진 카드 패를 가지고, 포커 족보 규칙에 맞춰, 공격 포인트를 형성하고, 형성된 공격 포인트로 보스들을 공격할 수 있습니다. 일반적으로 공격 포인트는 선택한 카드의 숫자 합과 족보 보너스 점수로 구성됩니다.",
                    showNext: true
                };
            case 2:
                return {
                    title: "POKER HANDS",
                    text: "포커 족보는 기본적으로 같은 숫자쌍, 같은 모양, 숫자의 순서 및 숫자와 알파벳 카드의 조합 등으로 구성될 수 있습니다. 같은 숫자 한 쌍을 선택할 경우, ONE PAIR로 족보 보너스 점수 10점과 함께 선택한 카드들의 숫자 합을 더한 점수로 반영됩니다.",
                    showNext: true
                };
            case 3:
                return {
                    title: "POKER HANDS (CONT.)",
                    text: "족보에는 순서대로 같은 숫자 한 쌍인 'PAIR', 같은 숫자끼리 두 쌍이 있을 경우 모두 골랐을 때, 'TWO PAIR'가 됩니다. 또한, 같은 숫자 카드를 3개 선택할 시, 'TRIPLE(Three of a Kind)'이 되며, 같은 숫자 카드를 4개 선택할 시, 'FOUR CARDS(Four of a Kind)'가 됩니다. 그리고 같은 숫자 3개와 다른 같은 숫자 한 쌍을 선택하여 총 5장을 선택했을 경우, 풀하우스(FULL HOUSE)가 적용됩니다. 또한, 숫자의 오름차순 혹은 내림차순으로 구성된 5장의 카드는 '스트레이트(STRAIGHT)'이 되며, 모양만 같은 카드로 구성된 5장의 카드로 구성된 '플러시(FLUSH)'가 있습니다.",
                    showNext: true
                };
            case 4:
                return {
                    title: "SPECIAL HANDS",
                    text: "'STRAIGHT와 FLUSH가 결합된 STRAIGHT FLUSH도 존재하며, ROYAL NUMBER인 10, J, Q, K, A가 STRAIGHT + FLUSH 조건을 만족할 때, 가장 높은 족보 보너스 점수가 적용되는 'ROYAL FLUSH'가 됩니다.",
                    showNext: true
                };
            case 5:
                return {
                    title: "PRACTICE: ONE PAIR",
                    text: "ONE PAIR를 구성하여 공격을 해 볼까요?",
                    showNext: false // User must attack
                };
            case 6:
                return {
                    title: "FREE ATTACK",
                    text: "4턴 간 자유롭게, 강력한 공격 포인트를 만들고 공격을 진행하세요.",
                    showNext: false,
                    autoHide: true
                };
            case 7:
                return {
                    title: "JOKER CARD",
                    text: "조커(JOKER) 카드는 다른 카드들로부터 족보 시너지를 충족시키고자 할 때, '모든 숫자로 대체 가능한 와일드 카드'이다. 족보 순위에서 가장 높은 족보를 우선적으로 따라가도록 사용되며, 합산 시 점수는 14점으로 A(에이스)와 동일한 점수로 부여된다.",
                    showNext: true
                };
            case 8:
                return {
                    title: "STATUS EFFECTS",
                    text: "이제부터는 상태이상 효과를 대비해봅시다.",
                    showNext: true // Manual next to proceed to bleeding explanation
                };
            case 9:
                return {
                    title: "BLEEDING",
                    text: "상태이상 '출혈'은 매 턴이 종료될 때 마다, 고정된 피해를 입습니다. 보스의 공격으로 출혈이 부여되었습니다!",
                    showNext: true, // Manual next to finish
                    autoHide: false
                };
            case 10:
                return {
                    title: "TUTORIAL END",
                    text: "출혈 외에도 다양한 상태이상 효과들이 플레이어에게 적용될 수 있습니다. 이제 본격적인 전장으로 떠나보세요!",
                    showNext: false,
                    showExit: true
                };
            default:
                return null;
        }
    };

    const content = getTutorialContent();
    if (!content) return null;

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: (step === 10) ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)',
            zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            pointerEvents: 'none' // Allow interaction with the game behind
        }}>
            <div style={{
                background: 'rgba(0,0,0,0.95)',
                border: '2px solid #f1c40f',
                borderRadius: '15px',
                padding: '30px',
                maxWidth: '600px',
                textAlign: 'center',
                boxShadow: '0 0 30px rgba(0,0,0,0.9)',
                color: '#fff',
                fontFamily: "'Bebas Neue', sans-serif",
                pointerEvents: 'auto' // Re-enable for the exit/next buttons
            }}>
                <h2 style={{ color: '#f1c40f', fontSize: '2.5rem', marginBottom: '20px' }}>{content.title}</h2>
                <p style={{ fontSize: '1.4rem', lineHeight: '1.6', marginBottom: '30px', fontFamily: 'sans-serif' }}>
                    {content.text}
                </p>

                {content.showNext && (
                    <BlockButton text="NEXT" onClick={onNext} width="150px" />
                )}

                {content.showExit && (
                    <BlockButton text="BACK TO MAIN PAGE" onClick={onExit} width="300px" />
                )}
            </div>
        </div>
    );
};
