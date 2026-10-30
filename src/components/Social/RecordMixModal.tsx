import React, { useState, useEffect } from 'react';
import { X, Mic, Square, Play, Download, Share2, Check } from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

interface RecordMixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishMix: (mixData: {
    title: string;
    djName: string;
    genre: string;
    durationSeconds: number;
    description: string;
    audioUrl: string;
  }) => void;
}

export const RecordMixModal: React.FC<RecordMixModalProps> = ({
  isOpen,
  onClose,
  onPublishMix,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [djName, setDjName] = useState('Tokyo Resident DJ');
  const [genre, setGenre] = useState('Anime Disco / Future Funk');
  const [description, setDescription] = useState('Live mix recorded on Tokyo Beatmatch Decks.');
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  if (!isOpen) return null;

  const handleStartRecording = () => {
    const success = audioEngine.startRecording();
    if (success) {
      setIsRecording(true);
      setDuration(0);
      setRecordedUrl(null);
      setIsPublished(false);
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    const url = await audioEngine.stopRecording();
    setRecordedUrl(url);
    if (!title) {
      setTitle(`Tokyo Night Session (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`);
    }
  };

  const handlePublish = () => {
    if (!recordedUrl) return;
    onPublishMix({
      title: title || 'Tokyo Live Set',
      djName,
      genre,
      durationSeconds: duration,
      description,
      audioUrl: recordedUrl,
    });
    setIsPublished(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0c0d16] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#121422]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ef4444] to-[#ff2a85] flex items-center justify-center text-white shadow-lg shadow-red-500/20">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Live Set Recorder</span>
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-red-400 font-bold">LOSSLESS MASTER CAPTURE</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recording Monitor */}
        <div className="p-6 flex flex-col items-center justify-center bg-[#090a12] border-b border-slate-800">
          <div className="text-4xl font-mono font-bold text-white tracking-widest mb-3">
            {formatTime(duration)}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <span
              className={`w-3 h-3 rounded-full ${
                isRecording ? 'bg-red-500 animate-ping' : recordedUrl ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            />
            <span className="text-xs font-mono text-slate-400">
              {isRecording ? 'RECORDING LIVE MASTER AUDIO...' : recordedUrl ? 'RECORDING READY FOR PREVIEW' : 'ARMED & READY'}
            </span>
          </div>

          {/* Action Trigger */}
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-transform"
            >
              <Mic className="w-4 h-4" />
              <span>Start Master Recording</span>
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="h-12 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform border border-slate-600"
            >
              <Square className="w-4 h-4 fill-current text-red-500" />
              <span>Stop & Save Mix</span>
            </button>
          )}

          {/* Audio Preview element if recorded */}
          {recordedUrl && (
            <div className="w-full mt-4 p-3 bg-[#131525] rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">PREVIEW PLAYBACK:</span>
              <audio src={recordedUrl} controls className="w-full h-8" />
            </div>
          )}
        </div>

        {/* Mix Metadata & Share Form */}
        {recordedUrl && (
          <div className="p-5 space-y-3 bg-[#0d0e19]">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">MIX TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#080910] border border-slate-700 text-xs text-white focus:outline-none focus:border-[#ff2a85]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">DJ NAME</label>
                <input
                  type="text"
                  value={djName}
                  onChange={(e) => setDjName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#080910] border border-slate-700 text-xs text-white focus:outline-none focus:border-[#ff2a85]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">GENRE</label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#080910] border border-slate-700 text-xs text-white focus:outline-none focus:border-[#ff2a85]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={recordedUrl}
                download={`${title || 'tokyo_mix'}.webm`}
                className="flex-1 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700"
              >
                <Download className="w-4 h-4" />
                <span>Download Audio</span>
              </a>

              <button
                onClick={handlePublish}
                disabled={isPublished}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#ff2a85] to-[#8b5cf6] text-white font-mono text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-pink-500/30"
              >
                {isPublished ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Published!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Publish to Feed</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
