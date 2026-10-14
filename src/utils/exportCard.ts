import { ColorTheme, Dedication, PlacedItem } from '../types';
import { FONT_FAMILY, rgbToHex, rgbToRgbaString } from './heartMath';

export function exportHeartCard(
  items: PlacedItem[],
  theme: ColorTheme,
  dedication: Dedication
) {
  const size = 1800; // High-resolution canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = theme.bgHex;
  ctx.fillRect(0, 0, size, size);

  // Radial vignette
  const centerX = size / 2;
  const centerY = size / 2 - 30;
  const bgGlow = ctx.createRadialGradient(
    centerX,
    centerY,
    60,
    centerX,
    centerY,
    size * 0.65
  );
  bgGlow.addColorStop(0, rgbToRgbaString(theme.wineRgb, 0.22));
  bgGlow.addColorStop(0.7, rgbToRgbaString(theme.bgRgb, 0.08));
  bgGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = bgGlow;
  ctx.fillRect(0, 0, size, size);

  // Ambient stars/sparkles
  for (let i = 0; i < 90; i++) {
    const sx = Math.random() * size;
    const sy = Math.random() * size;
    const sr = 1 + Math.random() * 2.5;
    ctx.fillStyle = Math.random() > 0.4 ? theme.accentHex : '#ffffff';
    ctx.globalAlpha = 0.15 + Math.random() * 0.4;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // Render Heart Items
  const scale = (size / 800) * 0.88; // Scale relative to standard 800px view

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const p of items) {
    ctx.fillStyle = rgbToHex(p.color);
    ctx.font = `bold ${p.size}px ${FONT_FAMILY}`;
    ctx.fillText(p.text, p.x, -p.y);
  }

  ctx.restore();

  // Top or Bottom Dedication Banner
  if (dedication.recipient || dedication.sender || dedication.message) {
    ctx.save();
    ctx.textAlign = 'center';

    if (dedication.recipient) {
      ctx.fillStyle = '#ffffff';
      ctx.font = "italic 600 48px 'Playfair Display', Georgia, serif";
      ctx.fillText(`For ${dedication.recipient}`, centerX, 140);
    }

    if (dedication.message) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = "italic 400 28px 'Playfair Display', Georgia, serif";
      ctx.fillText(`"${dedication.message}"`, centerX, size - 170);
    }

    if (dedication.sender) {
      ctx.fillStyle = theme.accentHex;
      ctx.font = `500 26px ${FONT_FAMILY}`;
      ctx.fillText(`— ${dedication.sender}`, centerX, size - 120);
    }

    ctx.restore();
  }

  // Elegant subtle watermark / footer
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.font = `400 18px ${FONT_FAMILY}`;
  ctx.fillText('Multilingual Love Heart · 20 Languages', centerX, size - 50);
  ctx.restore();

  // Trigger download
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.download = `love-heart-${dedication.recipient ? dedication.recipient.toLowerCase().replace(/\s+/g, '-') : 'artwork'}.png`;
  a.href = dataUrl;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
