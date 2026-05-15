import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_PATH = join(__dirname, '..', 'public', 'trie.json');

/**
 * Word sources:
 *
 * 1. SOWPODS — Collins Scrabble Words (international tournament standard).
 *    Collins is the other major British English reference publisher alongside
 *    Oxford. This list is widely used in competitive Scrabble outside North
 *    America and includes British spellings (colour, honour, etc.).
 *    ~267,000 words. CC0 / widely available.
 *
 * 2. ENABLE2 (Enhanced North American Benchmark LEXicon) — the North American
 *    competitive Scrabble standard, compiled from multiple authoritative
 *    dictionaries. ~172,000 words. Public domain.
 *
 * Combined and deduplicated: ~285,000+ unique words.
 */
const SOURCES: { name: string; url: string }[] = [
  {
    name: 'SOWPODS (Collins Scrabble Words — British English)',
    url: 'https://raw.githubusercontent.com/jesstess/Scrabble/master/scrabble/sowpods.txt',
  },
  {
    name: 'ENABLE2 (North American benchmark lexicon)',
    url: 'https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt',
  },
];

type TrieNode = Record<string, TrieNode | number>;

function buildTrie(words: Iterable<string>): TrieNode {
  const root: TrieNode = {};
  for (const word of words) {
    let node = root;
    for (const char of word) {
      if (!(char in node)) node[char] = {} as TrieNode;
      node = node[char] as TrieNode;
    }
    node['$'] = 1;
  }
  return root;
}

async function fetchWordList(name: string, url: string): Promise<string[]> {
  console.log(`Fetching: ${name}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const text = await res.text();
  const words = text
    .split('\n')
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length >= 3 && /^[a-z]+$/.test(w));
  console.log(`  → ${words.length.toLocaleString()} words`);
  return words;
}

async function main() {
  const wordSet = new Set<string>();

  for (const { name, url } of SOURCES) {
    try {
      const words = await fetchWordList(name, url);
      for (const w of words) wordSet.add(w);
    } catch (err) {
      console.warn(`  Warning — skipping ${name}: ${(err as Error).message}`);
    }
  }

  if (wordSet.size === 0) {
    throw new Error('No words collected — check network connectivity');
  }

  console.log(`\nUnique words total: ${wordSet.size.toLocaleString()}`);
  console.log('Building trie…');

  const trie = buildTrie(wordSet);
  const json = JSON.stringify(trie);
  const sizeMB = (json.length / 1024 / 1024).toFixed(1);

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, json, 'utf-8');

  console.log(`Written to: ${OUTPUT_PATH} (${sizeMB} MB raw)`);
  console.log('Done. Run: npm run dev');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
