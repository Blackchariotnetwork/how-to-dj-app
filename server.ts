import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize Google Gen AI client with required User-Agent
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// In-Memory state for Community Mixes & Social Sharing
interface CommunityMix {
  id: string;
  title: string;
  djName: string;
  avatarSeed: string;
  genre: string;
  bpm: number;
  durationSeconds: number;
  createdAt: string;
  tracklist: string[];
  description: string;
  likes: number;
  fireRating: number;
  smoothRating: number;
  grooveRating: number;
  comments: Array<{
    id: string;
    user: string;
    text: string;
    timestamp: string;
  }>;
  audioPreviewUrl?: string;
  waveformSnippet?: number[];
}

let communityMixes: CommunityMix[] = [
  {
    id: 'mix-1',
    title: 'Midnight Shibuya Cyber Groove (Vol. 1)',
    djName: 'DJ NeonKitsune',
    avatarSeed: 'kitsune',
    genre: 'Future Funk / City Pop',
    bpm: 126,
    durationSeconds: 184,
    createdAt: '2026-10-28T18:30:00Z',
    tracklist: ['Shibuya Neon Rush (Original Mix)', 'Midnight Mirage (Dub Edit)'],
    description: 'Crisp 32-bar bass swap transition with resonant high-pass filter riser.',
    likes: 142,
    fireRating: 98,
    smoothRating: 95,
    grooveRating: 99,
    comments: [
      { id: 'c1', user: 'AkiraGrooves', text: 'That 3-band EQ kill at 1:12 was lethal! Smooth phrasing.', timestamp: '2h ago' },
      { id: 'c2', user: 'VaporPulse', text: 'Perfect harmonic blend from 8A to 5A! 10/10.', timestamp: '1h ago' },
    ],
    waveformSnippet: [0.3, 0.5, 0.8, 0.9, 0.7, 0.6, 0.85, 1.0, 0.4, 0.6, 0.7, 0.9, 0.8, 0.5, 0.3],
  },
  {
    id: 'mix-2',
    title: 'Akihabara Retro Arcade Bass Session',
    djName: 'DJ Yumi Star',
    avatarSeed: 'yumi',
    genre: 'Anime Disco House',
    bpm: 128,
    durationSeconds: 210,
    createdAt: '2026-10-27T22:15:00Z',
    tracklist: ['Starlight Horizon', 'Anime Vocal Acapella Chop (A minor)'],
    description: 'Live hotcue mashup blending French touch disco filters with 90s anime vocal chops.',
    likes: 89,
    fireRating: 92,
    smoothRating: 88,
    grooveRating: 96,
    comments: [
      { id: 'c3', user: 'TokyoSubway', text: 'Those hotcue vocal rolls are on point!', timestamp: '4h ago' },
    ],
    waveformSnippet: [0.4, 0.6, 0.7, 0.8, 0.95, 0.7, 0.5, 0.8, 0.9, 0.85, 0.6, 0.5, 0.4],
  },
  {
    id: 'mix-3',
    title: 'Neo-Tokyo Rooftop Acid Sunrise',
    djName: 'SubAtomic',
    avatarSeed: 'subatomic',
    genre: 'Cyber Acid Synth',
    bpm: 130,
    durationSeconds: 245,
    createdAt: '2026-10-26T14:00:00Z',
    tracklist: ['Akira Drift Club', 'Shibuya Neon Rush'],
    description: 'Deep ping-pong delay and resonant filter transition into the drop.',
    likes: 114,
    fireRating: 95,
    smoothRating: 91,
    grooveRating: 93,
    comments: [
      { id: 'c4', user: 'CyberRider', text: 'Pure energy, tempo sync locked in perfectly.', timestamp: '1d ago' },
    ],
    waveformSnippet: [0.2, 0.4, 0.6, 0.9, 0.95, 1.0, 0.8, 0.7, 0.9, 0.85, 0.4, 0.2],
  },
];

// Back-to-Back (B2B) Collaborative Sessions
interface B2BRoom {
  roomCode: string;
  name: string;
  createdAt: number;
  lastUpdated: number;
  deckA: {
    trackId: string;
    isPlaying: boolean;
    bpm: number;
    currentTime: number;
    djName: string;
  };
  deckB: {
    trackId: string;
    isPlaying: boolean;
    bpm: number;
    currentTime: number;
    djName: string;
  };
  crossfader: number; // 0 = Deck A, 1 = Deck B
  activeTurnDj: string;
  chatMessages: Array<{
    id: string;
    dj: string;
    message: string;
    time: string;
  }>;
}

const b2bRooms = new Map<string, B2BRoom>();

// Initialize a default public demo B2B session
b2bRooms.set('TOKYO-B2B', {
  roomCode: 'TOKYO-B2B',
  name: 'Shibuya Skyline Session',
  createdAt: Date.now(),
  lastUpdated: Date.now(),
  deckA: {
    trackId: 'shibuya-neon-rush',
    isPlaying: true,
    bpm: 128,
    currentTime: 14.2,
    djName: 'Sensei Kaori',
  },
  deckB: {
    trackId: 'midnight-mirage',
    isPlaying: false,
    bpm: 124,
    currentTime: 0,
    djName: 'Guest DJ',
  },
  crossfader: 0.2,
  activeTurnDj: 'Guest DJ',
  chatMessages: [
    { id: 'm1', dj: 'Sensei Kaori', message: 'Deck A is pumping at 128 BPM! Align Deck B and prepare the low-end swap at bar 32.', time: 'Just now' },
  ],
});

// Camelot Wheel Harmonic Mixing Table
const camelotCompatibleKeys: Record<string, string[]> = {
  '8A': ['8A', '7A', '9A', '8B'], // A minor -> Dm, Em, C Major
  '5A': ['5A', '4A', '6A', '5B'], // C minor -> Fm, Gm, Eb Major
  '9B': ['9B', '8B', '10B', '9A'], // G major -> C Maj, D Maj, E minor
  '4A': ['4A', '3A', '5A', '4B'], // F minor -> Bbm, Cm, Ab Major
  '11B': ['11B', '10B', '12B', '11A'], // A major -> D Maj, E Maj, F# minor
  '8B': ['8B', '7B', '9B', '8A'], // C major -> F Maj, G Maj, A minor
};

// API: AI Smart Auto-Mix & Balance Analysis
app.post('/api/ai/automix-analysis', async (req: Request, res: Response) => {
  const { deckA, deckB } = req.body;

  if (!deckA || !deckB) {
    return res.status(400).json({ error: 'Deck A and Deck B track data required' });
  }

  // Harmonic assessment
  const keyA = deckA.key || '8A';
  const keyB = deckB.key || '8A';
  const bpmA = parseFloat(deckA.bpm) || 128;
  const bpmB = parseFloat(deckB.bpm) || 128;
  const bpmDiff = Math.abs(bpmA - bpmB);
  const targetBpm = Math.round((bpmA + bpmB) / 2);

  const compatibleList = camelotCompatibleKeys[keyA] || [keyA];
  const isHarmonicMatch = compatibleList.includes(keyB);

  // If Gemini API is available, ask Gemini for an expert DJ producer phrasing plan
  if (ai) {
    try {
      const prompt = `You are a legendary Tokyo underground club DJ and audio engineer with anime/disco aesthetic mastery.
Analyze these two active tracks for an automated ultra-smooth transition and level balance:
- Deck A: "${deckA.title}" (BPM: ${bpmA}, Key: ${keyA}, Energy: ${deckA.energy || 'High'})
- Deck B: "${deckB.title}" (BPM: ${bpmB}, Key: ${keyB}, Energy: ${deckB.energy || 'Medium-High'})

Return JSON ONLY with this schema:
{
  "harmonicScore": number (0-100),
  "camelotAssessment": string (1 punchy sentence about musical key relationship),
  "recommendedTransitionBars": number (typically 8, 16, or 32),
  "targetBpm": number,
  "eqPlan": {
    "step1Intro": string,
    "step2BassSwap": string,
    "step3Exit": string
  },
  "fxRecommended": string (e.g., "High-pass resonant filter sweep at bar 16 with 1/2 beat ping-pong echo delay"),
  "djTip": string (1 motivational Tokyo club pro tip, minimal anime disco vibe)
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        aiGenerated: true,
        ...parsed,
        harmonicMatch: isHarmonicMatch,
      });
    } catch (err: unknown) {
      console.warn('Gemini automix analysis fallback due to error:', err);
    }
  }

  // Algorithmic fallback if AI key not configured or transient error
  const harmonicScore = isHarmonicMatch ? 95 : Math.max(60, 90 - Math.round(bpmDiff * 4));
  return res.json({
    success: true,
    aiGenerated: false,
    harmonicScore,
    camelotAssessment: isHarmonicMatch
      ? `Harmonic resonance locked: ${keyA} blends seamlessly into ${keyB} with zero frequency clash.`
      : `Key shift: ${keyA} to ${keyB}. Use high-pass filter frequency carving to disguise key tension.`,
    recommendedTransitionBars: bpmDiff > 6 ? 16 : 32,
    targetBpm,
    eqPlan: {
      step1Intro: 'Sync BPM, set Deck B Low EQ to 0%, introduce mids at 70% over 8 bars.',
      step2BassSwap: 'Execute sharp Low EQ swap on downbeat: kill Deck A Bass, drop Deck B Bass to 100%.',
      step3Exit: 'High-pass filter Deck A with 1/4 echo tail, slide crossfader fully right.',
    },
    fxRecommended: 'Resonant HPF sweep on outgoing deck with 1/2 beat stereo ping-pong delay tail.',
    djTip: 'Keep your eyes on the central transient beat-grid; let the bassline take over on the 1 of bar 17.',
    harmonicMatch: isHarmonicMatch,
  });
});

// API: AI DJ Mentor / Sensei Dialogue
app.post('/api/ai/mentor-advice', async (req: Request, res: Response) => {
  const { context, userSkillLevel, currentExercise } = req.body;

  if (ai) {
    try {
      const prompt = `You are DJ Kaori (aka Neon Sensei), a stylish, knowledgeable, encouraging Tokyo anime disco club mentor.
The student is practicing DJing (Skill Level: ${userSkillLevel || 'Novice'}).
Current task/context: ${context || 'Learning beatmatching and EQ control'}.
Current exercise: ${currentExercise || 'Aligning transients on Deck A and Deck B'}.

Give 2-3 concise, highly practical, encouraging sentences with subtle anime disco flair. Emphasize low-latency muscle memory, counting 4/4 beats, or frequency isolation. Return JSON:
{
  "quote": string,
  "actionableTip": string,
  "suggestedBadgeNext": string
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, ...parsed });
    } catch (err) {
      console.warn('Gemini mentor advice fallback:', err);
    }
  }

  return res.json({
    success: true,
    quote: 'Listen to the kick drum transient like a heartbeat. When Deck A and B lock into phase, the sound doubles in warmth.',
    actionableTip: 'Use slight forward/backward jog nudges (+/- 0.5%) instead of whipping the wheel. Watch the center beat grid alignment.',
    suggestedBadgeNext: 'Transient Master',
  });
});

// API: Community Mixes
app.get('/api/community/mixes', (_req: Request, res: Response) => {
  res.json({ success: true, mixes: communityMixes });
});

app.post('/api/community/mixes', (req: Request, res: Response) => {
  const { title, djName, genre, bpm, durationSeconds, tracklist, description, waveformSnippet } = req.body;

  const newMix: CommunityMix = {
    id: `mix-${Date.now()}`,
    title: title || 'Tokyo Live Studio Mix',
    djName: djName || 'Rookie DJ',
    avatarSeed: 'user',
    genre: genre || 'Anime Disco / Electro',
    bpm: bpm || 128,
    durationSeconds: durationSeconds || 120,
    createdAt: new Date().toISOString(),
    tracklist: tracklist && tracklist.length ? tracklist : ['Deck A Track', 'Deck B Track'],
    description: description || 'Mixed live using Tokyo Beatmatch low-latency engine.',
    likes: 1,
    fireRating: 85,
    smoothRating: 90,
    grooveRating: 88,
    comments: [],
    waveformSnippet: waveformSnippet || [0.3, 0.6, 0.8, 0.7, 0.9, 0.6, 0.4, 0.8, 0.7],
  };

  communityMixes.unshift(newMix);
  res.json({ success: true, mix: newMix });
});

app.post('/api/community/mixes/:id/react', (req: Request, res: Response) => {
  const { id } = req.params;
  const { type, commentText, userName } = req.body;
  const mix = communityMixes.find((m) => m.id === id);

  if (!mix) {
    return res.status(404).json({ error: 'Mix not found' });
  }

  if (type === 'fire') mix.fireRating = Math.min(100, mix.fireRating + 1);
  if (type === 'smooth') mix.smoothRating = Math.min(100, mix.smoothRating + 1);
  if (type === 'groove') mix.grooveRating = Math.min(100, mix.grooveRating + 1);
  if (type === 'like') mix.likes += 1;

  if (commentText && commentText.trim()) {
    mix.comments.push({
      id: `c-${Date.now()}`,
      user: userName || 'Fellow DJ',
      text: commentText.trim(),
      timestamp: 'Just now',
    });
  }

  res.json({ success: true, mix });
});

// API: Back-to-Back (B2B) Session Rooms
app.get('/api/b2b/rooms/:roomCode', (req: Request, res: Response) => {
  const room = b2bRooms.get(req.params.roomCode.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({ success: true, room });
});

app.post('/api/b2b/rooms/:roomCode/sync', (req: Request, res: Response) => {
  const roomCode = req.params.roomCode.toUpperCase();
  let room = b2bRooms.get(roomCode);

  if (!room) {
    // Auto-create room if not found
    room = {
      roomCode,
      name: `Studio Session ${roomCode}`,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      deckA: {
        trackId: 'shibuya-neon-rush',
        isPlaying: false,
        bpm: 128,
        currentTime: 0,
        djName: req.body.djName || 'DJ Alpha',
      },
      deckB: {
        trackId: 'midnight-mirage',
        isPlaying: false,
        bpm: 124,
        currentTime: 0,
        djName: 'DJ Beta',
      },
      crossfader: 0.5,
      activeTurnDj: req.body.djName || 'DJ Alpha',
      chatMessages: [],
    };
    b2bRooms.set(roomCode, room);
  }

  const { deckA, deckB, crossfader, chatMessage, activeTurnDj } = req.body;
  if (deckA) room.deckA = { ...room.deckA, ...deckA };
  if (deckB) room.deckB = { ...room.deckB, ...deckB };
  if (typeof crossfader === 'number') room.crossfader = crossfader;
  if (activeTurnDj) room.activeTurnDj = activeTurnDj;

  if (chatMessage && chatMessage.message) {
    room.chatMessages.push({
      id: `m-${Date.now()}`,
      dj: chatMessage.dj || 'Guest DJ',
      message: chatMessage.message,
      time: 'Just now',
    });
    // Keep max 50 chat messages
    if (room.chatMessages.length > 50) room.chatMessages.shift();
  }

  room.lastUpdated = Date.now();
  res.json({ success: true, room });
});

// Mount Vite or serve static files
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tokyo Beatmatch server running on port ${PORT} (isDev: ${isDev})`);
  });
}

startServer();
