import React from 'react';
import { Track } from '../types';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

interface FooterViewProps {
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  onPlayToggle: () => void;
  onSkipNext: () => void;
  onSkipPrev: () => void;
  onVolumeChange: (vol: number) => void;
  onMuteToggle: () => void;
  onSeek: (seconds: number) => void;
}

export function FooterView({
  currentTrack,
  isPlaying,
  currentTime,
  volume,
  isMuted,
  onPlayToggle,
  onSkipNext,
  onSkipPrev,
  onVolumeChange,
  onMuteToggle,
  onSeek,
}: FooterViewProps) {
  
  // Format seconds to standard MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / currentTrack.duration) * 100;

  // Handle clicking timeline track to seek
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(Math.floor(ratio * currentTrack.duration));
  };

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  return (
    <footer id="app-footer" className="h-auto md:h-24 bg-[#0d0d0f] border-t border-white/5 px-6 md:px-8 py-4 md:py-0 flex flex-col md:flex-row items-center justify-between z-20 flex-shrink-0 gap-4 md:gap-0">
      {/* Left Block: Track Art and metadata */}
      <div className="flex items-center space-x-4 w-full md:w-1/4 justify-center md:justify-start">
        <div className={`w-10 h-10 rounded bg-gradient-to-tr ${currentTrack.gradient} border border-white/10 flex-shrink-0 flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/40"></div>
          <span className="text-white text-[10px] font-mono font-bold tracking-tighter relative z-10 animate-pulse">AI</span>
        </div>
        
        <div className="min-w-0 text-center md:text-left">
          <p className="text-sm font-semibold text-white tracking-wide truncate">{currentTrack.title}</p>
          <p className="text-xs text-gray-500 font-mono truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Center Block: Playback controls + Timeline timeline */}
      <div className="flex-1 flex flex-col items-center w-full max-w-xl mx-auto">
        
        {/* Buttons strip */}
        <div className="flex items-center space-x-6 md:space-x-8 mb-2.5 md:mb-3">
          <button
            onClick={onSkipPrev}
            className="text-gray-500 hover:text-white transition-colors duration-200 cursor-pointer p-1 rounded hover:bg-white/5 active:scale-95"
            title="Previous synthesized channel"
          >
            <SkipBack className="w-5 h-5" fill="currentColor" />
          </button>
          
          <button
            onClick={onPlayToggle}
            className="w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-cyan-100 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all duration-300 transform active:scale-95 cursor-pointer"
            title={isPlaying ? 'Pause Neural Feed' : 'Start Neural Feed'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" stroke="none" />
            ) : (
              <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5" fill="currentColor" stroke="none" />
            )}
          </button>
          
          <button
            onClick={onSkipNext}
            className="text-gray-500 hover:text-white transition-colors duration-200 cursor-pointer p-1 rounded hover:bg-white/5 active:scale-95"
            title="Next synthesized channel"
          >
            <SkipForward className="w-5 h-5" fill="currentColor" />
          </button>
        </div>

        {/* Timeline strip */}
        <div className="w-full flex items-center space-x-3.5">
          <span className="text-[9px] text-gray-500 font-mono w-8 text-right select-none">
            {formatTime(currentTime)}
          </span>
          
          {/* Timeline bar click track */}
          <div
            onClick={handleTimelineClick}
            className="flex-1 h-1.5 bg-white/10 hover:bg-white/15 rounded-full relative overflow-hidden cursor-pointer group transition-all"
            title="Scrub timeline location"
          >
            {/* Filled progress bar track */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:from-cyan-300 group-hover:to-blue-400 transition-all rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          
          <span className="text-[9px] text-gray-500 font-mono w-8 text-left select-none">
            {formatTime(currentTrack.duration)}
          </span>
        </div>
      </div>

      {/* Right Block: Volume panel */}
      <div className="flex items-center justify-center md:justify-end space-x-3 w-full md:w-1/4">
        <button
          onClick={onMuteToggle}
          className="text-gray-500 hover:text-white transition-colors duration-200 p-1 rounded hover:bg-white/5 cursor-pointer"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4.5 h-4.5 text-red-400" />
          ) : (
            <Volume2 className="w-4.5 h-4.5" />
          )}
        </button>

        <div className="flex items-center group relative w-24 md:w-28">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeSliderChange}
            className="w-full h-1 bg-white/10 hover:bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400 outline-none transition-all"
            title="Mix volume level"
          />
        </div>
      </div>
    </footer>
  );
}
