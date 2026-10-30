import React, { useRef, useState, useEffect } from 'react';

interface RotaryKnobProps {
  label: string;
  value: number; // Current value
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  isCenterDetent?: boolean;
  onChange: (val: number) => void;
}

export const RotaryKnob: React.FC<RotaryKnobProps> = ({
  label,
  value,
  min,
  max,
  step = 0.01,
  defaultValue = 0,
  unit = '',
  size = 'md',
  color = '#ff2a85',
  isCenterDetent = false,
  onChange,
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startVal = useRef(0);

  // Map value to angle (-135deg to +135deg = 270 degree rotation)
  const normalized = (value - min) / (max - min);
  const angle = -135 + normalized * 270;

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startVal.current = value;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaY = startY.current - e.clientY; // upward drag increases
    const range = max - min;
    const sensitivity = 0.005; // 200px drag covers full range
    let newVal = startVal.current + deltaY * range * sensitivity;

    // Center detent magnetic snap
    if (isCenterDetent && Math.abs(newVal - defaultValue) < range * 0.04) {
      newVal = defaultValue;
    }

    newVal = Math.max(min, Math.min(max, newVal));
    onChange(newVal);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleDoubleClick = () => {
    onChange(defaultValue);
  };

  const dimensions =
    size === 'sm' ? { knob: 32, cap: 24 } : size === 'lg' ? { knob: 50, cap: 38 } : { knob: 40, cap: 30 };

  return (
    <div className="flex flex-col items-center select-none group">
      {/* Label above */}
      <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase mb-1">
        {label}
      </span>

      {/* Rotary Knob Body with realistic graduation marks */}
      <div className="relative flex items-center justify-center">
        {/* Graduation Tick Ring */}
        <svg
          width={dimensions.knob + 16}
          height={dimensions.knob + 16}
          className="absolute inset-0 pointer-events-none"
        >
          {Array.from({ length: 11 }).map((_, i) => {
            const tickAngle = -135 + (i / 10) * 270;
            const rad = (tickAngle * Math.PI) / 180;
            const r1 = dimensions.knob / 2 + 3;
            const r2 = dimensions.knob / 2 + (i === 0 || i === 5 || i === 10 ? 7 : 5);
            const cx = (dimensions.knob + 16) / 2;
            const cy = (dimensions.knob + 16) / 2;
            const x1 = cx + r1 * Math.sin(rad);
            const y1 = cy - r1 * Math.cos(rad);
            const x2 = cx + r2 * Math.sin(rad);
            const y2 = cy - r2 * Math.cos(rad);
            const isCenter = i === 5 && isCenterDetent;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isCenter ? '#00f0ff' : '#475569'}
                strokeWidth={i === 0 || i === 5 || i === 10 ? 1.5 : 1}
              />
            );
          })}
        </svg>

        {/* Tactile Knob Platter */}
        <div
          ref={knobRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={handleDoubleClick}
          className="rounded-full cursor-ns-resize shadow-lg flex items-center justify-center touch-none relative active:scale-[0.98] transition-transform"
          style={{
            width: dimensions.knob,
            height: dimensions.knob,
            background: 'radial-gradient(circle at 35% 35%, #2a2e42 0%, #151824 60%, #0d0f18 100%)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.15)',
            border: '1.5px solid #1a1e2f',
          }}
          title={`${label}: ${value.toFixed(1)}${unit} (Double click to reset)`}
        >
          {/* Knurled rubber side ridges */}
          <div
            className="absolute inset-0 rounded-full opacity-60 pointer-events-none"
            style={{
              background: 'repeating-conic-gradient(#151824 0deg 10deg, #23273c 10deg 20deg)',
            }}
          />

          {/* Aluminum Faceplate Cap with Rotating Pointer Indicator */}
          <div
            className="rounded-full flex items-center justify-center relative shadow-inner"
            style={{
              width: dimensions.cap,
              height: dimensions.cap,
              background: 'radial-gradient(circle at 40% 40%, #3a3f58 0%, #1a1c2a 80%)',
              border: '1px solid #4a5170',
              transform: `rotate(${angle}deg)`,
            }}
          >
            {/* White/Colored Marker Notch */}
            <div
              className="absolute top-1 w-0.5 rounded-full"
              style={{
                height: dimensions.cap * 0.38,
                backgroundColor: isCenterDetent && Math.abs(value - defaultValue) < 0.1 ? '#00f0ff' : '#ffffff',
                boxShadow: isCenterDetent && Math.abs(value - defaultValue) < 0.1 ? '0 0 6px #00f0ff' : '0 0 2px rgba(255,255,255,0.8)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Value Readout below */}
      <span className="text-[9px] font-mono font-semibold text-slate-400 mt-1">
        {value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)}
        {unit}
      </span>
    </div>
  );
};
