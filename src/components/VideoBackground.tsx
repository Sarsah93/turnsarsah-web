import React, { useRef, useEffect } from 'react';

interface VideoBackgroundProps {
    source: string;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({ source }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 1.0;
        }
    }, []);

    return (
        <div className="video-background-container" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            zIndex: 0,
            backgroundColor: '#000' // Fallback
        }}>
            <video
                ref={videoRef}
                src={source}
                autoPlay
                loop
                muted
                playsInline
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'translate(-50%, -50%)',
                }}
            />
            {/* Optional Overlay for readability if needed, though UI layers handle that */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.2)' // Slight dim
            }} />
        </div>
    );
};
