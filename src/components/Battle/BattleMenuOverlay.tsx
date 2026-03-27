import React from 'react';
import { PauseMenu, SaveLoadMenu, SettingsMenu, ConfirmationPopup } from '../Menu';
import { AudioManager } from '../../utils/AudioManager';

export type ActiveMenuType = 'NONE' | 'PAUSE' | 'SETTINGS' | 'SAVE' | 'LOAD' | 'CONFIRM_QUIT';

interface BattleMenuOverlayProps {
    activeMenu: ActiveMenuType;
    setActiveMenu: React.Dispatch<React.SetStateAction<ActiveMenuType>>;
    onSaveGame: (slot: number) => void;
    onLoadGame: (slot: number) => void;
    onMidGameQuit: () => void;
    t: any;
}

export const BattleMenuOverlay: React.FC<BattleMenuOverlayProps> = ({
    activeMenu,
    setActiveMenu,
    onSaveGame,
    onLoadGame,
    onMidGameQuit,
    t
}) => {
    if (activeMenu === 'NONE') return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'auto'
        }}>
            {activeMenu === 'PAUSE' && (
                <PauseMenu
                    isOpen={true}
                    onResume={() => setActiveMenu('NONE')}
                    onSave={() => setActiveMenu('SAVE')}
                    onSettings={() => setActiveMenu('SETTINGS')}
                    onQuit={() => setActiveMenu('CONFIRM_QUIT')}
                />
            )}
            {activeMenu === 'SAVE' && (
                <SaveLoadMenu
                    mode="SAVE"
                    onAction={onSaveGame}
                    onClose={() => setActiveMenu('PAUSE')}
                />
            )}
            {activeMenu === 'LOAD' && (
                <SaveLoadMenu
                    mode="LOAD"
                    onAction={onLoadGame}
                    onClose={() => setActiveMenu('PAUSE')}
                />
            )}
            {activeMenu === 'SETTINGS' && (
                <SettingsMenu
                    onClose={() => setActiveMenu('PAUSE')}
                    onVolumeChange={(type, vol) => {
                        if (type === 'bgm') AudioManager.setBGMVolume(vol);
                        else AudioManager.setSFXVolume(vol);
                    }}
                />
            )}
            {activeMenu === 'CONFIRM_QUIT' && (
                <ConfirmationPopup
                    message={t.UI.QUIT_CONFIRM}
                    onYes={onMidGameQuit}
                    onNo={() => setActiveMenu('PAUSE')}
                />
            )}
        </div>
    );
};
