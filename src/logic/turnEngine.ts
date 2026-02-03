// logic/turnEngine.ts

import { Character } from '../types/Character';
import { Card } from '../types/Card';
import {
  calculatePlayerDamage,
  calculateBotDamage,
  applyDamage,
  applyHealing,
  applyDamageModifiers,
  DamageCalculationResult,
} from './damageCalculation';
import {
  processConditionsStartTurn,
  processConditionsEndTurn,
  processBleedTick,
  ConditionEffect,
} from './conditions';

/**
 * 턴 진행 상태
 */
export enum TurnPhase {
  READY = 'READY',
  PLAYER_ATTACK = 'PLAYER_ATTACK',
  PLAYER_HIT = 'PLAYER_HIT',
  BOT_ATTACK = 'BOT_ATTACK',
  BOT_HIT = 'BOT_HIT',
  CONDITIONS_PROCESS = 'CONDITIONS_PROCESS',
  TURN_CLEANUP = 'TURN_CLEANUP',
  FINISHED = 'FINISHED',
}

/**
 * 게임 액션 (Pygame의 action_queue 역할)
 */
export interface GameAction {
  type: string;
  timer: number;
  data?: unknown;
}

/**
 * 턴 진행 엔진
 */
export class TurnEngine {
  private currentPhase: TurnPhase = TurnPhase.READY;
  private actionQueue: GameAction[] = [];
  private player: Character;
  private bot: Character;

  constructor(player: Character, bot: Character) {
    this.player = player;
    this.bot = bot;
  }

  /**
   * 플레이어 공격 시작
   */
  public executePlayerAttack(selectedCards: Card[]): GameAction[] {
    if (!selectedCards || selectedCards.length === 0) {
      return [];
    }

    const damageResult = calculatePlayerDamage(selectedCards, this.player.conditions.has('Debilitating'));

    // 액션 큐 생성 (Pygame과 유사)
    const actions: GameAction[] = [];

    // 1. 카드 모으기 애니메이션
    actions.push({
      type: 'GATHER',
      timer: 30,
      data: {
        cards: selectedCards,
        targetX: 640,
        targetY: 500,
      },
    });

    // 2. 풀백 (휨백) - 카드를 아래로
    actions.push({
      type: 'WINDBACK',
      timer: 20,
      data: {
        targetY: 540,
      },
    });

    // 3. 비행 - 보스를 향해 날아감
    actions.push({
      type: 'FLY',
      timer: 25,
      data: {
        targetX: 640,
        targetY: 200,
      },
    });

    // 3.5. 이펙트 블록: 타격 이펙트(애니메이션/sfx)
    actions.push({
      type: 'ANIMATION',
      timer: 0,
      data: {
        name: 'player_impact_vfx',
        duration: 400, // ms
      },
    });

    // 4. 충격 - 데미지 적용
    actions.push({
      type: 'IMPACT',
      timer: 30,
      data: {
        damage: damageResult.finalDamage,
        handType: damageResult.handType,
        isCritical: damageResult.isCritical,
      },
    });

    // 5. 지연
    actions.push({
      type: 'DELAY',
      timer: 40,
    });

    // 6. 보스 턴 준비
    actions.push({
      type: 'BOT_READY',
      timer: 1,
    });

    return actions;
  }

  /**
   * 실제 플레이어 공격 적용
   */
  public applyPlayerAttack(damageResult: DamageCalculationResult): ConditionEffect[] {
    const effects: ConditionEffect[] = [];

    // 보스가 받을 데미지 계산
    let damage = damageResult.finalDamage;

    // 보스 조건 적용
    if (this.bot.conditions.has('Immune')) {
      damage = 0;
    } else if (this.bot.conditions.has('Damage Reducing')) {
      const reducingPercent = (this.bot.conditions.get('Damage Reducing')?.data as number) || 0;
      damage = applyDamageModifiers(damage, reducingPercent, false);
    }

    // 데미지 적용
    const newBotHp = applyDamage(this.bot.hp, damage);
    this.bot.hp = newBotHp;

    effects.push({
      type: 'DAMAGE',
      amount: damage,
    });

    return effects;
  }

  /**
   * 보스 공격 시작
   */
  public executeBotAttack(): GameAction[] {
    const damage = calculateBotDamage(this.bot.atk);

    const actions: GameAction[] = [];

    actions.push({
      type: 'BOT_ATTACK',
      timer: 30,
      data: { damage },
    });

    // 작은 애니메이션 블록: 보스 공격 이펙트
    actions.push({
      type: 'ANIMATION',
      timer: 0,
      data: { name: 'bot_attack_vfx', duration: 350 },
    });

    actions.push({
      type: 'PLAYER_HIT',
      timer: 45,
      data: { damage },
    });

    // 출혈 틱 처리
    actions.push({
      type: 'BLEED_TICK',
      timer: 1,
    });

    // 턴 정리
    actions.push({
      type: 'TURN_CLEANUP',
      timer: 30,
    });

    return actions;
  }

  /**
   * 실제 보스 공격 적용
   */
  public applyBotAttack(damage: number): ConditionEffect[] {
    const effects: ConditionEffect[] = [];

    // 플레이어가 받을 데미지 계산
    if (this.player.conditions.has('Immune')) {
      damage = 0;
    } else if (this.player.conditions.has('Damage Reducing')) {
      const reducingPercent = (this.player.conditions.get('Damage Reducing')?.data as number) || 0;
      damage = applyDamageModifiers(damage, reducingPercent, false);
    }

    // 회피 (Avoiding) 체크 (5%)
    if (this.player.conditions.has('Avoiding') && Math.random() < 0.05) {
      effects.push({ type: 'AVOIDED', amount: 0 });
      return effects;
    }

    // 데미지 적용
    const newPlayerHp = applyDamage(this.player.hp, damage);
    this.player.hp = newPlayerHp;

    effects.push({
      type: 'DAMAGE',
      amount: damage,
    });

    return effects;
  }

  /**
   * 턴 시작 시 조건 처리 (회복 등)
   */
  public processStartTurn(): ConditionEffect[] {
    const effects: ConditionEffect[] = [];

    // 플레이어 재생
    if (this.player.conditions.has('Regenerating')) {
      const healAmount = Math.floor(this.player.maxHp * 0.05);
      this.player.hp = applyHealing(this.player.hp, this.player.maxHp, healAmount);
      effects.push({ type: 'HEAL', amount: healAmount });
    }

    // 보스 재생
    if (this.bot.conditions.has('Regenerating')) {
      const healAmount = Math.floor(this.bot.maxHp * 0.05);
      this.bot.hp = applyHealing(this.bot.hp, this.bot.maxHp, healAmount);
      effects.push({ type: 'HEAL', amount: healAmount });
    }

    return effects;
  }

  /**
   * 턴 종료 시 조건 처리 (DoT 등) 및 업데이트
   */
  public processEndTurn(): ConditionEffect[] {
    const effects: ConditionEffect[] = [];

    // 플레이어 조건
    const playerEffects = processConditionsEndTurn(this.player.conditions);
    playerEffects.forEach((eff) => {
      if (eff.type === 'POISON') {
        this.player.hp = applyDamage(this.player.hp, eff.amount);
      } else if (eff.type === 'BLEED') {
        this.player.hp = applyDamage(this.player.hp, eff.amount);
      } else if (eff.type === 'HEAVY_BLEED') {
        this.player.hp = applyDamage(this.player.hp, eff.amount);
      }
    });
    effects.push(...playerEffects);

    // 보스 조건
    const botEffects = processConditionsEndTurn(this.bot.conditions);
    botEffects.forEach((eff) => {
      if (eff.type === 'POISON') {
        this.bot.hp = applyDamage(this.bot.hp, eff.amount);
      } else if (eff.type === 'BLEED') {
        this.bot.hp = applyDamage(this.bot.hp, eff.amount);
      } else if (eff.type === 'HEAVY_BLEED') {
        this.bot.hp = applyDamage(this.bot.hp, eff.amount);
      }
    });
    effects.push(...botEffects);

    // 최종 HP 하한선 (0)
    this.player.hp = Math.max(0, this.player.hp);
    this.bot.hp = Math.max(0, this.bot.hp);

    return effects;
  }

  /**
   * 출혈 틱 (특수 처리)
   */
  public processBleedTicks(): ConditionEffect[] {
    const effects: ConditionEffect[] = [];

    // 플레이어 출혈
    const playerBleedEffects = processBleedTick(this.player.conditions);
    playerBleedEffects.forEach((eff) => {
      this.player.hp = applyDamage(this.player.hp, eff.amount);
    });
    effects.push(...playerBleedEffects);

    // 보스 출혈
    const botBleedEffects = processBleedTick(this.bot.conditions);
    botBleedEffects.forEach((eff) => {
      this.bot.hp = applyDamage(this.bot.hp, eff.amount);
    });
    effects.push(...botBleedEffects);

    return effects;
  }

  /**
   * 게임 상태 체크 (승패 판정)
   */
  public checkGameStatus(): 'ONGOING' | 'PLAYER_WIN' | 'PLAYER_LOSE' {
    if (this.bot.hp <= 0) {
      return 'PLAYER_WIN';
    }
    if (this.player.hp <= 0) {
      return 'PLAYER_LOSE';
    }
    return 'ONGOING';
  }

  // Getter/Setter
  public getPlayer(): Character {
    return this.player;
  }

  public setPlayer(player: Character): void {
    this.player = player;
  }

  public getBot(): Character {
    return this.bot;
  }

  public setBot(bot: Character): void {
    this.bot = bot;
  }

  public getPhase(): TurnPhase {
    return this.currentPhase;
  }

  public setPhase(phase: TurnPhase): void {
    this.currentPhase = phase;
  }

  public getActionQueue(): GameAction[] {
    return this.actionQueue;
  }

  public clearActionQueue(): void {
    this.actionQueue = [];
  }
}
