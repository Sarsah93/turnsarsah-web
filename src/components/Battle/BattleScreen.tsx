import React, { useEffect, useState } from 'react';
import { CardHand } from './CardHand';
import { BossDisplay } from './BossDisplay';
import { PlayerDisplay } from './PlayerDisplay';
import { useGameLoop } from '../../logic/useGameLoop';
import { DamageText } from './DamageText';
import { AudioManager } from '../../utils/AudioManager';
import { BlockButton } from '../BlockButton';
import { useGameStore } from '../../state/gameStore';

export const BattleScreen: React.FC = () => {
    const { message, damageTexts, screenEffect, onDamageTextComplete } = useGameLoop();
    const { player } = useGameStore();

    // Pause State
    const [isPaused, setIsPaused] = useState(false);
    const [showSettings, setShowSettings] = useState(false); // In-game settings

    // Audio/Video Setup
    useEffect(() => {
        // Start Background Music
        // AudioManager.playBGM('/assets/backgrounds/wilderness_background.mp3'); 
        // Note: The user mentioned mp3 for audio loop along with mp4 video.

        const bgAudio = new Audio('/assets/backgrounds/wilderness_background.mp3');
        bgAudio.loop = true;
        bgAudio.volume = 0.5; // Default volume
        bgAudio.play().catch(e => console.log("Audio play failed", e));

        return () => {
            bgAudio.pause();
            bgAudio.currentTime = 0;
        };
    }, []);

    // Key Handler for ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsPaused(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSaveGame = () => {
        // Mock Save Logic - local storage
        const saveString = JSON.stringify(useGameStore.getState());
        localStorage.setItem('turnsarsah_save_slot_1', saveString); // Simplified slot 1
        alert("GAME SAVED!");
    };

    const handleQuit = () => {
        // Reload or reset
        window.location.reload();
    };

    return (
        <div className={`battle-screen ${screenEffect}`} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>

            {/* Background Video Layer removed here, using global App layer */}
            {/* <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}> ... </div> */}

            {/* Game Layer (Dimmed if Paused? formatting later) */}
            <div style={{ width: '100%', height: '100%', pointerEvents: isPaused ? 'none' : 'auto', filter: isPaused ? 'blur(5px)' : 'none' }}>

                <BossDisplay />

                <PlayerDisplay />

                {/* Deck Pile (Card Back) - Dummy Staked Look */}
                <div style={{
                    position: 'absolute',
                    bottom: '20px', // Aligned with Hand Y
                    right: '60px',
                    width: '60px', height: '90px', // 1/2 of standard 120x180
                    zIndex: 5
                }}>
                    {/* Dummy stack effect */}
                    {[2, 1, 0].map(i => (
                        <img
                            key={i}
                            src="/assets/cards/BACK2.png"
                            alt="Deck"
                            style={{
                                position: 'absolute',
                                top: -i * 2, left: -i * 2,
                                width: '100%', height: '100%',
                                boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
                                borderRadius: '4px',
                                border: '1px solid rgba(0,0,0,0.3)'
                            }}
                        />
                    ))}
                    <div style={{
                        position: 'absolute', width: '100%', textAlign: 'center', top: '105%',
                        color: '#fff', fontSize: '1rem', fontFamily: 'BebasNeue', textShadow: '1px 1px 1px black'
                    }}>
                        DECK
                    </div>
                </div>

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
                        <span style={{ fontSize: '3rem' }}>CLEARED STAGE {useGameStore.getState().stageNum}!</span>
                    </div>
                )}

                {message === 'DEFEAT...' && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        color: '#c0392b', fontSize: '6rem', fontFamily: 'BebasNeue', fontWeight: 'bold',
                        textShadow: '0 0 20px #e74c3c, 4px 4px 0 #000',
                        zIndex: 1000, textAlign: 'center'
                    }}>
                        DEFEAT!
                    </div>
                )}

                {/* Generic Toast Area */}
                {message && message !== 'VICTORY!' && message !== 'DEFEAT...' && (
                    <div style={{
                        position: 'absolute',
                        top: '40%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(0,0,0,0.7)',
                        padding: '10px 25px',
                        borderRadius: '10px',
                        color: '#f1c40f',
                        fontSize: '3rem',
                        fontFamily: 'BebasNeue',
                        pointerEvents: 'none',
                        animation: 'fadeInOut 2s forwards',
                        zIndex: 100
                    }}>
                        {message}
                    </div>
                )}

                <CardHand />
            </div>

            {/* Pause Menu Overlay */}
            {isPaused && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    zIndex: 100,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundImage: `url('/assets/etc images/rust_textile.png')`, // Using asset per request 2.7
                        backgroundSize: 'cover',
                        padding: '40px',
                        borderRadius: '20px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
                        boxShadow: '0 0 50px rgba(0,0,0,0.9)',
                        border: '4px solid #4a3b2a',
                        minWidth: '400px'
                    }}>
                        <h1 style={{ fontSize: '4rem', fontFamily: 'BebasNeue', color: '#ecf0f1', margin: 0, textShadow: '2px 2px 4px #000' }}>
                            {showSettings ? 'SETTINGS' : 'PAUSE'}
                        </h1>

                        {!showSettings ? (
                            <>
                                <BlockButton text="RESUME" onClick={() => setIsPaused(false)} width="250px" />
                                <BlockButton text="SAVE GAME" onClick={handleSaveGame} width="250px" />
                                <BlockButton text="SETTINGS" onClick={() => setShowSettings(true)} width="250px" />
                                <BlockButton text="QUIT GAME" onClick={handleQuit} width="250px" />
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '300px' }}>
                                <div style={{ width: '100%' }}>
                                    <label style={{ color: '#fff', fontSize: '1.5rem', display: 'block' }}>BGM VOLUME</label>
                                    <input
                                        type="range" min="0" max="1" step="0.1" defaultValue="0.4"
                                        onChange={(e) => AudioManager.setBGMVolume(parseFloat(e.target.value))}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ width: '100%' }}>
                                    <label style={{ color: '#fff', fontSize: '1.5rem', display: 'block' }}>SFX VOLUME</label>
                                    <input
                                        type="range" min="0" max="1" step="0.1" defaultValue="0.5"
                                        onChange={(e) => AudioManager.setSFXVolume(parseFloat(e.target.value))}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <BlockButton text="BACK" onClick={() => setShowSettings(false)} width="200px" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
