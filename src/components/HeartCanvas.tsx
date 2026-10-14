import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ColorTheme, PlacedItem, Particle, Dedication, LovePhrase } from '../types';
import {
  FONT_FAMILY,
  LIFT,
  clamp,
  dimRgb,
  mixRgb,
  rgbToHex,
  rgbToRgbaString,
} from '../utils/heartMath';
import { playHeartbeatSound, playChimeSound } from '../utils/audio';

interface HeartCanvasProps {
  items: PlacedItem[];
  theme: ColorTheme;
  phrasesMap: Map<string, LovePhrase>;
  isPlaying: boolean;
  speed: number;
  enableHeartbeatPulse: boolean;
  enableParticles: boolean;
  enableAudio: boolean;
  dedication: Dedication;
  selectedLangId: string | null;
  onItemHover: (item: PlacedItem | null, phrase: LovePhrase | null) => void;
  onAnimationComplete: () => void;
}

export const HeartCanvas: React.FC<HeartCanvasProps> = ({
  items,
  theme,
  phrasesMap,
  isPlaying,
  speed,
  enableHeartbeatPulse,
  enableParticles,
  enableAudio,
  dedication,
  selectedLangId,
  onItemHover,
  onAnimationComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Runtime animation state
  const itemsRef = useRef<PlacedItem[]>([]);
  const spawnIndexRef = useRef<number>(0);
  const spawnAccRef = useRef<number>(0);
  const isSpawningRef = useRef<boolean>(true);
  const activeItemsRef = useRef<PlacedItem[]>([]);
  const shimmerPoolRef = useRef<PlacedItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const hoveredItemRef = useRef<PlacedItem | null>(null);
  const animationFinishedReportedRef = useRef<boolean>(false);

  // Heartbeat pulse state
  const heartbeatTimerRef = useRef<number>(0);

  // Canvas dimensions
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 800,
  });

  // Re-initialize items when items prop or theme changes
  useEffect(() => {
    // Clone items and reset animation state
    const cloned = items.map((it) => ({
      ...it,
      f: 0,
      isSpawned: false,
      isSettled: false,
      isShimmering: false,
      shimmerProgress: 0,
    }));
    itemsRef.current = cloned;
    spawnIndexRef.current = 0;
    spawnAccRef.current = 0;
    isSpawningRef.current = true;
    activeItemsRef.current = [];
    shimmerPoolRef.current = [];
    animationFinishedReportedRef.current = false;
  }, [items, theme]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      if (w > 0 && h > 0) {
        setDimensions({ width: w, height: h });
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Spawn background ambient particles
  const spawnAmbientParticle = useCallback((width: number, height: number) => {
    if (particlesRef.current.length > 50) return;
    const isHeart = Math.random() < 0.35;
    particlesRef.current.push({
      x: width / 2 + (Math.random() - 0.5) * width * 0.7,
      y: height * 0.85 + Math.random() * 50,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.4 + Math.random() * 0.6),
      size: isHeart ? 6 + Math.random() * 6 : 1.5 + Math.random() * 2.5,
      color: theme.accentHex,
      alpha: 0.1 + Math.random() * 0.3,
      life: 0,
      maxLife: 200 + Math.random() * 200,
      type: isHeart ? 'heart' : 'sparkle',
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.02,
    });
  }, [theme.accentHex]);

  // Click burst particle spawner
  const spawnBurstAt = useCallback((canvasX: number, canvasY: number) => {
    playChimeSound();
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.4;
      const speed = 1.2 + Math.random() * 2.8;
      particlesRef.current.push({
        x: canvasX,
        y: canvasY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0,
        size: Math.random() > 0.4 ? 7 + Math.random() * 6 : 2 + Math.random() * 3,
        color: Math.random() > 0.3 ? theme.accentHex : theme.glowHex,
        alpha: 0.8 + Math.random() * 0.2,
        life: 0,
        maxLife: 60 + Math.random() * 50,
        type: Math.random() > 0.4 ? 'heart' : 'sparkle',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
      });
    }
  }, [theme.accentHex, theme.glowHex]);

  // Main rendering animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let shimmerTimer = 0;

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);

      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }
      const deltaMs = Math.min(currentTime - lastTimeRef.current, 50);
      lastTimeRef.current = currentTime;

      const dpr = window.devicePixelRatio || 1;
      const displayWidth = dimensions.width;
      const displayHeight = dimensions.height;

      // Adjust buffer size for crisp HiDPI
      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Draw rich ambient background
      ctx.fillStyle = theme.bgHex;
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Subtle radial vignette glow behind heart
      const centerX = displayWidth / 2;
      const centerY = displayHeight / 2 - 10;
      const bgGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        40,
        centerX,
        centerY,
        Math.min(displayWidth, displayHeight) * 0.65
      );
      bgGlow.addColorStop(0, rgbToRgbaString(theme.wineRgb, 0.16));
      bgGlow.addColorStop(0.6, rgbToRgbaString(theme.bgRgb, 0.06));
      bgGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Scaling calculation so heart fits viewport comfortably
      // Base heart height is ~720, width ~680
      const baseScale = Math.min(displayWidth, displayHeight) / 840;
      const scale = Math.max(0.42, Math.min(1.25, baseScale));

      // Heartbeat pulse scale
      let pulseScale = 1.0;
      if (enableHeartbeatPulse) {
        heartbeatTimerRef.current += (deltaMs / 1000) * (isPlaying ? 1.2 : 0);
        // Double beat rhythm
        const cycle = heartbeatTimerRef.current % 1.2;
        if (cycle < 0.12) {
          pulseScale = 1.0 + Math.sin((cycle / 0.12) * Math.PI) * 0.024;
        } else if (cycle > 0.18 && cycle < 0.3) {
          pulseScale = 1.0 + Math.sin(((cycle - 0.18) / 0.12) * Math.PI) * 0.016;
        }

        // Trigger heartbeat audio on pulse peak
        if (enableAudio && cycle < 0.04 && Math.random() < 0.15) {
          playHeartbeatSound();
        }
      }

      // 2. Spawn items if playing
      const allItems = itemsRef.current;
      const totalCount = allItems.length;

      if (isPlaying && isSpawningRef.current && totalCount > 0) {
        // Base rate: total / (10s * 1000 / 16ms) ≈ total / 625 items per frame
        const durationSec = 10 / Math.max(0.1, speed);
        const ratePerFrame = (totalCount / (durationSec * 60)) * (deltaMs / 16.66);

        spawnAccRef.current += ratePerFrame;
        while (spawnAccRef.current >= 1 && spawnIndexRef.current < totalCount) {
          spawnAccRef.current -= 1;
          const item = allItems[spawnIndexRef.current];
          item.isSpawned = true;
          item.f = 0;
          activeItemsRef.current.push(item);
          spawnIndexRef.current++;
        }

        if (spawnIndexRef.current >= totalCount) {
          isSpawningRef.current = false;
        }
      }

      // 3. Update active animating items
      if (isPlaying) {
        const stillActive: PlacedItem[] = [];
        for (let i = 0; i < activeItemsRef.current.length; i++) {
          const p = activeItemsRef.current[i];
          p.f += (deltaMs / 16.66) * speed;

          if (p.f >= p.animDuration) {
            p.f = p.animDuration;
            p.isSettled = true;
            shimmerPoolRef.current.push(p);
          } else {
            stillActive.push(p);
          }
        }
        activeItemsRef.current = stillActive;

        // Check if finished spawning and all settled
        if (
          !isSpawningRef.current &&
          activeItemsRef.current.length === 0 &&
          !animationFinishedReportedRef.current
        ) {
          animationFinishedReportedRef.current = true;
          onAnimationComplete();
        }

        // 4. Update shimmering phrases
        shimmerTimer += deltaMs;
        if (shimmerTimer > 130 && shimmerPoolRef.current.length > 0) {
          shimmerTimer = 0;
          // Shimmer 1 or 2 phrases at a time
          const count = Math.random() > 0.4 ? 2 : 1;
          for (let k = 0; k < count; k++) {
            const target =
              shimmerPoolRef.current[
                Math.floor(Math.random() * shimmerPoolRef.current.length)
              ];
            if (target && !target.isShimmering) {
              target.isShimmering = true;
              target.shimmerProgress = 0;
              if (enableAudio && Math.random() < 0.25) {
                playChimeSound();
              }
            }
          }
        }

        for (const item of allItems) {
          if (item.isShimmering) {
            item.shimmerProgress += (deltaMs / 380) * speed;
            if (item.shimmerProgress >= 1) {
              item.isShimmering = false;
              item.shimmerProgress = 0;
            }
          }
        }
      }

      // 5. Draw particles (behind and around heart)
      if (enableParticles) {
        if (Math.random() < 0.2) {
          spawnAmbientParticle(displayWidth, displayHeight);
        }

        const livingParticles: Particle[] = [];
        for (const pt of particlesRef.current) {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.rotation += pt.vRot;
          pt.life++;
          const progress = pt.life / pt.maxLife;
          const currentAlpha = pt.alpha * (1 - progress);

          if (progress < 1) {
            livingParticles.push(pt);
            ctx.save();
            ctx.translate(pt.x, pt.y);
            ctx.rotate(pt.rotation);
            ctx.globalAlpha = currentAlpha;

            if (pt.type === 'heart') {
              ctx.fillStyle = pt.color;
              drawMiniHeart(ctx, pt.size);
            } else {
              ctx.fillStyle = pt.color;
              ctx.beginPath();
              ctx.arc(0, 0, pt.size, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }
        }
        particlesRef.current = livingParticles;
      }

      // 6. Draw all heart items
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scale * pulseScale, scale * pulseScale);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const bgc = theme.bgRgb;
      const flashRgb = theme.flashRgb;

      for (let i = 0; i < allItems.length; i++) {
        const p = allItems[i];
        if (!p.isSpawned) continue;

        const u = clamp(p.f / p.animDuration);
        const e = 1 - Math.pow(1 - u, 3); // cubic ease-out
        const hover = (1 - e) * LIFT;
        const px = p.x + p.dx * (1 - e);
        const py = -p.y - hover; // Invert y to match mathematical heart coordinate

        const isHovered = hoveredItemRef.current?.id === p.id;
        const isLangFiltered = selectedLangId ? p.languageId === selectedLangId : false;

        // Shadow during animation
        if (!p.isSettled) {
          const shadowColor = mixRgb(bgc, dimRgb(p.color, 0.3), e);
          ctx.fillStyle = rgbToHex(shadowColor);
          ctx.font = `bold ${p.size}px ${FONT_FAMILY}`;
          ctx.fillText(p.text, px + 2, py + 3);

          // Halo glow
          const haloColor = mixRgb(bgc, dimRgb(p.color, 0.2), e * e);
          ctx.fillStyle = rgbToHex(haloColor);
          ctx.font = `bold ${p.size + 1}px ${FONT_FAMILY}`;
          ctx.fillText(p.text, px, py);
        }

        // Color computation
        let finalColorRgb = p.color;

        if (!p.isSettled) {
          // Entrance flash
          const flashPhase = clamp((u - 0.55) / 0.45);
          const flashIntensity = 0.75 * Math.sin(flashPhase * Math.PI);
          const easedBase = mixRgb(bgc, p.color, Math.pow(e, 1.5));
          finalColorRgb = mixRgb(easedBase, flashRgb, flashIntensity);
        } else if (p.isShimmering) {
          // Shimmer peak around 0.35 then fade
          const shimmerCurve = Math.sin(p.shimmerProgress * Math.PI);
          finalColorRgb = mixRgb(p.color, flashRgb, shimmerCurve * 0.65);
        }

        // Highlight override if hovered or language filtered
        if (isHovered) {
          ctx.save();
          ctx.shadowColor = theme.glowHex;
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${p.size + 2}px ${FONT_FAMILY}`;
          ctx.fillText(p.text, px, py);
          ctx.restore();
        } else if (isLangFiltered) {
          ctx.save();
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#fef08a';
          ctx.font = `bold ${p.size + 1}px ${FONT_FAMILY}`;
          ctx.fillText(p.text, px, py);
          ctx.restore();
        } else {
          ctx.fillStyle = rgbToHex(finalColorRgb);
          ctx.font = `bold ${p.size}px ${FONT_FAMILY}`;
          ctx.fillText(p.text, px, py);
        }
      }

      // 7. Optional Dedication Inscription in heart center
      if (dedication.showOnHeart && (dedication.recipient || dedication.sender)) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 12;

        if (dedication.recipient) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `italic 600 13px 'Playfair Display', serif`;
          ctx.fillText(`Forever for ${dedication.recipient}`, 0, 160);
        }
        if (dedication.sender) {
          ctx.fillStyle = theme.accentHex;
          ctx.font = `500 11px ${FONT_FAMILY}`;
          ctx.fillText(`With love, ${dedication.sender}`, 0, 180);
        }
        ctx.restore();
      }

      ctx.restore(); // Restore scale/translate
      ctx.restore(); // Restore DPR scale
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    dimensions,
    isPlaying,
    speed,
    enableHeartbeatPulse,
    enableParticles,
    enableAudio,
    theme,
    dedication,
    selectedLangId,
    spawnAmbientParticle,
    onAnimationComplete,
  ]);

  // Mini heart drawing path helper
  const drawMiniHeart = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(
      -size / 2,
      -size / 2,
      -size,
      topCurveHeight / 3,
      0,
      size
    );
    ctx.bezierCurveTo(
      size,
      topCurveHeight / 3,
      size / 2,
      -size / 2,
      0,
      topCurveHeight
    );
    ctx.closePath();
    ctx.fill();
  };

  // Mouse interaction: Hover detection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const displayWidth = dimensions.width;
    const displayHeight = dimensions.height;
    const centerX = displayWidth / 2;
    const centerY = displayHeight / 2 - 10;
    const baseScale = Math.min(displayWidth, displayHeight) / 840;
    const scale = Math.max(0.42, Math.min(1.25, baseScale));

    let found: PlacedItem | null = null;
    const all = itemsRef.current;

    for (let i = all.length - 1; i >= 0; i--) {
      const p = all[i];
      if (!p.isSpawned) continue;
      const screenX = centerX + p.x * scale;
      const screenY = centerY - p.y * scale;

      const halfW = (p.w / 2 + 6) * scale;
      const halfH = (p.size / 2 + 4) * scale;

      if (
        mouseX >= screenX - halfW &&
        mouseX <= screenX + halfW &&
        mouseY >= screenY - halfH &&
        mouseY <= screenY + halfH
      ) {
        found = p;
        break;
      }
    }

    if (found !== hoveredItemRef.current) {
      hoveredItemRef.current = found;
      if (found && found.languageId) {
        const phrase = phrasesMap.get(found.languageId) || null;
        onItemHover(found, phrase);
        if (enableAudio) {
          playChimeSound(found.id % 7);
        }
      } else {
        onItemHover(null, null);
      }
    }
  };

  const handleMouseLeave = () => {
    hoveredItemRef.current = null;
    onItemHover(null, null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    spawnBurstAt(clickX, clickY);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer select-none"
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="w-full h-full block touch-none"
      />
    </div>
  );
};
