import React from 'react';
import { useGameStore } from '../../state/gameStore';

export const FadeOverlay: React.FC = () => {
    const { isTransitioning } = useGameStore();

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                zIndex: 999999,
                pointerEvents: 'none', // Allow clicks through if not fully visible, but we control it with opacity
                opacity: isTransitioning ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out',
                display: 'block'
            }}
        />
    );
};
