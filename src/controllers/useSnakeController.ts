import { useState, useEffect, useCallback, useRef } from 'react';
import { snakeGame, DIRECTIONS } from '../models/SnakeGameModel';
import { SnakeGameState, Position } from '../types';

export function useSnakeController() {
  const [gameState, setGameState] = useState<SnakeGameState>(snakeGame.getGameState());
  const [isSpecialFood, setIsSpecialFood] = useState(snakeGame.checkSpecialFood());
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  
  // Create a ref to store current status and speed to keep game loop in sync
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  // Subscribe to Model changes
  useEffect(() => {
    const handleStateChange = (freshState: SnakeGameState) => {
      setGameState(freshState);
      setIsSpecialFood(snakeGame.checkSpecialFood());
    };

    snakeGame.registerStateChangeListener(handleStateChange);

    return () => {
      snakeGame.registerStateChangeListener(() => {});
    };
  }, []);

  // Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { status } = stateRef.current;

      // Global controls for spacebar (Play/Pause)
      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'IDLE' || status === 'GAME_OVER') {
          snakeGame.reset();
          snakeGame.setStatus('PLAYING');
        } else if (status === 'PLAYING') {
          snakeGame.setStatus('PAUSED');
        } else if (status === 'PAUSED') {
          snakeGame.setStatus('PLAYING');
        }
        return;
      }

      if (status !== 'PLAYING') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          snakeGame.setDirection(DIRECTIONS.UP);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          snakeGame.setDirection(DIRECTIONS.DOWN);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          snakeGame.setDirection(DIRECTIONS.LEFT);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          snakeGame.setDirection(DIRECTIONS.RIGHT);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Recursive timeout-based game loop to handle dynamic game speed changes immediately
  useEffect(() => {
    let timeoutId: number | null = null;

    const gameTick = () => {
      if (stateRef.current.status === 'PLAYING') {
        snakeGame.step();
        timeoutId = window.setTimeout(gameTick, stateRef.current.speedMs);
      }
    };

    if (gameState.status === 'PLAYING') {
      timeoutId = window.setTimeout(gameTick, gameState.speedMs);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [gameState.status, gameState.speedMs]);

  const startGame = useCallback(() => {
    if (gameState.status === 'GAME_OVER' || gameState.status === 'IDLE') {
      snakeGame.reset();
    }
    snakeGame.setStatus('PLAYING');
  }, [gameState.status]);

  const pauseGame = useCallback(() => {
    snakeGame.setStatus('PAUSED');
  }, []);

  const resetGame = useCallback(() => {
    snakeGame.reset();
  }, []);

  const changeDirection = useCallback((dir: Position) => {
    snakeGame.setDirection(dir);
  }, []);

  const selectGame = useCallback((gameId: string | null) => {
    setSelectedGameId(gameId);
    if (!gameId) {
      snakeGame.setStatus('IDLE');
    }
  }, []);

  return {
    snake: gameState.snake,
    direction: gameState.direction,
    food: gameState.food,
    status: gameState.status,
    score: gameState.score,
    highScore: gameState.highScore,
    speedMs: gameState.speedMs,
    isSpecialFood,
    selectedGameId,
    selectGame,
    startGame,
    pauseGame,
    resetGame,
    changeDirection,
  };
}
