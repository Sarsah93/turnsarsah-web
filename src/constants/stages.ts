// constants/stages.ts

export interface StageConfig {
  name: string;
  bossName: string;
  hp: number;
  atk: number;
  level: number;
  rule: string;
  accuracy?: number; // v2.3.7
}

export interface ChapterConfig {
  name: string;
  stages: Record<number, StageConfig>;
}

export const CHAPTERS: Record<string, ChapterConfig> = {
  '1': {
    name: 'CHAPTER 1',
    stages: {
      1: { name: 'STAGE 1', bossName: 'Goblin', hp: 150, atk: 10, level: 1, rule: 'BLEED_PROB', accuracy: 1.0 },
      2: { name: 'STAGE 2', bossName: 'Goblin Skirmisher', hp: 200, atk: 15, level: 2, rule: 'BAN_RANK', accuracy: 1.0 },
      3: { name: 'STAGE 3', bossName: 'Goblin Rider', hp: 250, atk: 20, level: 3, rule: 'BLIND', accuracy: 1.0 },
      4: { name: 'STAGE 4', bossName: 'Hobgoblin', hp: 250, atk: 20, level: 4, rule: 'BAN_SUIT', accuracy: 1.0 },
      5: { name: 'STAGE 5', bossName: 'Goblin Shaman', hp: 300, atk: 10, level: 5, rule: 'POISON_PROB', accuracy: 1.0 },
      6: { name: 'STAGE 6', bossName: 'Golden Goblin', hp: 350, atk: 5, level: 6, rule: 'BAN_HAND', accuracy: 1.0 },
      7: { name: 'STAGE 7', bossName: 'Elite Goblin', hp: 300, atk: 15, level: 7, rule: 'ATK_UP', accuracy: 1.0 },
      8: { name: 'STAGE 8', bossName: 'Troll', hp: 350, atk: 40, level: 8, rule: 'SKIP_TURN_REGEN', accuracy: 1.0 },
      9: { name: 'STAGE 9', bossName: 'Giant Goblin', hp: 350, atk: 5, level: 9, rule: 'ATK_DOUBLE_EACH_TURN', accuracy: 1.0 },
      10: { name: 'STAGE 10', bossName: 'Goblin Lord', hp: 400, atk: 15, level: 10, rule: 'BOSS_ULTRA_RANDOM', accuracy: 1.0 },
    }
  },
  '2A': {
    name: 'CHAPTER 2 (DESERT)',
    stages: {
      1: { name: 'STAGE 1', bossName: 'MUMMY', hp: 180, atk: 15, level: 11, rule: 'REVIVE_50%_STRAIGHT_FLUSH_DMG_0', accuracy: 1.0 },
      2: { name: 'STAGE 2', bossName: 'SAND SNAKE', hp: 200, atk: 20, level: 12, rule: 'ONE_PAIR_DMG_0', accuracy: 1.0 },
      3: { name: 'STAGE 3', bossName: 'CHIMERA SNAKE HUMAN', hp: 200, atk: 20, level: 13, rule: 'TWO_PAIR_DMG_0', accuracy: 1.0 },
      4: { name: 'STAGE 4', bossName: 'SAND NIDDLE LIZARD', hp: 250, atk: 20, level: 14, rule: 'UNDER_30_POINTS_NO_DMG', accuracy: 1.0 },
      5: { name: 'STAGE 5', bossName: 'SAND SCORPION', hp: 250, atk: 15, level: 15, rule: 'FORCE_SWAP_2_NEUROTOXIC', accuracy: 1.0 },
      6: { name: 'STAGE 6', bossName: 'DESERT VULTURES', hp: 200, atk: 15, level: 16, rule: 'TRIPLE_DMG_0_TRIPLE_ATTACK', accuracy: 1.0 },
      7: { name: 'STAGE 7', bossName: 'SAND GOLEM', hp: 320, atk: 35, level: 17, rule: 'FULL_HOUSE_DMG_0_PARALYZE_40%', accuracy: 1.0 },
      8: { name: 'STAGE 8', bossName: 'SAND WYVERN', hp: 300, atk: 20, level: 18, rule: 'STRAIGHT_DMG_0_BLIND_1_BAN_1', accuracy: 1.0 },
      9: { name: 'STAGE 9', bossName: 'SAND DEATHWARM', hp: 340, atk: 20, level: 19, rule: 'FLUSH_DMG_0_BLIND_3', accuracy: 1.0 },
      10: { name: 'STAGE 10', bossName: 'SPHINX', hp: 300, atk: 40, level: 20, rule: 'PUZZLE_DMG+50%_BLIND_1_AWAKEN', accuracy: 1.0 },
    }
  },
  '2B': {
    name: 'CHAPTER 2 (DEEP FOREST)',
    stages: {
      1: { name: 'STAGE 1', bossName: 'ORC', hp: 180, atk: 18, level: 11, rule: 'DEEP_FOREST_NONE', accuracy: 0.65 },
      2: { name: 'STAGE 2', bossName: 'ORC SAVAGE', hp: 220, atk: 22, level: 12, rule: 'ORC_SAVAGE_RULE', accuracy: 0.70 },
      3: { name: 'STAGE 3', bossName: 'HALF ORC', hp: 240, atk: 20, level: 13, rule: 'HALF_ORC_RULE', accuracy: 1.0 },
      4: { name: 'STAGE 4', bossName: 'ORC WARRIOR', hp: 260, atk: 25, level: 14, rule: 'ORC_WARRIOR_RULE', accuracy: 0.65 },
      5: { name: 'STAGE 5', bossName: 'ORC CHIEFTAIN', hp: 280, atk: 23, level: 15, rule: 'ORC_CHIEFTAIN_RULE', accuracy: 0.75 },
      6: { name: 'STAGE 6', bossName: 'HIGH ORC', hp: 280, atk: 20, level: 16, rule: 'HIGH_ORC_RULE', accuracy: 0.80 },
      7: { name: 'STAGE 7', bossName: 'HIGH ORC WARRIOR', hp: 330, atk: 35, level: 17, rule: 'HIGH_ORC_WARRIOR_RULE', accuracy: 0.75 },
      8: { name: 'STAGE 8', bossName: 'HIGH ORC ASSASSIN', hp: 300, atk: 30, level: 18, rule: 'HIGH_ORC_ASSASSIN_RULE', accuracy: 0.80 },
      9: { name: 'STAGE 9', bossName: 'HIGH ORC CHIEFTAIN', hp: 350, atk: 35, level: 19, rule: 'HIGH_ORC_CHIEFTAIN_RULE', accuracy: 0.85 },
      10: { name: 'STAGE 10', bossName: 'HIGH ORC LORD', hp: 400, atk: 30, level: 20, rule: 'HIGH_ORC_LORD_RULE', accuracy: 0.95 },
    }
  }
};
