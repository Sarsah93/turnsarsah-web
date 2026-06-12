import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { DIFFICULTY_CONFIGS, Difficulty } from '../constants/gameConfig';
import { TRANSLATIONS } from '../constants/translations';
import './styles/StatusPopup.css';

interface StatusPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatusPopup: React.FC<StatusPopupProps> = ({ isOpen, onClose }) => {
  const {
    player,
    bot,
    difficulty,
    equippedAltarSkills,
    chapterNum,
    gameState,
    language,
    altarSkillUses,
    consecutiveHandStacks,
    hasStage6Bonus,
    stageSkillsTriggered,
    eventBonuses,
  } = useGameStore();

  const [expandedStats, setExpandedStats] = useState<Record<string, boolean>>({});

  // --- 드래그 상태 ---
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // 닫기 버튼 클릭은 제외
    if ((e.target as HTMLElement).closest('.status-popup-close-btn')) return;
    e.preventDefault();
    isDragging.current = true;
    const rect = popupRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const onMouseUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  if (!isOpen) return null;

  const t = TRANSLATIONS[language].STATUS_POPUP;
  const config = DIFFICULTY_CONFIGS[difficulty];

  // Helper to toggle accordion
  const toggleExpand = (statKey: string) => {
    setExpandedStats((prev) => ({
      ...prev,
      [statKey]: !prev[statKey],
    }));
  };

  const isInBattle = gameState === 'BATTLE' || gameState === 'TUTORIAL';

  // 1. Difficulty
  const displayDifficulty = difficulty;

  // 2. Max HP (최대 코어 안정도)
  const baseHp = config.playerHp;
  let prepperBonus = 0;
  if (equippedAltarSkills.includes('1A')) {
    prepperBonus = equippedAltarSkills.includes('3A-1') ? 30 : 25;
  }
  let stage6Bonus = 0;
  if (hasStage6Bonus) {
    stage6Bonus = Math.floor(baseHp * config.stage6MaxHpBonus);
    if (equippedAltarSkills.includes('3A-1')) {
      stage6Bonus = Math.floor(stage6Bonus * 1.2);
    }
  }
  const debilitatingReduction = player.conditions.has('Debilitating') ? ((player.baseMaxHp ?? player.maxHp) - player.maxHp) : 0;
  const hpModifierSum = prepperBonus + stage6Bonus - debilitatingReduction;

  const maxHpFactors = [
    { name: t.factors.prepper, value: prepperBonus, active: equippedAltarSkills.includes('1A') },
    { name: t.factors.stage6, value: stage6Bonus, active: hasStage6Bonus },
    { name: t.factors.debilitated, value: -debilitatingReduction, active: player.conditions.has('Debilitating') },
    {
      name: (t.factors.eventMaxHp ?? 'Event Bonus (Max HP)').replace('{val}', `${(eventBonuses.maxHpBonusPercent * 100).toFixed(0)}%`),
      value: Math.round(eventBonuses.maxHpBonusPercent * 100),
      active: eventBonuses.maxHpBonusPercent !== 0,
    },
  ].filter(f => f.active || f.value !== 0);

  // 3. Swap Count (카드 교체 횟수)
  const baseSwaps = config.swapCount;
  const isSwapBonusActive = equippedAltarSkills.includes('5B-3') && player.hp <= player.maxHp * 0.25 && !stageSkillsTriggered.includes('5B-3');
  const swapModifierSum = isSwapBonusActive ? 2 : 0;

  const swapFactors = [
    {
      name: t.factors.fragments,
      value: 2,
      active: isSwapBonusActive,
      isConditional: equippedAltarSkills.includes('5B-3') && !isSwapBonusActive
    },
    {
      name: (t.factors.eventSwap ?? 'Event Bonus (Swap)').replace('{val}', `${eventBonuses.swapCountBonus >= 0 ? '+' : ''}${eventBonuses.swapCountBonus}`),
      value: eventBonuses.swapCountBonus,
      active: eventBonuses.swapCountBonus !== 0,
    },
  ].filter(f => f.active || f.isConditional);

  // 4. Flat Extra Damage (추가 데미지 고정)
  const baseFlatAtk = 0;
  const hasSharpen = equippedAltarSkills.includes('1B');
  const sharpenBonus = hasSharpen ? 25 : 0;

  let collapseBonus = 0;
  const hasCollapse = equippedAltarSkills.includes('5B-2');
  if (hasCollapse) {
    const coreStability = (player.hp / player.maxHp) * 100;
    if (coreStability <= 30) collapseBonus = 30;
    else if (coreStability <= 50) collapseBonus = 20;
    else if (coreStability <= 80) collapseBonus = 10;
  }
  const flatAtkModifierSum = sharpenBonus + collapseBonus;

  const flatAtkFactors = [
    { name: t.factors.sharpen, value: 25, active: hasSharpen },
    {
      name: t.factors.collapse,
      value: collapseBonus,
      active: hasCollapse && collapseBonus > 0,
      isConditional: hasCollapse && collapseBonus === 0
    }
  ].filter(f => f.active || f.isConditional);

  // 5. Percent Extra Damage (추가 데미지 %)
  const basePercentAtk = 0;
  const hasOverloaded = equippedAltarSkills.includes('5A-2');
  const overloadedPercent = hasOverloaded ? consecutiveHandStacks * 10 : 0;

  const hasResonance = equippedAltarSkills.includes('5A-3');
  let resonancePercent = 0;
  if (hasResonance && isInBattle && bot) {
    const bossHpRatio = bot.hp / bot.maxHp;
    if (bossHpRatio <= 0.25) resonancePercent = 10;
    else if (bossHpRatio <= 0.50) resonancePercent = 5;
  }

  const hasAdaptive = equippedAltarSkills.includes('6A-1');
  const adaptivePercent = hasAdaptive ? (altarSkillUses['6A-1_stacks'] || 0) * 5 : 0;

  const hasCoreResonance = equippedAltarSkills.includes('6B-1');
  const coreResonancePercent = (hasCoreResonance && isInBattle && bot && bot.hp <= bot.maxHp * 0.5) ? 15 : 0;

  const percentAtkModifierSum = overloadedPercent + resonancePercent + adaptivePercent + coreResonancePercent
    + Math.round((eventBonuses.percentAtkBonus ?? 0) * 100);

  const percentAtkFactors = [
    {
      name: t.factors.overloaded,
      value: overloadedPercent,
      active: hasOverloaded && overloadedPercent > 0,
      isConditional: hasOverloaded && overloadedPercent === 0
    },
    {
      name: t.factors.resonance,
      value: resonancePercent,
      active: hasResonance && resonancePercent > 0,
      isConditional: hasResonance && resonancePercent === 0
    },
    {
      name: t.factors.adaptive,
      value: adaptivePercent,
      active: hasAdaptive && adaptivePercent > 0,
      isConditional: hasAdaptive && adaptivePercent === 0
    },
    {
      name: t.factors.coreResonance,
      value: coreResonancePercent,
      active: hasCoreResonance && coreResonancePercent > 0,
      isConditional: hasCoreResonance && coreResonancePercent === 0
    },
    {
      name: (t.factors.eventPctAtk ?? 'Event Bonus (Damage%)').replace('{val}', Math.round((eventBonuses.percentAtkBonus ?? 0) * 100).toString()),
      value: Math.round((eventBonuses.percentAtkBonus ?? 0) * 100),
      active: (eventBonuses.percentAtkBonus ?? 0) !== 0,
    },
  ].filter(f => f.active || f.isConditional);

  // 6. Critical Multiplier (크리티컬 배수)
  const baseCritMult = Math.round(config.criticalMultiplier * 100);
  const critMultModifierSum = Math.round((eventBonuses.critMultBonus ?? 0) * 100);

  const critMultFactors: any[] = [
    {
      name: (t.factors.eventCritMult ?? 'Event Bonus (Crit Mult)').replace('{val}', `${Math.round((eventBonuses.critMultBonus ?? 0) * 100)}%`),
      value: Math.round((eventBonuses.critMultBonus ?? 0) * 100),
      active: (eventBonuses.critMultBonus ?? 0) !== 0,
    },
  ].filter(f => f.active);

  // 7. Critical Chance Per Card (카드당 크리티컬 확률)
  const baseCritChance = Math.round(config.criticalChancePerCard * 100);
  const critChanceModifierSum = Math.round((eventBonuses.critChanceBonus ?? 0) * 100);
  const hasBottomDeal = equippedAltarSkills.includes('4A-2');

  const critChanceFactors = [
    {
      name: t.factors.bottomDeal,
      value: 0,
      active: false,
      isConditional: hasBottomDeal
    },
    {
      name: (t.factors.eventCritChance ?? 'Event Bonus (Crit Chance)').replace('{val}', Math.round((eventBonuses.critChanceBonus ?? 0) * 100).toString()),
      value: Math.round((eventBonuses.critChanceBonus ?? 0) * 100),
      active: (eventBonuses.critChanceBonus ?? 0) !== 0,
    },
  ].filter(f => f.active || f.isConditional);

  // 8. Evasion Rate (회피율)
  const baseEvasion = Math.round(config.avoidChance * 100);
  const isOnenessWithNature = equippedAltarSkills.includes('2B');
  let currentEvasion = 0;
  if (chapterNum === '2B' && !isOnenessWithNature) {
    currentEvasion = 0;
  } else {
    currentEvasion = Math.round((config.avoidChance + (isOnenessWithNature ? 0.05 : 0)) * 100);
  }
  const evasionModifierSum = currentEvasion - baseEvasion + Math.round((eventBonuses.evasionBonus ?? 0) * 100);

  const evasionFactors = [
    { name: t.factors.oneness, value: 5, active: isOnenessWithNature },
    {
      name: t.factors.envPenalty2B,
      value: -baseEvasion,
      active: chapterNum === '2B' && !isOnenessWithNature
    },
    {
      name: (t.factors.eventEvasion ?? 'Event Bonus (Evasion)').replace('{val}', Math.round((eventBonuses.evasionBonus ?? 0) * 100).toString()),
      value: Math.round((eventBonuses.evasionBonus ?? 0) * 100),
      active: (eventBonuses.evasionBonus ?? 0) !== 0,
    },
  ].filter(f => f.active || f.value !== 0);

  // 9. Defense (방어력)
  // 고정 방어력: 'Defense Reduced' 상태이상에 의해 감소
  const defReducedCond = player.conditions.get('Defense Reduced');
  const flatDefReduction = defReducedCond ? ((defReducedCond.data as any)?.amount || 0) : 0;
  const flatDefValue = -flatDefReduction; // 기본 0, 방어력 감소 시 음수

  // 퍼센트 방어력: 3B-1 장착 시 +30%, 'Damage Taken Increased' 시 감소
  const has3B1 = equippedAltarSkills.includes('3B-1');
  const dmgIncCond = player.conditions.get('Damage Taken Increased');
  const dmgTakenIncreasedPercent = dmgIncCond ? ((dmgIncCond.data as any)?.percent || 0) : 0;
  const percentDefValue = (has3B1 ? 30 : 0) - dmgTakenIncreasedPercent;

  // 고정 요인 목록 (먼저 표시)
  const defenseFlatFactors = [
    {
      name: t.factors.defenseReduced.replace('{amount}', flatDefReduction.toString()),
      value: -flatDefReduction,
      active: flatDefReduction > 0
    }
  ].filter(f => f.active);

  // 퍼센트 요인 목록 (나중에 표시)
  const defensePercentFactors = [
    {
      name: t.factors.equipmentGear,
      value: 30,
      active: has3B1
    },
    {
      name: t.factors.damageTakenIncreased.replace('{percent}', dmgTakenIncreasedPercent.toString()),
      value: -dmgTakenIncreasedPercent,
      active: dmgTakenIncreasedPercent > 0
    },
    {
      name: (t.factors.eventDmgTaken ?? 'Event Bonus (Dmg Taken)').replace('{val}', Math.round((eventBonuses.damageTakenPercent ?? 0) * 100).toString()),
      value: -Math.round((eventBonuses.damageTakenPercent ?? 0) * 100), // 방어력 관점에서 음수
      active: (eventBonuses.damageTakenPercent ?? 0) !== 0,
    },
  ].filter(f => f.active);


  // Render Helper for Modifiers: (±X) or (±X%)
  const renderModifier = (modVal: number, isPercent: boolean, nonNumeric: boolean = false) => {
    if (nonNumeric) {
      return <span className="stat-modifier neutral">(+ )</span>;
    }
    if (modVal > 0) {
      return <span className="stat-modifier positive">(+{modVal}{isPercent ? '%' : ''})</span>;
    } else if (modVal < 0) {
      return <span className="stat-modifier negative">({modVal}{isPercent ? '%' : ''})</span>;
    } else {
      return <span className="stat-modifier neutral">(+0)</span>;
    }
  };

  // Render Factor details inside Accordion
  const renderFactorList = (factors: any[], isPercent: boolean) => {
    if (factors.length === 0) {
      return <div className="factor-empty">{t.noFactors}</div>;
    }

    return (
      <div className="factor-list-container">
        <div className="factor-list-title">{t.appliedFactors}</div>
        <div className="factor-items">
          {factors.map((f, idx) => {
            let valText = "";
            let statusText = "";
            let statusClass = "neutral";

            if (f.active) {
              statusText = t.active;
              statusClass = "active";
              if (f.value > 0) valText = `+${f.value}${isPercent ? '%' : ''}`;
              else if (f.value < 0) valText = `${f.value}${isPercent ? '%' : ''}`;
              else valText = `+0`;
            } else if (f.isConditional) {
              statusText = t.potential;
              statusClass = "potential";
              valText = `(+${f.value === 0 ? '5' : f.value}${isPercent ? '%' : ''} ${t.potential})`;
            }

            return (
              <div key={idx} className="factor-item">
                <span className="factor-name">• {f.name}</span>
                <div className="factor-status-wrapper">
                  <span className={`factor-status ${statusClass}`}>{statusText}</span>
                  {valText && (
                    <span className={`factor-value ${f.value > 0 ? 'positive' : f.value < 0 ? 'negative' : 'neutral'}`}>
                      {valText}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 드래그 중 오버레이 클릭 방지를 위한 핸들러
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) return;
    onClose();
  }, [onClose]);

  // 팝업 위치 스타일: 드래그 후에는 고정 위치 사용
  const popupStyle: React.CSSProperties = position
    ? { position: 'fixed', left: position.x, top: position.y, margin: 0, transform: 'none' }
    : {};

  return (
    <div
      className="status-popup-overlay"
      onClick={handleOverlayClick}
      style={position ? { alignItems: 'flex-start', justifyContent: 'flex-start' } : {}}
    >
      <div
        ref={popupRef}
        className="status-popup-content"
        style={popupStyle}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - 드래그 핸들 */}
        <div
          className="status-popup-header status-popup-drag-handle"
          onMouseDown={onMouseDown}
        >
          <h2 className="status-popup-title">{t.title}</h2>
          <button className="status-popup-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="status-popup-body">
          <div className="status-rows">
            
            {/* 1. Difficulty */}
            <div className="status-row">
              <div className="status-row-main">
                <span className="status-label">{t.difficulty}</span>
                <div className="status-val-wrapper">
                  <span className="status-value highlight">{displayDifficulty}</span>
                  {renderModifier(0, false, true)}
                </div>
              </div>
            </div>

            {/* 2. Max HP */}
            <div className="status-row">
              <div className="status-row-main">
                <span className="status-label">{t.maxHp}</span>
                <div className="status-val-wrapper">
                  <span className="status-value">{player.maxHp}</span>
                  <button 
                    className="modifier-toggle-btn"
                    onClick={() => toggleExpand('maxHp')}
                  >
                    {renderModifier(hpModifierSum, false)}
                  </button>
                </div>
              </div>
              <div className={`status-accordion ${expandedStats['maxHp'] ? 'expanded' : ''}`}>
                {renderFactorList(maxHpFactors, false)}
              </div>
            </div>

            {/* 3. Swap Count */}
            <div className="status-row">
              <div className="status-row-main">
                <span className="status-label">{t.swapCount}</span>
                <div className="status-val-wrapper">
                  <span className="status-value">{baseSwaps + swapModifierSum}</span>
                  <button 
                    className="modifier-toggle-btn"
                    onClick={() => toggleExpand('swapCount')}
                  >
                    {renderModifier(swapModifierSum, false)}
                  </button>
                </div>
              </div>
              <div className={`status-accordion ${expandedStats['swapCount'] ? 'expanded' : ''}`}>
                {renderFactorList(swapFactors, false)}
              </div>
            </div>

            {/* 4. Flat Extra Damage */}
            <div className="status-row">
              <div className="status-row-main">
                <span className="status-label">{t.flatAtk}</span>
                <div className="status-val-wrapper">
                  <span className="status-value">{flatAtkModifierSum}</span>
                  <button 
                    className="modifier-toggle-btn"
                    onClick={() => toggleExpand('flatAtk')}
                  >
                    {renderModifier(flatAtkModifierSum, false)}
                  </button>
                </div>
              </div>
              <div className={`status-accordion ${expandedStats['flatAtk'] ? 'expanded' : ''}`}>
                {renderFactorList(flatAtkFactors, false)}
              </div>
            </div>

            {/* 5. Percent Extra Damage */}
            <div className="status-row">
              <div className="status-row-main">
                <span className="status-label">{t.percentAtk}</span>
                <div className="status-val-wrapper">
                  <span className="status-value">+{percentAtkModifierSum}%</span>
                  <button 
                    className="modifier-toggle-btn"
                    onClick={() => toggleExpand('percentAtk')}
                  >
                    {renderModifier(percentAtkModifierSum, true)}
                  </button>
                </div>
              </div>
              <div className={`status-accordion ${expandedStats['percentAtk'] ? 'expanded' : ''}`}>
                {renderFactorList(percentAtkFactors, true)}
              </div>
            </div>

            {/* 6. Critical Multiplier */}
            <div className="status-row">
              <div className="status-row-main">
                <span className="status-label">{t.critMult}</span>
                <div className="status-val-wrapper">
                  <span className="status-value">{baseCritMult}%</span>
                  <button 
                    className="modifier-toggle-btn"
                    onClick={() => toggleExpand('critMult')}
                  >
                    {renderModifier(critMultModifierSum, true)}
                  </button>
                </div>
              </div>
              <div className={`status-accordion ${expandedStats['critMult'] ? 'expanded' : ''}`}>
                {renderFactorList(critMultFactors, true)}
              </div>
            </div>

            {/* 7. Critical Chance Per Card */}
            <div className="status-row">
              <div className="status-row-main">
                <span className="status-label">
                  {t.critChance}
                  <span className="status-sub-label"> ({t.jokerCard})</span>
                </span>
                <div className="status-val-wrapper">
                  <span className="status-value">{baseCritChance}%</span>
                  <button 
                    className="modifier-toggle-btn"
                    onClick={() => toggleExpand('critChance')}
                  >
                    {renderModifier(critChanceModifierSum, true)}
                  </button>
                </div>
              </div>
              <div className={`status-accordion ${expandedStats['critChance'] ? 'expanded' : ''}`}>
                {renderFactorList(critChanceFactors, true)}
              </div>
            </div>

            {/* 8. Evasion Rate */}
            <div className="status-row">
              <div className="status-row-main">
                <span className="status-label">{t.evasion}</span>
                <div className="status-val-wrapper">
                  <span className="status-value">{currentEvasion}%</span>
                  <button 
                    className="modifier-toggle-btn"
                    onClick={() => toggleExpand('evasion')}
                  >
                    {renderModifier(evasionModifierSum, true)}
                  </button>
                </div>
              </div>
              <div className={`status-accordion ${expandedStats['evasion'] ? 'expanded' : ''}`}>
                {renderFactorList(evasionFactors, true)}
              </div>
            </div>

            {/* 9. Defense (방어력) */}
            <div className="status-row">
              <div className="status-row-main">
                <span className="status-label">{t.defense}</span>
                <div className="status-val-wrapper">
                  <span className="status-value">0</span>
                  <button
                    className="modifier-toggle-btn"
                    onClick={() => toggleExpand('defense')}
                  >
                    {/* 고정 수정자 */}
                    {renderModifier(flatDefValue, false)}
                    {/* 퍼센트 수정자 */}
                    {renderModifier(percentDefValue, true)}
                  </button>
                </div>
              </div>
              <div className={`status-accordion ${expandedStats['defense'] ? 'expanded' : ''}`}>
                {/* 고정 요인 목록 먼저 */}
                {defenseFlatFactors.length > 0 && renderFactorList(defenseFlatFactors, false)}
                {/* 퍼센트 요인 목록 */}
                {defensePercentFactors.length > 0 && renderFactorList(defensePercentFactors, true)}
                {/* 둘 다 없으면 기본 문구 */}
                {defenseFlatFactors.length === 0 && defensePercentFactors.length === 0 && (
                  <div className="factor-empty">{t.noFactors}</div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
