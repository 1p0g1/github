import { useState, FormEvent } from 'react';
import { GameMode, GamePhase } from '../types/game';

interface Props {
  phase: GamePhase;
  mode: GameMode;
  prefix: string;
  player1Name: string;
  player2Name: string;
  onHumanProve: (word: string) => void;
  onPlayer2Prove: (word: string) => void;
}

function ProofForm({
  prompt,
  onSubmit,
}: {
  prompt: string;
  onSubmit: (word: string) => void;
}) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(value.trim());
    setValue('');
  };

  return (
    <div className="card challenge-panel">
      <p className="challenge-prompt">{prompt}</p>
      <form className="proof-form" onSubmit={handleSubmit}>
        <input
          className="proof-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a valid word…"
          autoFocus
          aria-label="Enter proof word"
        />
        <button type="submit" className="proof-submit-btn">Submit</button>
      </form>
    </div>
  );
}

export function ChallengePanel({ phase, mode, prefix, player1Name, player2Name, onHumanProve, onPlayer2Prove }: Props) {
  const p = prefix.toUpperCase();

  // Player 1 was challenged — must prove a word
  if (phase === 'human-challenged') {
    const challenger = mode === 'pvp' ? player2Name : 'Bot';
    return (
      <ProofForm
        prompt={`${challenger} challenges ${player1Name}! Prove a word starting with "${p}"`}
        onSubmit={onHumanProve}
      />
    );
  }

  // Player 2 / bot was challenged
  if (phase === 'bot-challenged') {
    if (mode === 'pvp') {
      // PvP: Player 2 must type their proof word
      return (
        <ProofForm
          prompt={`${player1Name} challenges ${player2Name}! Prove a word starting with "${p}"`}
          onSubmit={onPlayer2Prove}
        />
      );
    }
    // PvB: bot responds automatically
    return (
      <div className="card challenge-panel">
        <div className="bot-thinking">
          Bot is searching for a word starting with &quot;{p}&quot;
          <div className="dot-flashing"><span /><span /><span /></div>
        </div>
      </div>
    );
  }

  return null;
}
