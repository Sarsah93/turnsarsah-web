import React from 'react';
import { useGameStore } from '../state/gameStore';
import { TRANSLATIONS } from '../constants/translations';
import { Difficulty, GameState } from '../constants/gameConfig';
import { BlockButton } from './BlockButton';

export const ClearCongratulationsPopup: React.FC = () => {
    const { clearPopupDifficulty, setClearPopupDifficulty, language, setGameState, triggerTransition } = useGameStore();
    const t = TRANSLATIONS[language];

    if (!clearPopupDifficulty) return null;

    const handleBackToMain = () => {
        triggerTransition(() => {
            setClearPopupDifficulty(null);
            setGameState(GameState.MENU);
        });
    };

    const getBodyText = () => {
        if (clearPopupDifficulty === Difficulty.EASY) return t.UI.CLEAR_EASY_BODY;
        if (clearPopupDifficulty === Difficulty.NORMAL) return t.UI.CLEAR_NORMAL_BODY;
        // Fallback for Hard/Hell if ever reached
        return t.UI.CLEAR_NORMAL_BODY;
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            backdropFilter: 'blur(3px)',
            fontFamily: "'Noto Sans KR', sans-serif"
        }}>
            <div style={{
                backgroundColor: 'rgba(20, 20, 30, 0.95)',
                border: '2px solid #f1c40f',
                borderRadius: '15px',
                padding: '40px',
                maxWidth: '600px',
                width: '90%',
                textAlign: 'center',
                boxShadow: '0 0 30px rgba(241, 196, 15, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '25px',
                animation: 'popupFadeIn 0.5s ease-out'
            }}>
                <h1 style={{
                    color: '#f1c40f',
                    fontSize: '3rem',
                    margin: 0,
                    fontFamily: 'BebasNeue',
                    textShadow: '0 0 10px rgba(241, 196, 15, 0.5)'
                }}>
                    {t.UI.CLEAR_CONGRATS}
                </h1>

                <div style={{
                    color: '#ecf0f1',
                    fontSize: '1.2rem',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'keep-all',
                    textAlign: 'center',
                }}>
                    {getBodyText()}
                </div>

                <BlockButton
                    text={t.UI.BACK_TO_MAIN_MENU}
                    onClick={handleBackToMain}
                    width="300px"
                />
            </div>

            <style>{`
                @keyframes popupFadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};
