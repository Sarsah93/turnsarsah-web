// components/DifficultyPopup.tsx

import React from 'react';
import { useGameStore } from '../state/gameStore';
import { Difficulty } from '../constants/gameConfig';
import { TRANSLATIONS } from '../constants/translations';
import { BlockButton } from './BlockButton';
import { Button } from './Common/Button';
import Modal from './Common/Modal';
import './styles/SettingsMenu.css';

interface DifficultyPopupProps {
    onClose: () => void;
    onSelect: (difficulty: Difficulty) => void;
}

export const DifficultyPopup: React.FC<DifficultyPopupProps> = ({ onClose, onSelect }) => {
    const { unlockedDifficulties, language } = useGameStore();
    const t = TRANSLATIONS[language];

    const difficulties: { key: Difficulty; label: string; color: string }[] = [
        { key: Difficulty.EASY, label: t.UI.DIFFICULTY_EASY, color: '#27ae60' },
        { key: Difficulty.NORMAL, label: t.UI.DIFFICULTY_NORMAL, color: '#3498db' },
        { key: Difficulty.HARD, label: t.UI.DIFFICULTY_HARD, color: '#e67e22' },
        { key: Difficulty.HELL, label: t.UI.DIFFICULTY_HELL, color: '#c0392b' },
    ];

    return (
        <Modal title={t.UI.SELECT_DIFFICULTY} onClose={onClose} width={600} height={550} showCloseButton={false}>
            <div className="settings-content" style={{ padding: '30px', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', alignItems: 'center' }}>
                    {difficulties.map(({ key, label, color }) => {
                        const isUnlocked = unlockedDifficulties.includes(key);
                        const isImplemented = key === Difficulty.EASY || key === Difficulty.NORMAL;
                        const displayLabel = isImplemented
                            ? (isUnlocked ? label : `🔒 ${label}`)
                            : `${label} (${t.UI.UNDER_PREPARATION})`;
                        const canClick = isUnlocked && isImplemented;

                        return (
                            <Button
                                key={key}
                                onClick={() => canClick && onSelect(key)}
                                disabled={!canClick}
                                variant="overlay"
                                size="lg"
                                style={{
                                    width: '350px',
                                    fontSize: '1.8rem',
                                    borderColor: canClick ? '#f1c40f' : '#7f8c8d',
                                    color: canClick ? '#f1c40f' : '#7f8c8d',
                                    opacity: canClick ? 1 : 0.5,
                                    letterSpacing: '2px',
                                }}
                            >
                                {displayLabel}
                            </Button>
                        );
                    })}
                </div>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                    <BlockButton text={t.UI.BACK_TO_MAIN} onClick={onClose} width="300px" fontSize="1.6rem" />
                </div>
            </div>
        </Modal>
    );
};

