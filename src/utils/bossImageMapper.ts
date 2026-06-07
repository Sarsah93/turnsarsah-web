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

export interface BossAttackSpriteInfo {
    /** 스프라이트 시트 이미지 경로 */
    path: string;
    /** 가로 프레임 수 (columns) */
    cols: number;
    /** 세로 프레임 수 (rows) */
    rows: number;
}

/**
 * 챕터·스테이지별 보스 공격 스프라이트 시트 정보 반환.
 * cols × rows 그리드 레이아웃을 포함한다.
 * 스프라이트가 없으면 null 반환.
 *
 * ※ 그리드 값은 실제 에셋을 기준으로 측정한 수치입니다.
 *   잘못된 경우 cols / rows 값만 수정하면 됩니다.
 */
export const getBossAttackSpriteInfo = (chapter: string, stage: number): BossAttackSpriteInfo | null => {
    if (chapter === '1') {
        // 챕터 1 고블린: 3×3 = 9프레임 (확인됨)
        const mapping: Record<number, string> = {
            1: '01_goblin_transparent.png',
            2: '02_goblin skirmisher_transparent.png',
            3: '03_goblin rider_transparent.png',
            4: '04_hobgoblin_transparent.png',
            5: '05_goblin shaman_transparent.png',
            6: '06_golden goblin_transparent.png',
            7: '07_elite goblin_transparent.png',
            8: '08_troll_transparent.png',
            9: '09_giant goblin_transparent.png',
            10: '10_goblin lord_transparent.png',
        };
        const filename = mapping[stage];
        if (!filename) return null;
        return { path: `/assets/boss_goblin/${filename}`, cols: 3, rows: 3 };
    }
    if (chapter === '2A') {
        // 챕터 2A 사막: 이미지 실측 기반 그리드
        // ※ 실제 파일과 다를 경우 cols/rows를 수정하세요.
        const mapping: Record<number, { file: string; cols: number; rows: number }> = {
            1: { file: '01_mummy_transparent.png', cols: 6, rows: 6 }, // 2352×4080 → 588×582/frame
            2: { file: '02_sand snake_transparent.png', cols: 6, rows: 6 }, // 3288×2496 → 822×832/frame
            3: { file: '03_chimera snake human_transparent.png', cols: 6, rows: 6 }, // 2664×3972 → 1332×1324/frame
            4: { file: '04_sand needle lizard_transparent.png', cols: 6, rows: 6 }, // 3840×2664 → 1280×1332/frame
            5: { file: '05_sand scorpion_transparent.png', cols: 6, rows: 6 }, // 2784×2376 → 928×792/frame
            6: { file: '06_desert vultures_transparent.png', cols: 6, rows: 6 }, // 3840×2880 → 960×960/frame (완전 정방형)
            7: { file: '07_sand golem_transparent.png', cols: 6, rows: 6 }, // 3840×3840 → 640×640/frame
            8: { file: '08_wyvern_transparent.png', cols: 6, rows: 6 }, // 3840×3840 → 640×640/frame
            9: { file: '09_sand deathworm_transparent.png', cols: 6, rows: 6 }, // 3264×3732 → 466×466/frame
            10: { file: '10_sphinx_transparent.png', cols: 6, rows: 6 }, // 3840×3840 → 640×640/frame
            11: { file: '2A_sand dragon_transparent.png', cols: 6, rows: 6 }, // 3840×3840 → 640×640/frame
        };
        const entry = mapping[stage];
        if (!entry) return null;
        return { path: `/assets/boss_desert/${entry.file}`, cols: entry.cols, rows: entry.rows };
    }
    if (chapter === '2B') {
        // 챕터 2B 깊은 숲 오크: 이미지 실측 기반 그리드
        // ※ 실제 파일과 다를 경우 cols/rows를 수정하세요.
        const mapping: Record<number, { file: string; cols: number; rows: number }> = {
            1: { file: '01_orc_transparent.png', cols: 6, rows: 6 }, // 2688×3696 → 672×616/frame
            2: { file: '02_orc savage_transparent.png', cols: 4, rows: 4 }, // 1700×2400 → 340×343/frame
            3: { file: '03_half orc_transparent.png', cols: 4, rows: 4 }, // 1360×2072 → 227×230/frame
            4: { file: '04_orc warrior_transparent.png', cols: 10, rows: 1 }, // 2970×272  → 수평 스트립 11프레임
            5: { file: '05_orc chieftain_transparent.png', cols: 6, rows: 6 }, // 3840×3840 → 640×640/frame
            6: { file: '06_high orc_transparent.png', cols: 6, rows: 6 }, // 2592×3840 → 432×427/frame
            7: { file: '07_high orc warrior_transparent.png', cols: 6, rows: 6 }, // 3840×3840 → 640×640/frame
            8: { file: '08_high orc assassin_transparent.png', cols: 6, rows: 6 }, // 3840×3840 → 640×640/frame
            9: { file: '09_high orc chieftain_transparent.png', cols: 6, rows: 6 }, // 3840×3840 → 640×640/frame
            10: { file: '10_high orc lord_transparent.png', cols: 6, rows: 6 }, // 3840×3732 → 640×622/frame
            11: { file: '2B_high orc shaman_transparent.png', cols: 6, rows: 6 }, // 3840×3744 → 640×624/frame
        };
        const entry = mapping[stage];
        if (!entry) return null;
        return { path: `/assets/boss_orc/${entry.file}`, cols: entry.cols, rows: entry.rows };
    }
    if (chapter === '3A') {
        // 챕터 3A 동굴: 이미지 실측 기반 그리드
        const mapping: Record<number, { file: string; cols: number; rows: number }> = {
            1: { file: '01_SLIME_transparent.png', cols: 6, rows: 6 },
            2: { file: '02_VAMPIRE BAT_transparent.png', cols: 6, rows: 6 },
            3: { file: '03_CAVE WORM_transparent.png', cols: 6, rows: 6 },
            4: { file: '04_POISON SPIDER_transparent.png', cols: 6, rows: 6 },
            5: { file: '05_WRAITH_transparent.png', cols: 6, rows: 6 },
            6: { file: '06_CAVE BEAR_transparent.png', cols: 6, rows: 6 },
            7: { file: '07_CRYSTAL GOLEM_transparent.png', cols: 6, rows: 6 },
            8: { file: '08_DRAKE_transparent.png', cols: 6, rows: 6 },
            9: { file: '09_BASILISK_transparent.png', cols: 6, rows: 6 },
            10: { file: '10_HYDRA_transparent.png', cols: 6, rows: 6 },
        };
        const entry = mapping[stage];
        if (!entry) return null;
        return { path: `/assets/boss_cave/${entry.file}`, cols: entry.cols, rows: entry.rows };
    }
    if (chapter === '3B') {
        // 챕터 3B 늪지대: 이미지 실측 기반 그리드
        const mapping: Record<number, { file: string; cols: number; rows: number }> = {
            1: { file: '01_ALLIGATOR SNAPPING TURTLE_transparent.png', cols: 6, rows: 6 },
            2: { file: '02_MULROC_transparent.png', cols: 6, rows: 6 },
            3: { file: '03_CROCODILE_transparent.png', cols: 6, rows: 6 },
            4: { file: '04_LIZARD SKINK_transparent.png', cols: 6, rows: 6 },
            5: { file: '05_LIZARD MAN_transparent.png', cols: 6, rows: 6 },
            6: { file: '06_LIZARD SLANN_transparent.png', cols: 6, rows: 6 },
            7: { file: '07_LIZARD SAURUS_transparent.png', cols: 6, rows: 6 },
            8: { file: '08_TROGLODON_transparent.png', cols: 6, rows: 6 },
            9: { file: '09_LIZARD KROXIGOR_transparent.png', cols: 6, rows: 6 },
            10: { file: '10_LIZARD KING_transparent.png', cols: 6, rows: 6 },
        };
        const entry = mapping[stage];
        if (!entry) return null;
        return { path: `/assets/boss_swamp/${entry.file}`, cols: entry.cols, rows: entry.rows };
    }
    return null;
};

/**
 * @deprecated getBossAttackSpriteInfo 를 사용하세요.
 * 챕터별 보스 공격 애니메이션 스프라이트 시트 경로 반환.
 * 해당 스프라이트가 없으면 null 반환.
 */
export const getBossAttackSprite = (chapter: string, stage: number): string | null => {
    if (chapter === '1') {
        const mapping: Record<number, string> = {
            1: '01_goblin_transparent.png',
            2: '02_goblin skirmisher_transparent.png',
            3: '03_goblin rider_transparent.png',
            4: '04_hobgoblin_transparent.png',
            5: '05_goblin shaman_transparent.png',
            6: '06_golden goblin_transparent.png',
            7: '07_elite goblin_transparent.png',
            8: '08_troll_transparent.png',
            9: '09_giant goblin_transparent.png',
            10: '10_goblin lord_transparent.png',
        };
        const filename = mapping[stage];
        if (!filename) return null;
        return `/assets/boss_goblin/${filename}`;
    }
    if (chapter === '2A') {
        const mapping: Record<number, string> = {
            1: '01_mummy_transparent.png',
            2: '02_sand snake_transparent.png',
            3: '03_chimera snake human_transparent.png',
            4: '04_sand needle lizard_transparent.png',
            5: '05_sand scorpion_transparent.png',
            6: '06_desert vultures_transparent.png',
            7: '07_sand golem_transparent.png',
            8: '08_wyvern_transparent.png',
            9: '09_sand deathworm_transparent.png',
            10: '10_sphinx_transparent.png',
            11: '2A_sand dragon_transparent.png',
        };
        const filename = mapping[stage];
        if (!filename) return null;
        return `/assets/boss_desert/${filename}`;
    }
    if (chapter === '2B') {
        const mapping: Record<number, string> = {
            1: '01_orc_transparent.png',
            2: '02_orc savage_transparent.png',
            3: '03_half orc_transparent.png',
            4: '04_orc warrior_transparent.png',
            5: '05_orc chieftain_transparent.png',
            6: '06_high orc_transparent.png',
            7: '07_high orc warrior_transparent.png',
            8: '08_high orc assassin_transparent.png',
            9: '09_high orc chieftain_transparent.png',
            10: '10_high orc lord_transparent.png',
            11: '2B_high orc shaman_transparent.png',
        };
        const filename = mapping[stage];
        if (!filename) return null;
        return `/assets/boss_orc/${filename}`;
    }
    return null;
};
