import React from 'react';
import { useGameStore } from '../state/gameStore';
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
    autoFitEnglish?: boolean; // Widen English long labels to avoid wraps
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
    className = '',
    autoFitEnglish = true
}) => {
    const fontSizeSetting = useGameStore((state) => state.fontSize);
    const isLargeFont = fontSizeSetting === 'LARGE';
    const normalizedText = typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : '';
    const textLen = normalizedText.length;
    const hasCjk = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF\u3040-\u30FF\u4E00-\u9FFF]/.test(normalizedText);
    const minLen = hasCjk ? 4 : 10;
    const shouldAutoWiden = autoFitEnglish && isLargeFont && textLen >= minLen;
    const widthFactor = hasCjk ? 1.8 : 0.9;
    const targetCh = Math.min(30, Math.ceil(textLen * widthFactor) + 2);
    const computedWidth = shouldAutoWiden ? `max(${width}, ${targetCh}ch)` : width;

    return (
        <Button
            variant={variant === 'danger' ? 'danger' : 'overlay'}
            size="md"
            onClick={onClick}
            disabled={disabled}
            className={className}
            style={{
                width: computedWidth,
                height: height,
                fontSize: fontSize || (width === '400px' ? '3rem' : '2.2rem'),
                color: textColor || '#f1c40f',
                borderColor: '#f1c40f',
                whiteSpace: shouldAutoWiden ? 'nowrap' : undefined,
                ...style
            }}
        >
            {text}
        </Button>
    );
};

export default React.memo(BlockButton);
