import React, { useEffect, useState } from 'react';
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

import { PauseMenu, SaveLoadMenu, SettingsMenu, ConfirmationPopup } from '../Menu';

export const BattleScreen: React.FC = () => {
    const {
        message, damageTexts, screenEffect, onDamageTextComplete,
        executePlayerAttack, executeCardSwap, startInitialDraw
    } = useGameLoop();
    const store = useGameStore();
    const { playerHand, gamePhase, isTutorial, tutorialStep, setTutorialStep } = store;

    const [selectedCards, setSelectedCards] = useState<number[]>([]);

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
                store.setMessage("카드를 최대 두 장 까지 선택 후, SWAP 버튼을 눌러 새로운 카드로 교환하세요");
                return;
            }
            if (tutorialStep === 5) {
                const selected = selectedCards.map(i => playerHand[i]).filter(c => c !== null);
                const hasJoker = selected.some(c => c?.isJoker);
                const ranksMatch = selected.length === 2 && selected[0]?.rank === selected[1]?.rank;
                const isPair = ranksMatch || (selected.length === 2 && hasJoker);

                if (!isPair) {
                    store.setMessage("ONE PAIR를 구성하세요.");
                    return;
                }
                setTutorialStep(6);
            } else if (tutorialStep === 7 || tutorialStep === -7) {
                // Joker attack: Overlay is already hidden or will hide.
                // Do NOT set Step 8 here; wait for turn to end in useGameLoop.
            } else if (tutorialStep === 10 || tutorialStep === -10) {
                // Advance to step 11 after first bleed turn attack
                setTutorialStep(11);
            } else if (tutorialStep === 11) {
                // Move to BOSS RULE (Step 14) after the second bleeding attack.
                setTutorialStep(14);
            } else if (tutorialStep === 16 || tutorialStep === -16) {
                // BOSS RULE PRACTICE (BLIND) - 1st turn
                setTutorialStep(17);
            } else if (tutorialStep === 17 || tutorialStep === -17) {
                // BOSS RULE PRACTICE (BLIND) - 2nd turn
                setTutorialStep(12); // END
            }
        }

        executePlayerAttack(selectedCards);
    };

    const handleSwap = () => {
        if (isTutorial) {
            // Block SWAP only in early fixed tutorial steps (0 to 5)
            if (tutorialStep >= 0 && tutorialStep <= 5) {
                store.setMessage("ONE PAIR를 구성하세요.");
                return;
            }
            if (tutorialStep === 13) {
                if (selectedCards.length === 0) {
                    store.setMessage("교환할 카드를 선택하세요.");
                    return;
                }
                executeCardSwap(selectedCards);
                setTutorialStep(-1); // Finish SWAP guide and return to freedom
                return;
            }
        }
        if (selectedCards.length === 0) return;
        executeCardSwap(selectedCards);
    };

    const handleSaveGame = (slot: number) => {
        store.saveGame(slot);
        setActiveMenu('NONE');
        store.setMessage("GAME SAVED!");
    };

    const handleLoadGame = (slot: number) => {
        store.loadGame(slot);
        setActiveMenu('NONE');
    };

    const handleTutorialNext = () => {
        setTutorialStep(tutorialStep + 1);
    };

    const handleTutorialPrev = () => {
        if (tutorialStep > 0) {
            setTutorialStep(tutorialStep - 1);
        }
    };

    // v2.0.0.21: Tutorial Highlights Orchestration
    useEffect(() => {
        if (!isTutorial) {
            store.setTutorialHighlights([]);
            return;
        }

        const isAlreadySelected = (idx: number) => selectedCards.includes(idx);

        if (tutorialStep === 5) {
            // One Pair - Find top pair dynamically
            const highlights: number[] = [];

            // Helper to get rank value
            const getRankValue = (rank: string) => {
                const values: Record<string, number> = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
                return values[rank] || 0;
            };

            const rankCounts: Record<string, number[]> = {};
            playerHand.forEach((card, idx) => {
                if (card && !card.isJoker && typeof card.rank === 'string') {
                    if (!rankCounts[card.rank]) rankCounts[card.rank] = [];
                    rankCounts[card.rank].push(idx);
                }
            });

            // Find highest value pair
            let bestRank = '';
            let bestValue = -1;
            Object.entries(rankCounts).forEach(([rank, indices]) => {
                if (indices.length >= 2) {
                    const val = getRankValue(rank);
                    if (val > bestValue) {
                        bestValue = val;
                        bestRank = rank;
                    }
                }
            });

            if (bestRank) {
                const pairIndices = rankCounts[bestRank].slice(0, 2);
                pairIndices.forEach(idx => {
                    if (!isAlreadySelected(idx)) highlights.push(idx);
                });
            }

            store.setTutorialHighlights(highlights);
        } else if (tutorialStep === 7) {
            // Joker - usually at index 7 in initTutorial
            store.setTutorialHighlights(isAlreadySelected(7) ? [] : [7]);
        } else if (tutorialStep === 13) {
            // Swap - Pick 2 random (e.g., 0, 1)
            const highlights: number[] = [];
            if (!isAlreadySelected(0)) highlights.push(0);
            if (!isAlreadySelected(1)) highlights.push(1);
            store.setTutorialHighlights(highlights);
        } else if (Math.abs(tutorialStep) === 16 || Math.abs(tutorialStep) === 17) {
            // Blind Practice
            const highlights = store.blindIndices.filter(idx => !isAlreadySelected(idx));
            store.setTutorialHighlights(highlights);
        } else {
            store.setTutorialHighlights([]);
        }
    }, [tutorialStep, selectedCards, isTutorial, store.blindIndices, playerHand]);

    // v2.0.0.21: Apply Blind Rule immediately at Step 16
    useEffect(() => {
        if (isTutorial && (tutorialStep === 15 || tutorialStep === 16)) {
            store.applyStageRules(store.stageNum, store.currentTurn);
        }
    }, [tutorialStep, isTutorial]);

    const handleTutorialExit = () => {
        window.location.reload();
    };

    const handleQuit = () => {
        window.location.reload();
    };

    return (
        <div className={`battle-screen ${screenEffect}`} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            {isTutorial && (
                <TutorialOverlay
                    step={tutorialStep}
                    onNext={handleTutorialNext}
                    onPrev={handleTutorialPrev}
                    onExit={handleTutorialExit}
                />
            )}
            {/* Defeat Dimming Overlay */}
            {store.gameState === GameState.GAMEOVER && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    zIndex: 1500,
                    pointerEvents: 'auto'
                }} />
            )}

            <div style={{
                width: '100%', height: '100%',
                pointerEvents: (activeMenu !== 'NONE' || gamePhase !== 'IDLE' || store.gameState === GameState.GAMEOVER) ? 'none' : 'auto',
                filter: activeMenu !== 'NONE' ? 'blur(5px)' : 'none'
            }}>
                <BossDisplay />
                <PlayerDisplay />

                {/* Damage Texts Layer */}
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

                {/* Victory / Defeat Overlay */}
                {message === 'VICTORY!' && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        color: '#f1c40f', fontSize: '5rem', fontFamily: 'BebasNeue', fontWeight: 'bold',
                        textShadow: '0 0 20px #f39c12, 4px 4px 0 #000',
                        zIndex: 1000, textAlign: 'center'
                    }}>
                        VICTORY!<br />
                        <span style={{ fontSize: '3rem' }}>CLEARED STAGE {store.stageNum}!</span>
                    </div>
                )}

                {message === 'DEFEAT...' && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        color: '#c0392b', fontSize: '6rem', fontFamily: 'BebasNeue', fontWeight: 'bold',
                        textShadow: '0 0 20px #e74c3c, 4px 4px 0 #000',
                        zIndex: 1000, textAlign: 'center'
                    }}>
                        DEFEAT...
                    </div>
                )}

                {/* Generic Toast Area */}
                {message && message !== 'VICTORY!' && message !== 'DEFEAT...' && (
                    <div style={{
                        position: 'absolute',
                        top: '40%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(0,0,0,0.8)',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        color: '#f1c40f',
                        fontSize: '1.5rem',
                        fontFamily: 'BebasNeue',
                        pointerEvents: 'none',
                        zIndex: 1000,
                        boxShadow: '0 0 15px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(241, 196, 15, 0.3)'
                    }}>
                        {message}
                    </div>
                )}

                {/* Game Over Buttons (Centrally Layered and Active) */}
                {store.gameState === GameState.GAMEOVER && (
                    <div style={{
                        position: 'absolute', top: '70%', left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 2000,
                        pointerEvents: 'auto', alignItems: 'center'
                    }}>
                        <BlockButton
                            text="BACK TO MAIN PAGE"
                            onClick={handleQuit}
                            width="300px"
                        />
                    </div>
                )}

                <CardHand
                    cards={playerHand}
                    selectedCards={selectedCards}
                    onSelectCard={handleCardSelect}
                    onAttack={handleAttack}
                    onSwap={handleSwap}
                    gamePhase={gamePhase}
                    disabled={gamePhase !== 'IDLE'}
                />
            </div>

            {/* High-Fidelity Menu Components Restoration */}
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

            {activeMenu === 'LOAD' && ( // Added for completion though not in original pause
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
                    message="DO YOU WANT TO GO BACK TO MAIN PAGE?"
                    onYes={handleQuit}
                    onNo={() => setActiveMenu('PAUSE')}
                />
            )}
        </div>
    );
};
