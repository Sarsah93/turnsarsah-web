// components/GuidePopup.tsx
// First-time guide popup for game mechanics, gimmicks, conditions, and chapter intros

import React, { useEffect, useState } from 'react';
import { useGameStore } from '../state/gameStore';
import { markGuideSeen } from '../constants/guideData';
import { BlockButton } from './BlockButton';
import './styles/GuidePopup.css';

export const GuidePopup: React.FC = () => {
    const { guidePopup, clearGuidePopup, language } = useGameStore();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (guidePopup) {
            setTimeout(() => setIsVisible(true), 50);
        } else {
            setIsVisible(false);
        }
    }, [guidePopup]);

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
    const accent = accentColors[guidePopup.category] || '#a8dadc';

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
                {/* Category Badge */}
                <div className="guide-popup-badge" style={{ backgroundColor: accent }}>
                    {guidePopup.category === 'CHAPTER_INTRO' && (language === 'KR' ? '📜 챕터 안내' : '📜 Chapter Intro')}
                    {guidePopup.category === 'SYSTEM' && (language === 'KR' ? '📦 시스템 안내' : '📦 System Guide')}
                    {guidePopup.category === 'GIMMICK' && (language === 'KR' ? '⚔️ 기믹 안내' : '⚔️ Gimmick Guide')}
                    {guidePopup.category === 'CONDITION' && (language === 'KR' ? '💊 상태이상 안내' : '💊 Status Guide')}
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

                {/* Divider */}
                <div className="guide-popup-divider" style={{ borderColor: `${accent}44` }} />

                {/* Confirm */}
                <div className="guide-popup-btn-wrap">
                    <BlockButton onClick={handleConfirm} text={confirmText} />
                </div>
            </div>
        </div>
    );
};
