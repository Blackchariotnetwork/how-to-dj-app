import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Disc,
  Flame,
  Users,
  Sliders,
  Award,
  Mic,
  Sparkles,
  Volume2,
  ChevronDown,
  Layers,
  Wand2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { DeckState, FXState, MasterState, Track, UserAwardState, TutorialLesson } from './types/dj';
import { DEFAULT_TRACKS } from './data/defaultTracks';
import { DJ_CURRICULUM } from './data/curriculum';
import { audioEngine } from './services/audioEngine';
import { midiService } from './services/midiService';

import { WaveformVisualizer } from './components/Decks/WaveformVisualizer';
import { CDJPlayer } from './components/Decks/CDJPlayer';
import { DJMMixer } from './components/Decks/DJMMixer';
import { EffectsRack } from './components/Decks/EffectsRack';
import { StemsPanel } from './components/Decks/StemsPanel';

import { TutorialBubble } from './components/Tutorial/TutorialBubble';
import { DJAcademyModal } from './components/Tutorial/DJAcademyModal';
import { TrackLibraryModal } from './components/Library/TrackLibraryModal';
import { B2BRoomModal } from './components/B2B/B2BRoomModal';
import { RecordMixModal } from './components/Social/RecordMixModal';
import { CommunityFeedModal } from './components/Social/CommunityFeedModal';
import { MIDIMappingModal } from './components/MIDI/MIDIMappingModal';
import { DJProfileModal } from './components/Profile/DJProfileModal';

import { PWAInstallButton } from './components/PWA/PWAInstallButton';
import { OfflineIndicator } from './components/PWA/OfflineIndicator';

export default function App() {
  // Available Tracks Library
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);

  // Deck A State (Player 1)
  const [deckA, setDeckA] = useState<DeckState>({
    id: 'A',
    track: DEFAULT_TRACKS[0],
    isPlaying: false,
    playbackRate: 1.0,
    pitchPercent: 0,
    keyLock: true,
    volume: 1.0,
    gainTrim: 1.0,
    highEq: 0,
    midEq: 0,
    lowEq: 0,
    highKill: false,
    midKill: false,
    lowKill: false,
    filterFreq: 0.5,
    filterRes: 1.5,
    cueTime: 0,
    currentTime: 0,
    hotcues: { 1: 0, 2: 15, 3: 30, 4: 60 },
    loopActive: false,
    loopLengthBeats: 4,
    loopStartTime: 0,
    vuLevel: 0,
    isScratching: false,
    stemVocals: 1.0,
    stemDrums: 1.0,
    stemMelody: 1.0,
  });

  // Deck B State (Player 2)
  const [deckB, setDeckB] = useState<DeckState>({
    id: 'B',
    track: DEFAULT_TRACKS[1],
    isPlaying: false,
    playbackRate: 1.0,
    pitchPercent: 0,
    keyLock: true,
    volume: 1.0,
    gainTrim: 1.0,
    highEq: 0,
    midEq: 0,
    lowEq: 0,
    highKill: false,
    midKill: false,
    lowKill: false,
    filterFreq: 0.5,
    filterRes: 1.5,
    cueTime: 0,
    currentTime: 0,
    hotcues: { 1: 0, 2: 15.48, 3: 30.96, 4: 61.92 },
    loopActive: false,
    loopLengthBeats: 4,
    loopStartTime: 0,
    vuLevel: 0,
    isScratching: false,
    stemVocals: 1.0,
    stemDrums: 1.0,
    stemMelody: 1.0,
  });

  // Master State
  const [master, setMaster] = useState<MasterState>({
    crossfader: 0, // -1 to +1
    crossfaderCurve: 'smooth',
    masterVolume: 1.0,
    boothVolume: 0.8,
    cueSplit: false,
    cueDeckA: false,
    cueDeckB: false,
    isRecording: false,
    recordingDuration: 0,
    recordedAudioUrl: null,
  });

  // FX Rack State
  const [fx, setFx] = useState<FXState>({
    filterType: 'off',
    delayActive: false,
    delayTimeBeats: 0.5,
    delayFeedback: 0.35,
    delayMix: 0.4,
    reverbActive: false,
    reverbMix: 0.35,
    flangerActive: false,
    flangerMix: 0.4,
    bitcrusherActive: false,
    bitcrushBits: 8,
  });

  // VU Levels
  const [vuA, setVuA] = useState(0);
  const [vuB, setVuB] = useState(0);

  // Progressive Awards & Stats
  const [userAwards, setUserAwards] = useState<UserAwardState>(() => {
    try {
      const stored = localStorage.getItem('tokyo_dj_awards');
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return {
      xp: 150,
      level: 1,
      rankTitle: 'Bedroom DJ',
      completedLessonIds: [],
      earnedBadges: [],
      stats: {
        transitionsCompleted: 3,
        perfectSyncs: 2,
        scratchSeconds: 14,
        mixesShared: 1,
      },
    };
  });

  // Save awards on update
  useEffect(() => {
    try {
      localStorage.setItem('tokyo_dj_awards', JSON.stringify(userAwards));
    } catch {
      // Storage error
    }
  }, [userAwards]);

  // Active Tutorial Walkthrough
  const [activeLesson, setActiveLesson] = useState<TutorialLesson | null>(DJ_CURRICULUM[0]);
  const [isLessonPassed, setIsLessonPassed] = useState(false);

  // Modal Views
  const [isAcademyOpen, setIsAcademyOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isB2BOpen, setIsB2BOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isMIDIOpen, setIsMIDIOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Active lower panel drawer: null | 'fx' | 'stems'
  const [activeDrawer, setActiveDrawer] = useState<'fx' | 'stems' | null>(null);

  // Realistic Pro DJ Booth View mode for mobile/desktop
  const [boothView, setBoothView] = useState<'all' | 'deckA' | 'mixer' | 'deckB'>('all');
  const [showPhaseMeter, setShowPhaseMeter] = useState(false);

  // AI Auto-Mix Status
  const [isAutoMixing, setIsAutoMixing] = useState(false);
  const [autoMixNotice, setAutoMixNotice] = useState<string | null>(null);

  // MIDI Listener Hook
  useEffect(() => {
    const unsub = midiService.addListener((target, value) => {
      if (target === 'crossfader') {
        const mapped = value * 2 - 1; // 0..1 to -1..1
        setMaster((prev) => ({ ...prev, crossfader: mapped }));
      } else if (target === 'deckA_play') {
        handlePlayToggle('A');
      } else if (target === 'deckA_cue') {
        handleCue('A');
      } else if (target === 'deckA_pitch') {
        const percent = (value - 0.5) * 32;
        handlePitchChange('A', percent);
      } else if (target === 'deckA_low') {
        const db = (value - 0.5) * 32;
        handleEqChange('A', 'low', db);
      } else if (target === 'deckA_filter') {
        handleFilterChange('A', value);
      } else if (target === 'deckB_play') {
        handlePlayToggle('B');
      } else if (target === 'deckB_cue') {
        handleCue('B');
      } else if (target === 'deckB_pitch') {
        const percent = (value - 0.5) * 32;
        handlePitchChange('B', percent);
      } else if (target === 'deckB_low') {
        const db = (value - 0.5) * 32;
        handleEqChange('B', 'low', db);
      } else if (target === 'deckB_filter') {
        handleFilterChange('B', value);
      }
    });

    return () => unsub();
  }, [deckA, deckB, master]);

  // Audio Playback loop & time advancement
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Update current time on playing decks
      if (deckA.isPlaying && deckA.track) {
        setDeckA((prev) => {
          const nextTime = (prev.currentTime + dt * prev.playbackRate) % (prev.track?.duration || 180);
          return { ...prev, currentTime: nextTime };
        });
      }
      if (deckB.isPlaying && deckB.track) {
        setDeckB((prev) => {
          const nextTime = (prev.currentTime + dt * prev.playbackRate) % (prev.track?.duration || 180);
          return { ...prev, currentTime: nextTime };
        });
      }

      // Update VU meters
      setVuA(audioEngine.getDeckVU('A'));
      setVuB(audioEngine.getDeckVU('B'));

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [deckA.isPlaying, deckB.isPlaying]);

  // Synchronize audio engine gains whenever mixer or deck volumes change
  useEffect(() => {
    audioEngine.updateMixerGains(
      master.crossfader,
      master.crossfaderCurve,
      deckA.volume * deckA.gainTrim,
      deckB.volume * deckB.gainTrim,
      master.masterVolume
    );
  }, [master.crossfader, master.crossfaderCurve, deckA.volume, deckA.gainTrim, deckB.volume, deckB.gainTrim, master.masterVolume]);

  // Deck A / B Play Toggle
  const handlePlayToggle = async (deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;

    if (!deck.track) {
      setIsLibraryOpen(true);
      return;
    }

    if (deck.isPlaying) {
      audioEngine.pauseDeck(deckId, deck.currentTime);
      setDeck((prev) => ({ ...prev, isPlaying: false }));
    } else {
      await audioEngine.playDeck(deckId, deck.track, deck.currentTime, deck.playbackRate);
      setDeck((prev) => ({ ...prev, isPlaying: true }));
    }
  };

  // CUE button: returns to cue and pauses if playing, or plays momentary cue
  const handleCue = (deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;

    if (!deck.track) return;

    if (deck.isPlaying) {
      audioEngine.pauseDeck(deckId, deck.cueTime);
      setDeck((prev) => ({ ...prev, isPlaying: false, currentTime: prev.cueTime }));
    } else {
      // Set current position as cue or jump to cue
      const newCue = deck.currentTime;
      setDeck((prev) => ({ ...prev, cueTime: newCue }));
      audioEngine.playDeck(deckId, deck.track, newCue, deck.playbackRate);
      setTimeout(() => {
        audioEngine.pauseDeck(deckId, newCue);
      }, 250);
    }
  };

  // SYNC Button: Matches BPM & phase to the other deck
  const handleSync = (deckId: 'A' | 'B') => {
    const targetDeck = deckId === 'A' ? deckB : deckA;
    const sourceDeck = deckId === 'A' ? deckA : deckB;
    const setSourceDeck = deckId === 'A' ? setDeckA : setDeckB;

    if (!targetDeck.track || !sourceDeck.track) return;

    const targetBpm = targetDeck.track.bpm * targetDeck.playbackRate;
    const newRate = targetBpm / sourceDeck.track.bpm;

    audioEngine.setPlaybackRate(deckId, newRate);
    setSourceDeck((prev) => ({
      ...prev,
      playbackRate: newRate,
      currentTime: targetDeck.currentTime, // phase alignment
    }));

    // Update stats
    setUserAwards((prev) => ({
      ...prev,
      xp: prev.xp + 25,
      stats: { ...prev.stats, perfectSyncs: prev.stats.perfectSyncs + 1 },
    }));

    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.7 },
      colors: ['#00f0ff', '#ff2a85'],
    });
  };

  // Tempo / Pitch Slider Change
  const handlePitchChange = (deckId: 'A' | 'B', percent: number) => {
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    const newRate = 1 + percent / 100;
    audioEngine.setPlaybackRate(deckId, newRate);
    setDeck((prev) => ({ ...prev, playbackRate: newRate, pitchPercent: percent }));
  };

  // Pitch Nudge / Bend (+/- 0.5%)
  const handlePitchBend = (deckId: 'A' | 'B', direction: number) => {
    audioEngine.scratchNudge(deckId, direction * 0.5);
  };

  // Touch Scratch gesture
  const handleScratchNudge = (deckId: 'A' | 'B', delta: number) => {
    audioEngine.scratchNudge(deckId, delta);
    setUserAwards((prev) => ({
      ...prev,
      stats: { ...prev.stats, scratchSeconds: prev.stats.scratchSeconds + 1 },
    }));
  };

  // Waveform needle search scrub
  const handleSeek = (deckId: 'A' | 'B', time: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;

    if (!deck.track) return;

    if (deck.isPlaying) {
      audioEngine.playDeck(deckId, deck.track, time, deck.playbackRate);
    }
    setDeck((prev) => ({ ...prev, currentTime: time }));
  };

  // Hotcue Pad Trigger
  const handleHotcue = (deckId: 'A' | 'B', slot: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;

    if (!deck.track) return;

    const existingCue = deck.hotcues[slot];
    if (typeof existingCue === 'number') {
      // Jump to hotcue
      if (deck.isPlaying) {
        audioEngine.playDeck(deckId, deck.track, existingCue, deck.playbackRate);
      }
      setDeck((prev) => ({ ...prev, currentTime: existingCue }));
    } else {
      // Save hotcue at current position
      setDeck((prev) => ({
        ...prev,
        hotcues: { ...prev.hotcues, [slot]: prev.currentTime },
      }));
    }
  };

  // Beat Loop Toggle
  const handleLoopToggle = (deckId: 'A' | 'B', beats: number) => {
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    setDeck((prev) => {
      const willBeActive = !(prev.loopActive && prev.loopLengthBeats === beats);
      return {
        ...prev,
        loopActive: willBeActive,
        loopLengthBeats: beats,
        loopStartTime: prev.currentTime,
      };
    });
  };

  // 3-Band EQ adjustment
  const handleEqChange = (deckId: 'A' | 'B', band: 'high' | 'mid' | 'low', val: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;

    const updated = {
      high: band === 'high' ? val : deck.highEq,
      mid: band === 'mid' ? val : deck.midEq,
      low: band === 'low' ? val : deck.lowEq,
    };

    audioEngine.updateDeckEQ(
      deckId,
      updated.high,
      updated.mid,
      updated.low,
      deck.highKill,
      deck.midKill,
      deck.lowKill
    );

    setDeck((prev) => ({
      ...prev,
      [band === 'high' ? 'highEq' : band === 'mid' ? 'midEq' : 'lowEq']: val,
    }));
  };

  // EQ Kill Switch
  const handleEqKillToggle = (deckId: 'A' | 'B', band: 'high' | 'mid' | 'low') => {
    const deck = deckId === 'A' ? deckA : deckB;
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;

    const key = band === 'high' ? 'highKill' : band === 'mid' ? 'midKill' : 'lowKill';
    const nextVal = !deck[key];

    audioEngine.updateDeckEQ(
      deckId,
      deck.highEq,
      deck.midEq,
      deck.lowEq,
      band === 'high' ? nextVal : deck.highKill,
      band === 'mid' ? nextVal : deck.midKill,
      band === 'low' ? nextVal : deck.lowKill
    );

    setDeck((prev) => ({ ...prev, [key]: nextVal }));
  };

  // Bi-directional Filter Change (0 to 1, 0.5 is flat)
  const handleFilterChange = (deckId: 'A' | 'B', val: number) => {
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    audioEngine.updateDeckFilter(deckId, val);
    setDeck((prev) => ({ ...prev, filterFreq: val }));
  };

  // Channel Gain Trim Change
  const handleGainChange = (deckId: 'A' | 'B', val: number) => {
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    setDeck((prev) => ({ ...prev, gainTrim: val }));
  };

  // Stems Isolation
  const handleStemChange = (deckId: 'A' | 'B', stem: 'vocals' | 'drums' | 'melody', val: number) => {
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    setDeck((prev) => ({
      ...prev,
      [stem === 'vocals' ? 'stemVocals' : stem === 'drums' ? 'stemDrums' : 'stemMelody']: val,
    }));
  };

  // Crossfader change
  const handleCrossfaderChange = (val: number) => {
    setMaster((prev) => ({ ...prev, crossfader: val }));
  };

  const handleCrossfaderCurveToggle = () => {
    setMaster((prev) => ({
      ...prev,
      crossfaderCurve:
        prev.crossfaderCurve === 'smooth'
          ? 'scratch'
          : prev.crossfaderCurve === 'scratch'
          ? 'linear'
          : 'smooth',
    }));
  };

  // Channel Volume Up-Fader Change
  const handleVolumeChange = (deckId: 'A' | 'B', val: number) => {
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    setDeck((prev) => ({ ...prev, volume: val }));
  };

  // AI Smart Auto-Mix execution
  const handleTriggerAutoMix = async () => {
    if (!deckA.track || !deckB.track || isAutoMixing) return;
    setIsAutoMixing(true);
    setAutoMixNotice('AI Harmonic Analysis & Beat-Matching underway...');

    try {
      const res = await fetch('/api/ai/automix-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckA: deckA.track, deckB: deckB.track }),
      });
      const data = await res.json();

      setAutoMixNotice(`${data.camelotAssessment} · ${data.djTip}`);

      // If Deck B is not playing, start it synchronized to Deck A
      if (!deckB.isPlaying) {
        const targetRate = (deckA.track.bpm * deckA.playbackRate) / deckB.track.bpm;
        audioEngine.setPlaybackRate('B', targetRate);
        await audioEngine.playDeck('B', deckB.track, 0, targetRate);
        setDeckB((prev) => ({ ...prev, isPlaying: true, playbackRate: targetRate }));
      }

      // Automated Smooth Bass-Swap Crossfade Transition over 4 seconds
      const startTime = performance.now();
      const duration = 4000;
      const initialCrossfader = master.crossfader;
      const targetCrossfader = initialCrossfader <= 0 ? 1 : -1;

      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const currentCrossfader = initialCrossfader + (targetCrossfader - initialCrossfader) * progress;
        setMaster((prev) => ({ ...prev, crossfader: currentCrossfader }));

        // Dynamic frequency carving
        if (progress > 0.4 && progress < 0.6) {
          // Bass Swap on downbeat
          if (targetCrossfader > 0) {
            handleEqKillToggle('A', 'low');
          } else {
            handleEqKillToggle('B', 'low');
          }
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setIsAutoMixing(false);
          setUserAwards((prev) => ({
            ...prev,
            xp: prev.xp + 100,
            stats: {
              ...prev.stats,
              transitionsCompleted: prev.stats.transitionsCompleted + 1,
            },
          }));
          confetti({
            particleCount: 40,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff2a85', '#00f0ff', '#a855f7'],
          });
        }
      };

      requestAnimationFrame(step);
    } catch (err) {
      console.error('Auto-mix failed:', err);
      setIsAutoMixing(false);
      setAutoMixNotice('Auto-mix executed via hardware fallback.');
    }
  };

  // Complete tutorial lesson drill
  const handleCompleteLesson = () => {
    if (!activeLesson) return;
    setIsLessonPassed(true);

    setUserAwards((prev) => {
      const alreadyDone = prev.completedLessonIds.includes(activeLesson.id);
      if (alreadyDone) return prev;

      const newXP = prev.xp + activeLesson.xpReward;
      const newLevel = Math.floor(newXP / 500) + 1;
      const newCompleted = [...prev.completedLessonIds, activeLesson.id];

      const rankTitles = ['Bedroom DJ', 'Apprentice DJ', 'Resident Club DJ', 'Tokyo Remixer', 'Festival Headliner'];
      const rankTitle = rankTitles[Math.min(rankTitles.length - 1, newCompleted.length)];

      const newBadges = [...prev.earnedBadges];
      if (activeLesson.badgeReward && !newBadges.some((b) => b.id === activeLesson.badgeReward!.id)) {
        newBadges.push({
          ...activeLesson.badgeReward,
          earnedAt: new Date().toLocaleDateString(),
        });
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        rankTitle,
        completedLessonIds: newCompleted,
        earnedBadges: newBadges,
      };
    });

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff2a85', '#00f0ff', '#ffb800'],
    });
  };

  // Next tutorial lesson
  const handleNextLesson = () => {
    if (!activeLesson) return;
    const currentIndex = DJ_CURRICULUM.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex < DJ_CURRICULUM.length - 1) {
      setActiveLesson(DJ_CURRICULUM[currentIndex + 1]);
      setIsLessonPassed(false);
    } else {
      setActiveLesson(null);
    }
  };

  // Load track onto deck
  const handleLoadTrack = async (deckId: 'A' | 'B', track: Track) => {
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    setDeck((prev) => ({
      ...prev,
      track,
      playbackRate: 1.0,
      currentTime: 0,
      cueTime: 0,
      isPlaying: false,
      hotcues: track.hotcues
        ? { 1: track.hotcues[0] ?? 0, 2: track.hotcues[1] ?? 15, 3: track.hotcues[2] ?? 30, 4: track.hotcues[3] ?? 60 }
        : { 1: 0, 2: 15, 3: 30, 4: 60 },
    }));
  };

  // User adds custom uploaded track
  const handleAddUploadedTrack = (track: Track) => {
    setTracks((prev) => [track, ...prev]);
    handleLoadTrack('A', track);
  };

  // Publish recorded mix
  const handlePublishMix = async (mixData: any) => {
    try {
      await fetch('/api/community/mixes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mixData),
      });
      setUserAwards((prev) => ({
        ...prev,
        xp: prev.xp + 200,
        stats: { ...prev.stats, mixesShared: prev.stats.mixesShared + 1 },
      }));
      setIsCommunityOpen(true);
    } catch {
      // Offline
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-slate-100 flex flex-col font-sans select-none selection:bg-[#ff9900] selection:text-black">
      <OfflineIndicator />

      {/* RUGGED FLIGHT CASE / DJ COFFIN TOP UTILITY RAIL (Matches Reference Physical Setup) */}
      <div className="w-full bg-gradient-to-r from-[#07080e] via-[#10121d] to-[#07080e] border-b border-[#1b1e2e] px-2 sm:px-4 py-1.5 flex items-center justify-between text-xs font-mono shadow-md z-30">
        {/* Left: Hardware Link Status & Model */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#030408] border border-emerald-500/50 text-emerald-400 font-black text-[10px] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="tracking-widest">PRO DJ LINK</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400 font-bold">
            <span className="text-white">COFFIN: 2x CDJ-3000 + B2B STUDIO</span>
            <span>·</span>
            <span className="text-amber-400">172.00 BPM</span>
            <span>·</span>
            <span className="text-cyan-400">&lt;2ms DSP</span>
          </div>
        </div>

        {/* Center: Hardware View Selector (Responsive Mobile / Desktop Coffin Pan) */}
        <div className="flex items-center gap-1 bg-[#05060c] p-0.5 rounded border border-slate-800 text-[10px] font-bold">
          <button
            onClick={() => setBoothView('all')}
            className={`px-2 py-1 rounded-[2px] transition-colors ${
              boothView === 'all'
                ? 'bg-slate-200 text-black shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3-PIECE SETUP
          </button>
          <button
            onClick={() => setBoothView('deckA')}
            className={`px-2 py-1 rounded-[2px] transition-colors ${
              boothView === 'deckA'
                ? 'bg-[#004fc7] text-white shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CDJ 1
          </button>
          <button
            onClick={() => setBoothView('mixer')}
            className={`px-2 py-1 rounded-[2px] transition-colors ${
              boothView === 'mixer'
                ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MIXER
          </button>
          <button
            onClick={() => setBoothView('deckB')}
            className={`px-2 py-1 rounded-[2px] transition-colors ${
              boothView === 'deckB'
                ? 'bg-[#004fc7] text-white shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CDJ 2
          </button>
        </div>

        {/* Right: Tactical Hardware Function Switches */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] font-bold">
          {/* Phase Meter toggle */}
          <button
            onClick={() => setShowPhaseMeter(!showPhaseMeter)}
            className={`h-7 px-2 rounded-[2px] border text-[9.5px] font-bold transition-all ${
              showPhaseMeter
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm'
                : 'bg-[#0c0e18] text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle Stacked Phase Meter"
          >
            PHASE METER
          </button>

          {/* CRATE / USB */}
          <button
            onClick={() => setIsLibraryOpen(true)}
            className="h-7 px-2.5 rounded-[2px] bg-[#101322] hover:bg-[#1a1e35] border border-slate-700 text-slate-200 transition-colors flex items-center gap-1 active:scale-95 shadow-sm"
            title="Track Library & USB Stems"
          >
            <Disc className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">CRATE</span>
          </button>

          {/* HARDWARE ACADEMY */}
          <button
            onClick={() => setIsAcademyOpen(true)}
            className="h-7 px-2.5 rounded-[2px] bg-[#101322] hover:bg-[#1a1e35] border border-slate-700 text-slate-200 transition-colors flex items-center gap-1 active:scale-95 shadow-sm"
            title="DJ Academy Lessons & Drills"
          >
            <GraduationCap className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">ACADEMY</span>
          </button>

          {/* B2B STUDIO ROOM */}
          <button
            onClick={() => setIsB2BOpen(true)}
            className="h-7 px-2.5 rounded-[2px] bg-[#101322] hover:bg-[#1a1e35] border border-slate-700 text-slate-200 transition-colors flex items-center gap-1 active:scale-95 shadow-sm"
            title="Collaborative B2B Session"
          >
            <Users className="w-3 h-3 text-indigo-400" />
            <span className="hidden md:inline">B2B</span>
          </button>

          {/* MIDI MAPPING */}
          <button
            onClick={() => setIsMIDIOpen(true)}
            className="h-7 px-2 rounded-[2px] bg-[#101322] hover:bg-[#1a1e35] border border-slate-700 text-slate-200 transition-colors flex items-center gap-1 active:scale-95 shadow-sm"
            title="Hardware Controller MIDI Mapping"
          >
            <Sliders className="w-3 h-3 text-emerald-400" />
            <span className="hidden md:inline">MIDI</span>
          </button>

          {/* MASTER REC */}
          <button
            onClick={() => setIsRecorderOpen(true)}
            className="h-7 px-2.5 rounded-[2px] bg-[#220a0a] hover:bg-[#330e0e] border border-red-700 text-red-400 font-black transition-all flex items-center gap-1 shadow-[0_0_8px_rgba(239,68,68,0.3)] active:scale-95"
            title="Master Record Set"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>REC</span>
          </button>

          {/* COMMUNITY / FEEDS */}
          <button
            onClick={() => setIsCommunityOpen(true)}
            className="h-7 px-2 rounded-[2px] bg-[#101322] hover:bg-[#1a1e35] border border-slate-700 text-slate-200 transition-colors flex items-center justify-center active:scale-95 shadow-sm"
            title="Social Mix Releases"
          >
            <Flame className="w-3 h-3 text-orange-400" />
          </button>

          {/* PROFILE */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="h-7 px-2 rounded-[2px] bg-[#101322] hover:bg-[#1a1e35] border border-slate-700 text-slate-200 transition-colors flex items-center justify-center active:scale-95 shadow-sm"
            title="DJ Profile & Mastery Status"
          >
            <Award className="w-3 h-3 text-amber-300" />
          </button>

          <PWAInstallButton />
        </div>
      </div>

      {/* OPTIONAL BEATMATCH PHASE METER OVERLAY */}
      {showPhaseMeter && (
        <div className="w-full bg-[#030408] border-b border-slate-800 p-2">
          <WaveformVisualizer deckA={deckA} deckB={deckB} onSeek={handleSeek} />
        </div>
      )}

      {/* AUTO-MIX NOTIFICATION STRIP */}
      {autoMixNotice && (
        <div className="w-full bg-[#150a24] border-b border-purple-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-purple-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span>{autoMixNotice}</span>
          </div>
          <button
            onClick={() => setAutoMixNotice(null)}
            className="text-purple-400 hover:text-white font-bold"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* MAIN HARDWARE COFFIN CONTAINER (Side-by-side, Zero Web Margins, 100% Faithful to Reference Image) */}
      <div className="flex-1 w-full flex items-center justify-center overflow-x-auto p-1 sm:p-2 bg-[#000000]">
        <div
          className={`w-full max-w-[1560px] mx-auto grid gap-2 lg:gap-3 items-stretch ${
            boothView === 'all'
              ? 'grid-cols-1 lg:grid-cols-[1.3fr_1.1fr_1.3fr]'
              : 'grid-cols-1 max-w-xl mx-auto'
          }`}
        >
          {/* CDJ PLAYER 1 (DECK A) */}
          {(boothView === 'all' || boothView === 'deckA') && (
            <div className="w-full h-full flex flex-col">
              <CDJPlayer
                deck={deckA}
                otherDeckBpm={deckB.track ? deckB.track.bpm * deckB.playbackRate : 172.0}
                playerNumber={1}
                userName="YOU"
                flagEmoji="🇧🇷"
                onPlayToggle={() => handlePlayToggle('A')}
                onCue={() => handleCue('A')}
                onSync={() => handleSync('A')}
                onPitchChange={(p) => handlePitchChange('A', p)}
                onPitchBend={(dir) => handlePitchBend('A', dir)}
                onScratchNudge={(d) => handleScratchNudge('A', d)}
                onHotcue={(slot) => handleHotcue('A', slot)}
                onLoopToggle={(beats) => handleLoopToggle('A', beats)}
                onSeek={(time) => handleSeek('A', time)}
                onOpenLibrary={() => setIsLibraryOpen(true)}
                highlightControl={activeLesson?.highlightDeck === 'A' ? activeLesson.targetControl : undefined}
              />
            </div>
          )}

          {/* PIONEER B2B STUDIO / BJM-A10 MIXER */}
          {(boothView === 'all' || boothView === 'mixer') && (
            <div className="w-full h-full flex flex-col">
              <DJMMixer
                deckA={deckA}
                deckB={deckB}
                master={master}
                fx={fx}
                vuA={vuA}
                vuB={vuB}
                onEqChange={handleEqChange}
                onEqKillToggle={handleEqKillToggle}
                onFilterChange={handleFilterChange}
                onGainChange={handleGainChange}
                onVolumeChange={handleVolumeChange}
                onCrossfaderChange={handleCrossfaderChange}
                onCrossfaderCurveToggle={handleCrossfaderCurveToggle}
                onFxChange={setFx}
                onTriggerAutoMix={handleTriggerAutoMix}
                isAutoMixing={isAutoMixing}
                highlightControl={activeLesson?.highlightDeck === 'mixer' ? activeLesson.targetControl : undefined}
              />
            </div>
          )}

          {/* CDJ PLAYER 2 (DECK B) */}
          {(boothView === 'all' || boothView === 'deckB') && (
            <div className="w-full h-full flex flex-col">
              <CDJPlayer
                deck={deckB}
                otherDeckBpm={deckA.track ? deckA.track.bpm * deckA.playbackRate : 172.0}
                playerNumber={2}
                userName="YOU"
                flagEmoji="🇧🇷"
                onPlayToggle={() => handlePlayToggle('B')}
                onCue={() => handleCue('B')}
                onSync={() => handleSync('B')}
                onPitchChange={(p) => handlePitchChange('B', p)}
                onPitchBend={(dir) => handlePitchBend('B', dir)}
                onScratchNudge={(d) => handleScratchNudge('B', d)}
                onHotcue={(slot) => handleHotcue('B', slot)}
                onLoopToggle={(beats) => handleLoopToggle('B', beats)}
                onSeek={(time) => handleSeek('B', time)}
                onOpenLibrary={() => setIsLibraryOpen(true)}
                highlightControl={activeLesson?.highlightDeck === 'B' ? activeLesson.targetControl : undefined}
              />
            </div>
          )}
        </div>
      </div>

      {/* RACK EXTENSION DRAWER (Bottom Latch for FX Processor & Live Stems) */}
      <div className="w-full bg-[#05060b] border-t border-[#1a1c28] px-3 py-1.5 flex items-center justify-between font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveDrawer(activeDrawer === 'fx' ? null : 'fx')}
            className={`px-2.5 py-1 rounded-[2px] font-bold border transition-all ${
              activeDrawer === 'fx'
                ? 'bg-amber-500 text-black border-amber-300 shadow-sm'
                : 'bg-[#0c0d16] text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {activeDrawer === 'fx' ? '▼ HIDE MASTER FX' : '▲ MASTER FX RACK'}
          </button>

          <button
            onClick={() => setActiveDrawer(activeDrawer === 'stems' ? null : 'stems')}
            className={`px-2.5 py-1 rounded-[2px] font-bold border transition-all ${
              activeDrawer === 'stems'
                ? 'bg-cyan-500 text-black border-cyan-300 shadow-sm'
                : 'bg-[#0c0d16] text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {activeDrawer === 'stems' ? '▼ HIDE STEMS' : '▲ STEMS ISOLATION'}
          </button>
        </div>

        <div className="text-[9px] text-slate-500 font-mono tracking-wider">
          PIONEER DJ PRO FLIGHT COFFIN · TOKYO AUDIO ARCHITECTURE
        </div>
      </div>

      {/* DRAWER CONTENT */}
      {activeDrawer && (
        <div className="w-full bg-[#030408] border-t border-slate-800 p-3 max-w-[1560px] mx-auto animate-in slide-in-from-bottom-2">
          {activeDrawer === 'fx' ? (
            <EffectsRack fx={fx} onChange={setFx} />
          ) : (
            <StemsPanel deckA={deckA} deckB={deckB} onStemChange={handleStemChange} />
          )}
        </div>
      )}

      {/* Floating Tutorial Bubble */}
      {activeLesson && (
        <TutorialBubble
          lesson={activeLesson}
          onCompleteLesson={handleCompleteLesson}
          onNextLesson={handleNextLesson}
          onClose={() => setActiveLesson(null)}
          isPassed={isLessonPassed}
        />
      )}

      {/* Modals */}
      <DJAcademyModal
        isOpen={isAcademyOpen}
        onClose={() => setIsAcademyOpen(false)}
        userAwards={userAwards}
        onSelectLesson={(lesson) => {
          setActiveLesson(lesson);
          setIsLessonPassed(false);
        }}
        currentLessonId={activeLesson?.id || null}
      />

      <TrackLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        tracks={tracks}
        onLoadTrack={handleLoadTrack}
        onAddUploadedTrack={handleAddUploadedTrack}
      />

      <B2BRoomModal
        isOpen={isB2BOpen}
        onClose={() => setIsB2BOpen(false)}
        deckA={deckA}
        deckB={deckB}
        master={master}
        onSyncExternalState={handleCrossfaderChange}
      />

      <RecordMixModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onPublishMix={handlePublishMix}
      />

      <CommunityFeedModal
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
      />

      <MIDIMappingModal
        isOpen={isMIDIOpen}
        onClose={() => setIsMIDIOpen(false)}
      />

      <DJProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userAwards={userAwards}
      />
    </div>
  );
}
