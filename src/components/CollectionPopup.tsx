import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useGameStore } from '../state/gameStore';
import { TitleManager } from '../utils/TitleManager';
import { TRANSLATIONS } from '../constants/translations';
import './styles/Modal.css';

interface CollectionPopupProps {
    onClose: () => void;
}

// ─── 컬렉션 아이템 정의 ──────────────────────────────────────
// 향후 Triple/Flush 등 추가 시 여기에만 추가하면 됨
interface CollectionItem {
    id: string;
    handType: string;           // 족보 이름 (KR/EN 공통)
    nameKR: string;
    nameEN: string;
    descKR: string;
    descEN: string;
    targetCount: number;
    videoSrc: string | null;    // null이면 "준비 중" 표시
    comingSoon?: boolean;       // true면 항상 잠금 표시 (향후 추가용)
}

const COLLECTION_ITEMS: CollectionItem[] = [
    {
        id: 'one_pair_dance',
        handType: 'One Pair',
        nameKR: 'ONE PAIR DANCE',
        nameEN: 'ONE PAIR DANCE',
        descKR: 'ONE PAIR로 공격 1,000회 달성 보상',
        descEN: 'Reward for 1,000 ONE PAIR attacks',
        targetCount: 1000,
        videoSrc: '/assets/etc images/one pair dance.mp4',
    },
    {
        id: 'two_pair_taeguek',
        handType: 'Two Pair',
        nameKR: 'TWO PAIR TAEGUEK',
        nameEN: 'TWO PAIR TAEGUEK',
        descKR: 'TWO PAIR로 공격 2,000회 달성 보상',
        descEN: 'Reward for 2,000 TWO PAIR attacks',
        targetCount: 2000,
        videoSrc: '/assets/etc images/two pair taeguek.mp4',
    },
    {
        id: 'triple_coming',
        handType: 'Three of a Kind',
        nameKR: 'TRIPLE ???',
        nameEN: 'TRIPLE ???',
        descKR: 'THREE OF A KIND로 공격 횟수 달성 보상',
        descEN: 'Reward for THREE OF A KIND attacks',
        targetCount: 0,
        videoSrc: null,
        comingSoon: true,
    },
    {
        id: 'four_coming',
        handType: 'Four of a Kind',
        nameKR: 'FOUR OF A KIND ???',
        nameEN: 'FOUR OF A KIND ???',
        descKR: '추후 업데이트 예정',
        descEN: 'Coming in future updates',
        targetCount: 0,
        videoSrc: null,
        comingSoon: true,
    },
    {
        id: 'straight_coming',
        handType: 'Straight',
        nameKR: 'STRAIGHT ???',
        nameEN: 'STRAIGHT ???',
        descKR: '추후 업데이트 예정',
        descEN: 'Coming in future updates',
        targetCount: 0,
        videoSrc: null,
        comingSoon: true,
    },
    {
        id: 'flush_coming',
        handType: 'Flush',
        nameKR: 'FLUSH ???',
        nameEN: 'FLUSH ???',
        descKR: '추후 업데이트 예정',
        descEN: 'Coming in future updates',
        targetCount: 0,
        videoSrc: null,
        comingSoon: true,
    },
    {
        id: 'straight_flush_coming',
        handType: 'Straight Flush',
        nameKR: 'STRAIGHT FLUSH ???',
        nameEN: 'STRAIGHT FLUSH ???',
        descKR: '추후 업데이트 예정',
        descEN: 'Coming in future updates',
        targetCount: 0,
        videoSrc: null,
        comingSoon: true,
    },
    {
        id: 'royal_flush_coming',
        handType: 'Royal Flush',
        nameKR: 'ROYAL FLUSH ???',
        nameEN: 'ROYAL FLUSH ???',
        descKR: '추후 업데이트 예정',
        descEN: 'Coming in future updates',
        targetCount: 0,
        videoSrc: null,
        comingSoon: true,
    },
];

// ─── 개별 아이템 상태 읽기 ────────────────────────────────────
const getItemState = (id: string, _comingSoon?: boolean): { unlocked: boolean; active: boolean; count: number } => {
    if (id === 'one_pair_dance') {
        return {
            unlocked: TitleManager.isOnePairDanceUnlocked(),
            active: TitleManager.isOnePairDanceActive(),
            count: TitleManager.getOnePairCount(),
        };
    }
    if (id === 'two_pair_taeguek') {
        return {
            unlocked: TitleManager.isTwoPairTaeguekUnlocked(),
            active: TitleManager.isTwoPairTaeguekActive(),
            count: TitleManager.getTwoPairCount(),
        };
    }
    return { unlocked: false, active: false, count: 0 };
};

// ─── 미리보기 비디오 컴포넌트 ─────────────────────────────────
const PreviewVideo: React.FC<{ src: string }> = ({ src }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [playing, setPlaying] = useState(false);

    const togglePlay = useCallback(() => {
        const vid = videoRef.current;
        if (!vid) return;
        if (vid.paused) {
            vid.play().catch(() => {});
            setPlaying(true);
        } else {
            vid.pause();
            vid.currentTime = 0;
            setPlaying(false);
        }
    }, []);

    // 언마운트 시 정지
    useEffect(() => {
        return () => {
            videoRef.current?.pause();
        };
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}
            onClick={togglePlay}
        >
            <video
                ref={videoRef}
                src={encodeURI(src)}
                loop
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onEnded={() => setPlaying(false)}
            />
            {/* 오버레이 플레이 버튼 */}
            {!playing && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.45)',
                    transition: 'background 0.2s',
                }}>
                    <div style={{
                        width: 56, height: 56,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(241,196,15,0.9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.6rem',
                        boxShadow: '0 0 18px rgba(241,196,15,0.5)',
                    }}>▶</div>
                </div>
            )}
            {playing && (
                <div style={{
                    position: 'absolute', bottom: 8, right: 10,
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                    letterSpacing: '1px',
                }}>■ 정지</div>
            )}
        </div>
    );
};

// ─── 단일 컬렉션 카드 ─────────────────────────────────────────
const CollectionCard: React.FC<{
    item: CollectionItem;
    isKR: boolean;
    t: typeof TRANSLATIONS['KR']['UI'];
}> = ({ item, isKR, t }) => {
    const store = useGameStore();
    const [itemState, setItemState] = useState(() => getItemState(item.id, item.comingSoon));

    const handleToggle = () => {
        if (!itemState.unlocked) return;
        const nextActive = !itemState.active;

        // localStorage 저장
        if (item.id === 'one_pair_dance') {
            TitleManager.setOnePairDanceActive(nextActive);
            store.setCollectionOnePairDanceActive(nextActive);
        } else if (item.id === 'two_pair_taeguek') {
            TitleManager.setTwoPairTaeguekActive(nextActive);
            store.setCollectionTwoPairTaeguekActive(nextActive);
        }

        setItemState(prev => ({ ...prev, active: nextActive }));
    };

    const name = isKR ? item.nameKR : item.nameEN;
    const desc = isKR ? item.descKR : item.descEN;

    // ── COMING SOON 카드 ──
    if (item.comingSoon) {
        return (
            <div style={{
                backgroundColor: '#0e0e1a',
                border: '2px solid #2a2a45',
                borderRadius: '10px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                opacity: 0.55,
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    backgroundColor: '#1a1a30',
                    border: '2px solid #333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem', flexShrink: 0,
                }}>🔒</div>
                <div>
                    <div style={{ color: '#555', fontSize: '1.6rem', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px' }}>{name}</div>
                    <div style={{ color: '#444', fontSize: '1.1rem', marginTop: '2px' }}>{t.COLLECTION_COMING_SOON}</div>
                </div>
            </div>
        );
    }

    const progressPct = item.targetCount > 0
        ? Math.min(100, Math.floor((itemState.count / item.targetCount) * 100))
        : 0;

    return (
        <div style={{
            backgroundColor: itemState.unlocked ? '#111128' : '#0d0d1e',
            border: `2px solid ${itemState.unlocked ? (itemState.active ? '#f1c40f' : '#4a4a70') : '#2a2a40'}`,
            borderRadius: '12px',
            padding: '20px 24px',
            transition: 'border-color 0.25s',
            boxShadow: itemState.active ? '0 0 18px rgba(241,196,15,0.15)' : 'none',
        }}>
            {/* 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.8rem' }}>{itemState.unlocked ? '🏆' : '🔒'}</span>
                    <div>
                        <div style={{
                            color: itemState.unlocked ? '#f1c40f' : '#555',
                            fontSize: '2rem',
                            fontFamily: "'Bebas Neue', sans-serif",
                            letterSpacing: '1.5px',
                            lineHeight: 1,
                        }}>{name}</div>
                        <div style={{ color: itemState.unlocked ? '#aaa' : '#444', fontSize: '1.15rem', marginTop: '3px' }}>{desc}</div>
                    </div>
                </div>

                {/* 상태 뱃지 */}
                {itemState.unlocked && (
                    <div style={{
                        padding: '4px 14px',
                        borderRadius: '20px',
                        backgroundColor: itemState.active ? 'rgba(241,196,15,0.15)' : 'rgba(80,80,120,0.3)',
                        border: `1px solid ${itemState.active ? '#f1c40f' : '#4a4a70'}`,
                        color: itemState.active ? '#f1c40f' : '#666',
                        fontSize: '1.1rem',
                        fontFamily: "'Bebas Neue', sans-serif",
                        letterSpacing: '1px',
                        flexShrink: 0,
                    }}>
                        {itemState.active ? t.COLLECTION_ACTIVE : t.COLLECTION_INACTIVE}
                    </div>
                )}
            </div>

            {/* 본문 */}
            {itemState.unlocked ? (
                <div>
                    {/* 미리보기 + 적용 버튼 */}
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        {/* 미리보기 영상 */}
                        {item.videoSrc && (
                            <div style={{ flex: '0 0 300px' }}>
                                <div style={{ color: '#888', fontSize: '1.1rem', marginBottom: '6px' }}>{t.COLLECTION_PREVIEW}</div>
                                <PreviewVideo src={item.videoSrc} />
                            </div>
                        )}

                        {/* 적용 버튼 영역 */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: '10px', minHeight: '100px' }}>
                            <div style={{ color: '#666', fontSize: '1.05rem' }}>
                                {isKR ? '미리보기를 클릭해 연출을 확인하고 적용 여부를 선택하세요.' : 'Click preview to check the animation, then choose to apply or remove.'}
                            </div>
                            <button
                                onClick={handleToggle}
                                style={{
                                    padding: '10px 28px',
                                    borderRadius: '8px',
                                    border: `2px solid ${itemState.active ? '#e74c3c' : '#f1c40f'}`,
                                    backgroundColor: itemState.active ? 'rgba(231,76,60,0.15)' : 'rgba(241,196,15,0.15)',
                                    color: itemState.active ? '#e74c3c' : '#f1c40f',
                                    fontFamily: "'Bebas Neue', 'Noto Sans KR', sans-serif",
                                    fontSize: '1.4rem',
                                    letterSpacing: '1px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                            >
                                {itemState.active ? t.COLLECTION_REMOVE : t.COLLECTION_APPLY}
                            </button>
                        </div>
                    </div>

                    {/* 달성 카운트 — 언락 후에도 항상 표시 */}
                    {item.targetCount > 0 && (
                        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #2a2a40' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' }}>
                                <span style={{ color: '#666', fontSize: '1.1rem' }}>{t.COLLECTION_PROGRESS}</span>
                                <span style={{ color: '#f1c40f', fontSize: '1.15rem', fontFamily: 'monospace', letterSpacing: '1px' }}>
                                    {Math.min(itemState.count, item.targetCount).toLocaleString()} / {item.targetCount.toLocaleString()} ✓
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: '#1a1a30', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: '100%', height: '100%', backgroundColor: '#f1c40f', borderRadius: '4px' }} />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* 잠금 상태 — 진행도 바 */
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#555', fontSize: '1.15rem' }}>{t.COLLECTION_PROGRESS}</span>
                        <span style={{ color: '#666', fontSize: '1.15rem', fontFamily: 'monospace' }}>
                            {itemState.count.toLocaleString()} / {item.targetCount.toLocaleString()}
                        </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#1a1a30', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${progressPct}%`,
                            height: '100%',
                            backgroundColor: progressPct >= 75 ? '#f1c40f' : progressPct >= 40 ? '#e67e22' : '#4a4a70',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease',
                        }} />
                    </div>
                    <div style={{ color: '#444', fontSize: '1.05rem', marginTop: '6px', textAlign: 'right' }}>
                        {progressPct}%
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── 메인 CollectionPopup ─────────────────────────────────────
export const CollectionPopup: React.FC<CollectionPopupProps> = ({ onClose }) => {
    const { language } = useGameStore();
    const t = TRANSLATIONS[language].UI;
    const isKR = language === 'KR';

    return ReactDOM.createPortal(
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.88)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000,
            fontFamily: "'Bebas Neue', 'Noto Sans KR', sans-serif",
        }}>
            <div style={{
                width: '92%', height: '90%',
                backgroundColor: '#1a1a2e',
                border: '2px solid #555',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 0 40px rgba(0,0,0,0.9)',
                borderRadius: '4px',
            }}>
                {/* ── Header ── */}
                <div style={{
                    padding: '12px 24px',
                    borderBottom: '2px solid #333',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: '#161625',
                    flexShrink: 0,
                }}>
                    <h1 style={{ color: '#f1c40f', fontSize: '3rem', margin: 0, letterSpacing: '3px' }}>
                        🏆 {t.COLLECTION_TITLE}
                    </h1>
                    <button className="modal-back-btn" onClick={onClose}>
                        {isKR ? '뒤로가기' : 'BACK'}
                    </button>
                </div>

                {/* ── Body ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* 섹션 헤더 */}
                    <div style={{
                        color: '#f39c12',
                        fontSize: '1.5rem',
                        letterSpacing: '3px',
                        paddingBottom: '10px',
                        borderBottom: '1px solid #2a2a40',
                        marginBottom: '4px',
                    }}>
                        ◆ {t.COLLECTION_ATTACK_ANIM}
                    </div>

                    {/* 아이템 목록 */}
                    {COLLECTION_ITEMS.map(item => (
                        <CollectionCard
                            key={item.id}
                            item={item}
                            isKR={isKR}
                            t={t}
                        />
                    ))}
                </div>
            </div>
        </div>,
        document.getElementById('root') ?? document.body
    );
};
