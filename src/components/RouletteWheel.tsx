import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { RouletteItem, VisualMode } from '../types/roulette';
import { soundManager } from '../utils/audio';

interface RouletteWheelProps {
  items: RouletteItem[];
  visualMode: VisualMode;
  spinDuration: number; // in seconds
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winner: RouletteItem, probability: number) => void;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  items,
  visualMode,
  spinDuration,
  isSpinning,
  onSpinStart,
  onSpinEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Wheel state
  const rotationRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const needleAngleRef = useRef<number>(0); // needle deflection angle in radians
  const needleTargetAngleRef = useRef<number>(0);
  const activeItems = items.filter((item) => !item.disabled);

  // Responsive size state
  const [size, setSize] = useState<number>(440);

  // Calculate slice spans
  const getSliceSpans = useCallback(() => {
    if (activeItems.length === 0) return [];

    const totalWeight = activeItems.reduce((acc, item) => acc + (item.weight > 0 ? item.weight : 0.001), 0);
    const spans: { item: RouletteItem; startAngle: number; endAngle: number; prob: number }[] = [];
    let currentAngle = 0;

    activeItems.forEach((item) => {
      const prob = (item.weight > 0 ? item.weight : 0.001) / totalWeight;
      const sliceAngle = visualMode === 'proportional' 
        ? prob * 2 * Math.PI 
        : (2 * Math.PI) / activeItems.length;

      spans.push({
        item,
        startAngle: currentAngle,
        endAngle: currentAngle + sliceAngle,
        prob,
      });
      currentAngle += sliceAngle;
    });

    return spans;
  }, [activeItems, visualMode]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        // Cap wheel size between 280px and 520px
        const optimalSize = Math.min(520, Math.max(280, width - 24));
        setSize(optimalSize);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw the wheel onto canvas
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const center = size / 2;
    const radius = center - 22; // Leave room for outer rim and needle

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const spans = getSliceSpans();
    if (spans.length === 0) {
      // Empty placeholder
      ctx.save();
      ctx.translate(center, center);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#F1F5F9';
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('항목을 2개 이상 추가해주세요', 0, 5);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotationRef.current);

    // 1. Draw Slices
    spans.forEach((span) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, span.startAngle, span.endAngle);
      ctx.closePath();

      // Slice background
      ctx.fillStyle = span.item.color;
      ctx.fill();

      // Hairline boundary between slices
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Slice Text
      ctx.save();
      const midAngle = (span.startAngle + span.endAngle) / 2;
      ctx.rotate(midAngle);

      // Determine text positioning along radius
      const textRadius = radius * 0.65;
      ctx.translate(textRadius, 0);

      // Rotate text to read outwards
      ctx.fillStyle = span.item.textColor || '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const sliceArc = span.endAngle - span.startAngle;
      // Adjust font size based on slice angle & radius
      const maxFontSize = Math.min(16, Math.max(10, Math.floor(sliceArc * radius * 0.18)));
      ctx.font = `600 ${maxFontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

      // Text truncation if title is too long
      let displayTitle = span.item.text;
      const maxTextWidth = radius * 0.48;
      if (ctx.measureText(displayTitle).width > maxTextWidth) {
        while (ctx.measureText(displayTitle + '..').width > maxTextWidth && displayTitle.length > 2) {
          displayTitle = displayTitle.slice(0, -1);
        }
        displayTitle += '..';
      }

      ctx.fillText(displayTitle, 0, -6);

      // Draw percentage label below text
      const percentText = `${(span.prob * 100).toFixed(1)}%`;
      ctx.font = `500 ${Math.max(9, maxFontSize - 3)}px monospace`;
      ctx.fillStyle = span.item.textColor ? `${span.item.textColor}CC` : 'rgba(255,255,255,0.85)';
      ctx.fillText(percentText, 0, 9);

      ctx.restore();
    });

    // 2. Outer Rim & Metallic Edge
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Subtle metallic inner ring
    ctx.beginPath();
    ctx.arc(0, 0, radius - 4, 0, 2 * Math.PI);
    ctx.strokeStyle = '#F8FAFC';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Rim Pegs / Pins (for clicking sensation)
    // Place pegs evenly around perimeter (minimum 24 pegs or slice count * 2)
    const pegCount = Math.max(24, activeItems.length * 4);
    for (let p = 0; p < pegCount; p++) {
      const pegAngle = (p * 2 * Math.PI) / pegCount;
      const px = Math.cos(pegAngle) * (radius - 4);
      const py = Math.sin(pegAngle) * (radius - 4);

      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 4. Center Hub
    const hubRadius = radius * 0.22;
    // Outer hub shadow ring
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius + 4, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
    ctx.fill();

    // Inner hub base
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.strokeStyle = '#F8FAFC';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore(); // Restore wheel rotation

    // 5. Draw Top Pointer Needle (Fixed at top, deflected when pegs hit)
    // Pointer pivot is at top center: (center, 14)
    ctx.save();
    const pointerPivotX = center;
    const pointerPivotY = 16;
    ctx.translate(pointerPivotX, pointerPivotY);
    ctx.rotate(needleAngleRef.current);

    // Needle drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // Needle path (triangle with sharp point facing downwards into the wheel)
    ctx.beginPath();
    ctx.moveTo(-11, -8);
    ctx.lineTo(11, -8);
    ctx.lineTo(0, 32); // Pointing down
    ctx.closePath();

    ctx.fillStyle = '#DC2626'; // Vivid red pointer
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Needle pivot circle cap
    ctx.beginPath();
    ctx.arc(0, -2, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }, [size, getSliceSpans, activeItems]);

  // Initial draw and redraw on size/item change
  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // Execute Spin Animation
  const startSpin = useCallback(() => {
    if (isSpinning || activeItems.length < 2) return;

    const spans = getSliceSpans();
    if (spans.length === 0) return;

    // 1. Pick winner according to true cumulative probability using crypto
    const cryptoArray = new Uint32Array(1);
    window.crypto.getRandomValues(cryptoArray);
    const rand = cryptoArray[0] / (0xffffffff + 1);

    let cumulative = 0;
    let selectedSpan = spans[spans.length - 1]; // Fallback to last
    for (let i = 0; i < spans.length; i++) {
      cumulative += spans[i].prob;
      if (rand <= cumulative) {
        selectedSpan = spans[i];
        break;
      }
    }

    onSpinStart();

    // 2. Calculate target stopping rotation
    // Pick an angle safely inside the winning slice (between 15% and 85% of arc)
    const sliceWidth = selectedSpan.endAngle - selectedSpan.startAngle;
    const innerRandom = 0.2 + (cryptoArray[0] % 1000) / 1000 * 0.6;
    const targetSliceAngle = selectedSpan.startAngle + sliceWidth * innerRandom;

    // Pointer is at -Math.PI / 2 (top)
    // Final rotation R must satisfy: (-Math.PI / 2 - R) % 2pi === targetSliceAngle % 2pi
    // That is: R === -Math.PI / 2 - targetSliceAngle (mod 2pi)
    const pointerAngle = -Math.PI / 2;
    const currentRot = rotationRef.current;
    
    // Total spins: based on duration (e.g. 5 to 8 full revolutions)
    const baseRevolutions = Math.max(4, Math.floor(spinDuration * 1.5));
    const twoPi = 2 * Math.PI;

    // Calculate delta to reach desired orientation
    let targetNormalized = (pointerAngle - targetSliceAngle) % twoPi;
    if (targetNormalized < 0) targetNormalized += twoPi;

    let currentNormalized = currentRot % twoPi;
    if (currentNormalized < 0) currentNormalized += twoPi;

    let deltaAngle = targetNormalized - currentNormalized;
    if (deltaAngle < 0) deltaAngle += twoPi;

    // Add multiple full revolutions clockwise
    const totalRotationDelta = baseRevolutions * twoPi + deltaAngle;
    const startRotation = currentRot;
    const finalRotation = startRotation + totalRotationDelta;

    const pegCount = Math.max(24, activeItems.length * 4);
    const pegAngleStep = twoPi / pegCount;
    let lastPegIndex = Math.floor(startRotation / pegAngleStep);

    const startTime = performance.now();
    const durationMs = spinDuration * 1000;

    // Quintic ease out for silky realistic casino deceleration
    const easeOutQuint = (t: number): number => {
      return 1 - Math.pow(1 - t, 5);
    };

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = easeOutQuint(progress);

      const currentAngle = startRotation + totalRotationDelta * eased;
      rotationRef.current = currentAngle;

      // Peg collision & tick sound detection
      const currentPegIndex = Math.floor(currentAngle / pegAngleStep);
      if (currentPegIndex > lastPegIndex) {
        const pegsCrossed = currentPegIndex - lastPegIndex;
        lastPegIndex = currentPegIndex;

        // Velocity metric for tick sound pitch & needle deflection
        const remainingTime = 1 - progress;
        const velocity = remainingTime * 4;
        soundManager.playTick(velocity);

        // Deflect needle in the direction of spin
        needleTargetAngleRef.current = Math.min(0.45, 0.15 + velocity * 0.08);
      }

      // Smooth needle spring bounce
      needleAngleRef.current += (needleTargetAngleRef.current - needleAngleRef.current) * 0.35;
      needleTargetAngleRef.current *= 0.75; // decay back to 0

      drawWheel();

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Finished!
        rotationRef.current = finalRotation;
        needleAngleRef.current = 0;
        drawWheel();

        // Celebration
        soundManager.playWinFanfare();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: [selectedSpan.item.color, '#F59E0B', '#DC2626', '#10B981', '#3B82F6'],
        });

        onSpinEnd(selectedSpan.item, selectedSpan.prob);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [isSpinning, activeItems, getSliceSpans, onSpinStart, spinDuration, drawWheel, onSpinEnd]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Expose spin action via spacebar or button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        startSpin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, startSpin]);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center p-2">
      <div className="relative inline-flex items-center justify-center">
        {/* Canvas Wheel */}
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          className="rounded-full shadow-2xl transition-transform duration-200"
        />

        {/* Center Interactive Spin Button */}
        <button
          onClick={startSpin}
          disabled={isSpinning || activeItems.length < 2}
          aria-label="룰렛 돌리기"
          className={`absolute flex flex-col items-center justify-center rounded-full font-bold shadow-lg transition-all duration-200 cursor-pointer ${
            isSpinning
              ? 'cursor-not-allowed bg-slate-800 text-slate-400 scale-95 border-2 border-slate-700'
              : 'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 border-4 border-white shadow-amber-500/20'
          }`}
          style={{
            width: Math.max(68, size * 0.22),
            height: Math.max(68, size * 0.22),
          }}
        >
          <span className="text-sm sm:text-base font-black tracking-tight">
            {isSpinning ? '회전중' : 'START'}
          </span>
          <span className="text-[10px] font-semibold opacity-75 hidden sm:inline">
            {isSpinning ? '...' : 'SPACE'}
          </span>
        </button>
      </div>
    </div>
  );
};
