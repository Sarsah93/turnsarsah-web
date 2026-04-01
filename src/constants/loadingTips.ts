// src/constants/loadingTips.ts
// 로딩 화면에서 표시할 팁 문구 모음 - 추상적이고 몰입감 있는 버전

export type Language = 'KR' | 'EN';

export const LOADING_TIPS: Record<Language, string[]> = {
  KR: [
    // ─── 응용 및 시스템 팁 ──────────────────────────────────────────────
    '💡 조커 카드는 눈을 감고 있어도(BLIND) 그 존재감을 숨기지 못해요. 뒤집힌 패 사이에서 조커를 찾아보세요!',
    '💡 뒤집힌 카드가 무엇인지 궁금하다면 다른 카드와 함께 들어보세요. 족보가 완성되는 순간, 답을 알게 될지도 몰라요.',
    '💡 한 번에 5장까지 공격할 수 있다는 점을 잊지 마세요! 가끔은 원치 않는 패를 족보에 섞어 버리는 것이 다음 기회를 위한 최고의 전략이 됩니다.',
    '💡 교체(SWAP)는 단순한 기회가 아니라 전략이에요. 판세를 뒤집기 어렵다면 과감하게 패를 섞어보세요.',
    '💡 조커는 무엇이든 될 수 있는 만능 열쇠예요. 4장만으로 부족할 때 조커가 당신의 공격을 완성해 줄 거예요.',
    '💡 보스의 움직임에 귀를 기울이면 공격을 흘려보낼(AVOIDING) 타이밍이 보일 거예요.',
    '💡 공격의 위력은 카드의 숫자 합과 족보의 조화로 결정돼요. 높은 숫자의 카드들이 모일수록 보스의 코어는 더 크게 흔들립니다.',
    '💡 카드의 정점인 A(에이스)는 14로 계산되는 거 알고 계셨나요? 하지만 스트레이트의 시작인 1로도 쓰일 수 있는 유연함을 가졌답니다!',
    '💡 패를 전부 바꿀 필요는 없어요. 남기고 싶은 소중한 한 장이 있다면 그것만 빼고 교체해 보세요.',
    '💡 보스의 규칙으로 족보의 힘이 억눌려도, 당신이 선택한 카드의 숫자들까지 지워지지는 않아요.',

    // ─── 구역(챕터) 및 환경 ───────────────────────────────────────────
    '🗺️ 평화로워 보이는 들판에도 보스들의 고유한 규칙이 숨어 있어요. 금지된 숫자와 모양에 주의하며 전진하세요.',
    '🗺️ 뜨거운 사막에서는 숨을 쉬는 것만으로도 기력이 소모(탈수)돼요. 보스들의 끈질긴 생명력에 대비해야 할 거예요.',
    '🗺️ 깊은 숲의 나무들은 당신의 움직임을 방해해요. 이곳에서 살아가는 오크들은 저마다의 독특한 전투 방식을 고집한답니다.',
    '🗺️ 동굴은 메아리가 울려서 두 번 맞을 수도 있어요! 재생과 흡혈로 버티는 까다로운 보스들의 공격을 조심하세요.',
    '🗺️ 늪지대에 발이 묶이면(잠김) 점점 피하기가 힘들어질 거예요. 늪의 주인들이 보여주는 놀라운 회복력을 경계하세요.',

    // ─── 존재들(보스) ─────────────────────────────────────────────────
    '👾 고블린은 날카로운 나이프로 출혈을 일으켜요! 작다고 무시하면 큰 코 다쳐요~ 방심은 금물!',
    '👾 황금빛을 띠는 고블린은 약해 보이지만 당신의 손패를 제약할 거예요. 그를 정화하면 특별한 생명력을 얻을 수 있습니다.',
    '👾 들판의 진정한 주인은 매 턴 규칙을 바꿔가며 당신을 혼란에 빠뜨릴 거예요. 그의 각성을 견뎌내세요.',
    '👾 모래 속에 숨은 존재들은 당신의 눈을 가리고 패를 강제로 뒤섞어 버려요. 신경을 마비시키는 독을 조심하세요.',
    '👾 고대의 구조물은 당신에게 수수께끼를 던질 거예요. 타겟 숫자에 맞는 족보를 완성하여 퍼즐을 풀어보세요.',
    '👾 머리가 여럿 달린 전설 속 괴물은 쓰러뜨려도 다시 일어날 거예요. 하지만 네 가지 문양을 조화롭게 모은다면 단번에 처단할 길(티폰전승)이 보일지도 몰라요.',
    '👾 늪지대의 왕은 시간이 흐를수록 점점 더 거대하고 강력해져요. 시스템이 과부하되기 전에 정화해야 합니다.',
    '👾 어떤 구역에서는 평범한 방식으로는 만날 수 없는 특별한 존재가 당신을 기다리고 있을지도 몰라요. 특별한 루트를 찾아보세요!',

    // ─── 제단 및 스킬 ─────────────────────────────────────────────────
    '🏆 보스를 정화하고 얻은 전리품은 메인 화면의 제단에서 강력한 힘으로 변환될 수 있습니다.',
    '🏆 스킬 \'생존주의자\'는 최대 체력을 늘려주는 초반 제단 스킬이에요. 높은 코어 안정도로 시작하고 싶다면 좋은 선택이에요!',
    '🏆 \'날카로운 카드\'를 선택하면 당신의 모든 공격에 날카로운 고정 피해가 실리게 됩니다.',
    '🏆 위기의 순간, \'위상전이\'는 당신을 다른 차원으로 옮겨 생명을 보존하고 조커를 선사할 거예요.',
    '🏆 \'엔트로피제어\'를 통해 보스가 가하는 시야 방해와 제약을 완전히 무시해 보세요. 전투가 한결 선명해질 거예요.',
    '🏆 같은 족보를 반복해서 사용할수록 \'과부하\' 스킬이 공격력을 증폭시켜 줄 거예요. 한 우물만 파는 전략에 완벽하죠.',
    '🏆 확률의 흐름을 비트는 \'확률왜곡\'은 당신이 더 자주 패를 교체할 수 있도록 도와줍니다.',
    '🏆 보스의 코어가 비틀거릴 때, \'불안정 동조\'는 그 틈을 놓치지 않고 더 큰 피해를 입힙니다.',
    '🏆 난이도가 높아질수록 제단의 스킬 조합이 승패를 가르는 열쇠가 됩니다. 당신만의 세트를 구성해 보세요.',
  ],
  EN: [
    // ─── Applied & System Tips ─────────────────────────────────────────
    '💡 JOKER cards can\'t hide their presence even when BLINDED. Look closely between those face-down cards!',
    '💡 Wondering what that face-down card is? Try picking it up with others. The moment a hand forms, the answer may reveal itself.',
    '💡 Don\'t forget you can attack with up to 5 cards! Sometimes mixing unwanted cards into a hand is the best strategy for your next opportunity.',
    '💡 SWAPPING isn\'t just a chance, it\'s a strategy. If the tide is hard to turn, don\'t hesitate to reshuffle your destiny.',
    '💡 The JOKER is a master key that can become anything. When 4 cards aren\'t enough, the Joker will complete your strike.',
    '💡 Listen to the boss\'s movements, and you might find the perfect timing to slip through (AVOIDING) their grasp.',
    '💡 Your power comes from the harmony of card values and hand types. The higher the numbers, the more the boss\'s core will tremble.',
    '💡 Did you know the Ace (A) counts as 14? Yet it possesses the flexibility to act as a 1 to start a Straight!',
    '💡 You don\'t have to change everything. If there\'s one card you cherish, keep it and reshuffle the rest.',
    '💡 Even if a boss\'s rule suppresses your hand\'s true power, the numbers on the cards you chose remain your own.',

    // ─── Chapters & Environment ────────────────────────────────────────
    '🗺️ Even the peaceful-looking fields hide unique rules. Watch out for banned numbers and suits as you proceed.',
    '🗺️ In the scorching desert, merely breathing consumes your energy (Dehydration). Prepare for the bosses\' relentless vitality.',
    '🗺️ The trees of the deep forest will hinder your every move. The Orcs living here each insist on their own unique ways of combat.',
    '🗺️ In the caves, echoes might cause you to be struck twice! Beware of tricky bosses surviving through regeneration and lifesteal.',
    '🗺️ If you get stuck in the swamp (Swamping), evasion will become harder and harder. Watch out for the incredible recovery shown by the swamp masters.',

    // ─── Entities (Bosses) ──────────────────────────────────────────────
    '👾 Goblins use sharp knives to make you bleed! Don\'t underestimate them just because they\'re small—careless mistakes can be costly!',
    '👾 The golden-hued goblin looks weak, but it will restrict your hand. Purifying it grants you special vitality.',
    '👾 The true master of the fields will confuse you by changing rules every turn. Endure their awakening.',
    '👾 Creatures hidden in the sand will blind you and force your hand to shuffle. Beware of neurotoxic stinging!',
    '👾 Ancient structures will throw riddles at you. Solve the puzzle by completing hands that match the target number.',
    '👾 The multi-headed legendary monster will rise again even if struck down. But if you gather four suits in harmony (Typhon Myth), a path to instant defeat might appear.',
    '👾 The King of the Swamp grows larger and stronger over time. You must purify it before the system overloads.',
    '👾 In certain areas, a special existence you can\'t meet through ordinary means might be waiting. Look for a hidden route!',

    // ─── Altar & Skills ────────────────────────────────────────────────
    '🏆 Trophies obtained by purifying bosses can be converted into powerful forces at the Altar.',
    '🏆 The \'Prepper\' skill is an early Altar skill that increases your maximum HP. A great choice if you want to start with high core stability!',
    '🏆 Selecting \'Sharpen Cards\' will add sharp, fixed damage to all your attacks.',
    '🏆 In moments of crisis, \'Phase Transition\' will move you to another dimension, preserving your life and granting you a Joker.',
    '🏆 Use \'Entropy Control\' to completely ignore the visual disturbances and restrictions imposed by bosses. Combat will become much clearer.',
    '🏆 As you repeatedly use the same hand, the \'Overloaded\' skill will amplify your attack power. Ideal for a specialized strategy.',
    '🏆 \'Probability Distortion\', which twists the flow of chance, helps you swap your hand more frequently.',
    '🏆 When a boss\'s core falters, \'Instability Resonance\' won\'t miss the gap and will deal even greater damage.',
    '🏆 As the difficulty increases, the combination of Altar skills becomes the key to victory. Configure your own unique set.',
  ]
};

/**
 * Returns a random tip from the tip list of the current language.
 */
export function getRandomTip(language: Language): string {
  const tips = LOADING_TIPS[language];
  return tips[Math.floor(Math.random() * tips.length)];
}
