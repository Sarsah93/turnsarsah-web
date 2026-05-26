// components/ChapterNextPopup.tsx
// v3.0: 챕터 클리어 후 다음 챕터 자동 연결 팝업

import React from 'react';
import { useGameStore } from '../state/gameStore';
import { GameState } from '../constants/gameConfig';
import { TRANSLATIONS } from '../constants/translations';
import { Button } from './Common/Button';

export const ChapterNextPopup: React.FC = () => {
    const { nextChapterId, enterStageMap, triggerTransition, language, chapterNum } = useGameStore();
    const t = TRANSLATIONS[language] as any;

    // 이전 챕터명 결정 (어디서 왔는지)
    const getPrevAreaName = () => {
        if (chapterNum === '2A') return language === 'KR' ? '사막' : 'Desert';
        if (chapterNum === '2B') return language === 'KR' ? '깊은 숲' : 'Deep Forest';
        return chapterNum;
    };

    // 다음 챕터명 결정
    const getNextChapterName = () => {
        if (nextChapterId === '3A') return t.UI.CHAPTER_3A_NAME;
        if (nextChapterId === '3B') return t.UI.CHAPTER_3B_NAME;
        return nextChapterId;
    };

    const handleEnter = () => {
        triggerTransition(() => {
            enterStageMap(nextChapterId);
        });
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.82)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            color: '#fff',
            fontFamily: "'Noto Sans KR', 'Bebas Neue', sans-serif",
        }}>
            <div style={{
                backgroundColor: 'rgba(15, 15, 30, 0.97)',
                border: '2px solid #a8dadc',
                borderRadius: '16px',
                padding: '48px 56px',
                maxWidth: '560px',
                width: '90%',
                textAlign: 'center',
                boxShadow: '0 0 40px rgba(168,218,220,0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                animation: 'chapterNextFadeIn 0.6s ease-out',
            }}>
                {/* 구분선 상단 */}
                <div style={{
                    width: '100%',
                    borderTop: '1px solid rgba(168,218,220,0.3)',
                    marginBottom: '4px',
                }} />

                {/* 클리어 메시지 */}
                <h2 style={{
                    color: '#a8dadc',
                    fontSize: '3rem',
                    margin: 0,
                    fontFamily: "'Bebas Neue', sans-serif",
                    letterSpacing: '2px',
                    textShadow: '0 0 12px rgba(168,218,220,0.5)',
                }}>
                    {(t.UI.CHAPTER_NEXT_CLEAR as string).replace('{area}', getPrevAreaName())}
                </h2>

                {/* 구분선 */}
                <div style={{
                    width: '100%',
                    borderTop: '1px solid rgba(168,218,220,0.3)',
                }} />

                {/* 섹터 활성화 메시지 */}
                <p style={{
                    fontSize: '1.8rem',
                    margin: 0,
                    color: '#ecf0f1',
                    letterSpacing: '1px',
                }}>
                    {t.UI.CHAPTER_NEXT_ACTIVATED}
                </p>

                {/* 다음 챕터 이름 */}
                <div style={{
                    fontSize: '3.6rem',
                    fontFamily: "'Bebas Neue', sans-serif",
                    color: '#f1c40f',
                    letterSpacing: '3px',
                    textShadow: '0 0 16px rgba(241,196,15,0.5)',
                }}>
                    {getNextChapterName()}
                </div>

                {/* 구분선 하단 */}
                <div style={{
                    width: '100%',
                    borderTop: '1px solid rgba(168,218,220,0.3)',
                    marginTop: '4px',
                }} />

                {/* 이동 버튼 */}
                <Button
                    variant="overlay"
                    size="lg"
                    onClick={handleEnter}
                    style={{
                        marginTop: '8px',
                        width: '240px',
                        borderColor: '#f1c40f',
                        color: '#f1c40f',
                    }}
                >
                    {t.UI.CHAPTER_NEXT_ENTER}
                </Button>
            </div>

            <style>{`
                @keyframes chapterNextFadeIn {
                    from { opacity: 0; transform: translateY(-20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};
