import React from 'react';
import { X, Heart, Download, Sparkles } from 'lucide-react';
import { Dedication } from '../types';

interface DedicationModalProps {
  isOpen: boolean;
  dedication: Dedication;
  onChangeDedication: (d: Dedication) => void;
  onExportCard: () => void;
  onClose: () => void;
}

export const DedicationModal: React.FC<DedicationModalProps> = ({
  isOpen,
  dedication,
  onChangeDedication,
  onExportCard,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 rounded-3xl bg-neutral-950 border border-white/15 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/50" />
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Dedication & Love Card</h2>
              <p className="text-xs text-white/50">Personalize this generative artwork for someone you treasure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              To (Recipient Name)
            </label>
            <input
              type="text"
              value={dedication.recipient}
              onChange={(e) =>
                onChangeDedication({ ...dedication, recipient: e.target.value })
              }
              placeholder="e.g. Elena, Mon Amour, My Beloved"
              className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              From (Sender Name)
            </label>
            <input
              type="text"
              value={dedication.sender}
              onChange={(e) =>
                onChangeDedication({ ...dedication, sender: e.target.value })
              }
              placeholder="e.g. Always yours, Mateo"
              className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Personal Love Note / Keepsake Note
            </label>
            <textarea
              rows={2}
              value={dedication.message}
              onChange={(e) =>
                onChangeDedication({ ...dedication, message: e.target.value })
              }
              placeholder="In every language across the earth, my heart speaks only of you..."
              className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-500/50 resize-none"
            />
          </div>

          {/* Toggle show on heart */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-xs font-medium text-white">Inscribe inside Heart</div>
                <div className="text-[11px] text-white/50">
                  Renders the inscription subtly inside the core of the silhouette
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              id="showOnHeart"
              checked={dedication.showOnHeart}
              onChange={(e) =>
                onChangeDedication({
                  ...dedication,
                  showOnHeart: e.target.checked,
                })
              }
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-white/10 border-white/20 cursor-pointer accent-rose-600"
            />
          </div>

          {/* Card Preview */}
          {(dedication.recipient || dedication.message) && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-black to-neutral-950 border border-rose-500/30 text-center">
              <div className="text-[10px] uppercase tracking-widest text-rose-400/80 font-mono">
                Keepsake Preview
              </div>
              {dedication.recipient && (
                <div className="font-serif italic text-base text-rose-100 mt-1">
                  For {dedication.recipient}
                </div>
              )}
              {dedication.message && (
                <p className="text-xs text-white/80 mt-1.5 italic max-w-sm mx-auto leading-relaxed">
                  "{dedication.message}"
                </p>
              )}
              {dedication.sender && (
                <div className="text-[11px] text-rose-300 mt-2">
                  — {dedication.sender}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Save Dedication
          </button>

          <button
            onClick={() => {
              onExportCard();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-950 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download HD Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
