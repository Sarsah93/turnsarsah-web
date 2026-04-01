// src/constants/loadingTips.ts
// 로딩 화면에서 표시할 팁 문구 모음

export type Language = 'KR' | 'EN';

export const LOADING_TIPS: Record<Language, string[]> = {
  KR: [
    // ─── 응용 팁 ───────────────────────────────────────────────────────
    '💡 조커 카드는 뒤집혀 있어도(BLIND 상태) 조커임을 확인할 수 있어요.',
    '💡 뒤집힌 카드를 다른 카드와 함께 선택하면, 족보 완성 여부를 슬쩍 확인할 수 있어요.',
    '💡 최대 5장까지 선택하여 공격할 수 있어요. 원하지 않는 카드를 원페어 등 족보에 포함하고 공격하면, 다음 턴에 손패가 자동 보충돼요.',
    '💡 교체(SWAP) 횟수가 남아있다면, 족보를 완성하기 어려울 때 과감히 교체하는 것이 유리할 수 있어요.',
    '💡 조커는 어떤 카드도 대신할 수 있어요. 4장만 선택해도 조커가 포함되면 족보 완성 여부를 꼭 확인하세요!',
    '💡 보스의 공격 패턴을 잘 읽으면 회피(AVOIDING) 상태이상의 가치가 크게 올라가요.',
    '💡 데미지는 선택한 카드 숫자의 합 + 족보 보너스로 결정돼요. 높은 숫자 카드를 많이 포함할수록 유리해요.',
    '💡 A(에이스)는 14로 계산돼요. 스트레이트에서는 1로도 사용 가능해요.',
    '💡 SWAP 버튼을 눌러도 패를 모두 바꾸지 않아도 돼요. 특정 카드만 선택해서 교체하세요.',
    '💡 족보 점수가 0이 되는 보스 룰에 걸린 경우, 해당 족보의 카드 숫자 합만큼은 데미지를 줄 수 있어요.',

    // ─── 챕터 특징 ─────────────────────────────────────────────────────
    '🗺️ [챕터 1: 들판] 가장 기본적인 규칙들이 등장해요. 금지 숫자, 금지 모양, 블라인드 등 보스 룰에 적응하는 연습을 할 수 있어요.',
    '🗺️ [챕터 2A: 사막] 탈수 상태이상으로 매 턴 체력이 소모돼요. 보스도 회피, 재생, 삼중공격 등 강력한 패시브를 가지고 있으니 주의하세요.',
    '🗺️ [챕터 2B: 깊은 숲] 플레이어의 기본 회피율이 제한되는 환경이에요. 오크 계열 보스들은 저마다 독특한 전투 룰을 가져요.',
    '🗺️ [챕터 3A: 동굴] 메아리(Echo) 챕터 규칙 적용 — 보스가 20% 확률로 추가 공격을 해요. 보스의 재생이나 흡혈 능력도 까다로워요.',
    '🗺️ [챕터 3B: 늪지대] 잠김(Swamping) 챕터 규칙 적용 — 공격 횟수가 쌓일수록 회피율이 급감해요. 보스들은 강력한 재생 능력을 가져요.',

    // ─── 보스 설명 ─────────────────────────────────────────────────────
    '👾 [고블린: 챕터 1-1] 50% 확률로 출혈을 유발해요. 첫 스테이지지만 방심은 금물!',
    '👾 [골든 고블린: 챕터 1-6] 체력이 낮고 공격력도 약하지만, 특정 족보를 금지해요. 승리 시 최대 체력 보너스를 받아요.',
    '👾 [고블린 로드: 챕터 1-10] 매 턴 무작위 규칙이 적용돼요. 피해경감 15%와 각성 능력도 가지고 있는 최강 보스예요.',
    '👾 [스핑크스: 챕터 2A-10] 퍼즐 타겟 숫자에 맞는 족보를 완성하면 추가 피해! 각성 능력도 가지고 있어요.',
    '👾 [하이드라: 챕터 3A-10] 부활 4회! 4가지 문양 모두 포함한 플러시 성공 시 즉사시킬 수 있어요. (티폰전승)',
    '👾 [리자드 킹: 챕터 3B-10] 매 턴 종료 시 최대 체력, 공격력, 회피율이 모두 성장해요. 빠르게 처리하는 것이 관건!',
    '👾 [크리스탈 골렘: 챕터 3A-7] 매 턴 피해경감이 10%씩 누적되지만, 다이아몬드 포함 공격 시 +8 고정 데미지로 리셋돼요.',
    '👾 [샌드 드래곤: 챕터 2A 스페셜] 모래폭풍 + 삼중공격 + 각성의 조합. 스페셜 스테이지 최강의 보스예요.',

    // ─── 전리품/제단 시스템 ─────────────────────────────────────────────
    '🏆 보스를 처치하면 전리품을 얻을 수 있어요. 전리품은 메인 화면의 제단 시스템에서 스킬을 해금하는 데 사용돼요.',
    '🏆 [생존주의자] 최대 체력 +25로 시작해요. 체력이 부족한 느낌이 든다면 좋은 첫 번째 선택이에요.',
    '🏆 [날카로운 카드] 공격 시 고정 데미지 +25. 딜링을 강화하고 싶다면 선택해 보세요.',
    '🏆 [위상전이] 스테이지당 1회, HP가 0이 될 때 HP 1로 생존 + 조커 1장 획득. 보험으로 꽤 강력해요.',
    '🏆 [엔트로피제어] BLIND(카드 뒤집힘)와 BANNED(숫자/모양 금지) 룰에 완전 면역! 챕터 1 보스들이 훨씬 쉬워져요.',
    '🏆 [과부하] 같은 족보를 연속 사용할수록 최대 +30% 데미지 증가. 한 가지 족보를 반복하는 플레이 스타일에 잘 맞아요.',
    '🏆 [확률왜곡] 카드 교체 시 25% 확률로 교체 횟수 미소모. SWAP을 자주 사용하는 플레이에 강력해요.',
    '🏆 [불안정 동조] 보스 HP가 낮을수록 데미지 증가. 후반부 딜링을 극대화할 수 있어요.',
    '🏆 어려움/지옥 난이도에서는 제단 스킬 세트를 별도로 지정할 수 있어요. 난이도별 전략을 세워 보세요!',
  ],
  EN: [
    // ─── Advanced Tips ────────────────────────────────────────────────
    '💡 JOKER cards are recognizable even when flipped (BLIND state)!',
    '💡 Try selecting a BLIND card with others — you can check hand completion without revealing it.',
    '💡 You can select up to 5 cards to attack. Include unwanted cards in a hand (e.g., ONE PAIR) to clear them from your hand next turn.',
    '💡 If you\'re struggling to form a hand, don\'t hesitate to use SWAP — sometimes a fresh set of cards is the best move.',
    '💡 Jokers substitute for any card. When you have a Joker, always check if selecting 4~5 cards completes a powerful hand!',
    '💡 Learning the boss\'s attack pattern makes the AVOIDING status effect much more valuable.',
    '💡 Damage = Sum of selected card values + Hand bonus. Including higher-numbered cards always helps.',
    '💡 Ace (A) counts as 14. It can also count as 1 in Straights.',
    '💡 SWAP doesn\'t have to replace the whole hand — just select the cards you want to replace.',
    '💡 Even when a boss rule sets a hand\'s bonus to 0, you still deal damage equal to the sum of card values.',

    // ─── Chapter Traits ───────────────────────────────────────────────
    '🗺️ [Chapter 1: Fields] Learn the basics — banned ranks, banned suits, BLIND. Great for mastering boss rules.',
    '🗺️ [Chapter 2A: Desert] Dehydration drains HP each turn. Bosses have strong passives like evasion, regeneration, and triple attacks.',
    '🗺️ [Chapter 2B: Deep Forest] Player base evasion is environmentally restricted. Each Orc boss has a unique combat rule.',
    '🗺️ [Chapter 3A: Cave] Echo Chapter Rule — bosses have a 20% chance to deal a bonus attack. Healing and lifesteal bosses are tricky.',
    '🗺️ [Chapter 3B: Swamp] Swamping Chapter Rule — evasion drops sharply as you take hits. Bosses have powerful regeneration.',

    // ─── Boss Descriptions ─────────────────────────────────────────────
    '👾 [Goblin: Ch.1-1] 50% chance to inflict Bleeding. Don\'t underestimate the first stage!',
    '👾 [Golden Goblin: Ch.1-6] Low HP and ATK, but bans a hand each turn. Defeat it for a Max HP bonus!',
    '👾 [Goblin Lord: Ch.1-10] Random rules every turn + 15% damage reduction + Awakening. The toughest Chapter 1 boss.',
    '👾 [Sphinx: Ch.2A-10] Hit the puzzle target hand for bonus damage! It also has Awakening ability.',
    '👾 [Hydra: Ch.3A-10] Revives 4 times! Land a 4-suit Flush (Typhon Myth) to instantly defeat it.',
    '👾 [Lizard King: Ch.3B-10] Grows stronger every turn — Max HP, ATK, and evasion all increase. Finish it fast!',
    '👾 [Crystal Golem: Ch.3A-7] Damage reduction stacks +10% each turn, but Diamond cards deal +8 fixed damage and reset it.',
    '👾 [Sand Dragon: 2A Special] Sand Storm + Triple Attack + Awakening. The ultimate Special Stage boss.',

    // ─── Trophy / Altar System ────────────────────────────────────────
    '🏆 Defeating bosses drops trophies. Use them in the Altar System to unlock powerful skills.',
    '🏆 [Prepper] Start with +25 Max HP. Great pick if you find yourself running low on health.',
    '🏆 [Sharpen Cards] Deal +25 fixed bonus damage on attack. Perfect for aggressive builds.',
    '🏆 [Phase Transition] Once per stage — survive fatal damage with 1 HP and gain a Joker card. Very strong safety net.',
    '🏆 [Entropy Control] Full immunity to BLIND and BANNED rules! Makes Chapter 1 bosses much easier.',
    '🏆 [Overloaded] Using the same hand consecutively stacks up to +30% damage. Works great with consistent hand strategies.',
    '🏆 [Probability Distortion] 25% chance not to consume a swap chance. Excellent if you swap cards frequently.',
    '🏆 [Instability Resonance] Deal more damage as boss HP drops. Great for finishing off tough bosses.',
    '🏆 In HARD/HELL difficulty, you can set separate Altar skill loadouts. Plan your strategy per difficulty!',
  ]
};

/**
 * 현재 언어의 팁 목록에서 무작위로 하나 반환
 */
export function getRandomTip(language: Language): string {
  const tips = LOADING_TIPS[language];
  return tips[Math.floor(Math.random() * tips.length)];
}
