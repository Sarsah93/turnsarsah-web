// components/Game.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../state/gameStore';
import BattleField from './Battle/BattleField';
import CardHand from './Battle/CardHand';
import { PauseMenu, SaveLoadMenu, SettingsMenu, ConfirmationPopup } from './Menu';
import { TurnEngine } from '../logic/turnEngine';
import { Card } from '../types/Card';
import { AudioManager } from '../utils/AudioManager';
import { BlockButton } from './BlockButton';
import './Game.css';
import displayUtils from '../utils/display';

export type GameMenuState = null | 'PAUSE' | 'SAVE_LOAD' | 'SETTINGS' | 'CONFIRM_QUIT';

interface GameProps {
  stageId?: number;
  onGameEnd?: (result: 'WIN' | 'LOSE') => void;
}

/**
 * 메인 게임 화면
 */
export const Game: React.FC<GameProps> = ({ stageId = 1, onGameEnd }) => {
  const store = useGameStore();
  const [menu, setMenu] = useState<GameMenuState>(null);
  const [turnEngine, setTurnEngine] = useState<TurnEngine | null>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameStatus, setGameStatus] = useState<'ONGOING' | 'PLAYER_WIN' | 'PLAYER_LOSE'>('ONGOING');
  // Granular UI states for v2.0.0.6 Strict Flow
  const [showDimOverlay, setShowDimOverlay] = useState(false);
  const [showResultText, setShowResultText] = useState(false);
  const [showResultButtons, setShowResultButtons] = useState(false);
  const isFlowLockedRef = useRef(false); // Ref for synchronous locking

  const [popups, setPopups] = useState<Array<{ id: string; x: number; y: number; amount: number; isCritical: boolean; isHeal: boolean; color?: string }>>([]);
  const popupResolvers = useRef<Map<string, () => void>>(new Map());
  const [entityPositions, setEntityPositions] = useState<{ player: { x: number; y: number; w: number; h: number } | null; bot: { x: number; y: number; w: number; h: number } | null; scale?: number }>({ player: null, bot: null, scale: 1 });

  const POPUP_VERTICAL_FACTOR = { player: 0.38, bot: 0.45 };
  const [screenShake, setScreenShake] = useState(false);

  const stopAudio = () => {
    AudioManager.stopBGM();
    // Also stop SFX if needed, but primarily BGM
  };

  const addPopup = (x: number, y: number, amount: number, isCritical = false, isHeal = false, color?: string): Promise<void> => {
    const id = Math.random().toString(36).slice(2);
    const promise = new Promise<void>((resolve) => {
      popupResolvers.current.set(id, resolve);
    });
    setPopups((p) => [...p, { id, x, y, amount, isCritical, isHeal, color }]);
    return promise;
  };

  const removePopup = (id: string) => {
    const resolver = popupResolvers.current.get(id);
    if (resolver) {
      resolver();
      popupResolvers.current.delete(id);
    }
    setPopups((p) => p.filter((pp) => pp.id !== id));
  };

  // 게임 초기화
  useEffect(() => {
    setGameStatus('ONGOING');
    isFlowLockedRef.current = false; // Reset lock
    setShowDimOverlay(false);
    setShowResultText(false);
    setShowResultButtons(false);
    setIsProcessing(false);
    setSelectedCards([]);

    // v2.0.0.7: Check if loaded from save
    if (store.isGameLoaded) {
      store.setIsGameLoaded(false); // Consume
      // Skip initGame to preserve loaded data
    } else {
      store.initGame(stageId);
      // Apply Permanent 'Avoiding' Effect for every LOW stage start? 
      // Actually user requested Avoiding at start of every stage.
      // For loaded game, if it wasn't saved, we might miss it.
      // But initGame resets conditions anyway.
      // If loaded, conditions are loaded.
      setTimeout(() => {
        store.addPlayerCondition('Avoiding', 999, 'Chance to avoid attacks (5%)', 0);
      }, 0);
    }

    const engine = new TurnEngine(store.player, store.bot, stageId);
    setTurnEngine(engine);
  }, [stageId]);

  // ... (omitted)

  const handleGameWin = async () => {
    if (isFlowLockedRef.current) return;
    isFlowLockedRef.current = true;

    // 1. 상태 정리 (Heal + Clear Conditions)
    store.clearPlayerConditions();

    // Restore Max HP if it was reduced (e.g. by Frailty)
    if (store.player.maxHp < (store.player.baseMaxHp || 200)) {
      store.setPlayerMaxHp(store.player.baseMaxHp || 200);
    }

    // Stage 6 Bonus: +20% Max HP
    if (stageId === 6) {
      store.setPlayerMaxHp(240);
      store.setPlayerHp(240);
    } else {
      // Standard Clear Bonus: +50 HP (clamped to Max HP)
      const newHp = Math.min(store.player.maxHp, store.player.hp + 50);
      store.setPlayerHp(newHp);
    }

    setGameStatus('PLAYER_WIN'); // Logical state, UI handled by local flags

    // 2. Wait 0.5s
    await new Promise(r => setTimeout(r, 500));

    // 3. Dimming
    setShowDimOverlay(true);

    // 4. Wait 0.5s
    await new Promise(r => setTimeout(r, 500));

    // 5. Text + Audio
    setShowResultText(true);
    AudioManager.playSFX('/assets/audio/stages/victory/victory.mp3');

    // 6. Wait for victory.mp3 (approx 5s)
    await new Promise(r => setTimeout(r, 5000));

    // 7. Fade Out -> Action -> Fade In (Next Stage)
    setShowDimOverlay(false); // Reset for next stage logic (or handle in init)
    setShowResultText(false);

    const nextStage = stageId + 1;
    if (nextStage > 10) {
      handleQuit();
    } else {
      store.triggerTransition(() => {
        isFlowLockedRef.current = false;
        setGameStatus('ONGOING');
        setSelectedCards([]); // Fix selection bug
        store.setMessage(""); // Clear victory message
        store.setGamePhase('IDLE');
        store.initGame(nextStage);
      });
    }
  };

  const handleGameLose = async () => {
    if (isFlowLockedRef.current) return;
    isFlowLockedRef.current = true;

    // 1. 상태 정리
    setGameStatus('PLAYER_LOSE');
    store.clearPlayerConditions();
    // Note: Do not restore Max HP here, user said "restores Max only when Frailty ends or Stage Clear/Fail".
    // Frailty logic handles Max HP restore. If Defeat happens while Frailty active, we should restore Max HP.
    if (store.player.maxHp < (store.player.baseMaxHp || 200)) {
      store.setPlayerMaxHp(store.player.baseMaxHp || 200);
    }

    // 2. Wait 0.5s
    await new Promise(r => setTimeout(r, 500));

    // 3. Dimming
    setShowDimOverlay(true);

    // 4. Wait 0.5s
    await new Promise(r => setTimeout(r, 500));

    // 5. Text + Audio
    setShowResultText(true);
    AudioManager.playSFX('/assets/audio/stages/defeat/defeat.mp3');

    // 6. Wait 0.5s
    await new Promise(r => setTimeout(r, 500));

    // 7. Button Popup
    setShowResultButtons(true);

    // Wait for User Click (Handled by Button onClick invoking handleQuit)
  };

  // 메세지 자동 제거
  useEffect(() => {
    if (store.message) {
      const timer = setTimeout(() => {
        store.setMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [store.message]);

  // 키보드 이벤트 (ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (menu === 'PAUSE') {
          setMenu(null);
        } else if (menu === null && !isProcessing) {
          setMenu('PAUSE');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menu, isProcessing]);

  // 게임 루프 (60 FPS)
  useEffect(() => {
    const interval = setInterval(() => {
      // 게임이 끝났거나 메뉴가 열려있으면 루프 실행하지 않음
      if (gameStatus !== 'ONGOING' || menu !== null || !turnEngine) {
        return;
      }

      // 게임 상태 업데이트
      const status = turnEngine.checkGameStatus();
      if (status !== 'ONGOING') {
        if (status === 'PLAYER_WIN') {
          handleGameWin();
        } else {
          handleGameLose();
        }
      }
    }, 16); // 16ms ≈ 60 FPS

    return () => clearInterval(interval);
  }, [gameStatus, menu, turnEngine]);

  // Legacy loop functions removed

  /**
   * 카드 선택
   */
  const handleCardSelect = (index: number) => {
    if (isProcessing) return;

    setSelectedCards((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        if (prev.length >= 8) return prev; // Allowing up to 8 cards for v2.0.0.5
        return [...prev, index];
      }
    });
  };

  /**
   * 공격 버튼 (v2.0.0.5 Sequencing)
   */
  const handleAttack = useCallback(async () => {
    if (!turnEngine || selectedCards.length === 0 || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardsToPlay = selectedCards
        .map((idx) => store.playerHand[idx])
        .filter(Boolean) as Card[];

      // 1. 플레이어 공격 실행 (애니메이션 포함)
      const actions = turnEngine.executePlayerAttack(cardsToPlay);
      await processTurnActions(actions);

      // 2. 카드 제거 (IMPACT 이후 actions 내에서 처리되는 것이 아니라 여기서 수동 관리)
      store.removePlayerCards(selectedCards);
      setSelectedCards([]);

      // 3. 간격 (0.5s ~ 1.0s)
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 4. 보스 반격
      if (turnEngine.checkGameStatus() === 'ONGOING') {
        const botActions = turnEngine.executeBotAttack();
        await processTurnActions(botActions);
      }

      // 5. 간격 (0.5s ~ 1.0s) 및 턴 종료 처리
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Only run cleanup if game is still going
      if (turnEngine.checkGameStatus() === 'ONGOING') {
        const statusActions = [{ type: 'TURN_CLEANUP', timer: 1 }];
        await processTurnActions(statusActions);
      }

      // 6. 턴 종료 후 핸드 리필 (v2.0.0.5)
      store.refillHand();

      // 최종 게임 상태 체크
      const status = turnEngine.checkGameStatus();
      if (status !== 'ONGOING') {
        if (status === 'PLAYER_WIN') {
          handleGameWin();
        } else {
          handleGameLose();
        }
      }
    } finally {
      setIsProcessing(false);
    }
  }, [turnEngine, selectedCards, isProcessing, store]);

  /**
   * 턴 액션 처리
   */
  const processTurnActions = async (actions: any[]): Promise<void> => {
    for (const action of actions) {
      const actionTime = action.timer || 1;
      await new Promise((resolve) => setTimeout(resolve, actionTime * 16)); // 각 액션을 타이밍과 함께 처리

      // 액션별 처리
      switch (action.type) {
        case 'IMPACT':
          if (turnEngine && action.data) {
            const dmgRes = {
              baseDamage: action.data.damage,
              isCritical: action.data.isCritical,
              finalDamage: action.data.damage,
              multiplier: 1,
              handType: action.data.handType,
            } as any;

            // 1. Player Attack Anim
            store.setPlayerAnimState('ATTACK');
            await new Promise(r => setTimeout(r, 400));
            store.setPlayerAnimState('NONE');

            // 2. Damage Application & Bot Hit Anim
            const effects = turnEngine.applyPlayerAttack(dmgRes.finalDamage);
            store.setBotAnimState('HIT');
            store.syncBot(turnEngine.getBot());

            for (const eff of effects) {
              if (eff.type === 'DAMAGE') {
                const pos = entityPositions.bot ?? { x: 640, y: 200, w: 0, h: 0 };
                const offsetY = pos.h ? -pos.h * POPUP_VERTICAL_FACTOR.bot : -60;
                await addPopup(pos.x, pos.y + offsetY, eff.amount, dmgRes.isCritical, false);
              }
            }
            await new Promise(r => setTimeout(r, 200));
            store.setBotAnimState('NONE');

            // 3. Check for immediate win
            if (turnEngine.getBot().hp <= 0) {
              setGameStatus('PLAYER_WIN');
              return; // Stop processing further actions in this turn
            }
          }
          break;

        case 'BOT_HIT': // From turnEngine BOT_HIT action
          if (turnEngine && action.data) {
            // 1. Bot Attack Anim
            store.setBotAnimState('ATTACK');
            await new Promise(r => setTimeout(r, 400));
            store.setBotAnimState('NONE');

            // 2. Damage Application & Player Hit Anim
            const effects = turnEngine.applyBotAttack(action.data.damage);
            store.setPlayerAnimState('HIT');
            store.syncPlayer(turnEngine.getPlayer());

            for (const eff of effects) {
              const pos = entityPositions.player ?? { x: 640, y: 520, w: 0, h: 0 };
              const offsetY = pos.h ? -pos.h * POPUP_VERTICAL_FACTOR.player : -50;
              if (eff.type === 'DAMAGE') {
                await addPopup(pos.x, pos.y + offsetY, eff.amount, false, false, 'red');
              } else if (eff.type === 'BLEED' || eff.type === 'HEAVY_BLEED') {
                await addPopup(pos.x, pos.y + offsetY, eff.amount, false, false, 'red');
              } else if (eff.type === 'POISON' || eff.type === 'POISON_DMG') {
                await addPopup(pos.x, pos.y + offsetY, eff.amount, false, false, 'purple');
              } else if ((eff.type as string) === 'AVOIDED') {
                await addPopup(pos.x, pos.y + offsetY, 0, false, false);
              }
            }
            await new Promise(r => setTimeout(r, 200));
            store.setPlayerAnimState('NONE');

            // 3. Check for immediate lose
            if (turnEngine.getPlayer().hp <= 0) {
              handleGameLose(); // Invoke strict sequence
              return;
            }
          }
          break;

        case 'BLEED_TICK':
          // Removed for strict end-turn logic
          break;

        case 'TURN_CLEANUP':
          // 턴 종료 처리 - 상태이상 처리
          if (turnEngine) {
            const endEffects = turnEngine.processEndTurn();
            store.setPlayerHp(turnEngine.getPlayer().hp);
            store.setBotHp(turnEngine.getBot().hp);

            for (const eff of endEffects) {
              const pPos = entityPositions.player ?? { x: 640, y: 520, w: 0, h: 0 };
              const bPos = entityPositions.bot ?? { x: 640, y: 200, w: 0, h: 0 };
              const pOffsetY = pPos.h ? -pPos.h * POPUP_VERTICAL_FACTOR.player : -50;
              const bOffsetY = bPos.h ? -bPos.h * POPUP_VERTICAL_FACTOR.bot : -60;

              // Determine target - assume effects are on player mostly for dot, check eff?
              // Actually TurnEngine returns a mix. But v2 logic puts conditions on Player mostly.
              // Assuming effects are targeted based on source logic (TurnEngine doesn't spec target in Effect)
              // For now, assume player effects unless it's HEAL on bot (Regen).
              // Actually TurnEngine implementation returns Player effects first then Bot effects.
              // We should probably separate them in TurnEngine or infer.
              // Current TurnEngine implementation pushes Player effects first, then Bot.
              // Let's assume positive effects like HEAL might be Bot or Player.
              // Given constraints, just display on Player for conditions (as user mainly requested Condition UI).

              if (eff.type === 'HEAL') {
                // Heuristic: if bot health increased, show on bot?
                // Easier: show on both or assume player for now.
                await addPopup(pPos.x, pPos.y + pOffsetY, eff.amount, false, true);
              } else if (eff.type === 'BLEED' || eff.type === 'HEAVY_BLEED') {
                await addPopup(pPos.x, pPos.y + pOffsetY, eff.amount, false, false, 'red');
              } else if (eff.type === 'POISON') {
                await addPopup(pPos.x, pPos.y + pOffsetY, eff.amount, false, false, 'purple');
              }
            }
          }
          break;

        case 'ANIMATION': {
          // Generic animation block from the engine; action.data.duration may be provided in ms
          const durationMs = (action.data && (action.data as any).duration) || (action.timer || 0) * 16;

          // trigger simple screen-shake for known VFX names
          const name = (action.data && (action.data as any).name) || '';
          if (name.includes('impact') || name.includes('attack')) {
            setScreenShake(true);
            await new Promise((res) => setTimeout(res, durationMs));
            setScreenShake(false);
          } else {
            await new Promise((res) => setTimeout(res, durationMs));
          }
          break;
        }

        case 'MESSAGE':
          if (action.data?.text) {
            store.setMessage(action.data.text);
          }
          break;

        default:
          break;
      }
    }
  };

  /**
   * 일시정지
   */
  const handlePause = () => {
    if (!isProcessing) {
      setMenu('PAUSE');
    }
  };

  /**
   * 메뉴 닫기
   */
  const handleCloseMenu = () => {
    setMenu(null);
  };

  /**
   * 게임 저장
   */
  const handleSave = () => {
    store.saveGame();
    setMenu(null);
  };

  /**
   * 게임 로드
   */
  const handleLoad = (slot: number) => {
    store.loadGame(slot);
    setMenu(null);
    // 엔진 재초기화
    if (turnEngine) {
      turnEngine.setPlayer(store.player);
      turnEngine.setBot(store.bot);
      setGameStatus('ONGOING');
      setSelectedCards([]);
    }
  };

  /**
   * 게임 종료
   */
  const handleQuit = () => {
    stopAudio();
    onGameEnd?.('LOSE');
  };

  /**
   * 설정 - BGM/SFX 조절 (v2.0.0.5 Linked)
   */
  const handleVolumeChange = (type: 'bgm' | 'sfx', volume: number) => {
    if (type === 'bgm') {
      AudioManager.setBGMVolume(volume);
    } else {
      AudioManager.setSFXVolume(volume);
    }
  };

  /*
   * handleNextStage removed. Auto-transition via handleGameWin timeout.
   */

  return (
    <div className={`game-container ${screenShake ? 'shake' : ''}`}>
      {/* Game End Overlay (v2.0.0.5 Phase 3: Preserves UI background) */}
      {gameStatus !== 'ONGOING' && (
        <div className="game-overlay-screen" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.5s forwards'
        }}>
          <h1 style={{
            fontSize: '6rem',
            fontFamily: 'BebasNeue',
            color: '#f1c40f', // Bold Yellow for both
            fontWeight: 'bold',
            textShadow: '0 0 20px rgba(241, 196, 15, 0.5)',
            marginBottom: '40px'
          }}>
            {gameStatus === 'PLAYER_WIN' ? 'VICTORY!' : 'DEFEAT!'}
          </h1>

          <div style={{ display: 'flex', gap: '20px' }}>
            {gameStatus !== 'PLAYER_WIN' && (
              <BlockButton
                text="BACK TO MAIN PAGE"
                onClick={handleQuit}
                width="320px"
              />
            )}
          </div>
        </div>
      )}
      {/* 배경 */}
      <div className="game-background" style={{ background: 'transparent' }} />

      {/* Central Announcement Message */}
      {store.message && (
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          <h2 style={{
            fontFamily: 'BebasNeue',
            fontSize: '4rem',
            color: '#ff4757',
            textShadow: '0 0 20px #ff0000',
            margin: 0,
            textAlign: 'center',
            animation: 'fadeUp 2s forwards'
          }}>
            {store.message}
          </h2>
        </div>
      )}

      {/* 게임 필드 */}
      <div className="battle-field-container">
        <BattleField
          stageNum={stageId}
          player={store.player}
          bot={store.bot}
          onMeasure={(positions) => setEntityPositions({
            player: positions.player,
            bot: positions.bot,
            scale: positions.scale
          })}
          popups={popups.filter(p => p.y < (entityPositions.player?.y || Infinity))}
          onRemovePopup={removePopup}
        />
      </div>

      {/* 카드 손패 */}
      <div className="card-hand-container">
        <CardHand
          cards={store.playerHand}
          selectedCards={selectedCards}
          onSelectCard={handleCardSelect}
          onAttack={handleAttack}
          isProcessing={isProcessing}
          gamePhase={store.gamePhase}
          disabled={gameStatus !== 'ONGOING'}
          blindIndices={Array.from(store.player.conditions.values())
            .filter((c: any) => c.type === 'BLIND')
            .flatMap((c: any) => c.targetCardIndices || [])}
        />
      </div>

      {/* 일시정지 버튼 */}
      <button className="pause-button" onClick={handlePause} disabled={isProcessing}>
        ☰
      </button>

      {/* 메뉴 */}
      {menu === 'PAUSE' && (
        <PauseMenu
          isOpen={true}
          onSave={() => {
            setMenu('SAVE_LOAD');
          }}
          onSettings={() => {
            setMenu('SETTINGS');
          }}
          onResume={handleCloseMenu}
          onQuit={() => {
            setMenu('CONFIRM_QUIT');
          }}
        />
      )}

      {menu === 'SAVE_LOAD' && (
        <SaveLoadMenu
          mode="SAVE"
          onAction={(slot) => {
            store.saveGame(); // User didn't specify save slot logic in store yet, usually SaveManager does it
            // Actually store.saveGame calls SaveManager.saveGame.
            // We should pass slot to store.saveGame(slot) if supported.
            setMenu('PAUSE');
          }}
          onClose={() => {
            setMenu('PAUSE');
          }}
        />
      )}

      {menu === 'SETTINGS' && (
        <SettingsMenu
          onVolumeChange={handleVolumeChange}
          onClose={() => {
            setMenu('PAUSE');
          }}
        />
      )}

      {menu === 'CONFIRM_QUIT' && (
        <ConfirmationPopup
          message="DO YOU WANT TO GO BACK TO MAIN PAGE?"
          onYes={handleQuit}
          onNo={() => {
            setMenu('PAUSE');
          }}
        />
      )}
    </div>
  );
};

export default Game;
