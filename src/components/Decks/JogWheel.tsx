import React, { useRef, useState, useEffect } from 'react';

interface JogWheelProps {
  deckId: 'A' | 'B';
  isPlaying: boolean;
  bpm: number;
  pitchPercent: number;
  currentTime: number;
  duration: number;
  musicalKey: string;
  color: string;
  onScratchNudge: (delta: number) => void;
  onPitchBend: (direction: number) => void;
  onVinylTouch?: (touching: boolean) => void;
}

export const JogWheel: React.FC<JogWheelProps> = ({
  deckId,
  isPlaying,
  bpm,
  pitchPercent,
  currentTime,
  duration,
  musicalKey,
  color,
  onScratchNudge,
  onPitchBend,
  onVinylTouch,
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [needleAngle, setNeedleAngle] = useState(0);
  const isDraggingCenter = useRef(false);
  const isDraggingRim = useRef(false);
  const lastAngle = useRef(0);
  const [jogTension, setJogTension] = useState<'LIGHT' | 'HEAVY'>('LIGHT');

  // Rotate On-Jog needle marker when playing (proportional to track BPM and playback rate)
  useEffect(() => {
    let animId: number;
    const rotateSpeed = (bpm / 120) * 1.8; // degrees per frame (33.3 RPM speed)

    const loop = () => {
      if (isPlaying && !isDraggingCenter.current) {
        setNeedleAngle((prev) => (prev + rotateSpeed) % 360);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, bpm]);

  // Angle math relative to wheel center
  const calculateAngle = (clientX: number, clientY: number) => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - centerY, clientX - centerX);
    return (rad * 180) / Math.PI;
  };

  // Center Touch Platter (Scratch & Stop)
  const handleCenterPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingCenter.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    lastAngle.current = calculateAngle(e.clientX, e.clientY);
    onVinylTouch?.(true);
  };

  const handleCenterPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingCenter.current) return;
    const currentAngle = calculateAngle(e.clientX, e.clientY);
    let delta = currentAngle - lastAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    setNeedleAngle((prev) => (prev + delta) % 360);
    onScratchNudge(delta * 0.05);
    lastAngle.current = currentAngle;
  };

  const handleCenterPointerUp = () => {
    isDraggingCenter.current = false;
    onVinylTouch?.(false);
  };

  // Outer Rim (Pitch Bend Nudge)
  const handleRimPointerDown = (e: React.PointerEvent) => {
    isDraggingRim.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    lastAngle.current = calculateAngle(e.clientX, e.clientY);
  };

  const handleRimPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRim.current) return;
    const currentAngle = calculateAngle(e.clientX, e.clientY);
    let delta = currentAngle - lastAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    if (Math.abs(delta) > 1) {
      onPitchBend(delta > 0 ? 0.3 : -0.3);
    }
    lastAngle.current = currentAngle;
  };

  const handleRimPointerUp = () => {
    isDraggingRim.current = false;
  };

  // Format time remaining
  const remaining = Math.max(0, duration - currentTime);
  const remMinutes = Math.floor(remaining / 60);
  const remSeconds = Math.floor(remaining % 60);
  const remTenths = Math.floor((remaining % 1) * 10);
  const formattedTime = `-${remMinutes.toString().padStart(2, '0')}:${remSeconds.toString().padStart(2, '0')}.${remTenths}`;

  return (
    <div className="flex flex-col items-center select-none w-full">
      {/* Top Jog Tension Switch (CDJ-3000 Feeling Adjust) */}
      <div className="flex items-center justify-between w-full max-w-[240px] px-2 mb-2 text-[9px] font-mono text-slate-400">
        <span className="uppercase tracking-wider">JOG ADJUST</span>
        <button
          onClick={() => setJogTension((prev) => (prev === 'LIGHT' ? 'HEAVY' : 'LIGHT'))}
          className="px-2 py-0.5 rounded bg-[#161824] border border-slate-700 text-slate-300 hover:text-white font-bold transition-colors"
        >
          {jogTension}
        </button>
      </div>

      {/* Main CDJ Jog Dial Body */}
      <div
        ref={wheelRef}
        onPointerDown={handleRimPointerDown}
        onPointerMove={handleRimPointerMove}
        onPointerUp={handleRimPointerUp}
        onPointerCancel={handleRimPointerUp}
        className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center touch-none transition-shadow"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #1c1e2b 0%, #12141f 65%, #08090e 100%)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.9), inset 0 2px 4px rgba(255,255,255,0.15), 0 0 0 2px #26293d',
        }}
        title="Touch center to scratch/brake. Drag outer rim to pitch bend nudge."
      >
        {/* Outer Knurled Edge Grips (36 tactile teeth) */}
        <div className="absolute inset-0 rounded-full pointer-events-none">
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3 bg-gradient-to-b from-[#3d435d] to-transparent opacity-75"
              style={{
                transformOrigin: '50% 104px', // half of 208px
                transform: `rotate(${i * 10}deg)`,
              }}
            />
          ))}
        </div>

        {/* Silver Outer Ring Accent Bevel */}
        <div className="absolute inset-3 rounded-full border border-slate-700/60 pointer-events-none shadow-inner" />

        {/* Inner Vinyl Center Platter (Capacitive Touch Surface) */}
        <div
          onPointerDown={handleCenterPointerDown}
          onPointerMove={handleCenterPointerMove}
          onPointerUp={handleCenterPointerUp}
          onPointerCancel={handleCenterPointerUp}
          className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full cursor-pointer flex items-center justify-center shadow-2xl transition-transform active:scale-[0.99]"
          style={{
            background: 'radial-gradient(circle, #10121a 0%, #08090e 100%)',
            border: '2px solid #282c3f',
          }}
        >
          {/* Micro Vinyl Micro-Grooves */}
          <div
            className="absolute inset-2 rounded-full pointer-events-none opacity-40"
            style={{
              background: 'repeating-radial-gradient(circle, #000 0px, #000 2px, #1a1d29 3px, #1a1d29 4px)',
            }}
          />

          {/* Pioneer CDJ-3000 Center On-Jog LCD Display (Matches Reference Image) */}
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#05060a] border-2 border-slate-800 shadow-inner flex flex-col items-center justify-center relative overflow-hidden pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.8)',
            }}
          >
            {/* Spinning Needle Slip Ring Arc on Jog LCD (Matches Red Arc in Photo) */}
            <div
              className="absolute inset-1 rounded-full pointer-events-none transition-none"
              style={{
                transform: `rotate(${needleAngle}deg)`,
              }}
            >
              {/* Pioneer Bright Red Sweeping Cue Needle Arc (45-degree luminous arc) */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="5"
                  strokeDasharray="45 280"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 6px #ef4444)' }}
                />
              </svg>
              {/* Sharp Leading Edge Needle Marker */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-white rounded-sm shadow-[0_0_8px_#ffffff]"
              />
            </div>

            {/* Inner LCD Disc: Exact Match with Reference Image! */}
            <div className="absolute inset-3 rounded-full overflow-hidden flex flex-col items-center justify-center bg-[#070912]">
              {deckId === 'A' ? (
                /* Deck 1 / Player 1 (Red Anime Disco Insignia matching reference) */
                <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-[#2a0812] via-[#120509] to-[#040103]">
                  <svg className="w-12 h-12 text-rose-500/90" viewBox="0 0 64 64" fill="none" stroke="currentColor">
                    <circle cx="32" cy="32" r="28" strokeWidth="1.5" strokeDasharray="3 2" className="text-red-700/60" />
                    {/* Stylized Cyber Kanji / Anime Skull Emblem */}
                    <path
                      d="M20 22C20 16 25 12 32 12C39 12 44 16 44 22C44 28 41 33 39 37L39 42H25L25 37C23 33 20 28 20 22Z"
                      strokeWidth="2"
                      fill="#7f1d1d"
                      fillOpacity="0.4"
                    />
                    <circle cx="26" cy="24" r="3.5" fill="#ef4444" />
                    <circle cx="38" cy="24" r="3.5" fill="#ef4444" />
                    <path d="M28 32H36" strokeWidth="2" strokeLinecap="round" />
                    <path d="M27 42V48M32 42V50M37 42V48" strokeWidth="2" strokeLinecap="round" stroke="#ef4444" />
                  </svg>
                  <div className="absolute bottom-1 px-1.5 py-0.2 rounded bg-black/80 border border-red-900/80 text-[7px] font-mono font-black text-rose-400">
                    {bpm.toFixed(1)}
                  </div>
                </div>
              ) : (
                /* Deck 2 / Player 2 (DJ Avatar Portrait matching reference photo) */
                <div className="w-full h-full relative flex items-center justify-center bg-[#070b12] overflow-hidden">
                  {/* Photo of DJ matching reference image */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <defs>
                        <radialGradient id="djGlow" cx="50%" cy="40%" r="50%">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                          <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="#050811" stopOpacity="0.9" />
                        </radialGradient>
                        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fed7aa" />
                          <stop offset="40%" stopColor="#fbcfe8" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                        <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3f3f46" />
                          <stop offset="60%" stopColor="#18181b" />
                          <stop offset="100%" stopColor="#09090b" />
                        </linearGradient>
                      </defs>
                      <rect width="100" height="100" fill="url(#djGlow)" />
                      {/* Torso / Dark Jacket */}
                      <path d="M15 95 Q30 72 50 72 Q70 72 85 95 Z" fill="#18181b" />
                      {/* White collar inner */}
                      <path d="M42 74 L50 84 L58 74 Z" fill="#f8fafc" />
                      {/* Neck */}
                      <rect x="44" y="60" width="12" height="15" fill="#fbcfe8" rx="2" />
                      {/* Face / Jaw */}
                      <path d="M35 42 Q32 64 50 67 Q68 64 65 42 Q64 25 50 25 Q36 25 35 42 Z" fill="url(#skinGrad)" />
                      {/* Hair with styled tufts matching reference */}
                      <path d="M32 38 Q32 20 50 18 Q68 20 68 38 Q66 30 58 24 Q48 24 38 27 Q34 32 32 38 Z" fill="url(#hairGrad)" />
                      <path d="M42 18 Q48 12 55 17 Q51 21 42 18 Z" fill="#27272a" />
                      {/* Eyes looking down at decks */}
                      <ellipse cx="43" cy="45" rx="3.5" ry="1.8" fill="#1c1917" />
                      <ellipse cx="57" cy="45" rx="3.5" ry="1.8" fill="#1c1917" />
                      {/* Eyebrows */}
                      <path d="M39 40 Q43 38 47 40" stroke="#27272a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      <path d="M53 40 Q57 38 61 40" stroke="#27272a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      {/* Nose */}
                      <path d="M50 45 L48 52 L52 52" stroke="#ea580c" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      {/* Mouth */}
                      <path d="M45 57 Q50 60 55 57" stroke="#b91c1c" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                      {/* Ambient club lighting overlay */}
                      <circle cx="50" cy="50" r="48" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.3" />
                    </svg>
                  </div>
                  {/* Digital Live BPM Readout badge */}
                  <div className="absolute bottom-1 px-1.5 py-0.2 rounded bg-black/90 border border-slate-700 text-[7px] font-mono font-black text-amber-400 shadow-sm">
                    {bpm.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tactile Pitch Bend Buttons underneath */}
      <div className="flex items-center justify-between w-full max-w-[240px] mt-2.5 px-1">
        <button
          onClick={() => onPitchBend(-1)}
          className="h-8 px-3 rounded-lg bg-[#141624] hover:bg-[#1e2238] active:bg-[#282d4a] border border-slate-700/80 text-[10px] font-mono font-bold text-slate-300 transition-colors flex items-center gap-1 active:scale-95"
          title="Nudge Tempo Pitch Bend Slower (-0.5%)"
        >
          <span>◀ - BEND</span>
        </button>

        <span className="text-[9px] font-mono text-slate-500 uppercase">
          CAPACITIVE JOG
        </span>

        <button
          onClick={() => onPitchBend(1)}
          className="h-8 px-3 rounded-lg bg-[#141624] hover:bg-[#1e2238] active:bg-[#282d4a] border border-slate-700/80 text-[10px] font-mono font-bold text-slate-300 transition-colors flex items-center gap-1 active:scale-95"
          title="Nudge Tempo Pitch Bend Faster (+0.5%)"
        >
          <span>+ BEND ▶</span>
        </button>
      </div>
    </div>
  );
};
