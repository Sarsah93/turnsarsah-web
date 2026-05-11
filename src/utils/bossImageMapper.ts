export const getBossImage = (chapter: string, stage: number, isTutorial: boolean): string => {
    if (isTutorial) return '/assets/boss_goblin/tutorial_bot.png';
    if (chapter === '1') {
        const mapping: Record<number, string> = {
            1: '01_goblin.png',
            2: '02_goblin skirmisher.png',
            3: '03_goblin rider.png',
            4: '04_hobgoblin.png',
            5: '05_goblin shaman.png',
            6: '06_golden goblin.png',
            7: '07_elite goblin.png',
            8: '08_troll.png',
            9: '09_giant goblin.png',
            10: '10_goblin lord.png'
        };
        const filename = mapping[stage] || '01_goblin.png';
        return `/assets/boss_goblin/${filename}`;
    }
    if (chapter === '2A') {
        const mapping: Record<number, string> = {
            1: '01_mummy.png',
            2: '02_sand snake.png',
            3: '03_chimera snake human.png',
            4: '04_sand needle lizard.png',
            5: '05_sand scorpion.png',
            6: '06_desert vultures.png',
            7: '07_sand golem.png',
            8: '08_wyvern.png',
            9: '09_sand deathworm.png',
            10: '10_sphinx.png',
            11: '2A_sand dragon.png'
        };
        const filename = mapping[stage] || '01_mummy.png';
        return `/assets/boss_desert/${filename}`;
    }
    if (chapter === '2B') {
        const mapping: Record<number, string> = {
            1: '01_orc.png',
            2: '02_orc savage.png',
            3: '03_half orc.png',
            4: '04_orc warrior.png',
            5: '05_orc chieftain.png',
            6: '06_high orc.png',
            7: '07_high orc warrior.png',
            8: '08_high orc assassin.png',
            9: '09_high orc chieftain.png',
            10: '10_high orc lord.png',
            11: '2B_high orc shaman.png'
        };
        const filename = mapping[stage] || '01_orc.png';
        return `/assets/boss_orc/${filename}`;
    }
    if (chapter === '3A') {
        const mapping: Record<number, string> = {
            1: '01_SLIME.png',
            2: '02_VAMPIRE BAT.png',
            3: '03_CAVE WORM.png',
            4: '04_POISON SPIDER.png',
            5: '05_WRAITH.png',
            6: '06_CAVE BEAR.png',
            7: '07_CRYSTAL GOLEM.png',
            8: '08_DRAKE.png',
            9: '09_BASILISK.png',
            10: '10_HYDRA.png'
        };
        const filename = mapping[stage] || '01_SLIME.png';
        return `/assets/boss_cave/${filename}`;
    }
    if (chapter === '3B') {
        const mapping: Record<number, string> = {
            1: '01_ALLIGATOR SNAPPING TURTLE.png',
            2: '02_MULROC.png',
            3: '03_CROCODILE.png',
            4: '04_LIZARD SKINK.png',
            5: '05_LIZARD MAN.png',
            6: '06_LIZARD SLANN.png',
            7: '07_LIZARD SAURUS.png',
            8: '08_TROGLODON.png',
            9: '09_LIZARD KROXIGOR.png',
            10: '10_LIZARD KING.png'
        };
        const filename = mapping[stage] || '01_ALLIGATOR SNAPPING TURTLE.png';
        return `/assets/boss_swamp/${filename}`;
    }
    return '/assets/boss_goblin/tutorial_bot.png';
};

/**
 * 챕터별 보스 공격 애니메이션 스프라이트 시트 경로 반환.
 * 해당 스프라이트가 없으면 null 반환.
 */
export const getBossAttackSprite = (chapter: string, stage: number): string | null => {
    if (chapter === '1') {
        const mapping: Record<number, string> = {
            1:  '01_goblin_transparent.png',
            2:  '02_goblin skirmisher_transparent.png',
            3:  '03_goblin rider_transparent.png',
            4:  '04_hobgoblin_transparent.png',
            5:  '05_goblin shaman_transparent.png',
            6:  '06_golden goblin_transparent.png',
            7:  '07_elite goblin_transparent.png',
            8:  '08_troll_transparent.png',
            9:  '09_giant goblin_transparent.png',
            10: '10_goblin lord_transparent.png',
        };
        const filename = mapping[stage];
        if (!filename) return null;
        return `/assets/boss_goblin/${filename}`;
    }
    if (chapter === '2A') {
        const mapping: Record<number, string> = {
            1:  '01_mummy_transparent.png',
            2:  '02_sand snake_transparent.png',
            3:  '03_chimera snake human_transparent.png',
            4:  '04_sand needle lizard_transparent.png',
            5:  '05_sand scorpion_transparent.png',
            6:  '06_desert vultures_transparent.png',
            7:  '07_sand golem_transparent.png',
            8:  '08_wyvern_transparent.png',
            9:  '09_sand deathworm_transparent.png',
            10: '10_sphinx_transparent.png',
            11: '2A_sand dragon_transparent.png',
        };
        const filename = mapping[stage];
        if (!filename) return null;
        return `/assets/boss_desert/${filename}`;
    }
    if (chapter === '2B') {
        const mapping: Record<number, string> = {
            1:  '01_orc_transparent.png',
            2:  '02_orc savage_transparent.png',
            3:  '03_half orc_transparent.png',
            4:  '04_orc warrior_transparent.png',
            5:  '05_orc chieftain_transparent.png',
            6:  '06_high orc_transparent.png',
            7:  '07_high orc warrior_transparent.png',
            8:  '08_high orc assassin_transparent.png',
            9:  '09_high orc chieftain_transparent.png',
            10: '10_high orc lord_transparent.png',
            11: '2B_high orc shaman_transparent.png',
        };
        const filename = mapping[stage];
        if (!filename) return null;
        return `/assets/boss_orc/${filename}`;
    }
    return null;
};
