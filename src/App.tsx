/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { INITIAL_PHRASES } from './data/phrases';
import { COLOR_THEMES } from './data/themes';
import { buildHeartLayout } from './utils/heartMath';
import { setMuted } from './utils/audio';
import { exportHeartCard } from './utils/exportCard';
import { LovePhrase, ColorTheme, PlacedItem, Dedication } from './types';

import { TopNav } from './components/TopNav';
import { HeartCanvas } from './components/HeartCanvas';
import { ControlsBar } from './components/ControlsBar';
import { HoverInspectCard } from './components/HoverInspectCard';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { LanguagesModal } from './components/LanguagesModal';
import { DedicationModal } from './components/DedicationModal';
import { AboutModal } from './components/AboutModal';

export default function App() {
  const [phrases, setPhrases] = useState<LovePhrase[]>(INITIAL_PHRASES);
  const [theme, setTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
  const [seed, setSeed] = useState<number>(11);

  // Playback & Animation states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [enableHeartbeatPulse, setEnableHeartbeatPulse] = useState<boolean>(true);
  const [enableParticles, setEnableParticles] = useState<boolean>(true);
  const [enableAudio, setEnableAudio] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Hover & selection states
  const [hoveredItem, setHoveredItem] = useState<PlacedItem | null>(null);
  const [hoveredPhrase, setHoveredPhrase] = useState<LovePhrase | null>(null);
  const [selectedLangId, setSelectedLangId] = useState<string | null>(null);

  // Dedication state
  const [dedication, setDedication] = useState<Dedication>({
    recipient: '',
    sender: '',
    message: '',
    showOnHeart: false,
  });

  // Modals state
  const [isThemesOpen, setIsThemesOpen] = useState<boolean>(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState<boolean>(false);
  const [isDedicationOpen, setIsDedicationOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Create fast lookup map for phrases
  const phrasesMap = useMemo(() => {
    const map = new Map<string, LovePhrase>();
    phrases.forEach((p) => map.set(p.id, p));
    return map;
  }, [phrases]);

  // Compute heart layout items
  const items = useMemo(() => {
    return buildHeartLayout(phrases, theme, seed);
  }, [phrases, theme, seed]);

  // Keep audio module muted state in sync
  useEffect(() => {
    setMuted(!enableAudio);
  }, [enableAudio]);

  // Replay animation
  const handleReplay = useCallback(() => {
    setIsPlaying(true);
    // Force re-mount / re-render items by bumping seed or triggering state
    setSeed((prev) => prev);
  }, []);

  // Regenerate with fresh random seed
  const handleRegenerate = useCallback(() => {
    setIsPlaying(true);
    setSeed(Math.floor(Math.random() * 100000));
  }, []);

  // Instant complete: set speed high briefly or mark items settled
  const handleInstantComplete = useCallback(() => {
    setSpeed(100);
    setTimeout(() => setSpeed(1), 250);
  }, []);

  // Toggle Fullscreen
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Sync fullscreen change event
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'r' || e.key === 'R') {
        handleReplay();
      } else if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        setEnableAudio((a) => !a);
      } else if (e.key === 'Escape') {
        setIsThemesOpen(false);
        setIsLanguagesOpen(false);
        setIsDedicationOpen(false);
        setIsAboutOpen(false);
        setHoveredItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReplay, handleToggleFullscreen]);

  // Add custom phrase
  const handleAddCustomPhrase = useCallback((newPhrase: LovePhrase) => {
    setPhrases((prev) => [newPhrase, ...prev]);
    setSeed((prev) => prev + 1);
  }, []);

  // Export high resolution PNG card
  const handleExportCard = useCallback(() => {
    exportHeartCard(items, theme, dedication);
  }, [items, theme, dedication]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col font-sans transition-colors duration-700 select-none"
      style={{ backgroundColor: theme.bgHex }}
    >
      {/* Top Bar Navigation */}
      <TopNav
        onOpenLanguages={() => setIsLanguagesOpen(true)}
        onOpenDedication={() => setIsDedicationOpen(true)}
        onOpenThemes={() => setIsThemesOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onExportPng={handleExportCard}
      />

      {/* Main Canvas Stage */}
      <main className="relative flex-1 w-full h-full min-h-0 flex items-center justify-center">
        <HeartCanvas
          key={`${theme.id}-${seed}`}
          items={items}
          theme={theme}
          phrasesMap={phrasesMap}
          isPlaying={isPlaying}
          speed={speed}
          enableHeartbeatPulse={enableHeartbeatPulse}
          enableParticles={enableParticles}
          enableAudio={enableAudio}
          dedication={dedication}
          selectedLangId={selectedLangId}
          onItemHover={(item, phrase) => {
            setHoveredItem(item);
            setHoveredPhrase(phrase);
          }}
          onAnimationComplete={() => {
            // Heart continues shimmering naturally
          }}
        />

        {/* Floating Hover Inspection Details */}
        <HoverInspectCard
          item={hoveredItem}
          phrase={hoveredPhrase}
          onClose={() => setHoveredItem(null)}
        />
      </main>

      {/* Bottom Floating Control Dock */}
      <div className="relative z-20 pb-5 pt-2">
        <ControlsBar
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onReplay={handleReplay}
          onInstantComplete={handleInstantComplete}
          speed={speed}
          onChangeSpeed={setSpeed}
          enableHeartbeatPulse={enableHeartbeatPulse}
          onToggleHeartbeat={() => setEnableHeartbeatPulse((p) => !p)}
          enableAudio={enableAudio}
          onToggleAudio={() => setEnableAudio((a) => !a)}
          enableParticles={enableParticles}
          onToggleParticles={() => setEnableParticles((p) => !p)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenThemes={() => setIsThemesOpen(true)}
          onOpenLanguages={() => setIsLanguagesOpen(true)}
        />
      </div>

      {/* Modals */}
      <ThemeSelectorModal
        isOpen={isThemesOpen}
        activeTheme={theme}
        onSelectTheme={(t) => {
          setTheme(t);
          setIsThemesOpen(false);
        }}
        onClose={() => setIsThemesOpen(false)}
      />

      <LanguagesModal
        isOpen={isLanguagesOpen}
        phrases={phrases}
        selectedLangId={selectedLangId}
        onSelectLanguage={setSelectedLangId}
        onAddCustomPhrase={handleAddCustomPhrase}
        onClose={() => setIsLanguagesOpen(false)}
      />

      <DedicationModal
        isOpen={isDedicationOpen}
        dedication={dedication}
        onChangeDedication={setDedication}
        onExportCard={handleExportCard}
        onClose={() => setIsDedicationOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
