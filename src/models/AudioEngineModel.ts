import { Track } from '../types';

export const TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Digital Dreams',
    artist: 'A.I. Synthesizer',
    duration: 180, // loop-based infinite, but virtual 3:00 timeline
    bpm: 110,
    genre: 'Synthwave',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    notes: {
      bass: ['C2', 'E2', 'G2', 'A2', 'F2', 'A2', 'C2', 'G2'],
      melody: ['C4', 'E4', 'G4', 'C5', 'B4', 'G4', 'A4', 'C5', 'F4', 'A4', 'C5', 'A4', 'G4', 'B4', 'D5', 'G5']
    }
  },
  {
    id: 'track-2',
    title: 'Cyber Pulse',
    artist: 'Hex Code Generator',
    duration: 160,
    bpm: 130,
    genre: 'Cyberpunk Techno',
    gradient: 'from-pink-500/20 to-purple-500/20',
    notes: {
      bass: ['E2', 'E2', 'G2', 'E2', 'A2', 'E2', 'D2', 'F2'],
      melody: ['E4', 'B4', 'E4', 'D4', 'G4', 'A4', 'B4', 'E5', 'D5', 'A4', 'B4', 'G4', 'A4', 'F4', 'E4', 'D4']
    }
  },
  {
    id: 'track-3',
    title: 'Neon Horizon',
    artist: 'Subgrid Protocol',
    duration: 210,
    bpm: 90,
    genre: 'Ambient Retrowave',
    gradient: 'from-cyan-500/20 to-pink-500/20',
    notes: {
      bass: ['F2', 'C3', 'G2', 'D3', 'A2', 'E3', 'C2', 'G2'],
      melody: ['A4', 'C5', 'E5', 'G5', 'E5', 'C5', 'G4', 'E4', 'A4', 'G4', 'A4', 'C5', 'D5', 'E5', 'D5', 'C5']
    }
  }
];

// Map notes to standard frequencies
export const NOTE_FREQS: { [key: string]: number } = {
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
};

export class AudioEngineModel {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  private currentTrackIndex: number = 0;
  private isPlaying: boolean = false;
  private volume: number = 0.5;
  private isMuted: boolean = false;
  private bpm: number = 110;
  private currentTime: number = 0; // Virtual timeline seconds

  // Sequencer properties
  private nextNoteTime: number = 0.0;
  private currentStep: number = 0;
  private lookaheadMs: number = 25.0;
  private scheduleAheadTimeSec: number = 0.1;
  private timerId: number | null = null;
  private timeTrackerId: number | null = null;

  // Listeners
  private onStateChange: (() => void) | null = null;

  constructor() {
    this.bpm = TRACKS[0].bpm;
  }

  public registerStateChangeListener(listener: () => void) {
    this.onStateChange = listener;
  }

  private triggerStateChange() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  private initAudio() {
    if (this.ctx) return;

    // Use standard window audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API not supported in this browser');
      return;
    }

    this.ctx = new AudioContextClass();
    
    // Master Gain Node
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

    // Analyser Node
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64; // Small fft for retro bar visualizer

    // Delay Node (Echo effect)
    this.delayNode = this.ctx.createDelay(1.0);
    this.delayGain = this.ctx.createGain();
    
    // Configure delay
    this.delayNode.delayTime.setValueAtTime(0.35, this.ctx.currentTime); // 350ms echo
    this.delayGain.gain.setValueAtTime(0.25, this.ctx.currentTime); // 25% feedback echo

    // Connect nodes: Synth -> Delay -> Master -> Analyser -> Output
    // Delay feedback loop
    this.delayNode.connect(this.delayGain);
    this.delayGain.connect(this.delayNode);

    // Main mix routing
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  public start() {
    this.initAudio();

    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;

    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime;
    this.currentStep = 0;

    // Start Sequencer Loop
    this.scheduler();
    
    // Virtual Playback Time Tracker
    this.startTimeTracker();

    this.triggerStateChange();
  }

  public pause() {
    this.isPlaying = false;
    
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (this.timeTrackerId) {
      clearInterval(this.timeTrackerId);
      this.timeTrackerId = null;
    }

    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }

    this.triggerStateChange();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    this.triggerStateChange();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    this.triggerStateChange();
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(60, Math.min(200, newBpm));
    this.triggerStateChange();
  }

  public getTrack(): Track {
    return TRACKS[this.currentTrackIndex];
  }

  public nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % TRACKS.length;
    this.bpm = TRACKS[this.currentTrackIndex].bpm;
    this.currentTime = 0;
    this.currentStep = 0;
    if (this.isPlaying) {
      if (this.ctx) {
        this.nextNoteTime = this.ctx.currentTime;
      }
    }
    this.triggerStateChange();
  }

  public prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    this.bpm = TRACKS[this.currentTrackIndex].bpm;
    this.currentTime = 0;
    this.currentStep = 0;
    if (this.isPlaying) {
      if (this.ctx) {
        this.nextNoteTime = this.ctx.currentTime;
      }
    }
    this.triggerStateChange();
  }

  public seek(seconds: number) {
    const track = this.getTrack();
    this.currentTime = Math.max(0, Math.min(track.duration, seconds));
    this.triggerStateChange();
  }

  // --- AUDIO SYNTHESIS & SEQUENCER ---

  private startTimeTracker() {
    if (this.timeTrackerId) clearInterval(this.timeTrackerId);
    this.timeTrackerId = window.setInterval(() => {
      if (!this.isPlaying) return;
      
      const track = this.getTrack();
      this.currentTime += 1;
      
      if (this.currentTime >= track.duration) {
        // Loop track
        this.currentTime = 0;
      }
      this.triggerStateChange();
    }, 1000);
  }

  private scheduler() {
    if (!this.isPlaying || !this.ctx) return;

    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTimeSec) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.advanceStep();
    }

    // Schedule next callback
    this.timerId = window.setTimeout(() => this.scheduler(), this.lookaheadMs);
  }

  private advanceStep() {
    // We are playing 8th notes, 16 steps per melody pattern loop, 8 steps per bass loop
    const secondsPerStep = 30.0 / this.bpm; // 8th note duration
    this.nextNoteTime += secondsPerStep;
    this.currentStep = (this.currentStep + 1) % 16;
  }

  private scheduleNote(step: number, time: number) {
    if (!this.ctx || !this.masterGain || !this.delayNode) return;

    const track = this.getTrack();

    // 1. Play Kick Drum on beats 1, 5, 9, 13 (step index 0, 4, 8, 12)
    if (step % 4 === 0) {
      this.playSynthKick(time);
    }

    // 2. Play Hi-Hat on steps 2, 6, 10, 14, and sometimes offbeats
    if (step % 2 === 2 || step % 4 === 2) {
      this.playSynthHihat(time);
    }

    // 3. Play Bass Note (8-step loop)
    const bassNoteIndex = step % track.notes.bass.length;
    const bassNoteName = track.notes.bass[bassNoteIndex];
    if (bassNoteName) {
      const freq = NOTE_FREQS[bassNoteName];
      if (freq) {
        this.playSynthBass(freq, time);
      }
    }

    // 4. Play Melody Note (16-step loop)
    const melodyNoteIndex = step % track.notes.melody.length;
    // Add some organic cyber variation by skipping melody notes randomly or playing on specific intervals
    const playMelody = step % 2 === 0 || (step % 3 === 0 && step % 4 !== 0);
    if (playMelody) {
      const melodyNoteName = track.notes.melody[melodyNoteIndex];
      if (melodyNoteName) {
        const freq = NOTE_FREQS[melodyNoteName];
        if (freq) {
          this.playSynthLead(freq, time);
        }
      }
    }
  }

  // --- SYNTHESIZERS ---

  private playSynthKick(time: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'sine';
    
    // Rapid pitch sweep for that thick deep kick drum
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.12);

    // Vol envelope
    gain.gain.setValueAtTime(0.65, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    osc.start(time);
    osc.stop(time + 0.16);
  }

  private playSynthHihat(time: number) {
    if (!this.ctx || !this.masterGain) return;

    // Create high-pass noise hihat using an oscillator + highpass filter or white noise.
    // For absolute stability without buffers, we can create white noise programmatically
    const bufferSize = this.ctx.sampleRate * 0.05; // 50ms hi-hat duration
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000; // Super high-pitch sizzle

    const gain = this.ctx.createGain();

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noiseSource.start(time);
    noiseSource.stop(time + 0.05);
  }

  private playSynthBass(frequency: number, time: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    // Triangle/Sawtooth combination or raw Triangle for solid sub-bass
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, time);

    // Warm retro filter envelope
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, time);
    filter.frequency.exponentialRampToValueAtTime(80, time + 0.22);
    filter.Q.setValueAtTime(4, time);

    // Vol envelope
    const duration = 30 / this.bpm; // 8th note duration
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  private playSynthLead(frequency: number, time: number) {
    if (!this.ctx || !this.masterGain || !this.delayNode) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Route lead synth directly to delay engine as well to get lush spacey echoes
    osc.connect(filter);
    filter.connect(gain);
    
    // Connect to master mix and delay feedback node
    gain.connect(this.masterGain);
    gain.connect(this.delayNode);

    osc.type = 'square';
    osc.frequency.setValueAtTime(frequency, time);

    // Dynamic bandpass/lowpass cyber sweep
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, time);
    filter.frequency.exponentialRampToValueAtTime(600, time + 0.18);
    filter.Q.setValueAtTime(2, time);

    // Vol envelope
    gain.gain.setValueAtTime(0.09, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  // --- ANALYSIS ---

  public getPlaybackState(): {
    currentTrackId: string;
    isPlaying: boolean;
    currentTime: number;
    volume: number;
    isMuted: boolean;
    bpm: number;
  } {
    return {
      currentTrackId: this.getTrack().id,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      volume: this.volume,
      isMuted: this.isMuted,
      bpm: this.bpm
    };
  }

  public getVisualizerData(): number[] {
    if (!this.analyser || !this.isPlaying) {
      // Return beautiful pulsing dummy data if audio isn't active/playing yet
      const time = Date.now() * 0.003;
      return Array.from({ length: 16 }, (_, i) => 
        Math.floor(20 + Math.sin(time + i * 0.5) * 40 + Math.cos(time * 0.8 - i * 0.2) * 20)
      );
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Downsample bufferLength to 16 bars for the sidebar layout
    const numBars = 16;
    const itemsPerBar = Math.floor(bufferLength / numBars);
    const bars: number[] = [];

    for (let i = 0; i < numBars; i++) {
      let sum = 0;
      for (let j = 0; j < itemsPerBar; j++) {
        sum += dataArray[i * itemsPerBar + j] || 0;
      }
      const avg = sum / itemsPerBar;
      bars.push(Math.round(avg));
    }

    return bars;
  }
}

// Global instance to share between controllers
export const audioEngine = new AudioEngineModel();
export default audioEngine;
