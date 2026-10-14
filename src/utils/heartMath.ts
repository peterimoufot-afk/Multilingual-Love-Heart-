import { ColorTheme, PlacedItem, RGB, LovePhrase } from '../types';

export const SC = 21;
export const OY = 20;
export const LIFT = 34;
export const GAP = 7;
export const SIZES = [9, 10, 11, 12];
export const FONT_FAMILY = "'Plus Jakarta Sans', Arial, sans-serif";

/** Mulberry32 seeded pseudorandom number generator */
export function createRNG(seed: number = 11) {
  let s = seed | 0;
  return function rng(): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mixRgb(a: RGB, b: RGB, k: number): RGB {
  return [
    a[0] + (b[0] - a[0]) * k,
    a[1] + (b[1] - a[1]) * k,
    a[2] + (b[2] - a[2]) * k,
  ];
}

export function dimRgb(c: RGB, k: number): RGB {
  return [c[0] * k, c[1] * k, c[2] * k];
}

export function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

export function rgbToHex(c: RGB): string {
  const r = Math.round(clamp(c[0]) * 255);
  const g = Math.round(clamp(c[1]) * 255);
  const b = Math.round(clamp(c[2]) * 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function rgbToRgbaString(c: RGB, alpha: number = 1): string {
  const r = Math.round(clamp(c[0]) * 255);
  const g = Math.round(clamp(c[1]) * 255);
  const b = Math.round(clamp(c[2]) * 255);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

/** Parametric heart coordinate calculation */
export function heartPoint(a: number, sc = SC, oy = OY): [number, number] {
  const x = 16 * Math.pow(Math.sin(a), 3);
  const y =
    13 * Math.cos(a) -
    5 * Math.cos(2 * a) -
    2 * Math.cos(3 * a) -
    Math.cos(4 * a);
  return [x * sc, y * sc + oy];
}

export function computePolygon(steps = 720, sc = SC, oy = OY): [number, number][] {
  const poly: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const a = (2 * Math.PI * i) / steps;
    poly.push(heartPoint(a, sc, oy));
  }
  return poly;
}

export function getEdges(poly: [number, number][]): [number, number, number, number][] {
  const edges: [number, number, number, number][] = [];
  for (let i = 0; i < poly.length; i++) {
    const nextIdx = (i + 1) % poly.length;
    edges.push([poly[i][0], poly[i][1], poly[nextIdx][0], poly[nextIdx][1]]);
  }
  return edges;
}

export function computeSpans(
  y: number,
  edges: [number, number, number, number][]
): [number, number][] {
  const xs: number[] = [];
  for (const [x1, y1, x2, y2] of edges) {
    if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) {
      xs.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
    }
  }
  xs.sort((a, b) => a - b);
  const spans: [number, number][] = [];
  for (let i = 0; i < xs.length; i += 2) {
    if (i + 1 < xs.length) {
      spans.push([xs[i], xs[i + 1]]);
    }
  }
  return spans;
}

export function intersectSpans(
  A: [number, number][],
  B: [number, number][]
): [number, number][] {
  const out: [number, number][] = [];
  for (const a of A) {
    for (const b of B) {
      const lo = Math.max(a[0], b[0]);
      const hi = Math.min(a[1], b[1]);
      if (hi - lo > 14) {
        out.push([lo, hi]);
      }
    }
  }
  return out;
}

export function mathDist(x: number, y: number, cy: number, sc = SC): number {
  return Math.hypot(x / (16 * sc), (y - cy) / (14.5 * sc));
}

/** Text measure helper using an offscreen canvas */
let offscreenCtx: CanvasRenderingContext2D | null = null;
function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!offscreenCtx) {
    const canvas = document.createElement('canvas');
    offscreenCtx = canvas.getContext('2d');
  }
  return offscreenCtx;
}

export function measureTextWidth(text: string, size: number): number {
  const ctx = getMeasureCtx();
  if (ctx) {
    ctx.font = `bold ${size}px ${FONT_FAMILY}`;
    return ctx.measureText(text).width;
  }
  // Fallback estimation if canvas context is unavailable
  return text.length * (size * 0.65);
}

/**
 * Builds the typographic heart layout matching the generative algorithm
 */
export function buildHeartLayout(
  phrases: LovePhrase[],
  theme: ColorTheme,
  seed = 11,
  sc = SC,
  oy = OY
): PlacedItem[] {
  const rng = createRNG(seed);
  const poly = computePolygon(720, sc, oy);
  const edges = getEdges(poly);

  let yMax = -Infinity;
  let yMin = Infinity;
  for (const p of poly) {
    if (p[1] > yMax) yMax = p[1];
    if (p[1] < yMin) yMin = p[1];
  }
  const cy = (yMax + yMin) / 2;

  // Row height: for max size 12 with linespace + 4
  const rowH = 16 + 4; // ~20px
  const half = rowH / 2;

  // Infinite cyclic phrase generator with random shuffling
  let phrasePool: LovePhrase[] = [];
  function nextPhrase(): LovePhrase {
    if (phrasePool.length === 0) {
      phrasePool = [...phrases];
      // Fisher-Yates shuffle
      for (let i = phrasePool.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [phrasePool[i], phrasePool[j]] = [phrasePool[j], phrasePool[i]];
      }
    }
    return phrasePool.pop()!;
  }

  const placed: PlacedItem[] = [];
  let idCounter = 0;

  let y = yMax - half;
  while (y > yMin + half) {
    const spansTop = computeSpans(y + half, edges);
    const spansBot = computeSpans(y - half, edges);
    const row = intersectSpans(spansTop, spansBot);

    for (const [rawLo, rawHi] of row) {
      let lo = rawLo + 4;
      const hi = rawHi - 4;
      let cur = lo + rng() * 8;
      const line: {
        x: number;
        phrase: LovePhrase;
        size: number;
        w: number;
      }[] = [];

      while (true) {
        let fit: { phrase: LovePhrase; size: number; w: number } | null = null;
        for (let attempt = 0; attempt < 12; attempt++) {
          const testPhrase = nextPhrase();
          const size = SIZES[Math.floor(rng() * SIZES.length)];
          const w = measureTextWidth(testPhrase.text, size);
          if (cur + w <= hi) {
            fit = { phrase: testPhrase, size, w };
            break;
          }
        }
        if (!fit) break;
        line.push({
          x: cur + fit.w / 2,
          phrase: fit.phrase,
          size: fit.size,
          w: fit.w,
        });
        cur += fit.w + GAP;
      }

      if (line.length === 0) continue;

      if (line.length > 1) {
        const rightEdge = line[line.length - 1].x + line[line.length - 1].w / 2;
        const leftSpace = hi - rightEdge;
        for (let i = 0; i < line.length; i++) {
          line[i].x += (leftSpace * i) / (line.length - 1);
        }
      } else {
        line[0].x = (lo + hi) / 2;
      }

      for (let i = 0; i < line.length; i++) {
        const isEdge = i === 0 || i === line.length - 1;
        placed.push({
          id: ++idCounter,
          x: line[i].x,
          y: y,
          text: line[i].phrase.text,
          size: line[i].size,
          w: line[i].w,
          edge: isEdge,
          rad: 0,
          color: [1, 1, 1],
          languageId: line[i].phrase.id,
          f: 0,
          animDuration: 42,
          dx: (rng() * 2 - 1) * 10,
          isSpawned: false,
          isSettled: false,
          isShimmering: false,
          shimmerProgress: 0,
        });
      }
    }

    y -= rowH;
  }

  // Calculate colors based on distance and edge
  for (const p of placed) {
    const rad = Math.min(1.0, mathDist(p.x, p.y, cy, sc));
    let base = mixRgb(theme.wineRgb, theme.crimsonRgb, 0.25 + 0.75 * rad);
    const bloodFactor = rng() * 0.35 + (p.edge ? 0.3 : 0);
    base = mixRgb(base, theme.bloodRgb, bloodFactor);
    p.color = [
      Math.min(1, base[0]),
      Math.min(1, base[1]),
      Math.min(1, base[2]),
    ];
    p.rad = rad;
  }

  // Split edges and inner
  const edgesArr = placed.filter((p) => p.edge);
  const innerArr = placed.filter((p) => !p.edge);

  // Edges sort clockwise/cyclically by angle around heart center
  edgesArr.sort((a, b) => {
    const angleA = (Math.atan2(a.x, a.y - cy) + 2 * Math.PI) % (2 * Math.PI);
    const angleB = (Math.atan2(b.x, b.y - cy) + 2 * Math.PI) % (2 * Math.PI);
    return angleA - angleB;
  });

  // Inner sorts from outside in with slight randomness
  innerArr.sort((a, b) => {
    const scoreA = -a.rad + rng() * 0.08;
    const scoreB = -b.rad + rng() * 0.08;
    return scoreA - scoreB;
  });

  return [...edgesArr, ...innerArr];
}
