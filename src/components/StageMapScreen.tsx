// components/StageMapScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { GameState } from '../constants/gameConfig';
import {
  CHAPTER_ROUTES,
  getNode,
  getAvailableNodes,
  isDimmedNode,
  UNIMPLEMENTED_CHAPTERS,
  MapNode,
} from '../constants/chapterRoutes';
import { TRANSLATIONS } from '../constants/translations';
import { AudioManager } from '../utils/AudioManager';
import { SaveManager } from '../utils/SaveManager';
import { SaveLoadMenu, PauseMenu, SettingsMenu, ConfirmationPopup } from './Menu';
import './styles/StageMapScreen.css';

type MapMenuState = 'NONE' | 'PAUSE' | 'SAVE' | 'LOAD' | 'QUIT_CONFIRM' | 'SETTINGS';

interface StageMapScreenProps {
  readOnly?: boolean;
  onClose?: () => void;
}

export const StageMapScreen: React.FC<StageMapScreenProps> = ({ readOnly = false, onClose }) => {
  const [confirmNode, setConfirmNode] = useState<MapNode | null>(null);
  const [infoPopup, setInfoPopup] = useState<{ msg: string; icon: string } | null>(null);
  const [menuState, setMenuState] = useState<MapMenuState>('NONE');

  // ── Store ──
  const stageMapProgress = useGameStore((s) => s.stageMapProgress);
  const player = useGameStore((s) => s.player);
  const language = useGameStore((s) => s.language);
  const difficulty = useGameStore((s) => s.difficulty);
  const chapterNum = useGameStore((s) => s.chapterNum);

  const t = TRANSLATIONS[language];

  if (!stageMapProgress) return null;

  const route = CHAPTER_ROUTES[stageMapProgress.chapterId];
  if (!route) return null;

  const availableNodeIds = getAvailableNodes(stageMapProgress);

  // ── Node Status Helper ──
  const getNodeStatus = (node: MapNode): 'completed' | 'available' | 'dimmed' | 'locked' => {
    if (stageMapProgress.completedNodes.includes(node.id)) return 'completed';
    if (isDimmedNode(stageMapProgress, node.id)) return 'dimmed';
    if (availableNodeIds.includes(node.id)) return 'available';
    return 'locked';
  };

  // ── Click Handlers ──
  const handleNodeClick = useCallback((node: MapNode) => {
    if (readOnly) return;
    const status = getNodeStatus(node);
    if (status !== 'available') return;

    if (node.type === 'stage') {
      setConfirmNode(node);
    } else if (node.type === 'rest') {
      handleRestNode(node);
    } else if (node.type === 'event') {
      handleEventNode(node);
    } else if (node.type === 'exit') {
      handleExitNode(node);
    }
  }, [readOnly, stageMapProgress, availableNodeIds]);

  const handleRestNode = (node: MapNode) => {
    const store = useGameStore.getState();
    const healPercent = node.restHealPercent ?? 0.3;
    const healAmount = Math.floor(store.player.maxHp * healPercent);
    const newHp = Math.min(store.player.maxHp, store.player.hp + healAmount);
    store.setPlayerHp(newHp);

    // Record fork choice if applicable
    recordForkChoice(node);
    store.completeMapNode(node.id);

    const healMsg = language === 'KR'
      ? `휴식처에 도달하여, 코어 안정도가 ${healAmount} 회복됩니다.`
      : `Arrived at rest area. Core stability restored by ${healAmount}.`;
    setInfoPopup({ msg: healMsg, icon: '🏕️' });

    setTimeout(() => setInfoPopup(null), 3000);
  };

  const handleEventNode = (node: MapNode) => {
    const store = useGameStore.getState();

    // Record fork choice if applicable
    recordForkChoice(node);
    store.completeMapNode(node.id);

    const eventMsg = language === 'KR'
      ? '아무 일도 일어나지 않았다. (미구현)'
      : 'Nothing happened. (Not implemented)';
    setInfoPopup({ msg: eventMsg, icon: '🔮' });

    setTimeout(() => setInfoPopup(null), 3000);
  };

  const handleExitNode = (node: MapNode) => {
    if (!node.exitChapterId) return;

    if (UNIMPLEMENTED_CHAPTERS.includes(node.exitChapterId)) {
      const msg = language === 'KR'
        ? '다음 챕터는 준비 중입니다.'
        : 'Next chapter is coming soon.';
      setInfoPopup({ msg, icon: '🔒' });
      setTimeout(() => {
        setInfoPopup(null);
        const store = useGameStore.getState();
        store.triggerTransition(() => store.setGameState(GameState.MENU));
      }, 2000);
      return;
    }

    // Show confirmation for implemented chapters
    setConfirmNode(node);
  };

  const handleStageConfirm = () => {
    if (!confirmNode) return;
    const store = useGameStore.getState();

    if (confirmNode.type === 'exit' && confirmNode.exitChapterId) {
      // Record fork choice and move to next chapter
      recordForkChoice(confirmNode);
      store.completeMapNode(confirmNode.id);
      setConfirmNode(null);
      store.triggerTransition(() => store.enterStageMap(confirmNode.exitChapterId!));
      return;
    }

    if (!confirmNode.stageKey) return;

    // Record fork choice if applicable
    recordForkChoice(confirmNode);
    // Advance to this node (mark as current but don't complete yet — battle completion will do that)
    store.advanceToMapNode(confirmNode.id);

    setConfirmNode(null);

    // v3.0: 스페셜 스테이지 조건부 로직 적용
    let targetStageKey = confirmNode.stageKey;
    if (stageMapProgress!.chapterId === '2A' && targetStageKey === 10 && store.specialQualify) {
      targetStageKey = 11; // SAND DRAGON
    } else if (stageMapProgress!.chapterId === '2B' && targetStageKey === 10 && store.ch2SpecialQualify) {
      targetStageKey = 11; // HIGH ORC SHAMAN
    }

    store.triggerTransition(() => {
      store.initGameWithDifficulty(stageMapProgress!.chapterId, targetStageKey, store.difficulty);
    });
  };

  const recordForkChoice = (node: MapNode) => {
    const store = useGameStore.getState();
    if (!store.stageMapProgress) return;

    // Find parent nodes that have this node as a nextNode and have a forkGroup
    const route = CHAPTER_ROUTES[store.stageMapProgress.chapterId];
    if (!route) return;

    for (const parentNode of route.nodes) {
      if (parentNode.forkGroup && parentNode.nextNodes.includes(node.id)) {
        // Check if parent is completed (meaning the fork decision is being made)
        if (store.stageMapProgress.completedNodes.includes(parentNode.id)) {
          store.chooseMapFork(parentNode.forkGroup, node.id);
        }
      }
    }
  };

  // ── Save/Load ──
  const handleSave = (slot: number) => {
    const store = useGameStore.getState();
    store.forceSaveGame(slot);
    const msg = language === 'KR' ? `슬롯 ${slot + 1}에 저장되었습니다.` : `Saved to Slot ${slot + 1}.`;
    store.setMessage(msg);
    setMenuState('NONE');
  };

  const handleLoad = (slot: number) => {
    const store = useGameStore.getState();
    store.loadGame(slot);
    setMenuState('NONE');
  };

  // ── Confirm Node Description ──
  const getConfirmDesc = (): string => {
    if (!confirmNode) return '';
    if (confirmNode.type === 'exit') {
      const targetRoute = CHAPTER_ROUTES[confirmNode.exitChapterId || ''];
      const name = language === 'KR'
        ? (targetRoute?.name || confirmNode.exitChapterId)
        : (targetRoute?.nameEN || confirmNode.exitChapterId);
      return language === 'KR'
        ? `${name} 챕터로 이동하시겠습니까?`
        : `Move to ${name} chapter?`;
    }
    const label = language === 'KR' ? confirmNode.label : confirmNode.labelEN;
    return language === 'KR'
      ? `${label}에 진입하시겠습니까?`
      : `Enter ${label}?`;
  };

  // ── Render ──
  const hpPercent = player.maxHp > 0 ? (player.hp / player.maxHp) * 100 : 0;
  const chapterDisplayName = language === 'KR' ? route.name : route.nameEN;

  return (
    <div className="stage-map-screen">
      {/* Background Map Image */}
      <img
        src={route.mapImage}
        alt={chapterDisplayName}
        className="stage-map-bg"
        draggable={false}
      />

      {/* Node Overlays */}
      <div className="stage-map-nodes">
        {route.nodes.map((node) => {
          const status = getNodeStatus(node);
          const typeClass = `type-${node.type}`;
          const label = language === 'KR' ? node.label : node.labelEN;

          return (
            <div
              key={node.id}
              className={`stage-map-node ${status} ${typeClass} ${readOnly ? 'read-only' : ''}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => handleNodeClick(node)}
              title={label}
            >
              <span className="stage-map-node-label">{label}</span>
            </div>
          );
        })}
      </div>

      {/* HP HUD */}
      <div className="stage-map-hud">
        <div className="stage-map-hp-label">
          {language === 'KR' ? 'CORE STABILITY' : 'CORE STABILITY'}
        </div>
        <div className="stage-map-hp-text">
          {player.hp} / {player.maxHp}
        </div>
        <div className="stage-map-hp-bar">
          <div
            className="stage-map-hp-fill"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* Chapter Label */}
      <div className="stage-map-chapter-label">
        {chapterDisplayName}
      </div>

      {/* Menu / Close Button */}
      {readOnly ? (
        <button
          className="stage-map-menu-btn"
          onClick={onClose}
          title={language === 'KR' ? '닫기' : 'Close'}
          style={{ background: 'rgba(231, 76, 60, 0.2)', borderColor: '#e74c3c', color: '#e74c3c' }}
        >
          ✕
        </button>
      ) : (
        <button
          className="stage-map-menu-btn"
          onClick={() => setMenuState('PAUSE')}
          title={language === 'KR' ? '메뉴' : 'Menu'}
        >
          ☰
        </button>
      )}


      {/* ── Info Popup (Rest / Event) ── */}
      {infoPopup && (
        <div className="stage-map-info-popup">
          <span className="stage-map-info-icon">{infoPopup.icon}</span>
          {infoPopup.msg}
        </div>
      )}

      {/* ── Confirmation Popup (Stage / Exit) ── */}
      {confirmNode && (
        <ConfirmationPopup
          message={getConfirmDesc()}
          onYes={handleStageConfirm}
          onNo={() => setConfirmNode(null)}
        />
      )}

      {/* ── Pause Menu Modals ── */}
      {menuState === 'PAUSE' && (
        <PauseMenu
          isOpen={true}
          onClose={() => setMenuState('NONE')}
          onResume={() => setMenuState('NONE')}
          onSave={() => setMenuState('SAVE')}
          onLoad={() => setMenuState('LOAD')}
          onSettings={() => setMenuState('SETTINGS')}
          onQuit={() => setMenuState('QUIT_CONFIRM')}
        />
      )}

      {menuState === 'SAVE' && (
        <SaveLoadMenu
          mode="SAVE"
          onAction={handleSave}
          onClose={() => setMenuState('PAUSE')}
        />
      )}

      {menuState === 'LOAD' && (
        <SaveLoadMenu
          mode="LOAD"
          onAction={handleLoad}
          onClose={() => setMenuState('PAUSE')}
        />
      )}

      {menuState === 'SETTINGS' && (
        <SettingsMenu
          onClose={() => setMenuState('PAUSE')}
          onVolumeChange={(type, vol) => {
            if (type === 'bgm') {
              AudioManager.setBGMVolume(vol);
            } else {
              AudioManager.setSFXVolume(vol);
            }
          }}
        />
      )}

      {menuState === 'QUIT_CONFIRM' && (
        <ConfirmationPopup
          message={language === 'KR' ? '메인 메뉴로 돌아가시겠습니까?' : 'Return to the main menu?'}
          onYes={() => {
            setMenuState('NONE');
            const store = useGameStore.getState();
            store.triggerTransition(() => store.setGameState(GameState.MENU));
          }}
          onNo={() => setMenuState('PAUSE')}
        />
      )}
    </div>
  );
};
