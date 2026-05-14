import { Trie } from '../dictionary/trie';

export function easyBotMove(
  prefix: string,
  trie: Trie,
  _minWordLength: number
): { type: 'letter'; letter: string } | { type: 'challenge' } {
  const children = trie.getChildren(prefix);

  if (children.length === 0) {
    return { type: 'challenge' };
  }

  // Pick a random child letter
  const idx = Math.floor(Math.random() * children.length);
  return { type: 'letter', letter: children[idx] };
}
