import React from 'react';
import { MarketMetrics, TargetIndex } from '../types';
import { BarChart3 } from 'lucide-react';

interface CandlePreviewProps {
  metrics: MarketMetrics;
  targetIndex: TargetIndex;
}

export const CandlePreview: React.FC<CandlePreviewProps> = ({ metrics, targetIndex }) => {
  const { open, high, low, close } = metrics;

  if (open <= 0 || high <= 0 || low <= 0 || close <= 0) {
    return null;
  }

  const isGreen = close >= open;
  const safeHigh = Math.max(high, open, close);
  const safeLow = Math.min(low, open, close);
  const range = safeHigh - safeLow || 1;

  const height = 130;
  const getY = (val: number) => {
    return height - ((val - safeLow) / range) * height;
  };

  const highY = getY(safeHigh);
  const lowY = getY(safeLow);
  const openY = getY(open);
  const closeY = getY(close);

  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.max(Math.abs(closeY - openY), 4);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          Candle Price Action ({targetIndex})
        </span>
        <span
          className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
            isGreen
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-rose-50 text-rose-700 border-rose-300'
          }`}
        >
          {isGreen ? 'BULLISH CANDLE' : 'BEARISH CANDLE'}
        </span>
      </div>

      <div className="flex items-center justify-around gap-6">
        {/* SVG Candle Rendering */}
        <div className="relative w-28 h-36 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200">
          <svg className="w-full h-full p-2" viewBox={`0 0 100 ${height}`}>
            {/* High-Low Wick */}
            <line
              x1="50"
              y1={highY}
              x2="50"
              y2={lowY}
              stroke={isGreen ? '#059669' : '#DC2626'}
              strokeWidth="2.5"
            />
            {/* Candle Body */}
            <rect
              x="28"
              y={bodyTop}
              width="44"
              height={bodyHeight}
              fill={isGreen ? '#059669' : '#DC2626'}
              stroke={isGreen ? '#047857' : '#B91C1C'}
              strokeWidth="1.5"
              rx="2"
            />
          </svg>
        </div>

        {/* Metrics breakdown */}
        <div className="space-y-1.5 text-xs font-mono tabular-nums flex-1">
          <div className="flex justify-between items-center text-slate-500">
            <span>High:</span>
            <span className="text-slate-900 font-bold">₹{safeHigh.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Open:</span>
            <span className="text-slate-800">₹{open.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Close (LTP):</span>
            <span className={isGreen ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
              ₹{close.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Low:</span>
            <span className="text-slate-900 font-bold">₹{safeLow.toFixed(2)}</span>
          </div>
          <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
            <span>Intraday Range:</span>
            <span className="text-slate-900 font-semibold">₹{(safeHigh - safeLow).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
