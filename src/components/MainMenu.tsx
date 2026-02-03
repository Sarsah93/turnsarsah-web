import React, { useState, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { BlockButton } from './BlockButton';
import { AudioManager } from '../utils/AudioManager';
import { GameState } from '../constants/gameConfig';

export const MainMenu: React.FC = () => {
    const { initGame } = useGameStore();

    useEffect(() => {
        // Play Main Menu BGM
        AudioManager.playBGM('/assets/backgrounds/medieval_music_openning.mp3');
    }, []);

    const handleNewGame = () => {
        // AudioManager.playSFX('/assets/audio/gui/click.mp3'); // Optional if added
        initGame(1);
    };

    const [showSettings, setShowSettings] = useState(false);
    const [showLoad, setShowLoad] = useState(false);

    // Settings State
    const [bgmVol, setBgmVol] = useState(40);
    const [sfxVol, setSfxVol] = useState(50);

    const handleVolChange = (type: 'BGM' | 'SFX', val: number) => {
        const vol = Math.max(0, Math.min(100, val));
        const decimal = vol / 100;
        if (type === 'BGM') {
            setBgmVol(vol);
            AudioManager.setBGMVolume(decimal);
        } else {
            setSfxVol(vol);
            AudioManager.setSFXVolume(decimal);
        }
    };

    return (
        <div className="menu-screen" style={{
            position: 'relative', width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            {/* Logo */}
            <img
                src="/assets/etc images/turnsarsah_logo_image.png"
                alt="Turn Sarsah"
                style={{ width: '600px', maxWidth: '90%', marginBottom: '50px' }}
            />

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <BlockButton text="NEW GAME" onClick={() => initGame(1)} />
                <BlockButton text="LOAD GAME" onClick={() => setShowLoad(true)} />
                <BlockButton text="SETTINGS" onClick={() => setShowSettings(true)} />
                <BlockButton text="QUIT" onClick={() => window.close()} />
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-content" style={modalContentStyle}>
                        <h2>SETTINGS</h2>

                        <div className="setting-row" style={settingRowStyle}>
                            <span>BGM: {bgmVol}%</span>
                            <input
                                type="range" min="0" max="100" value={bgmVol}
                                onChange={(e) => handleVolChange('BGM', parseInt(e.target.value))}
                            />
                        </div>

                        <div className="setting-row" style={settingRowStyle}>
                            <span>SFX: {sfxVol}%</span>
                            <input
                                type="range" min="0" max="100" value={sfxVol}
                                onChange={(e) => handleVolChange('SFX', parseInt(e.target.value))}
                            />
                        </div>

                        <div style={{ marginTop: '30px' }}>
                            <BlockButton text="CLOSE" onClick={() => setShowSettings(false)} width="200px" fontSize="1.5rem" />
                        </div>
                    </div>
                </div>
            )}

            {/* Load Game Modal */}
            {showLoad && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-content" style={modalContentStyle}>
                        <h2>SAVED DATA</h2>

                        {[1, 2, 3].map(slot => (
                            <div key={slot} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <BlockButton
                                    text={`SLOT ${slot} - EMPTY`}
                                    onClick={() => alert(`Load Slot ${slot} (Empty)`)}
                                    width="250px"
                                    fontSize="1rem"
                                />
                                <button style={{ background: 'red', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}>DEL</button>
                            </div>
                        ))}

                        <div style={{ marginTop: '30px' }}>
                            <BlockButton text="CLOSE" onClick={() => setShowLoad(false)} width="200px" fontSize="1.5rem" />
                        </div>
                    </div>
                </div>
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
