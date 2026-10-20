import React, { useState, useMemo } from 'react';
import { TargetIndex, MarketMetrics } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Clock, BarChart2, Activity } from 'lucide-react';

interface StockIndexChartProps {
  targetIndex: TargetIndex;
  currentMetrics: MarketMetrics;
  onSelectIndex?: (index: TargetIndex) => void;
}

type Timeframe = '1D' | '1W' | '1M';

interface ChartPoint {
  time: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  rsi: number;
}

// Compute RSI series from prices
function calculateRsiSeries(prices: number[], period = 14): number[] {
  if (prices.length === 0) return [];
  const rsiValues: number[] = [];

  let gains = 0;
  let losses = 0;

  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) {
      gains += diff;
    } else {
      losses += Math.abs(diff);
    }

    if (i >= period) {
      const avgGain = gains / period;
      const avgLoss = losses / period;
      if (avgLoss === 0) {
        rsiValues.push(100);
      } else {
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        rsiValues.push(Math.round(rsi * 10) / 10);
      }
      // Decay window
      gains *= 0.85;
      losses *= 0.85;
    } else {
      // Seed initial RSI estimate around 50 based on trend
      const seedRsi = 50 + (diff / (prices[i] || 1)) * 300;
      rsiValues.push(Math.round(Math.min(85, Math.max(15, seedRsi)) * 10) / 10);
    }
  }

  // Prepend first element
  rsiValues.unshift(50);
  return rsiValues;
}

// Generate realistic market curve data for each Indian Index
function generateChartData(index: TargetIndex, timeframe: Timeframe, metrics: MarketMetrics): ChartPoint[] {
  const basePrice = metrics.close > 0 ? metrics.close : index === 'NIFTY 50' ? 24856 : index === 'SENSEX' ? 81642 : 58340;
  const isUp = metrics.close >= metrics.open;

  const rawPrices: number[] = [];
  const pointsPartial: Omit<ChartPoint, 'rsi'>[] = [];

  if (timeframe === '1D') {
    const times = [
      '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00',
      '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00',
      '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30'
    ];
    const open = metrics.open > 0 ? metrics.open : basePrice * 0.995;
    const high = metrics.high > 0 ? metrics.high : basePrice * 1.006;
    const low = metrics.low > 0 ? metrics.low : basePrice * 0.992;
    const close = metrics.close > 0 ? metrics.close : basePrice;

    times.forEach((t, i) => {
      const progress = i / (times.length - 1);
      let price = open + (close - open) * progress;
      if (i >= 5 && i <= 8) price = Math.min(high, price + (high - open) * 0.45);
      if (i >= 12 && i <= 15) price = Math.max(low, price - (open - low) * 0.4);
      if (i >= 19 && i <= 22) price = price + (isUp ? 22 : -20);
      if (i === times.length - 1) price = close;

      const roundedPrice = Math.round(price * 100) / 100;
      rawPrices.push(roundedPrice);
      pointsPartial.push({
        time: t,
        price: roundedPrice,
        open: Math.round((roundedPrice - 12) * 100) / 100,
        high: Math.round((roundedPrice + 18) * 100) / 100,
        low: Math.round((roundedPrice - 15) * 100) / 100,
        volume: Math.floor(180000 + Math.random() * 240000),
      });
    });
  } else if (timeframe === '1W') {
    const days = ['Mon AM', 'Mon PM', 'Tue AM', 'Tue PM', 'Wed AM', 'Wed PM', 'Thu AM', 'Thu PM', 'Fri AM', 'Fri PM'];
    days.forEach((day, i) => {
      const offset = (i - 4) * (basePrice * (isUp ? 0.0025 : -0.0025));
      const price = basePrice + offset + (Math.sin(i * 1.2) * basePrice * 0.004);
      const roundedPrice = Math.round(price * 100) / 100;
      rawPrices.push(roundedPrice);
      pointsPartial.push({
        time: day,
        price: roundedPrice,
        open: Math.round((roundedPrice - 25) * 100) / 100,
        high: Math.round((roundedPrice + 45) * 100) / 100,
        low: Math.round((roundedPrice - 35) * 100) / 100,
        volume: Math.floor(1200000 + Math.random() * 600000),
      });
    });
  } else {
    // 1M
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'];
    weeks.forEach((w, i) => {
      const factor = (i - 2) * (basePrice * (isUp ? 0.008 : -0.006));
      const price = basePrice + factor + (Math.cos(i) * basePrice * 0.005);
      const roundedPrice = Math.round(price * 100) / 100;
      rawPrices.push(roundedPrice);
      pointsPartial.push({
        time: w,
        price: roundedPrice,
        open: Math.round((roundedPrice - 80) * 100) / 100,
        high: Math.round((roundedPrice + 120) * 100) / 100,
        low: Math.round((roundedPrice - 90) * 100) / 100,
        volume: Math.floor(4500000 + Math.random() * 1500000),
      });
    });
  }

  const rsiArray = calculateRsiSeries(rawPrices);
  return pointsPartial.map((pt, idx) => ({
    ...pt,
    rsi: rsiArray[idx] ?? 50,
  }));
}

export const StockIndexChart: React.FC<StockIndexChartProps> = ({
  targetIndex,
  currentMetrics,
  onSelectIndex,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [showRsi, setShowRsi] = useState<boolean>(true);

  const chartData = useMemo(() => {
    return generateChartData(targetIndex, timeframe, currentMetrics);
  }, [targetIndex, timeframe, currentMetrics]);

  const currentPrice = currentMetrics.close > 0 ? currentMetrics.close : chartData[chartData.length - 1]?.price || 0;
  const openPrice = currentMetrics.open > 0 ? currentMetrics.open : chartData[0]?.price || currentPrice;
  const change = currentPrice - openPrice;
  const changePercent = openPrice > 0 ? (change / openPrice) * 100 : 0;
  const isPositive = change >= 0;

  const currentRsi = chartData[chartData.length - 1]?.rsi || 54.2;
  const isOverbought = currentRsi >= 70;
  const isOversold = currentRsi <= 30;

  // Domain min/max
  const prices = chartData.map((d) => d.price);
  const minPrice = Math.min(...prices) * 0.998;
  const maxPrice = Math.max(...prices) * 1.002;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-600" />
              {targetIndex} Live Market Chart
            </h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {isPositive ? 'Bullish Trend' : 'Bearish Trend'}
            </span>

            {/* RSI Badge */}
            <span
              className={`text-xs font-numbers font-bold px-2.5 py-0.5 rounded-full border ${
                isOverbought
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : isOversold
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              RSI (14): {currentRsi}{' '}
              {isOverbought ? '· Overbought (>70)' : isOversold ? '· Oversold (<30)' : '· Neutral'}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-numbers tracking-tight">
              ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div
              className={`flex items-center gap-1 text-sm font-bold font-numbers ${
                isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{change >= 0 ? '+' : ''}₹{change.toFixed(2)} ({changePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>

        {/* Index Quick Buttons & Timeframe Switcher */}
        <div className="flex flex-col items-start sm:items-end gap-2">
          {onSelectIndex && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-bold">
              {(['NIFTY 50', 'SENSEX', 'BANKEX'] as TargetIndex[]).map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectIndex(idx)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    targetIndex === idx
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {idx}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowRsi(!showRsi)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                showRsi
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              {showRsi ? 'Hide RSI (14)' : 'Show RSI (14)'}
            </button>

            <div className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold">
              {(['1D', '1W', '1M'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    timeframe === tf
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Price Area Chart */}
      <div className="h-56 sm:h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#059669' : '#DC2626'} stopOpacity={0.25} />
                <stop offset="95%" stopColor={isPositive ? '#059669' : '#DC2626'} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${Math.round(v).toLocaleString('en-IN')}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartPoint;
                  return (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg text-xs">
                      <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {data.time}
                      </div>
                      <div className="text-slate-900 font-extrabold text-sm font-numbers">
                        ₹{data.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between gap-3 text-[11px] text-slate-500 font-numbers">
                        <span>RSI: {data.rsi}</span>
                        <span>Vol: {data.volume.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? '#059669' : '#DC2626'}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* RSI Sub-Chart with Overbought 70 & Oversold 30 Reference Lines */}
      {showRsi && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-slate-600">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              Relative Strength Index (RSI 14) Oscillator
            </span>
            <span className="font-numbers text-slate-900">
              Current: <strong className="text-emerald-700">{currentRsi}</strong> · Overbought: 70 · Oversold: 30
            </span>
          </div>
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" vertical={false} />
                <YAxis
                  domain={[0, 100]}
                  ticks={[30, 50, 70]}
                  stroke="#94A3B8"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                />
                <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" label={{ value: '70 (Overbought)', fill: '#EF4444', fontSize: 9, position: 'insideTopRight' }} />
                <ReferenceLine y={30} stroke="#10B981" strokeDasharray="3 3" label={{ value: '30 (Oversold)', fill: '#10B981', fontSize: 9, position: 'insideBottomRight' }} />
                <Line
                  type="monotone"
                  dataKey="rsi"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Market Stats Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-slate-400 text-[11px] block">Day High</span>
          <span className="font-bold text-slate-900 font-numbers text-sm">
            ₹{(currentMetrics.high || maxPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-slate-400 text-[11px] block">Day Low</span>
          <span className="font-bold text-slate-900 font-numbers text-sm">
            ₹{(currentMetrics.low || minPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-slate-400 text-[11px] block">Trading Volume</span>
          <span className="font-bold text-slate-900 font-numbers text-sm">
            {(currentMetrics.volume || 4800000).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-slate-400 text-[11px] block">RSI Momentum State</span>
          <span
            className={`font-bold font-numbers text-sm ${
              isOverbought ? 'text-rose-700' : isOversold ? 'text-emerald-700' : 'text-blue-700'
            }`}
          >
            {isOverbought ? 'Overbought (Caution)' : isOversold ? 'Oversold (Dip Buy)' : 'Neutral Bullish'}
          </span>
        </div>
      </div>
    </div>
  );
};
