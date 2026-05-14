import { GameState } from '../types/game';

interface GameOverModalProps {
  state: GameState;
  onPlayAgain: () => void;
}

export function GameOverModal({ state, onPlayAgain }: GameOverModalProps) {
  if (state.phase !== 'game-over') return null;

  const humanWon = state.winner === 'human';

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Game over">
      <div className="modal-card">
        <div className={`modal-result ${humanWon ? 'win' : 'lose'}`}>
          {humanWon ? 'You Win!' : 'Bot Wins!'}
        </div>

        {state.prefix && (
          <div className="modal-prefix-display">{state.prefix.toUpperCase()}</div>
        )}

        <p className="modal-reason">{state.losingReason}</p>

        {state.botProofWord && (
          <p className="modal-proof-word">
            Bot proved: <span>{state.botProofWord.toUpperCase()}</span>
          </p>
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
