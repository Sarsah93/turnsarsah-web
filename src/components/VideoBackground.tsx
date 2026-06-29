import React, { useRef, useEffect, useState, useCallback } from 'react';

interface VideoBackgroundProps {
    source: string;
}

// 배경 비디오 소스 → 포스터 이미지 매핑 (영상 로드 전 즉시 표시)
const POSTER_IMAGES: Record<string, string> = {
    '/assets/backgrounds/video/wilderness_background.mp4':   '/assets/backgrounds/video/wilderness_poster.jpg',
    '/assets/backgrounds/video/desert_background.mp4':       '/assets/backgrounds/video/desert_poster.jpg',
    '/assets/backgrounds/video/deep forest.mp4':             '/assets/backgrounds/video/deep_forest_poster.jpg',
    '/assets/backgrounds/video/cave_background.mp4':         '/assets/backgrounds/video/cave_poster.jpg',
    '/assets/backgrounds/video/swamp_background.mp4':        '/assets/backgrounds/video/swamp_poster.jpg',
    '/assets/backgrounds/video/meadow field_background.mp4': '/assets/backgrounds/video/meadow_field_poster.jpg',
};

// 폴백 그라디언트 색상 — 비디오 로딩 전에도 즉시 표시
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
    const posterImage = POSTER_IMAGES[source];

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

    const handlePlaying = useCallback(() => {
        if (stalledTimerRef.current) clearTimeout(stalledTimerRef.current);
        setVideoStalled(false);
        setVideoFailed(false);
    }, []);

    // 탭 방치 후 복귀 시 비디오 재개 (Page Visibility API)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && videoRef.current && !videoFailed) {
                if (videoRef.current.paused) {
                    videoRef.current.play().catch(() => {
                        // 자동재생 정책 차단 시 조용히 무시 (muted이므로 거의 발생 안 함)
                    });
                }
                // stalled 상태였다면 리셋 후 재시도
                setVideoStalled(false);
                if (stalledTimerRef.current) clearTimeout(stalledTimerRef.current);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [videoFailed]);

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
                // 비디오 로딩 전·실패 시 모두 그라디언트 표시 (검정 화면 방지)
                background: fallbackGradient,
                transition: 'background 1.5s ease',
            }}
        >
            {/* 비디오: 준비 완료(videoReady) 전에는 투명, 완료 후 페이드인 */}
            <video
                ref={videoRef}
                src={source}
                poster={posterImage}   /* 로드 전 즉시 첫 프레임 정지 이미지 표시 */
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onError={handleVideoError}
                onStalled={handleStalled}
                onWaiting={handleStalled}
                onCanPlay={handleCanPlay}
                onPlaying={handlePlaying}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'translate(-50%, -50%)',
                    opacity: showFallback ? 0 : 1,  /* poster 덕분에 처음부터 표시 가능 */
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
