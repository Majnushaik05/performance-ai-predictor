import React, { useState } from 'react';
import { TOP_EQUITY_STOCKS } from '../data/marketData';
import { Search, TrendingUp, TrendingDown, Star, CheckCircle2, Award, Filter } from 'lucide-react';

export const EquityStocksDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [watchlist, setWatchlist] = useState<string[]>(['RELIANCE', 'HDFCBANK']);

  const sectors = ['All', 'Banking & Financials', 'Information Tech', 'Energy & Retail', 'Automobile', 'Infrastructure & Capital Goods'];

  const filteredStocks = TOP_EQUITY_STOCKS.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'All' || stock.sector.includes(selectedSector);
    return matchesSearch && matchesSector;
  });

  const toggleWatchlist = (sym: string) => {
    setWatchlist((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Top Equity Stocks to Invest (AI Curated)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional investment picks with 1-Year targets, valuation metrics, and growth catalysts.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search symbol (e.g. TCS)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
          />
        </div>
      </div>

      {/* Sector Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
        <span className="text-slate-400 uppercase tracking-wider text-[10px] pr-2 flex items-center gap-1">
          <Filter className="w-3 h-3 text-emerald-600" />
          Sectors:
        </span>
        {sectors.map((sec) => (
          <button
            key={sec}
            type="button"
            onClick={() => setSelectedSector(sec)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              selectedSector === sec
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Stocks Table Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-4">Watch</th>
                <th className="py-3 px-4">Stock & Company</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right">LTP (₹)</th>
                <th className="py-3 px-4 text-right">Day Chg</th>
                <th className="py-3 px-4 text-right">1-Yr Target</th>
                <th className="py-3 px-4 text-right">Upside Potential</th>
                <th className="py-3 px-4">P/E Ratio</th>
                <th className="py-3 px-4">AI Rating</th>
                <th className="py-3 px-4">Core Catalyst</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-numbers">
              {filteredStocks.map((stock) => {
                const isWatch = watchlist.includes(stock.symbol);
                const isPositive = stock.change >= 0;
                return (
                  <tr key={stock.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => toggleWatchlist(stock.symbol)}
                        className="cursor-pointer text-slate-300 hover:text-amber-500 transition-colors"
                      >
                        <Star className={`w-4 h-4 ${isWatch ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">{stock.symbol}</div>
                      <div className="text-[11px] text-slate-500 font-sans">{stock.companyName}</div>
                    </td>

                    <td className="py-3 px-4 font-sans text-slate-600 text-xs">{stock.sector}</td>

                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 text-sm">
                      ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-bold inline-flex items-center gap-0.5 ${
                          isPositive ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{stock.target1Y.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        +{stock.upsidePercent}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-semibold">{stock.peRatio}x</td>

                    <td className="py-3 px-4 font-sans">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {stock.rating}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-sans text-slate-600 text-[11px] max-w-xs truncate">
                      {stock.highlights[0]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
