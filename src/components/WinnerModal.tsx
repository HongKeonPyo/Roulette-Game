import React from 'react';
import { Trophy, RotateCw, UserMinus, Copy, Check, X } from 'lucide-react';
import { RouletteItem } from '../types/roulette';

interface WinnerModalProps {
  winner: RouletteItem | null;
  probability: number;
  isOpen: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
  onRemoveWinnerAndSpinAgain: (item: RouletteItem) => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  probability,
  isOpen,
  onClose,
  onSpinAgain,
  onRemoveWinnerAndSpinAgain,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !winner) return null;

  const handleCopy = () => {
    const text = `🎉 [룰렛 당첨 결과] ${winner.text} (당첨 확률: ${(probability * 100).toFixed(1)}%)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4 shadow-inner">
          <Trophy className="w-8 h-8" />
        </div>

        {/* Subtitle */}
        <div className="text-xs font-bold tracking-wider text-amber-600 uppercase mb-1">
          LUCKY WINNER
        </div>

        {/* Winner Name */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2 break-keep">
          {winner.text}
        </h2>

        {/* Probability Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700 mb-6">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: winner.color }}
          />
          당첨 확률: <span className="font-mono tabular-nums">{(probability * 100).toFixed(1)}%</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onSpinAgain}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] rounded-xl transition-all shadow-md cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            한 번 더 돌리기
          </button>

          <button
            type="button"
            onClick={() => onRemoveWinnerAndSpinAgain(winner)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <UserMinus className="w-4 h-4 text-slate-500" />
            이 항목 제외하고 다시 돌리기
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">결과가 복사되었습니다!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>결과 클립보드 복사</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
