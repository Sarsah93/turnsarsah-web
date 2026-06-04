import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../state/gameStore';
import { GameState, Difficulty } from '../constants/gameConfig';
import {
  CHAPTER_ROUTES,
  getNode,
  getAvailableNodes,
  isDimmedNode,
  UNIMPLEMENTED_CHAPTERS,
  MapNode,
  TROPHY_STAGE_MAP,
} from '../constants/chapterRoutes';
import { TRANSLATIONS } from '../constants/translations';
import { AudioManager } from '../utils/AudioManager';
import { SaveManager } from '../utils/SaveManager';
import { AltarManager } from '../utils/AltarManager';
import { SaveLoadMenu, PauseMenu, SettingsMenu, ConfirmationPopup } from './Menu';
import './styles/StageMapScreen.css';
import './styles/WorldMapPopup.css';

type MapMenuState = 'NONE' | 'PAUSE' | 'SAVE' | 'LOAD' | 'QUIT_CONFIRM' | 'SETTINGS';

interface StageMapScreenProps {
  readOnly?: boolean;
  onClose?: () => void;
  debugChapterId?: string; // If provided, opens in debug mode for this chapter
}

export const StageMapScreen: React.FC<StageMapScreenProps> = ({ readOnly = false, onClose, debugChapterId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [confirmNode, setConfirmNode] = useState<MapNode | null>(null);
  const [infoPopup, setInfoPopup] = useState<{ msg: string; icon: string } | null>(null);
  const [menuState, setMenuState] = useState<MapMenuState>('NONE');

  // ── Store ──
  const stageMapProgress = useGameStore((s) => s.stageMapProgress);
  const player = useGameStore((s) => s.player);
  const language = useGameStore((s) => s.language);
  const difficulty = useGameStore((s) => s.difficulty);
  const chapterNum = useGameStore((s) => s.chapterNum);
  const clearComboMultiplier = useGameStore((s) => s.clearComboMultiplier);
  const clearComboActive = useGameStore((s) => s.clearComboActive);

  const t = TRANSLATIONS[language];

  // If debugChapterId is provided, ALWAYS use the debug chapter progress (takes absolute precedence)
  const activeProgress = debugChapterId
    ? {
        chapterId: debugChapterId,
        completedNodes: [],
        currentNodeId: CHAPTER_ROUTES[debugChapterId]?.startNodeId || '',
        chosenForks: {}
      }
    : stageMapProgress;

  if (!activeProgress) return null;

  const route = CHAPTER_ROUTES[activeProgress.chapterId];
  if (!route) return null;

  const availableNodeIds = getAvailableNodes(activeProgress);

  // ── Node Status Helper ──
  const getNodeStatus = (node: MapNode): 'completed' | 'available' | 'dimmed' | 'locked' => {
    if (debugChapterId) return 'available'; // In debug mode, keep all nodes visible and clickable
    if (activeProgress.completedNodes.includes(node.id)) return 'completed';
    if (isDimmedNode(activeProgress, node.id)) return 'dimmed';
    if (availableNodeIds.includes(node.id)) {
      if (node.type === 'exit' && difficulty === Difficulty.EASY) {
        return 'locked';
      }
      return 'available';
    }
    return 'locked';
  };

  // ── Click Handlers ──
  const handleNodeClick = useCallback((node: MapNode) => {
    if (readOnly || debugChapterId) return;
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
  }, [readOnly, debugChapterId, activeProgress, availableNodeIds]);

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
    if (activeProgress!.chapterId === '2A' && targetStageKey === 10 && store.specialQualify) {
      targetStageKey = 11; // SAND DRAGON
    } else if (activeProgress!.chapterId === '2B' && targetStageKey === 10 && store.ch2SpecialQualify) {
      targetStageKey = 11; // HIGH ORC SHAMAN
    }

    store.triggerTransition(() => {
      store.initGameWithDifficulty(activeProgress!.chapterId, targetStageKey, store.difficulty);
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

  // ── Map Aspect Ratio Class Helper ──
  const getRatioClass = (chapterId: string) => {
    switch (chapterId) {
      case '1':  // 들판 지대
      case '2A': // 사막 지대
        return 'ratio-16-9';
      case '2B': // 깊은 숲 지대
      case '3A': // 동굴 지대
      case '3B': // 늪 지대
        return 'ratio-4-3';
      default:
        return 'ratio-3-2';
    }
  };

  const ratioClass = getRatioClass(activeProgress.chapterId);

  return (
    <div className="stage-map-screen">
      {/* 챕터별 맞춤 종횡비가 고정 보존되며 화면에 contain 비율로 맞춤되는 맵 보드 */}
      <div className={`stage-map-board ${ratioClass}`} ref={containerRef}>
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

            // Trophy Hint logic
            let hasTrophyHint = false;
            if (
              node.type === 'stage' &&
              node.stageKey !== undefined &&
              difficulty !== Difficulty.EASY
            ) {
              const trophyId = TROPHY_STAGE_MAP[activeProgress.chapterId]?.[node.stageKey];
              if (trophyId && !AltarManager.hasTrophy(trophyId, difficulty)) {
                hasTrophyHint = true;
              }
            }

            return (
              <div
                key={node.id}
                className={`stage-map-node ${status} ${typeClass} ${readOnly ? 'read-only' : ''}`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                onClick={() => handleNodeClick(node)}
                title={label}
              >
                {hasTrophyHint && (
                  <div className="trophy-hint-badge" title={language === 'KR' ? '획득 가능한 전리품 있음' : 'Trophy Available'}>
                    !
                  </div>
                )}
                <span className="stage-map-node-label">
                  {hasTrophyHint && <span className="trophy-hint-text">!</span>}
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── 범례 HUD 패널 (기존 맵의 범례를 덮어씌움) ── */}
        <div className="stage-map-legend">
          <div className="stage-map-legend-title">
            {language === 'KR' ? '범례' : 'Legend'}
          </div>
          <div className="stage-map-legend-items">
            <div className="stage-map-legend-item">
              <span className="legend-circle type-entry"></span>
              <span className="legend-label">{language === 'KR' ? '입구 / 출구' : 'Entry / Exit'}</span>
            </div>
            <div className="stage-map-legend-item">
              <span className="legend-circle type-stage"></span>
              <span className="legend-label">{language === 'KR' ? '스테이지(클로니)' : 'Stage'}</span>
            </div>
            <div className="stage-map-legend-item">
              <span className="legend-circle type-event"></span>
              <span className="legend-label">{language === 'KR' ? '이벤트 스테이지' : 'Event Stage'}</span>
            </div>
            <div className="stage-map-legend-item">
              <span className="legend-circle type-rest"></span>
              <span className="legend-label">{language === 'KR' ? '휴식처' : 'Rest Area'}</span>
            </div>
          </div>
        </div>

        {/* ── Stage Map Coordinate Debug Overlay ── */}
        {debugChapterId && (
          <StageMapDebugOverlay containerRef={containerRef} />
        )}
      </div>

      {/* HP HUD */}
      {!debugChapterId && (
        <div className="stage-map-hud">
          <div className="stage-map-hp-label">
            {language === 'KR' ? '코어 안정도' : 'CORE STABILITY'}
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
      )}

      {/* 클리어 콤보 HUD — 스테이지 선택 지도 (좌측 상단) */}
      {!debugChapterId && clearComboActive && clearComboMultiplier > 1.0 && (
        <div
          className="clear-combo-hud"
          style={{
            left: '3%',
            top: '16%',
          }}
        >
          <span className="clear-combo-hud-icon">⚡</span>
          <span className="clear-combo-hud-text">
            {language === 'KR' ? '클리어 콤보' : 'Clear Combo'}
          </span>
          <span className="clear-combo-hud-multiplier">
            {language === 'KR'
              ? `${clearComboMultiplier.toFixed(1)}배`
              : `${clearComboMultiplier.toFixed(1)}x`}
          </span>
        </div>
      )}

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

// ─── Stage Map SVG/Percentage Coordinate Debug Overlay ───
interface DebugPoint { svgX: number; svgY: number; pctX: number; pctY: number; }

const StageMapDebugOverlay: React.FC<{ containerRef: React.RefObject<HTMLDivElement | null> }> = ({ containerRef }) => {
  const [mouse, setMouse] = useState<DebugPoint>({ svgX: 0, svgY: 0, pctX: 0, pctY: 0 });
  const [points, setPoints] = useState<DebugPoint[]>([]);
  const [closed, setClosed] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedPct, setCopiedPct] = useState(false);
  const [isPassThrough, setIsPassThrough] = useState(false);

  // ── Drag & Drop States for Moving the Debug Panel ──
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || isPassThrough) return;
    const target = e.target as HTMLElement;
    // Don't drag if user clicked buttons or text containers inside the panel
    if (target.closest('button') || target.closest('pre')) return;

    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - currentOffset.current.x,
      y: e.clientY - currentOffset.current.y
    };
    e.preventDefault();
  }, [isPassThrough]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      setDragOffset({ x: newX, y: newY });
      currentOffset.current = { x: newX, y: newY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toCoords = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { svgX: 0, svgY: 0, pctX: 0, pctY: 0 };
    
    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;
    
    return {
      svgX: Math.round(relX * 1024),
      svgY: Math.round(relY * 682),
      pctX: Math.round(relX * 100),
      pctY: Math.round(relY * 100)
    };
  }, [containerRef]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMouse(toCoords(e.clientX, e.clientY));
  }, [toCoords]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (!isPassThrough && (
      target.closest('.stage-map-menu-btn') ||
      target.closest('.stage-map-debug-panel') ||
      target.closest('button')
    )) {
      return;
    }
    setPoints(prev => [...prev, toCoords(e.clientX, e.clientY)]);
    setClosed(false);
  }, [toCoords, isPassThrough]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      setIsPassThrough(true);
    }
    if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey) setClosed(true);
    if (e.key === 'Backspace') { setPoints(prev => prev.slice(0, -1)); setClosed(false); }
    if (e.key === 'Escape')    { setPoints([]); setClosed(false); }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      setIsPassThrough(false);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleMouseMove, handleClick, handleKeyDown, handleKeyUp, containerRef]);

  const svgPathStr = points.length === 0
    ? '(클릭해서 첫 점 추가)'
    : points.map((p, i) => (i === 0 ? `M ${p.svgX} ${p.svgY}` : `  L ${p.svgX} ${p.svgY}`)).join('\n') + (closed ? '\n  Z' : '');

  const pctCoordsStr = points.length === 0
    ? '(클릭해서 첫 점 추가)'
    : points.map(p => `x: ${p.pctX}, y: ${p.pctY}`).join('\n');

  const handleCopySvg = () => {
    navigator.clipboard.writeText(svgPathStr).then(() => {
      setCopiedSvg(true); setTimeout(() => setCopiedSvg(false), 2000);
    });
  };

  const handleCopyPct = () => {
    navigator.clipboard.writeText(pctCoordsStr).then(() => {
      setCopiedPct(true); setTimeout(() => setCopiedPct(false), 2000);
    });
  };

  return (
    <>
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}
        viewBox="0 0 1024 682"
        preserveAspectRatio="none"
      >
        <line x1={mouse.svgX} y1={0} x2={mouse.svgX} y2={682} stroke="rgba(255,80,80,0.5)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={0} y1={mouse.svgY} x2={1024} y2={mouse.svgY} stroke="rgba(255,80,80,0.5)" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={mouse.svgX} cy={mouse.svgY} r={5} fill="rgba(255,80,80,0.85)" />
        {points.length >= 2 && (
          <polyline points={points.map(p => `${p.svgX},${p.svgY}`).join(' ')} fill="none" stroke="rgba(241,196,15,0.9)" strokeWidth="2" strokeDasharray="6 3" />
        )}
        {closed && points.length >= 2 && (
          <line x1={points[points.length-1].svgX} y1={points[points.length-1].svgY} x2={points[0].svgX} y2={points[0].svgY} stroke="rgba(241,196,15,0.6)" strokeWidth="1.5" strokeDasharray="4 4" />
        )}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.svgX} cy={p.svgY} r={6} fill={i === 0 ? '#2ecc71' : '#f1c40f'} opacity={0.9} />
            <text x={p.svgX + 8} y={p.svgY - 6} fill="#fff" fontSize="14" fontFamily="monospace">{i + 1}</text>
          </g>
        ))}
      </svg>

      {/* 마우스 좌표 표시 */}
      <div style={{
        position: 'absolute',
        left: `${mouse.pctX}%`,
        top:  `${mouse.pctY}%`,
        transform: mouse.pctX > 75 ? 'translate(calc(-100% - 8px), 8px)' : 'translate(12px, 8px)',
        background: 'rgba(0,0,0,0.85)', color: '#f1c40f',
        fontFamily: 'monospace', fontSize: '13px',
        padding: '4px 10px', borderRadius: '4px',
        border: '1px solid rgba(241,196,15,0.4)',
        pointerEvents: 'none', zIndex: 60, whiteSpace: 'nowrap',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
      }}>
        <div>Pct: x: {mouse.pctX}, y: {mouse.pctY}</div>
        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>SVG: {mouse.svgX}, {mouse.svgY}</div>
      </div>

      {/* 디버그 패널 */}
      <div className="stage-map-debug-panel" style={{
        position: 'absolute', bottom: 20, left: 20, zIndex: 70,
        background: 'rgba(15, 15, 25, 0.95)', border: '2px solid #f1c40f',
        borderRadius: '12px', padding: '16px 20px', color: '#fff',
        fontFamily: 'monospace', fontSize: '12px', minWidth: '380px', maxWidth: '450px',
        backdropFilter: 'blur(6px)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        opacity: isPassThrough ? 0.08 : undefined,
        pointerEvents: isPassThrough ? 'none' : 'auto',
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
      }}>
        <div
          onMouseDown={handleMouseDown}
          style={{
            color: '#f1c40f', fontWeight: 'bold', marginBottom: 8, fontSize: '14px',
            display: 'flex', justifyContent: 'space-between',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
        >
          <span>🗺️ 스테이지 지도 좌표 디버그 (드래그 가능)</span>
          <span style={{ fontSize: '11px', color: '#aaa' }}>(DEV ONLY)</span>
        </div>
        <div style={{ color: '#ccc', marginBottom: 6, lineHeight: '1.6', fontSize: '11px' }}>
          <span style={{ color: '#7fdbff' }}>클릭</span> 점 추가 &nbsp;│&nbsp;
          <span style={{ color: '#7fdbff' }}>Z키</span> 닫기 &nbsp;│&nbsp;
          <span style={{ color: '#7fdbff' }}>Backspace</span> 취소 &nbsp;│&nbsp;
          <span style={{ color: '#7fdbff' }}>Esc</span> 초기화
        </div>
        <div style={{
          color: '#f1c40f', marginBottom: 12, fontSize: '11.5px', lineHeight: '1.5',
          background: 'rgba(241,196,15,0.12)', padding: '6px 10px', borderRadius: '6px',
          border: '1px dashed rgba(241,196,15,0.3)', letterSpacing: '0.2px'
        }}>
          💡 <strong>Shift 키를 누르고 있으면</strong> 창이 투명해지며 뒤쪽 지도에 점을 바로 찍을 수 있습니다. (관통 클릭 모드)
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <div style={{ color: '#ffd700', marginBottom: '4px', fontWeight: 'bold' }}>📍 퍼센트 좌표 (Pct)</div>
            <pre style={{
              background: 'rgba(255,255,255,0.06)', padding: '8px', borderRadius: 6,
              overflowX: 'auto', height: '120px', overflowY: 'auto',
              fontSize: '11px', color: '#e0e0e0', margin: 0,
              whiteSpace: 'pre-wrap', wordBreak: 'break-all', border: '1px solid rgba(255,255,255,0.1)'
            }}>{pctCoordsStr}</pre>
          </div>
          <div>
            <div style={{ color: '#2ecc71', marginBottom: '4px', fontWeight: 'bold' }}>📐 SVG Path (1024x682)</div>
            <pre style={{
              background: 'rgba(255,255,255,0.06)', padding: '8px', borderRadius: 6,
              overflowX: 'auto', height: '120px', overflowY: 'auto',
              fontSize: '11px', color: '#e0e0e0', margin: 0,
              whiteSpace: 'pre-wrap', wordBreak: 'break-all', border: '1px solid rgba(255,255,255,0.1)'
            }}>{svgPathStr}</pre>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleCopyPct} style={dbBtn(copiedPct ? '#2ecc71' : '#f1c40f')}>
            {copiedPct ? '✓ 복사됨' : '📋 Pct 복사'}
          </button>
          <button onClick={handleCopySvg} style={dbBtn(copiedSvg ? '#2ecc71' : '#2ecc71')}>
            {copiedSvg ? '✓ 복사됨' : '📋 SVG 복사'}
          </button>
          <button onClick={() => { setPoints([]); setClosed(false); }} style={dbBtn('#e74c3c')}>🗑️ 초기화</button>
          <button onClick={() => setClosed(true)} disabled={points.length < 2} style={dbBtn('#9b59b6')}>⬡ 닫기(Z)</button>
        </div>
      </div>
    </>
  );
};

const dbBtn = (color: string): React.CSSProperties => ({
  background: 'transparent', border: `1px solid ${color}`, color,
  borderRadius: '6px', padding: '6px 12px', cursor: 'pointer',
  fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold',
  transition: 'all 0.2s',
});
