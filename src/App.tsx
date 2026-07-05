import { useEffect } from 'react';
import { HeaderView } from './components/HeaderView';
import { SidebarView } from './components/SidebarView';
import { GameView } from './components/GameView';
import { FooterView } from './components/FooterView';
import { useAudioController } from './controllers/useAudioController';
import { useSnakeController } from './controllers/useSnakeController';
import { audioEngine } from './models/AudioEngineModel';

export default function App() {
  const audioCtrl = useAudioController();
  const snakeCtrl = useSnakeController();

  // Cohesive game sync: automatically trigger the neural audio stream when a snake run begins
  useEffect(() => {
    if (snakeCtrl.status === 'PLAYING' && !audioCtrl.isPlaying) {
      audioCtrl.play();
    }
  }, [snakeCtrl.status, audioCtrl.isPlaying, audioCtrl.play]);

  // Handle manual playlist selection
  const handleTrackSelect = (trackId: string) => {
    // If selecting a different track, skip through model
    if (audioCtrl.track.id !== trackId) {
      const index = trackId === 'track-1' ? 0 : trackId === 'track-2' ? 1 : 2;
      // Seek through model internals or use play/next
      if (index === 0) {
        audioEngine.prevTrack(); // loop or direct change
      } else {
        audioEngine.nextTrack();
      }
    }
  };

  return (
    <div id="app-root-container" className="flex flex-col min-h-screen lg:h-screen lg:max-h-screen bg-[#080809] text-gray-100 font-sans md:border-8 md:border-[#1a1a1c] overflow-x-hidden">
      {/* 1. Header component */}
      <HeaderView
        score={snakeCtrl.score}
        highScore={snakeCtrl.highScore}
        gameStatus={snakeCtrl.status}
        bpm={audioCtrl.bpm}
      />

      {/* 2. Middle area: Sidebar & Gaming viewport */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Left sidebar info blocks */}
        <SidebarView
          currentTrack={audioCtrl.track}
          isPlaying={audioCtrl.isPlaying}
          getVisualizerData={audioCtrl.getVisualizerData}
          onTrackSelect={handleTrackSelect}
        />

        {/* Center board component */}
        <GameView
          snake={snakeCtrl.snake}
          direction={snakeCtrl.direction}
          food={snakeCtrl.food}
          isSpecialFood={snakeCtrl.isSpecialFood}
          status={snakeCtrl.status}
          score={snakeCtrl.score}
          speedMs={snakeCtrl.speedMs}
          selectedGameId={snakeCtrl.selectedGameId}
          onSelectGame={snakeCtrl.selectGame}
          onStart={snakeCtrl.startGame}
          onPause={snakeCtrl.pauseGame}
          onReset={snakeCtrl.resetGame}
          onChangeDirection={snakeCtrl.changeDirection}
        />
      </div>

      {/* 3. Media playback Footer component */}
      <FooterView
        currentTrack={audioCtrl.track}
        isPlaying={audioCtrl.isPlaying}
        currentTime={audioCtrl.currentTime}
        volume={audioCtrl.volume}
        isMuted={audioCtrl.isMuted}
        onPlayToggle={audioCtrl.isPlaying ? audioCtrl.pause : audioCtrl.play}
        onSkipNext={audioCtrl.skipNext}
        onSkipPrev={audioCtrl.skipPrev}
        onVolumeChange={audioCtrl.setVolume}
        onMuteToggle={audioCtrl.toggleMute}
        onSeek={audioCtrl.seek}
      />
    </div>
  );
}
