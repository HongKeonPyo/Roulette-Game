import React, { useState, useEffect } from 'react';
import { Bookmark, Sparkles, Plus, Trash2 } from 'lucide-react';
import { RoulettePreset, RouletteItem, VisualMode } from '../types/roulette';
import { INITIAL_PRESETS } from '../utils/presets';

interface PresetSelectorProps {
  onSelectPreset: (preset: RoulettePreset) => void;
  currentItems: RouletteItem[];
  currentVisualMode: VisualMode;
  disabled?: boolean;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  onSelectPreset,
  currentItems,
  currentVisualMode,
  disabled = false,
}) => {
  const [customPresets, setCustomPresets] = useState<RoulettePreset[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load custom presets from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('custom_roulette_presets');
      if (saved) {
        setCustomPresets(JSON.parse(saved));
      }
    } catch {
      // Ignore JSON parse errors
    }
  }, []);

  // Save new preset
  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newPreset: RoulettePreset = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      category: '내 커스텀 프리셋',
      description: `${currentItems.length}개 항목으로 구성된 사용자 정의 룰렛`,
      visualMode: currentVisualMode,
      items: currentItems.map(({ text, weight, color, textColor, disabled }) => ({
        text,
        weight,
        color,
        textColor,
        disabled,
      })),
    };

    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    try {
      localStorage.setItem('custom_roulette_presets', JSON.stringify(updated));
    } catch {
      // storage quota
    }
    setNewTitle('');
    setIsSaving(false);
  };

  // Delete custom preset
  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem('custom_roulette_presets', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Save current state banner */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
        {!isSaving ? (
          <button
            type="button"
            onClick={() => setIsSaving(true)}
            disabled={disabled}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-800 hover:text-slate-950 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              현재 설정된 룰렛을 나만의 프리셋으로 저장하기
            </span>
            <span className="text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md text-[11px]">
              + 저장
            </span>
          </button>
        ) : (
          <form onSubmit={handleSaveCurrent} className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="프리셋 이름 (예: 우리 팀 회식 룰렛)"
              className="flex-1 px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-md transition-colors cursor-pointer"
            >
              저장
            </button>
            <button
              type="button"
              onClick={() => setIsSaving(false)}
              className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 rounded-md cursor-pointer"
            >
              취소
            </button>
          </form>
        )}
      </div>

      {/* Custom Presets Section (if any) */}
      {customPresets.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-500">내가 저장한 프리셋</div>
          <div className="grid grid-cols-1 gap-2">
            {customPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => !disabled && onSelectPreset(preset)}
                className="group flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg cursor-pointer transition-all shadow-xs"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                    {preset.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {preset.items.length}개 항목 · {preset.visualMode === 'proportional' ? '확률 비례' : '동일 분할'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteCustom(preset.id, e)}
                  title="프리셋 삭제"
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Built-in Presets */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-slate-500">추천 기본 프리셋</div>
        <div className="grid grid-cols-1 gap-2.5">
          {INITIAL_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => !disabled && onSelectPreset(preset)}
              className="group p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg cursor-pointer transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  {preset.category}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {preset.items.length}개 항목
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-900 group-hover:text-amber-700 transition-colors mt-0.5">
                {preset.title}
              </div>
              <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                {preset.description}
              </div>

              {/* Mini Item tags preview */}
              <div className="flex items-center gap-1.5 mt-2 overflow-hidden text-[11px] text-slate-500">
                {preset.items.slice(0, 3).map((item, idx) => (
                  <span key={idx} className="flex items-center gap-1 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.text}</span>
                  </span>
                ))}
                {preset.items.length > 3 && (
                  <span className="shrink-0 text-slate-400">+{preset.items.length - 3}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
