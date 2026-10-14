/**
 * Web Audio API procedural sound engine for ambient heartbeat and celestial chimes
 */

let audioCtx: AudioContext | null = null;
let isAudioMuted = false;
let masterVolume = 0.5;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMuted(muted: boolean) {
  isAudioMuted = muted;
}

export function setMasterVolume(vol: number) {
  masterVolume = Math.max(0, Math.min(1, vol));
}

/**
 * Procedural warm acoustic heartbeat thump ("lub-dub")
 */
export function playHeartbeatSound() {
  if (isAudioMuted || masterVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // First pulse (Lub)
  playSubThump(ctx, now, 52, 0.22, 0.7 * masterVolume);
  // Second pulse (Dub)
  playSubThump(ctx, now + 0.14, 46, 0.18, 0.5 * masterVolume);
}

function playSubThump(
  ctx: AudioContext,
  time: number,
  baseFreq: number,
  duration: number,
  peakGain: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(110, time);
  filter.frequency.exponentialRampToValueAtTime(30, time + duration);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, time);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, time + duration);

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(peakGain, time + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + duration);
}

// Pentatonic frequencies for melodic shimmering
const PENTATONIC_FREQS = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];

/**
 * Procedural celestial chime/sparkle on shimmer or hover
 */
export function playChimeSound(pitchIndex = -1) {
  if (isAudioMuted || masterVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freq =
    pitchIndex >= 0
      ? PENTATONIC_FREQS[pitchIndex % PENTATONIC_FREQS.length]
      : PENTATONIC_FREQS[Math.floor(Math.random() * PENTATONIC_FREQS.length)];

  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);

  // Subtle shimmering detuned harmonic
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 2, now);

  const peak = 0.08 * masterVolume;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.6);

  osc.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc2.start(now);
  osc.stop(now + 0.65);
  osc2.stop(now + 0.65);
}

/**
 * Web Speech API to speak a love phrase in its language
 */
export function speakPhrase(text: string, langCode?: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (langCode) {
    utterance.lang = langCode;
  }
  utterance.rate = 0.85;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}
