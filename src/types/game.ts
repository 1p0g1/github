export type Difficulty = 'easy' | 'medium' | 'hard';
export type Player = 'human' | 'bot';
export type GamePhase =
  | 'idle'
  | 'human-turn'
  | 'bot-turn'
  | 'human-challenged'  // bot challenged human; human must prove word
  | 'bot-challenged'    // human challenged bot; bot must prove word (auto)
  | 'game-over';

export interface GameSettings {
  difficulty: Difficulty;
  minWordLength: number; // 3-6, default 4
}

export interface GameState {
  phase: GamePhase;
  prefix: string;
  lastPlayer: Player | null;
  winner: Player | null;
  loser: Player | null;
  losingReason: string;
  botProofWord: string | null; // word bot used to prove during bot-challenged
  settings: GameSettings;
}
