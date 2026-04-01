import React, { useRef, useEffect, useState, useCallback } from 'react';

interface VideoBackgroundProps {
    source: string;
}

// 배경 비디오 소스 → 정적 폴백 이미지 매핑
const FALLBACK_IMAGES: Record<string, string> = {
    '/assets/backgrounds/video/wilderness_background.mp4':   '/assets/backgrounds/video/wilderness_background.mp4',
    '/assets/backgrounds/video/desert_background.mp4':       '/assets/backgrounds/video/desert_background.mp4',
    '/assets/backgrounds/video/deep forest.mp4':             '/assets/backgrounds/video/deep forest.mp4',
    '/assets/backgrounds/video/cave_background.mp4':         '/assets/backgrounds/video/cave_background.mp4',
    '/assets/backgrounds/video/swamp_background.mp4':        '/assets/backgrounds/video/swamp_background.mp4',
    '/assets/backgrounds/video/meadow field_background.mp4': '/assets/backgrounds/video/meadow field_background.mp4',
};

// 폴백 그라디언트 색상 (비디오 + 정적 이미지 모두 실패 시)
const FALLBACK_GRADIENTS: Record<string, string> = {
    '/assets/backgrounds/video/wilderness_background.mp4':   'linear-gradient(180deg, #1a2f1a 0%, #2d4a1e 100%)',
    '/assets/backgrounds/video/desert_background.mp4':       'linear-gradient(180deg, #3d2b1a 0%, #6b4a1e 100%)',
    '/assets/backgrounds/video/deep forest.mp4':             'linear-gradient(180deg, #0d1f0d 0%, #1a3b1a 100%)',
    '/assets/backgrounds/video/cave_background.mp4':         'linear-gradient(180deg, #0f0f0f 0%, #1a1520 100%)',
    '/assets/backgrounds/video/swamp_background.mp4':        'linear-gradient(180deg, #0d1a0d 0%, #1a2d15 100%)',
    '/assets/backgrounds/video/meadow field_background.mp4': 'linear-gradient(180deg, #1a2f1a 0%, #2d4a1e 100%)',
};

export const VideoBackground: React.FC<VideoBackgroundProps> = ({ source }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoFailed, setVideoFailed] = useState(false);
    const [videoStalled, setVideoStalled] = useState(false);
    const stalledTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fallbackGradient = FALLBACK_GRADIENTS[source] ?? 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 100%)';

    // 소스 변경 시 폴백 상태 초기화
    useEffect(() => {
        setVideoFailed(false);
        setVideoStalled(false);
        if (videoRef.current) {
            videoRef.current.playbackRate = 1.0;
            videoRef.current.load();
        }
    }, [source]);

    const handleVideoError = useCallback(() => {
        console.warn(`[VideoBackground] Failed to load: ${source}`);
        setVideoFailed(true);
    }, [source]);

    // 3초 넘게 stalled 상태면 재시도
    const handleStalled = useCallback(() => {
        if (stalledTimerRef.current) clearTimeout(stalledTimerRef.current);
        stalledTimerRef.current = setTimeout(() => {
            if (videoRef.current && !videoFailed) {
                console.warn(`[VideoBackground] Stalled, retrying: ${source}`);
                videoRef.current.load();
                videoRef.current.play().catch(() => setVideoFailed(true));
            }
        }, 3000);
    }, [source, videoFailed]);

    const handleCanPlay = useCallback(() => {
        if (stalledTimerRef.current) clearTimeout(stalledTimerRef.current);
        setVideoStalled(false);
    }, []);

    useEffect(() => {
        return () => {
            if (stalledTimerRef.current) clearTimeout(stalledTimerRef.current);
        };
    }, []);

    const showFallback = videoFailed || videoStalled;

    return (
        <div
            className="video-background-container"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                zIndex: 0,
                background: showFallback ? fallbackGradient : '#000',
                transition: 'background 1.5s ease',
            }}
        >
            {/* 비디오 (실패 시에도 DOM에 유지하되 숨김) */}
            <video
                ref={videoRef}
                src={source}
                autoPlay
                loop
                muted
                playsInline
                onError={handleVideoError}
                onStalled={handleStalled}
                onWaiting={handleStalled}
                onCanPlay={handleCanPlay}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'translate(-50%, -50%)',
                    opacity: showFallback ? 0 : 1,
                    transition: 'opacity 0.8s ease',
                }}
            />

            {/* 어두운 오버레이 */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.2)',
            }} />
        </div>
    );
};
