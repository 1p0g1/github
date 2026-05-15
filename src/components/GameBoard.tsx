import { Trie } from '../dictionary/trie';
import { useGame } from '../game/useGame';
import { LetterDisplay } from './LetterDisplay';
import { PlayerInput } from './PlayerInput';
import { ChallengePanel } from './ChallengePanel';
import { StatusBar } from './StatusBar';
import { GameOverModal } from './GameOverModal';
import { Settings } from './Settings';
import { GameSettings } from '../types/game';

interface GameBoardProps {
  trie: Trie;
}

export function GameBoard({ trie }: GameBoardProps) {
  const { state, dispatch } = useGame(trie);
  const { phase, prefix, settings } = state;

  const isIdle = phase === 'idle';
  const isGameOver = phase === 'game-over';
  const isHumanTurn = phase === 'human-turn';
  const isBotTurn = phase === 'bot-turn';
  const isHumanChallenged = phase === 'human-challenged';
  const isBotChallenged = phase === 'bot-challenged';

  const inputDisabled = !isHumanTurn;
  const canChallenge = isHumanTurn && prefix.length > 0;

  const handleLetter = (letter: string) => {
    if (!isHumanTurn) return;
    dispatch({ type: 'ADD_LETTER', payload: { letter, player: 'human' } });
  };

  const handleChallenge = () => {
    if (!isHumanTurn || prefix.length === 0) return;
    dispatch({ type: 'HUMAN_CHALLENGE' });
  };

  const handleHumanProve = (word: string) => {
    dispatch({ type: 'HUMAN_PROVE_WORD', payload: { word } });
  };

  const handleSettingsChange = (partial: Partial<GameSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: partial });
  };

  const handleStart = () => {
    dispatch({ type: 'START_GAME' });
  };

  const handleRestart = () => {
    dispatch({ type: 'RESTART' });
  };

  const settingsDisabled = !isIdle && !isGameOver;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Word Chain</h1>
        <p className="subtitle">The word fragment game</p>
      </header>

      <div className="game-container">
        <StatusBar state={state} />

        <LetterDisplay prefix={prefix} />

        {isIdle && (
          <div className="card start-screen">
            <p>
              Take turns adding letters. Avoid completing a real word of{' '}
              {settings.minWordLength}+ letters — or challenge your opponent!
            </p>
            <button className="start-btn" onClick={handleStart}>
              Start Game
            </button>
          </div>
        )}

        {(isHumanTurn || isBotTurn) && (
          <div className="card">
            <PlayerInput
              prefix={prefix}
              trie={trie}
              onLetter={handleLetter}
              onChallenge={handleChallenge}
              disabled={inputDisabled}
              canChallenge={canChallenge}
            />
          </div>
        )}

        {(isHumanChallenged || isBotChallenged) && (
          <ChallengePanel
            phase={phase}
            prefix={prefix}
            onHumanProve={handleHumanProve}
          />
        )}

        <Settings
          settings={settings}
          onChange={handleSettingsChange}
          disabled={settingsDisabled}
        />
      </div>

      {isGameOver && (
        <GameOverModal
          state={state}
          onPlayAgain={handleRestart}
        />
      )}
    </div>
  );
}
