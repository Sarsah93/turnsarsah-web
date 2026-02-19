import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { HPBar } from '../Common/HPBar';
import { ConditionIcon } from '../Common/ConditionIcon';
import { TRANSLATIONS } from '../../constants/translations';

export const PlayerDisplay: React.FC = () => {
    const { player, language } = useGameStore();
    const t = TRANSLATIONS[language];

    return (
        <div className="player-display" style={{
            position: 'absolute',
            bottom: '0px', left: '0px',
            width: '400px',
            height: '100px',
            pointerEvents: 'none',
            zIndex: 100
        }}>
            <HPBar
                hp={player.hp}
                maxHp={player.maxHp}
                label={t.UI.PLAYER}
                color="blue"
                align="left"
            />

            {/* Condition Icons (Above HP Bar) */}
            <div style={{ display: 'flex', gap: '8px', position: 'absolute', bottom: '110px', left: '10px', zIndex: 100 }}>
                {Array.from(player.conditions.entries()).map(([name, condition]) => (
                    <ConditionIcon key={name} name={name} condition={condition} popupDirection="top-right" />
                ))}
            </div>
        </div>
    );
};
