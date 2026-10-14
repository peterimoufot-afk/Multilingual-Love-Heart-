import React, { useState } from 'react';
import { X, Search, Volume2, Sparkles, Plus, Check } from 'lucide-react';
import { LovePhrase } from '../types';
import { speakPhrase } from '../utils/audio';

interface LanguagesModalProps {
  isOpen: boolean;
  phrases: LovePhrase[];
  selectedLangId: string | null;
  onSelectLanguage: (id: string | null) => void;
  onAddCustomPhrase: (phrase: LovePhrase) => void;
  onClose: () => void;
}

export const LanguagesModal: React.FC<LanguagesModalProps> = ({
  isOpen,
  phrases,
  selectedLangId,
  onSelectLanguage,
  onAddCustomPhrase,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [customText, setCustomText] = useState('');
  const [customLanguage, setCustomLanguage] = useState('');
  const [customPronounce, setCustomPronounce] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const filtered = phrases.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.text.toLowerCase().includes(q) ||
      p.language.toLowerCase().includes(q) ||
      (p.pronunciation && p.pronunciation.toLowerCase().includes(q)) ||
      (p.meaning && p.meaning.toLowerCase().includes(q))
    );
  });

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    const newPhrase: LovePhrase = {
      id: `custom-${Date.now()}`,
      text: customText.trim(),
      language: customLanguage.trim() || 'Custom Dedication',
      flag: '❤️',
      pronunciation: customPronounce.trim() || undefined,
      meaning: 'Custom heartfelt dedication',
      region: 'Personal',
    };

    onAddCustomPhrase(newPhrase);
    setCustomText('');
    setCustomLanguage('');
    setCustomPronounce('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl p-6 rounded-3xl bg-neutral-950 border border-white/15 shadow-2xl text-white max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Multilingual Lexicon</h2>
            <p className="text-xs text-white/50 mt-0.5">
              The {phrases.length} expressions of devotion woven across the heart's scanlines
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by language, phrase, or pronunciation..."
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom</span>
          </button>
        </div>

        {/* Add custom phrase inline form */}
        {isAdding && (
          <form
            onSubmit={handleAddCustom}
            className="mb-3 p-4 rounded-2xl bg-white/5 border border-rose-500/30 shrink-0 animate-in fade-in duration-150"
          >
            <div className="text-xs font-semibold text-rose-300 mb-2">
              Add a Personalized Phrase or Name
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                required
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Phrase (e.g. 'I love you Sarah')"
                className="px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-500/50"
              />
              <input
                type="text"
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                placeholder="Language / Meaning"
                className="px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-500/50"
              />
              <input
                type="text"
                value={customPronounce}
                onChange={(e) => setCustomPronounce(e.target.value)}
                placeholder="Pronunciation (optional)"
                className="px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-500/50"
              />
            </div>
            <div className="mt-2.5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-xs text-white/50 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
              >
                Insert & Rebuild
              </button>
            </div>
          </form>
        )}

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {selectedLangId && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 mb-2">
              <span>Filter active: Highlighting on heart silhouette</span>
              <button
                onClick={() => onSelectLanguage(null)}
                className="underline hover:text-white cursor-pointer"
              >
                Clear highlight
              </button>
            </div>
          )}

          {filtered.map((item) => {
            const isHighlighted = selectedLangId === item.id;
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                  isHighlighted
                    ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400/40'
                    : 'border-white/5 bg-white/5 hover:border-white/15 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl shrink-0" role="img" aria-label={item.language}>
                    {item.flag}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">
                        {item.text}
                      </span>
                      <span className="text-xs text-rose-300">
                        {item.language}
                      </span>
                    </div>
                    {item.pronunciation && (
                      <div className="text-[11px] font-mono text-white/50 mt-0.5">
                        {item.pronunciation}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => speakPhrase(item.text, item.id)}
                    title="Pronounce"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (isHighlighted) {
                        onSelectLanguage(null);
                      } else {
                        onSelectLanguage(item.id);
                      }
                    }}
                    title={isHighlighted ? 'Remove highlight' : 'Highlight on heart'}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isHighlighted
                        ? 'bg-amber-400 text-black'
                        : 'bg-white/10 hover:bg-white/20 text-white/80'
                    }`}
                  >
                    {isHighlighted ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Glowing</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Highlight</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-white/40">
              No matching languages or phrases found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <span>{phrases.length} languages total</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
