import React, { useState } from 'react';
import { PredictionResult, TerminalDashboard } from '../types';
import { ASSETS } from '../assets';
import { TOP_MARKET_CALLS } from '../data/marketData';
import {
  TrendingUp,
  TrendingDown,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  Zap,
  Activity,
  Shield,
  Layers,
  Target,
  ArrowRight,
} from 'lucide-react';

interface InferenceOutputProps {
  prediction: PredictionResult | null;
  onExecute: () => void;
  isExecuting: boolean;
  statusText: string;
  onNavigateDashboard?: (tab: TerminalDashboard) => void;
}

export const InferenceOutput: React.FC<InferenceOutputProps> = ({
  prediction,
  onExecute,
  isExecuting,
  statusText,
  onNavigateDashboard,
}) => {
  const [copied, setCopied] = useState(false);

  const isBullish = prediction?.vectorDirection === 'BULLISH';
  const confidence = prediction?.confidence ?? 0;
  const bullishPct = prediction ? Math.round(prediction.bullishProb * 100) : 50;
  const bearishPct = prediction ? Math.round(prediction.bearishProb * 100) : 50;

  const trendShift = prediction?.trendShift;
  const prevReturn = trendShift?.previousReturn ?? 0;
  const currentReturn = trendShift?.currentReturn ?? 0;
  const velocityDelta = trendShift?.velocityDelta ?? 0;

  const handleCopy = () => {
    if (statusText) {
      navigator.clipboard.writeText(statusText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTrendVisual = () => {
    if (!trendShift) return null;

    switch (trendShift.status) {
      case 'BULLISH_REVERSAL':
        return {
          badgeBg: 'bg-emerald-100 border-emerald-300 text-emerald-800',
          cardBg: 'bg-emerald-50/60 border-emerald-300',
          icon: <ArrowUpRight className="w-5 h-5 text-emerald-600 animate-bounce" />,
          tag: 'BULLISH REVERSAL SIGNAL',
        };
      case 'BULLISH_CONTINUATION':
        return {
          badgeBg: 'bg-emerald-100 border-emerald-300 text-emerald-800',
          cardBg: 'bg-emerald-50/60 border-emerald-300',
          icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
          tag: 'UPWARD CONTINUATION',
        };
      case 'BEARISH_EXHAUSTION':
        return {
          badgeBg: 'bg-rose-100 border-rose-300 text-rose-800',
          cardBg: 'bg-rose-50/60 border-rose-300',
          icon: <ArrowDownRight className="w-5 h-5 text-rose-600 animate-bounce" />,
          tag: 'BEARISH REVERSAL EXHAUSTION',
        };
      case 'BEARISH_CONTINUATION':
        return {
          badgeBg: 'bg-rose-100 border-rose-300 text-rose-800',
          cardBg: 'bg-rose-50/60 border-rose-300',
          icon: <TrendingDown className="w-5 h-5 text-rose-600" />,
          tag: 'DOWNSIDE CONTINUATION',
        };
      default:
        return {
          badgeBg: 'bg-slate-100 border-slate-300 text-slate-800',
          cardBg: 'bg-slate-50 border-slate-200',
          icon: <Activity className="w-5 h-5 text-slate-700" />,
          tag: 'CONSOLIDATION BREAKOUT',
        };
    }
  };

  const trendVisual = getTrendVisual();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              2. AI Stock Forecast & Trend Verdict
            </h3>
            <p className="text-xs text-slate-500">
              Machine learning directional probability & trend shift
            </p>
          </div>
        </div>

        {prediction && (
          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Computed: {prediction.timestamp}
          </span>
        )}
      </div>

      {prediction ? (
        <div className="space-y-4 mb-4">
          {/* Main Verdict Card with Dynamic Bull / Bear Shadow Backdrop */}
          <div
            className={`relative overflow-hidden p-5 rounded-xl border transition-all ${
              isBullish
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-rose-50/70 border-rose-300'
            }`}
          >
            {/* Bull or Bear Shadow Backdrop */}
            <div
              className="absolute right-0 bottom-0 w-44 h-44 opacity-[0.09] pointer-events-none select-none bg-contain bg-no-repeat bg-bottom-right"
              style={{
                backgroundImage: `url(${isBullish ? ASSETS.bullWatermark : ASSETS.bearWatermark})`,
              }}
            />

            <div className="relative z-10 flex items-center justify-between flex-wrap gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    isBullish ? 'bg-emerald-600 text-white shadow-xs' : 'bg-rose-600 text-white shadow-xs'
                  }`}
                >
                  {isBullish ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    PREDICTED DIRECTION
                  </span>
                  <div
                    className={`text-2xl sm:text-3xl font-black tracking-tight ${
                      isBullish ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {isBullish ? '▲ BULLISH (BUY SIGNAL)' : '▼ BEARISH (SELL/EXIT)'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-1 justify-end">
                  <Gauge className="w-3.5 h-3.5 text-slate-500" />
                  Confidence Score
                </span>
                <div className="text-2xl sm:text-3xl font-numbers font-extrabold text-slate-900">
                  {confidence.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Probability Progress Bar */}
            <div className="space-y-1.5 pt-3 border-t border-slate-200/80">
              <div className="flex justify-between text-xs font-numbers font-bold">
                <span className="text-emerald-700">Bullish Win Rate: {bullishPct}%</span>
                <span className="text-rose-700">Bearish Win Rate: {bearishPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${bullishPct}%` }}
                />
                <div
                  className="h-full bg-rose-600 transition-all duration-500"
                  style={{ width: `${bearishPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* VISUAL TREND INDICATOR COMPARING PREVIOUS RETURN */}
          {trendShift && trendVisual && (
            <div className={`p-4 rounded-xl border ${trendVisual.cardBg} transition-all`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {trendVisual.icon}
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                      Prior Session Return vs Current AI Prediction
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                      {trendShift.headline}
                    </h4>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${trendVisual.badgeBg}`}
                >
                  {trendVisual.tag}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                {trendShift.description}
              </p>

              {/* Comparative Numbers */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs font-numbers">
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 block mb-0.5 font-sans">Prior Return</span>
                  <span
                    className={`font-bold text-sm ${
                      prevReturn >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {prevReturn >= 0 ? '+' : ''}{prevReturn.toFixed(2)}%
                  </span>
                </div>

                <div className="text-center border-x border-slate-200">
                  <span className="text-[10px] text-slate-500 block mb-0.5 font-sans">Current Intraday</span>
                  <span
                    className={`font-bold text-sm ${
                      currentReturn >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {currentReturn >= 0 ? '+' : ''}{currentReturn.toFixed(2)}%
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-500 block mb-0.5 font-sans">Momentum Spread</span>
                  <span
                    className={`font-bold text-sm ${
                      velocityDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {velocityDelta >= 0 ? '+' : ''}{velocityDelta.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Key Support and Resistance Matrix */}
          {prediction.technicalAnalysis && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono tabular-nums">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  Key Price Support & Resistance Levels
                </span>
                <span className="text-[10px] text-slate-500 font-sans">Floor Trader Matrix</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                <div className="p-1.5 rounded-md bg-white border border-slate-200 text-rose-700">
                  <span className="block text-[9px] text-slate-400">S2</span>
                  ₹{prediction.technicalAnalysis.support2.toFixed(1)}
                </div>
                <div className="p-1.5 rounded-md bg-white border border-slate-200 text-rose-700">
                  <span className="block text-[9px] text-slate-400">S1</span>
                  ₹{prediction.technicalAnalysis.support1.toFixed(1)}
                </div>
                <div className="p-1.5 rounded-md bg-slate-900 text-white font-bold border border-slate-900">
                  <span className="block text-[9px] text-slate-300">PIVOT</span>
                  ₹{prediction.technicalAnalysis.pivotPoint.toFixed(1)}
                </div>
                <div className="p-1.5 rounded-md bg-white border border-slate-200 text-emerald-700">
                  <span className="block text-[9px] text-slate-400">R1</span>
                  ₹{prediction.technicalAnalysis.resistance1.toFixed(1)}
                </div>
                <div className="p-1.5 rounded-md bg-white border border-slate-200 text-emerald-700">
                  <span className="block text-[9px] text-slate-400">R2</span>
                  ₹{prediction.technicalAnalysis.resistance2.toFixed(1)}
                </div>
              </div>
            </div>
          )}
          {/* High-Impact Top Suggested Calls based on Prediction Vector with Bull / Bear Watermarks */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                Top AI {isBullish ? 'Bullish' : 'Bearish'} Calls for this Market
              </span>
              {onNavigateDashboard && (
                <button
                  type="button"
                  onClick={() => onNavigateDashboard('fno_calls')}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  Take Calls & Option Radar
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TOP_MARKET_CALLS
                .filter((c) => c.direction === (isBullish ? 'BULLISH' : 'BEARISH'))
                .slice(0, 2)
                .map((call) => (
                  <div
                    key={call.id}
                    className={`relative overflow-hidden p-2.5 rounded-lg border bg-white ${
                      isBullish ? 'border-emerald-200' : 'border-rose-200'
                    }`}
                  >
                    <div
                      className="absolute right-0 bottom-0 w-24 h-24 opacity-[0.08] pointer-events-none select-none bg-contain bg-no-repeat bg-bottom-right"
                      style={{
                        backgroundImage: `url(${isBullish ? ASSETS.bullWatermark : ASSETS.bearWatermark})`,
                      }}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900">{call.contractName}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isBullish ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {call.action}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-numbers mt-1.5 text-slate-600">
                        <span>Entry: <strong>₹{call.recommendedEntry}</strong></span>
                        <span className={isBullish ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          Target: ₹{call.targetPrice}
                        </span>
                        <span className="text-rose-600">SL: ₹{call.stopLoss}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl mb-4 border border-dashed border-slate-200 bg-slate-50 text-center">
          <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">
            Awaiting Price Input Data
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Fill in the market price inputs on the left or click a pre-configured scenario, then click Run AI Prediction.
          </p>
        </div>
      )}

      {/* Summary Box */}
      <div className="mb-4 flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            AI Prediction Summary & Signal Breakdown
          </label>
          {statusText && (
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
        <textarea
          readOnly
          rows={3}
          value={statusText || 'Model ready. Click Run AI Prediction below.'}
          className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono resize-none focus:outline-none"
        />
      </div>

      {/* Primary Action Button in Emerald Green */}
      <button
        type="button"
        onClick={onExecute}
        disabled={isExecuting}
        className="w-full py-3.5 px-6 rounded-lg text-white font-extrabold text-sm tracking-wider uppercase transition-all duration-150 shadow-sm bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isExecuting ? (
          <>
            <span className="animate-spin text-base">⟳</span>
            Analyzing Market Vectors...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 fill-current" />
            Run AI Stock Prediction
          </>
        )}
      </button>
    </div>
  );
};
