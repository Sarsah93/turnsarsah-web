import { useState, useEffect, useCallback } from 'react';

export const useViewport = () => {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    const updateVhVariable = useCallback(() => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }, []);

    const handleResize = useCallback(() => {
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight
        });
        updateVhVariable();
    }, [updateVhVariable]);

    useEffect(() => {
        updateVhVariable();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize, updateVhVariable]);

    const isMobile = dimensions.width < 768;
    const isTablet = dimensions.width >= 768 && dimensions.width < 1024;
    const isDesktop = dimensions.width >= 1024;

    return { ...dimensions, isMobile, isTablet, isDesktop };
};
