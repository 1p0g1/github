import { Trie } from '../dictionary/trie';

export function isCompletedWord(
  prefix: string,
  trie: Trie,
  minLen: number
): boolean {
  return prefix.length >= minLen && trie.isWord(prefix);
}

export function validateChallengeResponse(
  prefix: string,
  word: string,
  trie: Trie
): boolean {
  const lowerWord = word.toLowerCase();
  const lowerPrefix = prefix.toLowerCase();
  return lowerWord.startsWith(lowerPrefix) && trie.isWord(lowerWord);
}
