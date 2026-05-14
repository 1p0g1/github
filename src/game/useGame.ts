import { useReducer, useEffect, useRef } from 'react';
import { Trie } from '../dictionary/trie';
import { GameState } from '../types/game';
import { GameAction, createReducer, initialState } from './gameReducer';
import { getBotMove, getBotProofWord } from '../bot/botStrategy';

export function useGame(trie: Trie): {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} {
  const reducer = createReducer(trie);
  const [state, dispatch] = useReducer(reducer, initialState);

  // Use a ref to hold the latest state so effects don't have stale closures
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const { phase, prefix, settings } = state;

    if (phase === 'bot-turn') {
      const timer = setTimeout(() => {
        const current = stateRef.current;
        if (current.phase !== 'bot-turn') return;

        const move = getBotMove(
          current.prefix,
          trie,
          current.settings.difficulty,
          current.settings.minWordLength
        );

        if (move.type === 'letter') {
          dispatch({ type: 'ADD_LETTER', payload: { letter: move.letter, player: 'bot' } });
        } else {
          dispatch({ type: 'BOT_CHALLENGE' });
        }
      }, 700);

      return () => clearTimeout(timer);
    }

    if (phase === 'bot-challenged') {
      const timer = setTimeout(() => {
        const current = stateRef.current;
        if (current.phase !== 'bot-challenged') return;

        const word = getBotProofWord(current.prefix, trie);
        dispatch({
          type: 'BOT_PROVE_WORD',
          payload: { word: word ?? '' },
        });
      }, 900);

      return () => clearTimeout(timer);
    }

    // These are just used to avoid "no-unused-vars" on the destructured values
    void prefix;
    void settings;
    return undefined;
  }, [state.phase, state.prefix, trie, state.settings]);

  return { state, dispatch };
}
