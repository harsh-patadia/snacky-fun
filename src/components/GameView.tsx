import { Position, GameStatus } from '../types';
import { GRID_SIZE, DIRECTIONS } from '../models/SnakeGameModel';
import { GAME_OPTIONS } from '../constants';

interface GameViewProps {
  snake: Position[];
  direction: Position;
  food: Position;
  isSpecialFood: boolean;
  status: GameStatus;
  score: number;
  speedMs: number;
  selectedGameId: string | null;
  onSelectGame: (gameId: string | null) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onChangeDirection: (dir: Position) => void;
}

export function GameView({
  snake,
  food,
  isSpecialFood,
  status,
  score,
  speedMs,
  selectedGameId,
  onSelectGame,
  onStart,
  onPause,
  onReset,
  onChangeDirection,
}: GameViewProps) {
  
  // Render empty 20x20 cell grid matrix representation for high-fidelity technical backing
  const renderGridCells = () => {
    const cells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        cells.push(
          <div
            key={`${r}-${c}`}
            className="border-[0.5px] border-white/[0.015] bg-transparent w-full h-full"
          ></div>
        );
      }
    }
    return cells;
  };

  // 1. GAME SELECTION SCREEN
  if (selectedGameId === null) {
    return (
      <section id="game-section" className="flex-1 bg-black/40 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-y-auto select-none min-h-[500px]">
        {/* Tech grid background dots */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1a1a1c 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        {/* CRT Screen Wrapper */}
        <div className="relative z-10 w-full max-w-[420px] sm:max-w-[460px] md:max-w-[480px] lg:max-w-[500px] aspect-square bg-[#0d0d0f] border-4 border-[#1a1a1c] rounded-lg shadow-[0_0_35px_rgba(0,0,0,0.8)] flex flex-col p-6 overflow-hidden">
          {/* CRT scanlines visual decoration */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_3px_100%] animate-pulse"></div>

          <div className="flex-1 flex flex-col justify-between z-10">
            {/* HUD / Module Selection Header */}
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-[0.25em] flex items-center justify-between">
                <span>&gt; CHOOSE_OPERATING_GRID</span>
                <span className="text-[9px] text-gray-500 animate-pulse font-normal">CH_SELECT</span>
              </h3>
            </div>

            {/* Selection List */}
            <div className="flex-1 my-6 flex flex-col justify-center space-y-4">
              {GAME_OPTIONS.map((game) => (
                <button
                  key={game.id}
                  onClick={() => onSelectGame(game.id)}
                  className="w-full p-4 rounded border text-left bg-cyan-950/10 border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-950/20 group transition-all duration-300 relative overflow-hidden cursor-pointer"
                >
                  {/* Left edge accent strip */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 group-hover:bg-cyan-300 transition-colors"></div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{game.icon}</span>
                      <div>
                        <h4 className="font-mono text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {game.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                          {game.label} // {game.version}
                        </p>
                      </div>
                    </div>
                    
                    <span className="text-xs font-mono text-cyan-400 animate-pulse group-hover:translate-x-1 transition-transform">
                      LOAD &gt;&gt;
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-2.5 leading-relaxed font-sans font-light">
                    {game.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Footer specifications */}
            <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[9px] font-mono text-gray-600">
              <span>MODULE_AVAILABILITY: 01_FOUND</span>
              <span>SYS_READY</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 2. ACTIVE GAMEPLAY GRID
  return (
    <section id="game-section" className="flex-1 bg-black/40 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-y-auto select-none min-h-[500px]">
      {/* Tech grid background dots */}
      <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1a1a1c 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      {/* Main CRT Gaming monitor wrap */}
      <div className="relative z-10 w-full max-w-[420px] sm:max-w-[460px] md:max-w-[480px] lg:max-w-[500px] aspect-square bg-[#0d0d0f] border-4 border-[#1a1a1c] rounded-lg shadow-[0_0_35px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
        
        {/* Underlay structural backing grids */}
        <div 
          className="absolute inset-0 grid gap-0 w-full h-full bg-black/40"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {renderGridCells()}
        </div>

        {/* Real-time active entities layer */}
        <div 
          className="absolute inset-0 grid gap-0 w-full h-full pointer-events-none"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {/* 1. Draw Food node */}
          <div
            className={`w-full h-full rounded-full transition-all duration-300 ${
              isSpecialFood
                ? 'bg-pink-500 shadow-[0_0_15px_#ec4899] animate-pulse z-10'
                : 'bg-cyan-400 shadow-[0_0_12px_#06b6d4] z-10'
            }`}
            style={{
              gridColumnStart: food.x + 1,
              gridRowStart: food.y + 1,
            }}
          ></div>

          {/* 2. Draw Snake Tail segments & Head */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
            const opacityClass = isHead 
              ? 'bg-green-400 shadow-[0_0_10px_#4ade80] z-20' 
              : `bg-green-400 rounded-sm z-10`;

            const inlineOpacity = isHead ? 1 : Math.max(0.15, 1 - index / 12);

            return (
              <div
                key={index}
                className={`w-full h-full rounded-sm ${opacityClass}`}
                style={{
                  gridColumnStart: segment.x + 1,
                  gridRowStart: segment.y + 1,
                  opacity: inlineOpacity,
                }}
              ></div>
            );
          })}
        </div>

        {/* Technical HUD Overlay labels */}
        <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-0.5 rounded border border-white/5 pointer-events-none">
          <p className="text-[8px] font-mono text-green-400 tracking-wider">
            GRID: ACTIVE // LAT: {(speedMs).toFixed(0)}MS
          </p>
        </div>

        <div className="absolute bottom-3 right-3 bg-black/80 px-2.5 py-0.5 rounded border border-white/5 pointer-events-none">
          <p className="text-[8px] font-mono text-gray-500 tracking-widest">
            X_HEAD: {snake[0]?.x}, Y_HEAD: {snake[0]?.y}
          </p>
        </div>

        {/* 3. Screen overlays for states */}
        {status === 'IDLE' && (
          <div className="absolute inset-0 bg-[#080809]/95 z-30 flex flex-col items-center justify-center p-6 text-center">
            <div className="border border-cyan-500/20 p-6 rounded-lg max-w-[340px] bg-[#0d0d0f]/80 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <h3 className="text-sm font-mono text-cyan-400 font-bold uppercase tracking-[0.25em] mb-2 animate-pulse">
                &gt; PROTOCOL_LOADED
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Direct neural snake controller and ambient music synthesis sub-grid synced.
              </p>
              
              <button
                onClick={onStart}
                className="w-full py-2 px-4 bg-transparent border border-green-500 text-green-400 font-mono text-xs uppercase hover:bg-green-500/10 active:bg-green-500/20 transition-all rounded shadow-[0_0_10px_rgba(74,222,128,0.2)] cursor-pointer"
              >
                Commence Run
              </button>
              
              <p className="text-[9px] text-gray-500 font-mono mt-4 uppercase tracking-wider">
                PRESS [SPACE] or Click to Play
              </p>
            </div>
          </div>
        )}

        {status === 'PAUSED' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
            <div className="border border-yellow-500/20 p-5 rounded-lg max-w-[280px] bg-[#0d0d0f]/90 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
              <h3 className="text-sm font-mono text-yellow-400 font-bold uppercase tracking-[0.2em] mb-2">
                SYSTEM PAUSED
              </h3>
              <p className="text-[11px] text-gray-400 mb-5">
                Steering interface suspended. Audio stream remains active.
              </p>
              
              <button
                onClick={onStart}
                className="w-full py-2 bg-yellow-500/10 border border-yellow-500 text-yellow-400 font-mono text-xs uppercase hover:bg-yellow-500/20 rounded cursor-pointer"
              >
                Resume Stream
              </button>
            </div>
          </div>
        )}

        {status === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-red-950/95 z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="border border-red-500/30 p-6 rounded-lg max-w-[340px] bg-[#0d0d0f]/90 shadow-[0_0_25px_rgba(239,68,68,0.25)]">
              <h3 className="text-xs font-mono text-red-500 font-bold uppercase tracking-[0.3em] mb-1 animate-pulse">
                ! CORE_FAILURE
              </h3>
              <p className="text-xs text-gray-500 font-mono uppercase mb-4 tracking-wider">
                SNAKE IMPACT DETECTED
              </p>
              
              <div className="my-4 py-3 bg-black/40 border border-white/5 rounded">
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-mono">Final Matrix Yield</p>
                <p className="text-2xl font-bold font-mono text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)] mt-1">
                  {score.toLocaleString()}
                </p>
              </div>

              <button
                onClick={onReset}
                className="w-full py-2 bg-transparent border border-red-500 text-red-400 font-mono text-xs uppercase hover:bg-red-500/10 active:bg-red-500/20 transition-all rounded shadow-[0_0_10px_rgba(239,68,68,0.15)] cursor-pointer"
              >
                Re-Boot Core
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Game Action Controls */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-[340px] z-10">
        <div className="flex items-center justify-center space-x-3 w-full">
          {status === 'PLAYING' ? (
            <button
              onClick={onPause}
              className="flex-1 py-2 px-4 bg-transparent border border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 active:bg-yellow-500/20 font-mono text-xs uppercase tracking-wider rounded transition-all duration-300 shadow-[0_0_10px_rgba(234,179,8,0.15)] cursor-pointer"
            >
              Pause Game
            </button>
          ) : (
            <button
              onClick={onStart}
              disabled={status === 'GAME_OVER'}
              className="flex-1 py-2 px-4 bg-transparent border border-green-500 text-green-400 hover:bg-green-500/10 active:bg-green-500/20 font-mono text-xs uppercase tracking-wider rounded transition-all duration-300 shadow-[0_0_10px_rgba(74,222,128,0.15)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              {status === 'PAUSED' ? 'Resume Game' : 'Start Game'}
            </button>
          )}

          <button
            onClick={onReset}
            disabled={status === 'IDLE'}
            className="flex-1 py-2 px-4 bg-transparent border border-red-500 text-red-400 hover:bg-red-500/10 active:bg-red-500/20 font-mono text-xs uppercase tracking-wider rounded transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.15)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            Restart Game
          </button>
        </div>

        {/* Change Game (Exit to Selection) Button */}
        <button
          onClick={() => onSelectGame(null)}
          className="w-full py-1.5 px-4 bg-transparent border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 active:bg-cyan-500/20 font-mono text-[10px] uppercase tracking-widest rounded transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.1)] cursor-pointer"
        >
          &lt;&lt; Back to Game Selection
        </button>
      </div>

      {/* 4. Mobile Visual Controller (Virtual D-Pad) */}
      <div className="block md:hidden w-full max-w-[200px] mt-6 flex flex-col items-center relative">
        <div className="grid grid-cols-3 gap-2 w-full aspect-square">
          <div></div>
          <button
            id="dpad-up"
            onClick={() => onChangeDirection(DIRECTIONS.UP)}
            disabled={status !== 'PLAYING'}
            className="w-12 h-12 border border-white/10 active:border-cyan-400 bg-[#0d0d0f]/80 rounded-lg flex items-center justify-center text-white active:text-cyan-400 active:shadow-[0_0_10px_rgba(6,182,212,0.4)] mx-auto transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="font-mono text-lg">▲</span>
          </button>
          <div></div>

          <button
            id="dpad-left"
            onClick={() => onChangeDirection(DIRECTIONS.LEFT)}
            disabled={status !== 'PLAYING'}
            className="w-12 h-12 border border-white/10 active:border-cyan-400 bg-[#0d0d0f]/80 rounded-lg flex items-center justify-center text-white active:text-cyan-400 active:shadow-[0_0_10px_rgba(6,182,212,0.4)] mx-auto transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="font-mono text-lg">◀</span>
          </button>
          <div className="w-12 h-12 flex items-center justify-center font-mono text-[9px] text-gray-500 uppercase tracking-widest text-center self-center justify-self-center select-none leading-none">
            {status === 'PLAYING' ? (
              <button onClick={onPause} className="w-full h-full flex items-center justify-center hover:text-white">
                ⏸
              </button>
            ) : (
              <button onClick={onStart} className="w-full h-full flex items-center justify-center hover:text-white">
                ▶
              </button>
            )}
          </div>
          <button
            id="dpad-right"
            onClick={() => onChangeDirection(DIRECTIONS.RIGHT)}
            disabled={status !== 'PLAYING'}
            className="w-12 h-12 border border-white/10 active:border-cyan-400 bg-[#0d0d0f]/80 rounded-lg flex items-center justify-center text-white active:text-cyan-400 active:shadow-[0_0_10px_rgba(6,182,212,0.4)] mx-auto transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="font-mono text-lg">▶</span>
          </button>

          <div></div>
          <button
            id="dpad-down"
            onClick={() => onChangeDirection(DIRECTIONS.DOWN)}
            disabled={status !== 'PLAYING'}
            className="w-12 h-12 border border-white/10 active:border-cyan-400 bg-[#0d0d0f]/80 rounded-lg flex items-center justify-center text-white active:text-cyan-400 active:shadow-[0_0_10px_rgba(6,182,212,0.4)] mx-auto transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="font-mono text-lg">▼</span>
          </button>
          <div></div>
        </div>
      </div>

      {/* Desktop Key bindings guide */}
      <div className="hidden md:flex justify-center items-center space-x-6 mt-4 text-[10px] font-mono text-gray-500">
        <div>STEER: <span className="text-cyan-400 bg-white/5 border border-white/5 px-1 py-0.5 rounded ml-1 uppercase">▲ ▼ ◀ ▶</span> OR <span className="text-cyan-400 bg-white/5 border border-white/5 px-1 py-0.5 rounded ml-1 uppercase">W A S D</span></div>
        <div>PLAY/PAUSE: <span className="text-cyan-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded ml-1 uppercase">Spacebar</span></div>
      </div>
    </section>
  );
}
