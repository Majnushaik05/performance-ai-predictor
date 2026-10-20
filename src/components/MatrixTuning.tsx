import React from 'react';
import { MarketMetrics, TargetIndex } from '../types';
import { Sliders, ArrowUpRight, ArrowDownRight, Layers, RotateCcw, Zap } from 'lucide-react';
import { INDEX_PRESETS } from '../services/quantModel';

interface MatrixTuningProps {
  metrics: MarketMetrics;
  targetIndex: TargetIndex;
  onChange: (metrics: MarketMetrics) => void;
  onApplyPreset: (presetIndex: number) => void;
  onReset: () => void;
}

export const MatrixTuning: React.FC<MatrixTuningProps> = ({
  metrics,
  targetIndex,
  onChange,
  onApplyPreset,
  onReset,
}) => {
  const handleFieldChange = (field: keyof MarketMetrics, rawValue: string) => {
    const num = parseFloat(rawValue);
    onChange({
      ...metrics,
      [field]: isNaN(num) ? 0 : num,
    });
  };

  const change = metrics.close - metrics.open;
  const changePct = metrics.open > 0 ? (change / metrics.open) * 100 : 0;
  const isPositive = change >= 0;

  const relevantPresets = INDEX_PRESETS.filter((p) => p.index === targetIndex);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              1. Market Data & Price Inputs
            </h3>
            <p className="text-xs text-slate-500">Configure OHLC prices, volume, and prior return</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Reset to 0.0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          Zero Values
        </button>
      </div>

      {/* Preset Quick Scenarios */}
      <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase font-bold text-slate-700 tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            Quick Market Scenarios ({targetIndex}):
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {relevantPresets.length > 0 ? (
            relevantPresets.map((preset) => {
              const originalIdx = INDEX_PRESETS.findIndex((p) => p.name === preset.name);
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onApplyPreset(originalIdx)}
                  className="text-xs px-3 py-1.5 rounded-md bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  {preset.name.replace(`${targetIndex} - `, '')}
                </button>
              );
            })
          ) : (
            <span className="text-xs text-slate-500">No preset available for {targetIndex}</span>
          )}

          {INDEX_PRESETS.filter((p) => p.index !== targetIndex).map((preset) => {
            const originalIdx = INDEX_PRESETS.findIndex((p) => p.name === preset.name);
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => onApplyPreset(originalIdx)}
                className="text-xs px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer"
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
        {/* Open Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Open Price (₹)
          </label>
          <input
            type="number"
            step="any"
            value={metrics.open || ''}
            onChange={(e) => handleFieldChange('open', e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono tabular-nums transition-colors"
          />
        </div>

        {/* High Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            High Price (₹)
          </label>
          <input
            type="number"
            step="any"
            value={metrics.high || ''}
            onChange={(e) => handleFieldChange('high', e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono tabular-nums transition-colors"
          />
        </div>

        {/* Low Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Low Price (₹)
          </label>
          <input
            type="number"
            step="any"
            value={metrics.low || ''}
            onChange={(e) => handleFieldChange('low', e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono tabular-nums transition-colors"
          />
        </div>

        {/* Close Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Close Price (₹)
          </label>
          <input
            type="number"
            step="any"
            value={metrics.close || ''}
            onChange={(e) => handleFieldChange('close', e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono tabular-nums transition-colors"
          />
        </div>

        {/* Volume */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Volume
          </label>
          <input
            type="number"
            step="1"
            value={metrics.volume || ''}
            onChange={(e) => handleFieldChange('volume', e.target.value)}
            placeholder="e.g. 4800000"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono tabular-nums transition-colors"
          />
        </div>

        {/* Previous Session Return */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Previous Session Return (%)
          </label>
          <input
            type="number"
            step="any"
            value={metrics.previousReturn || ''}
            onChange={(e) => handleFieldChange('previousReturn', e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono tabular-nums transition-colors"
          />
        </div>
      </div>

      {/* Intraday Delta summary */}
      <div className="mt-auto pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs font-mono tabular-nums">
        <span className="text-slate-500 font-medium">Calculated Intraday Spread:</span>
        <div
          className={`flex items-center gap-1 font-bold ${
            isPositive ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span>
            {change >= 0 ? '+' : ''}₹{change.toFixed(2)} ({changePct.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
};
