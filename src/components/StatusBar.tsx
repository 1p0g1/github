import { GameState } from '../types/game';

interface StatusBarProps {
  state: GameState;
}

function getStatusInfo(state: GameState): { message: string; className: string } {
  const { phase, prefix } = state;

  switch (phase) {
    case 'idle':
      return { message: 'Press "Start Game" to begin!', className: '' };

    case 'human-turn':
      if (prefix.length === 0) {
        return { message: 'Your turn — add the first letter!', className: 'human-turn' };
      }
      return {
        message: `Your turn — add a letter or challenge the bot's last move`,
        className: 'human-turn',
      };

    case 'bot-turn':
      return { message: 'Bot is thinking...', className: 'bot-turn' };

    case 'human-challenged':
      return {
        message: `Bot challenged! Prove a word starting with "${prefix.toUpperCase()}"`,
        className: 'challenged',
      };

    case 'bot-challenged':
      return {
        message: `You challenged the bot! Waiting for bot to prove a word...`,
        className: 'challenged',
      };

    case 'game-over': {
      const whoWon = state.winner === 'human' ? 'You win!' : 'Bot wins!';
      return { message: whoWon, className: '' };
    }

    default:
      return { message: '', className: '' };
  }
}

export function StatusBar({ state }: StatusBarProps) {
  const { message, className } = getStatusInfo(state);
  return (
    <div className={`status-bar ${className}`}>
      {message}
    </div>
  );
}
