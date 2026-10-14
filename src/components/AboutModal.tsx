import React from 'react';
import { X, Code2, Sparkles, BookOpen } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl p-6 rounded-3xl bg-neutral-950 border border-white/15 shadow-2xl text-white max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Generative Mathematics & Architecture
              </h2>
              <p className="text-xs text-white/50">
                Behind the "Multilingual Love Heart" generative typographic experiment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs text-white/70 leading-relaxed">
          {/* Section 1 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-sm font-semibold text-rose-300 mb-1.5 flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span>1. Parametric Heart Curve</span>
            </div>
            <p>
              The heart boundary is generated using a classic 720-step continuous parametric curve:
            </p>
            <div className="mt-2 p-3 bg-black/60 rounded-xl font-mono text-[11px] text-rose-200 border border-white/5 space-y-1">
              <div>x(a) = 16 · sin³(a)</div>
              <div>y(a) = 13 · cos(a) - 5 · cos(2a) - 2 · cos(3a) - cos(4a)</div>
            </div>
            <p className="mt-2 text-white/50 text-[11px]">
              Where angle <em>a</em> ranges from 0 to 2π, scaled by <em>SC = 21</em> with vertical offset <em>OY = 20</em>.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-sm font-semibold text-rose-300 mb-1.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>2. Scanline Polygon Rasterization</span>
            </div>
            <p>
              Rather than random scattering, phrases are packed using scanline polygon intersection.
              For each horizontal band <em>y</em> from top to bottom:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-white/60 text-[11px]">
              <li>Intersects the top and bottom bounds of each text row with the polygon edges.</li>
              <li>Calculates horizontal spans <em>[lo, hi]</em> guaranteeing text stays strictly within the heart silhouette.</li>
              <li>Measures dynamic font widths (9–12px) in canvas memory and justifies text lines uniformly across the width.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-sm font-semibold text-rose-300 mb-1.5">
              3. Physics-Eased Entrance & Radial Grading
            </div>
            <p>
              Animation begins with the perimeter edges sorted by angle (<em>atan2</em>) tracing the continuous outer contour,
              followed by inner phrases cascading from the exterior inward.
            </p>
            <p className="mt-2">
              Each phrase elevates vertically with cubic easing <code>1 - (1 - u)³</code>, flashes with radiant white/rose luminescence,
              and settles into a color gradient from deep velvet wine in the center to vibrant ruby blood at the rim.
            </p>
          </div>

          {/* Section 4 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-sm font-semibold text-rose-300 mb-1.5">
              4. Organic Shimmering Engine
            </div>
            <p>
              Once fully assembled, an ambient shimmer loop randomly selects resting phrases to pulse
              with celestial flash luminescence and smoothly settle back, keeping the artwork breathing and alive indefinitely.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
