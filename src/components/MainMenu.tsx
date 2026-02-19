import React, { useState, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { BlockButton } from './BlockButton';
import { AudioManager } from '../utils/AudioManager';
import { SaveLoadMenu, SettingsMenu, ConfirmationPopup } from './Menu';
import { DifficultyPopup } from './DifficultyPopup';
import { Difficulty } from '../constants/gameConfig';
import { TRANSLATIONS } from '../constants/translations';

export const MainMenu: React.FC = () => {
    const { initGameWithDifficulty, initTutorial, loadGame, triggerTransition, language } = useGameStore();
    const t = TRANSLATIONS[language];

    useEffect(() => {
        AudioManager.playBGM('/assets/backgrounds/audio sounds/medieval_music_openning.mp3');
    }, []);

    const handleInteraction = () => {
        AudioManager.playBGM('/assets/backgrounds/audio sounds/medieval_music_openning.mp3');
    };

    const handleDifficultySelect = (difficulty: Difficulty) => {
        setActiveMenu('NONE');
        triggerTransition(() => initGameWithDifficulty('1', 1, difficulty)); // Chapter 1, Stage 1
    };

    const handleLoadAction = (slot: number) => {
        loadGame(slot); // Ensure loadGame(slot) is supported in store
        setActiveMenu('NONE');
    };

    const [activeMenu, setActiveMenu] = useState<'NONE' | 'SETTINGS' | 'LOAD' | 'CONFIRM_QUIT' | 'DIFFICULTY'>('NONE');

    return (
        <div className="menu-screen" onClick={handleInteraction} style={{
            position: 'relative', width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'transparent'
        }}>
            {/* Logo */}
            <img
                src="/assets/etc images/turnsarsah_logo_image.png"
                alt="Turn Sarsah"
                style={{ width: '600px', maxWidth: '90%', marginBottom: '50px', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
            />

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <BlockButton text={t.UI.NEW_GAME} onClick={() => setActiveMenu('DIFFICULTY')} />
                <BlockButton text={t.UI.LOAD_GAME} onClick={() => setActiveMenu('LOAD')} />
                <BlockButton text={t.SETTINGS.TITLE} onClick={() => setActiveMenu('SETTINGS')} />
                <BlockButton text={t.UI.QUIT} onClick={() => setActiveMenu('CONFIRM_QUIT')} variant="danger" />

                {/* v2.0.0.19: Tutorial Button */}
                <BlockButton text={t.UI.TUTORIAL} onClick={() => {
                    triggerTransition(() => initTutorial());
                }} />

                {/* Debug Button for Testing Chapter 1 -> 2 Transition */}
                <div style={{ marginTop: '20px' }}>
                    <BlockButton
                        text="DEBUG: STAGE 1-10 (EASY)"
                        onClick={() => {
                            triggerTransition(() => initGameWithDifficulty('1', 10, Difficulty.EASY));
                        }}
                        variant="danger"
                    />
                </div>
            </div>


            {/* Difficulty Popup */}
            {activeMenu === 'DIFFICULTY' && (
                <DifficultyPopup
                    onClose={() => setActiveMenu('NONE')}
                    onSelect={handleDifficultySelect}
                />
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

const modalOverlayStyle: React.CSSProperties = {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 100
};

const modalContentStyle: React.CSSProperties = {
    backgroundColor: '#2c3e50',
    padding: '40px',
    borderRadius: '10px',
    border: '2px solid #95a5a6',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minWidth: '400px',
    color: '#fff',
    fontFamily: 'BebasNeue',
    boxShadow: '0 0 20px rgba(0,0,0,0.8)'
};

const settingRowStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '5px',
    width: '100%', marginBottom: '20px', fontSize: '1.5rem'
};
