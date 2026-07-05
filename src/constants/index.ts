export interface GameOption {
  id: string;
  name: string;
  description: string;
  label: string;
  icon: string;
  version: string;
}

export const GAME_OPTIONS: GameOption[] = [
  {
    id: 'snake',
    name: 'Snake Game',
    description: 'Control the cybernetic vector, absorb raw fuel blocks, and prevent crash loops in the dark grid.',
    label: 'PROTOCOL_SNAKE_V1',
    icon: '🐍',
    version: 'REV_2.0',
  },
];

export const INITIAL_SPEED_MS = 250;
export const BOUNDARY_LIMIT = 20;
export const AUDIO_SAMPLE_RATE_KHZ = 48;
