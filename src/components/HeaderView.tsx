import { GameStatus } from '../types';

interface HeaderViewProps {
  score: number;
  highScore: number;
  gameStatus: GameStatus;
  bpm: number;
}

export function HeaderView({ score, highScore, gameStatus, bpm }: HeaderViewProps) {
  return (
    <header id="app-header" className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-8 bg-[#0d0d0f] flex-shrink-0">
      <div className="flex items-center space-x-4">
        {/* Neon Pulse Cyber Logo */}
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center flex-shrink-0 animate-pulse">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
          </svg>
        </div>
        
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight uppercase text-white">
            Neon <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">Pulse</span>
          </h1>
          <p className="text-[9px] md:text-[10px] text-gray-500 tracking-[0.2em] font-mono uppercase">
            AUDIO ENGINE V2.0 // BPM: {bpm}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-6 md:space-x-12">
        {/* Game Status Indicator */}
        <div className="hidden sm:block text-right font-mono">
          <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Grid State</p>
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${
              gameStatus === 'PLAYING' ? 'bg-green-400 animate-ping' :
              gameStatus === 'PAUSED' ? 'bg-yellow-400' :
              gameStatus === 'GAME_OVER' ? 'bg-red-500 animate-pulse' :
              'bg-cyan-400'
            }`}></span>
            <span className={`text-xs font-semibold uppercase ${
              gameStatus === 'PLAYING' ? 'text-green-400' :
              gameStatus === 'PAUSED' ? 'text-yellow-400' :
              gameStatus === 'GAME_OVER' ? 'text-red-500' :
              'text-cyan-400'
            }`}>
              {gameStatus}
            </span>
          </div>
        </div>

        {/* Current Score */}
        <div className="text-right">
          <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5 md:mb-1">Score</p>
          <p className="text-xl md:text-2xl font-mono font-bold text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)] transition-all duration-300">
            {score.toLocaleString()}
          </p>
        </div>

        {/* High Score */}
        <div className="text-right">
          <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5 md:mb-1">High Score</p>
          <p className="text-xl md:text-2xl font-mono font-bold text-white transition-all duration-300">
            {highScore.toLocaleString()}
          </p>
        </div>
      </div>
    </header>
  );
}
