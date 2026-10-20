import React from 'react';
import { MarketTickerItem } from '../types';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketTrendTickerProps {
  onSelectSymbol?: (symbol: string) => void;
}

const DEFAULT_TICKERS: MarketTickerItem[] = [
  { symbol: 'NIFTY 50', price: 24856.2, change: 158.4, changePercent: 0.64, volume: '4.8M', isBullish: true },
  { symbol: 'SENSEX', price: 81642.1, change: 472.3, changePercent: 0.58, volume: '7.2M', isBullish: true },
  { symbol: 'BANKEX', price: 58340.85, change: -128.5, changePercent: -0.22, volume: '3.6M', isBullish: false },
  { symbol: 'INDIA VIX', price: 12.45, change: -0.42, changePercent: -3.26, volume: 'Index', isBullish: true },
  { symbol: 'NIFTY IT', price: 38210.0, change: 422.0, changePercent: 1.12, volume: '2.1M', isBullish: true },
  { symbol: 'NIFTY AUTO', price: 25480.3, change: 185.6, changePercent: 0.73, volume: '1.9M', isBullish: true },
];

export const MarketTrendTicker: React.FC<MarketTrendTickerProps> = ({ onSelectSymbol }) => {
  return (
    <div className="w-full bg-slate-50 border-y border-slate-200 overflow-x-auto no-scrollbar py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 min-w-max text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold shrink-0 pr-3 border-r border-slate-200">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span className="uppercase text-[11px] tracking-wider text-slate-900 font-bold">
            Live Market Trends
          </span>
        </div>

        <div className="flex items-center gap-6 divide-x divide-slate-200">
          {DEFAULT_TICKERS.map((ticker) => {
            const isPositive = ticker.change >= 0;
            return (
              <button
                key={ticker.symbol}
                type="button"
                onClick={() => onSelectSymbol?.(ticker.symbol)}
                className="pl-6 first:pl-0 flex items-center gap-3 hover:opacity-75 transition-opacity cursor-pointer group text-left"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                    {ticker.symbol}
                    {isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Vol: {ticker.volume}
                  </div>
                </div>

                <div className="text-right font-mono tabular-nums">
                  <div className="text-slate-900 font-semibold">
                    ₹{ticker.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div
                    className={`text-[11px] font-bold flex items-center justify-end gap-0.5 ${
                      isPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    <span>{isPositive ? '+' : ''}{ticker.changePercent.toFixed(2)}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
