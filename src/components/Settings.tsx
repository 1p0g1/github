import { GameSettings, Difficulty } from '../types/game';

interface Props {
  settings: GameSettings;
  onChange: (s: Partial<GameSettings>) => void;
  disabled: boolean;
}

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'easy',   label: 'Easy',   desc: 'Bot picks randomly' },
  { value: 'medium', label: 'Medium', desc: 'Bot avoids completing words' },
  { value: 'hard',   label: 'Hard',   desc: 'Bot plays near-optimally' },
];

export function Settings({ settings, onChange, disabled }: Props) {
  const { mode, difficulty, minWordLength, player1Name, player2Name } = settings;
  const isPvP = mode === 'pvp';

  return (
    <div className="card settings">
      <h3>Settings</h3>

      {/* Player names — PvP only */}
      {isPvP && (
        <div className="settings-row">
          <div className="settings-label">Player Names</div>
          <div className="player-names-row">
            <input
              className="player-name-input"
              type="text"
              value={player1Name}
              maxLength={16}
              placeholder="Player 1"
              disabled={disabled}
              onChange={(e) => onChange({ player1Name: e.target.value || 'Player 1' })}
              aria-label="Player 1 name"
            />
            <span className="player-names-vs">vs</span>
            <input
              className="player-name-input"
              type="text"
              value={player2Name}
              maxLength={16}
              placeholder="Player 2"
              disabled={disabled}
              onChange={(e) => onChange({ player2Name: e.target.value || 'Player 2' })}
              aria-label="Player 2 name"
            />
          </div>
        </div>
      )}

      {/* Difficulty — PvB only */}
      {!isPvP && (
        <div className="settings-row">
          <div className="settings-label">Bot Difficulty</div>
          <div className="difficulty-btns">
            {DIFFICULTIES.map(({ value, label, desc }) => (
              <button
                key={value}
                className={`diff-btn${difficulty === value ? ' active' : ''}`}
                onClick={() => onChange({ difficulty: value })}
                disabled={disabled}
                title={desc}
                aria-pressed={difficulty === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Min word length — always shown */}
      <div className="settings-row">
        <div className="settings-label">
          Min Word Length&nbsp;
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            (lose if you complete a word ≥ this length)
          </span>
        </div>
        <div className="min-word-slider">
          <input
            type="range"
            min={3}
            max={6}
            step={1}
            value={minWordLength}
            onChange={(e) => onChange({ minWordLength: parseInt(e.target.value, 10) })}
            disabled={disabled}
            aria-label="Minimum word length"
          />
          <span className="slider-val">{minWordLength}</span>
        </div>
      </div>
    </div>
  );
}
