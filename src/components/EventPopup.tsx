// components/EventPopup.tsx
// 이벤트 스테이지 팝업 — 12종 이벤트 시나리오 UI 및 로직 처리

import React, { useState } from 'react';
import './styles/EventPopup.css';
import { EventId } from '../constants/eventScenarios';
import { useGameStore } from '../state/gameStore';
import { TRANSLATIONS } from '../constants/translations';

interface Props {
  eventId: EventId;
  onClose: () => void;
}

type PopupPhase = 'PROMPT' | 'HP_COST' | 'RESULT' | 'MAJOR_CHOOSE';

interface ResultState {
  type: 'success' | 'fail' | 'neutral';
  text: string;
}

// ── 유틸: 현재 HP에서 퍼센트 차감 ──────────────────────────────────────────
function deductHpPercent(pct: number): void {
  const s = useGameStore.getState();
  const cost = Math.max(1, Math.floor(s.player.hp * pct));
  s.setPlayerHp(Math.max(0, s.player.hp - cost));
}

// ── 즉시 HP 고정량 감소 ─────────────────────────────────────────────────────
function deductHpFlat(amount: number): void {
  const s = useGameStore.getState();
  s.setPlayerHp(Math.max(0, s.player.hp - amount));
}

export const EventPopup: React.FC<Props> = ({ eventId, onClose }) => {
  const language = useGameStore((s) => s.language);
  const t = (TRANSLATIONS[language] as any).EVENT;

  const [phase, setPhase] = useState<PopupPhase>('PROMPT');
  const [result, setResult] = useState<ResultState | null>(null);
  const [hpCostMsg, setHpCostMsg] = useState<string>('');

  // ── 카테고리 제목 매핑 ────────────────────────────────────────────────────
  const categoryLabel = (() => {
    if (eventId.startsWith('CREATURE')) return t.CAT_CREATURE;
    if (eventId.startsWith('MERCHANT')) return t.CAT_MERCHANT;
    if (eventId.startsWith('NODE'))     return t.CAT_NODE;
    if (eventId.startsWith('ALTAR'))    return t.CAT_ALTAR;
    return '';
  })();

  // ── 확인 버튼 클릭 ────────────────────────────────────────────────────────
  const handleConfirm = () => {
    onClose();
  };

  // ── 거절/포기 ─────────────────────────────────────────────────────────────
  const handleNo = (noMsg: string) => {
    setResult({ type: 'neutral', text: noMsg });
    setPhase('RESULT');
  };

  // ── HP 소모 처리 공통 (% 차감 후 HP 소모 안내 단계로 이동) ─────────────────
  const consumeHpPercent = (pct: number, costMsg: string): void => {
    deductHpPercent(pct);
    setHpCostMsg(costMsg);
    setPhase('HP_COST');
  };

  // ──────────────────────────────────────────────────────────────────────────
  //  이벤트별 로직
  // ──────────────────────────────────────────────────────────────────────────

  // 1.1 소동물
  const handleCreatureSmallProceed = () => {
    const success = Math.random() < 0.70;
    if (success) {
      useGameStore.getState().applyEventBonuses({ percentAtkBonus: 0.02 });
      setResult({ type: 'success', text: t.C_SMALL_SUCCESS });
    } else {
      useGameStore.getState().setPendingBattleDebuffs({ hpDrainPerTurn: 5, sourceLabel: t.CAT_CREATURE });
      setResult({ type: 'fail', text: t.C_SMALL_FAIL });
    }
    setPhase('RESULT');
  };

  // 1.2 중형 동물
  const handleCreatureMedProceed = () => {
    const success = Math.random() < 0.50;
    if (success) {
      useGameStore.getState().applyEventBonuses({ percentAtkBonus: 0.04 });
      setResult({ type: 'success', text: t.C_MED_SUCCESS });
    } else {
      deductHpFlat(10);
      setResult({ type: 'fail', text: t.C_MED_FAIL });
    }
    setPhase('RESULT');
  };

  // 1.3 대형 동물
  const handleCreatureLrgProceed = () => {
    const success = Math.random() < 0.30;
    if (success) {
      useGameStore.getState().applyEventBonuses({ percentAtkBonus: 0.06 });
      setResult({ type: 'success', text: t.C_LRG_SUCCESS });
    } else {
      deductHpFlat(20);
      setResult({ type: 'fail', text: t.C_LRG_FAIL });
    }
    setPhase('RESULT');
  };

  // 2.1 수상한 과자
  const handleCandyProceed = () => {
    const success = Math.random() < 0.60;
    if (success) {
      useGameStore.getState().applyEventBonuses({ critMultBonus: 0.10 });
      setResult({ type: 'success', text: t.M_CANDY_SUCCESS });
    } else {
      useGameStore.getState().setPendingBattleDebuffs({ hpDrainPerTurn: 8, sourceLabel: t.CAT_MERCHANT });
      setResult({ type: 'fail', text: t.M_CANDY_FAIL });
    }
    setPhase('RESULT');
  };

  // 2.2 수상한 음료 (대성공 30% / 소성공 50% / 실패 20%)
  const handleDrinkProceed = () => {
    const roll = Math.random();
    if (roll < 0.30) {
      useGameStore.getState().applyEventBonuses({ evasionBonus: 0.06 });
      setResult({ type: 'success', text: t.M_DRINK_GREAT });
    } else if (roll < 0.80) {
      useGameStore.getState().applyEventBonuses({ evasionBonus: 0.03 });
      setResult({ type: 'neutral', text: t.M_DRINK_OK });
    } else {
      deductHpFlat(15);
      setResult({ type: 'fail', text: t.M_DRINK_FAIL });
    }
    setPhase('RESULT');
  };

  // 2.3 수상한 큐브
  const handleCubeProceed = () => {
    const success = Math.random() < 0.55;
    if (success) {
      useGameStore.getState().applyEventBonuses({ maxHpBonusPercent: 0.10 });
      setResult({ type: 'success', text: t.M_CUBE_SUCCESS });
    } else {
      useGameStore.getState().applyEventBonuses({ maxHpBonusPercent: -0.08 });
      setResult({ type: 'fail', text: t.M_CUBE_FAIL });
    }
    setPhase('RESULT');
  };

  // 3.1 잔해 패턴 분석 (즉시 결정)
  const handleNodeAnalYes = () => {
    const success = Math.random() < 0.60;
    if (success) {
      useGameStore.getState().applyEventBonuses({ swapCountBonus: 1 });
      setResult({ type: 'success', text: t.N_ANAL_SUCCESS });
    } else {
      useGameStore.getState().setPendingBattleDebuffs({ swapCountPenalty: -1, sourceLabel: t.CAT_NODE });
      setResult({ type: 'fail', text: t.N_ANAL_FAIL });
    }
    setPhase('RESULT');
  };

  // 3.2 잔해 직접 흡수 (즉시 결정)
  const handleNodeAbsYes = () => {
    const success = Math.random() < 0.50;
    if (success) {
      useGameStore.getState().applyEventBonuses({ maxHpBonusPercent: 0.08 });
      setResult({ type: 'success', text: t.N_ABS_SUCCESS });
    } else {
      deductHpFlat(20);
      setResult({ type: 'fail', text: t.N_ABS_FAIL });
    }
    setPhase('RESULT');
  };

  // 3.3 잔해 충격 파괴 (즉시 결정)
  const handleNodeDestYes = () => {
    const success = Math.random() < 0.55;
    if (success) {
      useGameStore.getState().applyEventBonuses({ percentAtkBonus: 0.03 });
      setResult({ type: 'success', text: t.N_DEST_SUCCESS });
    } else {
      useGameStore.getState().applyEventBonuses({ percentAtkBonus: -0.03 });
      setResult({ type: 'fail', text: t.N_DEST_FAIL });
    }
    setPhase('RESULT');
  };

  // 4.1 소제물 봉헌 (즉시 결정)
  const handleAltarMinorYes = () => {
    const stats = ['percentAtkBonus', 'critMultBonus', 'evasionBonus'] as const;
    const chosen = stats[Math.floor(Math.random() * stats.length)];
    const statLabel = chosen === 'percentAtkBonus' ? t.STAT_ATK
                    : chosen === 'critMultBonus'    ? t.STAT_CRIT_MULT
                    : t.STAT_EVASION;
    useGameStore.getState().applyEventBonuses({ [chosen]: -0.03 });
    const sacrificeMsg = (t.A_MINOR_SACRIFICE as string).replace('{stat}', statLabel);

    const rewardRoll = Math.random();
    let rewardMsg = t.A_MINOR_REWARD_NONE;
    if (rewardRoll < 0.33) {
      useGameStore.getState().applyEventBonuses({ critChanceBonus: 0.03 });
      rewardMsg = t.A_MINOR_REWARD_CRIT;
    } else if (rewardRoll < 0.66) {
      useGameStore.getState().applyEventBonuses({ percentAtkBonus: 0.03 });
      rewardMsg = t.A_MINOR_REWARD_ATK;
    }
    setResult({ type: 'neutral', text: `${sacrificeMsg}\n${rewardMsg}` });
    setPhase('RESULT');
  };

  // 4.2 대제물 — 선택지 단계
  const handleAltarMajorYes = () => {
    setPhase('MAJOR_CHOOSE');
  };

  const handleAltarMajorChoose = (sacrifice: 'ATK' | 'HP' | 'SWAP') => {
    if (sacrifice === 'ATK')  useGameStore.getState().applyEventBonuses({ percentAtkBonus: -0.10 });
    if (sacrifice === 'HP')   useGameStore.getState().applyEventBonuses({ maxHpBonusPercent: -0.10 });
    if (sacrifice === 'SWAP') useGameStore.getState().applyEventBonuses({ swapCountBonus: -1 });

    const success = Math.random() < 0.60;
    if (success) {
      const rewardRoll = Math.random();
      if (rewardRoll < 0.33) {
        useGameStore.getState().applyEventBonuses({ maxHpBonusPercent: 0.10 });
        setResult({ type: 'success', text: t.A_MAJOR_SUCCESS_HP });
      } else if (rewardRoll < 0.66) {
        useGameStore.getState().applyEventBonuses({ percentAtkBonus: 0.05 });
        setResult({ type: 'success', text: t.A_MAJOR_SUCCESS_ATK });
      } else {
        useGameStore.getState().applyEventBonuses({ critMultBonus: 0.15 });
        setResult({ type: 'success', text: t.A_MAJOR_SUCCESS_CRIT });
      }
    } else {
      useGameStore.getState().applyEventBonuses({
        percentAtkBonus: -0.05,
        maxHpBonusPercent: -0.05,
        critChanceBonus: -0.03,
      });
      setResult({ type: 'fail', text: t.A_MAJOR_FAIL });
    }
    setPhase('RESULT');
  };

  // 4.3 피의 봉헌
  const handleAltarBloodProceed = () => {
    const success = Math.random() < 0.40;
    if (success) {
      useGameStore.getState().applyEventBonuses({ percentAtkBonus: 0.25, damageTakenPercent: 0.25 });
      setResult({ type: 'success', text: t.A_BLOOD_SUCCESS });
    } else {
      setResult({ type: 'neutral', text: t.A_BLOOD_FAIL });
    }
    setPhase('RESULT');
  };

  // ──────────────────────────────────────────────────────────────────────────
  //  HP 소모 → 결과 진행 매핑
  // ──────────────────────────────────────────────────────────────────────────
  const hpCostProceedMap: Record<string, () => void> = {
    CREATURE_SMALL: handleCreatureSmallProceed,
    CREATURE_MEDIUM: handleCreatureMedProceed,
    CREATURE_LARGE: handleCreatureLrgProceed,
    MERCHANT_CANDY: handleCandyProceed,
    MERCHANT_DRINK: handleDrinkProceed,
    MERCHANT_CUBE: handleCubeProceed,
    ALTAR_BLOOD: handleAltarBloodProceed,
  };

  // ──────────────────────────────────────────────────────────────────────────
  //  이벤트별 PROMPT 렌더링
  // ──────────────────────────────────────────────────────────────────────────
  const renderPromptContent = () => {
    switch (eventId) {
      case 'CREATURE_SMALL':
        return (<>
          <p className="event-popup-text">{t.C_SMALL_PROMPT}</p>
          <div className="event-popup-buttons">
            <button className="event-popup-btn yes" onClick={() => consumeHpPercent(0.05, t.C_SMALL_HP_COST)}>{t.YES}</button>
            <button className="event-popup-btn no"  onClick={() => handleNo(t.C_SMALL_NO)}>{t.NO}</button>
          </div>
        </>);
      case 'CREATURE_MEDIUM':
        return (<>
          <p className="event-popup-text">{t.C_MED_PROMPT}</p>
          <div className="event-popup-buttons">
            <button className="event-popup-btn yes" onClick={() => consumeHpPercent(0.08, t.C_MED_HP_COST)}>{t.YES}</button>
            <button className="event-popup-btn no"  onClick={() => handleNo(t.C_MED_NO)}>{t.NO}</button>
          </div>
        </>);
      case 'CREATURE_LARGE':
        return (<>
          <p className="event-popup-text">{t.C_LRG_PROMPT}</p>
          <div className="event-popup-buttons">
            <button className="event-popup-btn yes" onClick={() => consumeHpPercent(0.12, t.C_LRG_HP_COST)}>{t.YES}</button>
            <button className="event-popup-btn no"  onClick={() => handleNo(t.C_LRG_NO)}>{t.NO}</button>
          </div>
        </>);
      case 'MERCHANT_CANDY':
        return (<>
          <p className="event-popup-text">{t.M_CANDY_PROMPT}</p>
          <div className="event-popup-buttons">
            <button className="event-popup-btn yes" onClick={() => consumeHpPercent(0.05, t.M_CANDY_HP_COST)}>{t.YES}</button>
            <button className="event-popup-btn no"  onClick={() => handleNo(t.M_CANDY_NO)}>{t.NO}</button>
          </div>
        </>);
      case 'MERCHANT_DRINK':
        return (<>
          <p className="event-popup-text">{t.M_DRINK_PROMPT}</p>
          <div className="event-popup-buttons">
            <button className="event-popup-btn yes" onClick={() => consumeHpPercent(0.08, t.M_DRINK_HP_COST)}>{t.YES}</button>
            <button className="event-popup-btn no"  onClick={() => handleNo(t.M_DRINK_NO)}>{t.NO}</button>
          </div>
        </>);
      case 'MERCHANT_CUBE':
        return (<>
          <p className="event-popup-text">{t.M_CUBE_PROMPT}</p>
          <div className="event-popup-buttons">
            <button className="event-popup-btn yes" onClick={() => consumeHpPercent(0.10, t.M_CUBE_HP_COST)}>{t.YES}</button>
            <button className="event-popup-btn no"  onClick={() => handleNo(t.M_CUBE_NO)}>{t.NO}</button>
          </div>
        </>);
      case 'NODE_ANALYSIS':
        return (<>
          <p className="event-popup-text">{t.N_ANAL_PROMPT}</p>
          <div className="event-popup-buttons">
            <button className="event-popup-btn yes" onClick={handleNodeAnalYes}>{t.YES}</button>
            <button className="event-popup-btn no"  onClick={() => handleNo(t.N_ANAL_NO)}>{t.NO}</button>
          </div>
        </>);
      case 'NODE_ABSORB':
        return (<>
          <p className="event-popup-text">{t.N_ABS_PROMPT}</p>
          <div className="event-popup-buttons">
            <button className="event-popup-btn yes" onClick={handleNodeAbsYes}>{t.YES}</button>
            <button className="event-popup-btn no"  onClick={() => handleNo(t.N_ABS_NO)}>{t.NO}</button>
          </div>
        </>);
      case 'NODE_DESTROY':
        return (<>
          <p className="event-popup-text">{t.N_DEST_PROMPT}</p>
          <div className="event-popup-buttons">
            <button className="event-popup-btn yes" onClick={handleNodeDestYes}>{t.YES}</button>
            <button className="event-popup-btn no"  onClick={() => handleNo(t.N_DEST_NO)}>{t.NO}</button>
          </div>
        </>);
      case 'ALTAR_MINOR':
        return (<>
          <p className="event-popup-text">{t.A_MINOR_PROMPT}</p>
          <div className="event-popup-buttons">
            <button className="event-popup-btn yes" onClick={handleAltarMinorYes}>{t.YES}</button>
            <button className="event-popup-btn no"  onClick={() => handleNo(t.A_MINOR_NO)}>{t.NO}</button>
          </div>
        </>);
      case 'ALTAR_MAJOR':
        return (<>
          <p className="event-popup-text">{t.A_MAJOR_PROMPT}</p>
          <div className="event-popup-buttons">
            <button className="event-popup-btn yes" onClick={handleAltarMajorYes}>{t.YES}</button>
            <button className="event-popup-btn no"  onClick={() => handleNo(t.A_MAJOR_NO)}>{t.NO}</button>
          </div>
        </>);
      case 'ALTAR_BLOOD':
        return (<>
          <p className="event-popup-text">{t.A_BLOOD_PROMPT}</p>
          <div className="event-popup-buttons">
            <button className="event-popup-btn yes" onClick={() => consumeHpPercent(0.15, t.A_BLOOD_HP_COST)}>{t.YES}</button>
            <button className="event-popup-btn no"  onClick={() => handleNo(t.A_BLOOD_NO)}>{t.NO}</button>
          </div>
        </>);
      default:
        return null;
    }
  };

  return (
    <div className="event-popup-overlay">
      <div className="event-popup-box">
        <div className="event-popup-category">🔮 {categoryLabel}</div>

        {/* PROMPT 단계 */}
        {phase === 'PROMPT' && renderPromptContent()}

        {/* HP 소모 안내 단계 */}
        {phase === 'HP_COST' && (
          <>
            <p className="event-popup-text event-popup-hp-flash">{hpCostMsg}</p>
            <div className="event-popup-divider" />
            <div className="event-popup-buttons">
              <button
                className="event-popup-btn confirm"
                onClick={hpCostProceedMap[eventId] ?? handleConfirm}
              >
                {t.CONFIRM}
              </button>
            </div>
          </>
        )}

        {/* 대제물 선택 단계 */}
        {phase === 'MAJOR_CHOOSE' && (
          <>
            <p className="event-popup-text" style={{ fontSize: '1.9rem', marginBottom: 16 }}>
              {language === 'KR' ? '제물을 선택하세요.' : 'Choose your sacrifice.'}
            </p>
            <div className="event-popup-buttons" style={{ flexDirection: 'column', gap: 12 }}>
              <button className="event-popup-btn option" onClick={() => handleAltarMajorChoose('ATK')}>
                ⚔️ {t.A_MAJOR_OPT_ATK}
              </button>
              <button className="event-popup-btn option" onClick={() => handleAltarMajorChoose('HP')}>
                ❤️ {t.A_MAJOR_OPT_HP}
              </button>
              <button className="event-popup-btn option" onClick={() => handleAltarMajorChoose('SWAP')}>
                🃏 {t.A_MAJOR_OPT_SWAP}
              </button>
            </div>
          </>
        )}

        {/* 결과 표시 단계 */}
        {phase === 'RESULT' && result && (
          <>
            <div className={`event-popup-result ${result.type}`}>
              {result.text}
            </div>
            <div className="event-popup-buttons">
              <button className="event-popup-btn confirm" onClick={handleConfirm}>
                {t.CONFIRM}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
