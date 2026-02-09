// components/DifficultyPopup.tsx

import React from 'react';
import { useGameStore } from '../state/gameStore';
import { Difficulty } from '../constants/gameConfig';
import { BlockButton } from './BlockButton';

interface DifficultyPopupProps {
    onClose: () => void;
    onSelect: (difficulty: Difficulty) => void;
}

export const DifficultyPopup: React.FC<DifficultyPopupProps> = ({ onClose, onSelect }) => {
    const unlockedDifficulties = useGameStore((state) => state.unlockedDifficulties);

    const difficulties: { key: Difficulty; label: string; color: string }[] = [
        { key: Difficulty.EASY, label: 'EASY', color: '#27ae60' },
        { key: Difficulty.NORMAL, label: 'NORMAL', color: '#3498db' },
        { key: Difficulty.HARD, label: 'HARD', color: '#e67e22' },
        { key: Difficulty.HELL, label: 'HELL', color: '#c0392b' },
    ];

    return (
        <div style={overlayStyle}>
            <div style={popupStyle}>
                <h2 style={{ fontFamily: 'BebasNeue', fontSize: '2.5rem', marginBottom: '30px', color: '#ecf0f1' }}>
                    SELECT DIFFICULTY
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                    {difficulties.map(({ key, label, color }) => {
                        const isUnlocked = unlockedDifficulties.includes(key);
                        return (
                            <button
                                key={key}
                                onClick={() => isUnlocked && onSelect(key)}
                                disabled={!isUnlocked}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: isUnlocked ? color : '#7f8c8d',
                                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                                    opacity: isUnlocked ? 1 : 0.5,
                                }}
                            >
                                {isUnlocked ? label : `🔒 ${label}`}
                            </button>
                        );
                    })}
                </div>
                <div style={{ marginTop: '30px' }}>
                    <BlockButton text="BACK TO MAIN PAGE" onClick={onClose} />
                </div>
            </div>
        </div>
    );
};

const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
};

const popupStyle: React.CSSProperties = {
    backgroundColor: '#2c3e50',
    padding: '40px 50px',
    borderRadius: '15px',
    border: '3px solid #95a5a6',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '350px',
    boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
};

const buttonStyle: React.CSSProperties = {
    fontFamily: 'BebasNeue',
    fontSize: '1.8rem',
    padding: '15px 40px',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    transition: 'all 0.2s ease',
    minWidth: '250px',
};
