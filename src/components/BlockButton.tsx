import React from 'react';
import { Button } from './Common/Button';

interface BlockButtonProps {
    text: string;
    onClick: () => void;
    width?: string;
    height?: string;
    style?: React.CSSProperties;
    fontSize?: string;
    disabled?: boolean;
    variant?: 'primary' | 'danger' | 'overlay';
    textColor?: string;
    className?: string; // v3.0: Added className for flexibility
}

export const BlockButton: React.FC<BlockButtonProps> = ({
    text,
    onClick,
    width = '180px',
    height = '60px',
    style,
    fontSize,
    disabled = false,
    variant = 'overlay',
    textColor,
    className = ''
}) => {
    return (
        <Button
            variant={variant === 'danger' ? 'danger' : 'overlay'}
            size="md"
            onClick={onClick}
            disabled={disabled}
            className={className}
            style={{
                width: width,
                height: height,
                fontSize: fontSize || (width === '400px' ? '3rem' : '2.2rem'),
                color: textColor || '#f1c40f',
                borderColor: '#f1c40f',
                ...style
            }}
        >
            {text}
        </Button>
    );
};

export default React.memo(BlockButton);
