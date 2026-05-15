export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'pvb' | 'pvp';
export type Player = 'human' | 'bot';

export type GamePhase =
  | 'idle'
  | 'human-turn'
  | 'bot-turn'
  | 'human-challenged'  // needs to prove word (challenged by bot or player2)
  | 'bot-challenged'    // bot or player2 needs to prove word
  | 'game-over';

export interface GameSettings {
  mode: GameMode;
  difficulty: Difficulty;
  minWordLength: number;
  player1Name: string;
  player2Name: string;
}

export interface GameState {
  phase: GamePhase;
  prefix: string;
  lastPlayer: Player | null;
  winner: Player | null;
  loser: Player | null;
  losingReason: string;
  botProofWord: string | null;
  settings: GameSettings;
}
