import { obfuscateData, deobfuscateData } from './encryption';
import { ALTAR_SKILLS } from '../constants/altarSystem';
import { Difficulty } from '../constants/gameConfig';

const ALTAR_STORAGE_KEY = 'turnsarsah_altar_data';

export interface DifficultyAltarData {
    ownedTrophies: string[];
    unlockedSkills: string[];
    equippedSkills: string[];
}

// Per-difficulty slot
export interface AltarData {
    normal: DifficultyAltarData;
    hard: DifficultyAltarData;
    hell: DifficultyAltarData;
}

const emptySlot = (): DifficultyAltarData => ({
    ownedTrophies: [],
    unlockedSkills: [],
    equippedSkills: [],
});

const DEFAULT_ALTAR_DATA: AltarData = {
    normal: emptySlot(),
    hard: emptySlot(),
    hell: emptySlot(),
};

/** Map Difficulty enum to altar data key */
function diffKey(difficulty: Difficulty): keyof AltarData {
    if (difficulty === Difficulty.HARD) return 'hard';
    if (difficulty === Difficulty.HELL) return 'hell';
    return 'normal'; // EASY falls back to normal slot (but trophies are never added for EASY)
}

export class AltarManager {
    // Pending trophies for the current session — keyed by difficulty
    private static pendingTrophies: Partial<Record<keyof AltarData, string[]>> = {};

    // ── Storage helpers ──────────────────────────────────────────────────────

    static getAltarData(): AltarData {
        try {
            const raw = localStorage.getItem(ALTAR_STORAGE_KEY);
            if (!raw) return { ...DEFAULT_ALTAR_DATA, normal: emptySlot(), hard: emptySlot(), hell: emptySlot() };
            const decoded = deobfuscateData(raw);
            if (!decoded) return { ...DEFAULT_ALTAR_DATA, normal: emptySlot(), hard: emptySlot(), hell: emptySlot() };
            const parsed = JSON.parse(decoded);
            // Backward-compat: if old flat structure (has ownedTrophies at root), migrate to normal
            if (Array.isArray(parsed.ownedTrophies)) {
                return {
                    normal: {
                        ownedTrophies: parsed.ownedTrophies || [],
                        unlockedSkills: parsed.unlockedSkills || [],
                        equippedSkills: parsed.equippedSkills || [],
                    },
                    hard: emptySlot(),
                    hell: emptySlot(),
                };
            }
            return {
                normal: { ...emptySlot(), ...(parsed.normal || {}) },
                hard: { ...emptySlot(), ...(parsed.hard || {}) },
                hell: { ...emptySlot(), ...(parsed.hell || {}) },
            };
        } catch (e) {
            console.error('Failed to get Altar data:', e);
            return { normal: emptySlot(), hard: emptySlot(), hell: emptySlot() };
        }
    }

    static saveAltarData(data: AltarData): void {
        try {
            const serialized = JSON.stringify(data);
            const encoded = obfuscateData(serialized);
            localStorage.setItem(ALTAR_STORAGE_KEY, encoded);
        } catch (e) {
            console.error('Failed to save Altar data:', e);
        }
    }

    /** Convenience getter for a single difficulty slot */
    static getSlot(difficulty: Difficulty): DifficultyAltarData {
        return this.getAltarData()[diffKey(difficulty)];
    }

    // ── Trophy management ─────────────────────────────────────────────────────

    static addTrophy(trophyId: string, difficulty: Difficulty): boolean {
        if (difficulty === Difficulty.EASY) return false; // No trophies on Easy
        const data = this.getAltarData();
        const key = diffKey(difficulty);
        if (data[key].ownedTrophies.includes(trophyId)) return false;
        data[key].ownedTrophies.push(trophyId);
        this.saveAltarData(data);
        return true;
    }

    static stageTrophy(trophyId: string, difficulty: Difficulty): boolean {
        if (difficulty === Difficulty.EASY) return false;
        const data = this.getAltarData();
        const key = diffKey(difficulty);
        if (data[key].ownedTrophies.includes(trophyId)) return false;
        const pending = this.pendingTrophies[key] || [];
        if (pending.includes(trophyId)) return false;
        this.pendingTrophies[key] = [...pending, trophyId];
        return true;
    }

    static commitPendingTrophies(): void {
        const data = this.getAltarData();
        let changed = false;
        for (const k of ['normal', 'hard', 'hell'] as (keyof AltarData)[]) {
            const pending = this.pendingTrophies[k] || [];
            pending.forEach(id => {
                if (!data[k].ownedTrophies.includes(id)) {
                    data[k].ownedTrophies.push(id);
                    changed = true;
                }
            });
        }
        if (changed) this.saveAltarData(data);
        this.pendingTrophies = {};
    }

    static clearPendingTrophies(): void {
        this.pendingTrophies = {};
    }

    static getPendingTrophies(difficulty?: Difficulty): string[] {
        if (difficulty !== undefined) {
            return [...(this.pendingTrophies[diffKey(difficulty)] || [])];
        }
        // Return flat list of all pending (legacy compat)
        return Object.values(this.pendingTrophies).flat();
    }

    static setPendingTrophies(trophiesOrPending: Partial<Record<keyof AltarData, string[]>> | string[], difficulty?: Difficulty): void {
        if (difficulty !== undefined && Array.isArray(trophiesOrPending)) {
            this.pendingTrophies[diffKey(difficulty)] = [...trophiesOrPending];
        } else if (Array.isArray(trophiesOrPending)) {
            this.pendingTrophies = { normal: trophiesOrPending };
        } else {
            this.pendingTrophies = trophiesOrPending as Partial<Record<keyof AltarData, string[]>>;
        }
    }

    static hasTrophy(trophyId: string, difficulty: Difficulty = Difficulty.NORMAL): boolean {
        return this.getSlot(difficulty).ownedTrophies.includes(trophyId);
    }

    static isTrophyAvailable(trophyId: string, difficulty: Difficulty = Difficulty.NORMAL): boolean {
        const slot = this.getSlot(difficulty);
        if (!slot.ownedTrophies.includes(trophyId)) return false;
        let usedCount = 0;
        slot.unlockedSkills.forEach(skillId => {
            const skill = ALTAR_SKILLS[skillId];
            if (skill && skill.cost.includes(trophyId)) usedCount++;
        });
        return usedCount === 0;
    }

    // ── Skill management ──────────────────────────────────────────────────────

    static canUnlockSkill(skillId: string, difficulty: Difficulty = Difficulty.NORMAL): boolean {
        const slot = this.getSlot(difficulty);
        if (slot.unlockedSkills.includes(skillId)) return false;
        const skill = ALTAR_SKILLS[skillId];
        if (!skill) return false;
        if (skill.tier > 1) {
            const requiredTier = skill.tier - 1;
            const hasPrevTier = slot.unlockedSkills.some(id => {
                const s = ALTAR_SKILLS[id];
                return s && s.tier === requiredTier;
            });
            if (!hasPrevTier) return false;
        }
        return skill.cost.every(tid => this.isTrophyAvailable(tid, difficulty));
    }

    static unlockSkill(skillId: string, difficulty: Difficulty = Difficulty.NORMAL): boolean {
        const data = this.getAltarData();
        const key = diffKey(difficulty);
        if (data[key].unlockedSkills.includes(skillId)) return false;
        const skill = ALTAR_SKILLS[skillId];
        if (!skill) return false;
        const canAfford = skill.cost.every(tid => this.isTrophyAvailable(tid, difficulty));
        if (!canAfford) return false;
        data[key].unlockedSkills.push(skillId);
        this.saveAltarData(data);
        return true;
    }

    static returnSkill(skillId: string, difficulty: Difficulty = Difficulty.NORMAL): void {
        const data = this.getAltarData();
        const key = diffKey(difficulty);
        if (!data[key].unlockedSkills.includes(skillId)) return;

        data[key].equippedSkills = data[key].equippedSkills.filter(id => id !== skillId);

        const skillToReturn = ALTAR_SKILLS[skillId];
        if (!skillToReturn) return;

        let targetUnlocks = [...data[key].unlockedSkills].filter(id => id !== skillId);

        // Cascade: remove higher-tier skills that become invalid
        let tierValid = true;
        do {
            tierValid = true;
            const activeByTier: Record<number, number> = {};
            targetUnlocks.forEach(id => {
                const s = ALTAR_SKILLS[id];
                if (s) activeByTier[s.tier] = (activeByTier[s.tier] || 0) + 1;
            });
            for (let i = 0; i < targetUnlocks.length; i++) {
                const s = ALTAR_SKILLS[targetUnlocks[i]];
                if (!s) continue;
                if (s.tier > 1) {
                    const req = s.tier - 1;
                    if (!activeByTier[req] || activeByTier[req] === 0) {
                        data[key].equippedSkills = data[key].equippedSkills.filter(id => id !== s.id);
                        targetUnlocks = targetUnlocks.filter(id => id !== s.id);
                        tierValid = false;
                        break;
                    }
                }
            }
        } while (!tierValid);

        data[key].unlockedSkills = targetUnlocks;
        this.saveAltarData(data);
    }

    static saveEquippedSkills(skills: string[], difficulty: Difficulty = Difficulty.NORMAL): void {
        const data = this.getAltarData();
        data[diffKey(difficulty)].equippedSkills = [...skills];
        this.saveAltarData(data);
    }
}
