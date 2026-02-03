// constants/stages.ts

export interface StageConfig {
  name: string;
  bossName: string;
  hp: number;
  atk: number;
  level: number;
  rule: string;
}

export const STAGES: Record<number, StageConfig> = {
  1: { name: 'Stage 1', bossName: 'Goblin', hp: 150, atk: 10, level: 1, rule: 'BLEED_PROB_60' },
  2: { name: 'Stage 2', bossName: 'Goblin Skirmisher', hp: 200, atk: 15, level: 2, rule: 'BLIND_2' },
  3: { name: 'Stage 3', bossName: 'Goblin Rider', hp: 250, atk: 20, level: 3, rule: 'BAN_RANK_2' },
  4: { name: 'Stage 4', bossName: 'Hobgoblin', hp: 250, atk: 20, level: 4, rule: 'BAN_SUIT' },
  5: { name: 'Stage 5', bossName: 'Goblin Shaman', hp: 300, atk: 10, level: 5, rule: 'POISON_PROB_40' },
  6: { name: 'Stage 6', bossName: 'Golden Goblin', hp: 350, atk: 5, level: 6, rule: 'REGEN_UNDER_50' },
  7: { name: 'Stage 7', bossName: 'Elite Goblin', hp: 300, atk: 15, level: 7, rule: 'RAMP_PARA_20' },
  8: { name: 'Stage 8', bossName: 'Troll', hp: 350, atk: 40, level: 8, rule: 'DOUBLE_TURN_REGEN' },
  9: { name: 'Stage 9', bossName: 'Giant Goblin', hp: 350, atk: 5, level: 9, rule: 'EXP_ATK_2' },
  10: { name: 'Stage 10', bossName: 'Goblin Lord', hp: 400, atk: 15, level: 10, rule: 'BOSS_ULTRA' },
};
