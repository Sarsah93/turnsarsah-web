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

    const viewportW = window.visualViewport?.width ?? width;
    const viewportH = window.visualViewport?.height ?? height;

    const usableWidth = viewportW - (insets.left + insets.right);
    const usableHeight = viewportH - (insets.top + insets.bottom);

    // 3. Scale-to-fit Logic
    const scale = useMemo(() => {
        const scaleX = usableWidth / BASE_W;
        const scaleY = usableHeight / BASE_H;
        return Math.min(scaleX, scaleY);
    }, [usableWidth, usableHeight]);

    useEffect(() => {
        const vh = viewportH * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }, [viewportH]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.addEventListener('fullscreenchange', handleFullscreenChange);
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
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
        return () => clearTimeout(timer);
    }, [lockOrientation]);

    const canvasStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        width: `${BASE_W}px`,
        height: `${BASE_H}px`,
        transformOrigin: 'center center'
    };

    return (
        <div className={styles.viewport}>
            {!isLandscape && <OrientationWarning language={language} />}

            <div className={styles.desktopCanvas} style={canvasStyle}>
                {children}
            </div>

            {/* Global Fullscreen Button */}
            {!isMobile && (
                <button
                    className={styles.fullscreenBtn}
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    {isFullscreen ? '✕' : '⛶'}
                </button>
            )}
        </div>
    );
};
