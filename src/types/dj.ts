export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string; // Camelot key e.g. "8A", "5A"
  genre: string;
  duration: number; // in seconds
  color: string;
  coverArtSvg?: string;
  isUserUploaded?: boolean;
  audioBuffer?: AudioBuffer;
  synthesizerPreset?: 'shibuya_disco' | 'cyber_funk' | 'starlight_house' | 'acid_synth' | 'lofi_chill' | 'vocal_chops';
  hotcues?: number[]; // default cue timestamps
  tags: string[];
}

export interface DeckState {
  id: 'A' | 'B';
  track: Track | null;
  isPlaying: boolean;
  playbackRate: number; // 1.0 = normal
  pitchPercent: number; // -16% to +16%
  keyLock: boolean;
  volume: number; // 0 to 1
  gainTrim: number; // 0.5 to 1.5
  highEq: number; // -26 to +6 dB
  midEq: number;
  lowEq: number;
  highKill: boolean;
  midKill: boolean;
  lowKill: boolean;
  filterFreq: number; // 0 (full LPF) to 1 (full HPF), 0.5 = flat/off
  filterRes: number; // resonance
  cueTime: number; // main CUE point in seconds
  currentTime: number;
  hotcues: { [slot: number]: number }; // slot 1-4
  loopActive: boolean;
  loopLengthBeats: number; // 0.5, 1, 2, 4, 8, 16
  loopStartTime: number;
  vuLevel: number; // 0 to 1
  isScratching: boolean;
  stemVocals: number; // 0 to 1 volume
  stemDrums: number;
  stemMelody: number;
}

export interface FXState {
  filterType: 'hpf' | 'lpf' | 'off';
  delayActive: boolean;
  delayTimeBeats: number; // 0.25, 0.5, 0.75, 1
  delayFeedback: number; // 0 to 0.85
  delayMix: number; // 0 to 1
  reverbActive: boolean;
  reverbMix: number;
  flangerActive: boolean;
  flangerMix: number;
  bitcrusherActive: boolean;
  bitcrushBits: number; // 4 to 16
}

export interface MasterState {
  crossfader: number; // -1 (Deck A) to +1 (Deck B), 0 = center
  crossfaderCurve: 'smooth' | 'scratch' | 'linear';
  masterVolume: number;
  boothVolume: number;
  cueSplit: boolean;
  cueDeckA: boolean;
  cueDeckB: boolean;
  isRecording: boolean;
  recordingDuration: number;
  recordedAudioUrl: string | null;
}

export interface TutorialLesson {
  id: string;
  tier: 1 | 2 | 3 | 4 | 5;
  tierName: 'Novice' | 'Apprentice' | 'Club DJ' | 'Remixer' | 'Headliner';
  title: string;
  description: string;
  targetControl?: 'cue' | 'play' | 'sync' | 'pitch' | 'crossfader' | 'eq_low' | 'filter' | 'hotcue' | 'loop' | 'jogwheel';
  highlightDeck?: 'A' | 'B' | 'mixer';
  bubbleText: string;
  practiceGoal: string;
  xpReward: number;
  badgeReward?: {
    id: string;
    title: string;
    icon: string;
    description: string;
  };
  exerciseType: 'interactive_cue' | 'beatmatch_transient' | 'bass_swap' | 'hotcue_mashup' | 'filter_drop';
  passCriteriaExplanation: string;
}

export interface UserAwardState {
  xp: number;
  level: number;
  rankTitle: string;
  completedLessonIds: string[];
  earnedBadges: Array<{
    id: string;
    title: string;
    icon: string;
    description: string;
    earnedAt: string;
  }>;
  stats: {
    transitionsCompleted: number;
    perfectSyncs: number;
    scratchSeconds: number;
    mixesShared: number;
  };
}

export interface MIDIMappingItem {
  id: string;
  target: 'crossfader' | 'deckA_play' | 'deckA_cue' | 'deckA_pitch' | 'deckA_low' | 'deckA_filter' | 'deckB_play' | 'deckB_cue' | 'deckB_pitch' | 'deckB_low' | 'deckB_filter';
  midiType: 'cc' | 'note';
  channel: number;
  controlNumber: number;
}
