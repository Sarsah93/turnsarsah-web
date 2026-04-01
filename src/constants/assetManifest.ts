// src/constants/assetManifest.ts

import { getBossImage } from '../utils/bossImageMapper';
import { ALTAR_SKILLS, TROPHIES } from './altarSystem';

// 제단 스킬 전체 이미지 (팝업 진입 시 즉시 렌더링 보장)
export const ALTAR_SYSTEM_ASSETS: string[] = [
  // 제단 스킬 이미지 (ALTAR_SKILLS 정의에서 자동 생성)
  ...Object.values(ALTAR_SKILLS)
    .filter(skill => skill.image)
    .map(skill => `/assets/altar skills/${skill.image}`),
  // 트로피 이미지 (TROPHIES 정의에서 자동 생성)
  ...Object.values(TROPHIES)
    .filter(trophy => trophy.image)
    .map(trophy => `/assets/trophy/${trophy.image}`),
];

// Phase 1: 메인 메뉴 최소 자산 (로고 + HP바 + 제단 시스템 전체)
export const MAIN_MENU_ASSETS: string[] = [
  '/assets/etc images/turnsarsah_logo_image.png',
  '/assets/etc images/HP BAR_RED_IMAGE.png',
  '/assets/etc images/HP BAR_BLUE_IMAGE.png',
  ...ALTAR_SYSTEM_ASSETS,
];

// 전체 카드 이미지 (55장)
export const CARD_ASSETS: string[] = [
  ...['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'].flatMap(suit =>
    ['2','3','4','5','6','7','8','9','10','J','Q','K','A'].map(rank =>
      `/assets/cards/${suit}_${rank}.png`
    )
  ),
  '/assets/cards/JOKER.png',
  '/assets/cards/BACK2.png',
  '/assets/cards/MUD.png',
];

// 상태이상 아이콘 (28개)
export const CONDITION_ASSETS: string[] = [
  '/assets/conditions/Awakening.png',
  '/assets/conditions/Bleeding.png',
  '/assets/conditions/Debilitating.png',
  '/assets/conditions/Heavy Bleeding.png',
  '/assets/conditions/Paralyzing.png',
  '/assets/conditions/Poisoning.png',
  '/assets/conditions/Regenerating.png',
  '/assets/conditions/데미지 반동(Damage recoiling).png',
  '/assets/conditions/데미지 반사(Damage reflection).png',
  '/assets/conditions/도발(Provocation).png',
  '/assets/conditions/메아리(Echo).png',
  '/assets/conditions/면역(Immune).png',
  '/assets/conditions/명중률 저하(Decreasing accuracy).png',
  '/assets/conditions/버서커(Berserker).png',
  '/assets/conditions/부패(decay).png',
  '/assets/conditions/부활(Revival).png',
  '/assets/conditions/불굴의 의지(Invincible Spirit).png',
  '/assets/conditions/삼중공격(Triple Attack).png',
  '/assets/conditions/신경성 맹독(Neurotoxicity).png',
  '/assets/conditions/아드레날린 분비(Adrenaline secretion).png',
  '/assets/conditions/잠김(Swamping).png',
  '/assets/conditions/줄기세포(Stem-cell).png',
  '/assets/conditions/초기의식(INITIATORY).png',
  '/assets/conditions/탈수(Dehydration).png',
  '/assets/conditions/피해감소(Damage Reducing).png',
  '/assets/conditions/화상(Burned).png',
  '/assets/conditions/회피(Avoiding).png',
  '/assets/conditions/흡혈(Hematophagy).png'
];

// 챕터별 보스 이미지
export const getChapterBossAssets = (chapter: string): string[] => {
  const maxStages: Record<string, number> = {
    '1': 10, '2A': 11, '2B': 11, '3A': 10, '3B': 10
  };
  const max = maxStages[chapter] || 10;
  return Array.from({ length: max }, (_, i) =>
    getBossImage(chapter, i + 1, false) // false means not tutorial
  );
};

// 챕터별 전체 프리로드 목록
export const getGameEntryAssets = (chapter: string, equippedSkills: string[]): string[] => {
  const assets = [
    ...CARD_ASSETS,
    ...CONDITION_ASSETS,
    ...getChapterBossAssets(chapter),
  ];

  // 장착된 제단 스킬 이미지만
  equippedSkills.forEach(id => {
      const skill = ALTAR_SKILLS[id];
      if (skill && skill.image) {
          assets.push(`/assets/altar skills/${skill.image}`);
      }
  });

  return assets;
};
