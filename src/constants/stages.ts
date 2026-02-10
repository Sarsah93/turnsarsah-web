// constants/stages.ts

export interface StageConfig {
  name: string;
  bossName: string;
  hp: number;
  atk: number;
  level: number;
  rule: string;
}

export interface ChapterConfig {
  name: string;
  stages: Record<number, StageConfig>;
}

export const CHAPTERS: Record<number, ChapterConfig> = {
  1: {
    name: 'CHAPTER 1',
    stages: {
      1: { name: 'STAGE 1', bossName: 'Goblin', hp: 150, atk: 10, level: 1, rule: 'BLEED_PROB' },
      2: { name: 'STAGE 2', bossName: 'Goblin Skirmisher', hp: 200, atk: 15, level: 2, rule: 'BAN_RANK' }, // SWAPPED
      3: { name: 'STAGE 3', bossName: 'Goblin Rider', hp: 250, atk: 20, level: 3, rule: 'BLIND' }, // SWAPPED
      4: { name: 'STAGE 4', bossName: 'Hobgoblin', hp: 250, atk: 20, level: 4, rule: 'BAN_SUIT' },
      5: { name: 'STAGE 5', bossName: 'Goblin Shaman', hp: 300, atk: 10, level: 5, rule: 'POISON_PROB' },
      6: { name: 'STAGE 6', bossName: 'Golden Goblin', hp: 350, atk: 5, level: 6, rule: 'BAN_HAND' },
      7: { name: 'STAGE 7', bossName: 'Elite Goblin', hp: 300, atk: 15, level: 7, rule: 'ATK_UP' },
      8: { name: 'STAGE 8', bossName: 'Troll', hp: 350, atk: 40, level: 8, rule: 'SKIP_TURN_REGEN' },
      9: { name: 'STAGE 9', bossName: 'Giant Goblin', hp: 350, atk: 5, level: 9, rule: 'ATK_DOUBLE_EACH_TURN' },
      10: { name: 'STAGE 10', bossName: 'Goblin Lord', hp: 400, atk: 15, level: 10, rule: 'BOSS_ULTRA_RANDOM' },
    }
  }
};
