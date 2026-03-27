import { AudioManager } from './AudioManager';

export const playConditionSound = (condition: string) => {
    let file = '';
    switch (condition) {
        case 'Awakening': file = 'Awakening.mp3'; break;
        case 'Burn': file = '화상(burn).mp3'; break;
        case 'Decay': file = '부패(decay).mp3'; break;
        case 'Reflection': file = '데미지 반사(Damage reflection).mp3'; break;
        case 'Bleeding': file = 'Bleeding.mp3'; break;
        case 'Heavy Bleeding': file = 'Heavy Bleeding.mp3'; break;
        case 'Poisoning': file = 'poisoning.mp3'; break;
        case 'Regenerating': file = 'Regenerating.mp3'; break;
        case 'Paralyzing': file = 'paralyzing.mp3'; break;
        case 'Debilitating': file = 'Debilitating.mp3'; break;
        case 'Avoiding': file = 'avoiding.mp3'; break;
        case 'Damage recoiling': file = '데미지 반동(Damage recoiling).mp3'; break;
        case 'Berserker': file = '버서커(Berserker).mp3'; break;
        case 'Revival': file = '부활(Revival).mp3'; break;
        case 'Invincible spirit': file = '불굴의 의지(Invincible Spirit).mp3'; break;
        case 'Adrenaline secretion': file = '아드레날린 분비(Adrenaline secretion).mp3'; break;
        case 'Neurotoxicity': file = '신경성 맹독(Neurotoxicity).mp3'; break;
        case 'Dehydration': file = '탈수(Dehydration).mp3'; break;
        case 'Decreasing accuracy': file = '명중률 저하(Decreasing accuracy).mp3'; break;
        case 'Triple Attack':
            AudioManager.playSFX('/assets/audio/combat/chapter 2a desert/06_desert vultures_2.mp3');
            return;
        default: return;
    }
    AudioManager.playSFX(`/assets/audio/conditions/${file}`);
};

export const getBossAttackSFX = (chapter: string, stage: number) => {
    if (chapter === '2A') {
        const sfxMap: Record<number, string> = {
            1: '01_mummy.mp3',
            2: '02_sand snake.mp3',
            3: '03_chimera snake human.mp3',
            4: '04_sand niddle lizard.mp3',
            5: '05_sand scorpion.mp3',
            6: '06_desert vultures.mp3',
            7: '07_sand golem.mp3',
            8: '08_sand wyvern.mp3',
            9: '09_sand deathworm.mp3',
            10: '10_sphinx.mp3',
            11: '2A_SAND DRAGON.mp3'
        };
        const filename = sfxMap[stage];
        if (stage === 11) return `/assets/audio/combat/chapter 2a desert/${filename}`;
        if (filename) return `/assets/audio/combat/chapter 2a desert/${filename}`;
        return '';
    }

    if (chapter === '2B') {
        const sfxMap: Record<number, string> = {
            1: '01_orc.mp3',
            2: '02_orc savage.mp3',
            3: '03_half orc.mp3',
            4: '04_orc warrior.mp3',
            5: '05_orc chieftain.mp3',
            6: '06_high orc.mp3',
            7: '07_high orc warrior.mp3',
            8: '08_high orc assassin.mp3',
            9: '09_high orc chieftain.mp3',
            10: '10_high orc lord.mp3',
            11: '2B_HIGH ORC SHAMAN.mp3'
        };
        if (stage === 11) return `/assets/audio/combat/chapter 2b deep forest/${sfxMap[stage]}`;
        return sfxMap[stage] ? `/assets/audio/combat/chapter 2b deep forest/${sfxMap[stage]}` : null;
    }

    if (chapter === '3A') {
        const sfxMap: Record<number, string> = {
            1: '01_slime.mp3',
            2: '02_vampire bat.mp3',
            3: '03_cave worm.mp3',
            4: '04_poison spider.mp3',
            5: '05_wraith.mp3',
            6: '06_cave bear.mp3',
            7: '07_crystal golem.mp3',
            8: '08_drake.mp3',
            9: '09_basilisk.mp3',
            10: '10_hydra.mp3'
        };
        return sfxMap[stage] ? `/assets/audio/combat/chapter 3a cave/${sfxMap[stage]}` : null;
    }

    if (chapter === '3B') {
        const sfxMap: Record<number, string> = {
            1: '01_alligator snapping turtle.mp3',
            2: '02_murloc.mp3',
            3: '03_crocodile.mp3',
            4: '04_lizard skink.mp3',
            5: '05_lizard man.mp3',
            6: '06_lizard slann.mp3',
            7: '07_lizard saurus.mp3',
            8: '08_troglodon.mp3',
            9: '09_kroxigor.mp3',
            10: '10_lizard king.mp3'
        };
        return sfxMap[stage] ? `/assets/audio/combat/chapter 3b swamp/${sfxMap[stage]}` : null;
    }

    if (chapter !== '1') return '';

    const map: Record<number, string> = {
        1: '01_sword hit_light.mp3',
        2: '02_arrow_hit.mp3',
        3: '03_spear_thrust.mp3',
        4: '04_sword hit_heavy.mp3',
        5: '05_magica.mp3',
        6: '06_swing_ weapon.mp3',
        7: '07_sword hit_heavy.mp3',
        8: '08_blunt_light.mp3',
        9: '09_blunt_hit_heavy.mp3',
        10: '10_cruel_swing.mp3'
    };
    const file = map[stage] || '01_sword hit_light.mp3';
    return `/assets/audio/combat/chapter 1 goblin/${file}`;
};
