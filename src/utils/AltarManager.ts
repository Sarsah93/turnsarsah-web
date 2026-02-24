import { obfuscateData, deobfuscateData } from './encryption';
import { ALTAR_SKILLS } from '../constants/altarSystem';

const ALTAR_STORAGE_KEY = 'turnsarsah_altar_data';

export interface AltarData {
    ownedTrophies: string[]; // List of trophy IDs or names acquired
    unlockedSkills: string[]; // List of skill IDs unlocked in the Altar
}

const DEFAULT_ALTAR_DATA: AltarData = {
    ownedTrophies: [],
    unlockedSkills: []
};

export class AltarManager {
    // Pending trophies acquired during current game session — NOT yet saved to localStorage
    private static pendingTrophies: string[] = [];
    static getAltarData(): AltarData {
        try {
            const raw = localStorage.getItem(ALTAR_STORAGE_KEY);
            if (!raw) return { ...DEFAULT_ALTAR_DATA };
            const decoded = deobfuscateData(raw);
            if (!decoded) return { ...DEFAULT_ALTAR_DATA };
            return JSON.parse(decoded) as AltarData;
        } catch (e) {
            console.error("Failed to get Altar data:", e);
            return { ...DEFAULT_ALTAR_DATA };
        }
    }

    static saveAltarData(data: AltarData): void {
        try {
            const serialized = JSON.stringify(data);
            const encoded = obfuscateData(serialized);
            localStorage.setItem(ALTAR_STORAGE_KEY, encoded);
        } catch (e) {
            console.error("Failed to save Altar data:", e);
        }
    }

    /**
     * Adds a newly acquired trophy to permanent storage immediately.
     * Used only for cases where we know the trophy should be permanently saved.
     */
    static addTrophy(trophyId: string): boolean {
        const data = this.getAltarData();
        if (data.ownedTrophies.includes(trophyId)) {
            return false; // Already owned
        }
        data.ownedTrophies.push(trophyId);
        this.saveAltarData(data);
        return true;
    }

    /**
     * Stages a trophy for acquisition during gameplay.
     * The trophy is NOT saved to localStorage until commitPendingTrophies() is called.
     * This prevents exploit acquisition via exiting to main menu mid-game.
     */
    static stageTrophy(trophyId: string): boolean {
        const data = this.getAltarData();
        if (data.ownedTrophies.includes(trophyId)) return false; // Already permanently owned
        if (this.pendingTrophies.includes(trophyId)) return false; // Already staged
        this.pendingTrophies.push(trophyId);
        return true;
    }

    /**
     * Commits all pending trophies to permanent storage.
     * Call this when the game completes properly (all stages cleared, or after defeat screen).
     */
    static commitPendingTrophies(): void {
        if (this.pendingTrophies.length === 0) return;
        const data = this.getAltarData();
        this.pendingTrophies.forEach(id => {
            if (!data.ownedTrophies.includes(id)) {
                data.ownedTrophies.push(id);
            }
        });
        this.saveAltarData(data);
        this.pendingTrophies = [];
    }

    /**
     * Clears all pending trophies without saving.
     * Call this when the player exits to main menu mid-game (exploit prevention).
     */
    static clearPendingTrophies(): void {
        this.pendingTrophies = [];
    }

    /**
     * Returns the list of currently pending (staged but not yet committed) trophies.
     */
    static getPendingTrophies(): string[] {
        return [...this.pendingTrophies];
    }

    /**
     * Checks if a trophy is currently available for use (owned and not consumed by a skill).
     * Trophies are consumed by unlocking skills.
     */
    static hasTrophy(trophyId: string): boolean {
        const data = this.getAltarData();
        return data.ownedTrophies.includes(trophyId);
    }

    /**
     * Checks if a trophy is currently unused (owned but not spent on an unlocked skill).
     */
    static isTrophyAvailable(trophyId: string): boolean {
        const data = this.getAltarData();
        if (!data.ownedTrophies.includes(trophyId)) return false;

        // Ensure we handle duplicate trophy costs if applicable in future, 
        // currently each trophy is unique and required exactly once per specific skill.
        let usedCount = 0;
        data.unlockedSkills.forEach(skillId => {
            const skill = ALTAR_SKILLS[skillId];
            if (skill && skill.cost.includes(trophyId)) {
                usedCount++;
            }
        });

        // Since trophies are unique, if it's used > 0 it's unavailable.
        return usedCount === 0;
    }

    /**
     * Unlocks an Altar skill if all prerequisite trophies are available.
     * Only returns true if successful.
     */
    static unlockSkill(skillId: string): boolean {
        const data = this.getAltarData();
        if (data.unlockedSkills.includes(skillId)) return false; // Already unlocked

        const skill = ALTAR_SKILLS[skillId];
        if (!skill) return false;

        // Check if all required trophies are available
        const canAfford = skill.cost.every(trophyId => this.isTrophyAvailable(trophyId));
        if (!canAfford) return false;

        data.unlockedSkills.push(skillId);
        this.saveAltarData(data);
        return true;
    }

    /**
     * Returns a skill, refunding its cost.
     * Cascading: Also returns any higher-tier skills that depend on it.
     */
    static returnSkill(skillId: string): void {
        const data = this.getAltarData();
        if (!data.unlockedSkills.includes(skillId)) return;

        const skillToReturn = ALTAR_SKILLS[skillId];
        if (!skillToReturn) return;

        // Determine which skills must be returned due to cascade.
        // A simple rule: If a skill requires tier N, and we return a tier N skill,
        // we must ensure we don't invalidate higher tier skills.
        // Wait, the document states they unlock sequentially (Tier 1 -> Tier 2).
        // If we return *any* Tier N skill, does it lock ALL Tier N+1 skills?
        // Or only if we drop below the requirement? 
        // For safety, and based on the standard tree logic: if returning this skill 
        // makes a higher tier invalid (e.g., no tier N left but tier N+1 active),
        // we'd cascade. However, since the exact connection wasn't explicitly a graph,
        // but rather "Unlock Tier 2 after Tier 1", if we return the ONLY Tier 1 skill,
        // we must return all Tier 2 skills.
        // For a robust cascading approach: If we drop the count of Tier N skills to 0, 
        // we return all skills strictly > N.

        let targetUnlocks = [...data.unlockedSkills];

        // Remove the specific skill
        targetUnlocks = targetUnlocks.filter(id => id !== skillId);

        // Check tier validity
        let tierValid = true;
        do {
            tierValid = true;
            // Group current active by tier
            const activeByTier: Record<number, number> = {};
            targetUnlocks.forEach(id => {
                const s = ALTAR_SKILLS[id];
                if (s) {
                    activeByTier[s.tier] = (activeByTier[s.tier] || 0) + 1;
                }
            });

            // Find broken tiers
            for (let i = 0; i < targetUnlocks.length; i++) {
                const s = ALTAR_SKILLS[targetUnlocks[i]];
                if (!s) continue;

                // If this is tier 2 or higher, it requires at least one skill from tier - 1
                if (s.tier > 1) {
                    const requiredTier = s.tier - 1;
                    if (!activeByTier[requiredTier] || activeByTier[requiredTier] === 0) {
                        // Cascade return this skill
                        targetUnlocks = targetUnlocks.filter(id => id !== s.id);
                        tierValid = false; // Need to re-evaluate after modifying
                        break;
                    }
                }
            }
        } while (!tierValid);

        data.unlockedSkills = targetUnlocks;
        this.saveAltarData(data);
    }
}
