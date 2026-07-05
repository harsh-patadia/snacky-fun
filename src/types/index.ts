export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface Position {
  x: number;
  y: number;
}

export interface SnakeGameState {
  snake: Position[];
  direction: Position;
  food: Position;
  status: GameStatus;
  score: number;
  highScore: number;
  speedMs: number;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  bpm: number;
  genre: string;
  notes: {
    bass: string[];
    melody: string[];
  };
  gradient: string;
}

export interface AudioPlaybackState {
  currentTrackId: string;
  isPlaying: boolean;
  currentTime: number; // in seconds
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  bpm: number;
}
