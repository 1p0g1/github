import { Trie } from '../dictionary/trie';

// Module-level memoization cache (persists across games since dictionary doesn't change)
const memo = new Map<string, 'W' | 'L'>();

/**
 * Classify the current position:
 * 'W' = the player whose turn it is can WIN (force the opponent to lose)
 * 'L' = the player whose turn it is will LOSE with optimal play from both sides
 *
 * Key insight: "current player" is whoever must add the next letter.
 */
function classify(prefix: string, trie: Trie, minWordLength: number): 'W' | 'L' {
  const cacheKey = `${minWordLength}:${prefix}`;
  const cached = memo.get(cacheKey);
  if (cached !== undefined) return cached;

  const children = trie.getChildren(prefix);

  if (children.length === 0) {
    // No valid continuation — the previous player was bluffing (no word exists here).
    // The current player should challenge and wins.
    memo.set(cacheKey, 'W');
    return 'W';
  }

  let hasValidMove = false;

  for (const letter of children) {
    const next = prefix + letter;

    // If playing this letter completes a word >= minWordLength → current player loses
    if (next.length >= minWordLength && trie.isWord(next)) {
      continue; // losing move for current player; skip
    }

    hasValidMove = true;

    // After current player plays `letter`, opponent faces `next`
    const opponentResult = classify(next, trie, minWordLength);
    if (opponentResult === 'L') {
      // Opponent loses → current player wins by playing this letter
      memo.set(cacheKey, 'W');
      return 'W';
    }
  }

  if (!hasValidMove) {
    // Every available letter completes a word — current player is forced to lose
    memo.set(cacheKey, 'L');
    return 'L';
  }

  // All safe moves lead to opponent winning
  memo.set(cacheKey, 'L');
  return 'L';
}

export function hardBotMove(
  prefix: string,
  trie: Trie,
  minWordLength: number
): { type: 'letter'; letter: string } | { type: 'challenge' } {
  const children = trie.getChildren(prefix);

  if (children.length === 0) {
    // No continuations → challenge (previous player was bluffing)
    return { type: 'challenge' };
  }

  const position = classify(prefix, trie, minWordLength);

  if (position === 'W') {
    // Find a winning move: a letter where the opponent ends up in 'L'
    for (const letter of children) {
      const next = prefix + letter;
      // Don't complete a word ourselves
      if (next.length >= minWordLength && trie.isWord(next)) continue;
      const opponentResult = classify(next, trie, minWordLength);
      if (opponentResult === 'L') {
        return { type: 'letter', letter };
      }
    }
  }

  // Position is 'L' or no winning letter found — pick best non-completing letter
  const safeLetters = children.filter((letter) => {
    const next = prefix + letter;
    return !(next.length >= minWordLength && trie.isWord(next));
  });

  if (safeLetters.length > 0) {
    const idx = Math.floor(Math.random() * safeLetters.length);
    return { type: 'letter', letter: safeLetters[idx] };
  }

  // All letters complete a word — forced loss; pick randomly
  const idx = Math.floor(Math.random() * children.length);
  return { type: 'letter', letter: children[idx] };
}

export function clearHardBotMemo(): void {
  memo.clear();
}
