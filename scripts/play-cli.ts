/**
 * Word Chain Game — Terminal CLI
 *
 * Usage:  npx tsx scripts/play-cli.ts [--difficulty easy|medium|hard] [--min-length 3-6]
 *
 * Rules:
 *   - Take turns adding one letter at a time to a growing prefix.
 *   - Complete a real word of >= minLength letters → you lose.
 *   - Type  C  (or press C) to challenge the bot's last letter.
 *     The bot must then prove a word starting with the current prefix.
 *     Bot proves it  → you lose (bad challenge).
 *     Bot can't      → bot loses.
 *   - The bot can also challenge you — type a word starting with the prefix to prove it.
 */

import { createInterface } from 'readline';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Trie ─────────────────────────────────────────────────────────────────────

type TrieData = Record<string, unknown>;

class Trie {
  private root: TrieData;
  constructor(data: TrieData) { this.root = data; }

  private getNode(prefix: string): TrieData | null {
    let node: TrieData = this.root;
    for (const ch of prefix) {
      if (!(ch in node)) return null;
      const next = node[ch];
      if (typeof next !== 'object' || next === null) return null;
      node = next as TrieData;
    }
    return node;
  }

  hasPrefix(prefix: string): boolean { return this.getNode(prefix) !== null; }

  isWord(word: string): boolean {
    const n = this.getNode(word);
    return n !== null && '$' in n;
  }

  getChildren(prefix: string): string[] {
    const n = this.getNode(prefix);
    if (!n) return [];
    return Object.keys(n).filter(k => k !== '$');
  }

  findWordWithPrefix(prefix: string): string | null {
    const n = this.getNode(prefix);
    if (!n) return null;
    const dfs = (node: TrieData, path: string): string | null => {
      if ('$' in node) return path;
      for (const [k, child] of Object.entries(node)) {
        if (k === '$') continue;
        const r = dfs(child as TrieData, path + k);
        if (r) return r;
      }
      return null;
    };
    return dfs(n, prefix);
  }
}

// ── Bot strategies ────────────────────────────────────────────────────────────

type Move = { type: 'letter'; letter: string } | { type: 'challenge' };

function easyBot(prefix: string, trie: Trie): Move {
  const kids = trie.getChildren(prefix);
  if (kids.length === 0) return { type: 'challenge' };
  return { type: 'letter', letter: kids[Math.floor(Math.random() * kids.length)] };
}

function mediumBot(prefix: string, trie: Trie, minLen: number): Move {
  const kids = trie.getChildren(prefix);
  if (kids.length === 0) return { type: 'challenge' };
  const safe = kids.filter(l => {
    const next = prefix + l;
    return !(next.length >= minLen && trie.isWord(next));
  });
  const pool = safe.length > 0 ? safe : kids;
  return { type: 'letter', letter: pool[Math.floor(Math.random() * pool.length)] };
}

const memo = new Map<string, 'W' | 'L'>();

function classify(prefix: string, trie: Trie, minLen: number): 'W' | 'L' {
  const key = `${minLen}:${prefix}`;
  const cached = memo.get(key);
  if (cached !== undefined) return cached;
  const kids = trie.getChildren(prefix);
  if (kids.length === 0) { memo.set(key, 'W'); return 'W'; }
  let hasValid = false;
  for (const l of kids) {
    const next = prefix + l;
    if (next.length >= minLen && trie.isWord(next)) continue;
    hasValid = true;
    if (classify(next, trie, minLen) === 'L') { memo.set(key, 'W'); return 'W'; }
  }
  if (!hasValid) { memo.set(key, 'L'); return 'L'; }
  memo.set(key, 'L');
  return 'L';
}

function hardBot(prefix: string, trie: Trie, minLen: number): Move {
  const kids = trie.getChildren(prefix);
  if (kids.length === 0) return { type: 'challenge' };
  if (classify(prefix, trie, minLen) === 'W') {
    for (const l of kids) {
      const next = prefix + l;
      if (next.length >= minLen && trie.isWord(next)) continue;
      if (classify(next, trie, minLen) === 'L') return { type: 'letter', letter: l };
    }
  }
  const safe = kids.filter(l => {
    const n = prefix + l;
    return !(n.length >= minLen && trie.isWord(n));
  });
  const pool = safe.length > 0 ? safe : kids;
  return { type: 'letter', letter: pool[Math.floor(Math.random() * pool.length)] };
}

// ── ANSI helpers ──────────────────────────────────────────────────────────────

const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  green:   '\x1b[32m',
  cyan:    '\x1b[36m',
  yellow:  '\x1b[33m',
  red:     '\x1b[31m',
  magenta: '\x1b[35m',
  white:   '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed:   '\x1b[41m',
};

const g = (s: string) => `${C.green}${s}${C.reset}`;
const c = (s: string) => `${C.cyan}${s}${C.reset}`;
const y = (s: string) => `${C.yellow}${s}${C.reset}`;
const r = (s: string) => `${C.red}${s}${C.reset}`;
const b = (s: string) => `${C.bold}${s}${C.reset}`;
const d = (s: string) => `${C.dim}${s}${C.reset}`;

function printBanner() {
  console.log();
  console.log(g(b('  ╔══════════════════════════╗')));
  console.log(g(b('  ║    WORD CHAIN GAME        ║')));
  console.log(g(b('  ╚══════════════════════════╝')));
  console.log();
}

function printPrefix(prefix: string) {
  if (prefix.length === 0) {
    console.log(`  ${d('[ no letters yet ]')}`);
  } else {
    const display = prefix.toUpperCase().split('').join(' ');
    console.log(`  ${C.bold}${C.cyan}${display}${C.reset}`);
  }
  console.log();
}

function printRules(minLen: number) {
  console.log(d(`  Rules: Complete a real word of ${minLen}+ letters → you lose.`));
  console.log(d(`  Type a single letter to play, or C to challenge the bot.`));
  console.log();
}

// ── CLI arg parsing ───────────────────────────────────────────────────────────

function parseArgs(): { difficulty: 'easy' | 'medium' | 'hard'; minLen: number } {
  const args = process.argv.slice(2);
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  let minLen = 4;

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--difficulty' || args[i] === '-d') && args[i + 1]) {
      const d = args[++i];
      if (d === 'easy' || d === 'medium' || d === 'hard') difficulty = d;
    }
    if ((args[i] === '--min-length' || args[i] === '-m') && args[i + 1]) {
      const n = parseInt(args[++i], 10);
      if (n >= 3 && n <= 6) minLen = n;
    }
  }
  return { difficulty, minLen };
}

// ── Main game loop ────────────────────────────────────────────────────────────

async function main() {
  const { difficulty, minLen } = parseArgs();

  // Load trie
  const triePath = join(__dirname, '..', 'public', 'trie.json');
  if (!existsSync(triePath)) {
    console.error(r('  Dictionary not found. Run: npm run build:dictionary'));
    process.exit(1);
  }
  process.stdout.write(d('  Loading dictionary… '));
  const trie = new Trie(JSON.parse(readFileSync(triePath, 'utf-8')) as TrieData);
  console.log(g('ready!'));

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (prompt: string): Promise<string> =>
    new Promise(resolve => rl.question(prompt, resolve));

  let playAgain = true;

  while (playAgain) {
    printBanner();
    console.log(`  Difficulty: ${b(difficulty)}    Min word length: ${b(String(minLen))}`);
    console.log();
    printRules(minLen);

    let prefix = '';
    let gameOver = false;
    // Human always goes first
    let humanTurn = true;

    while (!gameOver) {
      printPrefix(prefix);

      if (humanTurn) {
        // ── Human turn ──────────────────────────────────────────────────────
        console.log(`  ${g('YOUR TURN')}`);
        const validKids = new Set(trie.getChildren(prefix));

        let input = '';
        while (true) {
          input = (await ask(`  Enter a letter${prefix.length > 0 ? ' or C to challenge' : ''}: `))
            .trim().toLowerCase();

          if (input === 'c' && prefix.length > 0) break; // challenge
          if (/^[a-z]$/.test(input)) break;
          console.log(y('  Please enter a single letter (a–z).'));
        }

        if (input === 'c') {
          // Human challenges bot
          console.log();
          console.log(c(`  You challenged! Bot must prove a word starting with "${prefix.toUpperCase()}"…`));
          await pause(400);

          const proof = trie.findWordWithPrefix(prefix);
          if (!proof) {
            console.log();
            console.log(r(`  Bot can't find a word! Bot loses.`));
            console.log(g(b(`  🎉  YOU WIN!`)));
            gameOver = true;
          } else {
            console.log();
            console.log(y(`  Bot proves: ${b(proof.toUpperCase())}`));
            console.log();
            console.log(r(`  Your challenge failed — you lose.`));
            console.log(b(`  Bot wins.`));
            gameOver = true;
          }
        } else {
          // Human adds letter
          const newPrefix = prefix + input;
          if (newPrefix.length >= minLen && trie.isWord(newPrefix)) {
            console.log();
            console.log(r(`  "${newPrefix.toUpperCase()}" is a complete word — you lose!`));
            console.log(b(`  Bot wins.`));
            gameOver = true;
          } else {
            prefix = newPrefix;
            humanTurn = false;
            console.log();
          }
        }
      } else {
        // ── Bot turn ────────────────────────────────────────────────────────
        console.log(`  ${c('BOT TURN')} (${d(difficulty)})`);
        await pause(600);

        let move: Move;
        if (difficulty === 'easy')  move = easyBot(prefix, trie);
        else if (difficulty === 'medium') move = mediumBot(prefix, trie, minLen);
        else move = hardBot(prefix, trie, minLen);

        if (move.type === 'challenge') {
          // Bot challenges human
          console.log();
          console.log(y(`  Bot challenges you! Prove a word starting with "${prefix.toUpperCase()}".`));
          console.log();

          let proved = false;
          while (!proved) {
            const word = (await ask('  Your word: ')).trim().toLowerCase();
            if (/^[a-z]+$/.test(word) && word.startsWith(prefix) && trie.isWord(word)) {
              console.log();
              console.log(g(`  "${word.toUpperCase()}" is valid — bot's challenge fails!`));
              console.log(g(b(`  🎉  YOU WIN!`)));
              proved = true;
              gameOver = true;
            } else if (!word.startsWith(prefix)) {
              console.log(y(`  "${word.toUpperCase()}" doesn't start with "${prefix.toUpperCase()}". Try again.`));
            } else if (!trie.isWord(word)) {
              console.log(y(`  "${word.toUpperCase()}" isn't in the dictionary. Try again.`));
            } else {
              console.log(y('  Invalid input. Try again.'));
            }

            if (!proved) {
              const retry = (await ask('  Give up? (y/n): ')).trim().toLowerCase();
              if (retry === 'y') {
                console.log();
                console.log(r(`  You couldn't prove a word — you lose.`));
                console.log(b(`  Bot wins.`));
                gameOver = true;
                proved = true; // exit loop
              }
            }
          }
        } else {
          const botLetter = move.letter;
          const newPrefix = prefix + botLetter;
          console.log(`  Bot adds: ${b(botLetter.toUpperCase())}   → prefix: ${c(newPrefix.toUpperCase())}`);
          console.log();

          if (newPrefix.length >= minLen && trie.isWord(newPrefix)) {
            console.log(r(`  "${newPrefix.toUpperCase()}" is a complete word — bot loses!`));
            console.log(g(b(`  🎉  YOU WIN!`)));
            gameOver = true;
          } else {
            prefix = newPrefix;
            humanTurn = true;
          }
        }
      }
    }

    console.log();
    const again = (await ask(d('  Play again? (y/n): '))).trim().toLowerCase();
    playAgain = again === 'y';
    console.log();
  }

  console.log(d('  Thanks for playing!'));
  rl.close();
}

function pause(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
