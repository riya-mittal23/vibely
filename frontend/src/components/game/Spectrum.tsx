import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface SpectrumProps {
  leftLabel: string;
  rightLabel: string;
  targetPosition: number; // 0 to 100
  targetWidth: number; // Percentage width
  guessPosition: number; // 0 to 100
  showTarget: boolean;
  interactive: boolean;
  onGuessChange?: (position: number) => void;
}

export const Spectrum: React.FC<SpectrumProps> = ({
  leftLabel,
  rightLabel,
  targetPosition,
  targetWidth,
  guessPosition,
  showTarget,
  interactive,
  onGuessChange
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const handlePointerEvent = (e: React.PointerEvent) => {
    if (!interactive || !onGuessChange || !svgRef.current) return;
    
    // Only drag on move if button is pressed
    if (e.type === 'pointermove' && e.buttons === 0) return;

    if (e.type === 'pointerdown') {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }

    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.bottom; 
    
    const dx = e.clientX - cx;
    const dy = cy - e.clientY; 

    let angle = Math.atan2(dy, dx);
    
    if (angle < 0) {
      angle = dx > 0 ? 0 : Math.PI;
    }

    const percentage = 100 - (angle / Math.PI) * 100;
    onGuessChange(Math.round(Math.max(0, Math.min(100, percentage))));
  };

  const getArcPath = (startPct: number, endPct: number, radius: number, thickness: number) => {
    const getCoords = (pct: number, r: number) => {
      const rad = Math.PI - (pct / 100) * Math.PI;
      return {
        x: 100 + r * Math.cos(rad),
        y: 100 - r * Math.sin(rad)
      };
    };

    const start = getCoords(startPct, radius);
    const end = getCoords(endPct, radius);
    const innerR = radius - thickness;
    const innerStart = getCoords(startPct, innerR);
    const innerEnd = getCoords(endPct, innerR);
    
    const largeArc = endPct - startPct > 50 ? 1 : 0;
    
    return [
      `M ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
      `Z`
    ].join(' ');
  };

  // Target boundaries
  const tStart = Math.max(0, targetPosition - targetWidth / 2);
  const tEnd = Math.min(100, targetPosition + targetWidth / 2);
  
  const midStart = Math.max(0, targetPosition - targetWidth * 0.3);
  const midEnd = Math.min(100, targetPosition + targetWidth * 0.3);
  
  const innerStart = Math.max(0, targetPosition - targetWidth * 0.1);
  const innerEnd = Math.min(100, targetPosition + targetWidth * 0.1);

  // Rotation for the needle
  const needleRotation = (guessPosition - 50) * (90 / 50);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center select-none touch-none overflow-visible">
      <div className="w-full max-w-3xl flex flex-col items-center justify-center flex-1 py-4">
        <svg
          ref={svgRef}
          viewBox="0 0 200 100"
          className={cn(
            "w-full max-h-[40vh] drop-shadow-2xl overflow-visible",
            interactive ? "cursor-grab active:cursor-grabbing" : ""
          )}
          onPointerDown={handlePointerEvent}
          onPointerMove={handlePointerEvent}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Wavelength target colors */}
            <linearGradient id="band1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="band2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="band3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Invisible background to catch pointer events across the entire SVG area (including empty space and the needle) */}
          <rect x="0" y="0" width="200" height="100" fill="transparent" />

          {/* Background Arc */}
          <path
            d={getArcPath(0, 100, 95, 45)}
            fill="rgba(15, 23, 42, 0.7)"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.5"
          />

          {/* Tick marks on background arc */}
          {Array.from({ length: 11 }).map((_, i) => {
            const pct = i * 10;
            const outer = 95;
            const inner = pct % 50 === 0 ? 50 : 80;
            const rad = Math.PI - (pct / 100) * Math.PI;
            const x1 = 100 + outer * Math.cos(rad);
            const y1 = 100 - outer * Math.sin(rad);
            const x2 = 100 + inner * Math.cos(rad);
            const y2 = 100 - inner * Math.sin(rad);
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.2)" strokeWidth={pct % 50 === 0 ? "1.5" : "0.5"} />
            );
          })}

          {/* Target Zone - Animated */}
          <motion.g
            initial={false}
            animate={{ 
              opacity: showTarget ? 1 : 0,
              scale: showTarget ? 1 : 0.95
            }}
            style={{ originX: "100px", originY: "100px" }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          >
            {/* Outer wedge (2 points) - Orange */}
            <path
              d={getArcPath(tStart, tEnd, 95, 45)}
              fill="url(#band1)"
            />
            {/* Middle wedge (3 points) - Green */}
            <path
              d={getArcPath(midStart, midEnd, 95, 45)}
              fill="url(#band2)"
            />
            {/* Inner bullseye (4 points) - Blue */}
            <path
              d={getArcPath(innerStart, innerEnd, 95, 45)}
              fill="url(#band3)"
            />
          </motion.g>

          {/* The Needle Screen/Cover (when hidden) */}
          <motion.path
            initial={false}
            animate={{ opacity: showTarget ? 0 : 1 }}
            transition={{ duration: 0.4 }}
            d={getArcPath(0, 100, 95, 45)}
            fill="url(#screenGradient)"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="0.5"
            className="pointer-events-none"
          />

          <defs>
             <linearGradient id="screenGradient" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="rgba(30, 41, 59, 0.95)" />
               <stop offset="100%" stopColor="rgba(15, 23, 42, 0.98)" />
             </linearGradient>
          </defs>

          {/* Dial Base Center Pivot Cover */}
          <path d="M 85 100 A 15 15 0 0 1 115 100 Z" fill="#0f172a" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          
          {/* The Needle */}
          <g transform="translate(100, 100)" className="pointer-events-none">
            <motion.g
              initial={false}
              animate={{ rotate: needleRotation }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            >
              {/* Invisible bounding box to center Framer Motion's default 50% 50% origin perfectly at (0,0) */}
              <circle cx="0" cy="0" r="92" fill="transparent" stroke="none" />
              
              {/* Needle line */}
              <polygon 
                points="-1.5,0 0,-92 1.5,0" 
                fill="white"
                filter="url(#glow)"
              />
              <polygon 
                points="-1,0 0,-92 1,0" 
                fill="#fb7185" // Rose 400
              />
              {/* Needle center dot */}
              <circle cx="0" cy="0" r="5" fill="#e11d48" stroke="white" strokeWidth="1.5" />
            </motion.g>
          </g>

        </svg>

        {/* Labels below the arc */}
        <div className="w-full flex justify-between px-2 sm:px-4 mt-2">
          <span className="text-xs sm:text-base font-black uppercase tracking-widest text-primary text-left max-w-[45%] leading-tight drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
            {leftLabel}
          </span>
          <span className="text-xs sm:text-base font-black uppercase tracking-widest text-secondary text-right max-w-[45%] leading-tight drop-shadow-[0_0_8px_rgba(251,113,133,0.4)]">
            {rightLabel}
          </span>
        </div>
        
        <input
          type="range"
          min="0"
          max="100"
          value={guessPosition}
          onChange={(e) => onGuessChange?.(Number(e.target.value))}
          disabled={!interactive}
          className="sr-only"
          aria-label="Guess marker"
        />
      </div>
    </div>
  );
};
