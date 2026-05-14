import { Trie } from '../dictionary/trie';
import { Difficulty } from '../types/game';
import { easyBotMove } from './easyBot';
import { mediumBotMove } from './mediumBot';
import { hardBotMove } from './hardBot';

export function getBotMove(
  prefix: string,
  trie: Trie,
  difficulty: Difficulty,
  minWordLength: number
): { type: 'letter'; letter: string } | { type: 'challenge' } {
  switch (difficulty) {
    case 'easy':
      return easyBotMove(prefix, trie, minWordLength);
    case 'medium':
      return mediumBotMove(prefix, trie, minWordLength);
    case 'hard':
      return hardBotMove(prefix, trie, minWordLength);
  }
}

export function getBotProofWord(prefix: string, trie: Trie): string | null {
  return trie.findWordWithPrefix(prefix);
}
