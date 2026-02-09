import React, { useState } from 'react';
import { AudioManager } from '../utils/AudioManager';

interface BlockButtonProps {
    text: string;
    onClick: () => void;
    width?: string;
    height?: string;
    style?: React.CSSProperties;
    fontSize?: string;
    disabled?: boolean;
    variant?: 'primary' | 'danger';
}

export const BlockButton: React.FC<BlockButtonProps> = ({
    text,
    onClick,
    width = '180px',
    height = 'auto',
    style,
    fontSize = '2.2rem',
    disabled = false,
    variant = 'primary'
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const bgImage = disabled
        ? '/assets/etc images/inactivated block_image.png'
        : (isHovered ? '/assets/etc images/activated block_image.png' : '/assets/etc images/inactivated block_image.png');

    return (
        <div
            className="block-button-container"
            onMouseEnter={() => {
                if (!disabled) {
                    setIsHovered(true);
                }
            }}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
                if (!disabled) {
                    onClick();
                }
            }}
            style={{
                width: width,
                height: height,
                backgroundImage: `url('${bgImage}')`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0', // Reset padding to rely on flexbox centering
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: 'all 0.1s ease',
                transform: isHovered && !disabled ? 'scale(1.05)' : 'scale(1)',
                ...style
            }}
        >
            <span style={{
                fontSize: fontSize,
                color: variant === 'danger' ? '#ff6b6b' : '#fff',
                textShadow: '2px 2px 0 #000',
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: '1px',
                pointerEvents: 'none',
                textAlign: 'center',
                width: '100%'
            }}>
                {text}
            </span>
        </div>
    );
};

// Memoized export for better rendering performance
export default React.memo(BlockButton);
