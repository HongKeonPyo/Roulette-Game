import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Sliders,
  Bookmark,
  History as HistoryIcon,
  Play,
  RotateCcw,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { RouletteItem, VisualMode, SpinResult, RoulettePreset } from './types/roulette';
import { INITIAL_PRESETS } from './utils/presets';
import { soundManager } from './utils/audio';
import { RouletteWheel } from './components/RouletteWheel';
import { ProbabilityEditor } from './components/ProbabilityEditor';
import { PresetSelector } from './components/PresetSelector';
import { HistoryStats } from './components/HistoryStats';
import { WinnerModal } from './components/WinnerModal';

type ActiveTab = 'items' | 'presets' | 'history';

export default function App() {
  // Items state (load from localStorage or default to prize weighted preset)
  const [items, setItems] = useState<RouletteItem[]>(() => {
    try {
      const saved = localStorage.getItem('current_roulette_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_PRESETS[0].items.map((item, idx) => ({
      ...item,
      id: `item-${idx + 1}`,
    }));
  });

  const [visualMode, setVisualMode] = useState<VisualMode>(() => {
    try {
      const saved = localStorage.getItem('current_visual_mode');
      if (saved === 'equal' || saved === 'proportional') return saved;
    } catch {
      // ignore
    }
    return 'proportional';
  });

  // Spin duration in seconds
  const [spinDuration, setSpinDuration] = useState<number>(4.5);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('items');

  // Winner Modal State
  const [winnerModalState, setWinnerModalState] = useState<{
    isOpen: boolean;
    item: RouletteItem | null;
    probability: number;
  }>({
    isOpen: false,
    item: null,
    probability: 0,
  });

  // History State
  const [history, setHistory] = useState<SpinResult[]>(() => {
    try {
      const saved = localStorage.getItem('roulette_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const appContainerRef = useRef<HTMLDivElement | null>(null);

  // Persist items
  useEffect(() => {
    try {
      localStorage.setItem('current_roulette_items', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  // Persist visual mode
  useEffect(() => {
    try {
      localStorage.setItem('current_visual_mode', visualMode);
    } catch {
      // ignore
    }
  }, [visualMode]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('roulette_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      appContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Spin Callback Handlers
  const handleSpinStart = () => {
    setIsSpinning(true);
    setWinnerModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSpinEnd = (winner: RouletteItem, probability: number) => {
    setIsSpinning(false);
    const newRecord: SpinResult = {
      id: `spin-${Date.now()}`,
      timestamp: Date.now(),
      item: winner,
      probability,
      spinDuration,
    };
    setHistory((prev) => [newRecord, ...prev]);
    setWinnerModalState({
      isOpen: true,
      item: winner,
      probability,
    });
  };

  // Select Preset
  const handleSelectPreset = (preset: RoulettePreset) => {
    const loadedItems: RouletteItem[] = preset.items.map((i, idx) => ({
      ...i,
      id: `item-${Date.now()}-${idx}`,
    }));
    setItems(loadedItems);
    setVisualMode(preset.visualMode);
    setActiveTab('items'); // Switch back to items tab so user sees the new configuration
  };

  // Remove winner and spin again
  const handleRemoveWinnerAndSpinAgain = (itemToRemove: RouletteItem) => {
    setWinnerModalState((prev) => ({ ...prev, isOpen: false }));
    if (items.length <= 2) {
      // If only 2 items, don't remove below minimum
      return;
    }
    const filtered = items.filter((i) => i.id !== itemToRemove.id);
    setItems(filtered);
  };

  // Clear History
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('roulette_history');
    } catch {
      // ignore
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm('현재 설정을 기본 룰렛으로 초기화하시겠습니까?')) {
      handleSelectPreset(INITIAL_PRESETS[0]);
    }
  };

  return (
    <div
      ref={appContainerRef}
      className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-200 selection:text-slate-900"
    >
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 shadow-xs">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            행운의 룰렛 게임기
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <span className="text-slate-900 font-semibold cursor-default">룰렛 회전판</span>
          <span className="hover:text-slate-900 transition-colors cursor-pointer" onClick={() => setActiveTab('items')}>
            확률 커스텀
          </span>
          <span className="hover:text-slate-900 transition-colors cursor-pointer" onClick={() => setActiveTab('presets')}>
            테마 프리셋
          </span>
          <span className="hover:text-slate-900 transition-colors cursor-pointer" onClick={() => setActiveTab('history')}>
            당첨 통계
          </span>
        </nav>

        {/* Zone 3: 1 Primary Action & Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={isMuted ? '음소거 해제' : '음소거'}
            title={isMuted ? '음소거 해제' : '음소거'}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            aria-label={isFullscreen ? '전체화면 종료' : '전체화면'}
            title={isFullscreen ? '전체화면 종료' : '전체화면'}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleResetToDefault}
            title="기본값으로 재설정"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Roulette Wheel Stage (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
            {/* Top Wheel Context Bar */}
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-100 text-xs">
              <span className="font-semibold text-slate-700">
                {visualMode === 'proportional' ? '🎯 확률 비례 부채꼴 모드' : '⚖️ 동일 크기 분할 모드'}
              </span>
              <span className="text-slate-500 font-mono">
                활성 항목 {items.filter((i) => !i.disabled).length}개
              </span>
            </div>

            {/* Canvas Roulette Wheel */}
            <div className="w-full flex justify-center py-2">
              <RouletteWheel
                items={items}
                visualMode={visualMode}
                spinDuration={spinDuration}
                isSpinning={isSpinning}
                onSpinStart={handleSpinStart}
                onSpinEnd={handleSpinEnd}
              />
            </div>

            {/* Quick Controls Under Wheel */}
            <div className="w-full max-w-md mt-6 flex flex-col gap-3">
              {/* Duration Speed Selector */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-700 whitespace-nowrap">
                  회전 속도 / 시간:
                </span>
                <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg">
                  {[
                    { label: '빠르게 (2.5초)', val: 2.5 },
                    { label: '보통 (4.5초)', val: 4.5 },
                    { label: '긴장감 (7초)', val: 7.0 },
                  ].map((speed) => (
                    <button
                      key={speed.val}
                      type="button"
                      disabled={isSpinning}
                      onClick={() => setSpinDuration(speed.val)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        spinDuration === speed.val
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {speed.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyboard Spacebar Hint */}
              <div className="text-center text-xs text-slate-600">
                키보드 <kbd className="px-1.5 py-0.5 bg-slate-200 font-mono font-semibold rounded text-[11px] text-slate-700">스페이스바</kbd> 또는 중앙 버튼을 눌러 돌릴 수 있습니다
              </div>
            </div>
          </div>

          {/* Right Column: Configuration & Controls Panel (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            {/* Functional Tab Bar */}
            <div className="flex items-center border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('items')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'items'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                항목 및 확률 설정
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'presets'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-blue-500" />
                프리셋
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <HistoryIcon className="w-3.5 h-3.5 text-emerald-500" />
                당첨 통계 ({history.length})
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-5 sm:p-6">
              {activeTab === 'items' && (
                <ProbabilityEditor
                  items={items}
                  visualMode={visualMode}
                  onVisualModeChange={setVisualMode}
                  onItemsChange={setItems}
                  disabled={isSpinning}
                />
              )}

              {activeTab === 'presets' && (
                <PresetSelector
                  onSelectPreset={handleSelectPreset}
                  currentItems={items}
                  currentVisualMode={visualMode}
                  disabled={isSpinning}
                />
              )}

              {activeTab === 'history' && (
                <HistoryStats
                  history={history}
                  currentItems={items}
                  onClearHistory={handleClearHistory}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Winner Celebration Modal */}
      <WinnerModal
        winner={winnerModalState.item}
        probability={winnerModalState.probability}
        isOpen={winnerModalState.isOpen}
        onClose={() => setWinnerModalState((prev) => ({ ...prev, isOpen: false }))}
        onSpinAgain={() => {
          setWinnerModalState((prev) => ({ ...prev, isOpen: false }));
        }}
        onRemoveWinnerAndSpinAgain={handleRemoveWinnerAndSpinAgain}
      />
    </div>
  );
}
