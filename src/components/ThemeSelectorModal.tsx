import React from 'react';
import { X, Check } from 'lucide-react';
import { COLOR_THEMES } from '../data/themes';
import { ColorTheme } from '../types';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  activeTheme: ColorTheme;
  onSelectTheme: (t: ColorTheme) => void;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  activeTheme,
  onSelectTheme,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 rounded-3xl bg-neutral-950 border border-white/15 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Artistic Palettes</h2>
            <p className="text-xs text-white/50 mt-0.5">
              Select the color grade and luminescence for the multilingual heart
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {COLOR_THEMES.map((theme) => {
            const isSelected = activeTheme.id === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme);
                }}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-rose-500 bg-white/10 shadow-lg ring-1 ring-rose-500/50'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {/* Palette color strip */}
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                    style={{ backgroundColor: theme.bgHex }}
                    title="Background"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                    style={{
                      backgroundColor: `rgb(${theme.wineRgb[0] * 255}, ${theme.wineRgb[1] * 255}, ${theme.wineRgb[2] * 255})`,
                    }}
                    title="Wine / Deep"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                    style={{
                      backgroundColor: `rgb(${theme.crimsonRgb[0] * 255}, ${theme.crimsonRgb[1] * 255}, ${theme.crimsonRgb[2] * 255})`,
                    }}
                    title="Crimson"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                    style={{
                      backgroundColor: `rgb(${theme.bloodRgb[0] * 255}, ${theme.bloodRgb[1] * 255}, ${theme.bloodRgb[2] * 255})`,
                    }}
                    title="Ruby / Blood"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                    style={{
                      backgroundColor: `rgb(${theme.flashRgb[0] * 255}, ${theme.flashRgb[1] * 255}, ${theme.flashRgb[2] * 255})`,
                    }}
                    title="Shimmer Flash"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    {theme.name}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-rose-400" />}
                </div>

                <p className="text-[11px] text-white/50 mt-1 leading-snug">
                  {theme.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
