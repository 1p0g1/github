import { useEffect, useCallback } from 'react';
import { Trie } from '../dictionary/trie';

interface PlayerInputProps {
  prefix: string;
  trie: Trie;
  onLetter: (letter: string) => void;
  onChallenge: () => void;
  disabled: boolean;
  canChallenge: boolean;
}

// QWERTY keyboard layout rows
const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

export function PlayerInput({
  prefix,
  trie,
  onLetter,
  onChallenge,
  disabled,
  canChallenge,
}: PlayerInputProps) {
  const validChildren = new Set(trie.getChildren(prefix));

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      const key = e.key.toLowerCase();
      if (/^[a-z]$/.test(key)) {
        onLetter(key);
      }
    },
    [disabled, onLetter]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className="player-input">
      <div className="keyboard-rows">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="keyboard-row">
            {row.map((letter) => {
              const isValid = validChildren.has(letter);
              return (
                <button
                  key={letter}
                  className={`letter-btn${!isValid && !disabled ? ' invalid' : ''}`}
                  onClick={() => onLetter(letter)}
                  disabled={disabled}
                  aria-label={`Letter ${letter.toUpperCase()}`}
                >
                  {letter.toUpperCase()}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="challenge-btn-wrap">
        <button
          className="challenge-btn"
          onClick={onChallenge}
          disabled={disabled || !canChallenge}
          aria-label="Challenge the bot's last move"
        >
          Challenge
        </button>
      </div>
    </div>
  );
}
