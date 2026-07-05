import { useState, useEffect, useCallback } from 'react';
import { audioEngine } from '../models/AudioEngineModel';
import { Track } from '../types';

export function useAudioController() {
  const [track, setTrack] = useState<Track>(audioEngine.getTrack());
  const [playbackState, setPlaybackState] = useState(audioEngine.getPlaybackState());

  // Listen to state changes from Audio Engine Model
  useEffect(() => {
    const handleStateChange = () => {
      setTrack(audioEngine.getTrack());
      setPlaybackState(audioEngine.getPlaybackState());
    };

    audioEngine.registerStateChangeListener(handleStateChange);
    
    // Initial state trigger
    handleStateChange();

    return () => {
      // Unregister listener (safe as single listener slot)
      audioEngine.registerStateChangeListener(() => {});
    };
  }, []);

  const play = useCallback(() => {
    audioEngine.start();
  }, []);

  const pause = useCallback(() => {
    audioEngine.pause();
  }, []);

  const skipNext = useCallback(() => {
    audioEngine.nextTrack();
  }, []);

  const skipPrev = useCallback(() => {
    audioEngine.prevTrack();
  }, []);

  const setVolume = useCallback((volume: number) => {
    audioEngine.setVolume(volume);
  }, []);

  const toggleMute = useCallback(() => {
    audioEngine.toggleMute();
  }, []);

  const seek = useCallback((seconds: number) => {
    audioEngine.seek(seconds);
  }, []);

  const setBpm = useCallback((bpm: number) => {
    audioEngine.setBpm(bpm);
  }, []);

  const getVisualizerData = useCallback(() => {
    return audioEngine.getVisualizerData();
  }, []);

  return {
    track,
    isPlaying: playbackState.isPlaying,
    currentTime: playbackState.currentTime,
    volume: playbackState.volume,
    isMuted: playbackState.isMuted,
    bpm: playbackState.bpm,
    play,
    pause,
    skipNext,
    skipPrev,
    setVolume,
    toggleMute,
    seek,
    setBpm,
    getVisualizerData,
  };
}
