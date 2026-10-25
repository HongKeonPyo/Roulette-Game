import React from 'react';
import { History, BarChart3, Trash2, Trophy, Clock } from 'lucide-react';
import { SpinResult, RouletteItem } from '../types/roulette';

interface HistoryStatsProps {
  history: SpinResult[];
  currentItems: RouletteItem[];
  onClearHistory: () => void;
}

export const HistoryStats: React.FC<HistoryStatsProps> = ({
  history,
  currentItems,
  onClearHistory,
}) => {
  const totalSpins = history.length;

  // Aggregate wins per item
  const winCounts: Record<string, number> = {};
  history.forEach((spin) => {
    winCounts[spin.item.text] = (winCounts[spin.item.text] || 0) + 1;
  });

  const totalCurrentWeight = currentItems
    .filter((i) => !i.disabled)
    .reduce((sum, item) => sum + (Number(item.weight) > 0 ? Number(item.weight) : 0), 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500">총 회전 횟수</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
            {totalSpins} <span className="text-xs font-normal text-slate-500">회</span>
          </div>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">최근 당첨</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate max-w-[130px]">
              {history[0]?.item.text || '-'}
            </div>
          </div>
          {totalSpins > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              title="기록 초기화"
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Probability vs Actual Comparison */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            이론 확률 대비 실제 당첨 통계
          </span>
          <span className="text-slate-400 font-normal">
            {totalSpins > 0 ? `총 ${totalSpins}회 시행` : '미시행'}
          </span>
        </div>

        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {currentItems
            .filter((i) => !i.disabled)
            .map((item) => {
              const theoreticalProb = totalCurrentWeight > 0 ? (item.weight / totalCurrentWeight) * 100 : 0;
              const count = winCounts[item.text] || 0;
              const actualRate = totalSpins > 0 ? (count / totalSpins) * 100 : 0;

              return (
                <div key={item.id} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-900 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.text}</span>
                    </span>
                    <span className="text-slate-600 font-mono tabular-nums shrink-0">
                      {count}회 ({actualRate.toFixed(1)}%)
                    </span>
                  </div>

                  {/* Dual comparison bar: top is theoretical, bottom is actual */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-[10px] text-slate-500 shrink-0">설정확률</span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, theoreticalProb)}%`,
                            backgroundColor: item.color,
                            opacity: 0.85,
                          }}
                        />
                      </div>
                      <span className="w-10 text-[10px] font-mono text-slate-500 text-right shrink-0">
                        {theoreticalProb.toFixed(1)}%
                      </span>
                    </div>

                    {totalSpins > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-[10px] text-amber-700 font-medium shrink-0">실제결과</span>
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, actualRate)}%`,
                            }}
                          />
                        </div>
                        <span className="w-10 text-[10px] font-mono font-bold text-amber-800 text-right shrink-0">
                          {actualRate.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Recent History List */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          최근 당첨 내역
        </div>

        {history.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
            아직 돌린 기록이 없습니다. 룰렛을 돌려보세요!
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
            {history.map((spin, idx) => {
              const timeString = new Date(spin.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={spin.id}
                  className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-md text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-mono text-slate-400 w-5 shrink-0">
                      #{totalSpins - idx}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: spin.item.color }}
                    />
                    <span className="font-semibold text-slate-900 truncate">
                      {spin.item.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                      당첨확률 {(spin.probability * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {timeString}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
