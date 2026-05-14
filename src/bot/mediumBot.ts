import { Trie } from '../dictionary/trie';

export function mediumBotMove(
  prefix: string,
  trie: Trie,
  minWordLength: number
): { type: 'letter'; letter: string } | { type: 'challenge' } {
  const children = trie.getChildren(prefix);

  if (children.length === 0) {
    return { type: 'challenge' };
  }

  // Filter out letters that would complete a word >= minWordLength
  const safeLetters = children.filter((letter) => {
    const next = prefix + letter;
    return !(next.length >= minWordLength && trie.isWord(next));
  });

  if (safeLetters.length > 0) {
    const idx = Math.floor(Math.random() * safeLetters.length);
    return { type: 'letter', letter: safeLetters[idx] };
  }

  // All options complete a word — forced to pick one or challenge
  // Medium bot picks randomly (it doesn't look ahead far enough to challenge strategically)
  const idx = Math.floor(Math.random() * children.length);
  return { type: 'letter', letter: children[idx] };
}
