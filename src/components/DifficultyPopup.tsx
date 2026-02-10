// components/DifficultyPopup.tsx

import React from 'react';
import { useGameStore } from '../state/gameStore';
import { Difficulty } from '../constants/gameConfig';
import { BlockButton } from './BlockButton';
import Modal from './Common/Modal';
import './styles/SettingsMenu.css';

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
        <Modal title="SELECT DIFFICULTY" onClose={onClose} width={600} height={550} showCloseButton={false}>
            <div className="settings-content" style={{ padding: '30px', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', alignItems: 'center' }}>
                    {difficulties.map(({ key, label, color }) => {
                        const isUnlocked = unlockedDifficulties.includes(key);
                        return (
                            <button
                                key={key}
                                onClick={() => isUnlocked && onSelect(key)}
                                disabled={!isUnlocked}
                                className="difficulty-btn"
                                style={{
                                    fontFamily: 'BebasNeue',
                                    fontSize: '1.8rem',
                                    padding: '12px 40px',
                                    border: `2px solid ${isUnlocked ? color : '#7f8c8d'}`,
                                    borderRadius: '8px',
                                    backgroundColor: isUnlocked ? 'rgba(0,0,0,0.3)' : 'rgba(50,50,50,0.5)',
                                    color: isUnlocked ? color : '#7f8c8d',
                                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                                    opacity: isUnlocked ? 1 : 0.5,
                                    width: '300px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (isUnlocked) {
                                        e.currentTarget.style.backgroundColor = color;
                                        e.currentTarget.style.color = '#000';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (isUnlocked) {
                                        e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)';
                                        e.currentTarget.style.color = color;
                                    }
                                }}
                            >
                                {isUnlocked ? label : `🔒 ${label}`}
                            </button>
                        );
                    })}
                </div>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                    <BlockButton text="BACK TO MAIN PAGE" onClick={onClose} width="300px" fontSize="1.6rem" />
                </div>
            </div>
        </Modal>
    );
};

