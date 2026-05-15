import { GameState } from '../types/game';

interface Props { state: GameState }

export function StatusBar({ state }: Props) {
  const { phase, prefix, settings } = state;
  const { mode, player1Name, player2Name } = settings;
  const isPvP = mode === 'pvp';
  const p = prefix.toUpperCase();

  let msg = '';
  let cls = 'status-bar';

  switch (phase) {
    case 'idle':
      msg = 'Choose a mode to get started';
      break;

    case 'human-turn':
      cls += ' human-turn';
      msg = isPvP
        ? prefix.length === 0
          ? `${player1Name}'s turn — add the first letter`
          : `${player1Name}'s turn — add a letter or challenge`
        : prefix.length === 0
          ? 'Your turn — add the first letter'
          : `Your turn — add a letter or challenge the bot`;
      break;

    case 'bot-turn':
      if (isPvP) {
        cls += ' human-turn';
        msg = prefix.length === 0
          ? `${player2Name}'s turn — add the first letter`
          : `${player2Name}'s turn — add a letter or challenge`;
      } else {
        cls += ' bot-turn';
        msg = 'Bot is thinking…';
      }
      break;

    case 'human-challenged':
      cls += ' challenged';
      msg = isPvP
        ? `${player2Name} challenges ${player1Name}! Prove a word starting with "${p}"`
        : `Bot challenges you! Prove a word starting with "${p}"`;
      break;

    case 'bot-challenged':
      cls += ' challenged';
      msg = isPvP
        ? `${player1Name} challenges ${player2Name}! Prove a word starting with "${p}"`
        : `You challenged the bot — waiting for its response…`;
      break;

    case 'game-over': {
      const winnerName = state.winner === 'human'
        ? (isPvP ? player1Name : 'You')
        : (isPvP ? player2Name : 'Bot');
      msg = `${winnerName} wins!`;
      break;
    }
  }

  return <div className={cls}>{msg}</div>;
}
