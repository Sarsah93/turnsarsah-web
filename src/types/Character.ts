// types/Character.ts

export interface Condition {
  duration: number;
  elapsed: number;
  desc: string;
  data?: unknown;
  type?: string;
}

export interface Character {
  name: string;
  maxHp: number;
  hp: number;
  atk: number;
  level: number;
  conditions: Map<string, Condition>;

  // v2.0.0.4 additions
  baseMaxHp?: number; // Original MaxHP before stage modifications
  drawsRemaining?: number; // For player card swaps
  activeRules?: [string, unknown][]; // For bot stage rules
  animState?: 'NONE' | 'ATTACK' | 'HIT'; // Player only uses HIT/NONE now, Bot uses all.
  accuracy?: number; // 0.0 to 1.0 (v2.3.7)
}

export interface CharacterJSON {
  name: string;
  maxHp: number;
  hp: number;
  atk: number;
  level: number;
  conditions: Record<string, Condition>;
  baseMaxHp?: number;
  drawsRemaining?: number;
  activeRules?: [string, unknown][];
  accuracy?: number;
}

export class CharacterFactory {
  static create(name: string, maxHp: number, atk: number, level = 1, accuracy = 1.0): Character {
    return {
      name,
      maxHp,
      hp: maxHp,
      atk,
      level,
      conditions: new Map(),
      baseMaxHp: maxHp,
      drawsRemaining: 2,
      activeRules: [],
      accuracy,
    };
  }

  static toJSON(char: Character): CharacterJSON {
    const conditionsObj: Record<string, Condition> = {};
    char.conditions.forEach((value, key) => {
      conditionsObj[key] = value;
    });
    return {
      name: char.name,
      maxHp: char.maxHp,
      hp: char.hp,
      atk: char.atk,
      level: char.level,
      conditions: conditionsObj,
      baseMaxHp: char.baseMaxHp,
      drawsRemaining: char.drawsRemaining,
      activeRules: char.activeRules,
    };
  }

  static fromJSON(data: CharacterJSON): Character {
    const conditions = new Map<string, Condition>();
    Object.entries(data.conditions).forEach(([key, value]) => {
      conditions.set(key, value);
    });
    return {
      name: data.name,
      maxHp: data.maxHp,
      hp: data.hp,
      atk: data.atk,
      level: data.level,
      conditions,
      baseMaxHp: data.baseMaxHp,
      drawsRemaining: data.drawsRemaining,
      activeRules: data.activeRules,
    };
  }
}
