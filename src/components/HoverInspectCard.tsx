import React from 'react';
import { Volume2, Sparkles, X } from 'lucide-react';
import { LovePhrase, PlacedItem } from '../types';
import { speakPhrase } from '../utils/audio';

interface HoverInspectCardProps {
  item: PlacedItem | null;
  phrase: LovePhrase | null;
  onClose: () => void;
}

export const HoverInspectCard: React.FC<HoverInspectCardProps> = ({
  item,
  phrase,
  onClose,
}) => {
  if (!item || !phrase) return null;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakPhrase(phrase.text, phrase.id);
  };

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-sm p-4 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 shadow-2xl text-white transition-all animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label={phrase.language}>
            {phrase.flag}
          </span>
          <div>
            <div className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
              {phrase.language}
            </div>
            <div className="text-lg font-bold tracking-tight text-white mt-0.5">
              "{phrase.text}"
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleSpeak}
            title="Listen to native pronunciation"
            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {phrase.pronunciation && (
        <div className="mt-2.5 pt-2.5 border-t border-white/10 text-xs flex items-center justify-between text-white/70">
          <span className="text-white/40">Phonetic:</span>
          <span className="font-mono text-rose-200/90">{phrase.pronunciation}</span>
        </div>
      )}

      {phrase.meaning && (
        <div className="mt-2 text-xs text-white/60 leading-relaxed">
          {phrase.meaning}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{item.edge ? 'Perimeter Contour' : 'Inner Heart Bloom'}</span>
        </div>
        <span>Click heart for particle burst</span>
      </div>
    </div>
  );
};
