import React, { useState, useMemo } from 'react';
import { HeatmapStockItem, HeatmapSector, TerminalDashboard } from '../types';
import { HEATMAP_STOCKS_DATA } from '../data/marketData';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  X,
  Zap,
  Shield,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';

interface MarketHeatmapProps {
  onNavigateDashboard?: (dashboard: TerminalDashboard) => void;
  className?: string;
  isCompact?: boolean;
}

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({
  onNavigateDashboard,
  className = '',
  isCompact = false,
}) => {
  const [selectedSector, setSelectedSector] = useState<HeatmapSector>('All Sectors');
  const [sentimentFilter, setSentimentFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'change' | 'marketCap' | 'rsi'>('change');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [viewMode, setViewMode] = useState<'treemap' | 'grid'>('treemap');
  const [selectedStock, setSelectedStock] = useState<HeatmapStockItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sectorsList: HeatmapSector[] = [
    'All Sectors',
    'Banking & Finance',
    'Information Tech',
    'Energy & Oil',
    'Automobile & EV',
    'FMCG & Consumption',
    'Pharma & Healthcare',
    'Metals & Mining',
    'Infrastructure',
  ];

  // Refresh animation simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Color Intensity helper
  const getColorClasses = (changePercent: number) => {
    if (changePercent >= 2.5) {
      return {
        bg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
        border: 'border-emerald-600',
        badge: 'bg-emerald-900/50 text-emerald-100',
        glow: 'shadow-emerald-500/20',
        label: 'Strong Bullish (>= +2.5%)',
      };
    } else if (changePercent >= 1.5) {
      return {
        bg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        border: 'border-emerald-500',
        badge: 'bg-emerald-800/50 text-emerald-100',
        glow: 'shadow-emerald-500/15',
        label: 'Bullish (+1.5% to +2.5%)',
      };
    } else if (changePercent >= 0.5) {
      return {
        bg: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        border: 'border-emerald-400',
        badge: 'bg-emerald-700/50 text-emerald-50',
        glow: 'shadow-emerald-500/10',
        label: 'Moderate Bullish (+0.5% to +1.5%)',
      };
    } else if (changePercent > 0) {
      return {
        bg: 'bg-emerald-400/90 hover:bg-emerald-500 text-white',
        border: 'border-emerald-300',
        badge: 'bg-emerald-600/50 text-white',
        glow: 'shadow-emerald-500/5',
        label: 'Mild Bullish (0% to +0.5%)',
      };
    } else if (changePercent === 0) {
      return {
        bg: 'bg-slate-500 hover:bg-slate-600 text-white',
        border: 'border-slate-400',
        badge: 'bg-slate-700 text-slate-100',
        glow: 'shadow-slate-500/10',
        label: 'Neutral (0.0%)',
      };
    } else if (changePercent >= -1.0) {
      return {
        bg: 'bg-rose-400/90 hover:bg-rose-500 text-white',
        border: 'border-rose-300',
        badge: 'bg-rose-600/50 text-white',
        glow: 'shadow-rose-500/5',
        label: 'Mild Bearish (-0.01% to -1.0%)',
      };
    } else if (changePercent >= -2.0) {
      return {
        bg: 'bg-rose-600 hover:bg-rose-700 text-white',
        border: 'border-rose-500',
        badge: 'bg-rose-800/50 text-rose-100',
        glow: 'shadow-rose-500/15',
        label: 'Bearish (-1.0% to -2.0%)',
      };
    } else {
      return {
        bg: 'bg-rose-800 hover:bg-rose-900 text-white',
        border: 'border-rose-700',
        badge: 'bg-rose-950/60 text-rose-100',
        glow: 'shadow-rose-500/25',
        label: 'Deep Bearish (<= -2.0%)',
      };
    }
  };

  // Filtered & Sorted Stocks
  const filteredStocks = useMemo(() => {
    return HEATMAP_STOCKS_DATA.filter((s) => {
      // Sector filter
      if (selectedSector !== 'All Sectors' && s.sector !== selectedSector) {
        return false;
      }
      // Sentiment filter
      if (sentimentFilter === 'BULLISH' && s.changePercent <= 0) return false;
      if (sentimentFilter === 'BEARISH' && s.changePercent >= 0) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchSymbol = s.symbol.toLowerCase().includes(query);
        const matchName = s.companyName.toLowerCase().includes(query);
        const matchSector = s.sector.toLowerCase().includes(query);
        return matchSymbol || matchName || matchSector;
      }

      return true;
    }).sort((a, b) => {
      let diff = 0;
      if (sortBy === 'change') {
        diff = a.changePercent - b.changePercent;
      } else if (sortBy === 'marketCap') {
        diff = a.marketCapCr - b.marketCapCr;
      } else if (sortBy === 'rsi') {
        diff = a.rsi - b.rsi;
      }
      return sortOrder === 'desc' ? -diff : diff;
    });
  }, [selectedSector, sentimentFilter, searchQuery, sortBy, sortOrder]);

  // Overall Market Health Statistics
  const stats = useMemo(() => {
    const total = HEATMAP_STOCKS_DATA.length;
    const advances = HEATMAP_STOCKS_DATA.filter((s) => s.changePercent > 0).length;
    const declines = HEATMAP_STOCKS_DATA.filter((s) => s.changePercent < 0).length;
    const neutral = total - advances - declines;
    const avgChange = (
      HEATMAP_STOCKS_DATA.reduce((acc, curr) => acc + curr.changePercent, 0) / total
    ).toFixed(2);

    const sortedByChange = [...HEATMAP_STOCKS_DATA].sort(
      (a, b) => b.changePercent - a.changePercent
    );
    const topGainer = sortedByChange[0];
    const topLoser = sortedByChange[sortedByChange.length - 1];

    const advanceRatio = ((advances / total) * 100).toFixed(0);

    return {
      total,
      advances,
      declines,
      neutral,
      avgChange: Number(avgChange),
      topGainer,
      topLoser,
      advanceRatio: Number(advanceRatio),
    };
  }, []);

  // Group stocks by sector for Treemap view
  const sectorGroups = useMemo(() => {
    const groups: { [key: string]: HeatmapStockItem[] } = {};
    filteredStocks.forEach((stock) => {
      if (!groups[stock.sector]) {
        groups[stock.sector] = [];
      }
      groups[stock.sector].push(stock);
    });
    return groups;
  }, [filteredStocks]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Bird's-Eye View Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
                Market Heatmap & Health Radar
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live Velocity
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-medium">
              Bird&apos;s-eye visualization of real-time price intensity, sector momentum, and market
              breadth across top liquid Indian equity constituents.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleRefresh}
              className={`p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 transition-all cursor-pointer bg-white ${
                isRefreshing ? 'animate-spin text-emerald-600' : ''
              }`}
              title="Refresh Heatmap Feed"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setViewMode('treemap')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  viewMode === 'treemap'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 inline mr-1" />
                Sector Groups
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1" />
                Matrix Grid
              </button>
            </div>
          </div>
        </div>

        {/* 2. Market Breadth Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-5">
          {/* Breadth Ratio */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>Market Breadth</span>
              <span className="text-emerald-600 font-bold">{stats.advanceRatio}% Bullish</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-base sm:text-lg font-black text-emerald-600">
                {stats.advances} Adv
              </span>
              <span className="text-xs text-slate-400 font-bold">/</span>
              <span className="text-base sm:text-lg font-black text-rose-600">
                {stats.declines} Dec
              </span>
            </div>
            {/* Visual ratio bar */}
            <div className="w-full bg-rose-200 h-1.5 rounded-full overflow-hidden mt-2 flex">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${stats.advanceRatio}%` }}
              ></div>
            </div>
          </div>

          {/* Average Market Move */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500">Average Move</div>
            <div className="flex items-center gap-1.5 mt-1">
              {stats.avgChange >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-rose-600" />
              )}
              <span
                className={`text-base sm:text-lg font-black ${
                  stats.avgChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {stats.avgChange >= 0 ? `+${stats.avgChange}%` : `${stats.avgChange}%`}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-medium">
              Net positive momentum across constituents
            </div>
          </div>

          {/* Top Gainer */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              Top Outperformer
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm sm:text-base font-black text-slate-900">
                {stats.topGainer.symbol}
              </span>
              <span className="text-sm font-black text-emerald-600">
                +{stats.topGainer.changePercent}%
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">
              ₹{stats.topGainer.price.toLocaleString('en-IN')} • {stats.topGainer.sector}
            </div>
          </div>

          {/* Top Loser */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
              Top Underperformer
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm sm:text-base font-black text-slate-900">
                {stats.topLoser.symbol}
              </span>
              <span className="text-sm font-black text-rose-600">
                {stats.topLoser.changePercent}%
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">
              ₹{stats.topLoser.price.toLocaleString('en-IN')} • {stats.topLoser.sector}
            </div>
          </div>
        </div>

        {/* 3. Heatmap Color-Coded Intensity Legend */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Intensity Scale:</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-wrap text-[10px] font-bold">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-700 text-white">
              ≥ +2.5%
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white">
              +1.5% to +2.5%
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500 text-white">
              +0.5% to +1.5%
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-400/90 text-white">
              &gt;0%
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-500 text-white">
              0.0%
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-400/90 text-white">
              &lt;0%
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600 text-white">
              -1.0% to -2.0%
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-800 text-white">
              ≤ -2.0%
            </span>
          </div>
        </div>
      </div>

      {/* 4. Filter & Search Controls Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Symbol (e.g. RELIANCE, TCS, SBIN) or Sector..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sentiment Filter buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setSentimentFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                sentimentFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({HEATMAP_STOCKS_DATA.length})
            </button>
            <button
              type="button"
              onClick={() => setSentimentFilter('BULLISH')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                sentimentFilter === 'BULLISH'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              Bullish ({stats.advances})
            </button>
            <button
              type="button"
              onClick={() => setSentimentFilter('BEARISH')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                sentimentFilter === 'BEARISH'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              Bearish ({stats.declines})
            </button>
          </div>

          {/* Sorting dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-semibold whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="change">% Change</option>
              <option value="marketCap">Market Cap</option>
              <option value="rsi">RSI Index</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 font-bold"
              title="Toggle Sort Order"
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        {/* Sector Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {sectorsList.map((sector) => {
            const isSelected = selectedSector === sector;
            const count =
              sector === 'All Sectors'
                ? HEATMAP_STOCKS_DATA.length
                : HEATMAP_STOCKS_DATA.filter((s) => s.sector === sector).length;

            return (
              <button
                key={sector}
                type="button"
                onClick={() => setSelectedSector(sector)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <span>{sector}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-slate-700 text-slate-200' : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Main Heatmap Presentation */}
      {viewMode === 'treemap' ? (
        /* Treemap by Sector Clusters */
        <div className="space-y-6">
          {Object.entries(sectorGroups).map(([sectorName, stocks]) => {
            const sectorAvg = (
              stocks.reduce((acc, curr) => acc + curr.changePercent, 0) / stocks.length
            ).toFixed(2);
            const isPositive = Number(sectorAvg) >= 0;

            return (
              <div
                key={sectorName}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3"
              >
                {/* Sector Header with momentum status */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                      {sectorName}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      ({stocks.length} constituents)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold">Sector Avg:</span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded ${
                        isPositive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isPositive ? `+${sectorAvg}%` : `${sectorAvg}%`}
                    </span>
                  </div>
                </div>

                {/* Grid of stock tiles within sector */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {stocks.map((stock) => {
                    const color = getColorClasses(stock.changePercent);
                    return (
                      <button
                        key={stock.id}
                        type="button"
                        onClick={() => setSelectedStock(stock)}
                        className={`group relative p-3 rounded-xl transition-all text-left border ${color.bg} ${color.border} shadow-2xs hover:shadow-md cursor-pointer hover:scale-[1.02] transform duration-150 flex flex-col justify-between min-h-[90px]`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xs sm:text-sm font-black tracking-tight leading-none text-white">
                            {stock.symbol}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color.badge}`}
                          >
                            RSI {stock.rsi.toFixed(0)}
                          </span>
                        </div>

                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-xs font-semibold text-white/90">
                            ₹{stock.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center">
                            {stock.changePercent > 0 ? '+' : ''}
                            {stock.changePercent}%
                          </span>
                        </div>

                        <div className="text-[9px] text-white/75 truncate mt-1">
                          Vol {stock.volume}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense Matrix Grid View */
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredStocks.map((stock) => {
              const color = getColorClasses(stock.changePercent);
              return (
                <button
                  key={stock.id}
                  type="button"
                  onClick={() => setSelectedStock(stock)}
                  className={`group relative p-3 rounded-xl transition-all text-left border ${color.bg} ${color.border} shadow-2xs hover:shadow-md cursor-pointer hover:scale-[1.02] transform duration-150 flex flex-col justify-between min-h-[95px]`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs sm:text-sm font-black tracking-tight text-white leading-none">
                        {stock.symbol}
                      </div>
                      <div className="text-[9px] text-white/70 truncate max-w-[85px] mt-0.5 font-medium">
                        {stock.sector}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${color.badge}`}
                    >
                      {stock.rsi.toFixed(0)} RSI
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between pt-1 border-t border-white/20">
                    <span className="text-xs font-bold text-white">
                      ₹{stock.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-white">
                      {stock.changePercent > 0 ? '+' : ''}
                      {stock.changePercent}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Selected Stock Detail Modal */}
      {selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900">{selectedStock.symbol}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-black ${
                      selectedStock.changePercent >= 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedStock.changePercent >= 0 ? '+' : ''}
                    {selectedStock.changePercent}%
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {selectedStock.sector}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  {selectedStock.companyName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStock(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price & Day Range */}
            <div className="py-4 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    Current Market Price
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    ₹{selectedStock.price.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    Session Velocity
                  </div>
                  <div
                    className={`text-lg font-black ${
                      selectedStock.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {selectedStock.change >= 0 ? `+₹${selectedStock.change}` : `₹${selectedStock.change}`}
                  </div>
                </div>
              </div>

              {/* Day High / Low bar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Day Low: ₹{selectedStock.dayLow}</span>
                  <span>Day High: ₹{selectedStock.dayHigh}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
                  {(() => {
                    const range = selectedStock.dayHigh - selectedStock.dayLow || 1;
                    const pct = Math.min(
                      100,
                      Math.max(0, ((selectedStock.price - selectedStock.dayLow) / range) * 100)
                    );
                    return (
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    );
                  })()}
                </div>
              </div>

              {/* Technical & Fundamentals Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">RSI (14)</div>
                  <div
                    className={`text-sm font-black mt-0.5 ${
                      selectedStock.rsi >= 70
                        ? 'text-amber-600'
                        : selectedStock.rsi <= 35
                        ? 'text-rose-600'
                        : 'text-slate-800'
                    }`}
                  >
                    {selectedStock.rsi.toFixed(1)}
                  </div>
                  <div className="text-[9px] text-slate-400">
                    {selectedStock.rsi >= 70
                      ? 'Overbought'
                      : selectedStock.rsi <= 35
                      ? 'Oversold'
                      : 'Neutral'}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Market Cap</div>
                  <div className="text-sm font-black text-slate-800 mt-0.5">
                    ₹{(selectedStock.marketCapCr / 100000).toFixed(1)}L Cr
                  </div>
                  <div className="text-[9px] text-slate-400">Large Cap</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Volume (24h)</div>
                  <div className="text-sm font-black text-slate-800 mt-0.5">
                    {selectedStock.volume}
                  </div>
                  <div className="text-[9px] text-slate-400">High Liquidity</div>
                </div>
              </div>

              {/* AI Strategy Suggestion */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 font-medium leading-relaxed">
                  <span className="font-bold text-emerald-900">AI Momentum Outlook:</span>{' '}
                  {selectedStock.changePercent > 0
                    ? `Sustained intraday accumulation above 20 EMA. Recommended to look for strike retests on Option Calls.`
                    : `Bearish intraday exhaustion near resistance. Put options or protective hedges advised on breakdown.`}
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedStock(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>

              {onNavigateDashboard && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStock(null);
                    onNavigateDashboard('fno_calls');
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Take Call on {selectedStock.symbol}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
