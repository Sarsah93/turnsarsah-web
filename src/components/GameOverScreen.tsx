import React, { useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { BlockButton } from './BlockButton';
import { AudioManager } from '../utils/AudioManager';
import { GameState } from '../constants/gameConfig';

export const GameOverScreen: React.FC = () => {
    const { setGameState } = useGameStore();

    useEffect(() => {
        // Play Defeat Audio
        AudioManager.playSFX('/assets/audio/stages/defeat/defeat.mp3');

        // Stop current BGM
        AudioManager.stopBGM();

        return () => {
            // Cleanup if needed
        };
    }, []);

    const handleBackToMenu = () => {
        // Reset and Go to Menu
        useGameStore.getState().resetGame();
        // window.location.reload() or internal state reset
        window.location.reload();
    };

    return (
        <div style={{
            width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)', // Dimming
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'absolute', top: 0, left: 0, zIndex: 999
        }}>
            <h1 style={{
                fontSize: '5rem', fontFamily: 'BebasNeue', color: '#c0392b',
                marginBottom: '50px', textShadow: '0 0 20px #ff0000'
            }}>
                DEFEAT
            </h1>

            <BlockButton text="BACK TO MAIN MENU" onClick={handleBackToMenu} width="400px" />
        </div>
    );
};
