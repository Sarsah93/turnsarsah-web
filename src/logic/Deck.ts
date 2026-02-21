// logic/Deck.ts

import { Card, CardFactory } from '../types/Card';
import { SUITS, RANK_VALUES, JOKER_DRAW_PROBABILITY } from '../constants/cards';

export class Deck {
  cards: Card[] = [];
  jokerProbability: number;
  // v2.1.0: Pity/Anti-clump tracking
  consecutiveJokers = 0;
  consecutiveRoyals = 0;

  constructor(jokerProbability: number = JOKER_DRAW_PROBABILITY) {
    this.jokerProbability = jokerProbability;
    this.initialize();
  }

  // v2.1.0: accept heldCards to prevent duplicates
  initialize(heldCards: (Card | null)[] = []): void {
    this.cards = [];

    // Get set of held card identifiers (Rank+Suit)
    const heldKeys = new Set(
      heldCards
        .filter((c): c is Card => c !== null && !c.isJoker)
        .map(c => `${c.rank}-${c.suit}`)
    );

    for (const suit of SUITS) {
      for (const rank of Object.keys(RANK_VALUES)) {
        if (!heldKeys.has(`${rank}-${suit}`)) {
          this.cards.push(CardFactory.create(suit, rank, false));
        }
      }
    }
    this.shuffle();
  }

  draw(count: number, heldCards: (Card | null)[] = []): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      // Anti-clumping for Jokers
      let effectiveJokerProb = this.jokerProbability;
      if (this.consecutiveJokers >= 2) effectiveJokerProb *= 0.1; // Drastically reduce if already got 2

      const isJoker = Math.random() < effectiveJokerProb;

      if (isJoker) {
        drawn.push(CardFactory.create(null, null, true));
        this.consecutiveJokers++;
        this.consecutiveRoyals = 0;
      } else {
        this.consecutiveJokers = 0;

        if (this.cards.length === 0) {
          this.initialize(heldCards);
        }

        if (this.cards.length > 0) {
          const card = this.cards.shift()!;

          // Anti-clumping for Royals (JQK)
          const isRoyal = ['J', 'Q', 'K'].includes(card.rank || '');
          if (isRoyal) {
            if (this.consecutiveRoyals >= 3) {
              // If too many royals, swap with a lower card if available
              const lowerIdx = this.cards.findIndex(c => !['J', 'Q', 'K', 'A'].includes(c.rank || ''));
              if (lowerIdx !== -1) {
                const [lowerCard] = this.cards.splice(lowerIdx, 1);
                this.cards.push(card); // Put royal back
                drawn.push(lowerCard);
                this.consecutiveRoyals = 0;
                continue;
              }
            }
            this.consecutiveRoyals++;
          } else {
            this.consecutiveRoyals = 0;
          }

          drawn.push(card);
        }
      }
    }
    return drawn;
  }

  discard(cards: Card[]): void {
    // Logic for discarding if needed
  }

  private shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
}
