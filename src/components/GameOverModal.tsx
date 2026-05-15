import { GameState } from '../types/game';

interface Props {
  state: GameState;
  onPlayAgain: () => void;
}

export function GameOverModal({ state, onPlayAgain }: Props) {
  if (state.phase !== 'game-over') return null;

  const { settings, winner, loser, losingReason, prefix, botProofWord } = state;
  const isPvP = settings.mode === 'pvp';

  const winnerName = winner === 'human'
    ? (isPvP ? settings.player1Name : 'You')
    : (isPvP ? settings.player2Name : 'Bot');

  const loserName = loser === 'human'
    ? (isPvP ? settings.player1Name : 'You')
    : (isPvP ? settings.player2Name : 'Bot');

  const humanWon = winner === 'human';

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Game over">
      <div className="modal-card">
        <div className={`modal-result ${humanWon ? 'win' : 'lose'}`}>
          {winnerName} {isPvP ? 'wins' : (humanWon ? 'Win!' : 'Wins!')}
          {!isPvP && humanWon ? '🎉' : !isPvP ? '' : ''}
        </div>

        {prefix && (
          <div className="modal-prefix-display">{prefix.toUpperCase()}</div>
        )}

        <p className="modal-reason">{losingReason}</p>

        {botProofWord && !isPvP && (
          <p className="modal-proof-word">
            Bot proved: <span>{botProofWord.toUpperCase()}</span>
          </p>
        )}

        {isPvP && loser && (
          <p className="modal-proof-word">{loserName} loses this round.</p>
        )}

        <div className="modal-actions">
          <button className="play-again-btn" onClick={onPlayAgain}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
