import { useState, useEffect, useCallback } from 'react';

export const useOrientation = () => {
    const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    );

    const handleOrientationChange = useCallback(() => {
        setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleOrientationChange);
        window.addEventListener('orientationchange', handleOrientationChange);
        return () => {
            window.removeEventListener('resize', handleOrientationChange);
            window.removeEventListener('orientationchange', handleOrientationChange);
        };
    }, [handleOrientationChange]);

    const lockOrientation = async () => {
        try {
            if (screen.orientation && (screen.orientation as any).lock) {
                await (screen.orientation as any).lock('landscape');
            }
        } catch (e) {
            // Silently fail or log once to avoid console spam
            // console.warn('Orientation lock failed:', e);
        }
    };

    return { orientation, isLandscape: orientation === 'landscape', lockOrientation };
};
