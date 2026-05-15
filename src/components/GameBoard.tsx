import { useState } from 'react';
import { Trie } from '../dictionary/trie';
import { useGame } from '../game/useGame';
import { GameMode, GameSettings } from '../types/game';
import { LetterDisplay } from './LetterDisplay';
import { PlayerInput } from './PlayerInput';
import { ChallengePanel } from './ChallengePanel';
import { StatusBar } from './StatusBar';
import { GameOverModal } from './GameOverModal';
import { Settings } from './Settings';

interface Props { trie: Trie }

export function GameBoard({ trie }: Props) {
  const { state, dispatch } = useGame(trie);
  const { phase, prefix, settings } = state;
  const isPvP = settings.mode === 'pvp';

  // Local setup-screen state (does not live in the reducer)
  const [setupStep, setSetupStep] = useState<'mode-select' | 'configure'>('mode-select');

  const isIdle     = phase === 'idle';
  const isGameOver = phase === 'game-over';
  const isHumanTurn        = phase === 'human-turn';
  const isBotTurn          = phase === 'bot-turn';
  const isHumanChallenged  = phase === 'human-challenged';
  const isBotChallenged    = phase === 'bot-challenged';

  // In PVP, player2 uses the "bot turn" phase slot
  const isPlayer2Turn = isPvP && isBotTurn;
  const isAnyHumanInput = isHumanTurn || isPlayer2Turn;

  const activeName = isHumanTurn
    ? settings.player1Name
    : isPlayer2Turn
    ? settings.player2Name
    : '';

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleLetter = (letter: string) => {
    if (isHumanTurn) {
      dispatch({ type: 'ADD_LETTER', payload: { letter, player: 'human' } });
    } else if (isPlayer2Turn) {
      dispatch({ type: 'ADD_LETTER', payload: { letter, player: 'bot' } });
    }
  };

  const handleChallenge = () => {
    if (prefix.length === 0) return;
    if (isHumanTurn)    dispatch({ type: 'HUMAN_CHALLENGE' });
    if (isPlayer2Turn)  dispatch({ type: 'BOT_CHALLENGE' });
  };

  const handleSettingsChange = (partial: Partial<GameSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: partial });
  };

  const handleModeSelect = (mode: GameMode) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { mode } });
    setSetupStep('configure');
  };

  const handleStart = () => {
    dispatch({ type: 'START_GAME' });
  };

  const handleRestart = () => {
    dispatch({ type: 'RESTART' });
    setSetupStep('mode-select');
  };

  const settingsDisabled = !isIdle && !isGameOver;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="app">
      <header className="app-header">
        <h1>Word Chain</h1>
        <p className="subtitle">The word fragment game</p>
      </header>

      <div className="game-container">
        <StatusBar state={state} />

        <LetterDisplay prefix={prefix} />

        {/* ── Idle: mode selection ── */}
        {isIdle && setupStep === 'mode-select' && (
          <div className="card mode-select">
            <p className="mode-select__heading">How do you want to play?</p>
            <div className="mode-select__options">
              <button className="mode-card" onClick={() => handleModeSelect('pvb')}>
                <span className="mode-card__icon">🤖</span>
                <span className="mode-card__title">vs Bot</span>
                <span className="mode-card__desc">Play against the computer. Choose your difficulty.</span>
              </button>
              <button className="mode-card" onClick={() => handleModeSelect('pvp')}>
                <span className="mode-card__icon">👥</span>
                <span className="mode-card__title">Pass &amp; Play</span>
                <span className="mode-card__desc">Two players, one device. Take turns and pass it over.</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Idle: configure + start ── */}
        {isIdle && setupStep === 'configure' && (
          <>
            <Settings
              settings={settings}
              onChange={handleSettingsChange}
              disabled={false}
            />
            <div className="start-row">
              <button className="back-btn" onClick={() => setSetupStep('mode-select')}>
                ← Back
              </button>
              <button className="start-btn" onClick={handleStart}>
                Start Game
              </button>
            </div>
          </>
        )}

        {/* ── Playing: letter input ── */}
        {isAnyHumanInput && (
          <div className="card">
            {isPvP && (
              <div className="pvp-turn-label">
                {activeName}&rsquo;s turn
              </div>
            )}
            <PlayerInput
              prefix={prefix}
              trie={trie}
              onLetter={handleLetter}
              onChallenge={handleChallenge}
              disabled={false}
              canChallenge={prefix.length > 0}
            />
          </div>
        )}

        {/* ── PvB only: bot thinking animation ── */}
        {!isPvP && isBotTurn && (
          <div className="card">
            <div className="bot-thinking">
              Bot is thinking
              <div className="dot-flashing"><span /><span /><span /></div>
            </div>
          </div>
        )}

        {/* ── Challenge panel ── */}
        {(isHumanChallenged || isBotChallenged) && (
          <ChallengePanel
            phase={phase}
            mode={settings.mode}
            prefix={prefix}
            player1Name={settings.player1Name}
            player2Name={settings.player2Name}
            onHumanProve={(word) => dispatch({ type: 'HUMAN_PROVE_WORD', payload: { word } })}
            onPlayer2Prove={(word) => dispatch({ type: 'BOT_PROVE_WORD', payload: { word } })}
          />
        )}

        {/* ── Settings shown during game-over for context ── */}
        {isGameOver && (
          <Settings
            settings={settings}
            onChange={handleSettingsChange}
            disabled={settingsDisabled}
          />
        )}
      </div>

      {isGameOver && (
        <GameOverModal state={state} onPlayAgain={handleRestart} />
      )}
    </div>
  );
}
