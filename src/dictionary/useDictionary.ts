import { useState, useEffect } from 'react';
import { Trie } from './trie';

interface UseDictionaryResult {
  trie: Trie | null;
  loading: boolean;
  error: string | null;
}

export function useDictionary(): UseDictionaryResult {
  const [trie, setTrie] = useState<Trie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDictionary() {
      try {
        const response = await fetch('/trie.json');
        if (!response.ok) {
          throw new Error(
            `Failed to fetch trie.json: ${response.status} ${response.statusText}`
          );
        }
        const data: unknown = await response.json();
        if (!cancelled) {
          setTrie(new Trie(data as Record<string, unknown>));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Unknown error loading dictionary'
          );
          setLoading(false);
        }
      }
    }

    void loadDictionary();

    return () => {
      cancelled = true;
    };
  }, []);

  return { trie, loading, error };
}
