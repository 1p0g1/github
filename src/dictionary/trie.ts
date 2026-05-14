type TrieData = Record<string, unknown>;

export class Trie {
  private root: TrieData;

  constructor(data: TrieData) {
    this.root = data;
  }

  private getNode(prefix: string): TrieData | null {
    let node: TrieData = this.root;
    for (const char of prefix) {
      if (!(char in node)) return null;
      const next = node[char];
      if (typeof next !== 'object' || next === null) return null;
      node = next as TrieData;
    }
    return node;
  }

  hasPrefix(prefix: string): boolean {
    return this.getNode(prefix) !== null;
  }

  isWord(word: string): boolean {
    const node = this.getNode(word);
    if (!node) return false;
    return '$' in node && node['$'] === 1;
  }

  getChildren(prefix: string): string[] {
    const node = this.getNode(prefix);
    if (!node) return [];
    return Object.keys(node).filter((k) => k !== '$');
  }

  findWordWithPrefix(prefix: string): string | null {
    const node = this.getNode(prefix);
    if (!node) return null;

    // DFS to first terminal
    const dfs = (current: TrieData, path: string): string | null => {
      if ('$' in current && current['$'] === 1) {
        return path;
      }
      for (const key of Object.keys(current)) {
        if (key === '$') continue;
        const child = current[key];
        if (typeof child === 'object' && child !== null) {
          const result = dfs(child as TrieData, path + key);
          if (result !== null) return result;
        }
      }
      return null;
    };

    return dfs(node, prefix);
  }

  countWordsWithPrefix(prefix: string): number {
    const node = this.getNode(prefix);
    if (!node) return 0;

    const count = (current: TrieData): number => {
      let total = 0;
      if ('$' in current && current['$'] === 1) total += 1;
      for (const key of Object.keys(current)) {
        if (key === '$') continue;
        const child = current[key];
        if (typeof child === 'object' && child !== null) {
          total += count(child as TrieData);
        }
      }
      return total;
    };

    return count(node);
  }
}
