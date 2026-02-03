import React, { useState } from 'react';
import { AudioManager } from '../utils/AudioManager';

interface BlockButtonProps {
    text: string;
    onClick: () => void;
    width?: string; // Optional width override
    style?: React.CSSProperties;
    fontSize?: string; // Font size, defaults to 50% of height if not handled by CSS
    disabled?: boolean;
}

export const BlockButton: React.FC<BlockButtonProps> = ({ text, onClick, width = '300px', style, fontSize, disabled = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    const bgImage = disabled
        ? '/assets/etc images/inactivated block_image.png'
        : (isHovered ? '/assets/etc images/activated block_image.png' : '/assets/etc images/inactivated block_image.png');

    // Logic: Font size should be ~1/2 of button height. 
    // We'll rely on padding or fixed aspect ratio.
    // The images are likely rectangular. Let's assume a standard padding.

    return (
        <div
            className="block-button-container"
            onMouseEnter={() => {
                if (!disabled) {
                    setIsHovered(true);
                    // AudioManager.playSFX('/assets/audio/gui/hover.mp3'); // If hover sound exists
                }
            }}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
                if (!disabled) {
                    onClick();
                    // Click sound removed per user request (will be handled by specific actions if needed)
                }
            }}
            style={{
                width: width,
                backgroundImage: `url('${bgImage}')`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 40px', // Creates height based on content or fixed
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: 'all 0.1s ease',
                transform: isHovered && !disabled ? 'scale(1.05)' : 'scale(1)',
                ...style
            }}
        >
            <span style={{
                fontSize: fontSize || '2rem', // Defualt large size
                color: '#fff',
                textShadow: '2px 2px 0 #000',
                fontFamily: 'BebasNeue, sans-serif',
                letterSpacing: '2px',
                pointerEvents: 'none', // Allow clicks to pass through text to div
                textAlign: 'center',
                width: '100%'
            }}>
                {text}
            </span>
        </div>
    );
};
