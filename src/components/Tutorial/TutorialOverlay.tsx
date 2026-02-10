import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { BlockButton } from '../BlockButton';
import { TRANSLATIONS } from '../../constants/translations';

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
            // 조커 카드 안내 후 8초 뒤 숨김 (공격 점수 등이 보이도록)
            const timer = setTimeout(() => {
                setTutorialStep(-7);
            }, 8000);
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

    const language = useGameStore(state => state.language);
    const t = TRANSLATIONS[language].TUTORIAL;

    const getTutorialContent = () => {
        switch (step) {
            case 0:
                return {
                    title: t.STEP_0.TITLE,
                    text: t.STEP_0.TEXT,
                    showNext: true,
                    showPrev: false
                };
            case 1:
                return {
                    title: t.STEP_1.TITLE,
                    text: t.STEP_1.TEXT,
                    showNext: true,
                    showPrev: true
                };
            case 2:
                return {
                    title: t.STEP_2.TITLE,
                    text: t.STEP_2.TEXT,
                    showNext: true,
                    showPrev: true
                };
            case 3:
                return {
                    title: t.STEP_3.TITLE,
                    text: t.STEP_3.TEXT,
                    showNext: true,
                    showPrev: true
                };
            case 4:
                return {
                    title: t.STEP_4.TITLE,
                    text: t.STEP_4.TEXT,
                    showNext: true,
                    showPrev: true
                };
            case 5:
                return {
                    title: t.STEP_5.TITLE,
                    text: t.STEP_5.TEXT,
                    showNext: false, // User must attack
                    showPrev: true
                };
            case 6:
                return {
                    title: t.STEP_6.TITLE,
                    text: t.STEP_6.TEXT,
                    showNext: false,
                    showPrev: false,
                    autoHide: true
                };
            case 7:
                return {
                    title: t.STEP_7.TITLE,
                    text: t.STEP_7.TEXT,
                    showNext: false, // User must attack with Joker
                    showPrev: true
                };
            case 8:
                return {
                    title: t.STEP_8.TITLE,
                    text: t.STEP_8.TEXT,
                    showNext: true, // Manual next to proceed to bleeding explanation
                    showPrev: true
                };
            case 9:
                return {
                    title: t.STEP_9.TITLE,
                    text: t.STEP_9.TEXT,
                    showNext: true, // Manual next to see damage
                    autoHide: false,
                    showPrev: true
                };
            case 10:
                return {
                    title: t.STEP_10.TITLE,
                    text: t.STEP_10.TEXT,
                    showNext: false,
                    autoHide: false,
                    showPrev: true
                };
            case 11:
                return {
                    title: t.STEP_11.TITLE,
                    text: t.STEP_11.TEXT,
                    showNext: false,
                    showPrev: true
                };
            case 12:
                return {
                    title: t.STEP_12.TITLE,
                    text: t.STEP_12.TEXT,
                    showNext: false,
                    showExit: true,
                    showPrev: false
                };
            case 13:
                return {
                    title: t.STEP_13.TITLE,
                    text: t.STEP_13.TEXT,
                    showNext: false,
                    showPrev: false
                };
            case 14:
                return {
                    title: t.STEP_14.TITLE,
                    text: language === 'KR' ? (
                        <div style={{ textAlign: 'left', fontSize: '1.2rem' }}>
                            본 게임에서 스테이지마다 보스들이 존재하며, 보스들은 각각의 고유한 설정과 룰을 가지고 있습니다. 플레이어는 룰을 토대로 승리하기 위해 전략적으로 카드 조합을 구성해야 합니다.<br /><br />
                            - BAN_TIER 2: 무작위 숫자 2개를 턴 마다 공격 포인트로 사용할 수 없게 됩니다.<br />
                            - BAN_SUIT: 무작위 문양 1개를 턴 마다 공격 포인트로 사용할 수 없게 됩니다.<br />
                            - BAN_BLIND 2: 플레이어의 수중패에서 무작위 카드 2개를 턴 마다 뒤집어 카드를 알 수 없게 합니다.<br />
                            - BAN_HAND: 무작위 족보 1개를 턴 마다 금지시키고, 해당 족보로 공격할 수 없게 합니다.
                        </div>
                    ) : (
                        <div style={{ textAlign: 'left', fontSize: '1.2rem' }}>
                            In this game, each stage has a boss with unique settings and rules. You must strategically form hands based on these rules to win.<br /><br />
                            - BAN_RANK 2: Two random ranks are banned from being used in attack points.<br />
                            - BAN_SUIT: One random suit is banned from being used in attack points.<br />
                            - BAN_BLIND 2: Two random cards in your hand are flipped face down.<br />
                            - BAN_HAND: One random poker hand is banned from being used for attacks.
                        </div>
                    ),
                    showNext: true,
                    showPrev: true
                };
            case 15:
                return {
                    title: t.STEP_15.TITLE,
                    text: t.STEP_15.TEXT,
                    showNext: true,
                    showPrev: true
                };
            case 16:
                return {
                    title: t.STEP_16.TITLE,
                    text: t.STEP_16.TEXT,
                    showNext: true,
                    showPrev: true
                };
            case 17:
                return {
                    title: t.STEP_17.TITLE,
                    text: t.STEP_17.TEXT,
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
                            <BlockButton text={t.PREV} onClick={onPrev} width="150px" />
                        )}
                    </div>

                    <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        {content.showExit && (
                            <BlockButton text={t.EXIT} onClick={onExit} width="300px" fontSize="1.6rem" />
                        )}
                    </div>

                    <div style={{ minWidth: '150px', textAlign: 'right' }}>
                        {content.showNext && (
                            <BlockButton text={t.NEXT} onClick={onNext} width="150px" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


