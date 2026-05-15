import { GameState, GamePhase, Player, GameSettings } from '../types/game';
import { Trie } from '../dictionary/trie';
import { isCompletedWord, validateChallengeResponse } from './gameLogic';

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'ADD_LETTER'; payload: { letter: string; player: Player } }
  | { type: 'HUMAN_CHALLENGE' }
  | { type: 'BOT_CHALLENGE' }
  | { type: 'HUMAN_PROVE_WORD'; payload: { word: string } }
  | { type: 'BOT_PROVE_WORD'; payload: { word: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'RESTART' };

export const initialState: GameState = {
  phase: 'idle',
  prefix: '',
  lastPlayer: null,
  winner: null,
  loser: null,
  losingReason: '',
  botProofWord: null,
  settings: {
    mode: 'pvb',
    difficulty: 'medium',
    minWordLength: 4,
    player1Name: 'Player 1',
    player2Name: 'Player 2',
  },
};

function gameOver(
  state: GameState,
  loser: Player,
  reason: string,
  extra?: Partial<GameState>
): GameState {
  const winner: Player = loser === 'human' ? 'bot' : 'human';
  return {
    ...state,
    phase: 'game-over' as GamePhase,
    winner,
    loser,
    losingReason: reason,
    ...extra,
  };
}

export function createReducer(trie: Trie) {
  return function gameReducer(state: GameState, action: GameAction): GameState {
    const { minWordLength } = state.settings;

    switch (action.type) {
      case 'START_GAME': {
        if (state.phase !== 'idle' && state.phase !== 'game-over') return state;
        return {
          ...state,
          phase: 'human-turn',
          prefix: '',
          lastPlayer: null,
          winner: null,
          loser: null,
          losingReason: '',
          botProofWord: null,
        };
      }

      case 'ADD_LETTER': {
        const { letter, player } = action.payload;
        const expectedPhase: GamePhase =
          player === 'human' ? 'human-turn' : 'bot-turn';
        if (state.phase !== expectedPhase) return state;

        const lowerLetter = letter.toLowerCase();
        if (!/^[a-z]$/.test(lowerLetter)) return state;

        const newPrefix = state.prefix + lowerLetter;

        if (isCompletedWord(newPrefix, trie, minWordLength)) {
          return gameOver(
            { ...state, prefix: newPrefix, lastPlayer: player },
            player,
            `"${newPrefix.toUpperCase()}" is a complete word!`
          );
        }

        const nextPhase: GamePhase =
          player === 'human' ? 'bot-turn' : 'human-turn';

        return {
          ...state,
          prefix: newPrefix,
          lastPlayer: player,
          phase: nextPhase,
        };
      }

      case 'HUMAN_CHALLENGE': {
        if (state.phase !== 'human-turn') return state;
        if (state.prefix.length === 0) return state; // nothing to challenge
        return {
          ...state,
          phase: 'bot-challenged',
          lastPlayer: 'human', // human issued the challenge
        };
      }

      case 'BOT_CHALLENGE': {
        if (state.phase !== 'bot-turn') return state;
        return {
          ...state,
          phase: 'human-challenged',
          lastPlayer: 'bot', // bot issued the challenge
        };
      }

      case 'HUMAN_PROVE_WORD': {
        // human-challenged: bot challenged human; human must prove a word
        if (state.phase !== 'human-challenged') return state;
        const { word } = action.payload;
        const valid = validateChallengeResponse(state.prefix, word, trie);
        if (valid) {
          // Human proved a word → bot loses (bad challenge)
          return gameOver(state, 'bot', `Bot challenged, but "${word.toUpperCase()}" is valid!`);
        } else {
          // Human failed to prove → human loses
          return gameOver(
            state,
            'human',
            word.trim().length > 0
              ? `"${word.toUpperCase()}" is not a valid word starting with "${state.prefix.toUpperCase()}".`
              : `Human couldn't prove a word starting with "${state.prefix.toUpperCase()}".`
          );
        }
      }

      case 'BOT_PROVE_WORD': {
        // bot-challenged: human challenged bot; bot must prove a word
        if (state.phase !== 'bot-challenged') return state;
        const { word } = action.payload;
        if (word.trim().length === 0) {
          // Bot couldn't find a word → bot loses
          return gameOver(
            state,
            'bot',
            `Bot couldn't prove a word starting with "${state.prefix.toUpperCase()}".`
          );
        }
        const valid = validateChallengeResponse(state.prefix, word, trie);
        if (valid) {
          // Bot proved a word → human loses (bad challenge)
          return gameOver(
            { ...state, botProofWord: word },
            'human',
            `Bot proved "${word.toUpperCase()}" — your challenge failed!`
          );
        } else {
          // Bot gave invalid word → bot loses
          return gameOver(
            state,
            'bot',
            `Bot's proof "${word.toUpperCase()}" is not valid.`
          );
        }
      }

      case 'UPDATE_SETTINGS': {
        return {
          ...state,
          settings: { ...state.settings, ...action.payload },
        };
      }

      case 'RESTART': {
        return {
          ...initialState,
          settings: state.settings, // preserve settings
        };
      }

      default:
        return state;
    }
  };
}
