import { useEffect, useRef } from 'react';
import { Track } from '../types';
import { TRACKS } from '../models/AudioEngineModel';

interface SidebarViewProps {
  currentTrack: Track;
  isPlaying: boolean;
  getVisualizerData: () => number[];
  onTrackSelect: (trackId: string) => void;
}

export function SidebarView({ currentTrack, isPlaying, getVisualizerData, onTrackSelect }: SidebarViewProps) {
  const barsRef = useRef<HTMLDivElement[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // High-performance direct-DOM animation loop for audio frequency visualization
    const updateBars = () => {
      const data = getVisualizerData();
      barsRef.current.forEach((bar, index) => {
        if (bar) {
          const val = data[index] || 0;
          // Scale from 0-255 to percentage height
          const percent = Math.min(100, Math.max(8, (val / 255) * 100));
          bar.style.height = `${percent}%`;
          
          // Make active playing tracks glow more brightly
          if (isPlaying) {
            bar.style.opacity = `${0.4 + (percent / 100) * 0.6}`;
          } else {
            bar.style.opacity = '0.3';
          }
        }
      });
      animationRef.current = requestAnimationFrame(updateBars);
    };

    animationRef.current = requestAnimationFrame(updateBars);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [getVisualizerData, isPlaying]);

  // Next up queue (tracks other than the active one)
  const nextUpTracks = TRACKS.filter((t) => t.id !== currentTrack.id);

  return (
    <aside id="app-sidebar" className="w-full lg:w-72 bg-[#0d0d0f] border-b lg:border-b-0 lg:border-r border-white/5 p-4 md:p-6 flex flex-col justify-between flex-shrink-0">
      <div className="space-y-6 md:space-y-8">
        {/* Now Playing Panel */}
        <div>
          <h2 className="text-[10px] md:text-[11px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-3 md:mb-4">
            Now Playing
          </h2>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all duration-300">
            {/* Visualizer Frame */}
            <div className={`aspect-video lg:aspect-square w-full bg-gradient-to-tr ${currentTrack.gradient} rounded-lg mb-4 flex flex-col items-center justify-center border border-white/10 relative overflow-hidden transition-all duration-500 shadow-inner`}>
              {/* Radial gradient backing */}
              <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
              
              {/* Equalizer Bars */}
              <div className="flex space-x-1.5 items-end h-16 w-3/4 justify-center relative z-10">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      if (el) barsRef.current[i] = el;
                    }}
                    className="w-1.5 bg-cyan-400 rounded-t shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-75"
                    style={{ height: '10%' }}
                  ></div>
                ))}
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-10">
                <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest bg-black/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  {isPlaying ? 'ENGINE ACTIVE' : 'ENGINE READY'}
                </span>
                <span className="text-[8px] font-mono text-gray-500">
                  LPF // {currentTrack.bpm}BPM
                </span>
              </div>
            </div>

            {/* Song Meta info */}
            <div>
              <h3 className="font-bold text-white tracking-wide truncate">{currentTrack.title}</h3>
              <p className="text-xs text-cyan-400/80 font-mono mt-0.5 tracking-wider truncate">{currentTrack.artist}</p>
              <div className="mt-2.5 flex items-center space-x-2">
                <span className="text-[9px] font-mono bg-white/5 text-gray-400 px-2 py-0.5 rounded border border-white/5 uppercase">
                  {currentTrack.genre}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Up / Playlist queue */}
        <div>
          <h2 className="text-[10px] md:text-[11px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-3 md:mb-4">
            Next Up
          </h2>
          <div className="space-y-3">
            {TRACKS.map((t) => {
              const isActive = t.id === currentTrack.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onTrackSelect(t.id)}
                  className={`w-full flex items-center space-x-3 p-2 rounded-lg border text-left transition-all duration-300 ${
                    isActive
                      ? 'bg-white/5 border-cyan-500/30 text-white shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                      : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {/* Small play status or static index */}
                  <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 border font-mono text-xs ${
                    isActive 
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-bold' 
                      : 'bg-white/5 border-white/5 text-gray-500'
                  }`}>
                    {isActive && isPlaying ? (
                      <span className="flex space-x-0.5 items-end h-3">
                        <span className="w-0.5 h-2.5 bg-cyan-400 animate-[pulse_0.6s_infinite_alternate]"></span>
                        <span className="w-0.5 h-3 bg-cyan-400 animate-[pulse_0.4s_infinite_alternate_0.15s]"></span>
                        <span className="w-0.5 h-1.5 bg-cyan-400 animate-[pulse_0.5s_infinite_alternate_0.3s]"></span>
                      </span>
                    ) : (
                      <span>▶</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-cyan-400' : 'text-white'}`}>
                      {t.title}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono truncate">{t.artist}</p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-mono text-gray-500">
                      {Math.floor(t.duration / 60)}:{(t.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Industrial Footer specs */}
      <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600 font-mono">
        <div>RATE: 48KHZ</div>
        <div>SYS: STEREO</div>
        <div>DEPTH: 24BIT</div>
      </div>
    </aside>
  );
}
