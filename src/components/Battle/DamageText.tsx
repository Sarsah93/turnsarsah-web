import React, { useEffect, useState } from 'react';

interface DamageTextProps {
    x: number;
    y: number;
    text: string;
    color?: string;
    onComplete: () => void;
}

export const DamageText: React.FC<DamageTextProps> = ({ x, y, text, color = '#e74c3c', onComplete }) => {
    const [offsetY, setOffsetY] = useState(0);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const startTime = Date.now();
        const duration = 1000; // 1 second lifetime

        const loop = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            setOffsetY(-50 * progress); // Move up 50px
            setOpacity(1 - progress);   // Fade out

            if (progress < 1) {
                requestAnimationFrame(loop);
            } else {
                onComplete();
            }
        };

        requestAnimationFrame(loop);
    }, []);

    return (
        <div style={{
            position: 'absolute',
            top: y,
            left: x,
            transform: `translate(-50%, ${offsetY}px)`,
            color: color,
            fontSize: '3rem',
            fontWeight: 'bold',
            fontFamily: 'BebasNeue',
            textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            opacity: opacity,
            zIndex: 100,
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
        }}>
            {text}
        </div>
    );
};
