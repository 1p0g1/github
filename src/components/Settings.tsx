import { GameSettings, Difficulty } from '../types/game';

interface SettingsProps {
  settings: GameSettings;
  onChange: (s: Partial<GameSettings>) => void;
  disabled: boolean;
}

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export function Settings({ settings, onChange, disabled }: SettingsProps) {
  return (
    <div className="card settings">
      <h3>Settings</h3>

      <div className="settings-row">
        <div className="settings-label">Bot Difficulty</div>
        <div className="difficulty-btns">
          {DIFFICULTIES.map(({ value, label }) => (
            <button
              key={value}
              className={`diff-btn${settings.difficulty === value ? ' active' : ''}`}
              onClick={() => onChange({ difficulty: value })}
              disabled={disabled}
              aria-pressed={settings.difficulty === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

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
            value={settings.minWordLength}
            onChange={(e) => onChange({ minWordLength: parseInt(e.target.value, 10) })}
            disabled={disabled}
            aria-label="Minimum word length"
          />
          <span className="slider-val">{settings.minWordLength}</span>
        </div>
      </div>
    </div>
  );
}
