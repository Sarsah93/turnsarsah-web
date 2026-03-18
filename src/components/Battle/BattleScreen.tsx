import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { CardHand } from './CardHand';
import { BossDisplay } from './BossDisplay';
import { PlayerDisplay } from './PlayerDisplay';
import { useGameLoop } from '../../logic/useGameLoop';
import { DamageText } from './DamageText';
import { AudioManager } from '../../utils/AudioManager';
import { BlockButton } from '../BlockButton';
import { useGameStore } from '../../state/gameStore';
import { GameState } from '../../constants/gameConfig';
import { TutorialOverlay } from '../Tutorial/TutorialOverlay';
import { TRANSLATIONS } from '../../constants/translations';
import { TrophyPopup } from '../TrophyPopup';
import { GuidePopup } from '../GuidePopup';
import { ALTAR_SKILLS } from '../../constants/altarSystem';
import { AltarSkillSlots } from './AltarSkillSlots';
import { ClearCongratulationsPopup } from '../ClearCongratulationsPopup';

import { PauseMenu, SaveLoadMenu, SettingsMenu, ConfirmationPopup } from '../Menu';
import { BattleField } from './BattleField';

export const BattleScreen: React.FC = () => {
    const {
        message, damageTexts, screenEffect, onDamageTextComplete,
        runCombatSequence, executeCardSwap, startInitialDraw
    } = useGameLoop();
    const store = useGameStore();
    const {
        player, bot, playerHand, gamePhase, isTutorial, tutorialStep,
        setTutorialStep, stageNum, chapterNum, language
    } = store;
    const t = (TRANSLATIONS as any)[language];

    const [selectedCards, setSelectedCards] = useState<number[]>([]);
    const [bossPos, setBossPos] = useState({ centerX: 800, centerY: 285, bottom: 510 });
    const [cardsPos, setCardsPos] = useState({ topCenterX: 800, topCenterY: 700 });
    const handRef = React.useRef<HTMLDivElement | null>(null);

    // Trigger Initial Draw
    useEffect(() => {
        startInitialDraw();
    }, []);

    // v2.0.0.16: Clear selection on stage change/victory
    useEffect(() => {
        const isGameActive = store.gameState === GameState.BATTLE || store.gameState === GameState.TUTORIAL;
        if (!isGameActive || gamePhase === 'IDLE') {
            setSelectedCards([]);
        }
    }, [store.gameState, gamePhase]);

    // Menu States
    const [activeMenu, setActiveMenu] = useState<'NONE' | 'PAUSE' | 'SETTINGS' | 'SAVE' | 'LOAD' | 'CONFIRM_QUIT'>('NONE');

    // v2.0.0.16: Removed local bgAudio logic as App.tsx handles BGM via AudioManager

    // Key Handler for ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (store.gamePhase === 'BOSS_DEFEATED') return; // Block during victory
                setActiveMenu(prev => prev === 'NONE' ? 'PAUSE' : 'NONE');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleCardSelect = (index: number) => {
        // v2.0.0.19: Tutorial Lock - Step 5 requires ONE PAIR (specifically HQ/CQ or HA/CA)
        // For simplicity, any selection is allowed but attack is blocked if not ONE PAIR
        // Actually, user wants "ONE PAIR 외 다른 조합이나 SWAP 버튼을 눌렀을 시 경고"
        if (isTutorial && tutorialStep === 5) {
            // No strict lock on selection, but handleAttack will validate
        }

        setSelectedCards(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                if (prev.length >= 5) return prev;
                return [...prev, index];
            }
        });
    };

    const handleAttack = () => {
        if (selectedCards.length === 0) return;
        if (isTutorial) {
            if (tutorialStep === 13) {
                store.setMessage(t.COMBAT.SWAP_GUIDE);
                return;
            }
            if (tutorialStep === 5) {
                const selected = selectedCards.map(i => playerHand[i]).filter(c => c !== null);
                const hasJoker = selected.some(c => c?.isJoker);
                const ranksMatch = selected.length === 2 && selected[0]?.rank === selected[1]?.rank;
                const isPair = ranksMatch || (selected.length === 2 && hasJoker);

                if (!isPair) {
                    store.setMessage(t.COMBAT.ONE_PAIR_REQ);
                    return;
                }
                setTutorialStep(6);
            } else if (Math.abs(tutorialStep) === 7) {
                // Joker logic handled in loop
            } else if (Math.abs(tutorialStep) === 10) {
                setTutorialStep(11);
            } else if (Math.abs(tutorialStep) === 16) {
                setTutorialStep(17);
            } else if (tutorialStep === 17) {
                setTutorialStep(12);
            }
        }
        runCombatSequence(selectedCards);
    };

    const handleSwap = () => {
        if (isTutorial && tutorialStep >= 0 && tutorialStep <= 5) {
            store.setMessage(t.COMBAT.ONE_PAIR_REQ);
            return;
        }
        if (isTutorial && tutorialStep === 13) {
            if (selectedCards.length === 0) {
                store.setMessage(t.COMBAT.SELECT_SWAP_CARDS);
                return;
            }
            executeCardSwap(selectedCards);
            setTutorialStep(-1);
            return;
        }
        executeCardSwap(selectedCards);
    };

    // v2.4.6: Memoized measurement callbacks to fix infinite loop
    const handleMeasureBoss = useCallback((data: { centerX: number; centerY: number; bottom: number }) => {
        setBossPos(prev => {
            if (Math.abs(prev.centerX - data.centerX) < 0.5 &&
                Math.abs(prev.centerY - data.centerY) < 0.5 &&
                Math.abs(prev.bottom - data.bottom) < 0.5) return prev;
            return data;
        });
    }, []);

    const handleMeasureCards = useCallback((data: { topCenterX: number; topCenterY: number }) => {
        setCardsPos(prev => {
            if (Math.abs(prev.topCenterX - data.topCenterX) < 0.5 &&
                Math.abs(prev.topCenterY - data.topCenterY) < 0.5) return prev;
            return data;
        });
    }, []);

    // v2.4.7: Calculate Anchor Point (Point A and B are now logical units)
    useEffect(() => {
        // Midpoint calculation (using logical pixels from measurements)
        const anchorX = (bossPos.centerX + cardsPos.topCenterX) / 2;
        const anchorY = (bossPos.bottom + cardsPos.topCenterY) / 2;

        const newPos = { x: anchorX, y: anchorY };

        // Prevent infinite loop by checking if value actually changed (logical pixels)
        if (Math.abs(store.scorePreviewHUDPos.x - newPos.x) > 0.5 ||
            Math.abs(store.scorePreviewHUDPos.y - newPos.y) > 0.5) {
            store.setScorePreviewHUDPos(newPos);
        }
    }, [bossPos, cardsPos, store.scorePreviewHUDPos.x, store.scorePreviewHUDPos.y]);

    const handleSaveGame = (slot: number) => {
        if (store.isProcessing) return; // gameStore.saveGame에서 이미 메시지를 처리하므로 여기서 중단
        store.saveGame(slot);
        setActiveMenu('NONE');
        store.setMessage(t.UI.SAVE_SUCCESS);
    };

    const handleLoadGame = (slot: number) => {
        store.loadGame(slot);
        setActiveMenu('NONE');
    };

    const handleTutorialNext = () => setTutorialStep(tutorialStep + 1);
    const handleTutorialPrev = () => tutorialStep > 0 && setTutorialStep(tutorialStep - 1);

    // v2.0.0.21: Tutorial Highlights Orchestration
    useEffect(() => {
        if (!isTutorial) {
            store.setTutorialHighlights([]);
            return;
        }
        const isAlreadySelected = (idx: number) => selectedCards.includes(idx);
        if (tutorialStep === 5) {
            const rankCounts: Record<string, number[]> = {};
            playerHand.forEach((card, idx) => {
                if (card && !card.isJoker && typeof card.rank === 'string') {
                    if (!rankCounts[card.rank]) rankCounts[card.rank] = [];
                    rankCounts[card.rank].push(idx);
                }
            });
            let bestRank = '';
            let bestValue = -1;
            const values: Record<string, number> = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
            Object.entries(rankCounts).forEach(([rank, indices]) => {
                if (indices.length >= 2) {
                    const val = values[rank] || 0;
                    if (val > bestValue) { bestValue = val; bestRank = rank; }
                }
            });
            if (bestRank) {
                const pairIndices = rankCounts[bestRank].slice(0, 2);
                store.setTutorialHighlights(pairIndices.filter(idx => !isAlreadySelected(idx)));
            }
        } else if (Math.abs(tutorialStep) === 7) {
            const jokerIdx = playerHand.findIndex(c => c?.isJoker);
            store.setTutorialHighlights(jokerIdx !== -1 && !isAlreadySelected(jokerIdx) ? [jokerIdx] : []);
        } else if (tutorialStep === 13) {
            store.setTutorialHighlights([0, 1].filter(idx => !isAlreadySelected(idx)));
        } else if ([15, 16, 17, -15, -16, -17].includes(tutorialStep)) {
            store.setTutorialHighlights(store.blindIndices.filter(idx => !isAlreadySelected(idx)));
        } else {
            store.setTutorialHighlights([]);
        }
    }, [tutorialStep, selectedCards, isTutorial, store.blindIndices, playerHand]);

    // v2.0.0.21: Apply Blind Rule immediately at Step 16
    useEffect(() => {
        if (isTutorial && (tutorialStep === 15 || tutorialStep === 16)) {
            store.applyStageRules(store.chapterNum, store.stageNum, store.currentTurn);
        }
    }, [tutorialStep, isTutorial]);

    const handleTutorialExit = () => {
        window.location.reload();
    };

    // Mid-game quit via ESC menu — discard any pending trophies (exploit prevention)
    const handleMidGameQuit = async () => {
        const { AltarManager } = await import('../../utils/AltarManager');
        AltarManager.clearPendingTrophies();
        window.location.reload();
    };

    // Proper game end (defeat, final stage clear) — commit pending trophies permanently
    const handleProperGameEnd = () => window.location.reload();

    return (
        <div className={`battle-screen ${screenEffect}`} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <TrophyPopup />
            <GuidePopup />
            <ClearCongratulationsPopup />

            {/* Entity Layer */}
            <div className={`battle-field-container ${isTutorial && tutorialStep < 10 ? 'tutorial-dim' : ''}`}>
                <BattleField
                    player={player}
                    bot={bot}
                    stageNum={stageNum}
                    onMeasureBoss={handleMeasureBoss}
                />
            </div>

            {/* HUD Layer */}
            <PlayerDisplay />
            <BossDisplay />
            <AltarSkillSlots />

            {/* v2.4.4: Damage Texts moved after BossDisplay but before Card Layer,
                ideally in the portal or high z-index area */}

            {message === t.COMBAT.DEFEAT && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    color: '#c0392b', fontSize: '10rem', fontFamily: 'BebasNeue', fontWeight: 'bold',
                    textShadow: '0 0 30px #e74c3c, 4px 4px 0 #000',
                    zIndex: 1000, textAlign: 'center'
                }}>
                    {t.COMBAT.DEFEAT}
                </div>
            )}

            {/* v2.5.0: Unified Victory Flow — Display only during fanfare */}
            {(store.isVictoryFanfareActive) && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    zIndex: 1000, textAlign: 'center', width: '100%'
                }}>
                    {/* Upper: Area/Chapter phrase (store.message) */}
                    <div style={{
                        color: '#f1c40f', fontSize: '7.5rem', fontFamily: 'BebasNeue', fontWeight: 'bold',
                        textShadow: '0 0 30px #f39c12, 4px 4px 0 #000', marginBottom: '20px'
                    }}>
                        {message}
                    </div>
                    {/* Lower: Stage clear phrase */}
                    <div style={{
                        color: '#ecf0f1', fontSize: '3.5rem', fontFamily: 'BebasNeue',
                        textShadow: '0 0 10px rgba(0,0,0,0.8)'
                    }}>
                        {language === 'KR' ? `스테이지 ${stageNum} 클리어!` : `Stage ${stageNum} Cleared!`}
                    </div>
                </div>
            )}

            {message && message !== t.COMBAT.VICTORY && message !== t.COMBAT.DEFEAT && !store.isVictoryFanfareActive && !message.includes('정화 완료') && !message.includes('Purified') && (
                <div className="battle-toast" style={{
                    position: 'absolute',
                    top: '40%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.85)',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    color: '#f1c40f',
                    fontSize: '2.5rem',
                    fontFamily: 'BebasNeue',
                    pointerEvents: 'none',
                    zIndex: 1005,
                    boxShadow: '0 0 20px rgba(0,0,0,0.6)',
                    border: '2px solid rgba(241, 196, 15, 0.4)'
                }}>
                    {message}
                </div>
            )}

            <div className="card-hand-container" ref={handRef}>
                <CardHand
                    cards={playerHand}
                    selectedCards={selectedCards}
                    onSelectCard={handleCardSelect}
                    onAttack={handleAttack}
                    onSwap={handleSwap}
                    gamePhase={gamePhase}
                    disabled={gamePhase !== 'IDLE' || activeMenu !== 'NONE'}
                    bossCenterX={bossPos.centerX}
                    bossCenterY={bossPos.centerY}
                    scorePreviewPos={store.scorePreviewHUDPos}
                    onMeasureCards={handleMeasureCards}
                />
            </div>

            <div id="battle-portal-root" style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%', height: '100%',
                zIndex: 2500,
                pointerEvents: 'none',
                overflow: 'hidden'
            }}>
                {/* v2.4.4: Damage Texts moved into Portal for consistent layering and coordinate system */}
                {damageTexts.map(dt => (
                    <DamageText
                        key={dt.id}
                        x={dt.x}
                        y={dt.y}
                        text={dt.text}
                        color={dt.color}
                        onComplete={() => onDamageTextComplete(dt.id)}
                    />
                ))}
            </div>

            {/* Final Game Over Buttons Layer — Removed VICTORY condition to avoid duplication with Congratulations Popup */}
            {(store.gameState === GameState.GAMEOVER) && (
                <div className="game-end-overlay" style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    zIndex: 1500,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'auto'
                }}>
                    <div style={{ marginTop: '200px' }}>
                        <BlockButton
                            text={t.UI.BACK_TO_MAIN}
                            onClick={handleProperGameEnd}
                            width="400px"
                        />
                    </div>
                </div>
            )}

            {/* Interaction Overlays */}
            <button
                className="mobile-menu-btn"
                onClick={() => {
                    if (gamePhase === 'BOSS_DEFEATED') return;
                    setActiveMenu('PAUSE');
                }}
                style={{
                    position: 'absolute', bottom: '40px', right: '40px',
                    zIndex: 5000, 
                    backgroundColor: gamePhase === 'BOSS_DEFEATED' ? 'rgba(50,50,50,0.5)' : 'rgba(0,0,0,0.85)',
                    color: gamePhase === 'BOSS_DEFEATED' ? '#7f8c8d' : '#f1c40f', 
                    border: `3px solid ${gamePhase === 'BOSS_DEFEATED' ? '#7f8c8d' : '#f1c40f'}`,
                    borderRadius: '16px', width: '80px', height: '80px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '42px', 
                    cursor: gamePhase === 'BOSS_DEFEATED' ? 'default' : 'pointer',
                    boxShadow: '0 0 25px rgba(0,0,0,0.7)',
                    fontFamily: 'BebasNeue, Arial',
                    opacity: gamePhase === 'BOSS_DEFEATED' ? 0.5 : 1
                }}
            >
                三
            </button>
 
            {/* v2.5.0: Speed Toggle Button - Moved to the left of Pause Button */}
            <button
                className="speed-toggle-btn"
                onClick={() => store.setGameSpeed(store.gameSpeed === 1.0 ? 1.5 : 1.0)}
                style={{
                    position: 'absolute', bottom: '50px', right: '140px',
                    zIndex: 5000, 
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    color: store.gameSpeed === 1.5 ? '#f39c12' : '#ecf0f1',
                    border: `3px solid ${store.gameSpeed === 1.5 ? '#f39c12' : '#bdc3c7'}`,
                    borderRadius: '16px', 
                    width: '80px', height: '60px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', cursor: 'pointer',
                    boxShadow: '0 0 25px rgba(0,0,0,0.7)',
                    fontFamily: 'BebasNeue, Arial',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease-in-out',
                    transform: store.gamePhase !== 'IDLE' ? 'scale(0.9)' : 'scale(1)',
                    opacity: store.gamePhase !== 'IDLE' ? 0.8 : 1
                }}
            >
                {store.gameSpeed === 1.0 ? '1.0x' : '1.5x'}
            </button>

            {isTutorial && (
                <TutorialOverlay
                    step={tutorialStep}
                    onNext={handleTutorialNext}
                    onPrev={handleTutorialPrev}
                    onExit={handleTutorialExit}
                />
            )}

            {/* Modals and Menus Overlay */}
            {activeMenu !== 'NONE' && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    zIndex: 10000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    pointerEvents: 'auto'
                }}>
                    {activeMenu === 'PAUSE' && (
                        <PauseMenu
                            isOpen={true}
                            onResume={() => setActiveMenu('NONE')}
                            onSave={() => setActiveMenu('SAVE')}
                            onSettings={() => setActiveMenu('SETTINGS')}
                            onQuit={() => setActiveMenu('CONFIRM_QUIT')}
                        />
                    )}
                    {activeMenu === 'SAVE' && (
                        <SaveLoadMenu
                            mode="SAVE"
                            onAction={handleSaveGame}
                            onClose={() => setActiveMenu('PAUSE')}
                        />
                    )}
                    {activeMenu === 'LOAD' && (
                        <SaveLoadMenu
                            mode="LOAD"
                            onAction={handleLoadGame}
                            onClose={() => setActiveMenu('PAUSE')}
                        />
                    )}
                    {activeMenu === 'SETTINGS' && (
                        <SettingsMenu
                            onClose={() => setActiveMenu('PAUSE')}
                            onVolumeChange={(type, vol) => {
                                if (type === 'bgm') AudioManager.setBGMVolume(vol);
                                else AudioManager.setSFXVolume(vol);
                            }}
                        />
                    )}
                    {activeMenu === 'CONFIRM_QUIT' && (
                        <ConfirmationPopup
                            message={t.UI.QUIT_CONFIRM}
                            onYes={handleMidGameQuit}
                            onNo={() => setActiveMenu('PAUSE')}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
