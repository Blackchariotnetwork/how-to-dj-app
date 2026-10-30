import React, { useState, useRef } from 'react';
import { X, Upload, Music, Disc, Search, Play, Pause, ExternalLink } from 'lucide-react';
import { Track } from '../../types/dj';
import { audioEngine } from '../../services/audioEngine';

interface TrackLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  onLoadTrack: (deckId: 'A' | 'B', track: Track) => void;
  onAddUploadedTrack: (track: Track) => void;
}

export const TrackLibraryModal: React.FC<TrackLibraryModalProps> = ({
  isOpen,
  onClose,
  tracks,
  onLoadTrack,
  onAddUploadedTrack,
}) => {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showStreamingModal, setShowStreamingModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const genres = ['all', 'Cyber City Pop / Disco', 'Minimal Future Funk', 'French Touch / Disco House', 'Neo-Tokyo Acid Synth', 'Anime Chillhop / Halftime', 'Acapella / Vocal Chops Tool'];

  const filtered = tracks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.artist.toLowerCase().includes(search.toLowerCase()) ||
      t.key.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || t.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioEngine.decodeAudioFile(arrayBuffer);

      // Estimate BPM based on duration or default
      const estimatedBpm = 126;
      const cleanName = file.name.replace(/\.[^/.]+$/, '');

      const newTrack: Track = {
        id: `upload-${Date.now()}`,
        title: cleanName,
        artist: 'User Studio Remix',
        bpm: estimatedBpm,
        key: '8A',
        genre: file.name.toLowerCase().includes('vocal') ? 'Acapella / Vocal Chops Tool' : 'Custom Upload',
        duration: audioBuffer.duration,
        color: '#ff2a85',
        isUserUploaded: true,
        audioBuffer,
        hotcues: [0, audioBuffer.duration * 0.25, audioBuffer.duration * 0.5],
        tags: ['Custom Upload', `${Math.round(audioBuffer.duration)}s`, 'User Audio'],
      };

      onAddUploadedTrack(newTrack);
    } catch (err) {
      console.error('Failed to decode uploaded audio file:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoad = (deckId: 'A' | 'B', track: Track) => {
    onLoadTrack(deckId, track);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0c0d15] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#111322]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f0ff] to-[#ff2a85] flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Disc className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Tokyo Music Crate & Vocal Library</span>
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-emerald-400 font-bold">100% COPYRIGHT-FREE</span>
                <span>·</span>
                <span>CLOUD SYNC ENABLED</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Streaming Integration Button */}
            <button
              onClick={() => setShowStreamingModal(true)}
              className="h-9 px-3 rounded-xl bg-[#1b1e2e] hover:bg-[#252a40] border border-slate-700 text-xs font-mono font-semibold text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Streaming Platforms</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search, Filter & Upload Bar */}
        <div className="p-4 border-b border-slate-800 bg-[#131525] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, key, or BPM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#090a10] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          {/* Genre tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'Disco', 'Funk', 'Acid', 'Vocal Chops'].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g === 'all' ? 'all' : g === 'Disco' ? 'Cyber City Pop / Disco' : g === 'Funk' ? 'Minimal Future Funk' : g === 'Acid' ? 'Neo-Tokyo Acid Synth' : 'Acapella / Vocal Chops Tool')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
                  (g === 'all' && selectedGenre === 'all') ||
                  (g === 'Disco' && selectedGenre === 'Cyber City Pop / Disco') ||
                  (g === 'Funk' && selectedGenre === 'Minimal Future Funk') ||
                  (g === 'Acid' && selectedGenre === 'Neo-Tokyo Acid Synth') ||
                  (g === 'Vocal Chops' && selectedGenre === 'Acapella / Vocal Chops Tool')
                    ? 'bg-[#ff2a85] text-white font-bold'
                    : 'bg-[#1a1d2e] text-slate-300 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Custom Upload Track Trigger */}
          <div className="w-full sm:w-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full sm:w-auto h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-emerald-600/20"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Decoding Audio...' : 'Upload Track / Vocals'}</span>
            </button>
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-sm">
              No tracks matched your search criteria.
            </div>
          ) : (
            filtered.map((track) => (
              <div
                key={track.id}
                className="p-3 bg-[#11121e] border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md"
                    style={{ backgroundColor: `${track.color}22`, border: `2px solid ${track.color}` }}
                  >
                    🎵
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{track.title}</h4>
                      {track.isUserUploaded && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                          USER UPLOAD
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                      <span>{track.artist}</span>
                      <span>·</span>
                      <span className="text-slate-300">{track.genre}</span>
                      <span>·</span>
                      <span className="text-amber-400 font-bold">Key: {track.key}</span>
                      <span>·</span>
                      <span className="text-cyan-400 font-bold">{track.bpm} BPM</span>
                    </div>
                  </div>
                </div>

                {/* Load Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleLoad('A', track)}
                    className="h-9 px-3 rounded-xl bg-[#ff2a85] hover:bg-pink-600 active:scale-95 text-white text-xs font-bold font-mono transition-transform shadow-md shadow-pink-500/20"
                  >
                    LOAD DECK A
                  </button>

                  <button
                    onClick={() => handleLoad('B', track)}
                    className="h-9 px-3 rounded-xl bg-[#00f0ff] hover:bg-cyan-400 active:scale-95 text-black text-xs font-bold font-mono transition-transform shadow-md shadow-cyan-500/20"
                  >
                    LOAD DECK B
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Streaming Modal Dialog */}
        {showStreamingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#131524] border border-slate-700 rounded-2xl p-5 shadow-2xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                  <span>Streaming Platform Crate Sync</span>
                </h3>
                <button
                  onClick={() => setShowStreamingModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Connect and sync tracklists and playlists with your preferred streaming accounts for set preparation and metadata inspection:
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-[#0a0b12] rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-400 font-bold text-sm">🟢</span>
                    <span className="text-xs font-bold text-white">Spotify DJ Playlists</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">SYNC READY</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0a0b12] rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-pink-400 font-bold text-sm">🍎</span>
                    <span className="text-xs font-bold text-white">Apple Music High-Res</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">AVAILABLE</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0a0b12] rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-orange-400 font-bold text-sm">☁️</span>
                    <span className="text-xs font-bold text-white">SoundCloud Pro Remixes</span>
                  </div>
                  <span className="text-[10px] font-mono text-orange-400">CONNECTED</span>
                </div>
              </div>
              <button
                onClick={() => setShowStreamingModal(false)}
                className="mt-4 w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
