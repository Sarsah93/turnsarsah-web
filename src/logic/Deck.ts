// logic/Deck.ts

import { Card, CardFactory } from '../types/Card';
import { SUITS, RANK_VALUES, JOKER_DRAW_PROBABILITY } from '../constants/cards';

export class Deck {
  cards: Card[] = [];
  jokerProbability: number;

  constructor(jokerProbability: number = JOKER_DRAW_PROBABILITY) {
    this.jokerProbability = jokerProbability;
    this.initialize();
  }

  initialize(): void {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of Object.keys(RANK_VALUES)) {
        this.cards.push(CardFactory.create(suit, rank, false));
      }
    }
    this.shuffle();
  }

  draw(count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (Math.random() < this.jokerProbability) {
        drawn.push(CardFactory.create(null, null, true));
      } else if (this.cards.length > 0) {
        drawn.push(this.cards.shift()!);
      } else {
        this.initialize();
        if (this.cards.length > 0) {
          drawn.push(this.cards.shift()!);
        }
      }
    }
    return drawn;
  }

  discard(cards: Card[]): void {
    if (this.cards.length < 10) {
      this.initialize();
    }
  }

  private shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
}
