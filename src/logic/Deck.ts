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

  draw(count: number, heldCards: (Card | null)[] = [], options?: { majoritySuit?: string | null, forceSameRank?: boolean }): Card[] {
    const drawn: Card[] = [];

    // 6B-2: Calculation Stabilization (40% chance of same rank for 2+ cards)
    let forcedRankIdx: number | null = null;
    let targetRank: string | null = null;

    if (count >= 2 && options?.forceSameRank && Math.random() < 0.40) {
      // Pick two random positions to share a rank
      const idx1 = Math.floor(Math.random() * count);
      let idx2 = Math.floor(Math.random() * count);
      while (idx1 === idx2) idx2 = Math.floor(Math.random() * count);
      forcedRankIdx = idx2; // We'll set the rank after drawing the first card at idx1
    }

    for (let i = 0; i < count; i++) {
      // 6A-2: Probability Alignment (Guarantee 1 card is majority suit)
      let targetSuit: string | null = null;
      if (i === 0 && options?.majoritySuit) {
        targetSuit = options.majoritySuit;
      }

      // Anti-clumping for Jokers
      let effectiveJokerProb = this.jokerProbability;
      if (this.consecutiveJokers >= 2) effectiveJokerProb *= 0.1; // Drastically reduce if already got 2

      const isJoker = Math.random() < effectiveJokerProb;

      if (isJoker && !targetRank && !targetSuit) {
        drawn.push(CardFactory.create(null, null, true));
        this.consecutiveJokers++;
        this.consecutiveRoyals = 0;
      } else {
        this.consecutiveJokers = 0;

        if (this.cards.length === 0) {
          this.initialize([...heldCards, ...drawn]);
        }

        if (this.cards.length > 0) {
          let cardIdx = 0;

          if (targetRank) {
            // Try to find same rank
            const foundIdx = this.cards.findIndex(c => c.rank === targetRank);
            if (foundIdx !== -1) cardIdx = foundIdx;
          } else if (targetSuit) {
            // Try to find majority suit
            const foundIdx = this.cards.findIndex(c => c.suit === targetSuit);
            if (foundIdx !== -1) cardIdx = foundIdx;
          }

          const card = this.cards.splice(cardIdx, 1)[0];

          // If this is the "source" card for a forced rank pair
          if (forcedRankIdx !== null && !targetRank && !card.isJoker) {
            targetRank = card.rank;
          }

          // If this is the "target" card, it should already be handled by the targetRank check above
          // But clear targetRank if we just used it
          if (targetRank && i === forcedRankIdx) {
            // targetRank was used
          }

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

  public shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
}
