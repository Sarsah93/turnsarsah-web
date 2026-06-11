import React, { useState } from 'react';
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
  } = useGameStore();

  const [expandedStats, setExpandedStats] = useState<Record<string, boolean>>({});

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
  const debilitatingReduction = player.conditions.has('Debilitating') ? (player.baseMaxHp - player.maxHp) : 0;
  const hpModifierSum = prepperBonus + stage6Bonus - debilitatingReduction;

  const maxHpFactors = [
    { name: t.factors.prepper, value: prepperBonus, active: equippedAltarSkills.includes('1A') },
    { name: t.factors.stage6, value: stage6Bonus, active: hasStage6Bonus },
    { name: t.factors.debilitated, value: -debilitatingReduction, active: player.conditions.has('Debilitating') }
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
    }
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

  const percentAtkModifierSum = overloadedPercent + resonancePercent + adaptivePercent + coreResonancePercent;

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
    }
  ].filter(f => f.active || f.isConditional);

  // 6. Critical Multiplier (크리티컬 배수)
  const baseCritMult = Math.round(config.criticalMultiplier * 100);
  const critMultModifierSum = 0;

  const critMultFactors: any[] = [];

  // 7. Critical Chance Per Card (카드당 크리티컬 확률)
  const baseCritChance = Math.round(config.criticalChancePerCard * 100);
  const critChanceModifierSum = 0;
  const hasBottomDeal = equippedAltarSkills.includes('4A-2');

  const critChanceFactors = [
    {
      name: t.factors.bottomDeal,
      value: 0,
      active: false,
      isConditional: hasBottomDeal
    }
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
  const evasionModifierSum = currentEvasion - baseEvasion;

  const evasionFactors = [
    { name: t.factors.oneness, value: 5, active: isOnenessWithNature },
    {
      name: t.factors.envPenalty2B,
      value: -baseEvasion,
      active: chapterNum === '2B' && !isOnenessWithNature
    }
  ].filter(f => f.active || f.value !== 0);


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

  return (
    <div className="status-popup-overlay" onClick={onClose}>
      <div className="status-popup-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="status-popup-header">
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

          </div>
        </div>

      </div>
    </div>
  );
};
