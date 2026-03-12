// types/Card.ts

export interface Card {
  id: string;
  suit: string | null;
  rank: string | null;
  isJoker: boolean;
  selected: boolean;
  isBlind: boolean;
  isBanned: boolean;
  isMudded: boolean;
  mudDuration: number;
}

export interface CardJSON {
  id: string;
  suit: string | null;
  rank: string | null;
  is_joker: boolean;
  is_blind: boolean;
  is_banned: boolean;
  is_mudded: boolean;
  mud_duration: number;
}

export class CardFactory {
  static create(suit: string | null, rank: string | null, isJoker = false): Card {
    return {
      id: Math.random().toString(36).substring(2, 11),
      suit,
      rank,
      isJoker,
      selected: false,
      isBlind: false,
      isBanned: false,
      isMudded: false,
      mudDuration: 0,
    };
  }

  static toJSON(card: Card): CardJSON {
    return {
      id: card.id,
      suit: card.suit,
      rank: card.rank,
      is_joker: card.isJoker,
      is_blind: card.isBlind,
      is_banned: card.isBanned,
      is_mudded: card.isMudded,
      mud_duration: card.mudDuration,
    };
  }

  static fromJSON(data: CardJSON): Card {
    return {
      id: data.id,
      suit: data.suit,
      rank: data.rank,
      isJoker: data.is_joker,
      isBlind: data.is_blind,
      isBanned: data.is_banned,
      isMudded: data.is_mudded,
      mudDuration: data.mud_duration,
      selected: false,
    };
  }

  static getDisplayName(card: Card): string {
    if (card.isJoker) return 'JOKER';
    if (card.isBlind) return '?';
    return `${card.rank} ${card.suit?.[0]}`;
  }
}
