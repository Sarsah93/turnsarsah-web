import React, { useState, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { BlockButton } from './BlockButton';
import { AudioManager } from '../utils/AudioManager';
import { SaveLoadMenu, SettingsMenu, ConfirmationPopup } from './Menu';
import { DifficultyPopup } from './DifficultyPopup';
import { Difficulty } from '../constants/gameConfig';
import { TRANSLATIONS } from '../constants/translations';
import { AltarSystem } from './AltarSystem';
import Modal from './Common/Modal';

interface MainMenuProps {
    onOpenDebugStageMap?: (chapterId: string) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onOpenDebugStageMap }) => {
    const { initGameWithDifficulty, initTutorial, loadGame, triggerTransition, language, fontSize, setForceOnePairDance, setForceTwoPairTaeguek, setDifficulty, enterStageMap, initDebugStageMap } = useGameStore();
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
        // v3.0: Enter Stage Map instead of direct battle
        setDifficulty(difficulty);
        triggerTransition(() => enterStageMap('1'));
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

    const [activeMenu, setActiveMenu] = useState<'NONE' | 'SETTINGS' | 'LOAD' | 'CONFIRM_QUIT' | 'DIFFICULTY' | 'ALTAR' | 'STAGE_MAP_DEBUG' | 'STAGE_NORMAL_DEBUG'>('NONE');

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
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <BlockButton text="DEBUG: ONE PAIR DANCE"   onClick={handleDebugOnePairDance}   width="auto" style={{ ...menuButtonStyle, fontSize: '0.85em', padding: '6px 14px', opacity: 0.75 }} />
                        <BlockButton text="DEBUG: TWO PAIR TAEGUEK" onClick={handleDebugTwoPairTaeguek} width="auto" style={{ ...menuButtonStyle, fontSize: '0.85em', padding: '6px 14px', opacity: 0.75 }} />
                        <BlockButton text="🗺️ DEBUG: STAGE MAPS" onClick={() => setActiveMenu('STAGE_MAP_DEBUG')} width="auto" style={{ ...menuButtonStyle, fontSize: '0.85em', padding: '6px 14px', opacity: 0.85, color: '#f1c40f', borderColor: '#f1c40f' }} />
                        <BlockButton text="🚀 DEBUG: START NORMAL" onClick={() => setActiveMenu('STAGE_NORMAL_DEBUG')} width="auto" style={{ ...menuButtonStyle, fontSize: '0.85em', padding: '6px 14px', opacity: 0.85, color: '#3498db', borderColor: '#3498db' }} />
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

            {/* Stage Map Coords Debug Modal */}
            {activeMenu === 'STAGE_MAP_DEBUG' && (
                <Modal
                    title="STAGE MAP COORDS DEBUG"
                    onClose={() => setActiveMenu('NONE')}
                    isOpen={true}
                    width={550}
                    height={500}
                    showCloseButton={false}
                    showBackButton={true}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 24px', alignItems: 'center' }}>
                        <div style={{ color: '#aaa', fontSize: '1.2rem', marginBottom: '8px', textAlign: 'center', fontFamily: 'monospace', lineHeight: 1.4 }}>
                            Select a Stage Map to inspect and measure coordinate points:
                        </div>
                        <BlockButton text="Chapter 1: Meadow Field (들판 지대)" onClick={() => { onOpenDebugStageMap?.('1'); setActiveMenu('NONE'); }} width="400px" height="46px" fontSize="1.3rem" />
                        <BlockButton text="Chapter 2A: Desert (사막 지대)" onClick={() => { onOpenDebugStageMap?.('2A'); setActiveMenu('NONE'); }} width="400px" height="46px" fontSize="1.3rem" />
                        <BlockButton text="Chapter 2B: Deep Forest (깊은 숲)" onClick={() => { onOpenDebugStageMap?.('2B'); setActiveMenu('NONE'); }} width="400px" height="46px" fontSize="1.3rem" />
                        <BlockButton text="Chapter 3A: Cave (동굴 지대)" onClick={() => { onOpenDebugStageMap?.('3A'); setActiveMenu('NONE'); }} width="400px" height="46px" fontSize="1.3rem" />
                        <BlockButton text="Chapter 3B: Swamp (늪지대)" onClick={() => { onOpenDebugStageMap?.('3B'); setActiveMenu('NONE'); }} width="400px" height="46px" fontSize="1.3rem" />
                    </div>
                </Modal>
            )}

            {/* Stage Normal Debug Start Modal */}
            {activeMenu === 'STAGE_NORMAL_DEBUG' && (
                <Modal
                    title="보통 난이도 디버그 시작"
                    onClose={() => setActiveMenu('NONE')}
                    isOpen={true}
                    width={550}
                    height={500}
                    showCloseButton={false}
                    showBackButton={true}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 24px', alignItems: 'center' }}>
                        <div style={{ color: '#aaa', fontSize: '1.2rem', marginBottom: '8px', textAlign: 'center', fontFamily: 'monospace', lineHeight: 1.4 }}>
                            보통 난이도(NORMAL)로 즉시 테스트를 시작할 챕터를 선택하세요:
                        </div>
                        <BlockButton text="들판 챕터 (Meadow Field)" onClick={() => { triggerTransition(() => initDebugStageMap('1', Difficulty.NORMAL)); setActiveMenu('NONE'); }} width="400px" height="46px" fontSize="1.3rem" />
                        <BlockButton text="사막 챕터 (Desert)" onClick={() => { triggerTransition(() => initDebugStageMap('2A', Difficulty.NORMAL)); setActiveMenu('NONE'); }} width="400px" height="46px" fontSize="1.3rem" />
                        <BlockButton text="깊은 숲 챕터 (Deep Forest)" onClick={() => { triggerTransition(() => initDebugStageMap('2B', Difficulty.NORMAL)); setActiveMenu('NONE'); }} width="400px" height="46px" fontSize="1.3rem" />
                        <BlockButton text="동굴 챕터 (Cave)" onClick={() => { triggerTransition(() => initDebugStageMap('3A', Difficulty.NORMAL)); setActiveMenu('NONE'); }} width="400px" height="46px" fontSize="1.3rem" />
                        <BlockButton text="폐광 챕터 (Swamp)" onClick={() => { triggerTransition(() => initDebugStageMap('3B', Difficulty.NORMAL)); setActiveMenu('NONE'); }} width="400px" height="46px" fontSize="1.3rem" />
                    </div>
                </Modal>
            )}
        </div>
    );
};
