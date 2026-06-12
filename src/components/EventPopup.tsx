// components/EventPopup.tsx
// 이벤트 스테이지 팝업 — 12종 이벤트 시나리오 UI 및 로직 처리

import React, { useState } from 'react';
import './styles/EventPopup.css';
import { EventId, EventBonuses } from '../constants/eventScenarios';
import { useGameStore } from '../state/gameStore';

interface Props {
  eventId: EventId;
  onClose: () => void;
}

type PopupPhase =
  | 'PROMPT'
  | 'HP_CONSUMED'
  | 'WORKING'
  | 'ALTAR_SACRIFICE'
  | 'MAJOR_CHOOSE'
  | 'ANGRY_BEAST'
  | 'ABSORB_CORE_PROMPT'
  | 'OUTCOME'
  | 'OUTCOME_FAIL_STEP_1'
  | 'DEFEATED';

// ── 유틸: 최대 HP 비례 고정량 차감 ──────────────────────────────────────────
function deductHpPercent(pct: number): void {
  const s = useGameStore.getState();
  const cost = Math.max(1, Math.floor(s.player.maxHp * pct));
  s.setPlayerHp(Math.max(0, s.player.hp - cost));
}

// ── 즉시 HP 고정량 감소 ─────────────────────────────────────────────────────
function deductHpFlat(amount: number): void {
  const s = useGameStore.getState();
  s.setPlayerHp(Math.max(0, s.player.hp - amount));
}

export const EventPopup: React.FC<Props> = ({ eventId, onClose }) => {
  const language = useGameStore((s) => s.language);
  const player = useGameStore((s) => s.player);

  const [phase, setPhase] = useState<PopupPhase>('PROMPT');
  
  // 상태 보존용
  const [outcome, setOutcome] = useState<'success' | 'fail' | 'great' | 'ok' | 'no' | 'success_absorb' | 'fail_absorb' | 'success_crit' | 'success_atk' | ''>('');
  const [sacrificedStatLabel, setSacrificedStatLabel] = useState<string>('');
  const [didFlash, setDidFlash] = useState<boolean>(false);

  // ──────────────────────────────────────────────────────────────────────────
  //  한글 및 영어 텍스트 사전 (시나리오 원문 반영, 텍스트그림 아이콘 제거)
  // ──────────────────────────────────────────────────────────────────────────
  const TEXTS: Record<string, Record<string, any>> = {
    KR: {
      CATEGORIES: {
        CREATURE: "불안정 생명체",
        MERCHANT: "수상한 그림자 행상인",
        NODE: "균열된 노드 잔해",
        ALTAR: "이름 모를 제단"
      },
      CREATURE_SMALL: {
        PROMPT: "작은 동물로 추정되는 개념체를 조우했습니다. 노드화가 진행되고 있는 것으로 추정됩니다. \n코어 안정도를 추출하여 노드화 수복을 도와주시겠습니까? (성공 확률 70%)",
        YES: "예",
        NO: "아니오",
        HP_CONSUMED: "플레이어의 코어 안정도(HP)를 5% 소모하였습니다.",
        SUCCESS: "노드화 연결 구조의 특정 패턴을 학습하였습니다. 영구적으로 데미지가 상승합니다. (+2%)",
        FAIL_TITLE: "노드화 수복에 실패하였습니다.",
        FAIL_DESC: "수복 실패의 반동으로 플레이어 노드의 구조화 영역에 일시적인 손상을 입었습니다. [다음 전투에 한해서 플레이어는 매 턴 종료 시 마다, HP -5 디버프]",
        NO_OUTCOME: "소동물의 노드화가 가속화되어, 소멸하였습니다."
      },
      CREATURE_MEDIUM: {
        PROMPT: "중형 동물로 추정되는 개념체를 조우했습니다. 노드화가 진행되고 있는 것으로 추정됩니다. \n코어 안정도를 추출하여 노드화 수복을 도와주시겠습니까? (성공 확률 60%)",
        YES: "예",
        NO: "아니오",
        HP_CONSUMED: "플레이어의 코어 안정도(HP)를 8% 소모하였습니다.",
        SUCCESS: "노드화 연결 구조의 특정 패턴을 인식하였습니다. 영구적으로 데미지가 상승합니다. (+4%)",
        FAIL: "노드화 수복을 진행하려는 과정 중, 중형 동물이 난동을 부렸습니다. 반동으로 플레이어 노드에 직접적인 손상을 입었습니다. [즉시 플레이어의 현재 코어 안정도 -10 감소]",
        NO_OUTCOME: "중형 동물의 노드화를 무시한 채, 계속 진행합니다."
      },
      CREATURE_LARGE: {
        PROMPT: "대형 동물로 추정되는 개념체를 조우했습니다. 노드화가 진행되고 있는 것으로 추정됩니다. \n코어 안정도를 추출하여 노드화 수복을 도와주시겠습니까? (성공 확률 40%)",
        YES: "예",
        NO: "아니오",
        HP_CONSUMED: "플레이어의 코어 안정도(HP)를 10% 소모하였습니다.",
        SUCCESS: "노드화 연결 구조의 특정 패턴을 인식하였습니다. 영구적으로 데미지가 상승합니다. (+6%)",
        FAIL: "노드화 수복을 진행하려는 과정 중, 대형 동물이 난동을 부렸습니다. 반동으로 플레이어 노드에 직접적으로 치명적인 손상을 입었습니다. [즉시 플레이어의 현재 코어 안정도 -20 감소]",
        ANGRY: "대형 동물이 당신을 노려보며, 공격하려고 합니다. 어떻게 하시겠습니까?",
        FIGHT: "대응한다",
        RUN: "도망간다",
        ABSORB_PROMPT: "대형 동물이 마지막 힘을 다해, 당신을 공격하려 달려들었으나, 지친 나머지 스스로 쓰러져 의식을 잃었습니다. 대형 동물의 코어를 흡수할 수 있을 것 같습니다. \n코어를 흡수하시겠습니까?",
        ABSORB_YES: "예(성공 확률 40%)",
        ABSORB_NO: "아니오",
        ABSORB_SUCCESS: "코어 흡수를 성공했습니다! 최대 코어 안정도가 6% 증가합니다!",
        ABSORB_FAIL: "코어 흡수에 실패했습니다! 최대 코어 안정도가 3% 감소합니다!"
      },
      MERCHANT_CANDY: {
        PROMPT: "어둠 속에서 한 행상인이 나타났습니다. 그는 수상한 과자를 내밀며 말합니다. '코어 안정도 조금만 내놓으면, 달달한 거 하나 줄게요…'",
        YES: "구매한다 (코어 안정도 -5%)",
        NO: "거절한다",
        HP_CONSUMED: "코어 안정도를 5% 소모하여 수상한 과자를 구매하였습니다. 한 입 먹자, 몸이 이상하게 반응합니다…",
        SUCCESS: "과자 속에 포함된 미지의 성분이 날카로운 감각을 일깨웠습니다. 영구적으로 크리티컬 배수가 상승합니다. (+10%)",
        FAIL: "과자의 알수 없는 이물질이 코어 안정도에 손상을 주고 있습니다. 노드 구조에 일시적인 혼란이 발생했습니다. [다음 전투에 한해서 플레이어는 매 턴 종료 시 마다, HP -8 디버프]",
        NO_OUTCOME: "행상인이 과자를 다시 품에 숨기며 어둠 속으로 사라졌습니다."
      },
      MERCHANT_DRINK: {
        PROMPT: "어둠 속에서 한 행상인이 나타났습니다. 그는 연기가 피어오르는 작은 병을 내밀었습니다. '코어 안정도 조금이면 돼요. 마시면 뭔가 달라질 거예요. 좋든 나쁘든.'",
        YES: "구매한다 (코어 안정도 -7.5%)",
        NO: "거절한다",
        HP_CONSUMED: "코어 안정도를 7.5% 소모하여 수상한 음료를 구매하였습니다. 음료를 들이키자, 시야가 잠시 흔들립니다…",
        GREAT: "음료가 코어와 완벽히 융합되었습니다. 회피 반사 신경이 극적으로 강화되었습니다. 영구적으로 회피율이 상승합니다. (+6%)",
        OK: "음료가 일부만 흡수되었습니다. 회피 감각이 약간 강화되었습니다. 영구적으로 회피율이 상승합니다. (+3%)",
        FAIL: "음료가 노드 흐름을 역류 시켰습니다. 코어 안정도가 추가로 유출됩니다. [즉시 플레이어의 현재 코어 안정도 -15 감소]",
        NO_OUTCOME: "행상인이 음료를 다시 품에 넣으며 사라집니다."
      },
      MERCHANT_CUBE: {
        PROMPT: "어둠 속에서 한 행상인이 나타났습니다. 그는 작은 큐브를 꺼냈습니다. ‘코어 안정도를 기부하면 부적 하나 줄게요. 도움이 될 진 모르겠지만.'",
        YES: "구매한다 (코어 안정도 -10%)",
        NO: "거절한다",
        HP_CONSUMED: "코어 안정도를 10% 소모하여 수상한 큐브를 구매하였습니다. 큐브가 손안에서 분해되어 노드 내부로 스며듭니다…",
        SUCCESS: "큐브의 에너지가 코어 한계를 확장시켰습니다. 영구적으로 최대 코어 안정도가 증가합니다. (+10%)",
        FAIL: "큐브의 에너지가 역류하며 코어 한계를 오히려 침식시켰습니다. 영구적으로 최대 코어 안정도가 감소합니다. (-8%)",
        NO_OUTCOME: "행상인이 큐브를 주머니에 넣으며 말합니다. '다음 번에 볼 땐, 다른 물건을 보여줄게요.'"
      },
      NODE_ANALYSIS: {
        PROMPT: "균열이 생긴 노드 잔해를 발견했습니다. 내부 구조를 분석하면 전투 패턴에 대한 통찰을 얻을 수 있을 것 같습니다.",
        YES: "분석한다(성공 확률 65%)",
        NO: "무시한다",
        WORKING: "잔해를 분석합니다. 내부 데이터가 흘러들어 옵니다…",
        SUCCESS: "잔해 속 패턴 데이터가 교체 회로에 통합되었습니다. 영구적으로 카드 교체 횟수가 1회 증가합니다.",
        FAIL: "잔해 내부의 불안정한 데이터가 역류하였습니다. 노드 회로에 과부하가 걸렸습니다. [다음 전투에 한해서 카드 교체 횟수 -1 디버프]",
        NO_OUTCOME: "잔해를 지나쳐 계속 전진합니다."
      },
      NODE_ABSORB: {
        PROMPT: "균열이 생긴 노드 잔해를 발견했습니다. 잔해의 에너지를 직접 흡수하면 코어를 강화할 수 있을 것 같습니다. 하지만 불안정한 에너지라 위험할 수도 있습니다.",
        YES: "흡수한다(성공 확률 50%)",
        NO: "무시한다",
        WORKING: "잔해의 에너지를 흡수합니다. 에너지가 노드 내부로 파고들어 옵니다…",
        SUCCESS: "에너지가 코어 안정도 한계치를 확장시켰습니다. 영구적으로 최대 코어 안정도가 증가합니다. (+8%)",
        FAIL: "불안정한 에너지가 폭발적으로 역류하였습니다. [즉시 플레이어의 현재 코어 안정도 -20 감소]",
        NO_OUTCOME: "잔해를 지나쳐 계속 전진합니다."
      },
      NODE_DESTROY: {
        PROMPT: "균열이 생긴 노드 잔해를 발견했습니다. 잔해를 완전히 파괴하면 그 충격파로 전투 본능이 각성될 수도 있습니다. 하지만 폭발 반동이 돌아올 위험이 있습니다.",
        YES: "파괴한다(성공 확률 55%)",
        NO: "무시한다",
        WORKING: "소모하여 잔해를 파괴합니다. 충격파가 사방으로 퍼져나갑니다…",
        SUCCESS: "충격 여파가 코어를 자극하여 노드 구조가 견고해집니다. 영구적으로 추가 데미지가 상승합니다. (+3%)",
        FAIL: "파괴 충격파의 반동이 예상보다 훨씬 강하게 돌아왔습니다. 영구적으로 데미지가 감소합니다. (-3%)",
        NO_OUTCOME: "잔해를 지나쳐 계속 전진합니다."
      },
      ALTAR_MINOR: {
        PROMPT: "알 수 없는 제단을 발견했습니다. 제단에는 '작은 것을 바치면, 작은 것을 얻으리라'는 문구가 새겨져 있습니다.",
        YES: "소제물을 바친다 (추가 데미지 -3%/카드당 크리티컬 확률 -3%/코어 안정도 -3%/회피율 -3%)",
        NO: "무시한다",
        SACRIFICE: "{stat}를 3% 소모하여 바칩니다. 제단이 희미하게 반응합니다…",
        SUCCESS_CRIT: "제단이 노드 구조를 선명하게 볼 수 있는 능력을 부여했습니다. 영구적으로 카드당 크리티컬 확률이 상승합니다. (+3%)",
        SUCCESS_ATK: "제단이 코어에 대한 이해도를 증가시켰습니다. 영구적으로 추가 데미지가 상승합니다. (+3%)",
        FAIL: "제단이 아무런 반응을 보이지 않습니다. {stat}만 소모되었습니다.",
        NO_OUTCOME: "제단을 지나쳐 계속 전진합니다.",
        STATS: {
          percentAtkBonus: "추가 데미지",
          critChanceBonus: "카드당 크리티컬 확률",
          maxHpBonusPercent: "코어 안정도",
          evasionBonus: "회피율"
        }
      },
      ALTAR_MAJOR: {
        PROMPT: "알 수 없는 제단을 발견했습니다. 제단에는 '큰 것을 바치면, 큰 것을 얻으리라. 혹은 잃으리라'는 문구가 새겨져 있습니다.",
        YES: "대제물을 바친다 (성공 확률 50%)",
        NO: "무시한다",
        CHOOSE_PROMPT: "어떤 것을 대제물로 바치겠습니까?",
        OPT_ATK: "데미지 감소 10%",
        OPT_HP: "최대 코어 안정도 감소 10%",
        SUCCESS: "제단이 당신의 헌신을 받아들였습니다. 코어의 모든 능력이 각성됩니다. 영구적으로 최대 코어 안정도 +10%, 추가 데미지 +5%, 크리티컬 배수 +0.15배가 동시에 상승합니다.",
        FAIL: "제단이 당신의 코어를 탐식합니다. 영구적으로 최대 코어 안정도 -10%, 추가 데미지 -5%, 회피율 -3%가 동시에 감소합니다.",
        NO_OUTCOME: "제단을 뒤로하고 계속 전진합니다."
      },
      ALTAR_BLOOD: {
        PROMPT: "알 수 없는 제단을 발견했습니다. 제단에는 '피를 바라는 자, 찰나를 각오하라'는 문구가 새겨져 있습니다. 무언가 심상치 않은 기운이 느껴집니다.",
        YES: "손을 갖다 댄다(성공 확률 40%)",
        NO: "무시한다",
        HP_CONSUMED: "문구에 손을 갖다 대었더니, 제단이 붉게 빛납니다…",
        SUCCESS: "제단이 코어 중심부에 피의 각오를 새겼습니다. [추가 데미지 +25%, 받는 데미지 +25%] 추가 데미지+25%, 방어력 감소 -25% 동시 상승합니다.",
        FAIL_1: "문구에 손을 갖다 대었더니, 제단이 붉게 빛나더니, 일 순간 빛이 사라집니다…",
        FAIL_2: "아무 일도 일어나지 않았습니다.",
        NO_OUTCOME: "제단을 뒤로한 채 계속 전진합니다."
      },
      BUTTONS: {
        NEXT: "다음",
        CONFIRM: "확인",
        RESTART: "처음으로 돌아가기"
      }
    },
    EN: {
      CATEGORIES: {
        CREATURE: "Unstable Creature",
        MERCHANT: "Shady Merchant",
        NODE: "Cracked Node Debris",
        ALTAR: "Unknown Altar"
      },
      CREATURE_SMALL: {
        PROMPT: "You encountered a conceptual entity resembling a small animal. Node-ification seems to be in progress. \nWould you like to extract your core stability to assist with node restoration? (Success rate 70%)",
        YES: "Yes",
        NO: "No",
        HP_CONSUMED: "Consumed 5% of the player's core stability (HP).",
        SUCCESS: "Learned a specific pattern of the node connection structure. Damage permanently increases. (+2%)",
        FAIL_TITLE: "Failed to restore the node.",
        FAIL_DESC: "Due to the backlash of the failed restoration, temporary damage was dealt to the structured area of the player node. [For the next battle only, player suffers an HP -5 debuff at the end of every turn]",
        NO_OUTCOME: "The node-ification of the small animal accelerated, causing it to perish."
      },
      CREATURE_MEDIUM: {
        PROMPT: "You encountered a conceptual entity resembling a medium animal. Node-ification seems to be in progress. \nWould you like to extract your core stability to assist with node restoration? (Success rate 60%)",
        YES: "Yes",
        NO: "No",
        HP_CONSUMED: "Consumed 8% of the player's core stability (HP).",
        SUCCESS: "Recognized a specific pattern of the node connection structure. Damage permanently increases. (+4%)",
        FAIL: "During the restoration process, the medium animal went wild. The backlash caused direct damage to the player node. [Immediately reduces current core stability by -10]",
        NO_OUTCOME: "Ignoring the node-ification of the medium animal, you proceed further."
      },
      CREATURE_LARGE: {
        PROMPT: "You encountered a conceptual entity resembling a large animal. Node-ification seems to be in progress. \nWould you like to extract your core stability to assist with node restoration? (Success rate 40%)",
        YES: "Yes",
        NO: "No",
        HP_CONSUMED: "Consumed 10% of the player's core stability (HP).",
        SUCCESS: "Recognized a specific pattern of the node connection structure. Damage permanently increases. (+6%)",
        FAIL: "During the restoration process, the large animal went wild. The backlash caused direct fatal damage to the player node. [Immediately reduces current core stability by -20]",
        ANGRY: "The large animal glares at you, preparing to attack. What will you do?",
        FIGHT: "Fight back",
        RUN: "Run away",
        ABSORB_PROMPT: "The large animal lunged at you with the last of its strength, but collapsed and lost consciousness. It seems you can absorb its core. \nWould you like to absorb the core?",
        ABSORB_YES: "Yes (Success Rate 40%)",
        ABSORB_NO: "No",
        ABSORB_SUCCESS: "Core absorption successful! Max core stability increases by 6%!",
        ABSORB_FAIL: "Failed to absorb the core! Max core stability decreases by 3%!"
      },
      MERCHANT_CANDY: {
        PROMPT: "A merchant appeared from the darkness. Handing over a suspicious candy, he says, 'Give me a little core stability, and I will give you something sweet...'",
        YES: "Purchase (Core Stability -5%)",
        NO: "Decline",
        HP_CONSUMED: "Spent 5% core stability to buy the suspicious candy. Taking a bite, your body reacts strangely...",
        SUCCESS: "An unknown ingredient in the candy awakened your sharp senses. Critical multiplier permanently increases. (+10%)",
        FAIL: "An unknown substance in the candy is damaging your core stability. Temporary chaos occurs in the node structure. [For the next battle only, player suffers an HP -8 debuff at the end of every turn]",
        NO_OUTCOME: "The merchant hid the candy back in his cloak and disappeared into the darkness."
      },
      MERCHANT_DRINK: {
        PROMPT: "A merchant appeared from the darkness. He held out a smoking small vial. 'Just a little core stability. If you drink it, something will change. For better or worse.'",
        YES: "Purchase (Core Stability -7.5%)",
        NO: "Decline",
        HP_CONSUMED: "Spent 7.5% core stability to buy the suspicious drink. Swallowing it down, your vision shakes for a moment...",
        GREAT: "The drink fused perfectly with your core. Evasion reflexes have been dramatically enhanced. Evasion rate permanently increases. (+6%)",
        OK: "The drink was only partially absorbed. Evasion senses have been slightly enhanced. Evasion rate permanently increases. (+3%)",
        FAIL: "The drink caused the node flow to backfire. Additional core stability leaks out. [Immediately reduces current core stability by -15]",
        NO_OUTCOME: "The merchant put the drink back and vanished."
      },
      MERCHANT_CUBE: {
        PROMPT: "A merchant appeared from the darkness. Holding a small cube, he says, 'Donate some core stability, and I'll give you a charm. Not sure if it helps, though.'",
        YES: "Purchase (Core Stability -10%)",
        NO: "Decline",
        HP_CONSUMED: "Spent 10% core stability to buy the suspicious cube. The cube dismantles in your hands and seeps into the node...",
        SUCCESS: "The cube's energy expanded your core limits. Maximum core stability permanently increases. (+10%)",
        FAIL: "The cube's energy backfired, eroding your core limits instead. Maximum core stability permanently decreases. (-8%)",
        NO_OUTCOME: "The merchant put the cube in his pocket and said, 'Next time I see you, I will show you something else.'"
      },
      NODE_ANALYSIS: {
        PROMPT: "Discovered cracked node debris. Analyzing its internal structure seems likely to grant insight into combat patterns.",
        YES: "Analyze (Success Rate 65%)",
        NO: "Ignore",
        WORKING: "Analyzing the debris. Internal data is flowing in...",
        SUCCESS: "The pattern data within the debris has been integrated into the swap circuit. Card swap count permanently increases by 1.",
        FAIL: "Unstable data within the debris backfired. The node circuit is overloaded. [For the next battle only, card swap count suffers a -1 debuff]",
        NO_OUTCOME: "You bypass the debris and continue forward."
      },
      NODE_ABSORB: {
        PROMPT: "Discovered cracked node debris. Direct absorption of its energy might strengthen your core, but unstable energy could be dangerous.",
        YES: "Absorb (Success Rate 50%)",
        NO: "Ignore",
        WORKING: "Absorbing the debris energy. Energy penetrates deep into the node...",
        SUCCESS: "The energy expanded your core stability limits. Maximum core stability permanently increases. (+8%)",
        FAIL: "Unstable energy backfired explosively. [Immediately reduces current core stability by -20]",
        NO_OUTCOME: "You bypass the debris and continue forward."
      },
      NODE_DESTROY: {
        PROMPT: "Discovered cracked node debris. Completely destroying it might awaken combat instincts with its shockwave, but carries a risk of explosion backlash.",
        YES: "Destroy (Success Rate 55%)",
        NO: "Ignore",
        WORKING: "Destroying the debris. Shockwaves scatter in all directions...",
        SUCCESS: "The shockwave stimulated the core, hardening the node structure. Damage permanently increases. (+3%)",
        FAIL: "The backlash of the destruction shockwave was much stronger than expected. Damage permanently decreases. (-3%)",
        NO_OUTCOME: "You bypass the debris and continue forward."
      },
      ALTAR_MINOR: {
        PROMPT: "Discovered an unknown altar. It is carved with the words: 'Offer small, gain small.'",
        YES: "Offer Minor Sacrifice (Damage -3%/Crit Chance -3%/Core Stability -3%/Evasion -3%)",
        NO: "Ignore",
        SACRIFICE: "Sacrificing 3% of {stat}. The altar reacts faintly...",
        SUCCESS_CRIT: "The altar granted the ability to clearly visualize node structures. Critical chance per card permanently increases. (+3%)",
        SUCCESS_ATK: "The altar increased your understanding of the core. Damage permanently increases. (+3%)",
        FAIL: "The altar remains silent. Only {stat} has been consumed.",
        NO_OUTCOME: "You bypass the altar and continue forward.",
        STATS: {
          percentAtkBonus: "Damage",
          critChanceBonus: "Crit Chance",
          maxHpBonusPercent: "Core Stability",
          evasionBonus: "Evasion"
        }
      },
      ALTAR_MAJOR: {
        PROMPT: "Discovered an unknown altar. It is carved with the words: 'Offer big, gain big. Or lose.'",
        YES: "Offer Major Sacrifice (Success Rate 50%)",
        NO: "Ignore",
        CHOOSE_PROMPT: "What will you offer as a major sacrifice?",
        OPT_ATK: "Reduce Damage by 10%",
        OPT_HP: "Reduce Max Core Stability by 10%",
        SUCCESS: "The altar accepted your devotion. All abilities of your core awaken. Maximum core stability +10%, damage +5%, and critical multiplier +0.15 permanently increase simultaneously.",
        FAIL: "The altar devours your core. Maximum core stability -10%, damage -5%, and evasion rate -3% permanently decrease simultaneously.",
        NO_OUTCOME: "Leaving the altar behind, you continue forward."
      },
      ALTAR_BLOOD: {
        PROMPT: "Discovered an unknown altar. It is carved with the words: 'He who craves blood, prepare for the transient moment.' An ominous aura is felt.",
        YES: "Place your hand (Success Rate 40%)",
        NO: "Ignore",
        HP_CONSUMED: "Placing your hand on the carving, the altar glows blood red...",
        SUCCESS: "The altar engraved a bloody resolution into your core center. [Damage +25%, Damage Taken +25%] Damage +25% and Defense -25% increase simultaneously.",
        FAIL_1: "Placing your hand on the carving, the altar glows red, then the light vanishes in an instant...",
        FAIL_2: "Nothing happened.",
        NO_OUTCOME: "Leaving the altar behind, you continue forward."
      },
      BUTTONS: {
        NEXT: "NEXT",
        CONFIRM: "CONFIRM",
        RESTART: "BACK TO MAIN MENU"
      }
    }
  };

  const currentTexts = TEXTS[language] || TEXTS.KR;
  const tBtn = currentTexts.BUTTONS;

  // ── 카테고리 텍스트 ────────────────────────────────────────────────────────
  const categoryLabel = (() => {
    const cats = currentTexts.CATEGORIES;
    if (eventId.startsWith('CREATURE')) return cats.CREATURE;
    if (eventId.startsWith('MERCHANT')) return cats.MERCHANT;
    if (eventId.startsWith('NODE'))     return cats.NODE;
    if (eventId.startsWith('ALTAR'))    return cats.ALTAR;
    return '';
  })();

  // ──────────────────────────────────────────────────────────────────────────
  //  이벤트 액션 처리들
  // ──────────────────────────────────────────────────────────────────────────

  // 1. 초기 PROMPT에서 '예' 혹은 '구매/분석/흡수/바치기' 클릭 시
  const handleYes = () => {
    if (eventId === 'CREATURE_SMALL') {
      deductHpPercent(0.05);
      setOutcome('');
      setPhase('HP_CONSUMED');
    }
    else if (eventId === 'CREATURE_MEDIUM') {
      deductHpPercent(0.08);
      setOutcome('');
      setPhase('HP_CONSUMED');
    }
    else if (eventId === 'CREATURE_LARGE') {
      deductHpPercent(0.10);
      setOutcome('');
      setPhase('HP_CONSUMED');
    }
    else if (eventId === 'MERCHANT_CANDY') {
      deductHpPercent(0.05);
      setOutcome('');
      setPhase('HP_CONSUMED');
    }
    else if (eventId === 'MERCHANT_DRINK') {
      deductHpPercent(0.075);
      setOutcome('');
      setPhase('HP_CONSUMED');
    }
    else if (eventId === 'MERCHANT_CUBE') {
      deductHpPercent(0.10);
      setOutcome('');
      setPhase('HP_CONSUMED');
    }
    else if (eventId === 'NODE_ANALYSIS') {
      setPhase('WORKING');
    }
    else if (eventId === 'NODE_ABSORB') {
      setPhase('WORKING');
    }
    else if (eventId === 'NODE_DESTROY') {
      setPhase('WORKING');
    }
    else if (eventId === 'ALTAR_MINOR') {
      // 랜덤 스탯 -3% 선정
      const stats = ['percentAtkBonus', 'critChanceBonus', 'maxHpBonusPercent', 'evasionBonus'] as const;
      const chosen = stats[Math.floor(Math.random() * stats.length)];
      const store = useGameStore.getState();
      
      // 스탯 감소 적용
      store.applyEventBonuses({ [chosen]: -0.03 });
      
      const label = currentTexts.ALTAR_MINOR.STATS[chosen];
      setSacrificedStatLabel(label);
      setPhase('ALTAR_SACRIFICE');
    }
    else if (eventId === 'ALTAR_MAJOR') {
      setPhase('MAJOR_CHOOSE');
    }
    else if (eventId === 'ALTAR_BLOOD') {
      deductHpPercent(0.15);
      setOutcome('');
      setPhase('HP_CONSUMED');
    }
  };

  // 2. 초기 PROMPT에서 '아니오' / '거절/무시' 클릭 시
  const handleNo = () => {
    if (eventId === 'CREATURE_LARGE') {
      // 대형 동물 아니오 분기
      setPhase('ANGRY_BEAST');
    } else {
      setOutcome('no');
      setPhase('OUTCOME');
    }
  };

  // 3. HP_CONSUMED 단계에서 '확인' 누를 때의 로직 계산
  const handleHpConsumedConfirm = () => {
    const store = useGameStore.getState();

    if (eventId === 'CREATURE_SMALL') {
      const success = Math.random() < 0.70;
      if (success) {
        store.applyEventBonuses({ percentAtkBonus: 0.02 });
        setOutcome('success');
      } else {
        store.setPendingBattleDebuffs({ hpDrainPerTurn: 5, sourceLabel: categoryLabel });
        setOutcome('fail');
      }
      setPhase('OUTCOME');
    }
    else if (eventId === 'CREATURE_MEDIUM') {
      const success = Math.random() < 0.60;
      if (success) {
        store.applyEventBonuses({ percentAtkBonus: 0.04 });
        setOutcome('success');
      } else {
        deductHpFlat(10);
        setDidFlash(true);
        setOutcome('fail');
      }
      setPhase('OUTCOME');
    }
    else if (eventId === 'CREATURE_LARGE') {
      const success = Math.random() < 0.40;
      if (success) {
        store.applyEventBonuses({ percentAtkBonus: 0.06 });
        setOutcome('success');
      } else {
        deductHpFlat(20);
        setDidFlash(true);
        setOutcome('fail');
      }
      setPhase('OUTCOME');
    }
    else if (eventId === 'MERCHANT_CANDY') {
      const success = Math.random() < 0.50;
      if (success) {
        store.applyEventBonuses({ critMultBonus: 0.10 });
        setOutcome('success');
      } else {
        store.setPendingBattleDebuffs({ hpDrainPerTurn: 8, sourceLabel: categoryLabel });
        setOutcome('fail');
      }
      setPhase('OUTCOME');
    }
    else if (eventId === 'MERCHANT_DRINK') {
      const roll = Math.random();
      if (roll < 0.40) {
        store.applyEventBonuses({ evasionBonus: 0.06 });
        setOutcome('great');
      } else if (roll < 0.70) {
        store.applyEventBonuses({ evasionBonus: 0.03 });
        setOutcome('ok');
      } else {
        deductHpFlat(15);
        setDidFlash(true);
        setOutcome('fail');
      }
      setPhase('OUTCOME');
    }
    else if (eventId === 'MERCHANT_CUBE') {
      const success = Math.random() < 0.45;
      if (success) {
        store.applyEventBonuses({ maxHpBonusPercent: 0.10 });
        setOutcome('success');
      } else {
        store.applyEventBonuses({ maxHpBonusPercent: -0.08 });
        // 새 최대치에 따라 HP 보정
        const hpDelta = Math.floor((player.baseMaxHp || player.maxHp || 200) * -0.08);
        const newMaxHp = Math.max(1, player.maxHp + hpDelta);
        const newHp = Math.max(0, Math.min(player.hp, newMaxHp));
        store.setPlayerHp(newHp);

        setOutcome('fail');
      }
      setPhase('OUTCOME');
    }
    else if (eventId === 'ALTAR_BLOOD') {
      const success = Math.random() < 0.40;
      if (success) {
        store.applyEventBonuses({ percentAtkBonus: 0.25, damageTakenPercent: 0.25 });
        setOutcome('success');
        setPhase('OUTCOME');
      } else {
        setPhase('OUTCOME_FAIL_STEP_1');
      }
    }
  };

  // 4. WORKING 단계에서 '다음' 누를 때
  const handleWorkingNext = () => {
    const store = useGameStore.getState();

    if (eventId === 'NODE_ANALYSIS') {
      const success = Math.random() < 0.65;
      if (success) {
        store.applyEventBonuses({ swapCountBonus: 1 });
        setOutcome('success');
      } else {
        store.setPendingBattleDebuffs({ swapCountPenalty: -1, sourceLabel: categoryLabel });
        setOutcome('fail');
      }
      setPhase('OUTCOME');
    }
    else if (eventId === 'NODE_ABSORB') {
      const success = Math.random() < 0.50;
      if (success) {
        store.applyEventBonuses({ maxHpBonusPercent: 0.08 });
        setOutcome('success');
      } else {
        deductHpFlat(20);
        setDidFlash(true);
        setOutcome('fail');
      }
      setPhase('OUTCOME');
    }
    else if (eventId === 'NODE_DESTROY') {
      const success = Math.random() < 0.55;
      if (success) {
        store.applyEventBonuses({ percentAtkBonus: 0.03 });
        setOutcome('success');
      } else {
        store.applyEventBonuses({ percentAtkBonus: -0.03 });
        setOutcome('fail');
      }
      setPhase('OUTCOME');
    }
  };

  // 5. ALTAR_SACRIFICE 단계에서 '다음' 누를 때
  const handleAltarSacrificeNext = () => {
    const store = useGameStore.getState();
    const roll = Math.random();
    if (roll < 0.33) {
      store.applyEventBonuses({ critChanceBonus: 0.03 });
      setOutcome('success_crit');
    } else if (roll < 0.66) {
      store.applyEventBonuses({ percentAtkBonus: 0.03 });
      setOutcome('success_atk');
    } else {
      setOutcome('fail');
    }
    setPhase('OUTCOME');
  };

  // 6. 대제물 선택
  const handleAltarMajorChoose = (type: 'ATK' | 'HP') => {
    const store = useGameStore.getState();

    if (type === 'ATK') {
      store.applyEventBonuses({ percentAtkBonus: -0.10 });
    } else {
      store.applyEventBonuses({ maxHpBonusPercent: -0.10 });
      // 새 최대치 보정
      const hpDelta = Math.floor((player.baseMaxHp || player.maxHp || 200) * -0.10);
      const newMaxHp = Math.max(1, player.maxHp + hpDelta);
      const newHp = Math.max(0, Math.min(player.hp, newMaxHp));
      store.setPlayerHp(newHp);
    }

    const success = Math.random() < 0.50;
    if (success) {
      store.applyEventBonuses({
        maxHpBonusPercent: 0.10,
        percentAtkBonus: 0.05,
        critMultBonus: 0.15
      });
      setOutcome('success');
    } else {
      store.applyEventBonuses({
        maxHpBonusPercent: -0.10,
        percentAtkBonus: -0.05,
        evasionBonus: -0.03
      });
      // 최대 HP 추가 하락 보정
      const hpDelta = Math.floor((player.baseMaxHp || player.maxHp || 200) * -0.10);
      const newMaxHp = Math.max(1, player.maxHp + hpDelta);
      const newHp = Math.max(0, Math.min(player.hp, newMaxHp));
      store.setPlayerHp(newHp);

      setOutcome('fail');
    }
    setPhase('OUTCOME');
  };

  // 7. 대형 동물 대응 / 도망
  const handleBeastAngryChoice = (choice: 'FIGHT' | 'RUN') => {
    if (choice === 'RUN') {
      onClose();
    } else {
      setPhase('ABSORB_CORE_PROMPT');
    }
  };

  // 8. 대형 동물 코어 흡수 결정
  const handleBeastAbsorbChoice = (decision: 'YES' | 'NO') => {
    if (decision === 'NO') {
      onClose();
    } else {
      const store = useGameStore.getState();
      const success = Math.random() < 0.40;
      if (success) {
        store.applyEventBonuses({ maxHpBonusPercent: 0.06 });
        setOutcome('success_absorb');
      } else {
        store.applyEventBonuses({ maxHpBonusPercent: -0.03 });
        // 새 최대치 보정
        const hpDelta = Math.floor((player.baseMaxHp || player.maxHp || 200) * -0.03);
        const newMaxHp = Math.max(1, player.maxHp + hpDelta);
        const newHp = Math.max(0, Math.min(player.hp, newMaxHp));
        store.setPlayerHp(newHp);

        setOutcome('fail_absorb');
      }
      setPhase('OUTCOME');
    }
  };

  // 9. 최종 결과 팝업 확인 클릭 시 (패배 체크)
  const handleFinalConfirm = () => {
    const store = useGameStore.getState();
    if (store.player.hp <= 0) {
      setPhase('DEFEATED');
    } else {
      onClose();
    }
  };

  // 10. 패배 처음으로 돌아가기 클릭
  const handleRestart = async () => {
    const { AltarManager } = await import('../utils/AltarManager');
    AltarManager.commitPendingTrophies();
    useGameStore.getState().resetGame();
    window.scrollTo(0, 0);
    window.location.reload();
  };

  // ──────────────────────────────────────────────────────────────────────────
  //  렌더링
  // ──────────────────────────────────────────────────────────────────────────

  // 패배 화면 전면 dimming
  if (phase === 'DEFEATED') {
    return (
      <div className="event-defeat-overlay">
        <div className="event-defeat-box">
          <div className="event-defeat-title">패배...</div>
          <button className="event-defeat-btn" onClick={handleRestart}>
            {tBtn.RESTART}
          </button>
        </div>
      </div>
    );
  }

  // 각 Phase별 내용 빌드
  const renderContent = () => {
    const c = currentTexts[eventId];
    if (!c) return null;

    switch (phase) {
      case 'PROMPT':
        return (
          <>
            <p className="event-popup-text">{c.PROMPT}</p>
            <div className="event-popup-buttons">
              <button className="event-popup-btn yes" onClick={handleYes}>
                {c.YES}
              </button>
              <button className="event-popup-btn no" onClick={handleNo}>
                {c.NO}
              </button>
            </div>
          </>
        );

      case 'HP_CONSUMED':
        return (
          <>
            <p className="event-popup-text">{c.HP_CONSUMED}</p>
            <div className="event-popup-divider" />
            <div className="event-popup-buttons">
              <button className="event-popup-btn confirm" onClick={handleHpConsumedConfirm}>
                {tBtn.CONFIRM}
              </button>
            </div>
          </>
        );

      case 'WORKING':
        return (
          <>
            <p className="event-popup-text">{c.WORKING}</p>
            <div className="event-popup-divider" />
            <div className="event-popup-buttons">
              <button className="event-popup-btn confirm" onClick={handleWorkingNext}>
                {tBtn.NEXT}
              </button>
            </div>
          </>
        );

      case 'ALTAR_SACRIFICE':
        return (
          <>
            <p className="event-popup-text">
              {c.SACRIFICE.replace('{stat}', sacrificedStatLabel)}
            </p>
            <div className="event-popup-divider" />
            <div className="event-popup-buttons">
              <button className="event-popup-btn confirm" onClick={handleAltarSacrificeNext}>
                {tBtn.NEXT}
              </button>
            </div>
          </>
        );

      case 'MAJOR_CHOOSE':
        return (
          <>
            <p className="event-popup-text" style={{ fontSize: '1.9rem', marginBottom: 16 }}>
              {c.CHOOSE_PROMPT}
            </p>
            <div className="event-popup-buttons" style={{ flexDirection: 'column', gap: 12 }}>
              <button className="event-popup-btn option" onClick={() => handleAltarMajorChoose('ATK')}>
                {c.OPT_ATK}
              </button>
              <button className="event-popup-btn option" onClick={() => handleAltarMajorChoose('HP')}>
                {c.OPT_HP}
              </button>
            </div>
          </>
        );

      case 'ANGRY_BEAST':
        return (
          <>
            <p className="event-popup-text">{c.ANGRY}</p>
            <div className="event-popup-buttons">
              <button className="event-popup-btn yes" onClick={() => handleBeastAngryChoice('FIGHT')}>
                {c.FIGHT}
              </button>
              <button className="event-popup-btn no" onClick={() => handleBeastAngryChoice('RUN')}>
                {c.RUN}
              </button>
            </div>
          </>
        );

      case 'ABSORB_CORE_PROMPT':
        return (
          <>
            <p className="event-popup-text">{c.ABSORB_PROMPT}</p>
            <div className="event-popup-buttons">
              <button className="event-popup-btn yes" onClick={() => handleBeastAbsorbChoice('YES')}>
                {c.ABSORB_YES}
              </button>
              <button className="event-popup-btn no" onClick={() => handleBeastAbsorbChoice('NO')}>
                {c.ABSORB_NO}
              </button>
            </div>
          </>
        );

      case 'OUTCOME_FAIL_STEP_1':
        return (
          <>
            <p className="event-popup-text">{c.FAIL_1}</p>
            <div className="event-popup-divider" />
            <div className="event-popup-buttons">
              <button className="event-popup-btn confirm" onClick={() => {
                setOutcome('fail');
                setPhase('OUTCOME');
              }}>
                {tBtn.NEXT}
              </button>
            </div>
          </>
        );

      case 'OUTCOME':
        let outcomeText = "";
        let styleClass = "neutral";

        if (outcome === 'success') {
          outcomeText = c.SUCCESS;
          styleClass = "success";
        } else if (outcome === 'success_absorb') {
          outcomeText = c.ABSORB_SUCCESS;
          styleClass = "success";
        } else if (outcome === 'fail_absorb') {
          outcomeText = c.ABSORB_FAIL;
          styleClass = "fail";
        } else if (outcome === 'great') {
          outcomeText = c.GREAT;
          styleClass = "success";
        } else if (outcome === 'ok') {
          outcomeText = c.OK;
          styleClass = "success";
        } else if (outcome === 'fail') {
          // 소동물 & 소제물 & 피의봉헌 실패 텍스트 분기
          if (eventId === 'CREATURE_SMALL') {
            outcomeText = `${c.FAIL_TITLE}\n${c.FAIL_DESC}`;
          } else if (eventId === 'ALTAR_MINOR') {
            outcomeText = c.FAIL.replace('{stat}', sacrificedStatLabel);
          } else if (eventId === 'ALTAR_BLOOD') {
            outcomeText = c.FAIL_2;
          } else {
            outcomeText = c.FAIL;
          }
          styleClass = "fail";
        } else if (outcome === 'no') {
          outcomeText = c.NO_OUTCOME;
          styleClass = "neutral";
        } else if (outcome === 'success_crit') {
          outcomeText = c.SUCCESS_CRIT;
          styleClass = "success";
        } else if (outcome === 'success_atk') {
          outcomeText = c.SUCCESS_ATK;
          styleClass = "success";
        }

        return (
          <>
            <div className={`event-popup-result ${styleClass}`}>
              {outcomeText}
            </div>
            <div className="event-popup-buttons">
              <button className="event-popup-btn confirm" onClick={handleFinalConfirm}>
                {tBtn.CONFIRM}
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`event-popup-overlay ${didFlash ? 'event-popup-hp-flash' : ''}`}>
      <div className="event-popup-box">
        <div className="event-popup-category">{categoryLabel}</div>
        {renderContent()}
      </div>
    </div>
  );
};
