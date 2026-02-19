// logic/turnEngine.ts

import { Character } from '../types/Character';
import { Card } from '../types/Card';
import {
  calculatePlayerDamage,
  calculateBotDamage,
  applyDamage,
} from './damageCalculation';
import {
  processConditionsEndTurn,
  applyCondition,
  ConditionEffect,
} from './conditions';

export enum TurnPhase {
  READY = 'READY',
  PROCESSING = 'PROCESSING',
  FINISHED = 'FINISHED',
}

export interface GameAction {
  type: string;
  timer: number;
  data?: any;
}

export class TurnEngine {
  private player: Character;
  private bot: Character;
  private stageNum: number;
  private chapterNum: string;
  private turnCount: number = 0;

  constructor(player: Character, bot: Character, stageNum: number = 1, chapterNum: string = '1') {
    this.player = player;
    this.bot = bot;
    this.stageNum = stageNum;
    this.chapterNum = chapterNum;
  }

  public setStageNum(stage: number) {
    this.stageNum = stage;
  }

  public setChapterNum(chapter: string) {
    this.chapterNum = chapter;
  }

  /**
   * 플레이어 공격 실행 (v2.0.0.5)
   */
  public executePlayerAttack(selectedCards: Card[]): GameAction[] {
    const actions: GameAction[] = [];
    const isDebilitated = this.player.conditions.has('Debilitating');
    const damageResult = calculatePlayerDamage(selectedCards, isDebilitated);

    // 1. 공격 애니메이션 시퀀스 (이미 CardHand에서 시각적 애니메이션을 수행하므로, 여기선 로직 이벤트만 예약)
    // 하지만 Game.tsx의 processTurnActions에서 IMPACT를 처리하므로 IMPACT 액션 추가
    actions.push({
      type: 'IMPACT',
      timer: 0,
      data: {
        damage: damageResult.finalDamage,
        isCritical: damageResult.isCritical,
        handType: damageResult.handType
      }
    });

    return actions;
  }

  /**
   * 실제 플레이어 공격 적용
   * v2.0.0.5: Stage-based permanent damage reduction
   */
  public applyPlayerAttack(damage: number): ConditionEffect[] {
    const effects: ConditionEffect[] = [];

    // Permanent Damage Reduction Logic (Stages 7-10)
    let finalDamage = damage;
    if (this.stageNum === 7) {
      finalDamage = Math.floor(damage * 0.9); // -10%
    } else if (this.stageNum === 8 || this.stageNum === 9) {
      finalDamage = Math.floor(damage * 0.8); // -20%
    } else if (this.stageNum === 10) {
      finalDamage = Math.floor(damage * 0.7); // -30%
    }

    const newBotHp = applyDamage(this.bot.hp, finalDamage);
    this.bot.hp = newBotHp;
    effects.push({ type: 'DAMAGE', amount: finalDamage });

    return effects;
  }

  private currentStage10Rule: string = 'NONE';
  private stage10BaseAtk: number = 15;

  /**
   * 보스 공격 실행 (v2.0.0.5 Stage Rules)
   */
  public executeBotAttack(): GameAction[] {
    const actions: GameAction[] = [];
    this.turnCount++;

    // Stage 10: Pick random rule every turn (v2.0.0.5)
    if (this.stageNum === 10) {
      const activeRules = ['BLEED_PROB_60', 'BLIND', 'BAN_RANK', 'NONE', 'POISON_PROB_40', 'PARA_PROB_20', 'ATK_DOUBLE_EACH_TURN'];
      const pick = activeRules[Math.floor(Math.random() * activeRules.length)];
      this.currentStage10Rule = pick;

      // Reset ATK for scaling rules (v2.0.0.5)
      this.bot.atk = this.stage10BaseAtk;
      if (pick === 'ATK_DOUBLE_EACH_TURN') {
        this.bot.atk = this.stage10BaseAtk * 2;
      }

      actions.push({ type: 'MESSAGE', timer: 1, data: { text: `BOSS RULE: ${pick}` } });
    }

    // Stage 8 Rule: Attacks Every 2 Turns
    if (this.stageNum === 8 && this.turnCount % 2 !== 0) {
      actions.push({ type: 'MESSAGE', timer: 1, data: { text: 'BOSS SKIPPED ATTACKING.' } });
      return actions;
    }

    // Stage 9 Rule: ATK doubles each turn
    if (this.stageNum === 9 && this.turnCount > 1) {
      this.bot.atk *= 2;
    }

    const damage = calculateBotDamage(this.bot.atk);

    actions.push({
      type: 'BOT_HIT',
      timer: 30,
      data: { damage }
    });

    return actions;
  }

  /**
   * 보스 공격 적용 (with conditions)
   */
  public applyBotAttack(damage: number): ConditionEffect[] {
    const effects: ConditionEffect[] = [];

    // v2.0.0.5: Avoiding (5% prob)
    if (this.player.conditions.has('Avoiding') && Math.random() < 0.05) {
      effects.push({ type: 'AVOIDED', amount: 0 });
      return effects;
    }

    // v2.0.0.5: Paralyzing (Paralyzed players don't attack, handled in Game.tsx)

    const newPlayerHp = applyDamage(this.player.hp, damage);
    this.player.hp = newPlayerHp;
    effects.push({ type: 'DAMAGE', amount: damage });

    // v2.0.0.5: Stage specific condition application
    this.applyStageMechanics(effects);

    return effects;
  }

  private applyStageMechanics(effects: ConditionEffect[]) {
    const rand = Math.random();

    // Helper for applying conditions with stacking rules
    const tryApply = (name: string, duration: number, damage?: number) => {
      const pCond = this.player.conditions;

      // 1. Bleeding -> Heavy Bleeding
      if (name === 'Bleeding') {
        if (pCond.has('Heavy Bleeding')) return false; // Heavy Bleed prevents Bleed
        if (pCond.has('Bleeding')) {
          pCond.delete('Bleeding');
          pCond.set('Heavy Bleeding', { type: 'HEAVY_BLEED', duration: 4, elapsed: 0, desc: 'Heavy Bleeding', data: 25 }); // 25 dmg
          effects.push({ type: 'CONDITION_APPLIED', amount: 0, data: 'Heavy Bleeding' } as any);
          return true;
        }
      }

      // 2. Poisoning -> Frailty
      if (name === 'Poisoning') {
        if (pCond.has('Frailty')) {
          // Frailty exists -> Allow Poison but NO stacking to new Frailty
        } else if (pCond.has('Poisoning')) {
          pCond.delete('Poisoning');
          pCond.set('Frailty', { type: 'FRAILTY', duration: 6, elapsed: 0, desc: 'Frailty', data: 25 }); // -25% Max HP

          // Apply Max HP reduction immediately
          if (!this.player.baseMaxHp) this.player.baseMaxHp = this.player.maxHp; // Save base if not present
          this.player.maxHp = Math.floor(this.player.baseMaxHp * 0.75);
          this.player.hp = Math.min(this.player.hp, this.player.maxHp);

          effects.push({ type: 'CONDITION_APPLIED', amount: 0, data: 'Frailty' } as any);
          return true;
        }
      }

      // General Application
      if (applyCondition(pCond, name, duration, undefined, damage)) {
        effects.push({ type: 'CONDITION_APPLIED', amount: 0, data: name } as any);
        return true;
      }
      return false;
    };

    // Stage 1: Bleed 60%
    if (this.stageNum === 1 && rand < 0.6) {
      tryApply('Bleeding', 4, 10);
    }

    // Stage 5: Poison 40%
    if (this.stageNum === 5 && rand < 0.4) {
      tryApply('Poisoning', 6, 5);
    }

    // Stage 7: Paralyze 20%
    if (this.stageNum === 7 && rand < 0.2) {
      if (applyCondition(this.player.conditions, 'Paralyzing', 3)) {
        effects.push({ type: 'PARALYZED', amount: 0 });
      }
    }

    // Stage 10 Rule Handling
    if (this.stageNum === 10) {
      if (this.currentStage10Rule === 'BLEED_PROB_60' && rand < 0.6) tryApply('Bleeding', 4, 10);
      if (this.currentStage10Rule === 'POISON_PROB_40' && rand < 0.4) tryApply('Poisoning', 6, 5);
      if (this.currentStage10Rule === 'PARA_PROB_20' && rand < 0.2) {
        if (applyCondition(this.player.conditions, 'Paralyzing', 3)) effects.push({ type: 'PARALYZED', amount: 0 });
      }
    }
  }

  /**
   * 턴 종료 처리 (v2.0.0.5 DoT, Regen, Scaling)
   */
  public processEndTurn(): ConditionEffect[] {
    const effects: ConditionEffect[] = [];

    // 1. Process Condition Effects (Bleed, Poison, Regen)
    const playerEffects = processConditionsEndTurn(this.player.conditions);
    playerEffects.forEach(eff => {
      if (eff.type === 'HEAL') {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + eff.amount);
      } else {
        this.player.hp = Math.max(0, this.player.hp - eff.amount);
      }
    });
    effects.push(...playerEffects);

    const botEffects = processConditionsEndTurn(this.bot.conditions);
    botEffects.forEach(eff => {
      if (eff.type === 'HEAL') {
        this.bot.hp = Math.min(this.bot.maxHp, this.bot.hp + eff.amount);
      } else {
        this.bot.hp = Math.max(0, this.bot.hp - eff.amount);
      }
    });

    // 2. Stage-specific end turn logic (Chapter 1 Only Legacy)
    if (this.chapterNum === '1') {
      // Stage 6 & 8 & 10: Regeneration
      if (this.stageNum === 6 && this.bot.hp <= this.bot.maxHp * 0.5) {
        this.bot.hp = Math.min(this.bot.maxHp, this.bot.hp + 10);
        effects.push({ type: 'HEAL', amount: 10 }); // Marker for bot heal
      }
      if (this.stageNum === 8 || this.stageNum === 10) {
        // Regeneration every turn (v2.0.0.5 Stage 8/10)
        this.bot.hp = Math.min(this.bot.maxHp, this.bot.hp + 10);
        effects.push({ type: 'HEAL', amount: 10 });
      }

      // Stage 9: Double ATK each turn
      if (this.stageNum === 9) {
        this.bot.atk *= 2;
      }
    }

    // Stage 10: Special ATK logic
    // ...

    return effects;
  }

  public processBleedTicks(): ConditionEffect[] {
    // Bleed ticks are handled in processEndTurn for v2.0.0.5 sequencing.
    // Return empty to maintain compatibility with Game.tsx logic for now.
    return [];
  }

  public checkGameStatus(): 'ONGOING' | 'PLAYER_WIN' | 'PLAYER_LOSE' {
    if (this.bot.hp <= 0) return 'PLAYER_WIN';
    if (this.player.hp <= 0) return 'PLAYER_LOSE';
    return 'ONGOING';
  }

  public getPlayer() { return this.player; }
  public setPlayer(player: Character) { this.player = player; }
  public getBot() { return this.bot; }
  public setBot(bot: Character) { this.bot = bot; }
}
