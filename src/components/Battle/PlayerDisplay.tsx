import React, { useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { HPBar } from '../Common/HPBar';
import { ConditionIcon } from '../Common/ConditionIcon';
import { TRANSLATIONS } from '../../constants/translations';
import { StatusPopup } from '../StatusPopup';

export const PlayerDisplay: React.FC = () => {
    const { player, language } = useGameStore();
    const t = TRANSLATIONS[language];
    const [statusPopupOpen, setStatusPopupOpen] = useState(false);

    return (
        <>
            <div 
                className="player-display" 
                onClick={() => setStatusPopupOpen(true)}
                style={{
                    position: 'absolute',
                    bottom: '0px', left: '0px',
                    width: '500px',
                    height: '125px',
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    zIndex: 100
                }}
            >
                <HPBar
                    hp={player.hp}
                    maxHp={player.maxHp}
                    label={t.UI.PLAYER}
                    color="blue"
                    align="left"
                />

                {/* Condition Icons (Above HP Bar) */}
                <div className="player-conditions-row" style={{
                    position: 'absolute',
                    bottom: '135px',
                    left: '20px',
                    zIndex: 100
                }}>
                    {Array.from(player.conditions.entries()).map(([name, condition]) => (
                        <ConditionIcon key={name} name={name} condition={condition} popupDirection="top-right" />
                    ))}
                </div>
            </div>

            {statusPopupOpen && (
                <StatusPopup 
                    isOpen={statusPopupOpen} 
                    onClose={() => setStatusPopupOpen(false)} 
                />
            )}
        </>
    );
};
