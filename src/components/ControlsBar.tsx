import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Activity,
  Sparkles,
  Maximize2,
  Minimize2,
  Palette,
  Languages,
} from 'lucide-react';

interface ControlsBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReplay: () => void;
  onInstantComplete: () => void;
  speed: number;
  onChangeSpeed: (s: number) => void;
  enableHeartbeatPulse: boolean;
  onToggleHeartbeat: () => void;
  enableAudio: boolean;
  onToggleAudio: () => void;
  enableParticles: boolean;
  onToggleParticles: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenThemes: () => void;
  onOpenLanguages: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  isPlaying,
  onTogglePlay,
  onReplay,
  onInstantComplete,
  speed,
  onChangeSpeed,
  enableHeartbeatPulse,
  onToggleHeartbeat,
  enableAudio,
  onToggleAudio,
  enableParticles,
  onToggleParticles,
  isFullscreen,
  onToggleFullscreen,
  onOpenThemes,
  onOpenLanguages,
}) => {
  return (
    <div className="relative z-20 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl text-white max-w-4xl mx-auto w-[94%]">
      {/* Play / Replay controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onTogglePlay}
          title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
        </button>

        <button
          onClick={onReplay}
          title="Replay Entrance Sequence"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 transition-colors text-white/80 hover:text-white cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Speed selection */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5 ml-1">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-2 py-0.5 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                speed === s
                  ? 'bg-rose-600/90 text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
          <button
            onClick={onInstantComplete}
            title="Render complete heart instantly"
            className="px-2 py-0.5 text-[11px] font-medium rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            Instant
          </button>
        </div>
      </div>

      {/* Atmospheric effect toggles */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onToggleHeartbeat}
          title="Rhythmic Heartbeat Pulse"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            enableHeartbeatPulse
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'bg-white/5 text-white/50 hover:text-white border border-transparent'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Heartbeat</span>
        </button>

        <button
          onClick={onToggleParticles}
          title="Floating Stardust & Hearts"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            enableParticles
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-white/5 text-white/50 hover:text-white border border-transparent'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Particles</span>
        </button>

        <button
          onClick={onToggleAudio}
          title={enableAudio ? 'Mute Ambient Audio' : 'Enable Heartbeat & Celestial Chimes'}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            enableAudio
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'bg-white/5 text-white/50 hover:text-white border border-transparent'
          }`}
        >
          {enableAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Viewport & Quick Menu */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpenLanguages}
          title="Explore Languages"
          className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <Languages className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenThemes}
          title="Color Palettes"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <Palette className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
