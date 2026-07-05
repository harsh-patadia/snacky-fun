import { Position, SnakeGameState, GameStatus } from '../types';

export const GRID_SIZE = 20;

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export class SnakeGameModel {
  private state: SnakeGameState;
  private isSpecialFood: boolean = false;
  private onStateChange: ((state: SnakeGameState) => void) | null = null;

  constructor() {
    this.state = this.getInitialState();
    this.restoreHighScore();
  }

  public registerStateChangeListener(listener: (state: SnakeGameState) => void) {
    this.onStateChange = listener;
    // Emit initial state
    this.triggerStateChange();
  }

  private triggerStateChange() {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }

  private calculateSpeed(score: number): number {
    let speed = 250; // Initial slow speed
    if (score >= 10 && score < 30) {
      // Reach 10+ points: increase speed with 0.9x multiplier (speedMs * 0.9)
      speed = Math.floor(250 * 0.9);
    } else if (score >= 30) {
      // Reach 30+ points: increase speed by another 1.5x (previous speed / 1.5)
      speed = Math.floor((250 * 0.9) / 1.5);
      
      // And so on like that: for every 20 points above 30, increase speed by another 1.1x (speedMs * 0.9)
      const extraPoints = score - 30;
      const extraSteps = Math.floor(extraPoints / 20);
      for (let i = 0; i < extraSteps; i++) {
        speed = Math.floor(speed * 0.9);
      }
    }
    return Math.max(40, speed); // Keep at playable bound
  }

  private getInitialState(): SnakeGameState {
    return {
      snake: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ],
      direction: DIRECTIONS.RIGHT,
      food: { x: 14, y: 5 },
      status: 'IDLE',
      score: 0,
      highScore: 0,
      speedMs: 250, // Slow initial speed
    };
  }

  public getGameState(): SnakeGameState {
    return { ...this.state };
  }

  private restoreHighScore() {
    try {
      const saved = localStorage.getItem('neon_pulse_highscore');
      if (saved) {
        this.state.highScore = parseInt(saved, 10) || 0;
      }
    } catch (e) {
      console.warn('Failed to load high score from localStorage', e);
    }
  }

  private saveHighScore() {
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
      try {
        localStorage.setItem('neon_pulse_highscore', this.state.highScore.toString());
      } catch (e) {
        console.warn('Failed to save high score to localStorage', e);
      }
    }
  }

  public setStatus(status: GameStatus) {
    this.state.status = status;
    this.triggerStateChange();
  }

  public reset() {
    const fresh = this.getInitialState();
    fresh.highScore = this.state.highScore;
    this.state = fresh;
    this.isSpecialFood = false;
    this.generateFood();
    this.triggerStateChange();
  }

  public setDirection(newDir: Position) {
    // Prevent reverse motion (e.g. moving right, cannot go left)
    const currentDir = this.state.direction;
    if (currentDir.x + newDir.x === 0 && currentDir.y + newDir.y === 0) {
      return;
    }
    this.state.direction = newDir;
    this.triggerStateChange();
  }

  public checkSpecialFood(): boolean {
    return this.isSpecialFood;
  }

  public step(): boolean {
    if (this.state.status !== 'PLAYING') return false;

    const head = this.state.snake[0];
    const dir = this.state.direction;
    
    // Calculate new head position
    const newHead: Position = {
      x: head.x + dir.x,
      y: head.y + dir.y,
    };

    // 1. Boundary / Wall Collision check
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      this.state.status = 'GAME_OVER';
      this.saveHighScore();
      this.triggerStateChange();
      return false;
    }

    // 2. Self Collision check
    for (const segment of this.state.snake) {
      if (segment.x === newHead.x && segment.y === newHead.y) {
        this.state.status = 'GAME_OVER';
        this.saveHighScore();
        this.triggerStateChange();
        return false;
      }
    }

    // Add new head to snake
    const newSnake = [newHead, ...this.state.snake];

    // 3. Food Collision check
    if (newHead.x === this.state.food.x && newHead.y === this.state.food.y) {
      // Eat food: normal food gives 1 point, special food gives 3 points
      const scoreGain = this.isSpecialFood ? 3 : 1;
      this.state.score += scoreGain;
      
      this.saveHighScore();
      this.generateFood();

      // Dynamic Speed Ramp calculated from score thresholds
      this.state.speedMs = this.calculateSpeed(this.state.score);
    } else {
      // Remove tail
      newSnake.pop();
    }

    this.state.snake = newSnake;
    this.triggerStateChange();
    return true;
  }

  private generateFood() {
    let newFood: Position;
    let isOverlap = true;

    // Keep generating until food doesn't overlap the snake
    while (isOverlap) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };

      isOverlap = this.state.snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );

      if (!isOverlap) {
        this.state.food = newFood;
      }
    }

    // 15% chance of spawning high-score special food
    this.isSpecialFood = Math.random() < 0.15;
  }
}

// Global instance to share between controllers
export const snakeGame = new SnakeGameModel();
export default snakeGame;
