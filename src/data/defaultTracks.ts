import { Track } from '../types/dj';

export const DEFAULT_TRACKS: Track[] = [
  {
    id: 'shibuya-neon-rush',
    title: 'Shibuya Neon Rush',
    artist: 'Tokyo Soundworks',
    bpm: 128,
    key: '8A', // A minor
    genre: 'Cyber City Pop / Disco',
    duration: 180,
    color: '#ff2a85',
    synthesizerPreset: 'shibuya_disco',
    hotcues: [0, 15, 30, 60],
    tags: ['4/4 Disco', 'Groovy Bass', 'Drop at 0:30', '128 BPM'],
  },
  {
    id: 'midnight-mirage',
    title: 'Midnight Mirage',
    artist: 'Kaori & The Androids',
    bpm: 124,
    key: '5A', // C minor (Compatible with 8A for smooth harmonic shift)
    genre: 'Minimal Future Funk',
    duration: 195,
    color: '#00f0ff',
    synthesizerPreset: 'cyber_funk',
    hotcues: [0, 15.48, 30.96, 61.92],
    tags: ['Slap Bass', 'Chic Disco Rhythm', 'Harmonic Match 5A', '124 BPM'],
  },
  {
    id: 'starlight-horizon',
    title: 'Starlight Horizon',
    artist: 'Neo Tokyo Disco Club',
    bpm: 120,
    key: '9B', // G major
    genre: 'French Touch / Disco House',
    duration: 210,
    color: '#ffb800',
    synthesizerPreset: 'starlight_house',
    hotcues: [0, 16, 32, 64],
    tags: ['Filter House', 'Pumped Kick', 'Vocal Stabs', '120 BPM'],
  },
  {
    id: 'akira-drift-club',
    title: 'Akira Drift Club',
    artist: 'SubAtomic x Cyberline',
    bpm: 130,
    key: '4A', // F minor
    genre: 'Neo-Tokyo Acid Synth',
    duration: 175,
    color: '#a855f7',
    synthesizerPreset: 'acid_synth',
    hotcues: [0, 14.76, 29.53, 59.07],
    tags: ['Resonant Acid', 'Driving Groove', 'Peak Time Energy', '130 BPM'],
  },
  {
    id: 'cherry-blossom-lofi',
    title: 'Cherry Blossom Sunset Groove',
    artist: 'Yumi Beats',
    bpm: 85,
    key: '11B', // A major
    genre: 'Anime Chillhop / Halftime',
    duration: 160,
    color: '#ec4899',
    synthesizerPreset: 'lofi_chill',
    hotcues: [0, 11.29, 22.58, 45.17],
    tags: ['Lush Rhodes', 'Lo-Fi Vinyl Crackle', 'Half-Time', '85 BPM'],
  },
  {
    id: 'anime-vocal-chop-pack',
    title: 'Cyber Angel Vocals & Chops (Dry Stem)',
    artist: 'Kaori Sound Lab',
    bpm: 128,
    key: '8A', // A minor
    genre: 'Acapella / Vocal Chops Tool',
    duration: 120,
    color: '#10b981',
    synthesizerPreset: 'vocal_chops',
    hotcues: [0, 3.75, 7.5, 15],
    tags: ['Dry Vocal Stems', 'Remix Tool', 'Instant Mashup', '128 BPM'],
  },
];
