import React, { useState, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { BlockButton } from './BlockButton';
import { AudioManager } from '../utils/AudioManager';
import { SaveLoadMenu, SettingsMenu, ConfirmationPopup } from './Menu';
import { DifficultyPopup } from './DifficultyPopup';
import { Difficulty } from '../constants/gameConfig';
import { TRANSLATIONS } from '../constants/translations';
import { AltarSystem } from './AltarSystem';

export const MainMenu: React.FC = () => {
    const { initGameWithDifficulty, initTutorial, loadGame, triggerTransition, language, fontSize, setForceOnePairDance, setForceTwoPairTaeguek } = useGameStore();
    const t = TRANSLATIONS[language];
    const isEnglish = language === 'EN';
    const isLargeFont = fontSize === 'LARGE';
    const menuButtonWidth = isEnglish ? (isLargeFont ? '22ch' : '20ch') : undefined;
    const menuButtonStyle = isEnglish ? { whiteSpace: 'nowrap' as const } : undefined;

    useEffect(() => {
        AudioManager.playBGM('/assets/backgrounds/audio sounds/medieval_music_openning.mp3');
    }, []);

    const handleDifficultySelect = (difficulty: Difficulty) => {
        setActiveMenu('NONE');
        setForceOnePairDance(false);
        setForceTwoPairTaeguek(false);
        triggerTransition(() => initGameWithDifficulty('1', 1, difficulty)); // Chapter 1, Stage 1
    };

    const handleLoadAction = (slot: number) => {
        loadGame(slot); // Ensure loadGame(slot) is supported in store
        setActiveMenu('NONE');
    };

    const handleDebugOnePairDance = () => {
        setForceOnePairDance(true);
        setForceTwoPairTaeguek(false);
        triggerTransition(() => initGameWithDifficulty('1', 1, Difficulty.NORMAL));
    };

    const handleDebugTwoPairTaeguek = () => {
        setForceOnePairDance(false);
        setForceTwoPairTaeguek(true);
        triggerTransition(() => initGameWithDifficulty('1', 1, Difficulty.NORMAL));
    };

    const [activeMenu, setActiveMenu] = useState<'NONE' | 'SETTINGS' | 'LOAD' | 'CONFIRM_QUIT' | 'DIFFICULTY' | 'ALTAR'>('NONE');

    return (
        <div className="menu-screen" style={{
            position: 'relative', width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'transparent'
        }}>
            {/* Logo */}
            <img
                className="main-menu-logo"
                src="/assets/etc images/turnsarsah_logo_image.png"
                alt="Turn Sarsah"
                style={{ width: '600px', maxWidth: '90%', marginBottom: '50px', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
            />

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <BlockButton text={t.UI.NEW_GAME} onClick={() => setActiveMenu('DIFFICULTY')} width={menuButtonWidth} style={menuButtonStyle} />
                <BlockButton text={t.UI.LOAD_GAME} onClick={() => setActiveMenu('LOAD')} width={menuButtonWidth} style={menuButtonStyle} />
                <BlockButton text={t.UI.TUTORIAL} onClick={() => {
                    triggerTransition(() => initTutorial());
                }} width={menuButtonWidth} style={menuButtonStyle} />
                <BlockButton text={t.UI.ALTAR_SYSTEM} onClick={() => setActiveMenu('ALTAR')} width={menuButtonWidth} style={menuButtonStyle} />
                <BlockButton text={t.SETTINGS.TITLE} onClick={() => setActiveMenu('SETTINGS')} width={menuButtonWidth} style={menuButtonStyle} />
                <BlockButton text={t.UI.QUIT} onClick={() => setActiveMenu('CONFIRM_QUIT')} variant="danger" width={menuButtonWidth} style={menuButtonStyle} />

                {/* 디버그 버튼 — DEV 환경에서만 노출, 가로 정렬 */}
                {import.meta.env.DEV && (
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                        <BlockButton text="DEBUG: ONE PAIR DANCE"   onClick={handleDebugOnePairDance}   width="auto" style={{ ...menuButtonStyle, fontSize: '0.85em', padding: '6px 14px', opacity: 0.75 }} />
                        <BlockButton text="DEBUG: TWO PAIR TAEGUEK" onClick={handleDebugTwoPairTaeguek} width="auto" style={{ ...menuButtonStyle, fontSize: '0.85em', padding: '6px 14px', opacity: 0.75 }} />
                    </div>
                )}
            </div>





            {/* Difficulty Popup */}
            {activeMenu === 'DIFFICULTY' && (
                <DifficultyPopup
                    onClose={() => setActiveMenu('NONE')}
                    onSelect={handleDifficultySelect}
                />
            )}

            {/* Altar System Menu */}
            {activeMenu === 'ALTAR' && (
                <AltarSystem onClose={() => setActiveMenu('NONE')} />
            )}

            {/* Modals using unified components */}
            {activeMenu === 'SETTINGS' && (
                <SettingsMenu
                    onClose={() => setActiveMenu('NONE')}
                    onVolumeChange={(type, vol) => {
                        if (type === 'bgm') {
                            AudioManager.setBGMVolume(vol);
                        } else {
                            AudioManager.setSFXVolume(vol);
                        }
                    }}
                />
            )}

            {activeMenu === 'LOAD' && (
                <SaveLoadMenu
                    mode="LOAD"
                    onAction={handleLoadAction}
                    onClose={() => setActiveMenu('NONE')}
                />
            )}

            {activeMenu === 'CONFIRM_QUIT' && (
                <ConfirmationPopup
                    message={t.UI.QUIT_ASK}
                    onYes={() => window.close()}
                    onNo={() => setActiveMenu('NONE')}
                />
            )}
        </div>
    );
};
