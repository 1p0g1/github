"""
Build the Word Chain Game dictionary using WordNet (Princeton) as a quality filter.

Approach:
  1. Download SOWPODS + ENABLE2 (~272k words, includes all inflected forms like "running")
  2. For each word, find its base form via WordNet's morphological analyser (morphy)
  3. Keep the word only if its base form exists in WordNet AND is not a proper noun
  4. Build and write the trie JSON

Why this works:
  - WordNet (Princeton, CC licence) is an academically curated English lexicon used as
    the reference corpus by most NLP research, including Oxford's own language tools.
  - It explicitly separates proper nouns (noun.person, noun.location, noun.group) from
    common words, so filtering them is precise and automatic.
  - Using the full Scrabble lists as the *input* rather than WordNet lemmas means we
    keep all inflected forms (running, houses, beautifully) that WordNet doesn't store.

Usage:
  python3 scripts/build-dictionary.py
"""

import json, re, sys, urllib.request
from pathlib import Path
from nltk.corpus import wordnet as wn  # type: ignore
import nltk  # type: ignore

# ── Constants ─────────────────────────────────────────────────────────────────

# Lexicographer file names WordNet uses for proper-noun noun synsets
PROPER_LEXNAMES = {'noun.location', 'noun.person', 'noun.group'}

SOURCES = [
    (
        'SOWPODS (Collins Scrabble Words — international, British English)',
        'https://raw.githubusercontent.com/jesstess/Scrabble/master/scrabble/sowpods.txt',
    ),
    (
        'ENABLE2 (North American benchmark lexicon)',
        'https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt',
    ),
]

OUT = Path(__file__).parent.parent / 'public' / 'trie.json'

# ── WordNet setup ─────────────────────────────────────────────────────────────

def ensure_wordnet():
    for corpus in ('wordnet', 'omw-1.4'):
        try:
            nltk.data.find(f'corpora/{corpus}')
        except LookupError:
            print(f'Downloading NLTK corpus: {corpus}…')
            nltk.download(corpus, quiet=True)

# ── Proper noun detection ─────────────────────────────────────────────────────

def _synset_is_proper(synset) -> bool:
    """
    A synset is proper if its first (most-frequent) lemma is capitalised in
    WordNet. WordNet consistently capitalises proper-noun lemmas: "Einstein",
    "Paris", "London", "Google".  Common nouns are lowercase: "amazon",
    "john", "mercury".
    """
    lemmas = synset.lemmas()
    return bool(lemmas) and lemmas[0].name()[0].isupper()

def has_common_noun_meaning(word: str) -> bool:
    """
    True if the word has at least one noun synset whose lexicographer category
    is not a dedicated proper-noun domain.  The three PROPER_LEXNAMES cover
    named people, places, and organisations — enough to exclude 'einstein',
    'mary', 'london' etc. while keeping words that have a genuine common
    meaning even when they are also proper names ('paris' = a plant genus,
    'john' = a toilet, 'amazon' = a fierce woman / a parrot).
    """
    synsets = wn.synsets(word, pos='n')
    return any(s.lexname() not in PROPER_LEXNAMES for s in synsets)

def is_valid_base(base: str, pos: str) -> bool:
    """True if this base form is an acceptable (non-proper) word."""
    if pos == 'n':
        return has_common_noun_meaning(base)
    # verbs, adjectives, adverbs have no proper-noun category in WordNet
    return bool(wn.synsets(base, pos=pos))

POS_MAP = [
    (wn.NOUN, 'n'),
    (wn.VERB, 'v'),
    (wn.ADJ,  'a'),
    (wn.ADV,  'r'),
]

def is_valid_for_game(word: str) -> bool:
    """
    Return True if `word` (an inflected form) maps to a non-proper-noun
    base form in WordNet.
    """
    for wn_pos, pos_tag in POS_MAP:
        base = wn.morphy(word, wn_pos)
        if base and is_valid_base(base, pos_tag):
            return True
    return False

# ── Trie builder ──────────────────────────────────────────────────────────────

def build_trie(words):
    root = {}
    for word in words:
        node = root
        for ch in word:
            node = node.setdefault(ch, {})
        node['$'] = 1
    return root

# ── Word list downloader ──────────────────────────────────────────────────────

def fetch_words(label: str, url: str) -> list[str]:
    print(f'  Fetching {label}…')
    with urllib.request.urlopen(url, timeout=30) as resp:
        text = resp.read().decode('utf-8')
    words = [
        w.strip().lower() for w in text.splitlines()
        if re.match(r'^[a-zA-Z]{3,}$', w.strip())
    ]
    print(f'    → {len(words):,} words')
    return words

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    ensure_wordnet()

    # Step 1: collect all candidate words from Scrabble lists
    candidates: set[str] = set()
    for label, url in SOURCES:
        try:
            candidates.update(fetch_words(label, url))
        except Exception as e:
            print(f'  Warning — skipping {label}: {e}')

    if not candidates:
        sys.exit('No words fetched — check network connection')

    print(f'\nTotal candidates: {len(candidates):,}')

    # Step 2: filter through WordNet
    print('Filtering through WordNet (proper nouns removed, obscure words removed)…')
    valid: list[str] = []
    rejected_sample: list[str] = []

    for i, word in enumerate(sorted(candidates)):
        if i % 10000 == 0:
            pct = i / len(candidates) * 100
            print(f'  {i:,} / {len(candidates):,}  ({pct:.0f}%)  valid so far: {len(valid):,}', end='\r')
        if is_valid_for_game(word):
            valid.append(word)
        elif len(rejected_sample) < 20:
            rejected_sample.append(word)

    print(f'\n\nAccepted: {len(valid):,} words')
    print(f'Rejected: {len(candidates) - len(valid):,} words')
    print(f'Sample rejections: {rejected_sample}')

    # Step 3: build and write trie
    print('\nBuilding trie…')
    trie = build_trie(valid)
    json_str = json.dumps(trie, separators=(',', ':'))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json_str, encoding='utf-8')

    size_mb = len(json_str) / 1024 / 1024
    print(f'Written to: {OUT}  ({size_mb:.1f} MB)')
    print('Done. Run: npm run dev')

if __name__ == '__main__':
    main()
