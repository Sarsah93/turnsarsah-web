import React, { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useGameStore } from '../state/gameStore';
import { BlockButton } from './BlockButton';
import { AudioManager } from '../utils/AudioManager';
import { SaveLoadMenu, SettingsMenu, ConfirmationPopup } from './Menu';
import { DifficultyPopup } from './DifficultyPopup';
import { Difficulty } from '../constants/gameConfig';
import { TRANSLATIONS } from '../constants/translations';
import { AltarSystem } from './AltarSystem';
import { CollectionPopup } from './CollectionPopup';
import './styles/Modal.css';

export const MainMenu: React.FC = () => {
    const {
        initTutorial, loadGame, triggerTransition, language, fontSize,
        setForceOnePairDance, setForceTwoPairTaeguek,
        setDifficulty, enterStageMap,
    } = useGameStore();

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
        setDifficulty(difficulty);
        triggerTransition(() => enterStageMap('1'));
    };

    const handleLoadAction = (slot: number) => {
        loadGame(slot);
        setActiveMenu('NONE');
    };

    type MenuState = 'NONE' | 'SETTINGS' | 'LOAD' | 'CONFIRM_QUIT' | 'DIFFICULTY' | 'ALTAR' | 'COLLECTION';

    const [activeMenu, setActiveMenu] = useState<MenuState>('NONE');

    return (
        <div className="menu-screen" style={{
            position: 'relative', width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'transparent'
        }}>
            {/* Logo */}
            <img
                className="main-menu-logo"
                src={encodeURI('/assets/etc images/turnsarsah_logo_image.png')}
                alt="Turn Sarsah"
                style={{ width: '600px', maxWidth: '90%', marginBottom: '50px', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
            />

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <BlockButton text={t.UI.NEW_GAME}     onClick={() => setActiveMenu('DIFFICULTY')}   width={menuButtonWidth} style={menuButtonStyle} />
                <BlockButton text={t.UI.LOAD_GAME}    onClick={() => setActiveMenu('LOAD')}         width={menuButtonWidth} style={menuButtonStyle} />
                <BlockButton text={t.UI.TUTORIAL}     onClick={() => triggerTransition(() => initTutorial())} width={menuButtonWidth} style={menuButtonStyle} />
                <BlockButton text={t.UI.ALTAR_SYSTEM} onClick={() => setActiveMenu('ALTAR')}        width={menuButtonWidth} style={menuButtonStyle} />
                <BlockButton text={t.UI.COLLECTION}   onClick={() => setActiveMenu('COLLECTION')}   width={menuButtonWidth} style={menuButtonStyle} />
                <BlockButton text={t.SETTINGS.TITLE}  onClick={() => setActiveMenu('SETTINGS')}     width={menuButtonWidth} style={menuButtonStyle} />
                <BlockButton text={t.UI.QUIT}         onClick={() => setActiveMenu('CONFIRM_QUIT')} variant="danger" width={menuButtonWidth} style={menuButtonStyle} />
            </div>

            {/* ── Popups ── */}

            {activeMenu === 'DIFFICULTY' && (
                <DifficultyPopup
                    onClose={() => setActiveMenu('NONE')}
                    onSelect={handleDifficultySelect}
                />
            )}

            {activeMenu === 'ALTAR' && (
                <AltarSystem onClose={() => setActiveMenu('NONE')} />
            )}

            {activeMenu === 'COLLECTION' && (
                <CollectionPopup onClose={() => setActiveMenu('NONE')} />
            )}

            {activeMenu === 'SETTINGS' && (
                <SettingsMenu
                    onClose={() => setActiveMenu('NONE')}
                    onVolumeChange={(type, vol) => {
                        if (type === 'bgm') AudioManager.setBGMVolume(vol);
                        else AudioManager.setSFXVolume(vol);
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
                    onYes={() => getCurrentWindow().close()}
                    onNo={() => setActiveMenu('NONE')}
                />
            )}
        </div>
    );
};
