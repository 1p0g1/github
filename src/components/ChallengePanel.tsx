import { useState, FormEvent } from 'react';
import { GamePhase } from '../types/game';

interface ChallengePanelProps {
  phase: GamePhase;
  prefix: string;
  onHumanProve: (word: string) => void;
}

export function ChallengePanel({ phase, prefix, onHumanProve }: ChallengePanelProps) {
  const [inputWord, setInputWord] = useState('');

  if (phase !== 'human-challenged' && phase !== 'bot-challenged') {
    return null;
  }

  if (phase === 'bot-challenged') {
    return (
      <div className="card challenge-panel">
        <div className="bot-thinking">
          Bot is searching for a word starting with &quot;{prefix.toUpperCase()}&quot;
          <div className="dot-flashing">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  // human-challenged
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const word = inputWord.trim();
    onHumanProve(word);
    setInputWord('');
  };

  return (
    <div className="card challenge-panel">
      <p className="challenge-prompt">
        Bot challenges you! Prove a word starting with{' '}
        <strong>&quot;{prefix.toUpperCase()}&quot;</strong>
      </p>
      <form className="proof-form" onSubmit={handleSubmit}>
        <input
          className="proof-input"
          type="text"
          value={inputWord}
          onChange={(e) => setInputWord(e.target.value)}
          placeholder="Enter a valid word…"
          autoFocus
          aria-label="Enter proof word"
        />
        <button type="submit" className="proof-submit-btn">
          Submit
        </button>
      </form>
    </div>
  );
}
