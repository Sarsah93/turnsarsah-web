import React, { useEffect, useState } from 'react';
import { CardHand } from './CardHand';
import { BossDisplay } from './BossDisplay';
import { PlayerDisplay } from './PlayerDisplay';
import { useGameLoop } from '../../logic/useGameLoop';
import { DamageText } from './DamageText';
import { AudioManager } from '../../utils/AudioManager';
import { BlockButton } from '../BlockButton';
import { useGameStore } from '../../state/gameStore';
import { GameState } from '../../constants/gameConfig';

import { PauseMenu, SaveLoadMenu, SettingsMenu, ConfirmationPopup } from '../Menu';

export const BattleScreen: React.FC = () => {
    const {
        message, damageTexts, screenEffect, onDamageTextComplete,
        executePlayerAttack, executeCardSwap, startInitialDraw
    } = useGameLoop();
    const store = useGameStore();
    const { playerHand, gamePhase } = store;

    const [selectedCards, setSelectedCards] = useState<number[]>([]);

    // Trigger Initial Draw
    useEffect(() => {
        startInitialDraw();
    }, []);

    // v2.0.0.16: Clear selection on stage change/victory
    useEffect(() => {
        if (store.gameState !== GameState.BATTLE || gamePhase === 'IDLE') {
            setSelectedCards([]);
        }
    }, [store.gameState, gamePhase]);

    // Menu States
    const [activeMenu, setActiveMenu] = useState<'NONE' | 'PAUSE' | 'SETTINGS' | 'SAVE' | 'LOAD' | 'CONFIRM_QUIT'>('NONE');

    // v2.0.0.16: Removed local bgAudio logic as App.tsx handles BGM via AudioManager

    // Key Handler for ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setActiveMenu(prev => prev === 'NONE' ? 'PAUSE' : 'NONE');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleCardSelect = (index: number) => {
        setSelectedCards(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                if (prev.length >= 5) return prev;
                return [...prev, index];
            }
        });
    };

    const handleAttack = () => {
        if (selectedCards.length === 0) return;
        executePlayerAttack(selectedCards);
    };

    const handleSwap = () => {
        if (selectedCards.length === 0) return;
        executeCardSwap(selectedCards);
    };

    const handleSaveGame = () => {
        store.saveGame();
        setActiveMenu('NONE');
        store.setMessage("GAME SAVED!");
    };

    const handleLoadGame = (slot: number) => {
        store.loadGame(slot);
        setActiveMenu('NONE');
    };

    const handleQuit = () => {
        window.location.reload();
    };

    return (
        <div className={`battle-screen ${screenEffect}`} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <div style={{
                width: '100%', height: '100%',
                pointerEvents: (activeMenu !== 'NONE' || gamePhase !== 'IDLE') ? 'none' : 'auto',
                filter: activeMenu !== 'NONE' ? 'blur(5px)' : 'none'
            }}>
                <BossDisplay />
                <PlayerDisplay />

                {/* Damage Texts Layer */}
                {damageTexts.map(dt => (
                    <DamageText
                        key={dt.id}
                        x={dt.x}
                        y={dt.y}
                        text={dt.text}
                        color={dt.color}
                        onComplete={() => onDamageTextComplete(dt.id)}
                    />
                ))}

                {/* Victory / Defeat Overlay */}
                {message === 'VICTORY!' && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        color: '#f1c40f', fontSize: '5rem', fontFamily: 'BebasNeue', fontWeight: 'bold',
                        textShadow: '0 0 20px #f39c12, 4px 4px 0 #000',
                        zIndex: 1000, textAlign: 'center'
                    }}>
                        VICTORY!<br />
                        <span style={{ fontSize: '3rem' }}>CLEARED STAGE {store.stageNum}!</span>
                    </div>
                )}

                {message === 'DEFEAT...' && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        color: '#c0392b', fontSize: '6rem', fontFamily: 'BebasNeue', fontWeight: 'bold',
                        textShadow: '0 0 20px #e74c3c, 4px 4px 0 #000',
                        zIndex: 1000, textAlign: 'center'
                    }}>
                        DEFEAT...
                    </div>
                )}

                {/* Generic Toast Area */}
                {message && message !== 'VICTORY!' && message !== 'DEFEAT...' && (
                    <div style={{
                        position: 'absolute',
                        top: '40%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(0,0,0,0.8)',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        color: '#f1c40f',
                        fontSize: '1.5rem',
                        fontFamily: 'BebasNeue',
                        pointerEvents: 'none',
                        zIndex: 1000,
                        boxShadow: '0 0 15px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(241, 196, 15, 0.3)'
                    }}>
                        {message}
                    </div>
                )}

                {/* Game Over Buttons */}
                {store.gameState === GameState.GAMEOVER && (
                    <div style={{
                        position: 'absolute', top: '70%', left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', gap: '20px', zIndex: 2000
                    }}>
                        <BlockButton text="RETRY" onClick={() => {
                            store.initGame(store.stageNum);
                            store.setGameState(GameState.BATTLE);
                            store.setMessage("");
                        }} width="200px" />
                        <BlockButton text="MAIN MENU" onClick={handleQuit} width="200px" />
                    </div>
                )}

                <CardHand
                    cards={playerHand}
                    selectedCards={selectedCards}
                    onSelectCard={handleCardSelect}
                    onAttack={handleAttack}
                    onSwap={handleSwap}
                    gamePhase={gamePhase}
                    disabled={gamePhase !== 'IDLE'}
                />
            </div>

            {/* High-Fidelity Menu Components Restoration */}
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
                    onAction={handleSaveGame}
                    onClose={() => setActiveMenu('PAUSE')}
                />
            )}

            {activeMenu === 'LOAD' && ( // Added for completion though not in original pause
                <SaveLoadMenu
                    mode="LOAD"
                    onAction={handleLoadGame}
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
                    message="DO YOU WANT TO GO BACK TO MAIN PAGE?"
                    onYes={handleQuit}
                    onNo={() => setActiveMenu('PAUSE')}
                />
            )}
        </div>
    );
};
