// constants/cards.ts

export const SUITS = ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'];

export const RANK_VALUES: Record<string, number> = {
  'A': 14,
  'K': 13,
  'Q': 12,
  'J': 11,
  '10': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2,
};

export const CARD_WIDTH = 75;
export const CARD_HEIGHT = 105;
export const CARD_SPACING = 12;

// Poker Hand Bonuses
export const HAND_BONUSES = {
  'ROYAL_FLUSH': 300,
  'STRAIGHT_FLUSH': 175,
  'FOUR_OF_A_KIND': 150,
  'FULL_HOUSE': 125,
  'FLUSH': 100,
  'STRAIGHT': 75,
  'THREE_OF_A_KIND': 50,
  'TWO_PAIR': 20,
  'ONE_PAIR': 10,
  'HIGH_CARD': 0,
};

export const JOKER_DRAW_PROBABILITY = 0.05; // 5%
