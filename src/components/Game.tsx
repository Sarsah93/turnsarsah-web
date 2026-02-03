// components/Game.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../state/gameStore';
import BattleField from './Battle/BattleField';
import CardHand from './Battle/CardHand';
import PauseMenu from './Menu/PauseMenu';
import SaveLoadMenu from './Menu/SaveLoadMenu';
import SettingsMenu from './Menu/SettingsMenu';
import ConfirmationPopup from './Menu/ConfirmationPopup';
import { TurnEngine } from '../logic/turnEngine';
import { Card } from '../types/Card';
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
const Game: React.FC<GameProps> = ({ stageId = 1, onGameEnd }) => {
  const store = useGameStore();
  const [menu, setMenu] = useState<GameMenuState>(null);
  const [turnEngine, setTurnEngine] = useState<TurnEngine | null>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameStatus, setGameStatus] = useState<'ONGOING' | 'PLAYER_WIN' | 'PLAYER_LOSE'>('ONGOING');
  const [popups, setPopups] = useState<Array<{id: string; x: number; y: number; amount: number; isCritical: boolean; isHeal: boolean}>>([]);
  const popupResolvers = useRef<Map<string, () => void>>(new Map());
  const [entityPositions, setEntityPositions] = useState<{ player: { x: number; y: number; w: number; h: number } | null; bot: { x: number; y: number; w: number; h: number } | null; scale?: number }>({ player: null, bot: null, scale: 1 });

  const POPUP_VERTICAL_FACTOR = { player: 0.38, bot: 0.45 };
  const [screenShake, setScreenShake] = useState(false);

  const addPopup = (x: number, y: number, amount: number, isCritical = false, isHeal = false): Promise<void> => {
    const id = Math.random().toString(36).slice(2);
    const promise = new Promise<void>((resolve) => {
      popupResolvers.current.set(id, resolve);
    });
    setPopups((p) => [...p, { id, x, y, amount, isCritical, isHeal }]);
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
    store.initGame(stageId);
    const engine = new TurnEngine(store.player, store.bot);
    setTurnEngine(engine);
  }, [stageId]);

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
        setGameStatus(status);
        onGameEnd?.(status === 'PLAYER_WIN' ? 'WIN' : 'LOSE');
      }
    }, 16); // 16ms ≈ 60 FPS

    return () => clearInterval(interval);
  }, [gameStatus, menu, turnEngine]);

  /**
   * 카드 선택
   */
  const handleCardSelect = (index: number) => {
    if (isProcessing) return;

    setSelectedCards((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        if (prev.length >= 5) return prev; // 최대 5개까지만 선택
        return [...prev, index];
      }
    });
  };

  /**
   * 공격 버튼
   */
  const handleAttack = useCallback(async () => {
    if (!turnEngine || selectedCards.length === 0 || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      // 선택된 카드로 데미지 계산
      const cardsToPlay = selectedCards
        .map((idx) => store.playerHand[idx])
        .filter(Boolean) as Card[];

      // 플레이어 공격 실행
      const actions = turnEngine.executePlayerAttack(cardsToPlay);
      await processTurnActions(actions);

      // 카드 제거 및 덱 리셋
      store.removePlayerCards(selectedCards);
      store.setPlayerHand([...store.playerHand, ...store.deck.draw(selectedCards.length)]);
      setSelectedCards([]);

      // 보스 반격
      if (turnEngine.checkGameStatus() === 'ONGOING') {
        await new Promise((resolve) => setTimeout(resolve, 500)); // 딜레이
        const botActions = turnEngine.executeBotAttack();
        await processTurnActions(botActions);
      }

      // 게임 상태 체크
      const status = turnEngine.checkGameStatus();
      if (status !== 'ONGOING') {
        setGameStatus(status);
        onGameEnd?.(status === 'PLAYER_WIN' ? 'WIN' : 'LOSE');
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

            const effects = turnEngine.applyPlayerAttack(dmgRes);
            store.setBotHp(turnEngine.getBot().hp);

            // show damage popups for effects (await animations)
            for (const eff of effects) {
              if (eff.type === 'DAMAGE') {
                const pos = entityPositions.bot ?? { x: 640, y: 200, w: 0, h: 0 };
                const offsetY = pos.h ? -pos.h * POPUP_VERTICAL_FACTOR.bot : -60;
                await addPopup(pos.x, pos.y + offsetY, eff.amount, dmgRes.isCritical, false);
              }
            }
          }
          break;

        case 'PLAYER_HIT':
          if (turnEngine && action.data) {
            const effects = turnEngine.applyBotAttack(action.data.damage);
            store.setPlayerHp(turnEngine.getPlayer().hp);

            for (const eff of effects) {
              const pos = entityPositions.player ?? { x: 640, y: 520, w: 0, h: 0 };
              const offsetY = pos.h ? -pos.h * POPUP_VERTICAL_FACTOR.player : -50;
              if (eff.type === 'DAMAGE') {
                await addPopup(pos.x, pos.y + offsetY, eff.amount, false, false);
              } else if (eff.type === 'AVOIDED') {
                await addPopup(pos.x, pos.y + offsetY, 0, false, false);
              }
            }
          }
          break;

        case 'BLEED_TICK':
          if (turnEngine) {
            turnEngine.processBleedTicks();
            store.setPlayerHp(turnEngine.getPlayer().hp);
            store.setBotHp(turnEngine.getBot().hp);
          }
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
              if (eff.type === 'HEAL') {
                await addPopup(pPos.x, pPos.y + pOffsetY, eff.amount, false, true);
              } else if (eff.type === 'POISON' || eff.type === 'BLEED' || eff.type === 'HEAVY_BLEED') {
                await addPopup(pPos.x, pPos.y + pOffsetY, eff.amount, false, false);
                await addPopup(bPos.x, bPos.y + bOffsetY, eff.amount, false, false);
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
    onGameEnd?.('LOSE');
  };

  /**
   * 설정 - BGM/SFX 조절
   */
  const handleVolumeChange = (type: 'bgm' | 'sfx', delta: number) => {
    // TODO: 실제 오디오 관리자와 연결
    console.log(`${type} volume change: ${delta}`);
  };

  if (gameStatus !== 'ONGOING') {
    return (
      <div className="game-result">
        <h1>{gameStatus === 'PLAYER_WIN' ? '승리!' : '패배...'}</h1>
        <button onClick={() => onGameEnd?.('LOSE')}>메뉴로</button>
      </div>
    );
  }

  return (
    <div className={`game-container ${screenShake ? 'shake' : ''}`}>
      {/* 배경 */}
      <div className="game-background" />

      {/* 게임 필드 */}
      <div className="battle-field-container">
        <BattleField
          player={store.player}
          bot={store.bot}
          onEntityPositionsChange={setEntityPositions}
          screenShake={screenShake}
          popups={popups.filter(p => p.y < (entityPositions.player?.y || Infinity))}
          removePopup={removePopup}
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
          disabled={gameStatus !== 'ONGOING'}
          bannedIndices={store.player.conditions.filter(c => c.type === 'BLIND').flatMap(c => c.targetCardIndices || [])}
          blindIndices={store.player.conditions.filter(c => c.type === 'BLIND').flatMap(c => c.targetCardIndices || [])} // BLIND 조건일 때 카드를 가림
        />
      </div>

      {/* 일시정지 버튼 */}
      <button className="pause-button" onClick={handlePause} disabled={isProcessing}>
        ☰
      </button>

      {/* 메뉴 */}
      {menu === 'PAUSE' && (
        <PauseMenu
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
          onLoad={handleLoad}
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
          message="정말로 게임을 종료하시겠습니까?"
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
