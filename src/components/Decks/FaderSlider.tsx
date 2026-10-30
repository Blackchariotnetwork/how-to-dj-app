import React from 'react';

interface FaderSliderProps {
  label?: string;
  value: number; // 0 to 1 for vertical volume, -1 to 1 for crossfader
  min?: number;
  max?: number;
  step?: number;
  orientation?: 'vertical' | 'horizontal';
  length?: number; // pixel height/width
  showScale?: boolean;
  accentColor?: string;
  onChange: (val: number) => void;
}

export const FaderSlider: React.FC<FaderSliderProps> = ({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  orientation = 'vertical',
  length = 160,
  showScale = true,
  accentColor = '#ff2a85',
  onChange,
}) => {
  const isVert = orientation === 'vertical';

  if (!isVert) {
    // Horizontal Crossfader
    return (
      <div className="flex flex-col w-full select-none">
        {label && (
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold mb-1">
            <span>{label}</span>
            <span>{value === 0 ? 'CENTER' : value < 0 ? `CH 1 (${Math.round(Math.abs(value) * 100)}%)` : `CH 2 (${Math.round(value * 100)}%)`}</span>
          </div>
        )}

        <div className="relative py-2 flex items-center">
          {/* Fader Track Slot */}
          <div className="w-full h-3 bg-[#07080f] rounded border border-slate-800 shadow-inner relative flex items-center px-1">
            {/* Center zero detent line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600" />

            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="w-full h-6 opacity-0 absolute inset-0 cursor-ew-resize z-20"
            />

            {/* Realistic Pioneer Crossfader Knob Body */}
            {(() => {
              const norm = (value - min) / (max - min);
              const leftPercent = norm * 100;
              return (
                <div
                  className="absolute pointer-events-none transition-none shadow-2xl flex items-center justify-center"
                  style={{
                    left: `calc(${leftPercent}% - 14px)`,
                    width: 28,
                    height: 22,
                    background: 'linear-gradient(180deg, #353a50 0%, #1a1c28 50%, #0d0f18 100%)',
                    borderRadius: 3,
                    border: '1.5px solid #4a5270',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.25)',
                  }}
                >
                  {/* Center White Marker Line */}
                  <div className="w-1 h-3.5 bg-white rounded-full shadow-sm" />
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // Vertical Channel Level Fader
  const norm = (value - min) / (max - min); // 0 at bottom, 1 at top
  const bottomPercent = norm * 100;

  return (
    <div className="flex items-center gap-2 select-none" style={{ height: length }}>
      {/* Decibel graduation scale ticks on the left */}
      {showScale && (
        <div className="flex flex-col justify-between h-full text-[8px] font-mono text-slate-500 font-bold py-1 text-right w-5">
          <span>+10</span>
          <span>+6</span>
          <span>+3</span>
          <span className="text-white">0</span>
          <span>-3</span>
          <span>-6</span>
          <span>-10</span>
          <span>-20</span>
          <span className="text-slate-600">-∞</span>
        </div>
      )}

      {/* Fader Track & Knob Container */}
      <div
        className="relative w-7 bg-[#07080f] rounded-lg border border-slate-800 shadow-inner flex justify-center py-2"
        style={{ height: length }}
      >
        {/* Center Metal Slot Opening */}
        <div className="w-1.5 h-full bg-[#030408] rounded-full border border-black/80 relative" />

        {/* Hidden Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-20"
        />

        {/* Realistic Pioneer 60mm Ribbed Fader Knob */}
        <div
          className="absolute pointer-events-none transition-none shadow-2xl flex items-center justify-center z-10"
          style={{
            bottom: `calc(${bottomPercent}% - 14px)`,
            width: 32,
            height: 24,
            background: 'linear-gradient(180deg, #3d435e 0%, #1f2233 45%, #10121d 100%)',
            borderRadius: 4,
            border: '1.5px solid #4f577c',
            boxShadow: '0 4px 12px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.3)',
          }}
        >
          {/* Ribbed Grip Indentations */}
          <div className="flex flex-col gap-0.5 items-center w-full px-2">
            <div className="w-full h-[1px] bg-black/60 shadow-sm" />
            <div className="w-full h-1 bg-white rounded-full shadow-sm" />
            <div className="w-full h-[1px] bg-black/60 shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};
