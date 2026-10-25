import React, { useState } from 'react';
import { Plus, Trash2, Sliders, PieChart, RefreshCw, Equal, CheckCircle2, AlertCircle, Palette } from 'lucide-react';
import { RouletteItem, VisualMode, ProbabilityMode } from '../types/roulette';
import { DEFAULT_PALETTE, getColorForIndex, getContrastingTextColor } from '../utils/colors';

interface ProbabilityEditorProps {
  items: RouletteItem[];
  visualMode: VisualMode;
  onVisualModeChange: (mode: VisualMode) => void;
  onItemsChange: (items: RouletteItem[]) => void;
  disabled?: boolean;
}

export const ProbabilityEditor: React.FC<ProbabilityEditorProps> = ({
  items,
  visualMode,
  onVisualModeChange,
  onItemsChange,
  disabled = false,
}) => {
  const [probMode, setProbMode] = useState<ProbabilityMode>('percentage');

  const totalWeight = items
    .filter((i) => !i.disabled)
    .reduce((sum, item) => sum + (Number(item.weight) > 0 ? Number(item.weight) : 0), 0);

  // Add a new item
  const handleAddItem = () => {
    const newIndex = items.length;
    const color = getColorForIndex(newIndex, DEFAULT_PALETTE);
    const textColor = getContrastingTextColor(color);

    // Initial default weight: equal share or 10
    const defaultWeight = probMode === 'percentage'
      ? Math.max(5, Math.floor(100 / (items.length + 1)))
      : 1;

    const newItem: RouletteItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: `항목 ${items.length + 1}`,
      weight: defaultWeight,
      color,
      textColor,
    };

    onItemsChange([...items, newItem]);
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 2) {
      return; // Keep at least 2 items
    }
    onItemsChange(items.filter((item) => item.id !== id));
  };

  // Update item field
  const handleUpdateItem = (id: string, updates: Partial<RouletteItem>) => {
    onItemsChange(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          if (updates.color) {
            updated.textColor = getContrastingTextColor(updates.color);
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Auto Balance / Normalize to 100%
  const handleNormalizeTo100 = () => {
    const active = items.filter((i) => !i.disabled);
    if (active.length === 0) return;

    const sum = active.reduce((acc, curr) => acc + (Number(curr.weight) || 0.1), 0);
    if (sum === 0) return;

    let runningTotal = 0;
    const updated = items.map((item, idx) => {
      if (item.disabled) return item;
      if (idx === items.length - 1) {
        // Last active item absorbs rounding difference to guarantee exact 100.0%
        const finalWeight = Math.max(0.1, Number((100 - runningTotal).toFixed(1)));
        return { ...item, weight: finalWeight };
      }
      const proportional = Number(((item.weight / sum) * 100).toFixed(1));
      runningTotal += proportional;
      return { ...item, weight: proportional };
    });

    onItemsChange(updated);
  };

  // Equalize All Items
  const handleEqualizeAll = () => {
    const activeCount = items.filter((i) => !i.disabled).length;
    if (activeCount === 0) return;

    const equalWeight = probMode === 'percentage'
      ? Number((100 / activeCount).toFixed(1))
      : 1;

    onItemsChange(
      items.map((item) => (item.disabled ? item : { ...item, weight: equalWeight }))
    );
  };

  // Shuffle / Refresh Colors
  const handleShuffleColors = () => {
    onItemsChange(
      items.map((item, index) => {
        const color = getColorForIndex(index, DEFAULT_PALETTE);
        return {
          ...item,
          color,
          textColor: getContrastingTextColor(color),
        };
      })
    );
  };

  const isExact100 = Math.abs(totalWeight - 100) < 0.2;

  return (
    <div className="flex flex-col gap-5">
      {/* Visual Mode & Probability Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            부채꼴 표시:
          </span>
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 rounded-lg">
            <button
              type="button"
              onClick={() => onVisualModeChange('proportional')}
              disabled={disabled}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                visualMode === 'proportional'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              확률 비례 크기
            </button>
            <button
              type="button"
              onClick={() => onVisualModeChange('equal')}
              disabled={disabled}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                visualMode === 'equal'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Equal className="w-3.5 h-3.5" />
              동일 크기 분할
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            입력 단위:
          </span>
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 rounded-lg">
            <button
              type="button"
              onClick={() => setProbMode('percentage')}
              disabled={disabled}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                probMode === 'percentage'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              백분율 (%)
            </button>
            <button
              type="button"
              onClick={() => setProbMode('weight')}
              disabled={disabled}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                probMode === 'weight'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              가중치 (비율)
            </button>
          </div>
        </div>
      </div>

      {/* Summary Status Strip & Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs">
          {probMode === 'percentage' ? (
            isExact100 ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                확률 합계: <span className="tabular-nums font-mono">100.0%</span> (정상)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-medium text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                확률 합계: <span className="tabular-nums font-mono font-bold">{totalWeight.toFixed(1)}%</span>
                <span className="text-slate-500">(상대 확률로 자동 계산됨)</span>
              </span>
            )
          ) : (
            <span className="font-medium text-slate-600">
              총 가중치 합계: <span className="tabular-nums font-mono font-semibold text-slate-900">{totalWeight}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {probMode === 'percentage' && !isExact100 && (
            <button
              type="button"
              onClick={handleNormalizeTo100}
              disabled={disabled}
              className="px-2.5 py-1 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors cursor-pointer"
            >
              100% 자동 맞춤
            </button>
          )}

          <button
            type="button"
            onClick={handleEqualizeAll}
            disabled={disabled}
            title="모든 항목에 동일한 확률 부여"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          >
            <Equal className="w-3.5 h-3.5" />
            균등 분할
          </button>

          <button
            type="button"
            onClick={handleShuffleColors}
            disabled={disabled}
            title="색상 재배치"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            색상 정렬
          </button>
        </div>
      </div>

      {/* Item List */}
      <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
        {items.map((item, index) => {
          const itemWeight = Number(item.weight) || 0;
          const calculatedPercent = totalWeight > 0 ? (itemWeight / totalWeight) * 100 : 0;

          return (
            <div
              key={item.id}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                item.disabled
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Color swatch picker */}
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={item.color}
                  disabled={disabled}
                  onChange={(e) => handleUpdateItem(item.id, { color: e.target.value })}
                  aria-label={`색상 선택: ${item.text}`}
                  className="w-7 h-7 rounded-md cursor-pointer border-0 p-0 overflow-hidden bg-transparent"
                />
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={item.text}
                disabled={disabled}
                onChange={(e) => handleUpdateItem(item.id, { text: e.target.value })}
                placeholder="항목 이름"
                className="flex-1 min-w-0 px-2.5 py-1.5 text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />

              {/* Weight / Percentage Input */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="relative">
                  <input
                    type="number"
                    min="0.1"
                    step={probMode === 'percentage' ? '0.5' : '1'}
                    max={probMode === 'percentage' ? '100' : '9999'}
                    value={item.weight}
                    disabled={disabled}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      handleUpdateItem(item.id, { weight: isNaN(val) ? 0.1 : Math.max(0.1, val) });
                    }}
                    className="w-18 px-2 py-1.5 text-xs text-right font-mono font-semibold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-amber-400 tabular-nums"
                  />
                  <span className="absolute right-2 top-1.5 text-xs font-mono text-slate-400 pointer-events-none">
                    {probMode === 'percentage' ? '%' : ''}
                  </span>
                </div>

                {/* Actual Real-Time Probability Tag */}
                <div className="w-16 text-right shrink-0">
                  <span className="text-xs font-mono font-semibold text-slate-600 tabular-nums">
                    {calculatedPercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                disabled={disabled || items.length <= 2}
                title={items.length <= 2 ? '최소 2개 항목이 필요합니다' : '항목 삭제'}
                className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-slate-400 rounded-md hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Item Button */}
      <button
        type="button"
        onClick={handleAddItem}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-lg transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        새 항목 추가하기
      </button>
    </div>
  );
};
