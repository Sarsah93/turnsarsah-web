import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { BlockButton } from '../BlockButton';

interface TutorialOverlayProps {
    step: number;
    onNext: () => void;
    onPrev: () => void;
    onExit: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, onNext, onPrev, onExit }) => {
    const isTutorial = useGameStore(state => state.isTutorial);
    const setTutorialStep = useGameStore(state => state.setTutorialStep);

    React.useEffect(() => {
        if (step === 6) {
            // "4턴 간 자유롭게..." 안내 후 3초 뒤 숨김 (Step -1)
            const timer = setTimeout(() => {
                setTutorialStep(-1);
            }, 3000);
            return () => clearTimeout(timer);
        }
        if (step === 7) {
            // 조커 카드 안내 후 6초 뒤 숨김 (공격 점수 등이 보이도록)
            const timer = setTimeout(() => {
                setTutorialStep(-7);
            }, 6000);
            return () => clearTimeout(timer);
        }
        if (step === 10) {
            // 출혈 피해 확인 안내 후 4초 뒤 숨김 (족보 점수 등이 보이도록)
            const timer = setTimeout(() => {
                setTutorialStep(-10);
            }, 4000);
            return () => clearTimeout(timer);
        }
        // v2.0.0.21: Removed auto-advance timers as per user request for manual NEXT navigation
        /*
        if (step === 14) {
            const timer = setTimeout(() => { setTutorialStep(15); }, 5000);
            return () => clearTimeout(timer);
        }
        if (step === 16 || step === 17) {
            const timer = setTimeout(() => { setTutorialStep(step === 16 ? -16 : -17); }, 4000);
            return () => clearTimeout(timer);
        }
        */
    }, [step, setTutorialStep]);

    if (!isTutorial || step === -1 || step === -7 || step === -10 || step === -14 || step === -16 || step === -17) return null;

    const getTutorialContent = () => {
        switch (step) {
            case 0:
                return {
                    title: "WELCOME TO TURNSARSAH",
                    text: "'Turn Sarsah'는 스테이지 마다 다양한 패턴으로 구성된 보스들을 하나씩 1:1로 턴제 배틀을 통해, 무력화시키는 게임입니다.",
                    showNext: true,
                    showPrev: false
                };
            case 1:
                return {
                    title: "CARDS & ATTACK POINTS",
                    text: "스테이지에서는 주어진 카드 패를 가지고, 포커 족보 규칙에 맞춰, 공격 포인트를 형성하고, 형성된 공격 포인트로 보스들을 공격할 수 있습니다. 일반적으로 공격 포인트는 선택한 카드의 숫자 합과 족보 보너스 점수로 구성됩니다.",
                    showNext: true,
                    showPrev: true
                };
            case 2:
                return {
                    title: "POKER HANDS",
                    text: "포커 족보는 기본적으로 같은 숫자쌍, 같은 모양, 숫자의 순서 및 숫자와 알파벳 카드의 조합 등으로 구성될 수 있습니다. 같은 숫자 한 쌍을 선택할 경우, ONE PAIR로 족보 보너스 점수 10점과 함께 선택한 카드들의 숫자 합을 더한 점수로 반영됩니다.",
                    showNext: true,
                    showPrev: true
                };
            case 3:
                return {
                    title: "POKER HANDS (CONT.)",
                    text: "족보에는 순서대로 같은 숫자 한 쌍인 'PAIR', 같은 숫자끼리 두 쌍이 있을 경우 모두 골랐을 때, 'TWO PAIR'가 됩니다. 또한, 같은 숫자 카드를 3개 선택할 시, 'TRIPLE(Three of a Kind)'이 되며, 같은 숫자 카드를 4개 선택할 시, 'FOUR CARDS(Four of a Kind)'가 됩니다. 그리고 같은 숫자 3개와 다른 같은 숫자 한 쌍을 선택하여 총 5장을 선택했을 경우, 풀하우스(FULL HOUSE)가 적용됩니다. 또한, 숫자의 오름차순 혹은 내림차순으로 구성된 5장의 카드는 '스트레이트(STRAIGHT)'이 되며, 모양만 같은 카드로 구성된 5장의 카드로 구성된 '플러시(FLUSH)'가 있습니다.",
                    showNext: true,
                    showPrev: true
                };
            case 4:
                return {
                    title: "SPECIAL HANDS",
                    text: "'STRAIGHT와 FLUSH가 결합된 STRAIGHT FLUSH도 존재하며, ROYAL NUMBER인 10, J, Q, K, A가 STRAIGHT + FLUSH 조건을 만족할 때, 가장 높은 족보 보너스 점수가 적용되는 'ROYAL FLUSH'가 됩니다.",
                    showNext: true,
                    showPrev: true
                };
            case 5:
                return {
                    title: "PRACTICE: ONE PAIR",
                    text: "ONE PAIR를 구성하여 공격을 해 볼까요?",
                    showNext: false, // User must attack
                    showPrev: true
                };
            case 6:
                return {
                    title: "FREE ATTACK",
                    text: "4턴 간 자유롭게, 강력한 공격 포인트를 만들고 공격을 진행하세요.",
                    showNext: false,
                    showPrev: false,
                    autoHide: true
                };
            case 7:
                return {
                    title: "JOKER CARD",
                    text: "조커(JOKER) 카드는 다른 카드들로부터 족보 시너지를 충족시키고자 할 때, '모든 숫자로 대체 가능한 와일드 카드'이다. 족보 순위에서 가장 높은 족보를 우선적으로 따라가도록 사용되며, 합산 시 점수는 14점으로 A(에이스)와 동일한 점수로 부여된다. 지급된 조커 카드로 공격을 진행해 보세요!",
                    showNext: false, // User must attack with Joker
                    showPrev: true
                };
            case 8:
                return {
                    title: "STATUS EFFECTS",
                    text: "이제부터는 상태이상 효과를 대비해봅시다.",
                    showNext: true, // Manual next to proceed to bleeding explanation
                    showPrev: true
                };
            case 9:
                return {
                    title: "BLEEDING",
                    text: "상태이상 '출혈'은 매 턴이 종료될 때 마다, 고정된 피해를 입습니다. 보스의 공격으로 출혈이 부여되었습니다!",
                    showNext: true, // Manual next to see damage
                    autoHide: false,
                    showPrev: true
                };
            case 10:
                return {
                    title: "OBSERVE DAMAGE",
                    text: "출혈 상태에서는 턴이 넘어갈 때 마다 피해를 입게 됩니다. 현재 입고 있는 피해를 확인하고 한 번 더 공격을 진행해 보세요.",
                    showNext: false,
                    autoHide: false,
                    showPrev: true
                };
            case 11:
                return {
                    title: "CONTINUE BATTLE",
                    text: "상태이상은 여러 턴 동안 지속됩니다. 체력 관리에 유의하며 전투를 이어가세요.",
                    showNext: false,
                    showPrev: true
                };
            case 12:
                return {
                    title: "TUTORIAL END",
                    text: "출혈 외에도 다양한 상태이상 효과들이 플레이어에게 적용될 수 있으며, 블라인드 룰 외에도 다양한 금지 룰과 보스룰이 적용될 수 있습니다. 이제 본격적인 전장으로 떠나보세요!",
                    showNext: false,
                    showExit: true,
                    showPrev: false
                };
            case 13:
                return {
                    title: "SWAP",
                    text: "플레이어의 차례일 때, 원하는 카드가 나오지 않았거나, 수중 패에서 조합의 구성이 어려울 경우, 카드를 새로 랜덤하게 교환할 수 있습니다. 'ATTACK 버튼'의 우측에 있는 'SWAP' 버튼을 누르면, 한 번에 선택한 카드를 최대 2장까지 교환할 수 있습니다.",
                    showNext: false,
                    showPrev: false
                };
            case 14:
                return {
                    title: "BOSS RULE",
                    text: (
                        <div style={{ textAlign: 'left', fontSize: '1.2rem' }}>
                            본 게임에서 스테이지마다 보스들이 존재하며, 보스들은 각각의 고유한 설정과 룰을 가지고 있습니다. 플레이어는 룰을 토대로 승리하기 위해 전략적으로 카드 조합을 구성해야 합니다.<br /><br />
                            - BAN_TIER 2: 무작위 숫자 2개를 턴 마다 공격 포인트로 사용할 수 없게 됩니다.<br />
                            - BAN_SUIT: 무작위 문양 1개를 턴 마다 공격 포인트로 사용할 수 없게 됩니다.<br />
                            - BAN_BLIND 2: 플레이어의 수중패에서 무작위 카드 2개를 턴 마다 뒤집어 카드를 알 수 없게 합니다.<br />
                            - BAN_HAND: 무작위 족보 1개를 턴 마다 금지시키고, 해당 족보로 공격할 수 없게 합니다.
                        </div>
                    ),
                    showNext: true,
                    showPrev: true
                };
            case 15:
                return {
                    title: "BOSS RULE: BLIND",
                    text: "이제 플레이어에게 'BAN_BLIND 2' RULE을 적용시켜 보겠습니다. 수중패에서 2장이 무작위로 뒤집혀지기 때문에, 공격에는 사용할 수 있으나, 확실한 숫자를 알기는 어렵습니다. 그렇지만, 족보의 구성 유무와 JOKER 카드 유무 표시로 어느 정도는 유추할 수 있습니다.",
                    showNext: true,
                    showPrev: true
                };
            case 16:
                return {
                    title: "RULE PRACTICE (1/2)",
                    text: "블라인드 룰이 적용된 상태에서 공격을 진행해 보세요! (1/2)",
                    showNext: true,
                    showPrev: true
                };
            case 17:
                return {
                    title: "RULE PRACTICE (2/2)",
                    text: "블라인드 룰이 적용된 상태에서 공격을 한 번 더 진행해 보세요! (2/2)",
                    showNext: true,
                    showPrev: true
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
            backgroundColor: (step === 12) ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)',
            zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            pointerEvents: 'none' // Allow interaction with the game behind
        }}>
            <div style={{
                background: 'rgba(0,0,0,0.95)',
                border: '2px solid #f1c40f',
                borderRadius: '15px',
                padding: '30px',
                width: '600px',
                textAlign: 'center',
                boxShadow: '0 0 30px rgba(0,0,0,0.9)',
                color: '#fff',
                fontFamily: "'Bebas Neue', sans-serif",
                pointerEvents: 'auto', // Re-enable for the exit/next buttons
                display: 'flex',
                flexDirection: 'column',
                minHeight: '300px'
            }}>
                <h2 style={{ color: '#f1c40f', fontSize: '2.5rem', marginBottom: '20px' }}>{content.title}</h2>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: '1.4rem', lineHeight: '1.6', marginBottom: '30px', fontFamily: 'sans-serif' }}>
                        {content.text}
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '20px',
                    width: '100%',
                    position: 'relative'
                }}>
                    <div style={{ minWidth: '150px', textAlign: 'left' }}>
                        {content.showPrev && (
                            <BlockButton text="PREVIOUS" onClick={onPrev} width="150px" />
                        )}
                    </div>

                    <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        {content.showExit && (
                            <BlockButton text="BACK TO MAIN PAGE" onClick={onExit} width="300px" fontSize="1.6rem" />
                        )}
                    </div>

                    <div style={{ minWidth: '150px', textAlign: 'right' }}>
                        {content.showNext && (
                            <BlockButton text="NEXT" onClick={onNext} width="150px" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


