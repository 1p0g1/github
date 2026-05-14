import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WORDS_URL =
  'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';
const OUTPUT_PATH = join(__dirname, '..', 'public', 'trie.json');

type TrieNode = Record<string, TrieNode | number>;

function buildTrie(words: string[]): TrieNode {
  const root: TrieNode = {};

  for (const word of words) {
    let node = root;
    for (const char of word) {
      if (!(char in node)) {
        node[char] = {} as TrieNode;
      }
      node = node[char] as TrieNode;
    }
    node['$'] = 1;
  }

  return root;
}

async function main() {
  console.log('Fetching word list from:', WORDS_URL);
  const response = await fetch(WORDS_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch words: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const allWords = text.split('\n').map((w) => w.trim().toLowerCase());

  const filtered = allWords.filter(
    (w) => w.length >= 3 && /^[a-z]+$/.test(w)
  );

  console.log(`Total words fetched: ${allWords.length}`);
  console.log(`Words after filtering (length >= 3, alphabetic): ${filtered.length}`);

  const trie = buildTrie(filtered);

  // Ensure public directory exists
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

  writeFileSync(OUTPUT_PATH, JSON.stringify(trie), 'utf-8');
  console.log(`Trie written to: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('Error building dictionary:', err);
  process.exit(1);
});
