import React from 'react';
import { Heart, Download } from 'lucide-react';

interface TopNavProps {
  onOpenLanguages: () => void;
  onOpenDedication: () => void;
  onOpenThemes: () => void;
  onOpenAbout: () => void;
  onExportPng: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenLanguages,
  onOpenDedication,
  onOpenThemes,
  onOpenAbout,
  onExportPng,
}) => {
  return (
    <header className="relative z-30 flex items-center justify-between gap-8 px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
        <Heart className="w-5 h-5 text-rose-500 fill-rose-500/80 animate-pulse" />
        <span className="text-base font-semibold tracking-tight text-white">
          Multilingual Love Heart
        </span>
      </div>

      {/* Zone 2: 4 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-white/70">
        <button
          onClick={onOpenLanguages}
          className="hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Languages
        </button>
        <button
          onClick={onOpenDedication}
          className="hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Dedication
        </button>
        <button
          onClick={onOpenThemes}
          className="hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Palettes
        </button>
        <button
          onClick={onOpenAbout}
          className="hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Generative Math
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onExportPng}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600/90 hover:bg-rose-500 border border-rose-400/30 rounded-lg transition-all shadow-sm shadow-rose-950 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Card</span>
        </button>
      </div>
    </header>
  );
};
