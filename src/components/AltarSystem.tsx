import React, { useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useGameStore } from '../state/gameStore';
import { BlockButton } from './BlockButton';
import { Button } from './Common/Button';
import { TROPHIES, ALTAR_SKILLS, ALTAR_PATHS } from '../constants/altarSystem';
import { AltarManager } from '../utils/AltarManager';
import { Difficulty } from '../constants/gameConfig';

interface AltarSystemProps {
    onClose: () => void;
}

const TREE_NODES = [
    { id: '1A', col: 1, row: 5 },
    { id: '1B', col: 1, row: 7 },

    { id: '2A', col: 2, row: 5 },
    { id: '2B', col: 2, row: 7 },

    { id: '3A-1', col: 3, row: 2 },
    { id: '3A-2', col: 3, row: 5 }, // 사냥꾼
    { id: '3B-1', col: 3, row: 7 }, // 보호구 장착
    { id: '3B-2', col: 3, row: 10 },

    { id: '4A-1', col: 4, row: 1 },
    { id: '4A-2', col: 4, row: 3 },
    { id: '4A-3', col: 4, row: 5 }, // 확률왜곡
    { id: '4B-1', col: 4, row: 7 }, // 위상전이
    { id: '4B-2', col: 4, row: 9 },
    { id: '4B-3', col: 4, row: 11 },

    { id: '5A-1', col: 5, row: 1 },
    { id: '5A-2', col: 5, row: 3 },
    { id: '5A-3', col: 5, row: 5 },
    { id: '5B-1', col: 5, row: 7 },
    { id: '5B-2', col: 5, row: 9 },
    { id: '5B-3', col: 5, row: 11 },

    { id: '6A-1', col: 6, row: 2 },
    { id: '6A-2', col: 6, row: 4 },
    { id: '6B-1', col: 6, row: 8 },
    { id: '6B-2', col: 6, row: 10 },

    { id: '7A', col: 7, row: 3 },
    { id: '7B', col: 7, row: 9 },

    { id: '8', col: 8, row: 6 }
];

const PATHS = ALTAR_PATHS;

const CELL = 80;
const COL_GAP = 12;
const ROW_GAP = 12;
const PAD = 10;
const SVG_W = PAD + 8 * CELL + 7 * COL_GAP + PAD; // 744px
const SVG_H = PAD + 11 * CELL + 10 * ROW_GAP + PAD; // (11*80) + (10*12) + 20 = 1020px

const getNodeXY = (nodeId: string) => {
    const node = TREE_NODES.find(n => n.id === nodeId);
    if (!node) return null;
    return {
        x: PAD + (node.col - 1) * (CELL + COL_GAP) + CELL / 2,
        y: PAD + (node.row - 1) * (CELL + ROW_GAP) + CELL / 2
    };
};

export const AltarSystem: React.FC<AltarSystemProps> = ({ onClose }) => {
    const { language } = useGameStore();
    const containerRef = useRef<HTMLDivElement>(null);

    // 탭 상태: NORMAL, HARD, HELL
    const [activeTab, setActiveTab] = useState<Difficulty>(Difficulty.NORMAL);

    const [altarData, setAltarData] = useState(() => AltarManager.getAltarData());
    const [selectedTreeSkill, setSelectedTreeSkill] = useState<string | null>(null);
    const [selectedTrophyId, setSelectedTrophyId] = useState<string | null>(null);
    const [showUnequipConfirm, setShowUnequipConfirm] = useState<number | null>(null);

    const refreshData = useCallback(() => {
        setAltarData(AltarManager.getAltarData());
    }, []);

    // 현재 선택된 탭의 데이터 가져오기
    const getActiveData = () => {
        if (activeTab === Difficulty.HARD) return altarData.hard;
        if (activeTab === Difficulty.HELL) return altarData.hell;
        return altarData.normal;
    };

    const currentData = getActiveData();
    const equippedAltarSkills = currentData.equippedSkills;
    const isTabDisabled = activeTab === Difficulty.HARD || activeTab === Difficulty.HELL;

    // TODO: HARD/HELL 난이도 스킬트리는 나중에 분리. 현재는 임시로 기능을 비활성화
    const handleUnlock = (skillId: string) => {
        if (isTabDisabled) return;
        if (AltarManager.unlockSkill(skillId, activeTab)) {
            refreshData();
        }
    };

    const handleReturn = (skillId: string) => {
        if (isTabDisabled) return;
        AltarManager.returnSkill(skillId, activeTab);
        refreshData();
    };

    const handleEquipToSlot = (skillId: string) => {
        if (isTabDisabled) return;
        if (equippedAltarSkills.includes(skillId)) return;
        if (equippedAltarSkills.length >= 4) return;

        const newEquipped = [...equippedAltarSkills, skillId];
        AltarManager.saveEquippedSkills(newEquipped, activeTab);
        refreshData();
        setSelectedTreeSkill(null);
    };

    const handleUnequipSlot = (index: number) => {
        if (isTabDisabled) return;
        const skillId = equippedAltarSkills[index];
        if (!skillId) return;

        const newEquipped = equippedAltarSkills.filter((_, i) => i !== index);
        AltarManager.saveEquippedSkills(newEquipped, activeTab);
        refreshData();
        setShowUnequipConfirm(null);
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.85)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 1000,
                fontFamily: "'Bebas Neue', 'Noto Sans KR', sans-serif"
            }}>
            <div style={{
                width: '95%', height: '92%', // Slightly shorter to avoid bottom cut
                backgroundColor: '#1a1a2e',
                border: '2px solid #555',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 0 30px rgba(0,0,0,0.8)',
                marginBottom: 'env(safe-area-inset-bottom)', // Safe area support
            }}>
                {/* Header with Tabs */}
                <div style={{
                    padding: '10px 20px', borderBottom: '2px solid #555',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: '#161625'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <h1 style={{ color: '#fff', fontSize: '3rem', margin: 0, marginRight: '20px' }}>{language === 'KR' ? '제단 시스템' : 'ALTAR SYSTEM'}</h1>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button
                                variant={activeTab === Difficulty.NORMAL ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => { setActiveTab(Difficulty.NORMAL); setSelectedTreeSkill(null); }}
                                style={{
                                    backgroundColor: activeTab === Difficulty.NORMAL ? undefined : '#2c3e50',
                                    border: activeTab === Difficulty.NORMAL ? undefined : '2px solid #555',
                                }}
                            >
                                {language === 'KR' ? '보통' : 'NORMAL'}
                            </Button>
                            <Button
                                variant={activeTab === Difficulty.HARD ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => { setActiveTab(Difficulty.HARD); setSelectedTreeSkill(null); }}
                                style={{
                                    backgroundColor: activeTab === Difficulty.HARD ? '#e67e22' : '#2c3e50',
                                    border: activeTab === Difficulty.HARD ? '#d35400' : '2px solid #555',
                                }}
                            >
                                {language === 'KR' ? '어려움' : 'HARD'}
                            </Button>
                            <Button
                                variant={activeTab === Difficulty.HELL ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => { setActiveTab(Difficulty.HELL); setSelectedTreeSkill(null); }}
                                style={{
                                    backgroundColor: activeTab === Difficulty.HELL ? '#e74c3c' : '#2c3e50',
                                    border: activeTab === Difficulty.HELL ? '#c0392b' : '2px solid #555',
                                }}
                            >
                                {language === 'KR' ? '지옥' : 'HELL'}
                            </Button>
                        </div>
                    </div>
                    <BlockButton text="BACK" onClick={onClose} width="100px" height="40px" fontSize="1.2rem" />
                </div>

                {/* Main Body */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
                    {/* Dim Overlay for Hard/Hell */}
                    {isTabDisabled && (
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 900,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <h2 style={{ color: '#fff', fontSize: '3rem', margin: 0, letterSpacing: '2px', textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
                                {language === 'KR' ? '준비 중인 난이도입니다' : 'COMING SOON'}
                            </h2>
                            <p style={{ color: '#bdc3c7', fontSize: '1.2rem', marginTop: '10px' }}>
                                {language === 'KR' ? '추후 업데이트를 통해 새로운 스킬트리가 제공될 예정입니다.' : 'New skill trees will be provided in future updates.'}
                            </p>
                        </div>
                    )}

                    {/* Left Panel: Application Slots */}
                    <div style={{
                        width: '240px', flexShrink: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        padding: '20px', borderRight: '2px solid #555', backgroundColor: '#161625'
                    }}>
                        <h2 style={{ color: '#fff', fontSize: '2rem', margin: '0 0 20px 0', textAlign: 'center' }}>
                            {language === 'KR' ? '적용 슬롯' : 'APPLICATION'} (<span style={{ color: equippedAltarSkills.length === 4 ? '#e74c3c' : '#2ecc71' }}>{equippedAltarSkills.length}</span>/4)
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center' }}>
                            {[0, 1, 2, 3, 4].map(index => {
                                const isPadlocked = index === 4;
                                const skillId = !isPadlocked ? equippedAltarSkills[index] : null;
                                const skill = skillId ? ALTAR_SKILLS[skillId] : null;

                                return (
                                    <div key={`slot-${index}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div onClick={() => {
                                            if (!isPadlocked && skillId && !isTabDisabled) {
                                                setShowUnequipConfirm(index);
                                            }
                                        }}
                                            style={{
                                                width: '72px', height: '72px',
                                                border: '2px solid #7f8c8d',
                                                borderRadius: '8px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: isPadlocked ? 'rgba(0,0,0,0.5)' : '#2c3e50',
                                                cursor: (isPadlocked || !skillId || isTabDisabled) ? 'default' : 'pointer',
                                                position: 'relative',
                                            }}>
                                            <span style={{ position: 'absolute', top: 4, left: 5, color: '#bdc3c7', fontSize: '0.75rem' }}>
                                                {isPadlocked ? 'SLOT 5' : `SLOT ${index + 1}`}
                                            </span>
                                            {isPadlocked ? (
                                                <span style={{ color: '#7f8c8d', fontSize: '1rem', fontWeight: 'bold' }}>LOCKED</span>
                                            ) : skill ? (
                                                <img src={`/assets/altar skills/${skill.image}`} alt={skill.name[language]}
                                                    style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
                                            ) : (
                                                <span style={{ color: '#bdc3c7', fontSize: '1rem' }}>EMPTY</span>
                                            )}
                                        </div>
                                        <span style={{ color: '#ecf0f1', fontSize: '1rem', marginTop: '6px', textAlign: 'center', fontFamily: 'sans-serif', minHeight: '1.2rem' }}>
                                            {skill ? skill.name[language] : (isPadlocked ? '' : 'Empty')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Middle Arrows */}
                    <div style={{
                        width: '80px', flexShrink: 0,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '40px',
                        borderRight: '2px solid #555', backgroundColor: '#1a1a2e'
                    }}>
                        <div style={{ width: '50px', height: '50px', border: '2px solid #555', color: '#555', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 'bold' }}>&lt;</div>
                        <div style={{ width: '50px', height: '50px', border: '2px solid #555', color: '#555', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 'bold' }}>&gt;</div>
                    </div>

                    {/* Center Panel: Skill Tree */}
                    <div style={{ flex: 1, padding: '16px', overflow: 'auto', backgroundColor: '#1a1a2e' }}>
                        <h2 style={{ color: '#fff', fontSize: '2rem', margin: '0 0 10px 0' }}>{language === 'KR' ? '제단 스킬 트리' : 'ALTAR SKILL TREE'}</h2>
                        <div style={{ position: 'relative', display: 'inline-block', width: SVG_W, height: SVG_H }}>
                            <svg style={{ position: 'absolute', top: 0, left: 0, width: SVG_W, height: SVG_H, pointerEvents: 'none', zIndex: 1 }}>
                                {PATHS.map((path, idx) => {
                                    const from = getNodeXY(path.from);
                                    const to = getNodeXY(path.to);
                                    if (!from || !to) return null;
                                    const lineUnlocked = currentData.unlockedSkills.includes(path.from) && currentData.unlockedSkills.includes(path.to);
                                    return (
                                        <line key={`line-${idx}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                            stroke={lineUnlocked ? '#2ecc71' : '#555'} strokeWidth="2" strokeDasharray={lineUnlocked ? 'none' : '6,4'} />
                                    );
                                })}
                            </svg>
                            <div style={{
                                position: 'absolute', top: 0, left: 0, display: 'grid',
                                gridTemplateColumns: `repeat(8, ${CELL}px)`, gridTemplateRows: `repeat(11, ${CELL}px)`,
                                gap: `${ROW_GAP}px ${COL_GAP}px`, padding: `${PAD}px`, width: SVG_W, height: SVG_H, zIndex: 5
                            }}>
                                {TREE_NODES.map(node => {
                                    const isSelected = selectedTreeSkill === node.id;
                                    const isUnlocked = currentData.unlockedSkills.includes(node.id);
                                    const isEquipped = equippedAltarSkills.includes(node.id);
                                    const isImplemented = !!ALTAR_SKILLS[node.id];
                                    const skill = ALTAR_SKILLS[node.id];

                                    return (
                                        <div key={node.id} style={{
                                            gridColumn: node.col, gridRow: node.row,
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
                                            zIndex: isSelected ? 50 : 5, overflow: 'visible'
                                        }}>
                                            <div id={`skill-node-${node.id}`}
                                                onClick={() => { if (isImplemented && !isTabDisabled) setSelectedTreeSkill(isSelected ? null : node.id); }}
                                                style={{
                                                    width: `${CELL - 10}px`, height: `${CELL - 10}px`,
                                                    border: isSelected ? '3px solid #f1c40f' : (isEquipped ? '2px solid #3498db' : (isUnlocked ? '2px solid #2ecc71' : '2px solid #555')),
                                                    borderRadius: '8px', backgroundColor: '#1e2a3a',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: (isImplemented && !isTabDisabled) ? 'pointer' : 'not-allowed',
                                                    position: 'relative',
                                                    boxShadow: isSelected ? '0 0 15px rgba(241,196,15,0.8)' : (isUnlocked ? '0 0 8px rgba(46,204,113,0.3)' : 'none'),
                                                    transition: 'all 0.2s ease-in-out', overflow: 'visible'
                                                }}>
                                                {!isUnlocked && (
                                                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: '6px', zIndex: 2 }} />
                                                )}
                                                {isImplemented && skill?.image ? (
                                                    <img src={`/assets/altar skills/${skill.image}`} alt={skill.name[language]}
                                                        style={{
                                                            width: `${CELL - 20}px`, height: `${CELL - 20}px`, objectFit: 'contain',
                                                            position: 'relative', zIndex: 3, filter: isUnlocked ? 'brightness(1)' : 'brightness(0.4) saturate(0.5)'
                                                        }}
                                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
                                                ) : (
                                                    <span style={{ fontSize: '0.7rem', color: '#7f8c8d', position: 'relative', zIndex: 3 }}>{node.id}</span>
                                                )}
                                            </div>
                                            <span style={{ color: '#ecf0f1', fontSize: '1.2rem', marginTop: '6px', textAlign: 'center', fontFamily: "'Bebas Neue', 'Noto Sans KR', sans-serif", lineHeight: 1.1, maxWidth: `${CELL}px`, wordBreak: 'keep-all', whiteSpace: 'pre-wrap' }}>
                                                {isImplemented ? skill.name[language] : `Skill ${node.id}`}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Panel: Trophy Inventory */}
                <div style={{
                    height: '130px', borderTop: '2px solid #555', backgroundColor: '#161625',
                    padding: '10px 20px', display: 'flex', alignItems: 'center', overflowX: 'auto', gap: '12px', flexShrink: 0,
                    position: 'relative', paddingBottom: `calc(10px + env(safe-area-inset-bottom))`
                }}>
                    <div style={{ width: '120px', color: '#fff', fontSize: '2.2rem', fontWeight: 'bold', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                        {language === 'KR' ? (
                            <>
                                <span>전리품</span>
                                <span>보관함</span>
                            </>
                        ) : (
                            <>
                                <span>TROPHY</span>
                                <span>INVENTORY</span>
                            </>
                        )}
                    </div>
                    {Array.from({ length: 15 }).map((_, i) => {
                        const trophyIds = Object.keys(TROPHIES);
                        const trophyId = trophyIds[i];
                        const trophy = trophyId ? TROPHIES[trophyId] : null;
                        const isOwned = trophyId ? currentData.ownedTrophies.includes(trophyId) : false;
                        const isUsed = trophyId ? (isOwned && !AltarManager.isTrophyAvailable(trophyId, activeTab)) : false;

                        return (
                            <div key={`inv-t-${i}`} data-trophy-id={trophyId || ''}
                                onClick={() => {
                                    if (trophy && isOwned && !isTabDisabled) {
                                        setSelectedTrophyId(prev => prev === trophyId ? null : trophyId);
                                    }
                                }}
                                style={{
                                    width: '85px', height: '85px', flexShrink: 0,
                                    border: selectedTrophyId === trophyId ? '2px dashed #e74c3c' : '2px solid #555',
                                    borderRadius: '4px', backgroundColor: '#2c3e50',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                                    filter: !isOwned ? 'grayscale(100%) opacity(20%)' : (isUsed ? 'opacity(50%)' : 'none'),
                                    cursor: (trophy && isOwned && !isTabDisabled) ? 'pointer' : 'default',
                                    transition: 'border 0.15s'
                                }}>
                                <span style={{ position: 'absolute', top: 2, left: 4, fontSize: '0.7rem', color: '#bdc3c7' }}>{i + 1}</span>
                                {trophy ? (
                                    <img src={`/assets/trophy/${trophy.image}`} alt="Trophy"
                                        style={{ width: '55px', height: '55px', objectFit: 'contain' }}
                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
                                ) : (
                                    <span style={{ color: '#7f8c8d', fontSize: '0.8rem' }}>LOCKED</span>
                                )}
                                {isUsed && (
                                    <div style={{ position: 'absolute', bottom: 2, right: 2, color: '#e74c3c', fontWeight: 'bold', fontSize: 'calc(0.8rem + 2px)', backgroundColor: 'rgba(0,0,0,0.8)', padding: '2px 4px', borderRadius: '4px' }}>
                                        {language === 'KR' ? '사용중' : 'Used'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {/* Trophies Overlay for Hard/Hell */}
                    {isTabDisabled && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10 }} />
                    )}
                </div>
            </div>

            {/* Selected Skill Popup */}
            {selectedTreeSkill && (() => {
                const skill = ALTAR_SKILLS[selectedTreeSkill];
                if (!skill) return null;
                const isUnlocked = currentData.unlockedSkills.includes(selectedTreeSkill);

                return (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }} onClick={() => setSelectedTreeSkill(null)}>
                        <div style={{
                            width: '620px', backgroundColor: '#1a1a2e', border: '3px solid #f1c40f', borderRadius: '12px', padding: '36px',
                            boxShadow: '0 0 40px rgba(0,0,0,0.9), 0 0 20px rgba(241,196,15,0.2)', display: 'flex', flexDirection: 'column', gap: '22px',
                            color: '#fff', fontFamily: "'Noto Sans KR', sans-serif"
                        }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '120px', height: '120px', backgroundColor: '#2c3e50', border: '2px solid #7f8c8d', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                                    <img src={`/assets/altar skills/${skill.image}`} alt={skill.name[language]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '2.4rem', color: '#f1c40f', fontFamily: "'Noto Sans KR', sans-serif" }}>{skill.name[language]}</h3>
                                    <div style={{ color: '#bdc3c7', fontSize: '1.3rem', marginTop: '4px' }}>{language === 'KR' ? '지속시간: ' : 'Duration: '}<span style={{ color: '#2ecc71', fontWeight: 'bold' }}>{skill.duration[language]}</span></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '18px 22px', borderRadius: '8px', borderLeft: '4px solid #95a5a6', fontSize: '1.25rem', lineHeight: '1.65', color: '#bdc3c7', fontStyle: 'italic' }}>
                                    {skill.desc[language]}
                                </div>
                                <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', padding: '18px 22px', borderRadius: '8px', borderLeft: '4px solid #2ecc71', fontSize: '1.35rem', lineHeight: '1.7', color: '#fff' }}>
                                    <strong style={{ color: '#2ecc71', display: 'block', marginBottom: '6px', fontSize: '1.3rem' }}>{language === 'KR' ? '■ 효과 (EFFECT)' : '■ EFFECT'}</strong>
                                    {skill.effect[language].split('\n').map((line, i) => <div key={i}>{line}</div>)}
                                </div>
                            </div>

                            <div style={{ marginTop: '5px' }}>
                                {!isUnlocked ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '1.1rem', fontFamily: "'Bebas Neue', sans-serif" }}>REQUIRED TROPHIES</span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {skill.cost.map(tid => {
                                                    const tObj = TROPHIES[tid];
                                                    const hasThis = currentData.ownedTrophies.includes(tid);
                                                    return tObj ? (
                                                        <div key={tid} style={{ position: 'relative' }}>
                                                            <img src={`/assets/trophy/${tObj.image}`} alt="Trophy" style={{ width: '32px', height: '32px', objectFit: 'contain', filter: hasThis ? 'none' : 'grayscale(1) brightness(0.5)' }} title={tObj.name[language]} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
                                                            {!hasThis && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e74c3c', fontSize: '1.2rem', fontWeight: 'bold' }}>✕</div>}
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                        <Button
                                            variant="primary"
                                            size="md"
                                            disabled={!AltarManager.canUnlockSkill(selectedTreeSkill, activeTab)}
                                            style={{ width: '100%', fontSize: '1.4rem' }}
                                            onClick={() => handleUnlock(selectedTreeSkill)}
                                        >
                                            {language === 'KR' ? '활성화 하기 (ACTIVATE)' : 'ACTIVATE SKILL'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ color: '#2ecc71', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '1.2rem' }}>✓</span> {language === 'KR' ? '현재 활성화 됨' : 'ALREADY ACTIVATED'}</div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                disabled={equippedAltarSkills.includes(selectedTreeSkill) || equippedAltarSkills.length >= 4}
                                                style={{ flex: 1, fontSize: '1.1rem' }}
                                                onClick={() => handleEquipToSlot(selectedTreeSkill)}
                                            >
                                                {language === 'KR' ? (equippedAltarSkills.includes(selectedTreeSkill) ? '이미 장착됨' : '< 슬롯에 적용하기') : '< APPLY TO SLOT'}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                style={{ flex: 1, fontSize: '1.1rem' }}
                                                onClick={() => { handleReturn(selectedTreeSkill); setSelectedTreeSkill(null); }}
                                            >
                                                {language === 'KR' ? '비활성화 (RETURN)' : 'REFUND / RETURN'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div style={{ textAlign: 'center', color: '#7f8c8d', fontSize: '0.8rem', marginTop: '5px' }}>{language === 'KR' ? '바깥을 클릭하여 닫기' : 'Click outside to close'}</div>
                        </div>
                    </div>
                );
            })()}

            {/* Unequip Confirm */}
            {showUnequipConfirm !== null && (() => {
                return (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setShowUnequipConfirm(null)}>
                        <div style={{ width: '320px', backgroundColor: '#1a1a2e', border: '2px solid #e74c3c', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#fff', fontFamily: "'Noto Sans KR', sans-serif" }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', whiteSpace: 'pre-line', fontWeight: 'bold' }}>{language === 'KR' ? '해당 스킬을\n해제 하시겠습니까?' : 'Do you want to\nunequip this skill?'}</h3>
                             <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                <Button variant="danger" size="sm" onClick={() => handleUnequipSlot(showUnequipConfirm)}>YES</Button>
                                <Button variant="secondary" size="sm" onClick={() => setShowUnequipConfirm(null)}>NO</Button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Trophy Info */}
            {selectedTrophyId && (() => {
                const trophy = TROPHIES[selectedTrophyId];
                if (!trophy) return null;
                const el = document.querySelector(`[data-trophy-id="${selectedTrophyId}"]`) as HTMLElement;
                if (!el) return null;
                const rect = el.getBoundingClientRect();

                // Calculate relative position based on 1600x900 logical coordinate system
                const container = containerRef.current;
                if (!container) return null;
                const cRect = container.getBoundingClientRect();
                const scale = cRect.width / 1600;

                const logicalX = (rect.left - cRect.left + rect.width / 2) / scale;
                const logicalY = (rect.top - cRect.top) / scale;

                const popupWidth = 420;
                const halfWidth = popupWidth / 2;
                // Clamp horizontal position to keep popup within screen bounds
                const finalX = Math.max(halfWidth + 20, Math.min(logicalX, 1600 - halfWidth - 20));

                return (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 9999 }} onClick={() => setSelectedTrophyId(null)}>
                        <div style={{
                            position: 'absolute',
                            left: finalX,
                            top: logicalY - 12,
                            transform: 'translate(-50%, -100%)',
                            width: `${popupWidth}px`,
                            backgroundColor: '#1a1a2e',
                            border: '3px solid #f1c40f',
                            borderRadius: '12px',
                            padding: '28px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.9), 0 0 20px rgba(241,196,15,0.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                            color: '#fff',
                            fontFamily: "'Noto Sans KR', sans-serif",
                            textAlign: 'center'
                        }} onClick={(e) => e.stopPropagation()}>
                            <p style={{ margin: 0, color: '#95a5a6', fontSize: '1.1rem', fontWeight: 'bold' }}>{trophy.chapterInfo}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', margin: '5px 0' }}>
                                <img
                                    src={`/assets/trophy/${trophy.image}`}
                                    alt="Trophy"
                                    style={{ width: '85px', height: '85px', objectFit: 'contain' }}
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                                />
                                <h3 style={{ margin: 0, color: '#f1c40f', fontSize: '1.8rem', fontWeight: 'bold', wordBreak: 'keep-all', lineHeight: '1.2' }}>{trophy.name[language]}</h3>
                            </div>
                            <p style={{ margin: 0, color: '#bdc3c7', fontSize: '1.25rem', fontStyle: 'italic', lineHeight: '1.5' }}>{trophy.desc[language]}</p>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};
