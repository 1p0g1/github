interface LetterDisplayProps {
  prefix: string;
}

export function LetterDisplay({ prefix }: LetterDisplayProps) {
  if (prefix.length === 0) {
    return (
      <div className="letter-display">
        <span className="empty-hint">Start typing a letter…</span>
      </div>
    );
  }

  const letters = prefix.split('');

  return (
    <div className="letter-display">
      <div className="prefix-letters">
        {letters.map((letter, index) => (
          <span
            key={index}
            className={`letter${index === letters.length - 1 ? ' added' : ''}`}
          >
            {letter.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
