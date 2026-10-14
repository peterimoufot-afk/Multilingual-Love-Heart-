export interface LovePhrase {
  id: string;
  text: string;
  language: string;
  nativeName?: string;
  flag: string;
  pronunciation?: string;
  meaning?: string;
  region: string;
}

export type RGB = [number, number, number];

export interface ColorTheme {
  id: string;
  name: string;
  description: string;
  bgHex: string;
  bgRgb: RGB;
  wineRgb: RGB;
  crimsonRgb: RGB;
  bloodRgb: RGB;
  flashRgb: RGB;
  accentHex: string;
  glowHex: string;
}

export interface PlacedItem {
  id: number;
  x: number;
  y: number;
  text: string;
  size: number;
  w: number;
  edge: boolean;
  rad: number;
  color: RGB;
  languageId?: string;
  // Animation properties
  f: number;
  animDuration: number;
  dx: number;
  isSpawned: boolean;
  isSettled: boolean;
  // Shimmer state
  isShimmering: boolean;
  shimmerProgress: number; // 0 to 1
  shimmerColor?: RGB;
  // Hover highlight
  isHighlighted?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'heart' | 'sparkle' | 'orb';
  rotation: number;
  vRot: number;
}

export interface Dedication {
  recipient: string;
  sender: string;
  message: string;
  showOnHeart: boolean;
}
