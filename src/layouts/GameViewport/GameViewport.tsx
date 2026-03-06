import React, { useEffect, useState, useMemo } from 'react';
import styles from './GameViewport.module.css';
import { useGameStore } from '../../state/gameStore';
import { useViewport } from './useViewport';
import { useOrientation } from './useOrientation';
import { OrientationWarning } from './OrientationWarning';

interface GameViewportProps {
    children: React.ReactNode;
}

// 1. Reference Desktop Resolution Constants
const BASE_W = 1600;
const BASE_H = 900;

export const GameViewport: React.FC<GameViewportProps> = ({ children }) => {
    const language = useGameStore((state) => state.language);
    const { isLandscape, lockOrientation } = useOrientation();
    const { width, height, isMobile } = useViewport();
    const [isFullscreen, setIsFullscreen] = useState(false);

    // 2. Calculate usable area excluding safe-area insets
    // These are typically applied as padding to the body, 
    // but for scale-to-fit, we need to know the actual available pixels.
    const getSafeInsets = () => {
        const style = window.getComputedStyle(document.documentElement);
        return {
            top: parseInt(style.getPropertyValue('--safe-top') || '0'),
            bottom: parseInt(style.getPropertyValue('--safe-bottom') || '0'),
            left: parseInt(style.getPropertyValue('--safe-left') || '0'),
            right: parseInt(style.getPropertyValue('--safe-right') || '0')
        };
    };

    const insets = getSafeInsets();
    const usableWidth = width - (insets.left + insets.right);
    const usableHeight = height - (insets.top + insets.bottom);

    // 3. Scale-to-fit Logic: Calculate the scale factor
    const scale = useMemo(() => {
        const scaleX = usableWidth / BASE_W;
        const scaleY = usableHeight / BASE_H;
        return Math.min(scaleX, scaleY);
    }, [usableWidth, usableHeight]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        lockOrientation();
    }, [lockOrientation]);

    // Apply scale and translation to center the canvas
    const canvasStyle: React.CSSProperties = {
        transform: `scale(${scale})`,
        width: `${BASE_W}px`,
        height: `${BASE_H}px`
    };

    return (
        <div className={`${styles.viewport} safe-area-padding`}>
            {!isLandscape && <OrientationWarning language={language} />}

            {/* 4. Desktop Canvas: The 1600x900 container that scales to fit */}
            <div className={styles.desktopCanvas} style={canvasStyle}>
                <div className={styles.screenContainer}>
                    {children}
                </div>
            </div>

            {/* Global Fullscreen Button */}
            {!isMobile && (
                <button
                    className={styles.fullscreenBtn}
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    {isFullscreen ? '缩小' : '⛶'}
                </button>
            )}
        </div>
    );
};
