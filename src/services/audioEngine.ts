import { DeckState, FXState, MasterState, Track } from '../types/dj';

class DJAudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;

  // Deck A audio nodes
  private deckANodes = {
    source: null as AudioBufferSourceNode | null,
    lowEq: null as BiquadFilterNode | null,
    midEq: null as BiquadFilterNode | null,
    highEq: null as BiquadFilterNode | null,
    filter: null as BiquadFilterNode | null,
    gain: null as GainNode | null,
    crossfaderGain: null as GainNode | null,
    analyser: null as AnalyserNode | null,
    buffer: null as AudioBuffer | null,
    startTime: 0,
    pauseOffset: 0,
    isPlaying: false,
  };

  // Deck B audio nodes
  private deckBNodes = {
    source: null as AudioBufferSourceNode | null,
    lowEq: null as BiquadFilterNode | null,
    midEq: null as BiquadFilterNode | null,
    highEq: null as BiquadFilterNode | null,
    filter: null as BiquadFilterNode | null,
    gain: null as GainNode | null,
    crossfaderGain: null as GainNode | null,
    analyser: null as AnalyserNode | null,
    buffer: null as AudioBuffer | null,
    startTime: 0,
    pauseOffset: 0,
    isPlaying: false,
  };

  // Master & FX nodes
  private masterGain: GainNode | null = null;
  private masterAnalyser: AnalyserNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedbackGain: GainNode | null = null;
  private delayWetGain: GainNode | null = null;
  private reverbConvolver: ConvolverNode | null = null;
  private reverbWetGain: GainNode | null = null;
  private mediaStreamDestination: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  // Procedural cache of pre-rendered tracks
  private synthesizedBufferCache = new Map<string, AudioBuffer>();

  public async init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass({ latencyHint: 'interactive' });

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 256;
    this.masterAnalyser.smoothingTimeConstant = 0.8;

    // Master FX: Delay
    this.delayNode = this.ctx.createDelay(2.0);
    this.delayNode.delayTime.setValueAtTime(0.234, this.ctx.currentTime); // ~1/2 beat at 128 bpm
    this.delayFeedbackGain = this.ctx.createGain();
    this.delayFeedbackGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.delayWetGain = this.ctx.createGain();
    this.delayWetGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.delayNode.connect(this.delayFeedbackGain);
    this.delayFeedbackGain.connect(this.delayNode);
    this.delayNode.connect(this.delayWetGain);

    // Master FX: Reverb (Algorithmic impulse response)
    this.reverbConvolver = this.ctx.createConvolver();
    this.reverbConvolver.buffer = this.createReverbImpulse(1.8, 2.0);
    this.reverbWetGain = this.ctx.createGain();
    this.reverbWetGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.reverbConvolver.connect(this.reverbWetGain);

    // Setup Deck A Chain
    this.deckANodes.lowEq = this.ctx.createBiquadFilter();
    this.deckANodes.lowEq.type = 'lowshelf';
    this.deckANodes.lowEq.frequency.setValueAtTime(250, this.ctx.currentTime);

    this.deckANodes.midEq = this.ctx.createBiquadFilter();
    this.deckANodes.midEq.type = 'peaking';
    this.deckANodes.midEq.frequency.setValueAtTime(1200, this.ctx.currentTime);
    this.deckANodes.midEq.Q.setValueAtTime(1.0, this.ctx.currentTime);

    this.deckANodes.highEq = this.ctx.createBiquadFilter();
    this.deckANodes.highEq.type = 'highshelf';
    this.deckANodes.highEq.frequency.setValueAtTime(4500, this.ctx.currentTime);

    this.deckANodes.filter = this.ctx.createBiquadFilter();
    this.deckANodes.filter.type = 'allpass';
    this.deckANodes.filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    this.deckANodes.gain = this.ctx.createGain();
    this.deckANodes.crossfaderGain = this.ctx.createGain();
    this.deckANodes.analyser = this.ctx.createAnalyser();
    this.deckANodes.analyser.fftSize = 256;

    // Deck A wiring: low -> mid -> high -> filter -> gain -> crossfaderGain -> masterGain & FX & analyser
    this.deckANodes.lowEq.connect(this.deckANodes.midEq);
    this.deckANodes.midEq.connect(this.deckANodes.highEq);
    this.deckANodes.highEq.connect(this.deckANodes.filter);
    this.deckANodes.filter.connect(this.deckANodes.gain);
    this.deckANodes.gain.connect(this.deckANodes.crossfaderGain);
    this.deckANodes.crossfaderGain.connect(this.deckANodes.analyser);
    this.deckANodes.crossfaderGain.connect(this.masterGain);
    this.deckANodes.crossfaderGain.connect(this.delayNode);
    this.deckANodes.crossfaderGain.connect(this.reverbConvolver);

    // Setup Deck B Chain
    this.deckBNodes.lowEq = this.ctx.createBiquadFilter();
    this.deckBNodes.lowEq.type = 'lowshelf';
    this.deckBNodes.lowEq.frequency.setValueAtTime(250, this.ctx.currentTime);

    this.deckBNodes.midEq = this.ctx.createBiquadFilter();
    this.deckBNodes.midEq.type = 'peaking';
    this.deckBNodes.midEq.frequency.setValueAtTime(1200, this.ctx.currentTime);
    this.deckBNodes.midEq.Q.setValueAtTime(1.0, this.ctx.currentTime);

    this.deckBNodes.highEq = this.ctx.createBiquadFilter();
    this.deckBNodes.highEq.type = 'highshelf';
    this.deckBNodes.highEq.frequency.setValueAtTime(4500, this.ctx.currentTime);

    this.deckBNodes.filter = this.ctx.createBiquadFilter();
    this.deckBNodes.filter.type = 'allpass';
    this.deckBNodes.filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    this.deckBNodes.gain = this.ctx.createGain();
    this.deckBNodes.crossfaderGain = this.ctx.createGain();
    this.deckBNodes.analyser = this.ctx.createAnalyser();
    this.deckBNodes.analyser.fftSize = 256;

    // Deck B wiring
    this.deckBNodes.lowEq.connect(this.deckBNodes.midEq);
    this.deckBNodes.midEq.connect(this.deckBNodes.highEq);
    this.deckBNodes.highEq.connect(this.deckBNodes.filter);
    this.deckBNodes.filter.connect(this.deckBNodes.gain);
    this.deckBNodes.gain.connect(this.deckBNodes.crossfaderGain);
    this.deckBNodes.crossfaderGain.connect(this.deckBNodes.analyser);
    this.deckBNodes.crossfaderGain.connect(this.masterGain);
    this.deckBNodes.crossfaderGain.connect(this.delayNode);
    this.deckBNodes.crossfaderGain.connect(this.reverbConvolver);

    // Connect FX returns to master
    this.delayWetGain.connect(this.masterGain);
    this.reverbWetGain.connect(this.masterGain);

    // Destination & recording
    this.masterGain.connect(this.masterAnalyser);
    this.masterGain.connect(this.ctx.destination);

    this.mediaStreamDestination = this.ctx.createMediaStreamDestination();
    this.masterGain.connect(this.mediaStreamDestination);

    this.isInitialized = true;
  }

  // Create smooth stereo algorithmic reverb impulse response
  private createReverbImpulse(durationSeconds: number, decay: number): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not ready');
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * durationSeconds;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const dec = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * dec;
      right[i] = (Math.random() * 2 - 1) * dec;
    }
    return impulse;
  }

  // Procedural Synth: Generates real, rich disco funk audio buffers without network files
  public async getOrSynthesizeTrack(track: Track): Promise<AudioBuffer> {
    await this.init();
    if (!this.ctx) throw new Error('Audio context failed to start');

    if (track.audioBuffer) {
      return track.audioBuffer;
    }

    if (this.synthesizedBufferCache.has(track.id)) {
      return this.synthesizedBufferCache.get(track.id)!;
    }

    const sampleRate = this.ctx.sampleRate;
    const duration = Math.min(180, track.duration || 120);
    const bpm = track.bpm || 128;
    const beatDuration = 60 / bpm;
    const totalSamples = Math.floor(sampleRate * duration);

    const buffer = this.ctx.createBuffer(2, totalSamples, sampleRate);
    const channelL = buffer.getChannelData(0);
    const channelR = buffer.getChannelData(1);

    // Key base pitch (A minor = 55Hz bass, C minor = 65.4Hz bass, etc.)
    const baseFreq = track.key.includes('8A') ? 55.0 : track.key.includes('5A') ? 65.4 : 58.27;

    // Synthesize 4/4 Disco Grooves
    const totalBeats = Math.floor(duration / beatDuration);

    for (let beat = 0; beat < totalBeats; beat++) {
      const beatStartSample = Math.floor(beat * beatDuration * sampleRate);
      const isBarDownbeat = beat % 4 === 0;

      // 1. Kick Drum (Punchy 4-on-the-floor)
      const kickLength = Math.floor(sampleRate * 0.25);
      for (let i = 0; i < kickLength && beatStartSample + i < totalSamples; i++) {
        const t = i / sampleRate;
        const kickPitch = 140 * Math.exp(-t * 28) + 42;
        const kickEnv = Math.exp(-t * 14);
        const kickWave = Math.sin(2 * Math.PI * kickPitch * t) * kickEnv * 0.85;
        channelL[beatStartSample + i] += kickWave;
        channelR[beatStartSample + i] += kickWave;
      }

      // 2. Off-Beat Disco Open Hi-Hat (Every "and" of the beat)
      const hatStart = beatStartSample + Math.floor(beatDuration * 0.5 * sampleRate);
      const hatLength = Math.floor(sampleRate * 0.18);
      for (let i = 0; i < hatLength && hatStart + i < totalSamples; i++) {
        const t = i / sampleRate;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 22) * 0.24;
        channelL[hatStart + i] += noise * 0.9;
        channelR[this.hatStartStart(hatStart + i, totalSamples)] += noise * 1.1;
      }

      // 3. Disco Slap Bass arpeggio (Octaves and syncopation)
      const bassNoteMult = (beat % 4 === 0) ? 1.0 : (beat % 4 === 1) ? 1.33 : (beat % 4 === 2) ? 1.5 : 2.0;
      const bassFreq = baseFreq * bassNoteMult;
      const bassLength = Math.floor(sampleRate * (beatDuration * 0.45));
      for (let i = 0; i < bassLength && beatStartSample + i < totalSamples; i++) {
        const t = i / sampleRate;
        // Rich sawtooth with low-pass roll-off
        const fundamental = Math.sin(2 * Math.PI * bassFreq * t);
        const harmonic2 = 0.5 * Math.sin(2 * Math.PI * bassFreq * 2 * t);
        const harmonic3 = 0.25 * Math.sin(2 * Math.PI * bassFreq * 3 * t);
        const env = Math.exp(-t * 7);
        const bassVal = (fundamental + harmonic2 + harmonic3) * env * 0.38;
        channelL[beatStartSample + i] += bassVal;
        channelR[beatStartSample + i] += bassVal;
      }

      // 4. Disco Synth Pad / Chord Stabs on beats 2 and 4
      if (beat % 2 === 1) {
        const stabLength = Math.floor(sampleRate * 0.35);
        const chordFreqs = [baseFreq * 4, baseFreq * 4 * 1.2, baseFreq * 4 * 1.5]; // Minor / Major Triad
        for (let i = 0; i < stabLength && beatStartSample + i < totalSamples; i++) {
          const t = i / sampleRate;
          let chordVal = 0;
          for (const f of chordFreqs) {
            chordVal += Math.sin(2 * Math.PI * f * t);
          }
          const env = Math.exp(-t * 5.5) * 0.18;
          channelL[beatStartSample + i] += chordVal * env * 0.7;
          channelR[beatStartSample + i] += chordVal * env * 0.9;
        }
      }

      // 5. Vocal chop simulation (on bar 4 or 8)
      if (isBarDownbeat && (beat / 4) % 4 === 2) {
        const vocalLength = Math.floor(sampleRate * 0.4);
        for (let i = 0; i < vocalLength && beatStartSample + i < totalSamples; i++) {
          const t = i / sampleRate;
          const vocalFormant = Math.sin(2 * Math.PI * 650 * t) * Math.sin(2 * Math.PI * 1800 * t);
          const vocalVal = vocalFormant * Math.exp(-t * 8) * 0.28;
          channelL[beatStartSample + i] += vocalVal;
          channelR[beatStartSample + i] += vocalVal * 0.8;
        }
      }
    }

    // Gentle normalizer to prevent digital clipping
    let maxPeak = 0;
    for (let i = 0; i < totalSamples; i++) {
      if (Math.abs(channelL[i]) > maxPeak) maxPeak = Math.abs(channelL[i]);
      if (Math.abs(channelR[i]) > maxPeak) maxPeak = Math.abs(channelR[i]);
    }
    if (maxPeak > 0.95) {
      const scale = 0.95 / maxPeak;
      for (let i = 0; i < totalSamples; i++) {
        channelL[i] *= scale;
        channelR[i] *= scale;
      }
    }

    this.synthesizedBufferCache.set(track.id, buffer);
    return buffer;
  }

  private hatStartStart(idx: number, max: number): number {
    return Math.min(idx, max - 1);
  }

  // Decode uploaded audio file (MP3, WAV, WebM)
  public async decodeAudioFile(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    await this.init();
    if (!this.ctx) throw new Error('AudioContext unavailable');
    return await this.ctx.decodeAudioData(arrayBuffer);
  }

  // Play a deck from specific time offset
  public async playDeck(deckId: 'A' | 'B', track: Track, startTimeOffset = 0, playbackRate = 1.0) {
    await this.init();
    if (!this.ctx) return;

    const deck = deckId === 'A' ? this.deckANodes : this.deckBNodes;
    const buffer = await this.getOrSynthesizeTrack(track);
    deck.buffer = buffer;

    // Stop previous instance if playing
    if (deck.source) {
      try {
        deck.source.stop();
        deck.source.disconnect();
      } catch {
        // Source might already have stopped
      }
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(playbackRate, this.ctx.currentTime);
    source.loop = true;

    // Connect to Deck EQ chain
    if (deck.lowEq) {
      source.connect(deck.lowEq);
    }

    const safeOffset = Math.max(0, Math.min(buffer.duration - 0.1, startTimeOffset));
    source.start(0, safeOffset);

    deck.source = source;
    deck.startTime = this.ctx.currentTime - safeOffset / playbackRate;
    deck.pauseOffset = safeOffset;
    deck.isPlaying = true;
  }

  // Pause a deck
  public pauseDeck(deckId: 'A' | 'B', currentTime: number) {
    const deck = deckId === 'A' ? this.deckANodes : this.deckBNodes;
    if (deck.source) {
      try {
        deck.source.stop();
        deck.source.disconnect();
      } catch {
        // Already stopped
      }
      deck.source = null;
    }
    deck.isPlaying = false;
    deck.pauseOffset = currentTime;
  }

  // Update deck playback rate (tempo pitch / scratch)
  public setPlaybackRate(deckId: 'A' | 'B', rate: number) {
    const deck = deckId === 'A' ? this.deckANodes : this.deckBNodes;
    if (deck.source && this.ctx) {
      const clampedRate = Math.max(0.1, Math.min(3.0, rate));
      deck.source.playbackRate.setValueAtTime(clampedRate, this.ctx.currentTime);
    }
  }

  // Scratch nudge gesture: dynamically scrub time and pitch bend
  public scratchNudge(deckId: 'A' | 'B', delta: number) {
    const deck = deckId === 'A' ? this.deckANodes : this.deckBNodes;
    if (deck.source && this.ctx && deck.isPlaying) {
      // Temporary pitch flick
      const currentRate = deck.source.playbackRate.value;
      const targetRate = Math.max(0.2, Math.min(2.5, currentRate + delta * 2.5));
      deck.source.playbackRate.setValueAtTime(targetRate, this.ctx.currentTime);
      deck.source.playbackRate.exponentialRampToValueAtTime(Math.max(0.5, currentRate), this.ctx.currentTime + 0.12);
    }
  }

  // Update 3-band EQ and Kills
  public updateDeckEQ(
    deckId: 'A' | 'B',
    highDb: number,
    midDb: number,
    lowDb: number,
    highKill: boolean,
    midKill: boolean,
    lowKill: boolean
  ) {
    if (!this.ctx) return;
    const deck = deckId === 'A' ? this.deckANodes : this.deckBNodes;
    const now = this.ctx.currentTime;

    if (deck.highEq) {
      const targetHigh = highKill ? -70 : Math.max(-26, Math.min(6, highDb));
      deck.highEq.gain.setValueAtTime(targetHigh, now);
    }
    if (deck.midEq) {
      const targetMid = midKill ? -70 : Math.max(-26, Math.min(6, midDb));
      deck.midEq.gain.setValueAtTime(targetMid, now);
    }
    if (deck.lowEq) {
      const targetLow = lowKill ? -70 : Math.max(-26, Math.min(6, lowDb));
      deck.lowEq.gain.setValueAtTime(targetLow, now);
    }
  }

  // Bi-directional DJ Filter: 0 = Full LPF, 0.5 = Flat, 1 = Full HPF
  public updateDeckFilter(deckId: 'A' | 'B', filterPos: number, resonance = 1.5) {
    if (!this.ctx) return;
    const deck = deckId === 'A' ? this.deckANodes : this.deckBNodes;
    const now = this.ctx.currentTime;
    if (!deck.filter) return;

    if (Math.abs(filterPos - 0.5) < 0.03) {
      // Neutral / Bypassed
      deck.filter.type = 'allpass';
      deck.filter.frequency.setValueAtTime(1000, now);
      deck.filter.Q.setValueAtTime(1.0, now);
    } else if (filterPos < 0.5) {
      // Low Pass Filter sweep (20000Hz down to 80Hz)
      deck.filter.type = 'lowpass';
      const norm = filterPos / 0.5; // 0 to 1
      const freq = 80 * Math.pow(20000 / 80, norm);
      deck.filter.frequency.setValueAtTime(Math.max(60, Math.min(20000, freq)), now);
      deck.filter.Q.setValueAtTime(resonance, now);
    } else {
      // High Pass Filter sweep (20Hz up to 8000Hz)
      deck.filter.type = 'highpass';
      const norm = (filterPos - 0.5) / 0.5; // 0 to 1
      const freq = 20 * Math.pow(8000 / 20, norm);
      deck.filter.frequency.setValueAtTime(Math.max(20, Math.min(10000, freq)), now);
      deck.filter.Q.setValueAtTime(resonance, now);
    }
  }

  // Crossfader and Deck gains
  public updateMixerGains(
    crossfader: number, // -1 (Deck A) to +1 (Deck B)
    curve: 'smooth' | 'scratch' | 'linear',
    gainA: number,
    gainB: number,
    masterVol: number
  ) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Crossfader calculation (-1 to +1 -> 0 to 1 normalized)
    const x = (crossfader + 1) / 2; // 0 = A, 0.5 = center, 1 = B
    let volA = 1;
    let volB = 1;

    if (curve === 'scratch') {
      // Fast cut curve
      volA = x > 0.92 ? (1 - x) / 0.08 : 1.0;
      volB = x < 0.08 ? x / 0.08 : 1.0;
    } else if (curve === 'linear') {
      volA = 1 - x;
      volB = x;
    } else {
      // Smooth Equal Power (constant loudness)
      volA = Math.cos(x * 0.5 * Math.PI);
      volB = Math.sin(x * 0.5 * Math.PI);
    }

    if (this.deckANodes.crossfaderGain) {
      this.deckANodes.crossfaderGain.gain.setValueAtTime(volA * gainA, now);
    }
    if (this.deckBNodes.crossfaderGain) {
      this.deckBNodes.crossfaderGain.gain.setValueAtTime(volB * gainB, now);
    }
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(masterVol, now);
    }
  }

  // Update Master FX Rack
  public updateFX(fx: FXState) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Delay
    if (this.delayWetGain && this.delayNode && this.delayFeedbackGain) {
      const wet = fx.delayActive ? fx.delayMix : 0.0;
      this.delayWetGain.gain.setValueAtTime(wet, now);
      this.delayFeedbackGain.gain.setValueAtTime(fx.delayFeedback, now);
      this.delayNode.delayTime.setValueAtTime(fx.delayTimeBeats * (60 / 128), now);
    }

    // Reverb
    if (this.reverbWetGain) {
      const wet = fx.reverbActive ? fx.reverbMix : 0.0;
      this.reverbWetGain.gain.setValueAtTime(wet, now);
    }
  }

  // Real-time VU Levels for Deck A, Deck B, and Master
  public getDeckVU(deckId: 'A' | 'B'): number {
    const deck = deckId === 'A' ? this.deckANodes : this.deckBNodes;
    if (!deck.analyser || !deck.isPlaying) return 0;
    const data = new Uint8Array(deck.analyser.frequencyBinCount);
    deck.analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    const avg = sum / (data.length * 255);
    return Math.min(1.0, avg * 2.2);
  }

  public getMasterVU(): number {
    if (!this.masterAnalyser) return 0;
    const data = new Uint8Array(this.masterAnalyser.frequencyBinCount);
    this.masterAnalyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return Math.min(1.0, (sum / (data.length * 255)) * 2.0);
  }

  // Real-time frequency byte data for high-contrast multi-band waveform
  public getDeckFrequencyData(deckId: 'A' | 'B', array: Uint8Array) {
    const deck = deckId === 'A' ? this.deckANodes : this.deckBNodes;
    if (deck.analyser && deck.isPlaying) {
      deck.analyser.getByteFrequencyData(array as any);
    } else {
      array.fill(0);
    }
  }

  // Live Mix Recording (MediaRecorder)
  public startRecording(): boolean {
    if (!this.mediaStreamDestination) return false;
    try {
      this.recordedChunks = [];
      const stream = this.mediaStreamDestination.stream;
      const options = { mimeType: 'audio/webm;codecs=opus' };
      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(200);
      return true;
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
      return false;
    }
  }

  public stopRecording(): Promise<string> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve('');
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };

      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    });
  }
}

export const audioEngine = new DJAudioEngine();
