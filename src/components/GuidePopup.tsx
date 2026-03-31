// components/GuidePopup.tsx
// First-time guide popup for game mechanics, gimmicks, conditions, and chapter intros

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useGameStore } from '../state/gameStore';
import { markGuideSeen } from '../constants/guideData';
import { BlockButton } from './BlockButton';
import './styles/GuidePopup.css';

export const GuidePopup: React.FC = () => {
    const { guidePopup, clearGuidePopup, language } = useGameStore();
    const [isVisible, setIsVisible] = useState(false);
    const [showScrollHint, setShowScrollHint] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (guidePopup) {
            setTimeout(() => setIsVisible(true), 50);
        } else {
            setIsVisible(false);
            setShowScrollHint(false);
        }
    }, [guidePopup]);

    // Check if content is scrollable and update hint visibility
    const checkScrollable = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const canScroll = el.scrollHeight > el.clientHeight + 10;
        const isNearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
        setShowScrollHint(canScroll && !isNearBottom);
    }, []);

    // Check scrollability after popup becomes visible
    useEffect(() => {
        if (isVisible && guidePopup) {
            // Delay to allow rendering
            const timer = setTimeout(checkScrollable, 200);
            return () => clearTimeout(timer);
        }
    }, [isVisible, guidePopup, checkScrollable]);

    // Listen to scroll events on the scroll area
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const handleScroll = () => checkScrollable();
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
    }, [guidePopup, checkScrollable]);

    if (!guidePopup) return null;

    const handleConfirm = () => {
        // Mark as seen in localStorage
        markGuideSeen(guidePopup.key);
        setIsVisible(false);
        setTimeout(() => clearGuidePopup(), 300);
    };

    const title = guidePopup.title[language];
    const body = guidePopup.body[language];
    const confirmText = language === 'KR' ? '확인' : 'CONFIRM';

    // Category-based accent color
    const accentColors: Record<string, string> = {
        CHAPTER_INTRO: '#a8dadc',
        SYSTEM: '#f1c40f',
        GIMMICK: '#e67e22',
        CONDITION: '#e74c3c',
    };
    let accent = accentColors[guidePopup.category] || '#a8dadc';
    if (guidePopup.key === 'condition_regenerating') {
        accent = '#2ecc71';
    }

    const scrollHintText = language === 'KR' ? '아래로 스크롤' : 'Scroll down';

    return (
        <div
            className="guide-popup-overlay"
            style={{ opacity: isVisible ? 1 : 0 }}
        >
            <div
                className="guide-popup-card"
                style={{
                    borderColor: accent,
                    boxShadow: `0 0 40px ${accent}33`,
                    transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
                }}
            >
                {/* Scrollable content area */}
                <div className="guide-popup-scroll-area" ref={scrollRef}>
                    {/* Category Badge */}
                    <div className="guide-popup-badge" style={{ backgroundColor: accent }}>
                        {guidePopup.category === 'CHAPTER_INTRO' && (language === 'KR' ? '📜 챕터 안내' : '📜 Chapter Intro')}
                        {guidePopup.category === 'SYSTEM' && (language === 'KR' ? '📦 시스템 안내' : '📦 System Guide')}
                        {guidePopup.category === 'GIMMICK' && (language === 'KR' ? '⚔️ 기믹 안내' : '⚔️ Gimmick Guide')}
                        {guidePopup.category === 'CONDITION' && (
                            guidePopup.key === 'condition_regenerating' 
                                ? (language === 'KR' ? '💚 상태이상 안내' : '💚 Status Guide')
                                : (language === 'KR' ? '💊 상태이상 안내' : '💊 Status Guide')
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="guide-popup-title" style={{ color: accent }}>
                        {title}
                    </h2>

                    {/* Divider */}
                    <div className="guide-popup-divider" style={{ borderColor: `${accent}44` }} />

                    {/* Body */}
                    <div className="guide-popup-body">
                        {body.split('\n').map((line, i) => (
                            <p key={i} className={line === '' ? 'guide-popup-spacer' : ''}>
                                {line}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Scroll Hint — overlays bottom of scroll area */}
                {showScrollHint && (
                    <div className="guide-popup-scroll-hint">
                        <span className="guide-popup-scroll-hint-text">{scrollHintText}</span>
                        <span className="guide-popup-scroll-hint-arrow">▼</span>
                    </div>
                )}

                {/* Fixed bottom: Divider + Confirm Button */}
                <div className="guide-popup-bottom">
                    <div className="guide-popup-divider" style={{ borderColor: `${accent}44` }} />
                    <div className="guide-popup-btn-wrap">
                        <BlockButton onClick={handleConfirm} text={confirmText} />
                    </div>
                </div>
            </div>
        </div>
    );
};

